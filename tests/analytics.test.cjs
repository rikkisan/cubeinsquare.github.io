// Run with: node --test tests/analytics.test.cjs
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync, existsSync, readdirSync} = require('node:fs');
const {join} = require('node:path');
const vm = require('node:vm');
const root = join(__dirname, '..');
const locales = ['', 'ru', 'fr', 'de'];
const read = (...parts) => readFileSync(join(root, ...parts), 'utf8');
const trackingSource = read('assets/tracking.js');

// Same definition of "live tool" as tests/homepage-tool-count.test.cjs: a static card in
// tools/index.html, or an entry in the tool registry of assets/site.js.
function liveToolSlugs() {
    const paths = new Set();
    for (const match of read('tools/index.html').matchAll(/class="resource-link" href="(\/[^"]+\/)"/g)) paths.add(match[1]);
    for (const match of read('assets/site.js').matchAll(/"path":\s*"(\/[^"]+\/)"/g)) paths.add(match[1]);
    return [...paths].map((path) => path.replace(/\//g, ''));
}

const camel = (name) => name.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());

// Just enough of the DOM for the consent banner and the footer: the selectors tracking.js uses
// there, plus elements that markup set through innerHTML declares (handed out on first ask).
function matches(element, selector) {
    if (selector === '.site-footer') return element.className === 'site-footer';
    let match = selector.match(/^\[data-([a-z-]+)="true"\]$/);
    if (match) return element.dataset[camel(match[1])] === 'true';
    match = selector.match(/^a\[href\$="([^"]+)"\]$/);
    if (match) return element.tagName === 'a' && String(element.href || '').endsWith(match[1]);
    return false;
}

function findIn(root, selector, create) {
    for (const child of root.children) {
        if (matches(child, selector)) return child;
        const deeper = findIn(child, selector, create);
        if (deeper) return deeper;
    }
    const match = selector.match(/^\[data-([a-z-]+)="true"\]$/);
    if (match && root.innerHTML && root.innerHTML.includes(`data-${match[1]}="true"`)) {
        const child = create('button');
        child.dataset[camel(match[1])] = 'true';
        root.appendChild(child);
        return child;
    }
    return null;
}

/**
 * Runs the real assets/tracking.js against a stub browser. document.readyState is 'loading',
 * so init() only runs when a test calls domReady(). adsense puts the AdSense tag on the page,
 * footer adds the site footer, before(window) runs ahead of the script (a CMP that loaded
 * first, the <head> block). Timers only fire through runTimers().
 */
function load({url = 'https://cubeinsquare.com/recipe-generator/', config, session = new Map(), local, lang = 'en', dataset = {}, idle = (fn) => fn(), adsense = false, footer = false, before} = {}) {
    const address = new URL(url);
    const store = (map) => ({
        getItem: (key) => (map.has(key) ? map.get(key) : null),
        setItem: (key, value) => { map.set(key, String(value)); },
        removeItem: (key) => { map.delete(key); }
    });
    const localMap = local || new Map([['cube_cookie_consent', 'accepted']]);
    const listeners = {};
    const logs = [];
    const timers = [];
    let document;
    const createElement = (tagName) => {
        const element = {
            tagName, dataset: {}, children: [], parent: null, listeners: {}, className: '', innerHTML: '', textContent: '',
            appendChild(child) {
                if (child.remove) child.remove();
                child.parent = element;
                element.children.push(child);
                return child;
            },
            replaceWith(other) {
                const siblings = element.parent.children;
                siblings[siblings.indexOf(element)] = other;
                other.parent = element.parent;
                element.parent = null;
            },
            remove() {
                if (!element.parent) return;
                element.parent.children = element.parent.children.filter((child) => child !== element);
                element.parent = null;
            },
            addEventListener(type, handler) { (element.listeners[type] = element.listeners[type] || []).push(handler); },
            click() { (element.listeners.click || []).forEach((handler) => handler({type: 'click'})); },
            focus() { document.activeElement = element; },
            querySelector: (selector) => findIn(element, selector, createElement)
        };
        return element;
    };
    const body = createElement('body');
    if (footer) {
        const node = body.appendChild(createElement('footer'));
        node.className = 'site-footer';
        node.appendChild(createElement('span')).textContent = 'Cube in Square';
        node.appendChild(createElement('a')).href = `${address.pathname.match(/^\/(ru|fr|de)\//) ? address.pathname.slice(0, 3) : ''}/privacy-policy/`;
    }
    const window = {
        location: {
            href: address.href,
            origin: address.origin,
            protocol: address.protocol,
            hostname: address.hostname,
            pathname: address.pathname,
            search: address.search
        },
        localStorage: store(localMap),
        sessionStorage: store(session),
        console: {info: (...args) => logs.push(args)},
        requestIdleCallback: idle,
        setTimeout: (fn) => timers.push({fn, cleared: false, done: false}),
        clearTimeout: (id) => { if (timers[id - 1]) timers[id - 1].cleared = true; },
        matchMedia: () => ({matches: false}),
        addEventListener() {},
        CUBE_ANALYTICS_CONFIG: config
    };
    document = {
        readyState: 'loading',
        title: 'Test page',
        documentElement: {lang, dataset},
        head: {appendChild() {}},
        body,
        activeElement: null,
        createElement,
        querySelector: (selector) => (selector.includes('adsbygoogle.js') ? (adsense ? {} : null) : findIn(body, selector, createElement)),
        querySelectorAll: () => [],
        addEventListener(type, handler) { (listeners[type] = listeners[type] || []).push(handler); }
    };
    if (before) before(window);
    const context = vm.createContext({window, document, URL, URLSearchParams, Date, JSON});
    vm.runInContext(trackingSource, context);

    const events = () => (window.dataLayer || [])
        .filter((entry) => entry[0] === 'event')
        .map((entry) => ({name: entry[1], params: entry[2]}));
    const fire = (type, event) => (listeners[type] || []).forEach((handler) => handler(event));
    return {
        analytics: window.CubeAnalytics,
        config: window.CUBE_ANALYTICS_CONFIG,
        session, local: localMap, logs, events, fire, window, document,
        gtagCommands: () => Array.from(window.dataLayer || [], (entry) => entry[0]),
        // gtag('consent', ...) calls as [command, state].
        consent: () => Array.from(window.dataLayer || []).filter((entry) => entry[0] === 'consent').map((entry) => [entry[1], {...entry[2]}]),
        find: (selector) => document.querySelector(selector),
        runTimers: () => timers.forEach((timer) => {
            if (timer.cleared || timer.done) return;
            timer.done = true;
            timer.fn();
        }),
        domReady: () => fire('DOMContentLoaded')
    };
}

const live = (extra = {}) => ({config: {ga4MeasurementId: 'G-LIVE000000'}, ...extra});

// A link as far as tracking.js looks at it. areas lists the selectors it sits under.
function linkTo(href, {areas = [], target, download} = {}) {
    const link = {
        getAttribute: (name) => (name === 'href' ? href : name === 'target' ? (target || null) : null),
        hasAttribute: (name) => (name === 'download' ? Boolean(download) : name === 'href'),
        closest(selector) {
            if (selector === 'a[href]') return link;
            const wanted = selector.split(',').map((part) => part.trim());
            return areas.some((area) => wanted.includes(area)) ? {} : null;
        }
    };
    return link;
}
const click = (link, extra = {}) => ({type: 'click', button: 0, target: link, defaultPrevented: false, ...extra});

test('paths are classified into tools, guides, articles and sections', () => {
    const {analytics} = load();
    const expected = {
        '/': ['home', 'home', 'home'],
        '/ru/': ['home', 'home', 'home'],
        '/recipe-generator/': ['tool', 'tool', 'tool:recipe_generator'],
        '/ru/recipe-generator/': ['tool', 'tool', 'tool:recipe_generator'],
        '/de/loot-table-generator/index.html': ['tool', 'tool', 'tool:loot_table_generator'],
        '/wiki-recipe-generator/': ['guide', 'wiki', 'guide:recipe_generator'],
        '/fr/wiki-recipe-generator/': ['guide', 'wiki', 'guide:recipe_generator'],
        '/wiki-minecraft-bossbar-events/': ['article', 'wiki', 'article:minecraft_bossbar_events'],
        '/wiki-custom-item-id-naming/': ['article', 'wiki', 'article:custom_item_id_naming'],
        '/wiki/': ['hub', 'wiki', 'hub:wiki'],
        '/ru/tools/': ['hub', 'tools', 'hub:tools'],
        '/about/': ['page', 'about', 'page:about'],
        '/privacy-policy/': ['page', 'privacy_policy', 'page:privacy_policy'],
        '/tool-coming-soon/': ['page', 'page', 'page:tool_coming_soon'],
        // The three oldest tools keep the page_type they always had, but their guides are wiki pages.
        '/resource-pack-generator/': ['tool', 'resource_pack_generator', 'tool:resource_pack_generator'],
        '/custom-potions/': ['tool', 'custom_potions', 'tool:custom_potions'],
        '/ru/custom-villager-trades/': ['tool', 'custom_villager_trades', 'tool:custom_villager_trades'],
        '/wiki-custom-potions/': ['guide', 'wiki', 'guide:custom_potions'],
        '/wiki-resource-pack-generator/': ['guide', 'wiki', 'guide:resource_pack_generator']
    };
    for (const [path, [kind, pageType, routeId]] of Object.entries(expected)) {
        const route = analytics.classifyPath(path);
        assert.deepEqual([route.kind, route.pageType, route.routeId], [kind, pageType, routeId], path);
    }
});

test('every live tool is recognised, and so is its guide', () => {
    const slugs = liveToolSlugs();
    assert(slugs.length >= 18, 'no live tools found');
    const {analytics} = load();
    for (const slug of slugs) {
        const id = slug.replace(/-/g, '_');
        for (const locale of locales) {
            const prefix = locale ? `/${locale}` : '';
            assert.equal(analytics.classifyPath(`${prefix}/${slug}/`).routeId, `tool:${id}`,
                `${slug} is not in TOOL_SLUGS in assets/tracking.js`);
            if (existsSync(join(root, `wiki-${slug}`, 'index.html'))) {
                assert.equal(analytics.classifyPath(`${prefix}/wiki-${slug}/`).routeId, `guide:${id}`, `guide of ${slug}`);
            }
        }
    }
});

test('events carry tool_id on tools, guide_for on guides and editor_mode when the node editor is mounted', () => {
    let page = load(live({url: 'https://cubeinsquare.com/ru/recipe-generator/', lang: 'ru'}));
    page.analytics.track('tool_copy', {output_kind: 'json', mc_version: '1.21.4', empty: '', missing: null});
    let event = page.events().pop();
    assert.equal(event.name, 'tool_copy');
    assert.deepEqual({...event.params}, {
        page_language: 'ru', page_type: 'tool', page_path: '/ru/recipe-generator/',
        tool_id: 'recipe_generator', output_kind: 'json', mc_version: '1.21.4'
    });

    page = load(live({url: 'https://cubeinsquare.com/wiki-recipe-generator/'}));
    page.analytics.track('x');
    event = page.events().pop();
    assert.equal(event.params.guide_for, 'recipe_generator');
    assert.equal(event.params.page_type, 'wiki');
    assert.equal(event.params.tool_id, undefined);

    page = load(live({url: 'https://cubeinsquare.com/wiki-minecraft-bossbar-events/'}));
    page.analytics.track('x');
    assert.equal(page.events().pop().params.guide_for, undefined);

    page = load(live({dataset: {editorMode: 'nodes'}}));
    page.analytics.track('tool_copy', {output_kind: 'json'});
    assert.equal(page.events().pop().params.editor_mode, 'nodes');
    page.analytics.track('x', {editor_mode: 'form'});
    assert.equal(page.events().pop().params.editor_mode, 'form', 'explicit params win');

    page = load(live());
    page.analytics.track('x');
    assert.equal('editor_mode' in page.events().pop().params, false, 'no node editor, no editor_mode');
});

test('events are sent through deferWork, never inline', () => {
    const deferred = [];
    const page = load(live({idle: (fn) => deferred.push(fn)}));
    page.analytics.track('tool_copy', {output_kind: 'json'});
    assert.equal(page.events().length, 0, 'gtag must not run inside the click handler');
    deferred.forEach((fn) => fn());
    assert.equal(page.events().length, 1);
});

test('local environments never send to GA4', () => {
    const addresses = [
        'http://localhost:8765/recipe-generator/',
        'http://127.0.0.1:8765/recipe-generator/',
        'http://[::1]:8765/recipe-generator/',
        'http://192.168.1.20:8765/recipe-generator/',
        'http://10.0.0.5/recipe-generator/',
        'http://172.20.1.1/recipe-generator/',
        'http://tools.localhost:8765/recipe-generator/',
        'file:///C:/Users/me/cfqn/recipe-generator/index.html'
    ];
    for (const url of addresses) {
        const page = load(live({url}));
        page.domReady();
        page.analytics.track('tool_copy', {output_kind: 'json'});
        assert.equal(page.config.trafficMode, 'local', url);
        assert.deepEqual(page.gtagCommands().filter((name) => name === 'event' || name === 'config' || name === 'js'), [], url);
        assert(page.logs.some((args) => args[1] === 'tool_copy'), `${url} logs the event to the console`);
    }
});

test('real hosts send to the configured property and ignore ?analytics_test', () => {
    const page = load(live({url: 'https://cubeinsquare.com/recipe-generator/?analytics_test=1'}));
    page.domReady();
    page.analytics.track('tool_copy', {output_kind: 'json'});
    assert.equal(page.config.trafficMode, 'live');
    assert.equal(page.config.ga4MeasurementId, 'G-LIVE000000');
    assert(page.events().some((event) => event.name === 'tool_copy'));
    assert.equal(page.logs.length, 0, 'live traffic is silent unless debug is on');
});

test('?analytics_test=1 on a local page sends to the fictitious property and sticks for the tab', () => {
    const session = new Map();
    let page = load(live({url: 'http://127.0.0.1:8765/recipe-generator/?analytics_test=1', session}));
    page.domReady();
    page.analytics.track('tool_copy', {output_kind: 'json'});
    assert.equal(page.config.trafficMode, 'test');
    assert.equal(page.config.ga4MeasurementId, 'G-TEST000000');
    assert.equal(page.config.googleAdsId, '');
    assert(page.events().some((event) => event.name === 'tool_copy'));

    // Next page in the same tab, no query string: still test mode.
    page = load(live({url: 'http://127.0.0.1:8765/wiki-recipe-generator/', session}));
    assert.equal(page.config.trafficMode, 'test');

    // ?analytics_test=0 switches it off again.
    page = load(live({url: 'http://127.0.0.1:8765/recipe-generator/?analytics_test=0', session}));
    assert.equal(page.config.trafficMode, 'local');
    assert.equal(session.has('cube_analytics_test'), false);

    // A fresh tab starts in local mode.
    assert.equal(load(live({url: 'http://127.0.0.1:8765/recipe-generator/'})).config.trafficMode, 'local');
});

test('a same-tab click on a tool or guide link is parked and sent by the page it lands on', () => {
    const session = new Map();
    const source = load(live({url: 'https://cubeinsquare.com/ru/recipe-generator/', lang: 'ru', session, dataset: {editorMode: 'nodes'}}));
    source.domReady();
    const before = source.events().length;
    source.fire('click', click(linkTo('/ru/wiki-recipe-generator/', {areas: ['.tool-button-row']})));
    assert.equal(source.events().length, before, 'nothing is sent from the page that is being left');
    assert(session.has('cube_pending_link_click'));

    const target = load(live({url: 'https://cubeinsquare.com/ru/wiki-recipe-generator/', lang: 'ru', session}));
    target.domReady();
    const sent = target.events().filter((event) => event.name === 'guide_link_click');
    assert.equal(sent.length, 1);
    assert.deepEqual({...sent[0].params}, {
        page_language: 'ru', page_type: 'tool', page_path: '/ru/recipe-generator/',
        tool_id: 'recipe_generator', editor_mode: 'nodes',
        link_from: 'tool:recipe_generator', link_to: 'guide:recipe_generator', click_area: 'cta'
    }, 'the event keeps the context of the page it came from');
    assert.equal(session.has('cube_pending_link_click'), false, 'sent only once');

    // Reloading or visiting another page does not send it again.
    const again = load(live({url: 'https://cubeinsquare.com/ru/wiki-recipe-generator/', lang: 'ru', session}));
    again.domReady();
    assert.equal(again.events().filter((event) => event.name === 'guide_link_click').length, 0);
});

test('a parked click is dropped when it is stale or the visitor lands somewhere else', () => {
    const session = new Map();
    const source = load(live({url: 'https://cubeinsquare.com/recipe-generator/', session}));
    source.domReady();
    source.fire('click', click(linkTo('/wiki-recipe-generator/')));

    const elsewhere = load(live({url: 'https://cubeinsquare.com/tools/', session}));
    elsewhere.domReady();
    assert.equal(elsewhere.events().filter((event) => event.name === 'guide_link_click').length, 0);

    const stale = new Map([['cube_pending_link_click', JSON.stringify({
        time: Date.now() - 120000, toPath: '/wiki-recipe-generator/',
        context: {page_path: '/recipe-generator/'}, params: {link_from: 'tool:recipe_generator', link_to: 'guide:recipe_generator', click_area: 'cta'}
    })]]);
    const late = load(live({url: 'https://cubeinsquare.com/wiki-recipe-generator/', session: stale}));
    late.domReady();
    assert.equal(late.events().filter((event) => event.name === 'guide_link_click').length, 0);
});

test('clicks that keep the page alive are sent straight away', () => {
    for (const extra of [{metaKey: true}, {ctrlKey: true}, {shiftKey: true}, {altKey: true}]) {
        const page = load(live({url: 'https://cubeinsquare.com/wiki-recipe-generator/'}));
        page.domReady();
        page.fire('click', click(linkTo('/recipe-generator/', {areas: ['.page-hero']}), extra));
        const sent = page.events().filter((event) => event.name === 'guide_link_click');
        assert.equal(sent.length, 1, JSON.stringify(extra));
        assert.deepEqual([sent[0].params.link_from, sent[0].params.link_to, sent[0].params.click_area],
            ['guide:recipe_generator', 'tool:recipe_generator', 'hero']);
        assert.equal(page.session.has('cube_pending_link_click'), false);
    }

    let page = load(live({url: 'https://cubeinsquare.com/wiki-recipe-generator/'}));
    page.domReady();
    page.fire('click', click(linkTo('/recipe-generator/', {target: '_blank'})));
    assert.equal(page.events().filter((event) => event.name === 'guide_link_click').length, 1, 'target=_blank');

    page = load(live({url: 'https://cubeinsquare.com/wiki-recipe-generator/'}));
    page.domReady();
    page.fire('auxclick', click(linkTo('/recipe-generator/'), {type: 'auxclick', button: 1}));
    assert.equal(page.events().filter((event) => event.name === 'guide_link_click').length, 1, 'middle click');
    page.fire('auxclick', click(linkTo('/recipe-generator/'), {type: 'auxclick', button: 2}));
    assert.equal(page.events().filter((event) => event.name === 'guide_link_click').length, 1, 'right click is not a visit');
});

test('click_area comes from the container of the link', () => {
    const areas = [
        [['.steam-navbar'], 'navigation'],
        [['.site-footer'], 'footer'],
        [['.resource-card'], 'card'],
        [['.resource-card', '.tool-button-row'], 'card'],
        [['.page-hero'], 'hero'],
        [['.tool-button-row'], 'cta'],
        [['.tool-secondary-column'], 'related'],
        [['.item-builder-help'], 'related'],
        [['.wiki-article'], 'article_body'],
        [[], 'other']
    ];
    for (const [containers, expected] of areas) {
        const page = load(live({url: 'https://cubeinsquare.com/tools/'}));
        page.domReady();
        page.fire('click', click(linkTo('/recipe-generator/', {areas: containers, target: '_blank'})));
        const sent = page.events().filter((event) => event.name === 'guide_link_click');
        assert.equal(sent.length, 1, containers.join(' '));
        assert.equal(sent[0].params.click_area, expected, containers.join(' '));
        assert.equal(sent[0].params.link_from, 'hub:tools');
    }
});

test('other links are not guide links', () => {
    const page = load(live({url: 'https://cubeinsquare.com/recipe-generator/'}));
    page.domReady();
    const ignored = [
        linkTo('/recipe-generator/'),                                   // the page itself
        linkTo('/ru/recipe-generator/', {areas: ['.language-switch']}), // language switch
        linkTo('/wiki-custom-item-id-naming/'),                         // article, not a tool guide
        linkTo('/tools/'),                                              // hub
        linkTo('https://example.com/recipe-generator/'),                // other site
        linkTo('/wiki-recipe-generator/', {download: true}),            // download
        linkTo('#output')                                               // in-page anchor
    ];
    ignored.forEach((link) => page.fire('click', click(link, {metaKey: true})));
    page.fire('click', click(linkTo('/wiki-recipe-generator/'), {defaultPrevented: true}));
    assert.equal(page.events().filter((event) => event.name === 'guide_link_click').length, 1,
        'only the click whose default action was prevented is sent, because it does not navigate');
    assert.equal(page.session.has('cube_pending_link_click'), false);
});

// Every page of a tool and of its guide must load the analytics scripts, in four locales.
// The bossbar family once shipped without them, and nothing noticed.
test('tool pages and guides load tracking-config.js and tracking.js', () => {
    const slugs = liveToolSlugs();
    const missing = [];
    for (const slug of slugs) {
        for (const locale of locales) {
            for (const dir of [slug, `wiki-${slug}`]) {
                const file = join(root, locale, dir, 'index.html');
                if (!existsSync(file)) continue;
                const html = readFileSync(file, 'utf8');
                const config = html.indexOf('src="/assets/tracking-config.js"');
                const tracking = html.indexOf('src="/assets/tracking.js"');
                if (config < 0 || tracking < config) missing.push(`${locale}/${dir}`);
            }
        }
    }
    assert.deepEqual(missing, []);
});

test('the bossbar family has the same AdSense tags as the other tool pages', () => {
    const missing = [];
    for (const locale of locales) {
        for (const dir of ['bossbar-builder', 'wiki-bossbar-builder', 'wiki-minecraft-bossbar-events']) {
            const html = read(locale, dir, 'index.html');
            if (!html.includes('<meta name="google-adsense-account" content="ca-pub-6745837623494230">')) missing.push(`${locale}/${dir}: meta`);
            if (!html.includes('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6745837623494230')) missing.push(`${locale}/${dir}: script`);
        }
    }
    assert.deepEqual(missing, []);
});

// --- Consent: the <head> block, Google's CMP and the site's banner (ANALYTICS.md, "Consent") ---

const consentBlock = read('scripts/consent-defaults.txt').replace(/\r\n/g, '\n').replace(/\n+$/, '');
const consentScript = consentBlock.slice(consentBlock.indexOf('<script>') + '<script>'.length, consentBlock.indexOf('</script>'));
const ADSENSE_TAG_SRC = 'pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
const EEA_UK_CH = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GR', 'HR', 'HU', 'IE', 'IT',
    'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK', 'IS', 'LI', 'NO', 'GB', 'CH'];

