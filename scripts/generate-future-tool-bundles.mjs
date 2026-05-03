import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const QUEUE_ROOT = path.join(ROOT, '.drip', 'queue');

const LOCALES = {
    en: { lang: 'en', prefix: '', locale: 'en_US', site: 'https://cubeinsquare.com' },
    ru: { lang: 'ru', prefix: '/ru', locale: 'ru_RU', site: 'https://cubeinsquare.com/ru' },
    fr: { lang: 'fr', prefix: '/fr', locale: 'fr_FR', site: 'https://cubeinsquare.com/fr' },
    de: { lang: 'de', prefix: '/de', locale: 'de_DE', site: 'https://cubeinsquare.com/de' }
};

const TOOL_LIBRARY = {
    customItemBuilder: {
        path: '/custom-item-builder/',
        guidePath: null,
        sectionId: null,
        labels: {
            en: {
                toolLabel: 'Custom item builder',
                featureTitle: 'Custom item builder',
                featureDesc: 'Assemble version-aware give commands with item_model, custom_data, lore, and CustomModelData.',
                catalogTitle: 'Custom item builder',
                catalogDesc: 'Assemble version-aware /give commands with visible names, lore, hidden IDs, item_model, and modern custom_model_data slots.',
                catalogAction: 'Open builder',
                catalogStatus: 'ready'
            },
            ru: {
                toolLabel: 'Конструктор кастомных предметов',
                featureTitle: 'Конструктор предметов',
                featureDesc: 'Собирает /give-команды с lore, item_model, custom_data и слотами CustomModelData.',
                catalogTitle: 'Конструктор кастомных предметов',
                catalogDesc: 'Собирайте /give-команды с именем, лором, скрытым ID, item_model и современными слотами custom_model_data.',
                catalogAction: 'Открыть конструктор',
                catalogStatus: 'готов'
            },
            fr: {
                toolLabel: 'Constructeur d’objets custom',
                featureTitle: 'Constructeur d’objets',
                featureDesc: 'Assemble des commandes /give avec lore, item_model, custom_data et slots CustomModelData.',
                catalogTitle: 'Constructeur d’objets custom',
                catalogDesc: 'Assemblez des commandes /give avec nom visible, lore, ID caché, item_model et slots modernes custom_model_data.',
                catalogAction: 'Ouvrir l’outil',
                catalogStatus: 'prêt'
            },
            de: {
                toolLabel: 'Custom-Item-Builder',
                featureTitle: 'Custom-Item-Builder',
                featureDesc: 'Erstellt /give-Befehle mit Lore, item_model, custom_data und CustomModelData-Slots.',
                catalogTitle: 'Custom-Item-Builder',
                catalogDesc: 'Erstelle /give-Befehle mit sichtbarem Namen, Lore, versteckter ID, item_model und modernen custom_model_data-Slots.',
                catalogAction: 'Builder öffnen',
                catalogStatus: 'bereit'
            }
        }
    },
    skinEditor: {
        path: '/skin-editor/',
        guidePath: '/wiki-skin-editor/',
        sectionId: 'resource-pack-generator-wiki',
        labels: {
            en: {
                toolLabel: 'Minecraft Skin Editor',
                guideLabel: 'Skin editor guide',
                featureTitle: 'Skin editor',
                featureDesc: 'Draw on the atlas or paint directly on the 3D player model.',
                catalogTitle: 'Minecraft Skin Editor',
                catalogDesc: 'Paint a classic skin atlas, edit the overlay layer, and work directly on the 3D player model.',
                catalogAction: 'Open editor',
                catalogStatus: 'ready',
                wikiKicker: 'Editor guide',
                wikiTitle: 'Skin editor',
                wikiDesc: 'How the classic 64x64 layout works, how the overlay layer behaves, and how to keep skins readable from a distance.',
                wikiAction: 'Read guide',
                sidebarLabel: 'Skin editor'
            },
            ru: {
                toolLabel: 'Редактор скинов Minecraft',
                guideLabel: 'Гайд по редактору скинов',
                featureTitle: 'Редактор скинов',
                featureDesc: 'Рисуйте по атласу или сразу по 3D-модели игрока.',
                catalogTitle: 'Редактор скинов Minecraft',
                catalogDesc: 'Редактируйте классический атлас, слой одежды и сразу проверяйте результат на 3D-модели.',
                catalogAction: 'Открыть редактор',
                catalogStatus: 'готов',
                wikiKicker: 'Гайд по редактору',
                wikiTitle: 'Редактор скинов',
                wikiDesc: 'Как работает классический формат 64x64, слой одежды и читаемость скина на расстоянии.',
                wikiAction: 'Читать гайд',
                sidebarLabel: 'Редактор скинов'
            },
            fr: {
                toolLabel: 'Éditeur de skins Minecraft',
                guideLabel: 'Guide de l’éditeur de skins',
                featureTitle: 'Éditeur de skins',
                featureDesc: 'Dessinez sur l’atlas ou directement sur le modèle 3D du joueur.',
                catalogTitle: 'Éditeur de skins Minecraft',
                catalogDesc: 'Peignez l’atlas classique, gérez la couche externe et vérifiez le rendu sur le modèle 3D.',
                catalogAction: 'Ouvrir l’éditeur',
                catalogStatus: 'prêt',
                wikiKicker: 'Guide éditeur',
                wikiTitle: 'Éditeur de skins',
                wikiDesc: 'Comment fonctionne la grille 64x64, la couche externe et la lisibilité du skin à distance.',
                wikiAction: 'Lire le guide',
                sidebarLabel: 'Éditeur de skins'
            },
            de: {
                toolLabel: 'Minecraft Skin-Editor',
                guideLabel: 'Skin-Editor-Anleitung',
                featureTitle: 'Skin-Editor',
                featureDesc: 'Male auf dem Atlas oder direkt auf dem 3D-Spielermodell.',
                catalogTitle: 'Minecraft Skin-Editor',
                catalogDesc: 'Bearbeite den klassischen Atlas, die Außenschicht und prüfe das Ergebnis direkt am 3D-Modell.',
                catalogAction: 'Editor öffnen',
                catalogStatus: 'bereit',
                wikiKicker: 'Editor-Anleitung',
                wikiTitle: 'Skin-Editor',
                wikiDesc: 'Wie das 64x64-Layout, die Außenschicht und die Lesbarkeit eines Skins zusammenarbeiten.',
                wikiAction: 'Anleitung lesen',
                sidebarLabel: 'Skin-Editor'
            }
        }
    },
    texturePainter: {
        path: '/texture-painter/',
        guidePath: '/wiki-texture-painter/',
        sectionId: 'resource-pack-generator-wiki',
        labels: {
            en: {
                toolLabel: 'Texture painter',
                guideLabel: 'Texture painter guide',
                featureTitle: 'Texture painter',
                featureDesc: 'Choose a canvas size, paint a PNG, and send it into your pack workflow.',
                catalogTitle: 'Texture painter',
                catalogDesc: 'Paint item and block textures in the browser and export crisp PNGs for your pack.',
                catalogAction: 'Open painter',
                catalogStatus: 'ready',
                wikiKicker: 'Editor guide',
                wikiTitle: 'Texture painter',
                wikiDesc: 'How canvas size, contrast, and pixel clusters affect texture readability before you export a PNG.',
                wikiAction: 'Read guide',
                sidebarLabel: 'Texture painter'
            },
            ru: {
                toolLabel: 'Редактор текстур',
                guideLabel: 'Гайд по редактору текстур',
                featureTitle: 'Редактор текстур',
                featureDesc: 'Выберите холст, нарисуйте PNG и отправьте его в работу с ресурс-паком.',
                catalogTitle: 'Редактор текстур',
                catalogDesc: 'Рисуйте предметные и блочные текстуры в браузере и экспортируйте чёткие PNG для пака.',
                catalogAction: 'Открыть редактор',
                catalogStatus: 'готов',
                wikiKicker: 'Гайд по редактору',
                wikiTitle: 'Редактор текстур',
                wikiDesc: 'Как размер холста, контраст и пиксельные кластеры влияют на читаемость текстуры до экспорта PNG.',
                wikiAction: 'Читать гайд',
                sidebarLabel: 'Редактор текстур'
            },
            fr: {
                toolLabel: 'Éditeur de textures',
                guideLabel: 'Guide de l’éditeur de textures',
                featureTitle: 'Éditeur de textures',
                featureDesc: 'Choisissez un canevas, peignez un PNG et envoyez-le dans votre workflow de pack.',
                catalogTitle: 'Éditeur de textures',
                catalogDesc: 'Peignez des textures d’objets et de blocs dans le navigateur puis exportez des PNG nets pour votre pack.',
                catalogAction: 'Ouvrir l’éditeur',
                catalogStatus: 'prêt',
                wikiKicker: 'Guide éditeur',
                wikiTitle: 'Éditeur de textures',
                wikiDesc: 'Comment la taille du canevas, le contraste et les clusters de pixels changent la lisibilité avant l’export PNG.',
                wikiAction: 'Lire le guide',
                sidebarLabel: 'Éditeur de textures'
            },
            de: {
                toolLabel: 'Textur-Editor',
                guideLabel: 'Textur-Editor-Anleitung',
                featureTitle: 'Textur-Editor',
                featureDesc: 'Wähle eine Leinwandgröße, male ein PNG und sende es in deinen Pack-Workflow.',
                catalogTitle: 'Textur-Editor',
                catalogDesc: 'Male Item- und Blocktexturen im Browser und exportiere scharfe PNGs für dein Pack.',
                catalogAction: 'Editor öffnen',
                catalogStatus: 'bereit',
                wikiKicker: 'Editor-Anleitung',
                wikiTitle: 'Textur-Editor',
                wikiDesc: 'Wie Leinwandgröße, Kontrast und Pixel-Cluster die Lesbarkeit einer Textur vor dem PNG-Export beeinflussen.',
                wikiAction: 'Anleitung lesen',
                sidebarLabel: 'Textur-Editor'
            }
        }
    },
    itemModelBuilder: {
        path: '/item-model-builder/',
        guidePath: '/wiki-item-model-builder/',
        sectionId: 'how-to-guides',
        labels: {
            en: {
                toolLabel: 'Item model builder',
                guideLabel: 'Item model builder guide',
                featureTitle: 'Item model builder',
                featureDesc: 'Build item definition JSON with model, select, range_dispatch, and condition branches.',
                catalogTitle: 'Item model builder',
                catalogDesc: 'Assemble 1.21.4+ item definition JSON with model, select, range_dispatch, and condition branches.',
                catalogAction: 'Open builder',
                catalogStatus: 'new',
                wikiKicker: 'Builder guide',
                wikiTitle: 'Item model builder',
                wikiDesc: 'When to use model, select, range_dispatch, or condition and how to wire them into the items folder cleanly.',
                wikiAction: 'Read guide',
                sidebarLabel: 'Item model builder'
            },
            ru: {
                toolLabel: 'Конструктор item_model',
                guideLabel: 'Гайд по item_model',
                featureTitle: 'Конструктор item_model',
                featureDesc: 'Собирает JSON item definition с ветками model, select, range_dispatch и condition.',
                catalogTitle: 'Конструктор item_model',
                catalogDesc: 'Собирайте JSON для новых item definitions в 1.21.4+ с ветками model, select, range_dispatch и condition.',
                catalogAction: 'Открыть конструктор',
                catalogStatus: 'новое',
                wikiKicker: 'Гайд по конструктору',
                wikiTitle: 'Конструктор item_model',
                wikiDesc: 'Когда использовать model, select, range_dispatch и condition и как аккуратно положить это в папку items.',
                wikiAction: 'Читать гайд',
                sidebarLabel: 'Конструктор item_model'
            },
            fr: {
                toolLabel: 'Constructeur item_model',
                guideLabel: 'Guide du constructeur item_model',
                featureTitle: 'Constructeur item_model',
                featureDesc: 'Assemble du JSON item definition avec les branches model, select, range_dispatch et condition.',
                catalogTitle: 'Constructeur item_model',
                catalogDesc: 'Créez le JSON des item definitions 1.21.4+ avec model, select, range_dispatch et condition.',
                catalogAction: 'Ouvrir l’outil',
                catalogStatus: 'nouveau',
                wikiKicker: 'Guide builder',
                wikiTitle: 'Constructeur item_model',
                wikiDesc: 'Quand utiliser model, select, range_dispatch et condition, et comment les ranger proprement dans le dossier items.',
                wikiAction: 'Lire le guide',
                sidebarLabel: 'Constructeur item_model'
            },
            de: {
                toolLabel: 'item_model-Builder',
                guideLabel: 'item_model-Builder-Anleitung',
                featureTitle: 'item_model-Builder',
                featureDesc: 'Erstellt Item-Definition-JSON mit model-, select-, range_dispatch- und condition-Zweigen.',
                catalogTitle: 'item_model-Builder',
                catalogDesc: 'Erstelle 1.21.4+-Item-Definitionen mit model, select, range_dispatch und condition.',
                catalogAction: 'Builder öffnen',
                catalogStatus: 'neu',
                wikiKicker: 'Builder-Anleitung',
                wikiTitle: 'item_model-Builder',
                wikiDesc: 'Wann model, select, range_dispatch oder condition sinnvoll sind und wie die Datei sauber im items-Ordner landet.',
                wikiAction: 'Anleitung lesen',
                sidebarLabel: 'item_model-Builder'
            }
        }
    },
    customItemCatalog: {
        path: '/custom-item-catalog/',
        guidePath: '/wiki-custom-item-catalog/',
        sectionId: 'how-to-guides',
        labels: {
            en: {
                toolLabel: 'Custom item catalog',
                guideLabel: 'Custom item catalog guide',
                featureTitle: 'Custom item catalog',
                featureDesc: 'Track IDs, base items, visual hooks, and notes for your server-side item library.',
                catalogTitle: 'Custom item catalog',
                catalogDesc: 'Keep a local registry of hidden IDs, base items, item_model hooks, lore notes, and duplicate checks.',
                catalogAction: 'Open catalog',
                catalogStatus: 'new',
                wikiKicker: 'Workflow guide',
                wikiTitle: 'Custom item catalog',
                wikiDesc: 'How to keep IDs, display names, base items, and pack hooks readable once your server starts shipping more than ten items.',
                wikiAction: 'Read guide',
                sidebarLabel: 'Custom item catalog'
            },
            ru: {
                toolLabel: 'Каталог кастомных предметов',
                guideLabel: 'Гайд по каталогу предметов',
                featureTitle: 'Каталог предметов',
                featureDesc: 'Хранит ID, базовые предметы, визуальные хуки и заметки для вашей библиотеки вещей.',
                catalogTitle: 'Каталог кастомных предметов',
                catalogDesc: 'Ведите локальный реестр скрытых ID, базовых предметов, item_model-хуков, заметок и конфликтов.',
                catalogAction: 'Открыть каталог',
                catalogStatus: 'новое',
                wikiKicker: 'Гайд по workflow',
                wikiTitle: 'Каталог кастомных предметов',
                wikiDesc: 'Как не утонуть в ID, названиях, базовых предметах и pack-хуках, когда предметов становится много.',
                wikiAction: 'Читать гайд',
                sidebarLabel: 'Каталог предметов'
            },
            fr: {
                toolLabel: 'Catalogue d’objets custom',
                guideLabel: 'Guide du catalogue d’objets',
                featureTitle: 'Catalogue d’objets',
                featureDesc: 'Garde les IDs, objets de base, hooks visuels et notes de votre bibliothèque d’objets.',
                catalogTitle: 'Catalogue d’objets custom',
                catalogDesc: 'Gardez un registre local des IDs cachés, objets de base, hooks item_model, notes et conflits.',
                catalogAction: 'Ouvrir le catalogue',
                catalogStatus: 'nouveau',
                wikiKicker: 'Guide workflow',
                wikiTitle: 'Catalogue d’objets custom',
                wikiDesc: 'Comment garder des IDs, noms visibles, objets de base et hooks de pack lisibles quand votre serveur multiplie les items.',
                wikiAction: 'Lire le guide',
                sidebarLabel: 'Catalogue d’objets'
            },
            de: {
                toolLabel: 'Katalog für Custom-Items',
                guideLabel: 'Anleitung zum Item-Katalog',
                featureTitle: 'Custom-Item-Katalog',
                featureDesc: 'Verwaltet IDs, Basisitems, visuelle Hooks und Notizen für eure Item-Bibliothek.',
                catalogTitle: 'Katalog für Custom-Items',
                catalogDesc: 'Pflege lokal versteckte IDs, Basisitems, item_model-Hooks, Notizen und Dublettenprüfungen.',
                catalogAction: 'Katalog öffnen',
                catalogStatus: 'neu',
                wikiKicker: 'Workflow-Anleitung',
                wikiTitle: 'Katalog für Custom-Items',
                wikiDesc: 'Wie ihr IDs, Anzeigenamen, Basisitems und Pack-Hooks lesbar haltet, sobald euer Server mehr als ein paar Sonderitems hat.',
                wikiAction: 'Anleitung lesen',
                sidebarLabel: 'Custom-Item-Katalog'
            }
        }
    },
    circleDomePlanner: {
        path: '/circle-dome-planner/',
        guidePath: '/wiki-circle-dome-planner/',
        sectionId: 'resource-pack-generator-wiki',
        labels: {
            en: {
                toolLabel: 'Circle & dome planner',
                guideLabel: 'Circle & dome planner guide',
                featureTitle: 'Circle & dome planner',
                featureDesc: 'Plan circles, rings, arches, and dome profiles before you place the first block.',
                catalogTitle: 'Circle & dome planner',
                catalogDesc: 'Work out circles, thick rings, arches, and dome profiles in a lighter companion to the sphere generator.',
                catalogAction: 'Open planner',
                catalogStatus: 'new',
                wikiKicker: 'Planning guide',
                wikiTitle: 'Circle & dome planner',
                wikiDesc: 'How to lock the footprint first, use a ring thickness intentionally, and switch from a 2D plan to a dome profile without guessing.',
                wikiAction: 'Read guide',
                sidebarLabel: 'Circle & dome planner'
            },
            ru: {
                toolLabel: 'Планировщик кругов и куполов',
                guideLabel: 'Гайд по кругам и куполам',
                featureTitle: 'Планировщик кругов и куполов',
                featureDesc: 'Помогает планировать круги, кольца, арки и купольные профили до первого блока.',
                catalogTitle: 'Планировщик кругов и куполов',
                catalogDesc: 'Лёгкий companion к генератору сфер для кругов, толстых колец, арок и профилей купола.',
                catalogAction: 'Открыть планировщик',
                catalogStatus: 'новое',
                wikiKicker: 'Гайд по планированию',
                wikiTitle: 'Планировщик кругов и куполов',
                wikiDesc: 'Как сначала поймать отпечаток, осознанно выбрать толщину кольца и перейти от 2D-плана к купольному профилю без угадывания.',
                wikiAction: 'Читать гайд',
                sidebarLabel: 'Круги и купола'
            },
            fr: {
                toolLabel: 'Planificateur de cercles et dômes',
                guideLabel: 'Guide des cercles et dômes',
                featureTitle: 'Planificateur de cercles et dômes',
                featureDesc: 'Planifie cercles, anneaux, arches et profils de dôme avant de poser le premier bloc.',
                catalogTitle: 'Planificateur de cercles et dômes',
                catalogDesc: 'Un compagnon plus léger que le générateur de sphères pour cercles, anneaux épais, arches et profils de dôme.',
                catalogAction: 'Ouvrir le planificateur',
                catalogStatus: 'nouveau',
                wikiKicker: 'Guide de planification',
                wikiTitle: 'Planificateur de cercles et dômes',
                wikiDesc: 'Comment verrouiller l’empreinte d’abord, choisir l’épaisseur d’un anneau et passer d’un plan 2D à un profil de dôme sans improviser.',
                wikiAction: 'Lire le guide',
                sidebarLabel: 'Cercles et dômes'
            },
            de: {
                toolLabel: 'Kreis- und Kuppelplaner',
                guideLabel: 'Kreis- und Kuppelplaner-Anleitung',
                featureTitle: 'Kreis- und Kuppelplaner',
                featureDesc: 'Plant Kreise, Ringe, Bögen und Kuppelprofile, bevor der erste Block gesetzt wird.',
                catalogTitle: 'Kreis- und Kuppelplaner',
                catalogDesc: 'Ein leichter Begleiter zum Kugelgenerator für Kreise, dicke Ringe, Bögen und Kuppelprofile.',
                catalogAction: 'Planer öffnen',
                catalogStatus: 'neu',
                wikiKicker: 'Planungs-Anleitung',
                wikiTitle: 'Kreis- und Kuppelplaner',
                wikiDesc: 'Wie ihr zuerst die Grundfläche festlegt, Ringstärke bewusst einsetzt und von einem 2D-Plan zu einem Kuppelprofil wechselt.',
                wikiAction: 'Anleitung lesen',
                sidebarLabel: 'Kreise und Kuppeln'
            }
        }
    }
};

