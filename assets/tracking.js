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

    function init() {
        boot();
        bindSearchTracking();
        bindDeclarativeClickTracking();
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