function runConsentBlock(storage) {
    const window = {localStorage: storage};
    vm.runInContext(consentScript, vm.createContext({window}));
    return {
        window,
        commands: Array.from(window.dataLayer, (entry) => [entry[0], entry[1], {...entry[2]}])
    };
}

const storageWith = (value) => ({getItem: (key) => (key === 'cube_cookie_consent' ? value : null)});

test('the <head> block denies the EEA, the UK and Switzerland and applies the banner answer elsewhere', () => {
    for (const [stored, expected] of [[null, 'denied'], ['accepted', 'granted'], ['declined', 'denied'], ['other', 'denied']]) {
        const {window, commands} = runConsentBlock(storageWith(stored));
        assert.equal(commands.length, 2, String(stored));
        const [region, rest] = commands;
        assert.deepEqual(region.slice(0, 2), ['consent', 'default']);
        assert.deepEqual([...region[2].region].sort(), [...EEA_UK_CH].sort());
        for (const type of ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage', 'personalization_storage']) {
            assert.equal(region[2][type], 'denied', `region ${type}`);
            assert.equal(rest[2][type], expected, `${stored}: ${type}`);
        }
        assert.equal('region' in rest[2], false, 'the second default covers everyone else');
        assert.equal(rest[2].security_storage, 'granted');
        assert.equal(window.cubeConsentDefaults, true);
        assert.equal(Boolean(window.adsbygoogle && window.adsbygoogle.requestNonPersonalizedAds === 1), stored === 'declined',
            `${stored}: non-personalized ads only after "declined"`);
    }

    const {commands} = runConsentBlock({getItem() { throw new Error('blocked'); }});
    assert.equal(commands[1][2].analytics_storage, 'denied', 'blocked storage counts as no answer');
});

