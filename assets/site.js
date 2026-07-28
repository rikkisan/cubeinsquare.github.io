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
          "customItemBuilder": {
                    "en": {
                              "toolLabel": "Custom item builder",
                              "featureTitle": "Custom item builder",
                              "featureDesc": "Assemble version-aware give commands with item_model, custom_data, lore, and CustomModelData.",
                              "catalogTitle": "Custom item builder",
                              "catalogDesc": "Assemble version-aware /give commands with visible names, lore, hidden IDs, item_model, and modern custom_model_data slots.",
                              "catalogAction": "Open builder",
                              "catalogStatus": "ready"
                    },
                    "ru": {
                              "toolLabel": "Конструктор кастомных предметов",
                              "featureTitle": "Конструктор предметов",
                              "featureDesc": "Собирает /give-команды с lore, item_model, custom_data и слотами CustomModelData.",
                              "catalogTitle": "Конструктор кастомных предметов",
                              "catalogDesc": "Собирайте /give-команды с именем, лором, скрытым ID, item_model и современными слотами custom_model_data.",
                              "catalogAction": "Открыть конструктор",
                              "catalogStatus": "готов"
                    },
                    "fr": {
                              "toolLabel": "Constructeur d’objets custom",
                              "featureTitle": "Constructeur d’objets",
                              "featureDesc": "Assemble des commandes /give avec lore, item_model, custom_data et slots CustomModelData.",
                              "catalogTitle": "Constructeur d’objets custom",
                              "catalogDesc": "Assemblez des commandes /give avec nom visible, lore, ID caché, item_model et slots modernes custom_model_data.",
                              "catalogAction": "Ouvrir l’outil",
                              "catalogStatus": "prêt"
                    },
                    "de": {
                              "toolLabel": "Custom-Item-Builder",
                              "featureTitle": "Custom-Item-Builder",
                              "featureDesc": "Erstellt /give-Befehle mit Lore, item_model, custom_data und CustomModelData-Slots.",
                              "catalogTitle": "Custom-Item-Builder",
                              "catalogDesc": "Erstelle /give-Befehle mit sichtbarem Namen, Lore, versteckter ID, item_model und modernen custom_model_data-Slots.",
                              "catalogAction": "Builder öffnen",
                              "catalogStatus": "bereit"
                    }
          },
          "skinEditor": {
                    "en": {
                              "toolLabel": "Minecraft Skin Editor",
                              "guideLabel": "Skin editor guide",
                              "featureTitle": "Skin editor",
                              "featureDesc": "Draw on the atlas or paint directly on the 3D player model.",
                              "catalogTitle": "Minecraft Skin Editor",
                              "catalogDesc": "Paint a classic skin atlas, edit the overlay layer, and work directly on the 3D player model.",
                              "catalogAction": "Open editor",
                              "catalogStatus": "ready",
                              "wikiKicker": "Editor guide",
                              "wikiTitle": "Skin editor",
                              "wikiDesc": "How the classic 64x64 layout works, how the overlay layer behaves, and how to keep skins readable from a distance.",
                              "wikiAction": "Read guide",
                              "sidebarLabel": "Skin editor"
                    },
                    "ru": {
                              "toolLabel": "Редактор скинов Minecraft",
                              "guideLabel": "Гайд по редактору скинов",
                              "featureTitle": "Редактор скинов",
                              "featureDesc": "Рисуйте по атласу или сразу по 3D-модели игрока.",
                              "catalogTitle": "Редактор скинов Minecraft",
                              "catalogDesc": "Редактируйте классический атлас, слой одежды и сразу проверяйте результат на 3D-модели.",
                              "catalogAction": "Открыть редактор",
                              "catalogStatus": "готов",
                              "wikiKicker": "Гайд по редактору",
                              "wikiTitle": "Редактор скинов",
                              "wikiDesc": "Как работает классический формат 64x64, слой одежды и читаемость скина на расстоянии.",
                              "wikiAction": "Читать гайд",
                              "sidebarLabel": "Редактор скинов"
                    },
                    "fr": {
                              "toolLabel": "Éditeur de skins Minecraft",
                              "guideLabel": "Guide de l’éditeur de skins",
                              "featureTitle": "Éditeur de skins",
                              "featureDesc": "Dessinez sur l’atlas ou directement sur le modèle 3D du joueur.",
                              "catalogTitle": "Éditeur de skins Minecraft",
                              "catalogDesc": "Peignez l’atlas classique, gérez la couche externe et vérifiez le rendu sur le modèle 3D.",
                              "catalogAction": "Ouvrir l’éditeur",
                              "catalogStatus": "prêt",
                              "wikiKicker": "Guide éditeur",
                              "wikiTitle": "Éditeur de skins",
                              "wikiDesc": "Comment fonctionne la grille 64x64, la couche externe et la lisibilité du skin à distance.",
                              "wikiAction": "Lire le guide",
                              "sidebarLabel": "Éditeur de skins"
                    },
                    "de": {
                              "toolLabel": "Minecraft Skin-Editor",
                              "guideLabel": "Skin-Editor-Anleitung",
                              "featureTitle": "Skin-Editor",
                              "featureDesc": "Male auf dem Atlas oder direkt auf dem 3D-Spielermodell.",
                              "catalogTitle": "Minecraft Skin-Editor",
                              "catalogDesc": "Bearbeite den klassischen Atlas, die Außenschicht und prüfe das Ergebnis direkt am 3D-Modell.",
                              "catalogAction": "Editor öffnen",
                              "catalogStatus": "bereit",
                              "wikiKicker": "Editor-Anleitung",
                              "wikiTitle": "Skin-Editor",
                              "wikiDesc": "Wie das 64x64-Layout, die Außenschicht und die Lesbarkeit eines Skins zusammenarbeiten.",
                              "wikiAction": "Anleitung lesen",
                              "sidebarLabel": "Skin-Editor"
                    }
          },
          "texturePainter": {
                    "en": {
                              "toolLabel": "Texture painter",
                              "guideLabel": "Texture painter guide",
                              "featureTitle": "Texture painter",
                              "featureDesc": "Choose a canvas size, paint a PNG, and send it into your pack workflow.",
                              "catalogTitle": "Texture painter",
                              "catalogDesc": "Paint item and block textures in the browser and export crisp PNGs for your pack.",
                              "catalogAction": "Open painter",
                              "catalogStatus": "ready",
                              "wikiKicker": "Editor guide",
                              "wikiTitle": "Texture painter",
                              "wikiDesc": "How canvas size, contrast, and pixel clusters affect texture readability before you export a PNG.",
                              "wikiAction": "Read guide",
                              "sidebarLabel": "Texture painter"
                    },
                    "ru": {
                              "toolLabel": "Редактор текстур",
                              "guideLabel": "Гайд по редактору текстур",
                              "featureTitle": "Редактор текстур",
                              "featureDesc": "Выберите холст, нарисуйте PNG и отправьте его в работу с ресурс-паком.",
                              "catalogTitle": "Редактор текстур",
                              "catalogDesc": "Рисуйте предметные и блочные текстуры в браузере и экспортируйте чёткие PNG для пака.",
                              "catalogAction": "Открыть редактор",
                              "catalogStatus": "готов",
                              "wikiKicker": "Гайд по редактору",
                              "wikiTitle": "Редактор текстур",
                              "wikiDesc": "Как размер холста, контраст и пиксельные кластеры влияют на читаемость текстуры до экспорта PNG.",
                              "wikiAction": "Читать гайд",
                              "sidebarLabel": "Редактор текстур"
                    },
                    "fr": {
                              "toolLabel": "Éditeur de textures",
                              "guideLabel": "Guide de l’éditeur de textures",
                              "featureTitle": "Éditeur de textures",
                              "featureDesc": "Choisissez un canevas, peignez un PNG et envoyez-le dans votre workflow de pack.",
                              "catalogTitle": "Éditeur de textures",
                              "catalogDesc": "Peignez des textures d’objets et de blocs dans le navigateur puis exportez des PNG nets pour votre pack.",
                              "catalogAction": "Ouvrir l’éditeur",
                              "catalogStatus": "prêt",
                              "wikiKicker": "Guide éditeur",
                              "wikiTitle": "Éditeur de textures",
                              "wikiDesc": "Comment la taille du canevas, le contraste et les clusters de pixels changent la lisibilité avant l’export PNG.",
                              "wikiAction": "Lire le guide",
                              "sidebarLabel": "Éditeur de textures"
                    },
                    "de": {
                              "toolLabel": "Textur-Editor",
                              "guideLabel": "Textur-Editor-Anleitung",
                              "featureTitle": "Textur-Editor",
                              "featureDesc": "Wähle eine Leinwandgröße, male ein PNG und sende es in deinen Pack-Workflow.",
                              "catalogTitle": "Textur-Editor",
                              "catalogDesc": "Male Item- und Blocktexturen im Browser und exportiere scharfe PNGs für dein Pack.",
                              "catalogAction": "Editor öffnen",
                              "catalogStatus": "bereit",
                              "wikiKicker": "Editor-Anleitung",
                              "wikiTitle": "Textur-Editor",
                              "wikiDesc": "Wie Leinwandgröße, Kontrast und Pixel-Cluster die Lesbarkeit einer Textur vor dem PNG-Export beeinflussen.",
                              "wikiAction": "Anleitung lesen",
                              "sidebarLabel": "Textur-Editor"
                    }
          },
          "itemModelBuilder": {
                    "en": {
                              "toolLabel": "Item model builder",
                              "guideLabel": "Item model builder guide",
                              "featureTitle": "Item model builder",
                              "featureDesc": "Build item definition JSON with model, select, range_dispatch, and condition branches.",
                              "catalogTitle": "Item model builder",
                              "catalogDesc": "Assemble 1.21.4+ item definition JSON with model, select, range_dispatch, and condition branches.",
                              "catalogAction": "Open builder",
                              "catalogStatus": "new",
                              "wikiKicker": "Builder guide",
                              "wikiTitle": "Item model builder",
                              "wikiDesc": "When to use model, select, range_dispatch, or condition and how to wire them into the items folder cleanly.",
                              "wikiAction": "Read guide",
                              "sidebarLabel": "Item model builder"
                    },
                    "ru": {
                              "toolLabel": "Конструктор item_model",
                              "guideLabel": "Гайд по item_model",
                              "featureTitle": "Конструктор item_model",
                              "featureDesc": "Собирает JSON item definition с ветками model, select, range_dispatch и condition.",
                              "catalogTitle": "Конструктор item_model",
                              "catalogDesc": "Собирайте JSON для новых item definitions в 1.21.4+ с ветками model, select, range_dispatch и condition.",
                              "catalogAction": "Открыть конструктор",
                              "catalogStatus": "новое",
                              "wikiKicker": "Гайд по конструктору",
                              "wikiTitle": "Конструктор item_model",
                              "wikiDesc": "Когда использовать model, select, range_dispatch и condition и как аккуратно положить это в папку items.",
                              "wikiAction": "Читать гайд",
                              "sidebarLabel": "Конструктор item_model"
                    },
                    "fr": {
                              "toolLabel": "Constructeur item_model",
                              "guideLabel": "Guide du constructeur item_model",
                              "featureTitle": "Constructeur item_model",
                              "featureDesc": "Assemble du JSON item definition avec les branches model, select, range_dispatch et condition.",
                              "catalogTitle": "Constructeur item_model",
                              "catalogDesc": "Créez le JSON des item definitions 1.21.4+ avec model, select, range_dispatch et condition.",
                              "catalogAction": "Ouvrir l’outil",
                              "catalogStatus": "nouveau",
                              "wikiKicker": "Guide builder",
                              "wikiTitle": "Constructeur item_model",
                              "wikiDesc": "Quand utiliser model, select, range_dispatch et condition, et comment les ranger proprement dans le dossier items.",
                              "wikiAction": "Lire le guide",
                              "sidebarLabel": "Constructeur item_model"
                    },
                    "de": {
                              "toolLabel": "item_model-Builder",
                              "guideLabel": "item_model-Builder-Anleitung",
                              "featureTitle": "item_model-Builder",
                              "featureDesc": "Erstellt Item-Definition-JSON mit model-, select-, range_dispatch- und condition-Zweigen.",
                              "catalogTitle": "item_model-Builder",
                              "catalogDesc": "Erstelle 1.21.4+-Item-Definitionen mit model, select, range_dispatch und condition.",
                              "catalogAction": "Builder öffnen",
                              "catalogStatus": "neu",
                              "wikiKicker": "Builder-Anleitung",
                              "wikiTitle": "item_model-Builder",
                              "wikiDesc": "Wann model, select, range_dispatch oder condition sinnvoll sind und wie die Datei sauber im items-Ordner landet.",
                              "wikiAction": "Anleitung lesen",
                              "sidebarLabel": "item_model-Builder"
                    }
          },
          "customItemCatalog": {
                    "en": {
                              "toolLabel": "Custom item catalog",
                              "guideLabel": "Custom item catalog guide",
                              "featureTitle": "Custom item catalog",
                              "featureDesc": "Track IDs, base items, visual hooks, and notes for your server-side item library.",
                              "catalogTitle": "Custom item catalog",
                              "catalogDesc": "Keep a local registry of hidden IDs, base items, item_model hooks, lore notes, and duplicate checks.",
                              "catalogAction": "Open catalog",
                              "catalogStatus": "new",
                              "wikiKicker": "Workflow guide",
                              "wikiTitle": "Custom item catalog",
                              "wikiDesc": "How to keep IDs, display names, base items, and pack hooks readable once your server starts shipping more than ten items.",
                              "wikiAction": "Read guide",
                              "sidebarLabel": "Custom item catalog"
                    },
                    "ru": {
                              "toolLabel": "Каталог кастомных предметов",
                              "guideLabel": "Гайд по каталогу предметов",
                              "featureTitle": "Каталог предметов",
                              "featureDesc": "Хранит ID, базовые предметы, визуальные хуки и заметки для вашей библиотеки вещей.",
                              "catalogTitle": "Каталог кастомных предметов",
                              "catalogDesc": "Ведите локальный реестр скрытых ID, базовых предметов, item_model-хуков, заметок и конфликтов.",
                              "catalogAction": "Открыть каталог",
                              "catalogStatus": "новое",
                              "wikiKicker": "Гайд по workflow",
                              "wikiTitle": "Каталог кастомных предметов",
                              "wikiDesc": "Как не утонуть в ID, названиях, базовых предметах и pack-хуках, когда предметов становится много.",
                              "wikiAction": "Читать гайд",
                              "sidebarLabel": "Каталог предметов"
                    },
                    "fr": {
                              "toolLabel": "Catalogue d’objets custom",
                              "guideLabel": "Guide du catalogue d’objets",
                              "featureTitle": "Catalogue d’objets",
                              "featureDesc": "Garde les IDs, objets de base, hooks visuels et notes de votre bibliothèque d’objets.",
                              "catalogTitle": "Catalogue d’objets custom",
                              "catalogDesc": "Gardez un registre local des IDs cachés, objets de base, hooks item_model, notes et conflits.",
                              "catalogAction": "Ouvrir le catalogue",
                              "catalogStatus": "nouveau",
                              "wikiKicker": "Guide workflow",
                              "wikiTitle": "Catalogue d’objets custom",
                              "wikiDesc": "Comment garder des IDs, noms visibles, objets de base et hooks de pack lisibles quand votre serveur multiplie les items.",
                              "wikiAction": "Lire le guide",
                              "sidebarLabel": "Catalogue d’objets"
                    },
                    "de": {
                              "toolLabel": "Katalog für Custom-Items",
                              "guideLabel": "Anleitung zum Item-Katalog",
                              "featureTitle": "Custom-Item-Katalog",
                              "featureDesc": "Verwaltet IDs, Basisitems, visuelle Hooks und Notizen für eure Item-Bibliothek.",
                              "catalogTitle": "Katalog für Custom-Items",
                              "catalogDesc": "Pflege lokal versteckte IDs, Basisitems, item_model-Hooks, Notizen und Dublettenprüfungen.",
                              "catalogAction": "Katalog öffnen",
                              "catalogStatus": "neu",
                              "wikiKicker": "Workflow-Anleitung",
                              "wikiTitle": "Katalog für Custom-Items",
                              "wikiDesc": "Wie ihr IDs, Anzeigenamen, Basisitems und Pack-Hooks lesbar haltet, sobald euer Server mehr als ein paar Sonderitems hat.",
                              "wikiAction": "Anleitung lesen",
                              "sidebarLabel": "Custom-Item-Katalog"
                    }
          },
          "circleDomePlanner": {
                    "en": {
                              "toolLabel": "Circle & dome planner",
                              "guideLabel": "Circle & dome planner guide",
                              "featureTitle": "Circle & dome planner",
                              "featureDesc": "Plan circles, rings, arches, and dome profiles before you place the first block.",
                              "catalogTitle": "Circle & dome planner",
                              "catalogDesc": "Work out circles, thick rings, arches, and dome profiles in a lighter companion to the sphere generator.",
                              "catalogAction": "Open planner",
                              "catalogStatus": "new",
                              "wikiKicker": "Planning guide",
                              "wikiTitle": "Circle & dome planner",
                              "wikiDesc": "How to lock the footprint first, use a ring thickness intentionally, and switch from a 2D plan to a dome profile without guessing.",
                              "wikiAction": "Read guide",
                              "sidebarLabel": "Circle & dome planner"
                    },
                    "ru": {
                              "toolLabel": "Планировщик кругов и куполов",
                              "guideLabel": "Гайд по кругам и куполам",
                              "featureTitle": "Планировщик кругов и куполов",
                              "featureDesc": "Помогает планировать круги, кольца, арки и купольные профили до первого блока.",
                              "catalogTitle": "Планировщик кругов и куполов",
                              "catalogDesc": "Лёгкий companion к генератору сфер для кругов, толстых колец, арок и профилей купола.",
                              "catalogAction": "Открыть планировщик",
                              "catalogStatus": "новое",
                              "wikiKicker": "Гайд по планированию",
                              "wikiTitle": "Планировщик кругов и куполов",
                              "wikiDesc": "Как сначала поймать отпечаток, осознанно выбрать толщину кольца и перейти от 2D-плана к купольному профилю без угадывания.",
                              "wikiAction": "Читать гайд",
                              "sidebarLabel": "Круги и купола"
                    },
                    "fr": {
                              "toolLabel": "Planificateur de cercles et dômes",
                              "guideLabel": "Guide des cercles et dômes",
                              "featureTitle": "Planificateur de cercles et dômes",
                              "featureDesc": "Planifie cercles, anneaux, arches et profils de dôme avant de poser le premier bloc.",
                              "catalogTitle": "Planificateur de cercles et dômes",
                              "catalogDesc": "Un compagnon plus léger que le générateur de sphères pour cercles, anneaux épais, arches et profils de dôme.",
                              "catalogAction": "Ouvrir le planificateur",
                              "catalogStatus": "nouveau",
                              "wikiKicker": "Guide de planification",
                              "wikiTitle": "Planificateur de cercles et dômes",
                              "wikiDesc": "Comment verrouiller l’empreinte d’abord, choisir l’épaisseur d’un anneau et passer d’un plan 2D à un profil de dôme sans improviser.",
                              "wikiAction": "Lire le guide",
                              "sidebarLabel": "Cercles et dômes"
                    },
                    "de": {
                              "toolLabel": "Kreis- und Kuppelplaner",
                              "guideLabel": "Kreis- und Kuppelplaner-Anleitung",
                              "featureTitle": "Kreis- und Kuppelplaner",
                              "featureDesc": "Plant Kreise, Ringe, Bögen und Kuppelprofile, bevor der erste Block gesetzt wird.",
                              "catalogTitle": "Kreis- und Kuppelplaner",
                              "catalogDesc": "Ein leichter Begleiter zum Kugelgenerator für Kreise, dicke Ringe, Bögen und Kuppelprofile.",
                              "catalogAction": "Planer öffnen",
                              "catalogStatus": "neu",
                              "wikiKicker": "Planungs-Anleitung",
                              "wikiTitle": "Kreis- und Kuppelplaner",
                              "wikiDesc": "Wie ihr zuerst die Grundfläche festlegt, Ringstärke bewusst einsetzt und von einem 2D-Plan zu einem Kuppelprofil wechselt.",
                              "wikiAction": "Anleitung lesen",
                              "sidebarLabel": "Kreise und Kuppeln"
                    }
          },
          "bookLetterBuilder": {
                    "en": {
                              "toolLabel": "Book & letter builder",
                              "guideLabel": "Book & letter builder guide",
                              "featureTitle": "Book & letter builder",
                              "featureDesc": "Build written books, letters, notes, contracts, and readable page layouts for Minecraft with modern and legacy give commands.",
                              "catalogTitle": "Book & letter builder",
                              "catalogDesc": "Build written books, letters, notes, contracts, and readable page layouts for Minecraft with modern and legacy give commands.",
                              "catalogAction": "Open builder",
                              "catalogStatus": "new",
                              "wikiKicker": "Builder guide",
                              "wikiTitle": "Book & letter builder",
                              "wikiDesc": "Build written books, letters, notes, contracts, and readable page layouts for Minecraft with modern and legacy give commands.",
                              "wikiAction": "Read guide",
                              "sidebarLabel": "Book & letter builder"
                    },
                    "ru": {
                              "toolLabel": "Конструктор книг и писем",
                              "guideLabel": "Гайд по книгам и письмам",
                              "featureTitle": "Конструктор книг и писем",
                              "featureDesc": "Собирайте written books, письма, записки, контракты и команды выдачи книг для новых и старых версий Minecraft.",
                              "catalogTitle": "Конструктор книг и писем",
                              "catalogDesc": "Собирайте written books, письма, записки, контракты и команды выдачи книг для новых и старых версий Minecraft.",
                              "catalogAction": "Открыть конструктор",
                              "catalogStatus": "новое",
                              "wikiKicker": "Гайд по конструктору",
                              "wikiTitle": "Конструктор книг и писем",
                              "wikiDesc": "Собирайте written books, письма, записки, контракты и команды выдачи книг для новых и старых версий Minecraft.",
                              "wikiAction": "Читать гайд",
                              "sidebarLabel": "Конструктор книг и писем"
                    },
                    "fr": {
                              "toolLabel": "Constructeur de livres et lettres",
                              "guideLabel": "Guide du constructeur de livres et lettres",
                              "featureTitle": "Constructeur de livres et lettres",
                              "featureDesc": "Créez des livres écrits, lettres, contrats et commandes /give pour les versions modernes et anciennes de Minecraft.",
                              "catalogTitle": "Constructeur de livres et lettres",
                              "catalogDesc": "Créez des livres écrits, lettres, contrats et commandes /give pour les versions modernes et anciennes de Minecraft.",
                              "catalogAction": "Ouvrir l’outil",
                              "catalogStatus": "nouveau",
                              "wikiKicker": "Guide builder",
                              "wikiTitle": "Constructeur de livres et lettres",
                              "wikiDesc": "Créez des livres écrits, lettres, contrats et commandes /give pour les versions modernes et anciennes de Minecraft.",
                              "wikiAction": "Lire le guide",
                              "sidebarLabel": "Constructeur de livres et lettres"
                    },
                    "de": {
                              "toolLabel": "Buch- und Brief-Builder",
                              "guideLabel": "Buch- und Brief-Builder-Anleitung",
                              "featureTitle": "Buch- und Brief-Builder",
                              "featureDesc": "Erstelle geschriebene Bücher, Briefe, Verträge und /give-Befehle für moderne und ältere Minecraft-Versionen.",
                              "catalogTitle": "Buch- und Brief-Builder",
                              "catalogDesc": "Erstelle geschriebene Bücher, Briefe, Verträge und /give-Befehle für moderne und ältere Minecraft-Versionen.",
                              "catalogAction": "Builder öffnen",
                              "catalogStatus": "neu",
                              "wikiKicker": "Builder-Anleitung",
                              "wikiTitle": "Buch- und Brief-Builder",
                              "wikiDesc": "Erstelle geschriebene Bücher, Briefe, Verträge und /give-Befehle für moderne und ältere Minecraft-Versionen.",
                              "wikiAction": "Anleitung lesen",
                              "sidebarLabel": "Buch- und Brief-Builder"
                    }
          },
          "dialogueBuilder": {
                    "en": {
                              "toolLabel": "Dialogue builder",
                              "guideLabel": "Dialogue builder guide",
                              "featureTitle": "Dialogue builder",
                              "featureDesc": "Build NPC lines, narration, actionbars, and title beats for Minecraft scenes without hand-writing every tellraw object.",
                              "catalogTitle": "Dialogue builder",
                              "catalogDesc": "Build NPC lines, narration, actionbars, and title beats for Minecraft scenes without hand-writing every tellraw object.",
                              "catalogAction": "Open builder",
                              "catalogStatus": "new",
                              "wikiKicker": "Builder guide",
                              "wikiTitle": "Dialogue builder",
                              "wikiDesc": "Build tellraw lines, titles, subtitles, and actionbars for Minecraft scenes without losing readability or pacing.",
                              "wikiAction": "Read guide",
                              "sidebarLabel": "Dialogue builder"
                    },
                    "ru": {
                              "toolLabel": "Конструктор диалогов",
                              "guideLabel": "Гайд по конструктору диалогов",
                              "featureTitle": "Конструктор диалогов",
                              "featureDesc": "Собирает реплики NPC, narration, actionbar и title-моменты для сцен Minecraft без ручной возни с tellraw JSON.",
                              "catalogTitle": "Конструктор диалогов",
                              "catalogDesc": "Собирает реплики NPC, narration, actionbar и title-моменты для сцен Minecraft без ручной возни с tellraw JSON.",
                              "catalogAction": "Открыть конструктор",
                              "catalogStatus": "новое",
                              "wikiKicker": "Гайд по конструктору",
                              "wikiTitle": "Конструктор диалогов",
                              "wikiDesc": "Собирайте tellraw-реплики, title, subtitle и actionbar для сцен Minecraft без потери читаемости и ритма.",
                              "wikiAction": "Читать гайд",
                              "sidebarLabel": "Конструктор диалогов"
                    },
                    "fr": {
                              "toolLabel": "Constructeur de dialogues",
                              "guideLabel": "Guide du constructeur de dialogues",
                              "featureTitle": "Constructeur de dialogues",
                              "featureDesc": "Crée des répliques de PNJ, de la narration, des actionbars et des moments en title pour Minecraft sans écrire chaque tellraw à la main.",
                              "catalogTitle": "Constructeur de dialogues",
                              "catalogDesc": "Crée des répliques de PNJ, de la narration, des actionbars et des moments en title pour Minecraft sans écrire chaque tellraw à la main.",
                              "catalogAction": "Ouvrir l’outil",
                              "catalogStatus": "nouveau",
                              "wikiKicker": "Guide builder",
                              "wikiTitle": "Constructeur de dialogues",
                              "wikiDesc": "Créez des répliques tellraw, des titles, des subtitles et des actionbars pour vos scènes Minecraft sans perdre en lisibilité ni en rythme.",
                              "wikiAction": "Lire le guide",
                              "sidebarLabel": "Constructeur de dialogues"
                    },
                    "de": {
                              "toolLabel": "Dialog-Builder",
                              "guideLabel": "Dialog-Builder-Anleitung",
                              "featureTitle": "Dialog-Builder",
                              "featureDesc": "Erstellt NPC-Zeilen, Erzählertext, Actionbars und Title-Momente für Minecraft, ohne jedes tellraw von Hand zu schreiben.",
                              "catalogTitle": "Dialog-Builder",
                              "catalogDesc": "Erstellt NPC-Zeilen, Erzählertext, Actionbars und Title-Momente für Minecraft, ohne jedes tellraw von Hand zu schreiben.",
                              "catalogAction": "Builder öffnen",
                              "catalogStatus": "neu",
                              "wikiKicker": "Builder-Anleitung",
                              "wikiTitle": "Dialog-Builder",
                              "wikiDesc": "Erstelle Tellraw-Zeilen, Titles, Subtitles und Actionbars für Minecraft-Szenen, ohne Lesbarkeit und Takt zu verlieren.",
                              "wikiAction": "Anleitung lesen",
                              "sidebarLabel": "Dialog-Builder"
                    }
          },
          "bossbarBuilder": {
                    "en": {
                              "toolLabel": "Bossbar builder",
                              "guideLabel": "Bossbar builder guide",
                              "featureTitle": "Bossbar builder",
                              "featureDesc": "Build Minecraft bossbar commands for events, phases, timers, rituals, and server alerts without hand-writing every command.",
                              "catalogTitle": "Bossbar builder",
                              "catalogDesc": "Build Minecraft bossbar commands for events, phases, timers, rituals, and server alerts without hand-writing every command.",
                              "catalogAction": "Open builder",
                              "catalogStatus": "new",
                              "wikiKicker": "Builder guide",
                              "wikiTitle": "Bossbar builder",
                              "wikiDesc": "A practical guide to bossbar command structure, progress values, colors, and readable event pacing.",
                              "wikiAction": "Read guide",
                              "sidebarLabel": "Bossbar builder"
                    },
                    "ru": {
                              "toolLabel": "Генератор bossbar",
                              "guideLabel": "Гайд по bossbar",
                              "featureTitle": "Генератор bossbar",
                              "featureDesc": "Собирайте команды bossbar для событий, фаз, таймеров, ритуалов и серверных предупреждений без ручной сборки каждой команды.",
                              "catalogTitle": "Генератор bossbar",
                              "catalogDesc": "Собирайте команды bossbar для событий, фаз, таймеров, ритуалов и серверных предупреждений без ручной сборки каждой команды.",
                              "catalogAction": "Открыть конструктор",
                              "catalogStatus": "новое",
                              "wikiKicker": "Гайд по конструктору",
                              "wikiTitle": "Генератор bossbar",
                              "wikiDesc": "Практический гайд по командам bossbar, значениям прогресса, цветам и читаемому ритму событий.",
                              "wikiAction": "Читать гайд",
                              "sidebarLabel": "Генератор bossbar"
                    },
                    "fr": {
                              "toolLabel": "Générateur de bossbar",
                              "guideLabel": "Guide du générateur de bossbar",
                              "featureTitle": "Générateur de bossbar",
                              "featureDesc": "Créez des commandes bossbar Minecraft pour événements, phases, minuteurs, rituels et alertes serveur sans tout écrire à la main.",
                              "catalogTitle": "Générateur de bossbar",
                              "catalogDesc": "Créez des commandes bossbar Minecraft pour événements, phases, minuteurs, rituels et alertes serveur sans tout écrire à la main.",
                              "catalogAction": "Ouvrir l’outil",
                              "catalogStatus": "nouveau",
                              "wikiKicker": "Guide builder",
                              "wikiTitle": "Générateur de bossbar",
                              "wikiDesc": "Guide pratique sur les commandes bossbar, les valeurs de progression, les couleurs et le rythme lisible d’un événement.",
                              "wikiAction": "Lire le guide",
                              "sidebarLabel": "Générateur de bossbar"
                    },
                    "de": {
                              "toolLabel": "Bossbar-Builder",
                              "guideLabel": "Bossbar-Builder-Anleitung",
                              "featureTitle": "Bossbar-Builder",
                              "featureDesc": "Erstelle Minecraft-Bossbar-Befehle für Events, Phasen, Timer, Rituale und Serverwarnungen, ohne jede Zeile von Hand zu schreiben.",
                              "catalogTitle": "Bossbar-Builder",
                              "catalogDesc": "Erstelle Minecraft-Bossbar-Befehle für Events, Phasen, Timer, Rituale und Serverwarnungen, ohne jede Zeile von Hand zu schreiben.",
                              "catalogAction": "Builder öffnen",
                              "catalogStatus": "neu",
                              "wikiKicker": "Builder-Anleitung",
                              "wikiTitle": "Bossbar-Builder",
                              "wikiDesc": "Praktischer Leitfaden zu Bossbar-Befehlen, Fortschrittswerten, Farben und lesbarem Event-Pacing.",
                              "wikiAction": "Anleitung lesen",
                              "sidebarLabel": "Bossbar-Builder"
                    }
          },