const RELEASES = [
    {
        date: '2026-06-07',
        slug: 'item-model-builder-bundle',
        title: 'Publish item model builder bundle',
        key: 'itemModelBuilder',
        toolRoute: '/item-model-builder/',
        guideRoute: '/wiki-item-model-builder/'
    },
    {
        date: '2026-07-05',
        slug: 'custom-item-catalog-bundle',
        title: 'Publish custom item catalog bundle',
        key: 'customItemCatalog',
        toolRoute: '/custom-item-catalog/',
        guideRoute: '/wiki-custom-item-catalog/'
    },
    {
        date: '2026-08-02',
        slug: 'circle-dome-planner-bundle',
        title: 'Publish circle and dome planner bundle',
        key: 'circleDomePlanner',
        toolRoute: '/circle-dome-planner/',
        guideRoute: '/wiki-circle-dome-planner/'
    }
];

const LIVE_DYNAMIC_TOOL_KEYS = {
    0: ['customItemBuilder', 'skinEditor', 'texturePainter', 'itemModelBuilder'],
    1: ['customItemBuilder', 'skinEditor', 'texturePainter', 'itemModelBuilder', 'customItemCatalog'],
    2: ['customItemBuilder', 'skinEditor', 'texturePainter', 'itemModelBuilder', 'customItemCatalog', 'circleDomePlanner']
};

function withPrefix(locale, route) {
    return locale === 'en' ? route : `/${locale}${route}`;
}

function alternateLinks(route) {
    return Object.keys(LOCALES).map((locale) => {
        const href = `https://cubeinsquare.com${withPrefix(locale, route)}`;
        return `<link rel="alternate" hreflang="${locale}" href="${href}">`;
    }).join('\n    ') + `\n    <link rel="alternate" hreflang="x-default" href="https://cubeinsquare.com${route}">`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

async function read(file) {
    return fs.readFile(path.join(ROOT, file), 'utf8');
}

function extractNav(html) {
    const afterBody = html.split('<body>')[1];
    return afterBody.split('<main')[0].trim();
}

function extractFooter(html) {
    const match = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/);
    return match ? match[0] : '<footer class="site-footer"><span>Cube in Square</span><a href="/privacy-policy/">Privacy Policy</a></footer>';
}

function replaceLanguageSwitch(navHtml, route, activeLocale) {
    const switchHtml = `<div class="language-switch" aria-label="Language">${Object.keys(LOCALES).map((locale) => {
        const href = withPrefix(locale, route);
        const active = locale === activeLocale ? ' class="is-active"' : '';
        return `<a${active} href="${href}">${locale.toUpperCase()}</a>`;
    }).join('')}</div>`;
    return navHtml.replace(/<div class="language-switch"[^>]*>[\s\S]*?<\/div>/, switchHtml);
}

function structuredAppJson(locale, route, title, description) {
    const prefix = withPrefix(locale, route);
    const site = `https://cubeinsquare.com${prefix}`;
    const home = locale === 'en' ? 'https://cubeinsquare.com/' : `https://cubeinsquare.com/${locale}/`;
    const tools = locale === 'en' ? 'https://cubeinsquare.com/tools/' : `https://cubeinsquare.com/${locale}/tools/`;
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': 'https://cubeinsquare.com/#organization',
                name: 'Cube in Square',
                url: 'https://cubeinsquare.com/',
                logo: { '@type': 'ImageObject', url: 'https://cubeinsquare.com/assets/server-icon.png' }
            },
            {
                '@type': 'SoftwareApplication',
                '@id': `${site}#app`,
                name: title,
                applicationCategory: 'DeveloperApplication',
                operatingSystem: 'Web',
                url: site,
                description,
                publisher: { '@id': 'https://cubeinsquare.com/#organization' },
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${site}#breadcrumb`,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: home },
                    { '@type': 'ListItem', position: 2, name: 'Tools', item: tools },
                    { '@type': 'ListItem', position: 3, name: title, item: site }
                ]
            }
        ]
    }, null, 2);
}

function structuredArticleJson(locale, route, title, description, date) {
    const prefix = withPrefix(locale, route);
    const site = `https://cubeinsquare.com${prefix}`;
    const home = locale === 'en' ? 'https://cubeinsquare.com/' : `https://cubeinsquare.com/${locale}/`;
    const wiki = locale === 'en' ? 'https://cubeinsquare.com/wiki/' : `https://cubeinsquare.com/${locale}/wiki/`;
    return JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'Organization',
                '@id': 'https://cubeinsquare.com/#organization',
                name: 'Cube in Square',
                url: 'https://cubeinsquare.com/',
                logo: { '@type': 'ImageObject', url: 'https://cubeinsquare.com/assets/server-icon.png' }
            },
            {
                '@type': 'Article',
                '@id': `${site}#article`,
                headline: title,
                name: title,
                description,
                author: { '@id': 'https://cubeinsquare.com/#organization' },
                publisher: { '@id': 'https://cubeinsquare.com/#organization' },
                mainEntityOfPage: { '@id': `${site}#webpage` },
                inLanguage: locale,
                url: site,
                image: ['https://cubeinsquare.com/assets/gallery/server-gallery-intro-01.png'],
                datePublished: date,
                dateModified: date
            },
            {
                '@type': 'BreadcrumbList',
                '@id': `${site}#breadcrumb`,
                itemListElement: [
                    { '@type': 'ListItem', position: 1, name: 'Home', item: home },
                    { '@type': 'ListItem', position: 2, name: 'Wiki', item: wiki },
                    { '@type': 'ListItem', position: 3, name: title, item: site }
                ]
            }
        ]
    }, null, 2);
}

function toolPageTemplate({ locale, route, title, description, lead, navHtml, footerHtml, extraCss, appId, body, date }) {
    const metaLocale = LOCALES[locale].locale;
    const canonical = `https://cubeinsquare.com${withPrefix(locale, route)}`;
    return `<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(title)} | Cube in Square</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="google-site-verification" content="9X3TpaBigSKmsGW07mCY-HuGO1DJyw6Nn2cKm1Qx2Z4">
    <meta name="google-adsense-account" content="ca-pub-6745837623494230">
    <meta name="author" content="Cube in Square">
    <meta name="application-name" content="Cube in Square">
    <meta name="theme-color" content="#0f172a">
    <link rel="canonical" href="${canonical}">
    ${alternateLinks(route)}
    <meta property="og:site_name" content="Cube in Square">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(title)} | Cube in Square">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:locale" content="${metaLocale}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(title)} | Cube in Square">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <link rel="icon" href="/server-icon.png" type="image/png" sizes="64x64">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/server-icon.png">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6745837623494230" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="/assets/styles.css">
    <link rel="stylesheet" href="/assets/villager-trades.css">
    <link rel="stylesheet" href="/assets/${extraCss}">
    <script type="application/ld+json">${structuredAppJson(locale, route, title, description)}</script>
</head>
<body>
${navHtml}
<main class="page-shell">
    <section class="page-hero">
        <h1>${escapeHtml(title)}</h1>
        <p class="page-lead">${lead}</p>
    </section>
    ${body}
</main>
${footerHtml}
<script src="/assets/site.js"></script>
<script src="/assets/tracking-config.js"></script>
<script src="/assets/tracking.js"></script>
<script src="/assets/${appId}.js"></script>
</body>
</html>
`;
}

function guidePageTemplate({ locale, route, title, description, lead, navHtml, footerHtml, body, date }) {
    const metaLocale = LOCALES[locale].locale;
    const canonical = `https://cubeinsquare.com${withPrefix(locale, route)}`;
    return `<!DOCTYPE html>
<html lang="${locale}">
<head>
    <meta charset="UTF-8">
    <title>${escapeHtml(title)} | Cube in Square</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="google-site-verification" content="9X3TpaBigSKmsGW07mCY-HuGO1DJyw6Nn2cKm1Qx2Z4">
    <meta name="google-adsense-account" content="ca-pub-6745837623494230">
    <meta name="author" content="Cube in Square">
    <meta name="application-name" content="Cube in Square">
    <meta name="theme-color" content="#0f172a">
    <link rel="canonical" href="${canonical}">
    ${alternateLinks(route)}
    <meta property="og:site_name" content="Cube in Square">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)} | Cube in Square">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:locale" content="${metaLocale}">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${escapeHtml(title)} | Cube in Square">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <link rel="icon" href="/server-icon.png" type="image/png" sizes="64x64">
    <link rel="shortcut icon" href="/favicon.ico">
    <link rel="apple-touch-icon" href="/assets/server-icon.png">
    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6745837623494230" crossorigin="anonymous"></script>
    <link rel="stylesheet" href="/assets/styles.css">
    <script type="application/ld+json">${structuredArticleJson(locale, route, title, description, date)}</script>
</head>
<body>
${navHtml}
<main class="page-shell wiki-article">
    <a class="article-back" href="${withPrefix(locale, '/wiki/')}">&larr; ${locale === 'ru' ? 'Все статьи' : locale === 'fr' ? 'Tous les articles' : locale === 'de' ? 'Alle Artikel' : 'All articles'}</a>
    <section class="page-hero">
        <h1>${escapeHtml(title)}</h1>
        <p class="page-lead">${lead}</p>
    </section>
    <article>${body}</article>
</main>
${footerHtml}
<script src="/assets/site.js"></script>
<script src="/assets/tracking-config.js"></script>
<script src="/assets/tracking.js"></script>
</body>
</html>
`;
}

function renderCompactTable(headers, rows) {
    return `<table class="compact-table"><thead><tr>${headers.map((cell) => `<th>${cell}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
}

function renderFaq(items) {
    return `<div class="faq-section">${items.map((item) => `<h3>${item.q}</h3><p>${item.a}</p>`).join('')}</div>`;
}