function htmlFiles(dir, out, skipDotDirs) {
    for (const entry of readdirSync(dir, {withFileTypes: true})) {
        if (skipDotDirs && (entry.name.startsWith('.') || entry.name === 'node_modules')) continue;
        const full = join(dir, entry.name);
        if (entry.isDirectory()) htmlFiles(full, out, skipDotDirs);
        else if (entry.name.endsWith('.html')) out.push(full);
    }
    return out;
}

// Every page with the AdSense tag or tracking.js (live, and queued in .drip) carries the block
// before both, and tracking.js never comes without the AdSense tag: Google's message only loads
// where the tag is.
test('pages carry the consent block before the AdSense tag and tracking.js', () => {
    const pages = htmlFiles(root, [], true);
    const queue = join(root, '.drip', 'queue');
    if (existsSync(queue)) {
        for (const bundle of readdirSync(queue)) {
            const payload = join(queue, bundle, 'payload');
            if (existsSync(payload)) htmlFiles(payload, pages, false);
        }
    }

    const problems = [];
    let checked = 0;
    for (const file of pages) {
        const html = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
        const tag = html.indexOf(ADSENSE_TAG_SRC);
        const tracking = html.indexOf('src="/assets/tracking.js"');
        if (tag < 0 && tracking < 0) continue;
        checked += 1;
        const name = file.slice(root.length + 1).replace(/\\/g, '/');
        const block = html.indexOf(consentBlock);
        if (block < 0) problems.push(`${name}: no current consent block`);
        else if (tag >= 0 && tag < block) problems.push(`${name}: consent block after the AdSense tag`);
        if (tracking >= 0 && tag < 0) problems.push(`${name}: tracking.js without the AdSense tag`);
        if (tracking >= 0 && block > tracking) problems.push(`${name}: consent block after tracking.js`);
    }
    assert(checked > 250, `only ${checked} pages checked`);
    assert.deepEqual(problems, [], 'run: node scripts/apply-consent-defaults.mjs');
});