"datapackGenerator": {
          "en": {
                    "toolLabel": "Data pack generator",
                    "guideLabel": "Data pack guide",
                    "featureTitle": "Data pack generator",
                    "featureDesc": "Build a ready-to-install pack with the right pack_format and the right 1.21+ folder names.",
                    "catalogTitle": "Data pack generator",
                    "catalogDesc": "Loot tables, recipes and advancements are files, not commands. This builds the folder that holds them, correct for your version.",
                    "catalogAction": "Open generator",
                    "catalogStatus": "new",
                    "wikiKicker": "Concept guide",
                    "wikiTitle": "Data packs vs commands",
                    "wikiDesc": "Why loot tables and recipes cannot be made with a command, and the 1.21 folder rename that silently breaks packs.",
                    "wikiAction": "Read guide",
                    "sidebarLabel": "Data pack generator"
          },
          "ru": {
                    "toolLabel": "Генератор датапаков",
                    "guideLabel": "Гайд по датапакам",
                    "featureTitle": "Генератор датапаков",
                    "featureDesc": "Собирает готовый пак с правильным pack_format и правильными именами папок для 1.21+.",
                    "catalogTitle": "Генератор датапаков",
                    "catalogDesc": "Loot-таблицы, рецепты и ачивки — это файлы, а не команды. Инструмент собирает папку под них, корректную для вашей версии.",
                    "catalogAction": "Открыть генератор",
                    "catalogStatus": "новое",
                    "wikiKicker": "Гайд по концепции",
                    "wikiTitle": "Датапаки против команд",
                    "wikiDesc": "Почему loot-таблицу и рецепт нельзя сделать командой, и переименование папок в 1.21, которое тихо ломает паки.",
                    "wikiAction": "Читать гайд",
                    "sidebarLabel": "Генератор датапаков"
          },
          "fr": {
                    "toolLabel": "Générateur de data packs",
                    "guideLabel": "Guide des data packs",
                    "featureTitle": "Générateur de data packs",
                    "featureDesc": "Crée un pack prêt à installer avec le bon pack_format et les bons noms de dossiers pour 1.21+.",
                    "catalogTitle": "Générateur de data packs",
                    "catalogDesc": "Les tables de butin, recettes et progrès sont des fichiers, pas des commandes. Cet outil construit le dossier qui les contient.",
                    "catalogAction": "Ouvrir le générateur",
                    "catalogStatus": "nouveau",
                    "wikiKicker": "Guide conceptuel",
                    "wikiTitle": "Data packs contre commandes",
                    "wikiDesc": "Pourquoi une table de butin ne se crée pas avec une commande, et le renommage de dossiers en 1.21.",
                    "wikiAction": "Lire le guide",
                    "sidebarLabel": "Générateur de data packs"
          },
          "de": {
                    "toolLabel": "Datapack-Generator",
                    "guideLabel": "Datapack-Anleitung",
                    "featureTitle": "Datapack-Generator",
                    "featureDesc": "Erstellt ein installationsfertiges Pack mit korrektem pack_format und den richtigen Ordnernamen für 1.21+.",
                    "catalogTitle": "Datapack-Generator",
                    "catalogDesc": "Loot-Tabellen, Rezepte und Fortschritte sind Dateien, keine Befehle. Dieses Werkzeug baut den passenden Ordner dafür.",
                    "catalogAction": "Generator öffnen",
                    "catalogStatus": "neu",
                    "wikiKicker": "Konzept-Anleitung",
                    "wikiTitle": "Datapacks statt Befehle",
                    "wikiDesc": "Warum sich Loot-Tabellen nicht per Befehl erstellen lassen, und die Ordner-Umbenennung in 1.21.",
                    "wikiAction": "Anleitung lesen",
                    "sidebarLabel": "Datapack-Generator"
          }
},
"lootTableGenerator": {
          "en": {
                    "toolLabel": "Loot table generator",
                    "guideLabel": "Loot table guide",
                    "featureTitle": "Loot table generator",
                    "featureDesc": "Build chest, mob and fishing loot with pools, weights and count ranges.",
                    "catalogTitle": "Loot table generator",
                    "catalogDesc": "Build the JSON behind chest loot, mob drops and fishing catches, with the data pack path to save it at.",
                    "catalogAction": "Open generator",
                    "catalogStatus": "new",
                    "wikiKicker": "Mechanics guide",
                    "wikiTitle": "How loot tables roll",
                    "wikiDesc": "Pools, rolls and number providers, and why a weight of 10 is not a 10% chance.",
                    "wikiAction": "Read guide",
                    "sidebarLabel": "Loot table generator"
          },
          "ru": {
                    "toolLabel": "Генератор loot-таблиц",
                    "guideLabel": "Гайд по loot-таблицам",
                    "featureTitle": "Генератор loot-таблиц",
                    "featureDesc": "Собирайте добычу сундуков, мобов и рыбалки: пулы, веса и диапазоны количества.",
                    "catalogTitle": "Генератор loot-таблиц",
                    "catalogDesc": "Собирайте JSON для содержимого сундуков, дропа с мобов и улова, с готовым путём внутри датапака.",
                    "catalogAction": "Открыть генератор",
                    "catalogStatus": "новое",
                    "wikiKicker": "Гайд по механике",
                    "wikiTitle": "Как разыгрываются loot-таблицы",
                    "wikiDesc": "Пулы, роллы и number provider, и почему вес 10 это не шанс 10%.",
                    "wikiAction": "Читать гайд",
                    "sidebarLabel": "Генератор loot-таблиц"
          },
          "fr": {
                    "toolLabel": "Générateur de tables de butin",
                    "guideLabel": "Guide des tables de butin",
                    "featureTitle": "Générateur de tables de butin",
                    "featureDesc": "Créez le butin des coffres, monstres et pêche : pools, poids et quantités.",
                    "catalogTitle": "Générateur de tables de butin",
                    "catalogDesc": "Créez le JSON derrière le butin des coffres, les drops de monstres et la pêche, avec le chemin où l’enregistrer.",
                    "catalogAction": "Ouvrir le générateur",
                    "catalogStatus": "nouveau",
                    "wikiKicker": "Guide des mécaniques",
                    "wikiTitle": "Comment se tirent les tables de butin",
                    "wikiDesc": "Pools, tirages et number providers, et pourquoi un poids de 10 n’est pas 10 %.",
                    "wikiAction": "Lire le guide",
                    "sidebarLabel": "Générateur de tables de butin"
          },
          "de": {
                    "toolLabel": "Loot-Tabellen-Generator",
                    "guideLabel": "Loot-Tabellen-Anleitung",
                    "featureTitle": "Loot-Tabellen-Generator",
                    "featureDesc": "Erstelle Truhen-, Mob- und Angel-Loot mit Pools, Gewichten und Mengenbereichen.",
                    "catalogTitle": "Loot-Tabellen-Generator",
                    "catalogDesc": "Erstelle das JSON hinter Truhen-Loot, Mob-Drops und Angel-Fängen, samt Pfad im Datapack.",
                    "catalogAction": "Generator öffnen",
                    "catalogStatus": "neu",
                    "wikiKicker": "Mechanik-Anleitung",
                    "wikiTitle": "Wie Loot-Tabellen würfeln",
                    "wikiDesc": "Pools, Rolls und Number Provider, und warum Gewicht 10 keine 10-%-Chance ist.",
                    "wikiAction": "Anleitung lesen",
                    "sidebarLabel": "Loot-Tabellen-Generator"
          }
},
"recipeGenerator": {
          "en": {
                    "toolLabel": "Recipe generator",
                    "guideLabel": "Recipe guide",
                    "featureTitle": "Recipe generator",
                    "featureDesc": "Lay a shaped recipe out on a grid and get the pattern, key and result as JSON.",
                    "catalogTitle": "Recipe generator",
                    "catalogDesc": "Build crafting, smelting and stonecutting JSON in the format your game version expects.",
                    "catalogAction": "Open generator",
                    "catalogStatus": "new",
                    "wikiKicker": "Mechanics guide",
                    "wikiTitle": "Why a recipe does not show up",
                    "wikiDesc": "Pattern padding, item tags, and the two format changes that break copied examples.",
                    "wikiAction": "Read guide",
                    "sidebarLabel": "Recipe generator"
          },
          "ru": {
                    "toolLabel": "Генератор рецептов",
                    "guideLabel": "Гайд по рецептам",
                    "featureTitle": "Генератор рецептов",
                    "featureDesc": "Разложите рецепт на сетке и получите паттерн, ключи и результат в виде JSON.",
                    "catalogTitle": "Генератор рецептов",
                    "catalogDesc": "Собирайте JSON крафта, переплавки и камнереза в формате под вашу версию игры.",
                    "catalogAction": "Открыть генератор",
                    "catalogStatus": "новое",
                    "wikiKicker": "Гайд по механике",
                    "wikiTitle": "Почему рецепт не появляется",
                    "wikiDesc": "Лишние ряды в паттерне, теги предметов и два изменения формата.",
                    "wikiAction": "Читать гайд",
                    "sidebarLabel": "Генератор рецептов"
          },
          "fr": {
                    "toolLabel": "Générateur de recettes",
                    "guideLabel": "Guide des recettes",
                    "featureTitle": "Générateur de recettes",
                    "featureDesc": "Disposez une recette sur une grille et obtenez motif, clés et résultat en JSON.",
                    "catalogTitle": "Générateur de recettes",
                    "catalogDesc": "Créez le JSON d’artisanat, de cuisson et de tailleuse au format de votre version.",
                    "catalogAction": "Ouvrir le générateur",
                    "catalogStatus": "nouveau",
                    "wikiKicker": "Guide des mécaniques",
                    "wikiTitle": "Pourquoi une recette n’apparaît pas",
                    "wikiDesc": "Le remplissage du motif, les tags d’objets et les deux changements de format.",
                    "wikiAction": "Lire le guide",
                    "sidebarLabel": "Générateur de recettes"
          },
          "de": {
                    "toolLabel": "Rezept-Generator",
                    "guideLabel": "Rezept-Anleitung",
                    "featureTitle": "Rezept-Generator",
                    "featureDesc": "Lege ein Rezept auf einem Raster aus und erhalte Muster, Schlüssel und Ergebnis als JSON.",
                    "catalogTitle": "Rezept-Generator",
                    "catalogDesc": "Erstelle Handwerks-, Schmelz- und Steinsäge-JSON im Format deiner Spielversion.",
                    "catalogAction": "Generator öffnen",
                    "catalogStatus": "neu",
                    "wikiKicker": "Mechanik-Anleitung",
                    "wikiTitle": "Warum ein Rezept nicht auftaucht",
                    "wikiDesc": "Aufgefüllte Muster, Item-Tags und die zwei Formatwechsel.",
                    "wikiAction": "Anleitung lesen",
                    "sidebarLabel": "Rezept-Generator"
          }
}
};
        const meta = {
          "customItemBuilder": {
                    "path": "/custom-item-builder/",
                    "guidePath": null,
                    "sectionId": null
          },
          "skinEditor": {
                    "path": "/skin-editor/",
                    "guidePath": "/wiki-skin-editor/",
                    "sectionId": "resource-pack-generator-wiki"
          },
          "texturePainter": {
                    "path": "/texture-painter/",
                    "guidePath": "/wiki-texture-painter/",
                    "sectionId": "resource-pack-generator-wiki"
          },
          "itemModelBuilder": {
                    "path": "/item-model-builder/",
                    "guidePath": "/wiki-item-model-builder/",
                    "sectionId": "how-to-guides"
          },
          "customItemCatalog": {
                    "path": "/custom-item-catalog/",
                    "guidePath": "/wiki-custom-item-catalog/",
                    "sectionId": "how-to-guides"
          },
          "circleDomePlanner": {
                    "path": "/circle-dome-planner/",
                    "guidePath": "/wiki-circle-dome-planner/",
                    "sectionId": "resource-pack-generator-wiki"
          },
          "bookLetterBuilder": {
                    "path": "/book-letter-builder/",
                    "guidePath": "/wiki-book-letter-builder/",
                    "sectionId": "how-to-guides"
          },
          "dialogueBuilder": {
                    "path": "/dialogue-builder/",
                    "guidePath": "/wiki-dialogue-builder/",
                    "sectionId": "how-to-guides"
          },
          "bossbarBuilder": {
                    "path": "/bossbar-builder/",
                    "guidePath": "/wiki-bossbar-builder/",
                    "sectionId": "how-to-guides"
          },
"datapackGenerator": {
          "path": "/datapack-generator/",
          "guidePath": "/wiki-datapack-generator/",
          "sectionId": "how-to-guides"
},
"lootTableGenerator": {
          "path": "/loot-table-generator/",
          "guidePath": "/wiki-loot-table-generator/",
          "sectionId": "how-to-guides"
},
"recipeGenerator": {
          "path": "/recipe-generator/",
          "guidePath": "/wiki-recipe-generator/",
          "sectionId": "how-to-guides"
}
};
        const tools = Object.keys(meta).map((key) => {
            const copy = labels[key][locale] || labels[key].en || labels[key].ru || labels[key].fr || labels[key].de;
            return {
                key,
                toolHref: withPrefix(meta[key].path),
                guideHref: meta[key].guidePath ? withPrefix(meta[key].guidePath) : null,
                sectionId: meta[key].sectionId || null,
                ...copy
            };
        });

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
                if (!tool.featureTitle || !tool.featureDesc) return;
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
            if (!sublist) return;
            tools.filter((tool) => tool.guideHref).forEach((tool) => {
                if (sublist.querySelector(`a[href="${tool.guideHref}"], a[href$="${tool.guideHref}"]`)) return;
                const link = document.createElement('a');
                link.href = tool.guideHref;
                link.textContent = tool.guideLabel;
                sublist.appendChild(link);
            });
        });

        const catalogGrid = document.querySelector('#available-tools .resource-grid');
        if (catalogGrid) {
            tools.slice().reverse().forEach((tool) => {
                if (!tool.catalogTitle || catalogGrid.querySelector(`a[href="${tool.toolHref}"], a[href$="${tool.toolHref}"]`)) return;
                const card = document.createElement('article');
                card.className = 'resource-card';
                card.innerHTML = `<h3>${tool.catalogTitle} <span class="status-pill">${tool.catalogStatus || ''}</span></h3><p>${tool.catalogDesc || ''}</p><a class="resource-link" href="${tool.toolHref}">${tool.catalogAction || 'Open'}</a>`;
                catalogGrid.insertBefore(card, catalogGrid.firstChild);
            });
        }

        const wikiSidebarNav = document.querySelector('.wiki-sidebar-nav');
        if (wikiSidebarNav) {
            let group = wikiSidebarNav.querySelector('[data-generated-future-guides]');
            if (!group) {
                group = document.createElement('div');
                group.className = 'wiki-sidebar-group';
                group.setAttribute('data-generated-future-guides', 'true');
                const heading = document.createElement('h2');
                heading.textContent = locale === 'ru' ? 'Новые инструменты' : locale === 'fr' ? 'Nouveaux outils' : locale === 'de' ? 'Neue Werkzeuge' : 'New tools';
                group.appendChild(heading);
                wikiSidebarNav.appendChild(group);
            }
            tools.filter((tool) => tool.guideHref && tool.sidebarLabel).forEach((tool) => {
                if (group.querySelector(`a[href="${tool.guideHref}"], a[href$="${tool.guideHref}"]`)) return;
                const link = document.createElement('a');
                link.href = tool.guideHref;
                link.textContent = tool.sidebarLabel;
                group.appendChild(link);
            });
        }

        tools.forEach((tool) => {
            if (!tool.guideHref || !tool.sectionId || !tool.wikiTitle) return;
            const grid = document.querySelector(`#${tool.sectionId} .resource-grid`);
            if (!grid || grid.querySelector(`a[href="${tool.guideHref}"], a[href$="${tool.guideHref}"]`)) return;
            const card = document.createElement('article');
            card.className = 'resource-card';
            card.innerHTML = `<p class="wiki-card-kicker">${tool.wikiKicker || ''}</p><h3>${tool.wikiTitle}</h3><p>${tool.wikiDesc || ''}</p><a class="resource-link" href="${tool.guideHref}">${tool.wikiAction || 'Read guide'}</a>`;
            grid.appendChild(card);
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




    function initDialogueBuilderLinks() {
        const locale = getLocaleInfo().lang;
        const labels = {
            en: { toolLabel: 'Dialogue builder', guideLabel: 'Dialogue builder guide', featureTitle: 'Dialogue builder', featureDesc: 'Create tellraw lines, titles, subtitles, and actionbar beats for readable Minecraft scenes.', articleLabel: 'Readable dialogue article' },
            ru: { toolLabel: 'Конструктор диалогов', guideLabel: 'Гайд по диалогам', featureTitle: 'Конструктор диалогов', featureDesc: 'Собирает tellraw, title и actionbar-реплики для сцен Minecraft.', articleLabel: 'Статья о читаемых диалогах' },
            fr: { toolLabel: 'Constructeur de dialogues', guideLabel: 'Guide des dialogues', featureTitle: 'Constructeur de dialogues', featureDesc: 'Crée des répliques tellraw, titles et actionbars pour les scènes Minecraft.', articleLabel: 'Article sur les dialogues lisibles' },
            de: { toolLabel: 'Dialog-Builder', guideLabel: 'Dialog-Anleitung', featureTitle: 'Dialog-Builder', featureDesc: 'Erstellt Tellraw-, Title- und Actionbar-Zeilen für lesbare Minecraft-Szenen.', articleLabel: 'Artikel zu lesbaren Dialogen' }
        };
        const copy = labels[locale] || labels.en;
        const toolHref = withPrefix('/dialogue-builder/');
        const guideHref = withPrefix('/wiki-dialogue-builder/');
        const articleHref = withPrefix('/wiki-readable-minecraft-dialogue/');

        document.querySelectorAll('.steam-mega-panel--tools .mega-list').forEach((list) => {
            if (list.querySelector(`a[href="${toolHref}"], a[href$="${toolHref}"]`)) return;
            const upcoming = Array.from(list.querySelectorAll('a')).find((item) => /(?:^|\/)tool-coming-soon(?:\/|\.html)?$/i.test(item.getAttribute('href') || ''));
            const link = document.createElement('a');
            link.href = toolHref;
            link.textContent = copy.toolLabel;
            list.insertBefore(link, upcoming || null);
        });

        document.querySelectorAll('.steam-mega-panel--tools .mega-feature').forEach((feature) => {
            if (feature.querySelector(`a[href="${toolHref}"], a[href$="${toolHref}"]`)) return;
            const card = document.createElement('a');
            card.className = 'mega-card';
            card.href = toolHref;
            card.innerHTML = `<strong>${copy.featureTitle}</strong><span>${copy.featureDesc}</span>`;
            feature.insertBefore(card, feature.firstChild);
        });

        document.querySelectorAll('.mega-group-title[href*="#other-tools-wiki"]').forEach((title) => {
            const sublist = title.parentElement ? title.parentElement.querySelector('.mega-sublist') : null;
            if (!sublist) return;
            if (sublist.querySelector(`a[href="${guideHref}"], a[href$="${guideHref}"]`)) return;
            const link = document.createElement('a');
            link.href = guideHref;
            link.textContent = copy.guideLabel;
            sublist.insertBefore(link, sublist.firstChild);
            if (!sublist.querySelector(`a[href="${articleHref}"], a[href$="${articleHref}"]`)) {
                const articleLink = document.createElement('a');
                articleLink.href = articleHref;
                articleLink.textContent = copy.articleLabel;
                sublist.insertBefore(articleLink, link.nextSibling);
            }
        });

        const wikiSidebarNav = document.querySelector('.wiki-sidebar-nav');
        if (wikiSidebarNav) {
            let group = wikiSidebarNav.querySelector('[data-generated-dialogue-guides]');
            if (!group) {
                group = document.createElement('div');
                group.className = 'wiki-sidebar-group';
                group.setAttribute('data-generated-dialogue-guides', 'true');
                group.innerHTML = '<div class="wiki-sidebar-heading">Project dialogue</div><div class="wiki-sidebar-links"></div>';
                const anchorGroup = wikiSidebarNav.querySelector('[data-generated-book-guides]');
                wikiSidebarNav.insertBefore(group, anchorGroup ? anchorGroup.nextSibling : wikiSidebarNav.firstChild);
            }
            const links = group.querySelector('.wiki-sidebar-links');
            if (links && !links.querySelector(`a[href="${guideHref}"], a[href$="${guideHref}"]`)) {
                const guideLink = document.createElement('a');
                guideLink.href = guideHref;
                guideLink.textContent = copy.guideLabel;
                links.appendChild(guideLink);
                const articleLink = document.createElement('a');
                articleLink.href = articleHref;
                articleLink.textContent = copy.articleLabel;
                links.appendChild(articleLink);
            }
        }
    }

    function initBookLetterBuilderLinks() {
        const locale = getLocaleInfo().lang;
        const labels = {
            en: {
                toolLabel: 'Book & letter builder',
                guideLabel: 'Book & letter guide',
                featureTitle: 'Book & letter builder',
                featureDesc: 'Create written books, letters, contracts, and readable give commands page by page.',
                articleLabel: 'Readable books article'
            },
            ru: {
                toolLabel: 'Конструктор книг и писем',
                guideLabel: 'Гайд по книгам и письмам',
                featureTitle: 'Конструктор книг и писем',
                featureDesc: 'Собирает письма, книги, контракты и команды выдачи по страницам.'
            },
            fr: {
                toolLabel: 'Constructeur de livres et lettres',
                guideLabel: 'Guide des livres et lettres',
                featureTitle: 'Constructeur de livres et lettres',
                featureDesc: 'Crée des livres, lettres, contrats et commandes /give page par page.'
            },
            de: {
                toolLabel: 'Buch- und Brief-Builder',
                guideLabel: 'Buch- und Brief-Anleitung',
                featureTitle: 'Buch- und Brief-Builder',
                featureDesc: 'Erstellt Bücher, Briefe, Verträge und Give-Befehle Seite für Seite.'
            }
        };
        const copy = labels[locale] || labels.en;
        const toolHref = withPrefix('/book-letter-builder/');
        const guideHref = withPrefix('/wiki-book-letter-builder/');
        const articleHref = withPrefix('/wiki-readable-minecraft-books/');

        document.querySelectorAll('.steam-mega-panel--tools .mega-list').forEach((list) => {
            if (list.querySelector(`a[href="${toolHref}"], a[href$="${toolHref}"]`)) return;
            const upcoming = Array.from(list.querySelectorAll('a')).find((item) => /(?:^|\/)tool-coming-soon(?:\/|\.html)?$/i.test(item.getAttribute('href') || ''));
            const link = document.createElement('a');
            link.href = toolHref;
            link.textContent = copy.toolLabel;
            list.insertBefore(link, upcoming || null);
        });

        document.querySelectorAll('.steam-mega-panel--tools .mega-feature').forEach((feature) => {
            if (feature.querySelector(`a[href="${toolHref}"], a[href$="${toolHref}"]`)) return;
            const card = document.createElement('a');
            card.className = 'mega-card';
            card.href = toolHref;
            card.innerHTML = `<strong>${copy.featureTitle}</strong><span>${copy.featureDesc}</span>`;
            feature.insertBefore(card, feature.firstChild);
        });

        document.querySelectorAll('.mega-group-title[href*="#other-tools-wiki"]').forEach((title) => {
            const sublist = title.parentElement ? title.parentElement.querySelector('.mega-sublist') : null;
            if (!sublist) return;
            if (sublist.querySelector(`a[href="${guideHref}"], a[href$="${guideHref}"]`)) return;
            const link = document.createElement('a');
            link.href = guideHref;
            link.textContent = copy.guideLabel;
            sublist.insertBefore(link, sublist.firstChild);
            if (!sublist.querySelector(`a[href="${articleHref}"], a[href$="${articleHref}"]`)) {
                const articleLink = document.createElement('a');
                articleLink.href = articleHref;
                articleLink.textContent = copy.articleLabel;
                sublist.insertBefore(articleLink, link.nextSibling);
            }
        });

        const wikiSidebarNav = document.querySelector('.wiki-sidebar-nav');
        if (wikiSidebarNav) {
            let group = wikiSidebarNav.querySelector('[data-generated-book-guides]');
            if (!group) {
                group = document.createElement('div');
                group.className = 'wiki-sidebar-group';
                group.setAttribute('data-generated-book-guides', 'true');
                const heading = document.createElement('h2');
                heading.textContent = locale === 'ru' ? 'Новые инструменты' : locale === 'fr' ? 'Nouveaux outils' : locale === 'de' ? 'Neue Werkzeuge' : 'New tools';
                group.appendChild(heading);
                wikiSidebarNav.appendChild(group);
            }
            if (!group.querySelector(`a[href="${guideHref}"], a[href$="${guideHref}"]`)) {
                const link = document.createElement('a');
                link.href = guideHref;
                link.textContent = copy.guideLabel;
                group.appendChild(link);
            }
            if (!group.querySelector(`a[href="${articleHref}"], a[href$="${articleHref}"]`)) {
                const articleLink = document.createElement('a');
                articleLink.href = articleHref;
                articleLink.textContent = copy.articleLabel;
                group.appendChild(articleLink);
            }
        }
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
        initBookLetterBuilderLinks();
        initDialogueBuilderLinks();
        initDesignToggle();
        initReadableFontToggle();
        initCopyButtons();
        observeRangeInputs();
        initArticleToc();
        document.querySelectorAll('[data-slideshow]').forEach(initSlideshow);
    });
})();