function renderItemModelToolPage(locale) {
    const copy = {
        en: {
            title: 'Minecraft Item Model Builder',
            description: 'Build item definition JSON for Minecraft 1.21.4+ with model, select, range_dispatch, and condition branches.',
            lead: 'Build the new item definition files that live in <code>assets/&lt;namespace&gt;/items/</code>. Choose the branch type, wire the fallback, add cases, then copy the JSON into your pack without hand-writing the fragile skeleton.',
            guide: 'Read guide',
            second: 'Open pack generator',
            secondHref: '/resource-pack-generator/',
            panelTitle: 'Definition setup',
            modeLabel: 'Definition mode',
            namespaceLabel: 'Namespace',
            fileLabel: 'Definition path',
            fallbackLabel: 'Fallback model',
            propertyLabel: 'Property',
            indexLabel: 'CustomModelData index',
            addCase: 'Add branch',
            loadExample: 'Load example',
            reset: 'Reset',
            outputTitle: 'Generated item definition',
            copy: 'Copy JSON',
            copied: 'Copied',
            summaryTitle: 'What this solves',
            summaryItems: [
                'Stop hand-writing the model/select/range_dispatch wrapper every time.',
                'Keep the items folder and the pack-side branch logic readable for the whole team.',
                'Prototype one item definition before you commit to a larger pack migration.'
            ],
            workflowTitle: 'Practical workflow',
            workflowText: 'Use the builder when you already know the model paths and want the branch logic next. If the textures and models still need to be packaged, finish the visual side in the resource-pack generator first.'
        },
        ru: {
            title: 'Конструктор item_model для Minecraft',
            description: 'Собирайте JSON item definitions для Minecraft 1.21.4+ с ветками model, select, range_dispatch и condition.',
            lead: 'Собирайте новые item definition-файлы для <code>assets/&lt;namespace&gt;/items/</code>. Выберите тип ветвления, задайте fallback, добавьте cases и скопируйте JSON в пак без ручного скелета.',
            guide: 'Читать гайд',
            second: 'Открыть генератор паков',
            secondHref: '/resource-pack-generator/',
            panelTitle: 'Настройка definition',
            modeLabel: 'Режим definition',
            namespaceLabel: 'Namespace',
            fileLabel: 'Путь definition',
            fallbackLabel: 'Fallback model',
            propertyLabel: 'Свойство',
            indexLabel: 'Индекс CustomModelData',
            addCase: 'Добавить ветку',
            loadExample: 'Загрузить пример',
            reset: 'Сбросить',
            outputTitle: 'Сгенерированный item definition',
            copy: 'Скопировать JSON',
            copied: 'Скопировано',
            summaryTitle: 'Что это закрывает',
            summaryItems: [
                'Убирает рутину с ручным каркасом model/select/range_dispatch.',
                'Помогает держать папку items и логику веток читаемыми для команды.',
                'Даёт быстро проверить одну definition перед большой миграцией пака.'
            ],
            workflowTitle: 'Практический workflow',
            workflowText: 'Используйте конструктор, когда пути моделей уже понятны и осталось собрать ветвление. Если сами текстуры и модели ещё не упакованы, сначала доведите визуальную часть в генераторе ресурс-паков.'
        },
        fr: {
            title: 'Constructeur item_model pour Minecraft',
            description: 'Assemblez le JSON des item definitions Minecraft 1.21.4+ avec les branches model, select, range_dispatch et condition.',
            lead: 'Construisez les nouveaux fichiers <code>assets/&lt;namespace&gt;/items/</code>. Choisissez la branche, définissez le fallback, ajoutez les cases puis copiez le JSON sans retaper toute l’ossature.',
            guide: 'Lire le guide',
            second: 'Ouvrir le générateur de pack',
            secondHref: '/resource-pack-generator/',
            panelTitle: 'Réglages de la definition',
            modeLabel: 'Mode de definition',
            namespaceLabel: 'Namespace',
            fileLabel: 'Chemin de definition',
            fallbackLabel: 'Modèle fallback',
            propertyLabel: 'Propriété',
            indexLabel: 'Index CustomModelData',
            addCase: 'Ajouter une branche',
            loadExample: 'Charger un exemple',
            reset: 'Réinitialiser',
            outputTitle: 'Item definition générée',
            copy: 'Copier le JSON',
            copied: 'Copié',
            summaryTitle: 'Ce que cela résout',
            summaryItems: [
                'Évite d’écrire à la main l’enveloppe model/select/range_dispatch.',
                'Garde le dossier items et la logique de branches lisibles pour toute l’équipe.',
                'Permet de tester une definition avant une migration de pack plus large.'
            ],
            workflowTitle: 'Workflow pratique',
            workflowText: 'Utilisez ce builder quand les chemins de modèles sont déjà décidés et qu’il reste surtout la logique de branchement. Si la partie visuelle n’est pas encore emballée, terminez-la d’abord dans le générateur de pack.'
        },
        de: {
            title: 'item_model-Builder für Minecraft',
            description: 'Erstelle Item-Definition-JSON für Minecraft 1.21.4+ mit model-, select-, range_dispatch- und condition-Zweigen.',
            lead: 'Baue die neuen Dateien unter <code>assets/&lt;namespace&gt;/items/</code>. Wähle den Zweigtyp, setze das Fallback, füge Fälle hinzu und kopiere das JSON ohne das fehleranfällige Grundgerüst per Hand.',
            guide: 'Anleitung lesen',
            second: 'Pack-Generator öffnen',
            secondHref: '/resource-pack-generator/',
            panelTitle: 'Definition einrichten',
            modeLabel: 'Definition-Modus',
            namespaceLabel: 'Namespace',
            fileLabel: 'Definition-Pfad',
            fallbackLabel: 'Fallback-Modell',
            propertyLabel: 'Eigenschaft',
            indexLabel: 'CustomModelData-Index',
            addCase: 'Zweig hinzufügen',
            loadExample: 'Beispiel laden',
            reset: 'Zurücksetzen',
            outputTitle: 'Erzeugte Item-Definition',
            copy: 'JSON kopieren',
            copied: 'Kopiert',
            summaryTitle: 'Wofür es gut ist',
            summaryItems: [
                'Nimmt dir das manuelle model/select/range_dispatch-Grundgerüst ab.',
                'Hält den items-Ordner und die Verzweigungslogik für das Team lesbar.',
                'Hilft beim schnellen Test einer Definition vor einer größeren Pack-Migration.'
            ],
            workflowTitle: 'Praktischer Workflow',
            workflowText: 'Nutze den Builder, wenn die Modellpfade schon feststehen und jetzt die Verzweigung gebaut werden muss. Wenn die visuelle Seite noch nicht sauber verpackt ist, erledige das zuerst im Pack-Generator.'
        }
    }[locale];

    const localeModeLabels = locale === 'ru'
        ? ['Прямая model', 'select', 'range_dispatch', 'condition']
        : locale === 'fr'
            ? ['Model direct', 'select', 'range_dispatch', 'condition']
            : locale === 'de'
                ? ['Direktes model', 'select', 'range_dispatch', 'condition']
                : ['Direct model', 'select', 'range_dispatch', 'condition'];

    const branchHeading = locale === 'ru'
        ? 'Ветки'
        : locale === 'fr'
            ? 'Branches'
            : locale === 'de'
                ? 'Zweige'
                : 'Branches';

    const body = `
    <section class="page-section tool-layout">
        <div class="tool-primary-column">
            <div class="tool-panel">
                <div class="tool-button-row">
                    <a class="tool-button" href="${withPrefix(locale, '/wiki-item-model-builder/')}">${copy.guide}</a>
                    <a class="tool-button tool-button-secondary" href="${withPrefix(locale, copy.secondHref)}">${copy.second}</a>
                </div>
            </div>
            <div class="tool-panel">
                <h2>${copy.panelTitle}</h2>
                <div class="tool-form-grid">
                    <div class="tool-field">
                        <label for="imb-mode">${copy.modeLabel}</label>
                        <select id="imb-mode">
                            <option value="model">${localeModeLabels[0]}</option>
                            <option value="select">${localeModeLabels[1]}</option>
                            <option value="range_dispatch">${localeModeLabels[2]}</option>
                            <option value="condition">${localeModeLabels[3]}</option>
                        </select>
                    </div>
                    <div class="tool-field">
                        <label for="imb-namespace">${copy.namespaceLabel}</label>
                        <input id="imb-namespace" type="text" value="cubeinsquare">
                    </div>
                    <div class="tool-field">
                        <label for="imb-file">${copy.fileLabel}</label>
                        <input id="imb-file" type="text" value="paper/guild_pass">
                    </div>
                    <div class="tool-field">
                        <label for="imb-fallback">${copy.fallbackLabel}</label>
                        <input id="imb-fallback" type="text" value="minecraft:item/paper">
                    </div>
                    <div class="tool-field" data-imb-property-field>
                        <label for="imb-property">${copy.propertyLabel}</label>
                        <select id="imb-property"></select>
                    </div>
                    <div class="tool-field" data-imb-index-field hidden>
                        <label for="imb-index">${copy.indexLabel}</label>
                        <input id="imb-index" type="number" min="0" value="0">
                    </div>
                </div>
                <section class="imb-branch-section">
                    <div class="section-heading">
                        <h3>${branchHeading}</h3>
                        <button class="tool-button tool-button-secondary" id="imb-add-case" type="button">${copy.addCase}</button>
                    </div>
                    <div id="imb-branch-list" class="imb-branch-list"></div>
                </section>
                <div class="tool-button-row">
                    <button class="tool-button" id="imb-load-example" type="button">${copy.loadExample}</button>
                    <button class="tool-button tool-button-secondary" id="imb-reset" type="button">${copy.reset}</button>
                </div>
            </div>
            <div class="tool-panel">
                <h2>${copy.outputTitle}</h2>
                <p class="tool-summary" id="imb-summary"></p>
                <textarea id="imb-output" class="command-output" readonly></textarea>
                <div class="tool-button-row">
                    <button class="tool-button" id="imb-copy" type="button" data-copied-label="${copy.copied}">${copy.copy}</button>
                </div>
            </div>
        </div>
        <aside class="tool-secondary-column">
            <div class="tool-panel">
                <h2>${copy.summaryTitle}</h2>
                <ul class="item-builder-help">${copy.summaryItems.map((item) => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div class="tool-panel">
                <h2>${copy.workflowTitle}</h2>
                <p>${copy.workflowText}</p>
            </div>
        </aside>
    </section>`;

    return {
        title: copy.title,
        description: copy.description,
        lead: copy.lead,
        body
    };
}

function renderItemModelGuide(locale) {
    const copy = {
        en: {
            title: 'How to build item definitions for Minecraft 1.21.4+',
            description: 'Learn when to use model, select, range_dispatch, and condition in Minecraft item definitions and how the item model builder speeds the process up.',
            lead: 'The hard part of the new items folder is not the file itself. It is remembering which branch type matches the problem in front of you. This guide is here to keep that choice small and deliberate.',
            cta: 'Open item model builder',
            sections: [
                ['Why item definitions exist now', [
                    'Minecraft 1.21.4 moved item rendering logic into dedicated files under <code>assets/&lt;namespace&gt;/items/</code>. That means the old instinct of stuffing everything into overrides is no longer the clean path.',
                    'The new system is more explicit: one file can be a direct model, a select tree, a range-based dispatch, or a condition check. The upside is clarity. The downside is that hand-writing the wrapper gets repetitive very quickly.'
                ]],
                ['Pick the branch that matches the decision', [
                    renderCompactTable(
                        ['Branch', 'Use it when', 'Typical example'],
                        [
                            ['<code>minecraft:model</code>', 'You only need one fixed model.', 'A plain custom paper pass.'],
                            ['<code>minecraft:select</code>', 'One property chooses between named branches.', 'Different custom_model_data string states.'],
                            ['<code>minecraft:range_dispatch</code>', 'A number crosses thresholds.', 'Damage stages or charge levels.'],
                            ['<code>minecraft:condition</code>', 'The model depends on true/false state.', 'Selected item, using item, damaged item.']
                        ]
                    )
                ]],
                ['Practical workflow', [
                    '<ol><li>Decide the file path you want inside <code>items/</code>.</li><li>Choose the smallest branch type that explains the logic.</li><li>Set a fallback first, then add branches.</li><li>Copy the generated JSON and test the item in game before you duplicate the pattern across ten more definitions.</li></ol>'
                ]],
                ['Common mistakes', [
                    '<ul><li>Using <code>select</code> when a direct <code>model</code> file would do.</li><li>Forgetting a fallback model, which leaves the file harder to reason about later.</li><li>Mixing string-style and numeric-style expectations inside the same definition.</li><li>Naming the file and the model path so differently that the team can no longer guess what belongs to what.</li></ul>'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Do I always need select for CustomModelData?', a: 'No. If the item only has one fixed look, a direct model file is simpler. Use select when the same definition must branch into multiple appearances.' },
                        { q: 'When is range_dispatch better than select?', a: 'When the decision is numeric and ordered: damage, cooldown, charge, or threshold-like values.' },
                        { q: 'Why start with the fallback?', a: 'Because the fallback is the default reading of the item. Once that anchor is correct, every extra branch becomes easier to judge.' },
                        { q: 'Can I still keep item commands separate from the model file?', a: 'Yes. That separation is one of the main strengths of the new system. The builder just handles the visual definition side.' },
                        { q: 'Where does this connect to the rest of the site?', a: 'Use the item model builder for the definition JSON, the custom item builder for /give commands, and the resource-pack generator when the visual files still need to be packed.' }
                    ])
                ]]
            ]
        },
        ru: {
            title: 'Как собирать item definitions для Minecraft 1.21.4+',
            description: 'Разбираем, когда использовать model, select, range_dispatch и condition в новых item definitions и как конструктор ускоряет этот шаг.',
            lead: 'Сложность новой папки items не в том, что файл большой. Сложность в том, чтобы каждый раз выбрать правильный тип ветвления. Этот гайд как раз про этот выбор.',
            cta: 'Открыть конструктор item_model',
            sections: [
                ['Зачем вообще появились item definitions', [
                    'Minecraft 1.21.4 вынес логику отрисовки предметов в отдельные файлы <code>assets/&lt;namespace&gt;/items/</code>. То есть старое чувство “сейчас всё впихну в overrides” больше не даёт чистый результат.',
                    'Новая система стала честнее: один файл может быть прямой model, select-деревом, range_dispatch по порогам или условным condition. Плюс в ясности, минус в том, что ручной каркас быстро надоедает.'
                ]],
                ['Подбирайте ветку под саму задачу', [
                    renderCompactTable(
                        ['Ветка', 'Когда подходит', 'Типичный пример'],
                        [
                            ['<code>minecraft:model</code>', 'Нужна одна фиксированная модель.', 'Пропуск на базе paper.'],
                            ['<code>minecraft:select</code>', 'Одно свойство выбирает между именованными ветками.', 'Строковые состояния custom_model_data.'],
                            ['<code>minecraft:range_dispatch</code>', 'Число пересекает пороги.', 'Стадии урона или заряд.'],
                            ['<code>minecraft:condition</code>', 'Модель зависит от true/false.', 'Выбранный предмет или использование предмета.']
                        ]
                    )
                ]],
                ['Практический workflow', [
                    '<ol><li>Сначала определите путь файла внутри <code>items/</code>.</li><li>Выберите самый маленький тип ветвления, который реально объясняет логику.</li><li>Сначала настройте fallback, потом добавляйте ветки.</li><li>Скопируйте JSON и проверьте предмет в игре до того, как размножать паттерн по всему паку.</li></ol>'
                ]],
                ['Типичные ошибки', [
                    '<ul><li>Брать <code>select</code> там, где хватило бы обычной <code>model</code>.</li><li>Забывать fallback и потом терять базовое чтение файла.</li><li>Смешивать ожидания строковых и числовых значений в одной definition.</li><li>Называть файл и model path так по-разному, что команда уже не понимает, что к чему относится.</li></ul>'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Нужен ли select всегда, если речь про CustomModelData?', a: 'Нет. Если у предмета только один внешний вид, обычный model-файл проще. Select нужен, когда один definition должен ветвиться на несколько обликов.' },
                        { q: 'Когда range_dispatch лучше, чем select?', a: 'Когда решение числовое и упорядоченное: урон, кулдаун, заряд или любое пороговое значение.' },
                        { q: 'Почему начинать с fallback?', a: 'Потому что fallback — это базовое чтение предмета. Когда оно правильно, все остальные ветки уже легче оценивать.' },
                        { q: 'Можно ли держать item-команду отдельно от model-файла?', a: 'Да, и это одна из сильных сторон новой системы. Конструктор отвечает только за визуальную definition-сторону.' },
                        { q: 'Как это связано с остальным сайтом?', a: 'Item model builder собирает definition JSON, custom item builder — /give-команду, а resource-pack generator помогает упаковать визуальные файлы.' }
                    ])
                ]]
            ]
        },
        fr: {
            title: 'Comment construire des item definitions pour Minecraft 1.21.4+',
            description: 'Quand utiliser model, select, range_dispatch ou condition dans les item definitions Minecraft et comment le builder réduit la friction.',
            lead: 'Le vrai piège du dossier items n’est pas sa taille. C’est le choix de la bonne branche à chaque fois. Ce guide sert à rendre ce choix clair.',
            cta: 'Ouvrir le constructeur item_model',
            sections: [
                ['Pourquoi les item definitions existent maintenant', [
                    'Minecraft 1.21.4 a déplacé la logique de rendu des objets dans des fichiers séparés sous <code>assets/&lt;namespace&gt;/items/</code>. L’ancien réflexe “tout faire dans overrides” n’est plus la voie propre.',
                    'Le nouveau système est plus explicite : un fichier peut être une model simple, un arbre select, un range_dispatch basé sur des seuils ou une condition booléenne. La clarté est meilleure, mais l’ossature répétitive fatigue vite.'
                ]],
                ['Choisir la branche selon la vraie décision', [
                    renderCompactTable(
                        ['Branche', 'Quand l’utiliser', 'Exemple'],
                        [
                            ['<code>minecraft:model</code>', 'Une seule apparence fixe suffit.', 'Un pass en papier.'],
                            ['<code>minecraft:select</code>', 'Une propriété choisit entre plusieurs branches nommées.', 'États string de custom_model_data.'],
                            ['<code>minecraft:range_dispatch</code>', 'Une valeur numérique franchit des seuils.', 'Niveaux d’usure ou de charge.'],
                            ['<code>minecraft:condition</code>', 'Le modèle dépend d’un vrai/faux.', 'Objet sélectionné ou utilisé.']
                        ]
                    )
                ]],
                ['Workflow pratique', [
                    '<ol><li>Choisissez d’abord le chemin de fichier dans <code>items/</code>.</li><li>Prenez la plus petite branche qui raconte la bonne logique.</li><li>Réglez le fallback avant d’ajouter des branches.</li><li>Copiez le JSON et testez l’objet en jeu avant de dupliquer le motif partout.</li></ol>'
                ]],
                ['Erreurs fréquentes', [
                    '<ul><li>Utiliser <code>select</code> là où un simple <code>model</code> suffit.</li><li>Oublier le fallback et perdre la lecture par défaut du fichier.</li><li>Mélanger des attentes string et numériques dans la même definition.</li><li>Nommer le fichier et le modèle de manière trop différente, au point que l’équipe ne sait plus ce qui correspond à quoi.</li></ul>'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Faut-il toujours utiliser select pour CustomModelData ?', a: 'Non. Si l’objet n’a qu’une seule apparence, un fichier model direct est plus simple. Select sert quand une même definition doit bifurquer vers plusieurs rendus.' },
                        { q: 'Quand range_dispatch vaut-il mieux que select ?', a: 'Quand la décision est numérique et ordonnée : usure, charge, cooldown, seuils.' },
                        { q: 'Pourquoi commencer par le fallback ?', a: 'Parce que le fallback est la lecture par défaut de l’objet. Une fois ce socle juste, chaque branche supplémentaire est plus facile à juger.' },
                        { q: 'Puis-je garder la commande item séparée du fichier modèle ?', a: 'Oui. Cette séparation est justement l’un des gros avantages du nouveau système.' },
                        { q: 'Comment cela se relie-t-il au reste du site ?', a: 'Le builder item_model génère le JSON de définition, le custom item builder prépare la commande /give, et le générateur de pack gère l’emballage visuel.' }
                    ])
                ]]
            ]
        },
        de: {
            title: 'Wie man Item-Definitionen für Minecraft 1.21.4+ baut',
            description: 'Wann model, select, range_dispatch und condition sinnvoll sind und wie der Builder den Schritt durch die neue items-Logik beschleunigt.',
            lead: 'Das Schwierige am items-Ordner ist nicht die Dateigröße. Es ist die Entscheidung, welcher Zweig gerade wirklich passt. Dieser Leitfaden hält genau diese Entscheidung klein und klar.',
            cta: 'item_model-Builder öffnen',
            sections: [
                ['Warum es jetzt Item-Definitionen gibt', [
                    'Minecraft 1.21.4 hat die Renderlogik für Items in eigene Dateien unter <code>assets/&lt;namespace&gt;/items/</code> verschoben. Der alte Reflex “das mache ich schnell in overrides” ist nicht mehr der saubere Weg.',
                    'Das neue System ist expliziter: Eine Datei kann ein direktes model, ein select-Baum, ein range_dispatch mit Schwellenwerten oder eine condition sein. Das ist klarer, macht das Grundgerüst aber auch repetitiv.'
                ]],
                ['Den Zweig an der echten Entscheidung ausrichten', [
                    renderCompactTable(
                        ['Zweig', 'Wann er passt', 'Beispiel'],
                        [
                            ['<code>minecraft:model</code>', 'Eine feste Darstellung reicht.', 'Ein einfacher Pass auf Papierbasis.'],
                            ['<code>minecraft:select</code>', 'Eine Eigenschaft wählt zwischen benannten Zweigen.', 'String-Zustände in custom_model_data.'],
                            ['<code>minecraft:range_dispatch</code>', 'Ein Zahlenwert überquert Schwellen.', 'Schadens- oder Ladestufen.'],
                            ['<code>minecraft:condition</code>', 'Das Modell hängt an wahr/falsch.', 'Ausgewähltes oder benutztes Item.']
                        ]
                    )
                ]],
                ['Praktischer Workflow', [
                    '<ol><li>Lege zuerst den Dateipfad im <code>items/</code>-Ordner fest.</li><li>Wähle den kleinsten Zweig, der die Logik ehrlich erklärt.</li><li>Setze zuerst das Fallback und füge erst dann Zweige hinzu.</li><li>Kopiere das JSON und teste das Item im Spiel, bevor du das Muster großflächig wiederverwendest.</li></ol>'
                ]],
                ['Häufige Fehler', [
                    '<ul><li><code>select</code> verwenden, obwohl ein einfaches <code>model</code> ausgereicht hätte.</li><li>Das Fallback vergessen und damit die Standardlesart der Datei verlieren.</li><li>String- und Zahlenlogik in derselben Definition durcheinanderbringen.</li><li>Dateinamen und Modellpfad so unterschiedlich benennen, dass im Team niemand mehr die Zuordnung errät.</li></ul>'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Brauche ich für CustomModelData immer select?', a: 'Nein. Wenn das Item nur eine feste Optik hat, ist eine direkte model-Datei einfacher. Select wird erst nötig, wenn dieselbe Definition in mehrere Darstellungen verzweigen soll.' },
                        { q: 'Wann ist range_dispatch besser als select?', a: 'Wenn die Entscheidung numerisch und geordnet ist: Schaden, Ladung, Cooldown oder andere Schwellenwerte.' },
                        { q: 'Warum mit dem Fallback beginnen?', a: 'Weil das Fallback die Standardlesart des Items ist. Wenn diese Basis stimmt, lassen sich alle Zusatzäste leichter beurteilen.' },
                        { q: 'Kann ich Item-Befehl und Modell-Datei getrennt halten?', a: 'Ja. Genau diese Trennung ist eine der Stärken des neuen Systems.' },
                        { q: 'Wie hängt das mit dem Rest der Seite zusammen?', a: 'Der item_model-Builder erzeugt das Definition-JSON, der Custom-Item-Builder kümmert sich um /give und der Pack-Generator um die visuellen Dateien.' }
                    ])
                ]]
            ]
        }
    }[locale];

    const body = `
<div class="tool-button-row">
    <a class="tool-button" href="${withPrefix(locale, '/item-model-builder/')}">${copy.cta}</a>
    <a class="tool-button tool-button-secondary" href="${withPrefix(locale, '/resource-pack-generator/')}">${locale === 'ru' ? 'Открыть генератор паков' : locale === 'fr' ? 'Ouvrir le générateur de pack' : locale === 'de' ? 'Pack-Generator öffnen' : 'Open pack generator'}</a>
</div>
${copy.sections.map(([heading, blocks]) => `<h2>${heading}</h2>${blocks.map((block) => `<div class="article-block">${block}</div>`).join('')}`).join('')}`;

    return copy.title ? {
        title: copy.title,
        description: copy.description,
        lead: copy.lead,
        body
    } : null;
}