test('with the <head> block tracking.js sets no default of its own; without it, it does', () => {
    let page = load(live({before: (window) => { window.cubeConsentDefaults = true; }}));
    page.domReady();
    assert.deepEqual(page.consent().filter(([command]) => command === 'default'), []);

    page = load(live());
    page.domReady();
    const defaults = page.consent().filter(([command]) => command === 'default');
    assert.equal(defaults.length, 1);
    assert.equal(defaults[0][1].analytics_storage, 'granted', 'stored "accepted"');
});

test('without the CMP the stored answer is sent as an update, and the banner asks when there is none', () => {
    let page = load(live({footer: true}));
    page.domReady();
    assert.deepEqual(page.consent().filter(([command]) => command === 'update').map(([, state]) => state.analytics_storage), ['granted']);
    assert.equal(page.find('[data-cookie-banner="true"]'), null, 'an answer is stored, no banner');

    page = load(live({footer: true, local: new Map()}));
    page.domReady();
    assert.deepEqual(page.consent().filter(([command]) => command === 'update').map(([, state]) => state.ad_storage), ['denied'],
        'no answer yet is an explicit denied');
    assert(page.find('[data-cookie-banner="true"]'), 'banner shown');

    page.find('[data-cookie-accept="true"]').click();
    assert.equal(page.local.get('cube_cookie_consent'), 'accepted');
    assert.equal(page.find('[data-cookie-banner="true"]'), null, 'banner removed');
    assert.equal(page.consent().pop()[1].analytics_storage, 'granted');
    const choice = page.events().filter((event) => event.name === 'cookie_consent_update').pop();
    assert.deepEqual([choice.params.consent_state, choice.params.consent_source], ['accepted', 'site']);
});

