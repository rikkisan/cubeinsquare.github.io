// Run with: node --test tests/analytics.test.cjs
const {test} = require('node:test');
const assert = require('node:assert/strict');
const {readFileSync, existsSync} = require('node:fs');
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

/**
 * Runs the real assets/tracking.js against a stub browser. document.readyState is 'loading',
 * so init() only runs when a test calls domReady().
 */
function load({url = 'https://cubeinsquare.com/recipe-generator/', config, session = new Map(), local, lang = 'en', dataset = {}, idle = (fn) => fn()} = {}) {
    const address = new URL(url);
    const store = (map) => ({
        getItem: (key) => (map.has(key) ? map.get(key) : null),
        setItem: (key, value) => { map.set(key, String(value)); },
        removeItem: (key) => { map.delete(key); }
    });
    const localMap = local || new Map([['cube_cookie_consent', 'accepted']]);
    const listeners = {};
    const logs = [];
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
        matchMedia: () => ({matches: false}),
        addEventListener() {},
        CUBE_ANALYTICS_CONFIG: config
    };
    const document = {
        readyState: 'loading',
        title: 'Test page',
        documentElement: {lang, dataset},
        head: {appendChild() {}},
        body: {appendChild() {}},
        createElement: () => ({dataset: {}}),
        querySelector: () => null,
        querySelectorAll: () => [],
        addEventListener(type, handler) { (listeners[type] = listeners[type] || []).push(handler); }
    };
    const context = vm.createContext({window, document, URL, URLSearchParams, Date, JSON});
    vm.runInContext(trackingSource, context);

    const events = () => (window.dataLayer || [])
        .filter((entry) => entry[0] === 'event')
        .map((entry) => ({name: entry[1], params: entry[2]}));
    const fire = (type, event) => (listeners[type] || []).forEach((handler) => handler(event));
    return {
        analytics: window.CubeAnalytics,
        config: window.CUBE_ANALYTICS_CONFIG,
        session, logs, events, fire,
        gtagCommands: () => (window.dataLayer || []).map((entry) => entry[0]),
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