function renderCustomItemCatalogToolPage(locale) {
    const copy = {
        en: {
            title: 'Minecraft Custom Item Catalog',
            description: 'Keep a local registry of hidden IDs, base items, model hooks, notes, and duplicate checks for your custom Minecraft items.',
            lead: 'This is the planning layer between “we have a few cool items” and “we now have thirty identifiers and nobody remembers which paper is which”. Build a local catalog, search it, export it, and stop guessing.',
            guide: 'Read guide',
            panelTitle: 'Catalog entry',
            save: 'Save entry',
            reset: 'Reset',
            example: 'Load example',
            search: 'Search catalog',
            exportJson: 'Export JSON',
            exportCsv: 'Export CSV',
            exportMd: 'Export Markdown',
            sideTitle: 'Why keep a catalog?',
            sideItems: [
                'Duplicate hidden IDs are easier to catch before they become quest bugs.',
                'Base item, display name, and model hook stay readable in one place.',
                'The export gives the rest of the team something more useful than screenshots.'
            ]
        },
        ru: {
            title: 'Каталог кастомных предметов Minecraft',
            description: 'Ведите локальный реестр скрытых ID, базовых предметов, model-хуков, заметок и конфликтов для кастомных предметов Minecraft.',
            lead: 'Это тот планировочный слой между “у нас есть пара прикольных предметов” и “у нас уже тридцать идентификаторов, и никто не помнит, какая paper за что отвечает”.',
            guide: 'Читать гайд',
            panelTitle: 'Запись каталога',
            save: 'Сохранить запись',
            reset: 'Сбросить',
            example: 'Загрузить пример',
            search: 'Поиск по каталогу',
            exportJson: 'Экспорт JSON',
            exportCsv: 'Экспорт CSV',
            exportMd: 'Экспорт Markdown',
            sideTitle: 'Зачем вообще каталог?',
            sideItems: [
                'Дубли скрытых ID легче ловить до того, как они превращаются в баги квестов.',
                'Базовый предмет, имя и model-хук остаются читаемыми в одном месте.',
                'Экспорт даёт команде что-то полезнее, чем просто скриншоты.'
            ]
        },
        fr: {
            title: 'Catalogue d’objets custom Minecraft',
            description: 'Gardez un registre local des IDs cachés, objets de base, hooks de modèle, notes et conflits pour vos objets Minecraft.',
            lead: 'C’est la couche d’organisation entre “on a quelques items sympas” et “on en a maintenant trente et plus personne ne sait quel papier fait quoi”.',
            guide: 'Lire le guide',
            panelTitle: 'Entrée du catalogue',
            save: 'Enregistrer',
            reset: 'Réinitialiser',
            example: 'Charger un exemple',
            search: 'Rechercher dans le catalogue',
            exportJson: 'Exporter JSON',
            exportCsv: 'Exporter CSV',
            exportMd: 'Exporter Markdown',
            sideTitle: 'Pourquoi garder un catalogue ?',
            sideItems: [
                'Les IDs cachés en doublon se détectent avant de devenir des bugs de quête.',
                'Objet de base, nom visible et hook de modèle restent lisibles au même endroit.',
                'L’export donne à l’équipe quelque chose de plus utile que des captures d’écran.'
            ]
        },
        de: {
            title: 'Minecraft Custom-Item-Katalog',
            description: 'Führe ein lokales Register für versteckte IDs, Basisitems, Modell-Hooks, Notizen und Dubletten bei euren Minecraft-Sonderitems.',
            lead: 'Das ist die Planungsebene zwischen “wir haben ein paar coole Items” und “wir haben jetzt dreißig Kennungen und niemand weiß mehr, welches Papier wofür steht”.',
            guide: 'Anleitung lesen',
            panelTitle: 'Katalogeintrag',
            save: 'Eintrag speichern',
            reset: 'Zurücksetzen',
            example: 'Beispiel laden',
            search: 'Katalog durchsuchen',
            exportJson: 'JSON exportieren',
            exportCsv: 'CSV exportieren',
            exportMd: 'Markdown exportieren',
            sideTitle: 'Warum ein Katalog?',
            sideItems: [
                'Doppelte versteckte IDs fallen auf, bevor sie Quest-Fehler werden.',
                'Basisitem, Anzeigename und Modell-Hook bleiben an einem Ort lesbar.',
                'Der Export ist für das Team nützlicher als bloße Screenshots.'
            ]
        }
    }[locale];

    const body = `
    <section class="page-section tool-layout">
        <div class="tool-primary-column">
            <div class="tool-panel">
                <div class="tool-button-row">
                    <a class="tool-button" href="${withPrefix(locale, '/wiki-custom-item-catalog/')}">${copy.guide}</a>
                    <a class="tool-button tool-button-secondary" href="${withPrefix(locale, '/custom-item-builder/')}">${locale === 'ru' ? 'Открыть builder' : locale === 'fr' ? 'Ouvrir le builder' : locale === 'de' ? 'Builder öffnen' : 'Open builder'}</a>
                </div>
            </div>
            <div class="tool-panel">
                <h2>${copy.panelTitle}</h2>
                <div class="tool-form-grid">
                    <div class="tool-field"><label for="cic-id">Internal ID</label><input id="cic-id" type="text" placeholder="guild_pass"></div>
                    <div class="tool-field"><label for="cic-name">${locale === 'ru' ? 'Отображаемое имя' : locale === 'fr' ? 'Nom visible' : locale === 'de' ? 'Anzeigename' : 'Display name'}</label><input id="cic-name" type="text" placeholder="Guild pass"></div>
                    <div class="tool-field"><label for="cic-base">${locale === 'ru' ? 'Базовый предмет' : locale === 'fr' ? 'Objet de base' : locale === 'de' ? 'Basisitem' : 'Base item'}</label><input id="cic-base" type="text" placeholder="paper"></div>
                    <div class="tool-field"><label for="cic-version">${locale === 'ru' ? 'Версия' : locale === 'fr' ? 'Version' : locale === 'de' ? 'Version' : 'Version'}</label><select id="cic-version"><option value="legacy">Before 1.20.5</option><option value="current">1.20.5-1.21.3</option><option value="modern">1.21.4+</option></select></div>
                    <div class="tool-field"><label for="cic-hidden">${locale === 'ru' ? 'Скрытый ID' : locale === 'fr' ? 'ID caché' : locale === 'de' ? 'Versteckte ID' : 'Hidden ID'}</label><input id="cic-hidden" type="text" placeholder="quest.pass.guild"></div>
                    <div class="tool-field"><label for="cic-model">item_model</label><input id="cic-model" type="text" placeholder="cubeinsquare:item/paper/guild_pass"></div>
                    <div class="tool-field"><label for="cic-cmd">CustomModelData</label><input id="cic-cmd" type="text" placeholder="2047 / guild_pass"></div>
                    <div class="tool-field"><label for="cic-tags">${locale === 'ru' ? 'Теги' : locale === 'fr' ? 'Tags' : locale === 'de' ? 'Tags' : 'Tags'}</label><input id="cic-tags" type="text" placeholder="guild, pass, quest"></div>
                    <div class="tool-field" style="grid-column:1 / -1;"><label for="cic-notes">${locale === 'ru' ? 'Заметки' : locale === 'fr' ? 'Notes' : locale === 'de' ? 'Notizen' : 'Notes'}</label><textarea id="cic-notes" rows="4" placeholder="${locale === 'ru' ? 'Что важно помнить об этом предмете?' : locale === 'fr' ? 'Ce qu’il faut retenir sur cet objet.' : locale === 'de' ? 'Wichtige Hinweise zu diesem Item.' : 'What matters about this item?'}"></textarea></div>
                </div>
                <div class="tool-button-row">
                    <button class="tool-button" id="cic-save" type="button">${copy.save}</button>
                    <button class="tool-button tool-button-secondary" id="cic-reset" type="button">${copy.reset}</button>
                    <button class="tool-button tool-button-secondary" id="cic-example" type="button">${copy.example}</button>
                </div>
            </div>
            <div class="tool-panel">
                <div class="tool-form-grid">
                    <div class="tool-field" style="grid-column:1 / -1;"><label for="cic-search">${copy.search}</label><input id="cic-search" type="text" placeholder="${locale === 'ru' ? 'ID, имя, теги...' : locale === 'fr' ? 'ID, nom, tags...' : locale === 'de' ? 'ID, Name, Tags...' : 'ID, name, tags...'}"></div>
                </div>
                <div class="tool-button-row">
                    <button class="tool-button tool-button-secondary" id="cic-export-json" type="button">${copy.exportJson}</button>
                    <button class="tool-button tool-button-secondary" id="cic-export-csv" type="button">${copy.exportCsv}</button>
                    <button class="tool-button tool-button-secondary" id="cic-export-md" type="button">${copy.exportMd}</button>
                </div>
                <div class="catalog-summary-grid" id="cic-stats"></div>
                <div class="catalog-entry-list" id="cic-list"></div>
            </div>
        </div>
        <aside class="tool-secondary-column">
            <div class="tool-panel">
                <h2>${copy.sideTitle}</h2>
                <ul class="item-builder-help">${copy.sideItems.map((item) => `<li>${item}</li>`).join('')}</ul>
            </div>
        </aside>
    </section>`;

    return {
        title: copy.title,
        description: copy.description,
        lead: copy.lead,
        body
    };
}