test('the banner choice repaints before gtag runs', () => {
    const deferred = [];
    const page = load(live({local: new Map(), idle: (fn) => deferred.push(fn)}));
    page.domReady();
    deferred.splice(0).forEach((fn) => fn());
    const before = page.consent().length;
    page.find('[data-cookie-decline="true"]').click();
    assert.equal(page.find('[data-cookie-banner="true"]'), null, 'the banner goes at once');
    assert.equal(page.consent().length, before, 'the update waits for deferWork');
    deferred.splice(0).forEach((fn) => fn());
    assert.equal(page.consent().pop()[1].ad_storage, 'denied');
});

test('the footer gets a cookie settings button that reopens the banner outside the CMP regions', () => {
    const page = load(live({url: 'https://cubeinsquare.com/de/recipe-generator/', lang: 'de', footer: true}));
    page.domReady();
    const button = page.find('[data-cookie-settings="true"]');
    assert(button, 'button added');
    assert.equal(button.textContent, 'Cookie-Einstellungen');
    assert.equal(button.tagName, 'button', 'a button, invisible to the a[href] handlers');
    const group = button.parent;
    assert.equal(group.className, 'site-footer-links');
    assert.equal(group.children[0].href, '/de/privacy-policy/', 'next to the privacy link');
    assert.equal(group.parent.className, 'site-footer');

    assert.equal(page.find('[data-cookie-banner="true"]'), null);
    button.click();
    assert(page.find('[data-cookie-banner="true"]'), 'banner reopened');
    assert.equal(page.document.activeElement, page.find('[data-cookie-accept="true"]'), 'focus moves to the banner');
});

