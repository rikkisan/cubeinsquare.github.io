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

    window.CUBE_ANALYTICS_CONFIG = config;

    let booted = false;
    let pageViewTracked = false;
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

    function hasMeasurementIds() {
        return Boolean(config.ga4MeasurementId || config.googleAdsId);
    }

    function debugLog() {
        if (!config.debug || !window.console || typeof window.console.info !== 'function') return;
        window.console.info.apply(window.console, arguments);
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

    function boot() {
        if (booted || !hasMeasurementIds()) return;

        ensureGtag();
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

    function getPageType() {
        const path = (window.location.pathname || '/').toLowerCase();
        if (path.includes('resource-pack-generator')) return 'resource_pack_generator';
        if (path.includes('custom-potions')) return 'custom_potions';
        if (path.includes('custom-villager-trades')) return 'custom_villager_trades';
        if (path.includes('/wiki') || path.includes('wiki-')) return 'wiki';
        if (path.includes('privacy-policy')) return 'privacy_policy';
        if (path.includes('about')) return 'about';
        if (path.includes('tools')) return 'tools';
        if (path === '/' || path.endsWith('/index.html') || path.endsWith('/ru/') || path.endsWith('/fr/') || path.endsWith('/de/')) return 'home';
        return 'page';
    }

    function getSearchCopy() {
        return SEARCH_COPY[getPageLanguage()] || SEARCH_COPY.en;
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

    function track(eventName, params, options) {
        const payload = {
            page_language: getPageLanguage(),
            page_type: getPageType(),
            page_path: window.location.pathname,
            ...sanitizeParams(params)
        };

        if (hasMeasurementIds()) {
            boot();
            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, payload);
                sendConversion(options && options.conversionKey, payload);
            }
        } else {
            debugLog('[CubeAnalytics]', eventName, payload);
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

            toggle.addEventListener('click', (event) => {
                if (!isCompactHeaderMode()) return;
                if (menu.classList.contains('is-open')) return;

                event.preventDefault();
                closeLanguageSwitchers();
                closeNavMenus(menu);
                menu.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
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

    function init() {
        boot();
        bindSearchTracking();
        bindSearchForms();
        bindDeclarativeClickTracking();
        bindHeaderMenus();
        initSearchResults();
        trackPageView();
    }

    window.CubeAnalytics = {
        track,
        trackPageView,
        config
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
