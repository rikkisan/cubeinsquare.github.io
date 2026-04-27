(function () {
    const DESIGN_STORAGE_KEY = 'cubeinsquare-design-mode';
    const READABLE_FONT_STORAGE_KEY = 'cubeinsquare-readable-font';

    function trackEvent(name, params, options) {
        if (window.CubeAnalytics && typeof window.CubeAnalytics.track === 'function') {
            window.CubeAnalytics.track(name, params, options);
        }
    }

    function getSavedDesignMode() {
        try {
            return window.localStorage.getItem(DESIGN_STORAGE_KEY) === 'classic' ? 'classic' : 'modern';
        } catch (error) {
            return 'modern';
        }
    }

    function getSavedReadableFont() {
        try {
            return window.localStorage.getItem(READABLE_FONT_STORAGE_KEY) === 'enabled';
        } catch (error) {
            return false;
        }
    }

    function saveDesignMode(mode) {
        try {
            window.localStorage.setItem(DESIGN_STORAGE_KEY, mode);
        } catch (error) {
            // Storage can be unavailable in strict/private contexts; the live toggle still works.
        }
    }

    function saveReadableFont(enabled) {
        try {
            window.localStorage.setItem(READABLE_FONT_STORAGE_KEY, enabled ? 'enabled' : 'disabled');
        } catch (error) {
            // Storage can be unavailable in strict/private contexts; the live toggle still works.
        }
    }

    function applyDesignMode(mode) {
        const isModern = mode === 'modern';
        document.documentElement.dataset.design = isModern ? 'modern' : 'classic';

        const themeMeta = document.querySelector('meta[name="theme-color"]');
        if (themeMeta) {
            themeMeta.setAttribute('content', isModern ? '#313338' : '#0f172a');
        }
    }

    function applyReadableFont(enabled) {
        document.documentElement.toggleAttribute('data-readable-font', enabled);
    }

    applyDesignMode(getSavedDesignMode());
    applyReadableFont(getSavedReadableFont());

    function copyTextFallback(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    function initCopyButtons() {
        document.querySelectorAll('[data-copy-text]').forEach((button) => {
            if (button.dataset.copyReady === 'true') return;
            button.dataset.copyReady = 'true';

            const defaultLabel = button.dataset.copyLabel || button.textContent.trim();
            const copiedLabel = button.dataset.copyCopiedLabel || defaultLabel;
            let resetTimer = null;

            button.addEventListener('click', async () => {
                const text = button.dataset.copyText || '';
                if (!text) return;

                try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                        await navigator.clipboard.writeText(text);
                    } else {
                        copyTextFallback(text);
                    }
                } catch (error) {
                    copyTextFallback(text);
                }

                trackEvent('wiki_example_copy', {
                    copy_target: text,
                    copy_length: text.length
                });

                button.textContent = copiedLabel;
                button.classList.add('is-copied');
                window.clearTimeout(resetTimer);
                resetTimer = window.setTimeout(() => {
                    button.textContent = defaultLabel;
                    button.classList.remove('is-copied');
                }, 1400);
            });
        });
    }

    function updateRangeProgress(input) {
        const min = Number(input.min || 0);
        const max = Number(input.max || 100);
        const value = Number(input.value || min);
        const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;
        input.style.setProperty('--range-progress', `${Math.min(100, Math.max(0, progress))}%`);
    }

    function initRangeInputs(root) {
        const scope = root || document;
        const ranges = [];

        if (scope instanceof HTMLInputElement && scope.type === 'range') {
            ranges.push(scope);
        } else if (scope.querySelectorAll) {
            ranges.push(...scope.querySelectorAll('input[type="range"]'));
        }

        ranges.forEach((input) => {
            updateRangeProgress(input);
            if (input.dataset.rangeProgressReady === 'true') return;
            input.dataset.rangeProgressReady = 'true';
            input.addEventListener('input', () => updateRangeProgress(input));
            input.addEventListener('change', () => updateRangeProgress(input));
        });
    }

    function observeRangeInputs() {
        initRangeInputs(document);

        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        initRangeInputs(node);
                    }
                });
            });
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function initSlideshow(root) {
        const slides = Array.from(root.querySelectorAll('.server-slides img'));
        const prev = root.querySelector('[data-slide-prev]');
        const next = root.querySelector('[data-slide-next]');
        const dotsWrap = root.querySelector('[data-slide-dots]');
        let current = Math.max(0, slides.findIndex((slide) => slide.classList.contains('is-active')));
        const intervalMs = Number(root.dataset.slideInterval || 5000);
        let autoTimer = null;

        if (!slides.length) return;

        function stopAuto() {
            if (autoTimer) {
                window.clearInterval(autoTimer);
                autoTimer = null;
            }
        }

        function startAuto() {
            stopAuto();
            if (slides.length > 1 && intervalMs > 0) {
                autoTimer = window.setInterval(() => show(current + 1), intervalMs);
            }
        }

        function moveTo(index) {
            show(index);
            startAuto();
        }

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach((slide, slideIndex) => {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            if (dotsWrap) {
                dotsWrap.querySelectorAll('button').forEach((dot, dotIndex) => {
                    dot.classList.toggle('is-active', dotIndex === current);
                    dot.setAttribute('aria-current', dotIndex === current ? 'true' : 'false');
                });
            }
        }

        if (dotsWrap) {
            dotsWrap.innerHTML = '';
            slides.forEach((_, index) => {
                const dot = document.createElement('button');
                dot.type = 'button';
                dot.setAttribute('aria-label', String(index + 1));
                dot.addEventListener('click', () => moveTo(index));
                dotsWrap.appendChild(dot);
            });
        }

        if (prev) prev.addEventListener('click', () => moveTo(current - 1));
        if (next) next.addEventListener('click', () => moveTo(current + 1));

        root.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') moveTo(current - 1);
            if (event.key === 'ArrowRight') moveTo(current + 1);
        });
        root.addEventListener('mouseenter', stopAuto);
        root.addEventListener('mouseleave', startAuto);
        root.addEventListener('focusin', stopAuto);
        root.addEventListener('focusout', startAuto);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAuto();
            else startAuto();
        });

        root.tabIndex = 0;
        show(current);
        startAuto();
    }

    function getLocaleInfo() {
        const path = window.location.pathname.toLowerCase();
        if (path.startsWith('/ru/')) return { lang: 'ru', prefix: '/ru' };
        if (path.startsWith('/fr/')) return { lang: 'fr', prefix: '/fr' };
        if (path.startsWith('/de/')) return { lang: 'de', prefix: '/de' };
        return { lang: 'en', prefix: '' };
    }

    function withPrefix(path) {
        const { prefix } = getLocaleInfo();
        return prefix ? `${prefix}${path}` : path;
    }

    function initGlobalToolLinks() {
        const locale = getLocaleInfo().lang;
        const labels = {
            en: {
                skinTool: 'Minecraft Skin Editor',
                skinGuide: 'Skin editor guide',
                skinTitle: 'Skin editor',
                skinDesc: 'Draw on the atlas or paint directly on the 3D player model.',
                textureTool: 'Texture painter',
                textureGuide: 'Texture painter guide',
                textureTitle: 'Texture painter',
                textureDesc: 'Choose a canvas size, paint a PNG, and send it into your pack workflow.'
            },
            ru: {
                skinTool: 'Редактор скинов Minecraft',
                skinGuide: 'Гайд по редактору скинов',
                skinTitle: 'Редактор скинов',
                skinDesc: 'Рисуйте по атласу или прямо по 3D-модели игрока.',
                textureTool: 'Редактор текстур',
                textureGuide: 'Гайд по редактору текстур',
                textureTitle: 'Редактор текстур',
                textureDesc: 'Выберите холст, нарисуйте PNG и отправьте его в генератор ресурс-пака.'
            },
            fr: {
                skinTool: 'Éditeur de skins Minecraft',
                skinGuide: 'Guide de l’éditeur de skins',
                skinTitle: 'Éditeur de skins',
                skinDesc: 'Dessinez sur l’atlas ou directement sur le modèle 3D du joueur.',
                textureTool: 'Éditeur de textures',
                textureGuide: 'Guide de l’éditeur de textures',
                textureTitle: 'Éditeur de textures',
                textureDesc: 'Choisissez un canevas, peignez un PNG, puis envoyez-le dans votre workflow de pack.'
            },
            de: {
                skinTool: 'Minecraft Skin-Editor',
                skinGuide: 'Skin-Editor-Anleitung',
                skinTitle: 'Skin-Editor',
                skinDesc: 'Male auf dem Atlas oder direkt auf dem 3D-Spielermodell.',
                textureTool: 'Textur-Editor',
                textureGuide: 'Textur-Editor-Anleitung',
                textureTitle: 'Textur-Editor',
                textureDesc: 'Wähle eine Leinwandgröße, male ein PNG und sende es in deinen Pack-Workflow.'
            }
        };
        const copy = labels[locale] || labels.en;
        const tools = [
            {
                toolHref: withPrefix('/skin-editor/'),
                guideHref: withPrefix('/wiki-skin-editor/'),
                toolLabel: copy.skinTool,
                guideLabel: copy.skinGuide,
                featureTitle: copy.skinTitle,
                featureDesc: copy.skinDesc
            },
            {
                toolHref: withPrefix('/texture-painter/'),
                guideHref: withPrefix('/wiki-texture-painter/'),
                toolLabel: copy.textureTool,
                guideLabel: copy.textureGuide,
                featureTitle: copy.textureTitle,
                featureDesc: copy.textureDesc
            }
        ];

        document.querySelectorAll('.steam-mega-panel--tools .mega-list').forEach((list) => {
            const upcoming = Array.from(list.querySelectorAll('a')).find((item) => /(?:^|\/)tool-coming-soon(?:\/|\.html)?$/i.test(item.getAttribute('href') || ''));
            tools.forEach((tool) => {
                if (list.querySelector(`a[href="${tool.toolHref}"], a[href$="${tool.toolHref}"]`)) return;
                const link = document.createElement('a');
                link.href = tool.toolHref;
                link.textContent = tool.toolLabel;
                list.insertBefore(link, upcoming || null);
            });
        });

        document.querySelectorAll('.steam-mega-panel--tools .mega-feature').forEach((feature) => {
            tools.slice().reverse().forEach((tool) => {
                if (feature.querySelector(`a[href="${tool.toolHref}"], a[href$="${tool.toolHref}"]`)) return;
                const card = document.createElement('a');
                card.className = 'mega-card';
                card.href = tool.toolHref;
                card.innerHTML = `<strong>${tool.featureTitle}</strong><span>${tool.featureDesc}</span>`;
                feature.insertBefore(card, feature.firstChild);
            });
        });

        document.querySelectorAll('.mega-group-title[href*="#other-tools-wiki"]').forEach((title) => {
            const sublist = title.parentElement ? title.parentElement.querySelector('.mega-sublist') : null;
            const potions = sublist ? Array.from(sublist.querySelectorAll('a')).find((item) => /(?:^|\/)wiki-custom-potions(?:\/|\.html)?$/i.test(item.getAttribute('href') || '')) : null;
            if (!sublist) return;
            tools.forEach((tool) => {
                if (sublist.querySelector(`a[href="${tool.guideHref}"], a[href$="${tool.guideHref}"]`)) return;
                const link = document.createElement('a');
                link.href = tool.guideHref;
                link.textContent = tool.guideLabel;
                sublist.insertBefore(link, potions || sublist.firstChild);
            });
        });
    }

    function initProjectSupportLinks() {
        const patreonUrl = 'https://www.patreon.com/c/Cubeinaquare?vanity=user';
        const labels = {
            en: 'Patreon',
            ru: 'Patreon',
            fr: 'Patreon',
            de: 'Patreon'
        };
        const label = labels[getLocaleInfo().lang] || labels.en;

        document.querySelectorAll('.steam-nav-menu').forEach((menu) => {
            const dropdown = menu.querySelector('.steam-nav-dropdown');
            const panel = menu.querySelector('.steam-dropdown-panel--small');
            if (!dropdown || !panel) return;

            const href = dropdown.getAttribute('href') || '';
            if (!/(?:^|\/)about(?:\/|\.html)?$/i.test(href)) return;
            if (panel.querySelector(`a[href="${patreonUrl}"]`)) return;

            const link = document.createElement('a');
            link.href = patreonUrl;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.textContent = label;

            const privacy = Array.from(panel.querySelectorAll('a')).find((item) => /privacy-policy/i.test(item.getAttribute('href') || ''));
            panel.insertBefore(link, privacy || null);
        });
    }

    function getDesignToggleCopy() {
        const locale = getLocaleInfo().lang;
        return ({
            en: {
                toModern: 'Switch to new theme',
                toClassic: 'Switch to classic theme'
            },
            ru: {
                toModern: 'Включить новую тему',
                toClassic: 'Вернуть классическую тему'
            },
            fr: {
                toModern: 'Activer le nouveau thème',
                toClassic: 'Revenir au thème classique'
            },
            de: {
                toModern: 'Neues Theme einschalten',
                toClassic: 'Klassisches Theme wiederherstellen'
            }
        })[locale] || {
            toModern: 'Switch to new theme',
            toClassic: 'Switch to classic theme'
        };
    }

    function getReadableFontToggleCopy() {
        const locale = getLocaleInfo().lang;
        return ({
            en: {
                enable: 'Enable dyslexia-friendly font',
                disable: 'Disable dyslexia-friendly font'
            },
            ru: {
                enable: 'Включить шрифт для дислексии',
                disable: 'Выключить шрифт для дислексии'
            },
            fr: {
                enable: 'Activer la police adaptée à la dyslexie',
                disable: 'Désactiver la police adaptée à la dyslexie'
            },
            de: {
                enable: 'Legasthenie-freundliche Schrift einschalten',
                disable: 'Legasthenie-freundliche Schrift ausschalten'
            }
        })[locale] || {
            enable: 'Enable dyslexia-friendly font',
            disable: 'Disable dyslexia-friendly font'
        };
    }

    function initDesignToggle() {
        const navbar = document.querySelector('.steam-navbar-inner');
        if (!navbar || navbar.querySelector('.design-toggle')) return;

        const copy = getDesignToggleCopy();
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'design-toggle';
        button.innerHTML = '<span class="design-toggle-icon" aria-hidden="true"></span>';

        function syncButton() {
            const isModern = document.documentElement.dataset.design === 'modern';
            button.setAttribute('aria-pressed', String(isModern));
            button.setAttribute('aria-label', isModern ? copy.toClassic : copy.toModern);
            button.title = isModern ? copy.toClassic : copy.toModern;
        }

        button.addEventListener('click', () => {
            const nextMode = document.documentElement.dataset.design === 'modern' ? 'classic' : 'modern';
            applyDesignMode(nextMode);
            saveDesignMode(nextMode);
            syncButton();
        });

        const languageSwitch = navbar.querySelector('.language-switch');
        if (languageSwitch) {
            navbar.insertBefore(button, languageSwitch);
        } else {
            navbar.appendChild(button);
        }

        syncButton();
    }

    function initReadableFontToggle() {
        const navbar = document.querySelector('.steam-navbar-inner');
        if (!navbar || navbar.querySelector('.font-toggle')) return;

        const copy = getReadableFontToggleCopy();
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'font-toggle';
        button.innerHTML = '<span class="font-toggle-icon" aria-hidden="true">Aa</span>';

        function syncButton() {
            const enabled = document.documentElement.hasAttribute('data-readable-font');
            button.setAttribute('aria-pressed', String(enabled));
            button.setAttribute('aria-label', enabled ? copy.disable : copy.enable);
            button.title = enabled ? copy.disable : copy.enable;
        }

        button.addEventListener('click', () => {
            const enabled = !document.documentElement.hasAttribute('data-readable-font');
            applyReadableFont(enabled);
            saveReadableFont(enabled);
            syncButton();
        });

        const languageSwitch = navbar.querySelector('.language-switch');
        if (languageSwitch) {
            navbar.insertBefore(button, languageSwitch);
        } else {
            navbar.appendChild(button);
        }

        syncButton();
    }

    function slugifyHeading(text) {
        return (text || '')
            .toLowerCase()
            .trim()
            .replace(/['’"]/g, '')
            .replace(/[^a-z0-9\u0400-\u04ff\u00c0-\u024f]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }

    function initArticleToc() {
        const articleShell = document.querySelector('.article-shell');
        const article = articleShell ? articleShell.querySelector('.wiki-article') : null;
        if (!articleShell || !article) return;

        const headings = Array.from(article.querySelectorAll('h2, h3'));
        if (headings.length < 2) return;

        const locale = getLocaleInfo().lang;
        const copy = {
            en: { eyebrow: 'On this page', title: 'Jump to section' },
            ru: { eyebrow: 'На странице', title: 'Разделы статьи' },
            fr: { eyebrow: 'Sur la page', title: 'Plan de l’article' },
            de: { eyebrow: 'Auf dieser Seite', title: 'Abschnitte' }
        }[locale] || { eyebrow: 'On this page', title: 'Jump to section' };

        let articleLayout = articleShell.querySelector('.article-layout');
        if (!articleLayout) {
            articleLayout = document.createElement('div');
            articleLayout.className = 'article-layout';
            article.parentNode.insertBefore(articleLayout, article);
            articleLayout.appendChild(article);
        }

        let tocAside = articleLayout.querySelector('.article-toc');
        if (tocAside) tocAside.remove();

        tocAside = document.createElement('aside');
        tocAside.className = 'article-toc';

        const card = document.createElement('div');
        card.className = 'article-toc-card';
        card.innerHTML = `<p class="article-toc-eyebrow">${copy.eyebrow}</p><h2 class="article-toc-title">${copy.title}</h2>`;

        const list = document.createElement('ul');
        list.className = 'article-toc-list';

        let currentTopLevel = null;
        const linkMap = new Map();

        headings.forEach((heading, index) => {
            if (!heading.id) {
                const base = slugifyHeading(heading.textContent) || `section-${index + 1}`;
                let candidate = base;
                let suffix = 2;
                while (document.getElementById(candidate)) {
                    candidate = `${base}-${suffix++}`;
                }
                heading.id = candidate;
            }

            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = `#${heading.id}`;
            link.textContent = heading.textContent.trim();
            item.appendChild(link);
            linkMap.set(heading.id, link);

            if (heading.tagName === 'H2') {
                list.appendChild(item);
                currentTopLevel = item;
                return;
            }

            let sublist = currentTopLevel ? currentTopLevel.querySelector('.article-toc-sublist') : null;
            if (!sublist) {
                sublist = document.createElement('ul');
                sublist.className = 'article-toc-sublist';
                if (currentTopLevel) {
                    currentTopLevel.appendChild(sublist);
                } else {
                    list.appendChild(sublist);
                }
            }
            sublist.appendChild(item);
        });

        card.appendChild(list);
        tocAside.appendChild(card);
        articleLayout.insertBefore(tocAside, article);

        const headingObserver = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

            if (!visible.length) return;

            linkMap.forEach((anchor) => anchor.classList.remove('is-active'));
            const activeId = visible[0].target.id;
            const activeLink = linkMap.get(activeId);
            if (activeLink) activeLink.classList.add('is-active');
        }, {
            rootMargin: '-20% 0px -65% 0px',
            threshold: [0, 1]
        });

        headings.forEach((heading) => headingObserver.observe(heading));
    }

    document.addEventListener('DOMContentLoaded', () => {
        initGlobalToolLinks();
        initProjectSupportLinks();
        initDesignToggle();
        initReadableFontToggle();
        initCopyButtons();
        observeRangeInputs();
        initArticleToc();
        document.querySelectorAll('[data-slideshow]').forEach(initSlideshow);
    });
})();