/** A stand-in for Google's CMP: googlefc.callbackQueue plus a __tcfapi that reports what the test says. */
function fakeCmp() {
    const cmp = {listeners: [], revocations: 0};
    const run = (entry) => (typeof entry === 'function' ? entry() : entry.CONSENT_API_READY && entry.CONSENT_API_READY());
    cmp.install = (window) => {
        window.googlefc = {callbackQueue: [], showRevocationMessage: () => { cmp.revocations += 1; }};
        cmp.window = window;
    };
    cmp.ready = () => {
        cmp.window.__tcfapi = (command, version, callback) => {
            if (command === 'addEventListener') cmp.listeners.push(callback);
        };
        const queue = cmp.window.googlefc.callbackQueue;
        queue.splice(0).forEach(run);
        // Once loaded, Google's queue runs what is pushed at once.
        queue.push = run;
    };
    cmp.report = (tcData) => cmp.listeners.forEach((callback) => callback({purpose: {consents: {}}, ...tcData}, true));
    return cmp;
}

test('where GDPR applies Google\'s message decides: no site banner, no site update, old answer dropped', () => {
    const cmp = fakeCmp();
    const page = load(live({adsense: true, footer: true, local: new Map([['cube_cookie_consent', 'declined']]), before: cmp.install}));
    page.domReady();
    assert.equal(page.find('[data-cookie-settings="true"]'), null, 'nothing decided before the CMP answers');
    cmp.ready();
    cmp.report({gdprApplies: true, eventStatus: 'cmpuishown'});

    assert.equal(page.find('[data-cookie-banner="true"]'), null);
    assert.equal(page.local.has('cube_cookie_consent'), false, 'the old banner answer is dropped');
    assert.deepEqual(page.consent().filter(([command]) => command === 'update'), [], 'Consent Mode is left to the CMP');
    page.runTimers();
    assert.equal(page.find('[data-cookie-banner="true"]'), null, 'the fallback timers were cancelled');

    const choices = [
        [{1: true, 3: true, 4: true, 7: true}, 'accepted'],
        [{1: true, 7: true}, 'partial'],
        [{}, 'declined']
    ];
    for (const [consents, expected] of choices) {
        cmp.report({gdprApplies: true, eventStatus: 'useractioncomplete', purpose: {consents}});
        const sent = page.events().filter((event) => event.name === 'cookie_consent_update').pop();
        assert.deepEqual([sent.params.consent_state, sent.params.consent_source], [expected, 'cmp']);
    }

    page.find('[data-cookie-settings="true"]').click();
    assert.equal(cmp.revocations, 1, 'cookie settings opens Google\'s message');
    assert.equal(page.find('[data-cookie-banner="true"]'), null);
});