function renderCustomItemCatalogGuide(locale) {
    const copy = {
        en: {
            title: 'Why your server needs a custom item catalog',
            description: 'Learn how a local item registry prevents duplicate IDs, mismatched pack hooks, and team confusion once your Minecraft server grows beyond a handful of custom items.',
            lead: 'A custom item catalog is not glamorous, but it is one of the first things that starts saving time once the server owns more than a few props, contracts, relics, or currencies.',
            cta: 'Open custom item catalog',
            sections: [
                ['The moment spreadsheets start happening', [
                    'Most servers do not begin with a formal registry. They begin with a few custom papers, a few model hooks, and a promise that everybody will remember what belongs to what. That promise usually lasts until the item count grows and the first duplicate hidden ID slips in.',
                    'A catalog fixes the memory problem. It gives each item a stable row: internal ID, display name, base item, model hook, version mode, tags, and notes.'
                ]],
                ['What belongs in the catalog', [
                    renderCompactTable(
                        ['Field', 'What it answers', 'Why it matters'],
                        [
                            ['Internal ID', 'What the team calls this item in logic.', 'Prevents two different objects from sharing one hidden identity.'],
                            ['Base item', 'What vanilla item still exists underneath.', 'Useful for quick sanity checks and pack wiring.'],
                            ['Model hook', 'Which item_model or CustomModelData branch is attached.', 'Keeps the visual side traceable.'],
                            ['Tags and notes', 'What this item is for.', 'Stops the catalog from turning into a graveyard of unlabeled IDs.']
                        ]
                    )
                ]],
                ['Naming rules that age well', [
                    '<ul><li>Use one internal naming style and keep it stable.</li><li>Let display names stay dramatic while internal IDs stay readable.</li><li>Store notes about conflicts, ownership, or one-off exceptions right next to the item instead of in chat history.</li></ul>'
                ]],
                ['Why exports matter', [
                    'The export is what turns a private browser list into team infrastructure. JSON is useful for machine-friendly snapshots. CSV is good for sorting or external review. Markdown is easy to paste into documentation or a planning channel.',
                    'Even if the catalog begins as a local draft, the export means your work does not disappear into one browser profile.'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Is this only for large servers?', a: 'No. It starts being useful surprisingly early, usually the moment the team has enough custom items that names begin to blur together.' },
                        { q: 'Should display names and internal IDs match exactly?', a: 'Not necessarily. The display name can stay thematic. The internal ID should stay stable and readable for the team.' },
                        { q: 'Why not keep this in a spreadsheet forever?', a: 'You can, but a purpose-built catalog reduces friction, flags duplicates faster, and keeps the item shape closer to the way the rest of the site works.' },
                        { q: 'Does the catalog replace the custom item builder?', a: 'No. The catalog is the planning registry. The builder is still the place where you generate item commands.' },
                        { q: 'Can this help with pack migrations too?', a: 'Yes. Once every item has a recorded base item and visual hook, migrating the pack side becomes much less chaotic.' }
                    ])
                ]]
            ]
        },
        ru: {
            title: 'Зачем серверу нужен каталог кастомных предметов',
            description: 'Как локальный реестр предметов спасает от дублей ID, путаницы с pack-хуками и общей потери памяти, когда кастомных вещей становится много.',
            lead: 'Каталог предметов — не самая эффектная часть проекта, но он начинает экономить время почти сразу, как только на сервере появляется больше нескольких пропов, контрактов, валют и квестовых вещей.',
            cta: 'Открыть каталог предметов',
            sections: [
                ['Тот момент, когда внезапно рождаются таблицы', [
                    'Большинство серверов не стартуют с формальным реестром. Сначала это просто несколько кастомных бумаг, пара model-хуков и обещание, что все и так всё запомнят. Обычно этого хватает ровно до первого дубля скрытого ID.',
                    'Каталог решает не проблему красоты, а проблему памяти. У каждого предмета появляется стабильная строка: внутренний ID, отображаемое имя, базовый предмет, model-hook, версия, теги и заметки.'
                ]],
                ['Что вообще стоит хранить', [
                    renderCompactTable(
                        ['Поле', 'На что отвечает', 'Почему важно'],
                        [
                            ['Внутренний ID', 'Как команда называет предмет в логике.', 'Не даёт разным предметам случайно делить одну скрытую сущность.'],
                            ['Базовый предмет', 'Какой ванильный предмет лежит underneath.', 'Помогает быстро проверить совместимость и пак-сторону.'],
                            ['Model-hook', 'Какой item_model или ветка CustomModelData связаны.', 'Держит визуальную часть прослеживаемой.'],
                            ['Теги и заметки', 'Зачем этот предмет существует.', 'Спасает каталог от превращения в кладбище без контекста.']
                        ]
                    )
                ]],
                ['Правила имён, которые хорошо стареют', [
                    '<ul><li>Держите один стиль внутренних ID и не дёргайте его без нужды.</li><li>Пусть отображаемые имена будут атмосферными, а внутренние — читаемыми.</li><li>Не держите важные оговорки в истории чата — складывайте их в заметки рядом с предметом.</li></ul>'
                ]],
                ['Зачем нужны экспорты', [
                    'Экспорт превращает локальный список в командную инфраструктуру. JSON удобен для машинного снимка, CSV — для сортировки, Markdown — для документации и каналов планирования.',
                    'Даже если каталог начинался как локальный черновик, экспорт не даёт вашей работе умереть в одном профиле браузера.'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Это только для больших серверов?', a: 'Нет. Каталог начинает приносить пользу очень рано — почти сразу, когда кастомных предметов становится достаточно много, чтобы названия начали смешиваться.' },
                        { q: 'Имя для игрока и внутренний ID должны совпадать?', a: 'Не обязательно. Отображаемое имя может оставаться атмосферным. Внутренний ID должен быть стабильным и читаемым для команды.' },
                        { q: 'Почему не оставить всё в таблице?', a: 'Можно, но отдельный каталог быстрее ловит дубли, меньше трёт вас о формат и лучше встраивается в остальной workflow сайта.' },
                        { q: 'Каталог заменяет custom item builder?', a: 'Нет. Каталог — это реестр и планирование. Builder всё ещё нужен для генерации команд.' },
                        { q: 'Это поможет при миграции паков?', a: 'Да. Когда у каждого предмета записаны базовый предмет и визуальный хук, pack-side миграция становится намного спокойнее.' }
                    ])
                ]]
            ]
        },
        fr: {
            title: 'Pourquoi votre serveur a besoin d’un catalogue d’objets custom',
            description: 'Comment un registre local évite les doublons d’ID, les hooks de pack incohérents et la confusion d’équipe quand les objets custom se multiplient.',
            lead: 'Le catalogue d’objets n’est pas l’outil le plus spectaculaire, mais il commence à économiser du temps très tôt dès qu’un serveur accumule des props, contrats, monnaies ou reliques.',
            cta: 'Ouvrir le catalogue d’objets',
            sections: [
                ['Le moment où les tableurs apparaissent', [
                    'La plupart des serveurs ne démarrent pas avec un registre formel. Ils commencent avec quelques papiers custom, quelques hooks de modèle, puis la promesse que tout le monde s’en souviendra. Cette promesse tient rarement très longtemps.',
                    'Le catalogue ne résout pas un problème décoratif. Il résout un problème de mémoire. Chaque objet reçoit une ligne stable : ID interne, nom visible, objet de base, hook de modèle, version, tags et notes.'
                ]],
                ['Ce qu’il faut enregistrer', [
                    renderCompactTable(
                        ['Champ', 'Question résolue', 'Pourquoi c’est utile'],
                        [
                            ['ID interne', 'Comment l’équipe reconnaît l’objet côté logique.', 'Évite que deux objets différents partagent la même identité cachée.'],
                            ['Objet de base', 'Quel item vanilla existe toujours dessous.', 'Pratique pour la compatibilité et les vérifications rapides.'],
                            ['Hook visuel', 'Quel item_model ou branche CustomModelData est lié.', 'Garde la partie visuelle traçable.'],
                            ['Tags et notes', 'À quoi sert réellement l’objet.', 'Évite que le registre devienne une liste sans contexte.']
                        ]
                    )
                ]],
                ['Des règles de nommage qui tiennent dans le temps', [
                    '<ul><li>Gardez un style d’ID interne cohérent.</li><li>Laissez les noms visibles rester immersifs, mais gardez les IDs internes lisibles.</li><li>Rangez les exceptions et les conflits à côté de l’objet, pas dans l’historique du chat.</li></ul>'
                ]],
                ['Pourquoi les exports comptent', [
                    'L’export transforme une liste locale en infrastructure d’équipe. JSON sert aux instantanés machine, CSV au tri, Markdown à la doc ou aux canaux de préparation.',
                    'Même si le catalogue commence dans un navigateur, l’export évite qu’il reste prisonnier d’un seul profil.'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Est-ce seulement utile pour les gros serveurs ?', a: 'Non. Le besoin apparaît assez tôt, dès que le nombre d’objets custom dépasse ce que l’équipe peut garder en tête sans friction.' },
                        { q: 'Le nom visible doit-il être identique à l’ID interne ?', a: 'Non. Le nom visible peut rester thématique. L’ID interne doit rester stable et compréhensible pour l’équipe.' },
                        { q: 'Pourquoi ne pas tout laisser dans un tableur ?', a: 'C’est possible, mais un outil dédié détecte plus vite les doublons et colle mieux au reste du workflow du site.' },
                        { q: 'Le catalogue remplace-t-il le custom item builder ?', a: 'Non. Le catalogue organise. Le builder reste l’endroit où l’on génère les commandes.' },
                        { q: 'Cela aide-t-il aussi pour les migrations de pack ?', a: 'Oui. Quand chaque objet possède un objet de base et un hook visuel clairement notés, la migration pack-side devient beaucoup plus calme.' }
                    ])
                ]]
            ]
        },
        de: {
            title: 'Warum euer Server einen Custom-Item-Katalog braucht',
            description: 'Wie ein lokales Item-Register doppelte IDs, widersprüchliche Pack-Hooks und Team-Verwirrung verhindert, sobald Sonderitems zahlreicher werden.',
            lead: 'Ein Item-Katalog ist nicht der glamouröseste Teil des Projekts, aber er spart früh Zeit, sobald auf dem Server mehr als nur ein paar Requisiten, Verträge, Währungen oder Reliquien existieren.',
            cta: 'Custom-Item-Katalog öffnen',
            sections: [
                ['Der Moment, in dem Tabellen entstehen', [
                    'Die meisten Server starten nicht mit einem formalen Register. Sie starten mit ein paar Sonderitems, ein paar Modell-Hooks und dem Versprechen, dass sich alle schon erinnern werden. Genau dieses Versprechen kippt meistens zuerst.',
                    'Ein Katalog löst kein Schönheitsproblem. Er löst ein Gedächtnisproblem. Jedes Item bekommt eine stabile Zeile: interne ID, Anzeigename, Basisitem, Modell-Hook, Version, Tags und Notizen.'
                ]],
                ['Was in den Katalog gehört', [
                    renderCompactTable(
                        ['Feld', 'Welche Frage es beantwortet', 'Warum es zählt'],
                        [
                            ['Interne ID', 'Wie das Team das Item logisch erkennt.', 'Verhindert, dass zwei verschiedene Items dieselbe versteckte Identität teilen.'],
                            ['Basisitem', 'Welches Vanilla-Item darunterliegt.', 'Hilfreich für schnelle Prüfungen und die Pack-Seite.'],
                            ['Visueller Hook', 'Welcher item_model- oder CustomModelData-Zweig verbunden ist.', 'Hält die visuelle Seite nachvollziehbar.'],
                            ['Tags und Notizen', 'Wofür das Item gedacht ist.', 'Bewahrt den Katalog davor, eine kontextlose Liste zu werden.']
                        ]
                    )
                ]],
                ['Namensregeln, die gut altern', [
                    '<ul><li>Haltet einen stabilen Stil für interne IDs.</li><li>Lasst Anzeigenamen atmosphärisch sein, aber interne IDs lesbar.</li><li>Legt Konflikte und Sonderregeln direkt beim Item ab statt im Chatverlauf.</li></ul>'
                ]],
                ['Warum Exporte wichtig sind', [
                    'Ein Export macht aus einer Browserliste Team-Infrastruktur. JSON ist gut für maschinenlesbare Snapshots, CSV für Sortierung, Markdown für Dokumentation und Planungs-Threads.',
                    'Selbst wenn der Katalog lokal beginnt, verhindert der Export, dass er in einem einzigen Browserprofil stecken bleibt.'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Ist das nur für große Server sinnvoll?', a: 'Nein. Der Nutzen beginnt erstaunlich früh, meist in dem Moment, in dem Sonderitems zahlreicher werden als das Team bequem im Kopf behalten kann.' },
                        { q: 'Müssen Anzeigename und interne ID identisch sein?', a: 'Nein. Der Anzeigename darf thematisch bleiben. Die interne ID sollte für das Team stabil und gut lesbar sein.' },
                        { q: 'Warum nicht dauerhaft bei Tabellen bleiben?', a: 'Das geht, aber ein eigener Katalog fängt Dubletten schneller ab und passt besser zum restlichen Workflow der Seite.' },
                        { q: 'Ersetzt der Katalog den Custom-Item-Builder?', a: 'Nein. Der Katalog organisiert. Der Builder erzeugt weiterhin die Befehle.' },
                        { q: 'Hilft das auch bei Pack-Migrationen?', a: 'Ja. Wenn Basisitem und visueller Hook jedes Items festgehalten sind, wird die Pack-Migration deutlich ruhiger.' }
                    ])
                ]]
            ]
        }
    }[locale];

    const body = `
<div class="tool-button-row">
    <a class="tool-button" href="${withPrefix(locale, '/custom-item-catalog/')}">${copy.cta}</a>
    <a class="tool-button tool-button-secondary" href="${withPrefix(locale, '/custom-item-builder/')}">${locale === 'ru' ? 'Открыть custom item builder' : locale === 'fr' ? 'Ouvrir le custom item builder' : locale === 'de' ? 'Custom-Item-Builder öffnen' : 'Open custom item builder'}</a>
</div>
${copy.sections.map(([heading, blocks]) => `<h2>${heading}</h2>${blocks.map((block) => `<div class="article-block">${block}</div>`).join('')}`).join('')}`;

    return {
        title: copy.title,
        description: copy.description,
        lead: copy.lead,
        body
    };
}

function renderCircleDomeToolPage(locale) {
    const copy = {
        en: {
            title: 'Minecraft Circle & Dome Planner',
            description: 'Plan circles, thick rings, arches, and dome profiles for Minecraft builds in a lighter companion to the sphere generator.',
            lead: 'Use this when the full sphere planner is more than you need. Lock the footprint first, check the ring thickness, and read the dome profile before you start stacking blocks in the world.',
            guide: 'Read guide',
            second: 'Open sphere generator',
            panelTitle: 'Shape controls',
            currentTitle: 'Current plan',
            copyPlan: 'Copy plan',
            copied: 'Copied',
            tipsTitle: 'When this planner is enough',
            tips: [
                'Round plazas, towers, ritual rings, wells, and stage footprints.',
                'Dome caps where you mostly care about each radius layer instead of a full sphere shell.',
                'Arches and ring outlines that need a fast readable plan, not a heavy 3D build sheet.'
            ]
        },
        ru: {
            title: 'Планировщик кругов и куполов Minecraft',
            description: 'Планируйте круги, толстые кольца, арки и профили купола как лёгкий companion к генератору сфер.',
            lead: 'Используйте это тогда, когда полный генератор сфер уже слишком тяжёлый. Сначала поймайте отпечаток, проверьте толщину кольца и прочитайте профиль купола до того, как строить его в мире.',
            guide: 'Читать гайд',
            second: 'Открыть генератор сфер',
            panelTitle: 'Управление формой',
            currentTitle: 'Текущий план',
            copyPlan: 'Скопировать план',
            copied: 'Скопировано',
            tipsTitle: 'Когда этого уже достаточно',
            tips: [
                'Круглые площади, башни, ритуальные кольца, колодцы и сценические отпечатки.',
                'Купольные крышки, где важнее радиус каждого слоя, чем полный сферический shell.',
                'Арки и кольцевые контуры, которым нужен быстрый читаемый план, а не тяжёлая 3D-раскладка.'
            ]
        },
        fr: {
            title: 'Planificateur de cercles et dômes Minecraft',
            description: 'Planifiez cercles, anneaux épais, arches et profils de dôme dans un compagnon plus léger que le générateur de sphères.',
            lead: 'Utilisez ce planificateur quand le générateur de sphères complet est trop lourd pour la tâche. Fixez d’abord l’empreinte, vérifiez l’épaisseur de l’anneau et lisez le profil du dôme avant de poser les blocs.',
            guide: 'Lire le guide',
            second: 'Ouvrir le générateur de sphères',
            panelTitle: 'Contrôles de forme',
            currentTitle: 'Plan courant',
            copyPlan: 'Copier le plan',
            copied: 'Copié',
            tipsTitle: 'Quand ce planificateur suffit',
            tips: [
                'Places rondes, tours, anneaux rituels, puits et empreintes de scène.',
                'Coiffes de dôme où le rayon de chaque couche compte plus qu’une sphère complète.',
                'Arches et contours d’anneaux qui ont besoin d’un plan lisible, pas d’une grosse fiche 3D.'
            ]
        },
        de: {
            title: 'Minecraft Kreis- und Kuppelplaner',
            description: 'Plane Kreise, dicke Ringe, Bögen und Kuppelprofile als leichtere Ergänzung zum Kugelgenerator.',
            lead: 'Nutze diesen Planer, wenn der volle Kugelgenerator schon zu viel ist. Lege zuerst die Grundfläche fest, prüfe die Ringstärke und lies das Kuppelprofil, bevor du im Spiel stapelst.',
            guide: 'Anleitung lesen',
            second: 'Kugelgenerator öffnen',
            panelTitle: 'Form-Steuerung',
            currentTitle: 'Aktueller Plan',
            copyPlan: 'Plan kopieren',
            copied: 'Kopiert',
            tipsTitle: 'Wann dieser Planer reicht',
            tips: [
                'Runde Plätze, Türme, Ritualringe, Brunnen und Bühnen-Grundflächen.',
                'Kuppelkappen, bei denen der Radius jeder Lage wichtiger ist als eine vollständige Kugelschale.',
                'Bögen und Ringkonturen, die einen schnellen lesbaren Plan brauchen, keine schwere 3D-Tabelle.'
            ]
        }
    }[locale];

    const body = `
    <section class="page-section tool-layout">
        <div class="tool-primary-column">
            <div class="tool-panel">
                <div class="tool-button-row">
                    <a class="tool-button" href="${withPrefix(locale, '/wiki-circle-dome-planner/')}">${copy.guide}</a>
                    <a class="tool-button tool-button-secondary" href="${withPrefix(locale, '/sphere-generator/')}">${copy.second}</a>
                </div>
            </div>
            <div class="tool-panel">
                <h2>${copy.panelTitle}</h2>
                <div class="tool-form-grid">
                    <div class="tool-field"><label for="cdp-mode">${locale === 'ru' ? 'Режим' : locale === 'fr' ? 'Mode' : locale === 'de' ? 'Modus' : 'Mode'}</label><select id="cdp-mode"><option value="filled_circle">${locale === 'ru' ? 'Заполненный круг' : locale === 'fr' ? 'Cercle plein' : locale === 'de' ? 'Gefüllter Kreis' : 'Filled circle'}</option><option value="outline_circle">${locale === 'ru' ? 'Контур круга' : locale === 'fr' ? 'Contour de cercle' : locale === 'de' ? 'Kreisumriss' : 'Outline circle'}</option><option value="ring">${locale === 'ru' ? 'Толстое кольцо' : locale === 'fr' ? 'Anneau épais' : locale === 'de' ? 'Dicker Ring' : 'Thick ring'}</option><option value="arch">${locale === 'ru' ? 'Арка' : locale === 'fr' ? 'Arche' : locale === 'de' ? 'Bogen' : 'Arch'}</option><option value="dome_profile">${locale === 'ru' ? 'Профиль купола' : locale === 'fr' ? 'Profil de dôme' : locale === 'de' ? 'Kuppelprofil' : 'Dome profile'}</option></select></div>
                    <div class="tool-field"><label for="cdp-radius">${locale === 'ru' ? 'Радиус' : locale === 'fr' ? 'Rayon' : locale === 'de' ? 'Radius' : 'Radius'}</label><input id="cdp-radius" type="number" min="1" max="64" value="8"></div>
                    <div class="tool-field"><label for="cdp-thickness">${locale === 'ru' ? 'Толщина' : locale === 'fr' ? 'Épaisseur' : locale === 'de' ? 'Stärke' : 'Thickness'}</label><input id="cdp-thickness" type="number" min="1" max="12" value="2"></div>
                </div>
            </div>
            <div class="tool-panel">
                <h2>${copy.currentTitle}</h2>
                <div class="planner-grid">
                    <div class="planner-canvas-frame"><canvas id="cdp-canvas" width="600" height="600"></canvas></div>
                    <pre id="cdp-output" class="sphere-text-output"></pre>
                </div>
                <div class="tool-button-row">
                    <button class="tool-button" id="cdp-copy" type="button" data-copied-label="${copy.copied}">${copy.copyPlan}</button>
                </div>
                <div class="catalog-summary-grid" id="cdp-stats"></div>
                <div class="planner-stack-list" id="cdp-stack"></div>
            </div>
        </div>
        <aside class="tool-secondary-column">
            <div class="tool-panel">
                <h2>${copy.tipsTitle}</h2>
                <ul class="item-builder-help">${copy.tips.map((item) => `<li>${item}</li>`).join('')}</ul>
            </div>
        </aside>
    </section>`;

    return {
        title: copy.title,
        description: copy.description,
        lead: copy.lead,
        body
    };
}

