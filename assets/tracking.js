(function () {
    // Fill these values later from GA4 / Google Ads without touching the tool logic.
    // Example:
    // window.CUBE_ANALYTICS_CONFIG = {
    //     ga4MeasurementId: 'G-XXXXXXXXXX',
    //     googleAdsId: 'AW-XXXXXXXXX',
    //     conversions: {
    //         resource_pack_download: 'abcDEFghiJKLmnopQR',
    //         potion_command_copy: 'stuVWXyz1234567890',
    //         villager_command_copy: 'lmnOPQrstUVWxyz123'
    //     }
    // };
    const DEFAULT_CONFIG = {
        ga4MeasurementId: '',
        googleAdsId: '',
        debug: false,
        conversions: {
            resource_pack_download: '',
            potion_command_copy: '',
            villager_command_copy: ''
        }
    };

    const providedConfig = window.CUBE_ANALYTICS_CONFIG || {};
    const config = {
        ...DEFAULT_CONFIG,
        ...providedConfig,
        conversions: {
            ...DEFAULT_CONFIG.conversions,
            ...(providedConfig.conversions || {})
        }
    };

    // Traffic from a developer's machine must never reach the live GA4 property:
    // on localhost, private LAN addresses and file:// events are only logged to the
    // console. ?analytics_test=1 (remembered for the tab, ?analytics_test=0 clears it)
    // sends them to a throwaway measurement ID instead, so collect?v=2 requests can be
    // inspected in DevTools without touching real data.
    const TEST_MEASUREMENT_ID = 'G-TEST000000';
    const ANALYTICS_TEST_KEY = 'cube_analytics_test';

    function isLocalEnvironment() {
        const location = window.location || {};
        if (location.protocol === 'file:') return true;
        const host = String(location.hostname || '').toLowerCase().replace(/^\[|\]$/g, '');
        return host === 'localhost'
            || host.endsWith('.localhost')
            || host.endsWith('.local')
            || host === '::1'
            || host === '0.0.0.0'
            || /^127\./.test(host)
            || /^10\./.test(host)
            || /^192\.168\./.test(host)
            || /^172\.(1[6-9]|2\d|3[01])\./.test(host);
    }

    function resolveTrafficMode() {
        if (!isLocalEnvironment()) return 'live';

        let requested = '';
        try {
            requested = new URLSearchParams(window.location.search || '').get('analytics_test') || '';
        } catch (error) {
            requested = '';
        }

        try {
            if (requested === '1') window.sessionStorage.setItem(ANALYTICS_TEST_KEY, '1');
            if (requested === '0') window.sessionStorage.removeItem(ANALYTICS_TEST_KEY);
            return window.sessionStorage.getItem(ANALYTICS_TEST_KEY) === '1' ? 'test' : 'local';
        } catch (error) {
            return requested === '1' ? 'test' : 'local';
        }
    }

    // 'live': real traffic. 'local': console only. 'test': sent to TEST_MEASUREMENT_ID.
    const trafficMode = resolveTrafficMode();
    if (trafficMode === 'test') {
        config.ga4MeasurementId = TEST_MEASUREMENT_ID;
        config.googleAdsId = '';
    }
    config.trafficMode = trafficMode;

    window.CUBE_ANALYTICS_CONFIG = config;

    let booted = false;
    let pageViewTracked = false;
    let consentInitialized = false;
    const COOKIE_CONSENT_KEY = 'cube_cookie_consent';
    const COOKIE_CONSENT_ACCEPTED = 'accepted';
    const COOKIE_CONSENT_DECLINED = 'declined';
    const SEARCH_COPY = {
        en: {
            resultsTitle: 'Search results',
            clearLabel: 'Show everything',
            summary: (count, query) => `Found ${count} match${count === 1 ? '' : 'es'} for "${query}".`,
            noResults: (query) => `No matching pages or guide blocks were found for "${query}".`
        },
        ru: {
            resultsTitle: 'Результаты поиска',
            clearLabel: 'Показать всё',
            summary: (count, query) => `Найдено ${count} совпадений по запросу "${query}".`,
            noResults: (query) => `По запросу "${query}" пока ничего не нашлось.`
        },
        fr: {
            resultsTitle: 'Résultats de recherche',
            clearLabel: 'Tout afficher',
            summary: (count, query) => `${count} résultat${count > 1 ? 's' : ''} pour "${query}".`,
            noResults: (query) => `Aucun résultat pour "${query}".`
        },
        de: {
            resultsTitle: 'Suchergebnisse',
            clearLabel: 'Alles anzeigen',
            summary: (count, query) => `${count} Treffer für "${query}".`,
            noResults: (query) => `Für "${query}" wurde nichts gefunden.`
        }
    };
    const CONSENT_COPY = {
        en: {
            message: 'We use cookies to analyze traffic and personalize ads. You can accept or decline non-essential tracking.',
            accept: 'Accept',
            decline: 'Decline',
            learnMore: 'Privacy Policy',
            settings: 'Cookie settings'
        },
        ru: {
            message: 'Мы используем cookies, чтобы анализировать трафик и персонализировать рекламу. Вы можете принять или отклонить необязательное отслеживание.',
            accept: 'Принять',
            decline: 'Отклонить',
            learnMore: 'Политика конфиденциальности',
            settings: 'Настройки cookie'
        },
        fr: {
            message: 'Nous utilisons des cookies pour analyser le trafic et personnaliser les annonces. Vous pouvez accepter ou refuser le suivi non essentiel.',
            accept: 'Accepter',
            decline: 'Refuser',
            learnMore: 'Politique de confidentialité',
            settings: 'Paramètres des cookies'
        },
        de: {
            message: 'Wir verwenden Cookies, um den Traffic zu analysieren und Werbung zu personalisieren. Du kannst nicht notwendiges Tracking akzeptieren oder ablehnen.',
            accept: 'Akzeptieren',
            decline: 'Ablehnen',
            learnMore: 'Datenschutz',
            settings: 'Cookie-Einstellungen'
        }
    };

    // Who decides consent on this page. Google's consent message (the TCF CMP that adsbygoogle.js
    // loads) answers whether GDPR applies: 'cmp' in the EEA, the UK and Switzerland, where only that
    // message asks and updates Consent Mode; 'site' everywhere else, and whenever the CMP does not
    // answer in time (ad blocker, message not published, page without the AdSense tag), where the
    // site's own banner asks. 'pending' until one of the two is known.
    let consentAuthority = 'pending';
    const CMP_API_WAIT_MS = 5000;
    const CMP_DATA_WAIT_MS = 5000;

    function hasMeasurementIds() {
        return trafficMode !== 'local' && Boolean(config.ga4MeasurementId || config.googleAdsId);
    }

    function getStoredConsent() {
        try {
            return window.localStorage ? window.localStorage.getItem(COOKIE_CONSENT_KEY) || '' : '';
        } catch (error) {
            return '';
        }
    }

    function setStoredConsent(value) {
        try {
            if (window.localStorage) {
                window.localStorage.setItem(COOKIE_CONSENT_KEY, value);
            }
        } catch (error) {
            // ignore storage failures
        }
    }

    function clearStoredConsent() {
        try {
            if (window.localStorage) {
                window.localStorage.removeItem(COOKIE_CONSENT_KEY);
            }
        } catch (error) {
            // ignore storage failures
        }
    }

    function hasTrackingConsent() {
        return getStoredConsent() === COOKIE_CONSENT_ACCEPTED;
    }

    function hasConsentChoice() {
        const value = getStoredConsent();
        return value === COOKIE_CONSENT_ACCEPTED || value === COOKIE_CONSENT_DECLINED;
    }

    function getConsentModeState(value) {
        const granted = value === COOKIE_CONSENT_ACCEPTED;
        return {
            ad_storage: granted ? 'granted' : 'denied',
            ad_user_data: granted ? 'granted' : 'denied',
            ad_personalization: granted ? 'granted' : 'denied',
            analytics_storage: granted ? 'granted' : 'denied',
            functionality_storage: 'granted',
            security_storage: 'granted',
            personalization_storage: granted ? 'granted' : 'denied'
        };
    }

    function debugLog() {
        if (!(config.debug || trafficMode !== 'live')) return;
        if (!window.console || typeof window.console.info !== 'function') return;
        window.console.info.apply(window.console, arguments);
    }

    function announceTrafficMode() {
        if (trafficMode === 'local') {
            debugLog('[CubeAnalytics] local environment: events are logged here and not sent. Add ?analytics_test=1 to send them to the test property ' + TEST_MEASUREMENT_ID + '.');
        } else if (trafficMode === 'test') {
            debugLog('[CubeAnalytics] test mode: events go to ' + TEST_MEASUREMENT_ID + ', not to the live property. ?analytics_test=0 turns it off.');
        }
    }

    function ensureGtag() {
        if (!window.dataLayer) window.dataLayer = [];
        if (!window.gtag) {
            window.gtag = function gtag() {
                window.dataLayer.push(arguments);
            };
        }
    }

    function loadScript(measurementId) {
        if (!measurementId || document.querySelector('script[data-google-analytics-loader="true"]')) return;
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
        script.dataset.googleAnalyticsLoader = 'true';
        document.head.appendChild(script);
    }

    function initializeConsentMode() {
        if (consentInitialized) return;

        ensureGtag();
        // The defaults normally come from the inline block in <head> (scripts/consent-defaults.txt),
        // which runs before adsbygoogle.js and has the EEA/UK/CH region. This is the fallback for a
        // page that lacks it.
        if (!window.cubeConsentDefaults) {
            window.gtag('consent', 'default', {
                ...getConsentModeState(getStoredConsent()),
                wait_for_update: 500
            });
        }
        consentInitialized = true;
    }

    function updateConsentMode(value) {
        ensureGtag();
        initializeConsentMode();
        window.gtag('consent', 'update', getConsentModeState(value));
    }

    function boot() {
        if (booted || !hasMeasurementIds()) return;

        ensureGtag();
        initializeConsentMode();
        loadScript(config.ga4MeasurementId || config.googleAdsId);
        window.gtag('js', new Date());

        if (config.ga4MeasurementId) {
            window.gtag('config', config.ga4MeasurementId, { send_page_view: false });
        }

        if (config.googleAdsId) {
            window.gtag('config', config.googleAdsId);
        }

        booted = true;
    }

    function getPageLanguage() {
        return (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
    }

    // Every live tool, by its URL slug. A tool page gets tool_id, and /wiki-<slug>/ gets
    // guide_for. Any other wiki-* page is an article. tests/analytics.test.cjs fails when
    // this list and the live tool catalog disagree, so a new tool has to be added here.
    const TOOL_SLUGS = [
        'resource-pack-generator',
        'custom-potions',
        'custom-villager-trades',
        'custom-item-builder',
        'texture-painter',
        'skin-editor',
        'recipe-generator',
        'loot-table-generator',
        'advancement-builder',
        'enchantment-randomizer',
        'datapack-generator',
        'sphere-generator',
        'circle-dome-planner',
        'item-model-builder',
        'custom-item-catalog',
        'dialogue-builder',
        'book-letter-builder',
        'bossbar-builder'
    ];

    // These three tool pages reported their own slug as page_type before tool_id existed.
    const LEGACY_TOOL_PAGE_TYPES = {
        'resource-pack-generator': 'resource_pack_generator',
        'custom-potions': 'custom_potions',
        'custom-villager-trades': 'custom_villager_trades'
    };

    const SECTION_PAGE_TYPES = {
        wiki: 'wiki',
        tools: 'tools',
        about: 'about',
        'privacy-policy': 'privacy_policy'
    };

    function slugToId(slug) {
        return String(slug).replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    }

    /**
     * Describes a site path without a locale prefix. Returns
     * { kind, id, pageType, routeId } where kind is home | tool | guide | article | hub | page
     * and routeId is the compact name used by link_from / link_to.
     */
    function classifyPath(pathname) {
        const parts = String(pathname || '/').toLowerCase().split('/').filter(Boolean);
        if (parts.length && /^(?:ru|fr|de)$/.test(parts[0])) parts.shift();
        if (parts.length && parts[parts.length - 1] === 'index.html') parts.pop();
        const slug = parts[0] || '';

        if (!slug) return { kind: 'home', id: '', pageType: 'home', routeId: 'home' };

        if (TOOL_SLUGS.includes(slug)) {
            const id = slugToId(slug);
            return { kind: 'tool', id, pageType: LEGACY_TOOL_PAGE_TYPES[slug] || 'tool', routeId: `tool:${id}` };
        }

        if (slug.startsWith('wiki-')) {
            const target = slug.slice('wiki-'.length);
            const id = slugToId(target);
            if (TOOL_SLUGS.includes(target)) return { kind: 'guide', id, pageType: 'wiki', routeId: `guide:${id}` };
            return { kind: 'article', id, pageType: 'wiki', routeId: `article:${id}` };
        }

        if (slug === 'wiki' || slug === 'tools') {
            return { kind: 'hub', id: slug, pageType: SECTION_PAGE_TYPES[slug], routeId: `hub:${slug}` };
        }

        const id = slugToId(slug);
        return { kind: 'page', id, pageType: SECTION_PAGE_TYPES[slug] || 'page', routeId: `page:${id}` };
    }

    /**
     * Parameters every event carries. tool_id marks a tool page, guide_for marks the guide of
     * a tool, editor_mode (form | nodes) is set by constructor-nodes.js on pages that have the
     * node editor.
     */
    function getBasePayload() {
        const route = classifyPath(window.location.pathname);
        const base = {
            page_language: getPageLanguage(),
            page_type: route.pageType,
            page_path: window.location.pathname
        };
        if (route.kind === 'tool') base.tool_id = route.id;
        if (route.kind === 'guide') base.guide_for = route.id;

        const dataset = document.documentElement && document.documentElement.dataset;
        if (dataset && dataset.editorMode) base.editor_mode = dataset.editorMode;
        return base;
    }

    function getSearchCopy() {
        return SEARCH_COPY[getPageLanguage()] || SEARCH_COPY.en;
    }

    function getConsentCopy() {
        return CONSENT_COPY[getPageLanguage()] || CONSENT_COPY.en;
    }

    function normalizeSearchText(value) {
        return String(value || '')
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/ё/g, 'е')
            .replace(/ß/g, 'ss')
            .replace(/æ/g, 'ae')
            .replace(/œ/g, 'oe')
            .replace(/[^\p{L}\p{N}]+/gu, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function isCompactHeaderMode() {
        return window.matchMedia('(max-width: 700px)').matches;
    }

    function getLocalePrefix() {
        const match = (window.location.pathname || '').toLowerCase().match(/^\/(ru|fr|de)(\/|$)/);
        return match ? `/${match[1]}` : '';
    }

    function getPrivacyPolicyHref() {
        return `${getLocalePrefix()}/privacy-policy/`;
    }

    function sanitizeValue(value) {
        if (value === null || value === undefined) return undefined;
        if (typeof value === 'string') return value.slice(0, 300);
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number' && Number.isFinite(value)) return value;
        return String(value).slice(0, 300);
    }

    function sanitizeParams(params) {
        const clean = {};
        Object.keys(params || {}).forEach((key) => {
            const value = sanitizeValue(params[key]);
            if (value !== undefined && value !== '') {
                clean[key] = value;
            }
        });
        return clean;
    }

    function sendConversion(conversionKey, params) {
        if (!conversionKey || !config.googleAdsId) return;
        const label = config.conversions[conversionKey];
        if (!label || typeof window.gtag !== 'function') return;

        window.gtag('event', 'conversion', {
            send_to: `${config.googleAdsId}/${label}`,
            ...params
        });
    }

    /**
     * gtag.js does real synchronous work once it has loaded (dataLayer
     * processing, Enhanced Measurement, ads pixels). Running that inline
     * inside a click handler is exactly what pushes Interaction to Next
     * Paint into "needs improvement" -- the click's own visual feedback
     * (menu open, "Copied" label) has to wait behind it. Scheduling it for
     * the next idle slot lets the browser paint that feedback first.
     */
    function deferWork(fn) {
        if (typeof window.requestIdleCallback === 'function') {
            window.requestIdleCallback(fn, { timeout: 1000 });
        } else {
            window.setTimeout(fn, 0);
        }
    }

    /**
     * options.conversionKey fires the matching Google Ads conversion.
     * options.context replaces the page parameters: an event that was queued on one page and
     * is sent from the next one keeps the page it happened on.
     */
    function track(eventName, params, options) {
        const payload = sanitizeParams({
            ...((options && options.context) || getBasePayload()),
            ...params
        });

        debugLog('[CubeAnalytics]', eventName, payload);

        if (hasMeasurementIds()) {
            deferWork(() => {
                boot();
                if (typeof window.gtag === 'function') {
                    window.gtag('event', eventName, payload);
                    sendConversion(options && options.conversionKey, payload);
                }
            });
        }

        return payload;
    }

    function trackPageView() {
        if (pageViewTracked) return;
        pageViewTracked = true;
        track('page_view', {
            page_title: document.title,
            page_location: window.location.href
        });
    }

    function bindSearchTracking() {
        document.querySelectorAll('.steam-search').forEach((form) => {
            if (form.dataset.analyticsBound === 'true') return;
            form.dataset.analyticsBound = 'true';

            form.addEventListener('submit', () => {
                const input = form.querySelector('input[name="q"], input[type="search"], input[type="text"]');
                const query = input ? String(input.value || '').trim() : '';
                if (!query) return;

                track('site_search', {
                    search_term: query,
                    search_term_length: query.length,
                    search_destination: form.getAttribute('action') || ''
                });
            });
        });
    }

    function bindDeclarativeClickTracking() {
        document.addEventListener('click', (event) => {
            const target = event.target.closest('[data-track-click]');
            if (!target) return;

            track(target.dataset.trackClick, {
                click_label: target.dataset.trackLabel || target.textContent.trim(),
                click_href: target.getAttribute('href') || '',
                click_area: target.dataset.trackArea || ''
            });
        });
    }

    // Where on the page a link sits. The first matching container wins, so a link in the
    // navbar is "navigation" even though the navbar is also inside the page.
    const LINK_AREAS = [
        ['.steam-navbar', 'navigation'],
        ['.site-footer', 'footer'],
        ['.resource-card', 'card'],
        ['.page-hero', 'hero'],
        ['.tool-button-row', 'cta'],
        ['.item-builder-help, .tool-secondary-column', 'related'],
        ['.wiki-article, .article-shell', 'article_body']
    ];
    const PENDING_LINK_KEY = 'cube_pending_link_click';
    const PENDING_LINK_MAX_AGE_MS = 60000;

    function getLinkArea(link) {
        for (let index = 0; index < LINK_AREAS.length; index += 1) {
            if (link.closest(LINK_AREAS[index][0])) return LINK_AREAS[index][1];
        }
        return 'other';
    }

    /**
     * A link that goes to a tool or to the guide of a tool, or null for any other link.
     * Language switches and links to the current page are not guide links.
     */
    function describeGuideLink(link) {
        let url;
        try {
            url = new URL(link.getAttribute('href'), window.location.href);
        } catch (error) {
            return null;
        }
        if (url.origin !== window.location.origin) return null;

        const to = classifyPath(url.pathname);
        if (to.kind !== 'tool' && to.kind !== 'guide') return null;

        const from = classifyPath(window.location.pathname);
        if (from.routeId === to.routeId) return null;

        return {
            toPath: url.pathname,
            params: {
                link_from: from.routeId,
                link_to: to.routeId,
                click_area: getLinkArea(link)
            }
        };
    }

    function leavesPageInSameTab(event, link) {
        if (event.type !== 'click' || event.defaultPrevented) return false;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return false;
        const target = String(link.getAttribute('target') || '').toLowerCase();
        return !target || target === '_self';
    }

    /**
     * gtag batches hits, and a page that navigates away takes the batch with it: in headless
     * Chrome a link-click event was never delivered from the page being left. So a click
     * that leaves the page in the same tab is parked in sessionStorage and sent by the page it
     * lands on, still through track() and deferWork(), with the context of the page it came from.
     */
    function stashPendingLink(entry) {
        try {
            window.sessionStorage.setItem(PENDING_LINK_KEY, JSON.stringify(entry));
            return true;
        } catch (error) {
            return false;
        }
    }

    function flushPendingLink() {
        let entry;
        try {
            const raw = window.sessionStorage.getItem(PENDING_LINK_KEY);
            if (!raw) return;
            window.sessionStorage.removeItem(PENDING_LINK_KEY);
            entry = JSON.parse(raw);
        } catch (error) {
            return;
        }

        if (!entry || typeof entry !== 'object' || !entry.context || !entry.params) return;
        if (!(Date.now() - Number(entry.time) <= PENDING_LINK_MAX_AGE_MS)) return;
        if (entry.toPath !== window.location.pathname) return;

        track('guide_link_click', entry.params, { context: entry.context });
    }

    function handleGuideLinkClick(event) {
        if (!event.target || typeof event.target.closest !== 'function') return;
        if (event.type === 'auxclick' && event.button !== 1) return;

        const link = event.target.closest('a[href]');
        if (!link || link.hasAttribute('download') || link.closest('.language-switch')) return;

        const guideLink = describeGuideLink(link);
        if (!guideLink) return;

        if (leavesPageInSameTab(event, link)) {
            const parked = stashPendingLink({
                time: Date.now(),
                toPath: guideLink.toPath,
                context: getBasePayload(),
                params: guideLink.params
            });
            if (parked) return;
        }

        track('guide_link_click', guideLink.params);
    }

    function bindGuideLinkTracking() {
        document.addEventListener('click', handleGuideLinkClick);
        document.addEventListener('auxclick', handleGuideLinkClick);
    }

    function closeNavMenus(exceptMenu) {
        document.querySelectorAll('.steam-nav-menu.is-open').forEach((menu) => {
            if (exceptMenu && menu === exceptMenu) return;
            menu.classList.remove('is-open');
            const toggle = menu.querySelector('.steam-nav-dropdown');
            if (toggle) toggle.setAttribute('aria-expanded', 'false');
        });
    }

    function closeLanguageSwitchers(exceptSwitch) {
        document.querySelectorAll('.language-switch.is-open').forEach((switcher) => {
            if (exceptSwitch && switcher === exceptSwitch) return;
            switcher.classList.remove('is-open');
            const activeLink = switcher.querySelector('a.is-active');
            if (activeLink) activeLink.setAttribute('aria-expanded', 'false');
        });
    }

    function bindHeaderMenus() {
        document.querySelectorAll('.steam-nav-menu').forEach((menu) => {
            if (menu.dataset.headerReady === 'true') return;
            menu.dataset.headerReady = 'true';

            const toggle = menu.querySelector('.steam-nav-dropdown');
            const panel = menu.querySelector('.steam-dropdown-panel');
            if (!toggle || !panel) return;

            toggle.setAttribute('aria-haspopup', 'true');
            toggle.setAttribute('aria-expanded', 'false');

            let closeButton = panel.querySelector('.steam-menu-close');
            if (!closeButton) {
                const closeLabels = {
                    ru: 'Закрыть меню',
                    fr: 'Fermer le menu',
                    de: 'Menü schließen',
                    en: 'Close menu'
                };
                const locale = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();
                closeButton = document.createElement('button');
                closeButton.type = 'button';
                closeButton.className = 'steam-menu-close';
                closeButton.textContent = '×';
                closeButton.setAttribute('aria-label', closeLabels[locale] || closeLabels.en);
                closeButton.title = closeLabels[locale] || closeLabels.en;
                panel.prepend(closeButton);
            }

            closeButton.addEventListener('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                closeNavMenus();
                toggle.focus();
            });

            toggle.addEventListener('click', (event) => {
                if (!isCompactHeaderMode()) return;

                event.preventDefault();
                const shouldOpen = !menu.classList.contains('is-open');
                if (!shouldOpen) {
                    closeNavMenus();
                    return;
                }

                closeLanguageSwitchers();
                closeNavMenus(menu);
                menu.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
                panel.scrollTop = 0;
            });
        });

        document.querySelectorAll('.language-switch').forEach((switcher) => {
            if (switcher.dataset.headerReady === 'true') return;
            switcher.dataset.headerReady = 'true';

            const activeLink = switcher.querySelector('a.is-active');
            if (!activeLink) return;

            activeLink.setAttribute('aria-haspopup', 'true');
            activeLink.setAttribute('aria-expanded', 'false');

            activeLink.addEventListener('click', (event) => {
                event.preventDefault();
                const shouldOpen = !switcher.classList.contains('is-open');

                closeNavMenus();
                closeLanguageSwitchers(shouldOpen ? switcher : null);
                switcher.classList.toggle('is-open', shouldOpen);
                activeLink.setAttribute('aria-expanded', shouldOpen ? 'true' : 'false');
            });
        });

        document.addEventListener('click', (event) => {
            if (!event.target.closest('.steam-nav-menu')) {
                closeNavMenus();
            }
            if (!event.target.closest('.language-switch')) {
                closeLanguageSwitchers();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;
            closeNavMenus();
            closeLanguageSwitchers();
        });

        window.addEventListener('resize', () => {
            if (isCompactHeaderMode()) return;
            closeNavMenus();
            closeLanguageSwitchers();
        });
    }

    function syncSearchInputs(query) {
        document.querySelectorAll('.steam-search input[name="q"], .steam-search input[type="search"], .steam-search input[type="text"]').forEach((input) => {
            if (!input.value) input.value = query;
        });
    }

    function bindSearchForms() {
        document.querySelectorAll('.steam-search').forEach((form) => {
            if (form.dataset.searchReady === 'true') return;
            form.dataset.searchReady = 'true';

            form.addEventListener('submit', (event) => {
                const input = form.querySelector('input[name="q"], input[type="search"], input[type="text"]');
                if (!input) return;

                const query = String(input.value || '').trim();
                input.value = query;

                if (!query) {
                    event.preventDefault();
                    input.focus();
                }
            });
        });
    }

    function getResolvedHref(href) {
        if (!href) return '';
        if (/^https?:\/\//i.test(href)) return href;
        if (href.startsWith('#')) return `${window.location.pathname}${href}`;
        return href;
    }

    function collectSearchEntries(main) {
        const entries = new Map();
        document.querySelectorAll('main a[href], .steam-navbar .steam-dropdown-panel a[href], .site-footer a[href]').forEach((link) => {
            const href = getResolvedHref(link.getAttribute('href'));
            const title = String(link.textContent || '').trim();
            if (!href || !title) return;

            const card = link.closest('.resource-card, .mega-card, .mega-group');
            const section = link.closest('.page-section');
            const descriptionNode = card && card.querySelector('p, span');
            const sectionTitle = section && section.querySelector('.section-title');
            const description = descriptionNode ? String(descriptionNode.textContent || '').trim() : '';
            const searchable = [title, description, card ? card.textContent : '', sectionTitle ? sectionTitle.textContent : '']
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();

            if (!entries.has(href)) {
                entries.set(href, {
                    href,
                    title,
                    description,
                    searchable
                });
                return;
            }

            const current = entries.get(href);
            if (searchable.length > current.searchable.length) {
                current.searchable = searchable;
            }
            if (!current.description && description) {
                current.description = description;
            }
        });

        return Array.from(entries.values());
    }

    function ensureSearchResultsSection(main, copy) {
        let section = main.querySelector('[data-search-results="true"]');
        if (section) return section;

        section = document.createElement('section');
        section.className = 'page-section';
        section.dataset.searchResults = 'true';
        section.innerHTML = `
            <div class="search-results-head">
                <div>
                    <h2 class="section-title">${copy.resultsTitle}</h2>
                    <div class="search-results-summary"></div>
                </div>
                <a class="search-results-clear" href="${window.location.pathname}">${copy.clearLabel}</a>
            </div>
            <div class="resource-grid" data-search-results-list></div>
            <div class="search-empty" data-search-empty hidden></div>
        `;

        const hero = main.querySelector('.page-hero');
        if (hero && hero.nextSibling) {
            main.insertBefore(section, hero.nextSibling);
        } else {
            main.prepend(section);
        }

        return section;
    }

    function filterWikiSections(main, normalizedQuery) {
        const sections = Array.from(main.querySelectorAll('.page-section')).filter((section) => section.dataset.searchResults !== 'true');

        sections.forEach((section) => {
            const sectionTitle = normalizeSearchText(section.querySelector('.section-title') ? section.querySelector('.section-title').textContent : '');
            const showWholeSection = Boolean(sectionTitle && sectionTitle.includes(normalizedQuery));
            let sectionVisible = false;

            const cards = Array.from(section.querySelectorAll('.resource-card'));
            cards.forEach((card) => {
                const matched = showWholeSection || normalizeSearchText(card.textContent).includes(normalizedQuery);
                card.hidden = !matched;
                if (matched) sectionVisible = true;
            });

            const table = section.querySelector('.compact-table');
            if (table) {
                let tableHasVisibleRows = false;
                Array.from(table.querySelectorAll('tr')).forEach((row, index) => {
                    if (index === 0) {
                        row.hidden = false;
                        return;
                    }

                    const matched = showWholeSection || normalizeSearchText(row.textContent).includes(normalizedQuery);
                    row.hidden = !matched;
                    if (matched) tableHasVisibleRows = true;
                });

                if (tableHasVisibleRows) sectionVisible = true;
            }

            if (!cards.length && !table) {
                sectionVisible = showWholeSection || normalizeSearchText(section.textContent).includes(normalizedQuery);
            }

            section.hidden = !sectionVisible;
        });
    }

    function initSearchResults() {
        const params = new URLSearchParams(window.location.search || '');
        const rawQuery = String(params.get('q') || '').trim();
        if (!rawQuery) return;

        syncSearchInputs(rawQuery);
        const main = document.querySelector('main.page-shell');
        if (!main || !document.querySelector('#general-wiki')) return;

        const copy = getSearchCopy();
        const normalizedQuery = normalizeSearchText(rawQuery);
        const matches = collectSearchEntries(main)
            .filter((entry) => normalizeSearchText(entry.searchable).includes(normalizedQuery))
            .slice(0, 6);

        const resultsSection = ensureSearchResultsSection(main, copy);
        const summary = resultsSection.querySelector('.search-results-summary');
        const list = resultsSection.querySelector('[data-search-results-list]');
        const empty = resultsSection.querySelector('[data-search-empty]');

        if (summary) {
            summary.textContent = copy.summary(matches.length, rawQuery);
        }

        if (matches.length && list) {
            list.innerHTML = matches.map((entry) => `
                <article class="resource-card">
                    <h3>${entry.title}</h3>
                    <p>${entry.description || ''}</p>
                    <a class="resource-link" href="${entry.href}">${entry.title}</a>
                </article>
            `).join('');
        } else if (list) {
            list.innerHTML = '';
        }

        if (empty) {
            empty.hidden = matches.length > 0;
            empty.textContent = matches.length ? '' : copy.noResults(rawQuery);
        }

        filterWikiSections(main, normalizedQuery);
    }

    function removeConsentBanner() {
        const banner = document.querySelector('[data-cookie-banner="true"]');
        if (banner) banner.remove();
    }

    function applyConsentChoice(value) {
        removeConsentBanner();
        if (consentAuthority === 'cmp') return;
        setStoredConsent(value);
        // The banner is gone before gtag does any work, so the click paints at once (INP).
        deferWork(() => updateConsentMode(value));
        track('cookie_consent_update', { consent_state: value, consent_source: 'site' });
    }

    function getGoogleFc() {
        window.googlefc = window.googlefc || {};
        window.googlefc.callbackQueue = window.googlefc.callbackQueue || [];
        return window.googlefc;
    }

    function hasAdSenseTag() {
        return Boolean(document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]'));
    }

    /**
     * Outside the CMP's regions the site's banner decides. The stored answer is sent as an update,
     * never left to the default alone: an update outranks any default sent later (a CMP's
     * included), so the banner's answer holds. No answer yet means denied and the banner.
     */
    function useSiteConsent() {
        if (consentAuthority !== 'pending') return;
        consentAuthority = 'site';
        updateConsentMode(getStoredConsent());
        if (!hasConsentChoice()) showConsentBanner();
        addConsentSettingsButton();
    }

    /**
     * In the EEA, the UK and Switzerland Google's message decides and updates Consent Mode itself.
     * The old banner's answer is not a TCF consent, so it is dropped: Google's message asks once,
     * and the <head> block stops asking AdSense for non-personalized ads on an old "declined".
     */
    function useCmpConsent() {
        if (consentAuthority === 'cmp') return;
        consentAuthority = 'cmp';
        removeConsentBanner();
        clearStoredConsent();
        addConsentSettingsButton();
    }

    // What a choice in Google's message means for ads: no storage (purpose 1) is a refusal,
    // storage plus ad profiles and personalized ads (purposes 3 and 4) a full consent.
    function describeTcfChoice(tcData) {
        const consents = (tcData.purpose && tcData.purpose.consents) || {};
        if (!consents[1]) return COOKIE_CONSENT_DECLINED;
        return consents[3] && consents[4] ? COOKIE_CONSENT_ACCEPTED : 'partial';
    }

    function handleTcfData(tcData, success) {
        if (!success || !tcData) return false;
        if (tcData.gdprApplies === true) {
            useCmpConsent();
            if (tcData.eventStatus === 'useractioncomplete') {
                track('cookie_consent_update', { consent_state: describeTcfChoice(tcData), consent_source: 'cmp' });
            }
            return true;
        }
        if (tcData.gdprApplies === false) {
            useSiteConsent();
            return true;
        }
        return false;
    }

    /**
     * Asks Google's CMP, through the queue its documentation prescribes, whether GDPR applies.
     * A CMP that answers late still takes over and removes the site's banner, so a visitor never
     * sees both.
     */
    function watchConsentPlatform() {
        if (!hasAdSenseTag()) {
            useSiteConsent();
            return;
        }

        const apiTimer = window.setTimeout(useSiteConsent, CMP_API_WAIT_MS);
        getGoogleFc().callbackQueue.push({
            CONSENT_API_READY: () => {
                window.clearTimeout(apiTimer);
                if (typeof window.__tcfapi !== 'function') {
                    useSiteConsent();
                    return;
                }
                let answered = false;
                const dataTimer = window.setTimeout(() => {
                    if (!answered) useSiteConsent();
                }, CMP_DATA_WAIT_MS);
                window.__tcfapi('addEventListener', 2, (tcData, success) => {
                    if (handleTcfData(tcData, success)) {
                        answered = true;
                        window.clearTimeout(dataTimer);
                    }
                });
            }
        });
    }

    function openConsentSettings() {
        if (consentAuthority === 'cmp') {
            getGoogleFc().callbackQueue.push(() => {
                if (typeof window.googlefc.showRevocationMessage === 'function') window.googlefc.showRevocationMessage();
            });
            return;
        }
        showConsentBanner({ focus: true });
    }

    // "Cookie settings" next to the privacy link in the footer: Google's message in the CMP's
    // regions, the site's banner elsewhere. A button, so the a[href] handlers (guide links,
    // search index) never see it.
    function addConsentSettingsButton() {
        const footer = document.querySelector('.site-footer');
        if (!footer || footer.querySelector('[data-cookie-settings="true"]')) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'cookie-settings-button';
        button.dataset.cookieSettings = 'true';
        button.textContent = getConsentCopy().settings;
        button.addEventListener('click', openConsentSettings);

        const privacyLink = footer.querySelector('a[href$="/privacy-policy/"]');
        if (privacyLink) {
            const group = document.createElement('span');
            group.className = 'site-footer-links';
            privacyLink.replaceWith(group);
            group.appendChild(privacyLink);
            group.appendChild(button);
        } else {
            footer.appendChild(button);
        }
    }

    function showConsentBanner(options) {
        if (document.querySelector('[data-cookie-banner="true"]')) return;

        const copy = getConsentCopy();
        const banner = document.createElement('aside');
        banner.className = 'cookie-banner';
        banner.dataset.cookieBanner = 'true';
        banner.innerHTML = `
            <div class="cookie-banner-copy">
                <strong>Cookies</strong>
                <p>${copy.message}</p>
                <a class="cookie-banner-link" href="${getPrivacyPolicyHref()}">${copy.learnMore}</a>
            </div>
            <div class="cookie-banner-actions">
                <button class="cookie-banner-button cookie-banner-button-secondary" type="button" data-cookie-decline="true">${copy.decline}</button>
                <button class="cookie-banner-button" type="button" data-cookie-accept="true">${copy.accept}</button>
            </div>
        `;

        document.body.appendChild(banner);

        const acceptButton = banner.querySelector('[data-cookie-accept="true"]');
        const declineButton = banner.querySelector('[data-cookie-decline="true"]');

        if (acceptButton) {
            acceptButton.addEventListener('click', () => applyConsentChoice(COOKIE_CONSENT_ACCEPTED));
        }

        if (declineButton) {
            declineButton.addEventListener('click', () => applyConsentChoice(COOKIE_CONSENT_DECLINED));
        }

        if (options && options.focus && acceptButton) acceptButton.focus();
    }

    function init() {
        announceTrafficMode();
        boot();
        bindSearchTracking();
        bindSearchForms();
        bindDeclarativeClickTracking();
        bindGuideLinkTracking();
        bindHeaderMenus();
        initSearchResults();
        watchConsentPlatform();
        trackPageView();
        flushPendingLink();
    }

    window.CubeAnalytics = {
        track,
        trackPageView,
        classifyPath,
        config
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