test('a CMP that says GDPR does not apply, or never answers, leaves it to the site banner', () => {
    let cmp = fakeCmp();
    let page = load(live({adsense: true, local: new Map(), before: cmp.install}));
    page.domReady();
    cmp.ready();
    cmp.report({gdprApplies: false, eventStatus: 'tcloaded'});
    assert(page.find('[data-cookie-banner="true"]'), 'gdprApplies false');

    page = load(live({adsense: true, local: new Map(), before: fakeCmp().install}));
    page.domReady();
    assert.equal(page.find('[data-cookie-banner="true"]'), null, 'waits for the CMP first');
    page.runTimers();
    assert(page.find('[data-cookie-banner="true"]'), 'no CMP (ad blocker, no message published)');

    cmp = fakeCmp();
    page = load(live({adsense: true, local: new Map(), before: cmp.install}));
    page.domReady();
    cmp.ready();
    page.runTimers();
    assert(page.find('[data-cookie-banner="true"]'), 'the API loaded but never reported');

    // Late answer: the site banner already shows, then the CMP says GDPR applies.
    cmp = fakeCmp();
    page = load(live({adsense: true, local: new Map(), before: cmp.install}));
    page.domReady();
    page.runTimers();
    assert(page.find('[data-cookie-banner="true"]'));
    cmp.ready();
    cmp.report({gdprApplies: true, eventStatus: 'cmpuishown'});
    assert.equal(page.find('[data-cookie-banner="true"]'), null, 'never two banners');
});