function renderCircleDomeGuide(locale) {
    const copy = {
        en: {
            title: 'How to use the circle and dome planner in Minecraft',
            description: 'A practical guide to circles, rings, arches, and dome profiles when you need a lighter planner than a full sphere generator.',
            lead: 'Not every rounded build starts as a sphere. Sometimes you only need the footprint, the ring, or the dome stack. This planner is for those moments.',
            cta: 'Open circle & dome planner',
            sections: [
                ['Use the lighter tool when the question is smaller', [
                    'The sphere generator is great when you need a real shell and want to browse one slice at a time. But plenty of builds stop earlier than that. A plaza needs a circle. A tower roof needs a dome profile. A gate needs an arch. Those shapes do not need the full weight of a sphere workflow.',
                    'That is where the companion planner helps. It answers the footprint first and the layer stack second.'
                ]],
                ['Which mode should you pick?', [
                    renderCompactTable(
                        ['Mode', 'Best for', 'What to watch'],
                        [
                            ['Filled circle', 'Plazas, pads, tower floors', 'Read the total span before you commit.'],
                            ['Outline circle', 'Perimeter guides, decorative frames', 'Thin outlines look cleaner at larger radii.'],
                            ['Thick ring', 'Arena borders, wells, ritual zones', 'Thickness changes the visual weight faster than most people expect.'],
                            ['Arch', 'Gateways, windows, stage framing', 'Watch the crown so it does not flatten.'],
                            ['Dome profile', 'Caps, observatories, shrines', 'Use the stack list to build each radius layer cleanly.']
                        ]
                    )
                ]],
                ['A practical build order', [
                    '<ol><li>Choose the footprint first.</li><li>Check whether the thickness feels decorative or structural.</li><li>For domes, read the stack list before you place the first ring.</li><li>Copy the text plan when another builder will help finish the shape.</li></ol>'
                ]],
                ['Common mistakes', [
                    '<ul><li>Using a thick ring where a thin outline would read cleaner.</li><li>Trying to improvise an arch height without checking the profile first.</li><li>Building a dome from the top down instead of from the widest layers upward.</li><li>Jumping to the full sphere tool when the build question is still only two-dimensional.</li></ul>'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'When should I switch back to the sphere generator?', a: 'When the whole shell matters and you need each horizontal slice, not just the footprint or dome profile.' },
                        { q: 'Why keep the text plan if the canvas already exists?', a: 'Because text is easy to paste into notes, chats, or build checklists for someone else.' },
                        { q: 'Is ring thickness mostly cosmetic?', a: 'Partly, but it also changes how structural the build feels. One extra block can make a ring stop reading as delicate and start reading as heavy.' },
                        { q: 'Can I use the dome profile for roofs?', a: 'Yes. That is one of the most practical uses: caps, observatories, round towers, and shrine roofs.' },
                        { q: 'Does this replace the sphere generator?', a: 'No. It is a companion for smaller rounded decisions, not a replacement for full shells.' }
                    ])
                ]]
            ]
        },
        ru: {
            title: 'Как пользоваться планировщиком кругов и куполов в Minecraft',
            description: 'Практический гайд по кругам, кольцам, аркам и профилям купола, когда полный генератор сфер уже избыточен.',
            lead: 'Не каждая округлая постройка начинается как полноценная сфера. Иногда нужен только отпечаток, кольцо или стек профиля купола. Этот инструмент как раз для таких задач.',
            cta: 'Открыть планировщик кругов и куполов',
            sections: [
                ['Берите более лёгкий инструмент, когда и вопрос меньше', [
                    'Генератор сфер хорош, когда нужен настоящий shell и хочется смотреть на форму слой за слоем. Но много построек обрываются раньше. Площади нужен круг. Крыше башни нужен профиль купола. Воротам нужна арка.',
                    'Для таких задач companion-планировщик полезнее: сначала он отвечает за отпечаток, а потом уже за стек слоёв.'
                ]],
                ['Какой режим выбрать?', [
                    renderCompactTable(
                        ['Режим', 'Для чего подходит', 'На что смотреть'],
                        [
                            ['Заполненный круг', 'Площади, платформы, полы башен', 'Сначала проверьте общий диаметр.'],
                            ['Контур круга', 'Границы, рамки, орнамент', 'Тонкий контур на больших радиусах читается чище.'],
                            ['Толстое кольцо', 'Арены, колодцы, ритуальные зоны', 'Толщина меняет визуальный вес быстрее, чем кажется.'],
                            ['Арка', 'Ворота, окна, сценические проёмы', 'Следите, чтобы корона не сплющилась.'],
                            ['Профиль купола', 'Крышки, обсерватории, святилища', 'Стек слоёв помогает строить купол без угадывания.']
                        ]
                    )
                ]],
                ['Практический порядок сборки', [
                    '<ol><li>Сначала выберите отпечаток.</li><li>Проверьте, ощущается ли толщина декоративной или уже конструктивной.</li><li>Для куполов сначала прочитайте стек слоёв, а потом ставьте первое кольцо.</li><li>Копируйте текстовый план, если строить будет ещё кто-то из команды.</li></ol>'
                ]],
                ['Типичные ошибки', [
                    '<ul><li>Брать толстое кольцо там, где тонкий контур дал бы более чистое чтение.</li><li>Импровизировать высоту арки, не посмотрев профиль.</li><li>Строить купол сверху вниз вместо того, чтобы идти от широких слоёв вверх.</li><li>Перепрыгивать в генератор сфер, когда задача всё ещё двумерная.</li></ul>'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Когда пора возвращаться к генератору сфер?', a: 'Когда важен уже весь shell и нужен каждый горизонтальный слой, а не только отпечаток или профиль купола.' },
                        { q: 'Зачем оставлять текстовый план, если есть canvas?', a: 'Потому что текст легко кидается в заметки, чат или билд-лист для второго строителя.' },
                        { q: 'Толщина кольца — это в основном косметика?', a: 'Частично, но ещё это вопрос ощущения веса. Лишний блок толщины быстро переводит форму из лёгкой в тяжёлую.' },
                        { q: 'Можно ли использовать профиль купола для крыш?', a: 'Да, это один из самых практичных сценариев: башни, обсерватории, святилища и круглые павильоны.' },
                        { q: 'Это заменяет генератор сфер?', a: 'Нет. Это companion для более маленьких округлых задач, а не замена полным shell-планам.' }
                    ])
                ]]
            ]
        },
        fr: {
            title: 'Comment utiliser le planificateur de cercles et dômes dans Minecraft',
            description: 'Guide pratique pour cercles, anneaux, arches et profils de dôme quand le générateur de sphères est plus lourd que nécessaire.',
            lead: 'Toutes les formes rondes ne commencent pas comme une sphère complète. Parfois il faut seulement l’empreinte, l’anneau ou la pile de rayons d’un dôme. Ce guide sert précisément à ces cas.',
            cta: 'Ouvrir le planificateur de cercles et dômes',
            sections: [
                ['Prendre l’outil léger quand la question est plus petite', [
                    'Le générateur de sphères est utile quand la coque entière compte et que chaque couche horizontale importe. Mais beaucoup de constructions s’arrêtent avant cela. Une place demande un cercle. Un toit de tour demande un profil de dôme. Une porte demande une arche.',
                    'Le compagnon est meilleur ici, parce qu’il répond d’abord à l’empreinte puis à l’empilement.'
                ]],
                ['Quel mode choisir ?', [
                    renderCompactTable(
                        ['Mode', 'Idéal pour', 'Point de vigilance'],
                        [
                            ['Cercle plein', 'Places, sols de tours, plateformes', 'Vérifiez l’envergure totale avant de construire.'],
                            ['Contour de cercle', 'Cadres, bordures, ornements', 'Un contour fin lit mieux sur les grands rayons.'],
                            ['Anneau épais', 'Arènes, puits, zones rituelles', 'L’épaisseur change très vite le poids visuel.'],
                            ['Arche', 'Portes, fenêtres, scène', 'Surveillez le sommet pour éviter l’écrasement.'],
                            ['Profil de dôme', 'Toits, observatoires, sanctuaires', 'La pile de rayons guide la construction proprement.']
                        ]
                    )
                ]],
                ['Ordre de construction conseillé', [
                    '<ol><li>Choisissez d’abord l’empreinte.</li><li>Décidez si l’épaisseur doit paraître décorative ou structurelle.</li><li>Pour un dôme, lisez la pile avant de poser le premier anneau.</li><li>Copiez le plan texte si quelqu’un d’autre aide à finir la forme.</li></ol>'
                ]],
                ['Erreurs fréquentes', [
                    '<ul><li>Utiliser un anneau épais là où un contour fin serait plus élégant.</li><li>Improviser la hauteur d’une arche sans vérifier le profil.</li><li>Construire un dôme du haut vers le bas au lieu de partir des couches larges.</li><li>Passer au générateur de sphères alors que la question est encore purement 2D.</li></ul>'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Quand faut-il revenir au générateur de sphères ?', a: 'Quand la coque entière compte et que vous avez besoin de chaque tranche horizontale, pas seulement de l’empreinte ou du profil.' },
                        { q: 'Pourquoi garder le plan texte si le canevas existe déjà ?', a: 'Parce que le texte se partage facilement dans des notes, des messages ou une checklist de construction.' },
                        { q: 'L’épaisseur d’un anneau est-elle surtout esthétique ?', a: 'En partie, mais elle change aussi la sensation de poids de la forme. Un seul bloc de plus peut rendre l’ensemble beaucoup plus massif.' },
                        { q: 'Puis-je utiliser le profil de dôme pour les toits ?', a: 'Oui. C’est même l’un des usages les plus pratiques pour les tours, observatoires, sanctuaires et pavillons ronds.' },
                        { q: 'Est-ce que cela remplace le générateur de sphères ?', a: 'Non. C’est un compagnon pour des décisions rondes plus petites, pas un remplaçant pour les coques complètes.' }
                    ])
                ]]
            ]
        },
        de: {
            title: 'Wie man den Kreis- und Kuppelplaner in Minecraft benutzt',
            description: 'Ein praktischer Leitfaden für Kreise, Ringe, Bögen und Kuppelprofile, wenn der Kugelgenerator mehr ist als die Aufgabe gerade braucht.',
            lead: 'Nicht jede runde Konstruktion beginnt als volle Kugel. Manchmal braucht ihr nur die Grundfläche, den Ring oder die Radienfolge einer Kuppel. Genau dafür ist dieser Planer gedacht.',
            cta: 'Kreis- und Kuppelplaner öffnen',
            sections: [
                ['Das leichtere Werkzeug nehmen, wenn die Frage kleiner ist', [
                    'Der Kugelgenerator ist stark, wenn die ganze Schale zählt und jede horizontale Lage wichtig wird. Viele Bauten enden aber vorher. Ein Platz braucht einen Kreis. Ein Turmdach braucht ein Kuppelprofil. Ein Tor braucht einen Bogen.',
                    'Hier ist der Begleiter besser, weil er zuerst die Grundfläche und danach den Schichtenstapel beantwortet.'
                ]],
                ['Welchen Modus sollte man wählen?', [
                    renderCompactTable(
                        ['Modus', 'Gut für', 'Worauf achten'],
                        [
                            ['Gefüllter Kreis', 'Plätze, Turmböden, Podeste', 'Vorher die Gesamtspanne prüfen.'],
                            ['Kreisumriss', 'Rahmen, Grenzen, Ornamente', 'Dünne Umrisse lesen sich bei großen Radien sauberer.'],
                            ['Dicker Ring', 'Arenen, Brunnen, Ritualzonen', 'Die Stärke verändert das optische Gewicht sehr schnell.'],
                            ['Bogen', 'Tore, Fenster, Bühnenrahmen', 'Die Krone darf nicht zu früh abflachen.'],
                            ['Kuppelprofil', 'Dächer, Observatorien, Schreine', 'Die Lagenliste hilft beim sauberen Aufbau.']
                        ]
                    )
                ]],
                ['Empfohlene Bau-Reihenfolge', [
                    '<ol><li>Zuerst die Grundfläche festlegen.</li><li>Dann prüfen, ob die Ringstärke dekorativ oder strukturell wirken soll.</li><li>Bei Kuppeln erst den Lagenstapel lesen und dann den ersten Ring setzen.</li><li>Den Textplan kopieren, wenn ein weiterer Builder mitarbeitet.</li></ol>'
                ]],
                ['Häufige Fehler', [
                    '<ul><li>Einen dicken Ring verwenden, wo ein dünner Umriss sauberer gewesen wäre.</li><li>Eine Bogenhöhe improvisieren, ohne das Profil zu prüfen.</li><li>Eine Kuppel von oben nach unten bauen statt von den breiten Lagen aufwärts.</li><li>Zum Kugelgenerator springen, obwohl die Frage noch komplett zweidimensional ist.</li></ul>'
                ]],
                ['FAQ', [
                    renderFaq([
                        { q: 'Wann sollte ich wieder zum Kugelgenerator wechseln?', a: 'Wenn die ganze Schale wichtig wird und ihr jede horizontale Lage braucht, nicht nur Grundfläche oder Kuppelprofil.' },
                        { q: 'Warum den Textplan behalten, wenn es schon ein Canvas gibt?', a: 'Weil sich Text leicht in Notizen, Chats oder Baulisten für andere Menschen einfügen lässt.' },
                        { q: 'Ist die Ringstärke nur Kosmetik?', a: 'Teilweise, aber sie verändert auch das statische Gefühl der Form. Ein zusätzlicher Block kann eine Struktur sofort schwerer wirken lassen.' },
                        { q: 'Kann ich das Kuppelprofil für Dächer nutzen?', a: 'Ja. Das ist einer der praktischsten Einsätze für Türme, Observatorien, Schreine und runde Pavillons.' },
                        { q: 'Ersetzt das den Kugelgenerator?', a: 'Nein. Es ist ein Begleiter für kleinere runde Entscheidungen, kein Ersatz für vollständige Kugelschalen.' }
                    ])
                ]]
            ]
        }
    }[locale];

    const body = `
<div class="tool-button-row">
    <a class="tool-button" href="${withPrefix(locale, '/circle-dome-planner/')}">${copy.cta}</a>
    <a class="tool-button tool-button-secondary" href="${withPrefix(locale, '/sphere-generator/')}">${locale === 'ru' ? 'Открыть генератор сфер' : locale === 'fr' ? 'Ouvrir le générateur de sphères' : locale === 'de' ? 'Kugelgenerator öffnen' : 'Open sphere generator'}</a>
</div>
${copy.sections.map(([heading, blocks]) => `<h2>${heading}</h2>${blocks.map((block) => `<div class="article-block">${block}</div>`).join('')}`).join('')}`;

    return {
        title: copy.title,
        description: copy.description,
        lead: copy.lead,
        body
    };
}

function itemModelBuilderCss() {
    return `
.tool-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(280px,0.85fr);gap:24px}
.tool-primary-column,.tool-secondary-column{display:grid;gap:24px;align-content:start}
.imb-branch-section{display:grid;gap:14px;margin-top:18px}
.section-heading{display:flex;justify-content:space-between;align-items:center;gap:16px}
.imb-branch-list{display:grid;gap:14px}
.imb-branch-card{border:1px solid rgba(116,161,255,.22);background:rgba(18,24,48,.74);border-radius:16px;padding:16px;display:grid;gap:14px}
.imb-branch-actions{display:flex;justify-content:flex-end}
@media (max-width: 980px){.tool-layout{grid-template-columns:1fr}}
`;
}

function customItemCatalogCss() {
    return `
.tool-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.85fr);gap:24px}
.tool-primary-column,.tool-secondary-column{display:grid;gap:24px;align-content:start}
.catalog-summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-top:18px}
.catalog-entry-list{display:grid;gap:14px;margin-top:18px}
.catalog-entry{border:1px solid rgba(116,161,255,.22);background:rgba(18,24,48,.72);border-radius:16px;padding:16px;display:grid;gap:10px}
.catalog-entry-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.catalog-entry-tags{display:flex;flex-wrap:wrap;gap:8px}
.catalog-chip{padding:6px 10px;border-radius:999px;background:rgba(65,115,222,.18);border:1px solid rgba(116,161,255,.22);font-size:13px;color:#dfe8ff}
.catalog-entry-actions{display:flex;flex-wrap:wrap;gap:10px}
@media (max-width: 980px){.tool-layout{grid-template-columns:1fr}}
`;
}

function circleDomePlannerCss() {
    return `
.tool-layout{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.8fr);gap:24px}
.tool-primary-column,.tool-secondary-column{display:grid;gap:24px;align-content:start}
.planner-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,.8fr);gap:18px}
.planner-canvas-frame{border:1px solid rgba(116,161,255,.18);border-radius:18px;background:linear-gradient(180deg,rgba(13,19,39,.96),rgba(8,12,24,.92));padding:18px;min-height:420px}
.planner-canvas-frame canvas{width:100%;height:auto;display:block;image-rendering:pixelated}
.planner-stack-list{display:grid;gap:10px;margin-top:18px}
.planner-stack-row{display:flex;justify-content:space-between;gap:12px;padding:10px 12px;border-radius:12px;background:rgba(65,115,222,.12);border:1px solid rgba(116,161,255,.18)}
@media (max-width: 980px){.tool-layout,.planner-grid{grid-template-columns:1fr}}
`;
}

function itemModelBuilderJs() {
    return `
(function () {
    const copy = {
        en: {
            modeOptions: {
                model: ['Direct model', ['minecraft:model']],
                select: ['Select by property', ['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context']],
                range_dispatch: ['Range dispatch', ['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data']],
                condition: ['Condition', ['minecraft:using_item','minecraft:damaged','minecraft:selected']]
            },
            branchWhen: 'When',
            branchModel: 'Model path',
            branchThreshold: 'Threshold',
            branchDelete: 'Remove',
            summary: (filePath, mode, count) => \`File: \${filePath}. Mode: \${mode}. Branches: \${count}.\`,
            examples: {
                model: { ns:'cubeinsquare', file:'paper/guild_pass', fallback:'cubeinsquare:item/paper/guild_pass' },
                select: { ns:'cubeinsquare', file:'book/formulary', fallback:'minecraft:item/book', property:'minecraft:custom_model_data', index:0, branches:[{when:'novice',model:'cubeinsquare:item/book/formulary_novice'},{when:'master',model:'cubeinsquare:item/book/formulary_master'}] },
                range_dispatch: { ns:'cubeinsquare', file:'wand/charge', fallback:'cubeinsquare:item/wand/charge_0', property:'minecraft:damage', branches:[{when:'0.25',model:'cubeinsquare:item/wand/charge_1'},{when:'0.6',model:'cubeinsquare:item/wand/charge_2'}] },
                condition: { ns:'cubeinsquare', file:'compass/selected', fallback:'cubeinsquare:item/compass_idle', property:'minecraft:selected', branches:[{when:'true',model:'cubeinsquare:item/compass_selected'},{when:'false',model:'cubeinsquare:item/compass_idle'}] }
            }
        },
        ru: {
            modeOptions: {
                model: ['Прямая model', ['minecraft:model']],
                select: ['Select по свойству', ['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context']],
                range_dispatch: ['Range dispatch', ['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data']],
                condition: ['Condition', ['minecraft:using_item','minecraft:damaged','minecraft:selected']]
            },
            branchWhen: 'Когда',
            branchModel: 'Путь модели',
            branchThreshold: 'Порог',
            branchDelete: 'Убрать',
            summary: (filePath, mode, count) => \`Файл: \${filePath}. Режим: \${mode}. Веток: \${count}.\`,
            examples: {}
        },
        fr: {
            modeOptions: {
                model: ['Model direct', ['minecraft:model']],
                select: ['Select par propriété', ['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context']],
                range_dispatch: ['Range dispatch', ['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data']],
                condition: ['Condition', ['minecraft:using_item','minecraft:damaged','minecraft:selected']]
            },
            branchWhen: 'Quand',
            branchModel: 'Chemin du modèle',
            branchThreshold: 'Seuil',
            branchDelete: 'Retirer',
            summary: (filePath, mode, count) => \`Fichier : \${filePath}. Mode : \${mode}. Branches : \${count}.\`,
            examples: {}
        },
        de: {
            modeOptions: {
                model: ['Direktes model', ['minecraft:model']],
                select: ['Select nach Eigenschaft', ['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context']],
                range_dispatch: ['Range dispatch', ['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data']],
                condition: ['Condition', ['minecraft:using_item','minecraft:damaged','minecraft:selected']]
            },
            branchWhen: 'Wenn',
            branchModel: 'Modellpfad',
            branchThreshold: 'Schwelle',
            branchDelete: 'Entfernen',
            summary: (filePath, mode, count) => \`Datei: \${filePath}. Modus: \${mode}. Zweige: \${count}.\`,
            examples: {}
        }
    };

    const lang = document.documentElement.lang || 'en';
    const locale = copy[lang] || copy.en;
    locale.examples = copy.en.examples;

    const modeInput = document.getElementById('imb-mode');
    const namespaceInput = document.getElementById('imb-namespace');
    const fileInput = document.getElementById('imb-file');
    const fallbackInput = document.getElementById('imb-fallback');
    const propertyInput = document.getElementById('imb-property');
    const indexInput = document.getElementById('imb-index');
    const indexField = document.querySelector('[data-imb-index-field]');
    const propertyField = document.querySelector('[data-imb-property-field]');
    const branchList = document.getElementById('imb-branch-list');
    const output = document.getElementById('imb-output');
    const summary = document.getElementById('imb-summary');
    const copyButton = document.getElementById('imb-copy');

    function buildBranchRow(mode, value = {}) {
        const card = document.createElement('div');
        card.className = 'imb-branch-card';
        const whenLabel = mode === 'range_dispatch' ? locale.branchThreshold : locale.branchWhen;
        const whenValue = value.when || '';
        const modelValue = value.model || '';
        card.innerHTML = \`
            <div class="tool-form-grid">
                <div class="tool-field">
                    <label>\${whenLabel}</label>
                    <input class="imb-when" type="text" value="\${whenValue}">
                </div>
                <div class="tool-field">
                    <label>\${locale.branchModel}</label>
                    <input class="imb-model" type="text" value="\${modelValue}">
                </div>
            </div>
            <div class="imb-branch-actions">
                <button class="tool-button tool-button-secondary imb-remove" type="button">\${locale.branchDelete}</button>
            </div>
        \`;
        card.querySelector('.imb-remove').addEventListener('click', () => {
            card.remove();
            update();
        });
        card.querySelectorAll('input').forEach((input) => input.addEventListener('input', update));
        return card;
    }

    function getBranchData() {
        return Array.from(branchList.querySelectorAll('.imb-branch-card')).map((card) => ({
            when: card.querySelector('.imb-when').value.trim(),
            model: card.querySelector('.imb-model').value.trim()
        })).filter((branch) => branch.model);
    }

    function populatePropertyOptions() {
        const [label, options] = locale.modeOptions[modeInput.value];
        propertyInput.innerHTML = options.map((option) => \`<option value="\${option}">\${option}</option>\`).join('');
        propertyField.hidden = modeInput.value === 'model';
        indexField.hidden = !(modeInput.value === 'select' && propertyInput.value === 'minecraft:custom_model_data');
    }

    function definitionObject() {
        const fallbackModel = fallbackInput.value.trim() || 'minecraft:item/paper';
        const branches = getBranchData();
        if (modeInput.value === 'model') {
            return { model: { type: 'minecraft:model', model: fallbackModel } };
        }
        if (modeInput.value === 'select') {
            const model = {
                type: 'minecraft:select',
                property: propertyInput.value,
                cases: branches.map((branch) => ({
                    when: /^-?\\d+(\\.\\d+)?$/.test(branch.when) ? Number(branch.when) : branch.when,
                    model: { type: 'minecraft:model', model: branch.model }
                })),
                fallback: { type: 'minecraft:model', model: fallbackModel }
            };
            if (propertyInput.value === 'minecraft:custom_model_data') {
                model.index = Number(indexInput.value || 0);
            }
            return { model };
        }
        if (modeInput.value === 'range_dispatch') {
            return {
                model: {
                    type: 'minecraft:range_dispatch',
                    property: propertyInput.value,
                    entries: branches.map((branch) => ({
                        threshold: Number(branch.when || 0),
                        model: { type: 'minecraft:model', model: branch.model }
                    })).sort((a, b) => a.threshold - b.threshold),
                    fallback: { type: 'minecraft:model', model: fallbackModel }
                }
            };
        }
        return {
            model: {
                type: 'minecraft:condition',
                property: propertyInput.value,
                on_true: { type: 'minecraft:model', model: branches[0]?.model || fallbackModel },
                on_false: { type: 'minecraft:model', model: branches[1]?.model || fallbackModel }
            }
        };
    }

    function update() {
        populatePropertyOptions();
        const filePath = \`assets/\${namespaceInput.value.trim() || 'minecraft'}/items/\${fileInput.value.trim() || 'item'}.json\`;
        const json = JSON.stringify(definitionObject(), null, 2);
        output.value = json;
        summary.textContent = locale.summary(filePath, modeInput.value, getBranchData().length);
    }

    function loadExample(kind) {
        const example = locale.examples[kind];
        namespaceInput.value = example.ns;
        fileInput.value = example.file;
        fallbackInput.value = example.fallback;
        modeInput.value = kind;
        populatePropertyOptions();
        if (example.property) propertyInput.value = example.property;
        if (typeof example.index !== 'undefined') indexInput.value = example.index;
        branchList.innerHTML = '';
        (example.branches || []).forEach((branch) => branchList.appendChild(buildBranchRow(kind, branch)));
        if (!(example.branches || []).length && kind === 'condition') {
            branchList.appendChild(buildBranchRow(kind, { when: 'true', model: example.fallback }));
            branchList.appendChild(buildBranchRow(kind, { when: 'false', model: example.fallback }));
        }
        update();
    }

    document.getElementById('imb-add-case').addEventListener('click', () => {
        branchList.appendChild(buildBranchRow(modeInput.value));
        update();
    });
    document.getElementById('imb-load-example').addEventListener('click', () => loadExample(modeInput.value));
    document.getElementById('imb-reset').addEventListener('click', () => loadExample('select'));
    copyButton.addEventListener('click', async () => {
        await navigator.clipboard.writeText(output.value);
        const original = copyButton.textContent;
        copyButton.textContent = copyButton.dataset.copiedLabel || original;
        setTimeout(() => { copyButton.textContent = original; }, 1400);
    });

    [modeInput, namespaceInput, fileInput, fallbackInput, propertyInput, indexInput].forEach((input) => {
        input.addEventListener('input', update);
        input.addEventListener('change', update);
    });
    propertyInput.addEventListener('change', update);
    modeInput.addEventListener('change', () => {
        if (modeInput.value === 'condition' && branchList.children.length < 2) {
            branchList.innerHTML = '';
            branchList.appendChild(buildBranchRow('condition', { when: 'true', model: fallbackInput.value.trim() || 'minecraft:item/paper' }));
            branchList.appendChild(buildBranchRow('condition', { when: 'false', model: fallbackInput.value.trim() || 'minecraft:item/paper' }));
        }
        update();
    });

    loadExample('select');
})();
`;
}

function customItemCatalogJs() {
    return `
(function () {
    const STORAGE_KEY = 'cubeinsquare-custom-item-catalog-v1';
    const lang = document.documentElement.lang || 'en';
    const copy = {
        en: { empty:'No entries yet. Add one item and the catalog starts doing the memory work for you.', items:'Items', duplicates:'Duplicate IDs', visuals:'Duplicate hooks', edit:'Edit', remove:'Remove', copied:'Copied', noMatches:'No matching items.' },
        ru: { empty:'Пока записей нет. Добавьте один предмет, и каталог начнёт держать память за вас.', items:'Предметы', duplicates:'Дубли ID', visuals:'Дубли хуков', edit:'Редактировать', remove:'Удалить', copied:'Скопировано', noMatches:'Совпадений нет.' },
        fr: { empty:'Aucune entrée pour le moment. Ajoutez un premier objet et le catalogue prendra déjà le relais de la mémoire.', items:'Objets', duplicates:'IDs en double', visuals:'Hooks en double', edit:'Modifier', remove:'Supprimer', copied:'Copié', noMatches:'Aucun objet correspondant.' },
        de: { empty:'Noch keine Einträge. Füge das erste Item hinzu, dann übernimmt der Katalog bereits einen Teil der Erinnerungsarbeit.', items:'Items', duplicates:'Doppelte IDs', visuals:'Doppelte Hooks', edit:'Bearbeiten', remove:'Löschen', copied:'Kopiert', noMatches:'Keine passenden Items.' }
    }[lang] || { empty:'No entries yet.', items:'Items', duplicates:'Duplicate IDs', visuals:'Duplicate hooks', edit:'Edit', remove:'Remove', copied:'Copied', noMatches:'No matches.' };

    const fields = {
        id: document.getElementById('cic-id'),
        name: document.getElementById('cic-name'),
        base: document.getElementById('cic-base'),
        version: document.getElementById('cic-version'),
        hidden: document.getElementById('cic-hidden'),
        model: document.getElementById('cic-model'),
        cmd: document.getElementById('cic-cmd'),
        tags: document.getElementById('cic-tags'),
        notes: document.getElementById('cic-notes')
    };
    const search = document.getElementById('cic-search');
    const stats = document.getElementById('cic-stats');
    const list = document.getElementById('cic-list');
    let editingId = null;

    function loadCatalog() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (error) { return []; }
    }
    function saveCatalog(entries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }
    function formEntry() {
        return {
            id: fields.id.value.trim(),
            name: fields.name.value.trim(),
            base: fields.base.value.trim(),
            version: fields.version.value,
            hidden: fields.hidden.value.trim(),
            model: fields.model.value.trim(),
            cmd: fields.cmd.value.trim(),
            tags: fields.tags.value.split(',').map((tag) => tag.trim()).filter(Boolean),
            notes: fields.notes.value.trim()
        };
    }
    function resetForm() {
        Object.values(fields).forEach((field) => {
            if (field.tagName === 'SELECT') field.selectedIndex = 0;
            else field.value = '';
        });
        editingId = null;
    }
    function duplicateStats(entries) {
        const idMap = new Map();
        const modelMap = new Map();
        entries.forEach((entry) => {
            if (entry.hidden) idMap.set(entry.hidden, (idMap.get(entry.hidden) || 0) + 1);
            if (entry.model || entry.cmd) modelMap.set(\`\${entry.model}|\${entry.cmd}\`, (modelMap.get(\`\${entry.model}|\${entry.cmd}\`) || 0) + 1);
        });
        return {
            duplicateIds: Array.from(idMap.values()).filter((count) => count > 1).reduce((sum, count) => sum + count, 0),
            duplicateHooks: Array.from(modelMap.values()).filter((count) => count > 1).reduce((sum, count) => sum + count, 0)
        };
    }
    function render() {
        const entries = loadCatalog();
        const query = search.value.trim().toLowerCase();
        const filtered = entries.filter((entry) => !query || JSON.stringify(entry).toLowerCase().includes(query));
        const dupes = duplicateStats(entries);
        stats.innerHTML = [
            [copy.items, entries.length],
            [copy.duplicates, dupes.duplicateIds],
            [copy.visuals, dupes.duplicateHooks]
        ].map(([label, value]) => \`<div class="sphere-stat-card"><strong>\${value}</strong><span>\${label}</span></div>\`).join('');

        if (!entries.length) {
            list.innerHTML = \`<p class="tool-summary">\${copy.empty}</p>\`;
            return;
        }
        if (!filtered.length) {
            list.innerHTML = \`<p class="tool-summary">\${copy.noMatches}</p>\`;
            return;
        }
        list.innerHTML = filtered.map((entry) => \`
            <article class="catalog-entry">
                <div class="catalog-entry-head">
                    <div><strong>\${entry.name || entry.id || entry.hidden || 'Item'}</strong><p class="tool-summary">\${entry.base || 'paper'} • \${entry.hidden || '—'} • \${entry.version}</p></div>
                    <div class="catalog-entry-actions">
                        <button class="tool-button tool-button-secondary" type="button" data-action="edit" data-id="\${entry.id}">\${copy.edit}</button>
                        <button class="tool-button tool-button-secondary" type="button" data-action="copy" data-id="\${entry.id}">JSON</button>
                        <button class="tool-button tool-button-secondary" type="button" data-action="delete" data-id="\${entry.id}">\${copy.remove}</button>
                    </div>
                </div>
                <p>\${entry.notes || ''}</p>
                <div class="catalog-entry-tags">\${(entry.tags || []).map((tag) => \`<span class="catalog-chip">\${tag}</span>\`).join('')}</div>
            </article>
        \`).join('');

        list.querySelectorAll('button[data-action]').forEach((button) => {
            const entry = entries.find((item) => item.id === button.dataset.id);
            if (!entry) return;
            button.addEventListener('click', async () => {
                if (button.dataset.action === 'edit') {
                    editingId = entry.id;
                    fields.id.value = entry.id || '';
                    fields.name.value = entry.name || '';
                    fields.base.value = entry.base || '';
                    fields.version.value = entry.version || 'modern';
                    fields.hidden.value = entry.hidden || '';
                    fields.model.value = entry.model || '';
                    fields.cmd.value = entry.cmd || '';
                    fields.tags.value = (entry.tags || []).join(', ');
                    fields.notes.value = entry.notes || '';
                }
                if (button.dataset.action === 'copy') {
                    await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
                    const original = button.textContent;
                    button.textContent = copy.copied;
                    setTimeout(() => { button.textContent = original; }, 1200);
                }
                if (button.dataset.action === 'delete') {
                    saveCatalog(entries.filter((item) => item.id !== entry.id));
                    if (editingId === entry.id) resetForm();
                    render();
                }
            });
        });
    }

    function exportContent(type) {
        const entries = loadCatalog();
        if (!entries.length) return;
        let text = '';
        let mime = 'text/plain;charset=utf-8';
        let ext = 'txt';
        if (type === 'json') { text = JSON.stringify(entries, null, 2); mime = 'application/json'; ext = 'json'; }
        if (type === 'csv') {
            const rows = [['id','name','base','version','hidden','model','cmd','tags','notes']];
            entries.forEach((entry) => rows.push([entry.id, entry.name, entry.base, entry.version, entry.hidden, entry.model, entry.cmd, (entry.tags || []).join('|'), entry.notes]));
            text = rows.map((row) => row.map((cell) => \`"\${String(cell || '').replaceAll('"','""')}"\`).join(',')).join('\\n');
            mime = 'text/csv;charset=utf-8';
            ext = 'csv';
        }
        if (type === 'md') {
            text = ['| ID | Name | Base | Hidden ID | Model / CMD |', '|---|---|---|---|---|', ...entries.map((entry) => \`| \${entry.id || ''} | \${entry.name || ''} | \${entry.base || ''} | \${entry.hidden || ''} | \${entry.model || entry.cmd || ''} |\`)].join('\\n');
            mime = 'text/markdown;charset=utf-8';
            ext = 'md';
        }
        const url = URL.createObjectURL(new Blob([text], { type: mime }));
        const link = document.createElement('a');
        link.href = url;
        link.download = \`custom-item-catalog.\${ext}\`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    document.getElementById('cic-save').addEventListener('click', () => {
        const entry = formEntry();
        if (!entry.id) return;
        const entries = loadCatalog();
        const next = editingId ? entries.map((item) => item.id === editingId ? entry : item) : [...entries.filter((item) => item.id !== entry.id), entry];
        saveCatalog(next);
        resetForm();
        render();
    });
    document.getElementById('cic-reset').addEventListener('click', () => { resetForm(); });
    document.getElementById('cic-example').addEventListener('click', () => {
        fields.id.value = 'guild-pass';
        fields.name.value = 'Guild archive pass';
        fields.base.value = 'paper';
        fields.version.value = 'modern';
        fields.hidden.value = 'rp.guild.pass';
        fields.model.value = 'cubeinsquare:item/paper/guild_pass';
        fields.cmd.value = 'guild_pass';
        fields.tags.value = 'guild, pass, archive';
        fields.notes.value = 'Used for guarded rooms and scripted checks.';
    });
    document.getElementById('cic-export-json').addEventListener('click', () => exportContent('json'));
    document.getElementById('cic-export-csv').addEventListener('click', () => exportContent('csv'));
    document.getElementById('cic-export-md').addEventListener('click', () => exportContent('md'));
    search.addEventListener('input', render);
    render();
})();
`;
}

function circleDomePlannerJs() {
    return `
(function () {
    const lang = document.documentElement.lang || 'en';
    const copy = {
        en: { noteFilled:'Use filled circles for plazas, pads, or tower floors.', noteOutline:'Use outline circles for borders and crisp round frames.', noteRing:'Rings are good when a border needs thickness and weight.', noteArch:'Arches help when you care about a side profile more than a footprint.', noteDome:'Use the dome profile as a stack of radii for roofs and caps.', width:'Width', cells:'Blocks', layers:'Layers', copied:'Copied' },
        ru: { noteFilled:'Заполненный круг подходит для площадей, платформ и полов башен.', noteOutline:'Контур круга хорош для границ и чистых округлых рамок.', noteRing:'Кольца полезны, когда границе нужен визуальный вес.', noteArch:'Арки удобны, когда важен боковой профиль, а не полный отпечаток.', noteDome:'Профиль купола лучше читать как стек радиусов для крыш.', width:'Ширина', cells:'Блоки', layers:'Слои', copied:'Скопировано' },
        fr: { noteFilled:'Les cercles pleins sont utiles pour places, plateformes et sols.', noteOutline:'Les contours de cercle marchent bien pour des cadres ronds nets.', noteRing:'Les anneaux sont utiles quand une bordure a besoin d’épaisseur.', noteArch:'Les arches servent quand le profil compte plus que l’empreinte.', noteDome:'Le profil de dôme se lit comme une pile de rayons pour les toits.', width:'Largeur', cells:'Blocs', layers:'Couches', copied:'Copié' },
        de: { noteFilled:'Gefüllte Kreise eignen sich für Plätze, Plattformen und Turmböden.', noteOutline:'Kreisumrisse sind gut für Ränder und saubere runde Rahmen.', noteRing:'Ringe helfen, wenn eine Grenze sichtbares Gewicht braucht.', noteArch:'Bögen sind sinnvoll, wenn das Seitenprofil wichtiger ist als die Grundfläche.', noteDome:'Das Kuppelprofil liest man am besten als Radienstapel für Dächer.', width:'Breite', cells:'Blöcke', layers:'Lagen', copied:'Kopiert' }
    }[lang] || { noteFilled:'', noteOutline:'', noteRing:'', noteArch:'', noteDome:'', width:'Width', cells:'Blocks', layers:'Layers', copied:'Copied' };

    const mode = document.getElementById('cdp-mode');
    const radius = document.getElementById('cdp-radius');
    const thickness = document.getElementById('cdp-thickness');
    const canvas = document.getElementById('cdp-canvas');
    const output = document.getElementById('cdp-output');
    const stats = document.getElementById('cdp-stats');
    const stack = document.getElementById('cdp-stack');
    const copyButton = document.getElementById('cdp-copy');
    const ctx = canvas.getContext('2d');

    function gridForMode() {
        const r = Math.max(1, Number(radius.value || 1));
        const t = Math.max(1, Number(thickness.value || 1));
        if (mode.value === 'arch' || mode.value === 'dome_profile') {
            const rows = [];
            for (let y = r; y >= 0; y -= 1) {
                const span = Math.round(Math.sqrt(Math.max(0, r * r - y * y)));
                const row = [];
                for (let x = -r; x <= r; x += 1) {
                    const on = mode.value === 'arch'
                        ? Math.abs(Math.abs(x) - span) <= 0.5 || (y === 0 && Math.abs(x) <= span)
                        : Math.abs(x) <= span;
                    row.push(on ? 1 : 0);
                }
                rows.push({ y, span, row });
            }
            return rows;
        }
        const rows = [];
        for (let y = r; y >= -r; y -= 1) {
            const row = [];
            for (let x = -r; x <= r; x += 1) {
                const dist = Math.sqrt(x * x + y * y);
                let on = false;
                if (mode.value === 'filled_circle') on = dist <= r + 0.15;
                if (mode.value === 'outline_circle') on = Math.abs(dist - r) <= 0.55;
                if (mode.value === 'ring') on = dist <= r + 0.15 && dist >= Math.max(0, r - t) - 0.35;
                row.push(on ? 1 : 0);
            }
            rows.push({ y, span: row.filter(Boolean).length, row });
        }
        return rows;
    }

    function draw(rows) {
        const size = rows[0]?.row.length || 1;
        const cell = Math.max(8, Math.floor((canvas.width - 32) / size));
        const actual = cell * size;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f1429';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const startX = Math.floor((canvas.width - actual) / 2);
        const startY = Math.floor((canvas.height - actual) / 2);
        rows.forEach((line, rowIndex) => {
            line.row.forEach((value, columnIndex) => {
                ctx.fillStyle = value ? '#74a1ff' : 'rgba(116,161,255,0.08)';
                ctx.fillRect(startX + columnIndex * cell, startY + rowIndex * cell, cell - 1, cell - 1);
            });
        });
    }

    function update() {
        const rows = gridForMode();
        draw(rows);
        output.textContent = rows.map((line) => line.row.map((value) => value ? '#' : '.').join('')).join('\\n');
        const filled = rows.reduce((sum, line) => sum + line.row.filter(Boolean).length, 0);
        const width = rows[0]?.row.length || 0;
        const note = mode.value === 'filled_circle' ? copy.noteFilled : mode.value === 'outline_circle' ? copy.noteOutline : mode.value === 'ring' ? copy.noteRing : mode.value === 'arch' ? copy.noteArch : copy.noteDome;
        stats.innerHTML = [
            [copy.width, width],
            [copy.cells, filled],
            [copy.layers, rows.length]
        ].map(([label, value]) => \`<div class="sphere-stat-card"><strong>\${value}</strong><span>\${label}</span></div>\`).join('');
        stats.innerHTML += \`<div class="sphere-stat-card"><strong>\${mode.options[mode.selectedIndex].text}</strong><span>\${note}</span></div>\`;
        stack.innerHTML = mode.value === 'dome_profile'
            ? rows.map((line, index) => \`<div class="planner-stack-row"><span>Y +\${line.y}</span><strong>\${line.span * 2 + 1} blocks</strong></div>\`).join('')
            : '';
    }

    copyButton.addEventListener('click', async () => {
        await navigator.clipboard.writeText(output.textContent);
        const original = copyButton.textContent;
        copyButton.textContent = copyButton.dataset.copiedLabel || copy.copied;
        setTimeout(() => { copyButton.textContent = original; }, 1200);
    });
    [mode, radius, thickness].forEach((field) => field.addEventListener('input', update));
    update();
})();
`;
}

function buildFutureSiteJs(baseSiteJs, toolKeys) {
    const toolData = Object.fromEntries(toolKeys.map((key) => [key, TOOL_LIBRARY[key].labels]));
    const metaMap = Object.fromEntries(toolKeys.map((key) => [key, {
        path: TOOL_LIBRARY[key].path,
        guidePath: TOOL_LIBRARY[key].guidePath,
        sectionId: TOOL_LIBRARY[key].sectionId
    }]));
    const generated = `function initGlobalToolLinks() {
        const locale = getLocaleInfo().lang;
        const labels = ${JSON.stringify(toolData, null, 12)};
        const meta = ${JSON.stringify(metaMap, null, 12)};
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
            const upcoming = Array.from(list.querySelectorAll('a')).find((item) => /(?:^|\\/)tool-coming-soon(?:\\/|\\.html)?$/i.test(item.getAttribute('href') || ''));
            tools.forEach((tool) => {
                if (list.querySelector(\`a[href="\${tool.toolHref}"], a[href$="\${tool.toolHref}"]\`)) return;
                const link = document.createElement('a');
                link.href = tool.toolHref;
                link.textContent = tool.toolLabel;
                list.insertBefore(link, upcoming || null);
            });
        });

        document.querySelectorAll('.steam-mega-panel--tools .mega-feature').forEach((feature) => {
            tools.slice().reverse().forEach((tool) => {
                if (!tool.featureTitle || !tool.featureDesc) return;
                if (feature.querySelector(\`a[href="\${tool.toolHref}"], a[href$="\${tool.toolHref}"]\`)) return;
                const card = document.createElement('a');
                card.className = 'mega-card';
                card.href = tool.toolHref;
                card.innerHTML = \`<strong>\${tool.featureTitle}</strong><span>\${tool.featureDesc}</span>\`;
                feature.insertBefore(card, feature.firstChild);
            });
        });

        document.querySelectorAll('.mega-group-title[href*="#other-tools-wiki"]').forEach((title) => {
            const sublist = title.parentElement ? title.parentElement.querySelector('.mega-sublist') : null;
            if (!sublist) return;
            tools.filter((tool) => tool.guideHref).forEach((tool) => {
                if (sublist.querySelector(\`a[href="\${tool.guideHref}"], a[href$="\${tool.guideHref}"]\`)) return;
                const link = document.createElement('a');
                link.href = tool.guideHref;
                link.textContent = tool.guideLabel;
                sublist.appendChild(link);
            });
        });

        const catalogGrid = document.querySelector('#available-tools .resource-grid');
        if (catalogGrid) {
            tools.slice().reverse().forEach((tool) => {
                if (!tool.catalogTitle || catalogGrid.querySelector(\`a[href="\${tool.toolHref}"], a[href$="\${tool.toolHref}"]\`)) return;
                const card = document.createElement('article');
                card.className = 'resource-card';
                card.innerHTML = \`<h3>\${tool.catalogTitle} <span class="status-pill">\${tool.catalogStatus || ''}</span></h3><p>\${tool.catalogDesc || ''}</p><a class="resource-link" href="\${tool.toolHref}">\${tool.catalogAction || 'Open'}</a>\`;
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
                if (group.querySelector(\`a[href="\${tool.guideHref}"], a[href$="\${tool.guideHref}"]\`)) return;
                const link = document.createElement('a');
                link.href = tool.guideHref;
                link.textContent = tool.sidebarLabel;
                group.appendChild(link);
            });
        }

        tools.forEach((tool) => {
            if (!tool.guideHref || !tool.sectionId || !tool.wikiTitle) return;
            const grid = document.querySelector(\`#\${tool.sectionId} .resource-grid\`);
            if (!grid || grid.querySelector(\`a[href="\${tool.guideHref}"], a[href$="\${tool.guideHref}"]\`)) return;
            const card = document.createElement('article');
            card.className = 'resource-card';
            card.innerHTML = \`<p class="wiki-card-kicker">\${tool.wikiKicker || ''}</p><h3>\${tool.wikiTitle}</h3><p>\${tool.wikiDesc || ''}</p><a class="resource-link" href="\${tool.guideHref}">\${tool.wikiAction || 'Read guide'}</a>\`;
            grid.appendChild(card);
        });
    }`;

    const start = baseSiteJs.indexOf('function initGlobalToolLinks() {');
    const end = baseSiteJs.indexOf('function initProjectSupportLinks() {');
    if (start === -1 || end === -1 || end <= start) {
        throw new Error('Could not locate initGlobalToolLinks block in assets/site.js');
    }
    return `${baseSiteJs.slice(0, start)}${generated}\n\n    ${baseSiteJs.slice(end)}`;
}

function buildSitemap(baseSitemap, additions, lastmod) {
    const existing = new Set(Array.from(baseSitemap.matchAll(/<loc>(.*?)<\/loc>/g)).map((match) => match[1]));
    const entries = additions
        .filter((loc) => !existing.has(loc))
        .map((loc) => `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`)
        .join('\n');
    return baseSitemap.replace('</urlset>', `${entries ? `${entries}\n` : ''}</urlset>`);
}

async function ensureDir(dir) {
    await fs.mkdir(dir, { recursive: true });
}

async function writeFile(filePath, content) {
    await ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf8');
}

function buildNavTemplates(toolHtml, wikiHtml) {
    return {
        toolNav: extractNav(toolHtml),
        wikiNav: extractNav(wikiHtml),
        footer: extractFooter(toolHtml)
    };
}

function buildItemModelGuideBody(locale) {
    return renderItemModelGuide(locale);
}

function buildCustomItemCatalogGuideBody(locale) {
    return renderCustomItemCatalogGuide(locale);
}

function buildCircleGuideBody(locale) {
    return renderCircleDomeGuide(locale);
}

async function main() {
    const baseSiteJs = await read('assets/site.js');
    const baseSitemap = await read('sitemap.xml');

    const navTemplates = {};
    for (const locale of Object.keys(LOCALES)) {
        const toolsHtml = await read(locale === 'en' ? 'tools/index.html' : `${locale}/tools/index.html`);
        const wikiHtml = await read(locale === 'en' ? 'wiki/index.html' : `${locale}/wiki/index.html`);
        navTemplates[locale] = buildNavTemplates(toolsHtml, wikiHtml);
    }

    let currentSiteJs = baseSiteJs;
    let currentSitemap = baseSitemap;

    for (let index = 0; index < RELEASES.length; index += 1) {
        const release = RELEASES[index];
        const queueDir = path.join(QUEUE_ROOT, `${release.date}-${release.slug}`);
        const payloadDir = path.join(queueDir, 'payload');
        await ensureDir(payloadDir);

        await writeFile(path.join(queueDir, 'COMMIT_TITLE.txt'), release.title);
        await writeFile(path.join(queueDir, 'ARTICLE_BRIEF.md'), [
            `# ${release.title}`,
            '',
            `Release date: ${release.date}`,
            '',
            `Includes:`,
            `- ${release.toolRoute}`,
            `- ${release.guideRoute}`,
            `- localized EN/RU/FR/DE pages`,
            `- updated assets/site.js for global discovery`,
            `- updated sitemap.xml`
        ].join('\n'));

        currentSiteJs = buildFutureSiteJs(baseSiteJs, LIVE_DYNAMIC_TOOL_KEYS[index]);
        const urls = Object.keys(LOCALES).flatMap((locale) => [
            `https://cubeinsquare.com${withPrefix(locale, release.toolRoute)}`,
            `https://cubeinsquare.com${withPrefix(locale, release.guideRoute)}`
        ]);
        currentSitemap = buildSitemap(currentSitemap, urls, release.date);

        const toolAssetName = release.key === 'itemModelBuilder'
            ? 'item-model-builder'
            : release.key === 'customItemCatalog'
                ? 'custom-item-catalog'
                : 'circle-dome-planner';

        await writeFile(path.join(payloadDir, 'assets', 'site.js'), currentSiteJs);
        await writeFile(path.join(payloadDir, 'sitemap.xml'), currentSitemap);

        if (release.key === 'itemModelBuilder') {
            await writeFile(path.join(payloadDir, 'assets', `${toolAssetName}.css`), itemModelBuilderCss());
            await writeFile(path.join(payloadDir, 'assets', `${toolAssetName}.js`), itemModelBuilderJs());
        }
        if (release.key === 'customItemCatalog') {
            await writeFile(path.join(payloadDir, 'assets', `${toolAssetName}.css`), customItemCatalogCss());
            await writeFile(path.join(payloadDir, 'assets', `${toolAssetName}.js`), customItemCatalogJs());
        }
        if (release.key === 'circleDomePlanner') {
            await writeFile(path.join(payloadDir, 'assets', `${toolAssetName}.css`), circleDomePlannerCss());
            await writeFile(path.join(payloadDir, 'assets', `${toolAssetName}.js`), circleDomePlannerJs());
        }

        for (const locale of Object.keys(LOCALES)) {
            const navTool = replaceLanguageSwitch(navTemplates[locale].toolNav, release.toolRoute, locale);
            const navWiki = replaceLanguageSwitch(navTemplates[locale].wikiNav, release.guideRoute, locale);
            const footer = navTemplates[locale].footer;
            const toolRouteFile = path.join(payloadDir, locale === 'en' ? release.toolRoute : `${locale}${release.toolRoute}`, 'index.html');
            const guideRouteFile = path.join(payloadDir, locale === 'en' ? release.guideRoute : `${locale}${release.guideRoute}`, 'index.html');

            if (release.key === 'itemModelBuilder') {
                const toolPage = renderItemModelToolPage(locale);
                const guidePage = buildItemModelGuideBody(locale);
                await writeFile(toolRouteFile, toolPageTemplate({
                    locale,
                    route: release.toolRoute,
                    title: toolPage.title,
                    description: toolPage.description,
                    lead: toolPage.lead,
                    navHtml: navTool,
                    footerHtml: footer,
                    extraCss: `${toolAssetName}.css`,
                    appId: toolAssetName,
                    body: toolPage.body,
                    date: release.date
                }));
                await writeFile(guideRouteFile, guidePageTemplate({
                    locale,
                    route: release.guideRoute,
                    title: guidePage.title,
                    description: guidePage.description,
                    lead: guidePage.lead,
                    navHtml: navWiki,
                    footerHtml: footer,
                    body: guidePage.body,
                    date: release.date
                }));
            }

            if (release.key === 'customItemCatalog') {
                const toolPage = renderCustomItemCatalogToolPage(locale);
                const guidePage = buildCustomItemCatalogGuideBody(locale);
                await writeFile(toolRouteFile, toolPageTemplate({
                    locale,
                    route: release.toolRoute,
                    title: toolPage.title,
                    description: toolPage.description,
                    lead: toolPage.lead,
                    navHtml: navTool,
                    footerHtml: footer,
                    extraCss: `${toolAssetName}.css`,
                    appId: toolAssetName,
                    body: toolPage.body,
                    date: release.date
                }));
                await writeFile(guideRouteFile, guidePageTemplate({
                    locale,
                    route: release.guideRoute,
                    title: guidePage.title,
                    description: guidePage.description,
                    lead: guidePage.lead,
                    navHtml: navWiki,
                    footerHtml: footer,
                    body: guidePage.body,
                    date: release.date
                }));
            }

            if (release.key === 'circleDomePlanner') {
                const toolPage = renderCircleDomeToolPage(locale);
                const guidePage = buildCircleGuideBody(locale);
                await writeFile(toolRouteFile, toolPageTemplate({
                    locale,
                    route: release.toolRoute,
                    title: toolPage.title,
                    description: toolPage.description,
                    lead: toolPage.lead,
                    navHtml: navTool,
                    footerHtml: footer,
                    extraCss: `${toolAssetName}.css`,
                    appId: toolAssetName,
                    body: toolPage.body,
                    date: release.date
                }));
                await writeFile(guideRouteFile, guidePageTemplate({
                    locale,
                    route: release.guideRoute,
                    title: guidePage.title,
                    description: guidePage.description,
                    lead: guidePage.lead,
                    navHtml: navWiki,
                    footerHtml: footer,
                    body: guidePage.body,
                    date: release.date
                }));
            }
        }
    }
}

await main();
