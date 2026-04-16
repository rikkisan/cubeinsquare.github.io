(function () {
    const lang = (document.documentElement.lang || '').toLowerCase().split('-')[0];
    if (lang !== 'fr' && lang !== 'de') return;

    const dictionaries = {
        fr: {
            exact: {
                'Upload': 'Importer',
                'Загрузить': 'Importer',
                'Preview': 'Aperçu',
                'Предпросмотр': 'Aperçu',
                'Slice texture': 'Découper la texture',
                'Нарезать текстуру': 'Découper la texture',
                '+ Add another item': '+ Ajouter un autre objet',
                '+ Add another block texture': '+ Ajouter une autre texture de bloc',
                'Item Library': 'Bibliothèque d’objets',
                'Block Library': 'Bibliothèque de blocs',
                'Loading library...': 'Chargement de la bibliothèque...',
                'Nothing found': 'Aucun résultat',
                'Ничего не найдено': 'Aucun résultat',
                'Armor 3D model setup': 'Configuration du modèle 3D d’armure',
                'Add 3D armor layers and 2D inventory icons. Choose the armor material to replace and upload your files.': 'Ajoutez des couches d’armure 3D et des icônes 2D d’inventaire. Choisissez le matériau à remplacer et importez vos fichiers.',
                'Armor material to replace:': 'Matériau d’armure à remplacer :',
                'Материал брони (Заменяем):': 'Matériau d’armure à remplacer :',
                '3D Layer 1': 'Couche 3D 1',
                '3D Слой 1': 'Couche 3D 1',
                '(Helmet, Chestplate, Boots)': '(Casque, plastron, bottes)',
                '(Шлем, Нагрудник, Ботинки)': '(Casque, plastron, bottes)',
                '3D Layer 2': 'Couche 3D 2',
                '3D Слой 2': 'Couche 3D 2',
                '(Leggings)': '(Jambières)',
                '(Поножи)': '(Jambières)',
                'Inventory icons:': 'Icônes d’inventaire :',
                'Иконки инвентаря:': 'Icônes d’inventaire :',
                'Helmet': 'Casque',
                'Шлем': 'Casque',
                'Chestplate': 'Plastron',
                'Нагрудник': 'Plastron',
                'Leggings': 'Jambières',
                'Поножи': 'Jambières',
                'Boots': 'Bottes',
                'Ботинки': 'Bottes',
                '(Icon)': '(Icône)',
                '(Иконка)': '(Icône)',
                '+ Add a full armor set': '+ Ajouter un set d’armure complet',
                'Sliced': 'Découpé',
                'Нарезано': 'Découpé',
                'Base': 'Base',
                'Основа': 'Base',
                'Top': 'Haut',
                'Верх': 'Haut',
                'Bottom': 'Bas',
                'Низ': 'Bas',
                'Front': 'Avant',
                'Перед': 'Avant',
                'Back': 'Arrière',
                'Зад': 'Arrière',
                'Left side': 'Côté gauche',
                'Лев.Бок': 'Côté gauche',
                'Right side': 'Côté droit',
                'Прв.Бок': 'Côté droit',
                'All sides': 'Tous les côtés',
                'Общ.Бок': 'Tous les côtés'
            },
            placeholder: {
                'Item name (e.g. iron_pickaxe)': 'Nom de l’objet (ex. iron_pickaxe)',
                'Название предмета (напр. iron_pickaxe)': 'Nom de l’objet (ex. iron_pickaxe)',
                'Block texture name (e.g. oak_planks)': 'Nom de texture de bloc (ex. oak_planks)',
                'Название текстуры блока (напр. oak_planks)': 'Nom de texture de bloc (ex. oak_planks)',
                'Search items...': 'Rechercher des objets...',
                'Search blocks...': 'Rechercher des blocs...'
            }
        },
        de: {
            exact: {
                'Upload': 'Hochladen',
                'Загрузить': 'Hochladen',
                'Preview': 'Vorschau',
                'Предпросмотр': 'Vorschau',
                'Slice texture': 'Textur schneiden',
                'Нарезать текстуру': 'Textur schneiden',
                '+ Add another item': '+ Weiteres Item hinzufügen',
                '+ Add another block texture': '+ Weitere Blocktextur hinzufügen',
                'Item Library': 'Item-Bibliothek',
                'Block Library': 'Block-Bibliothek',
                'Loading library...': 'Bibliothek wird geladen...',
                'Nothing found': 'Nichts gefunden',
                'Ничего не найдено': 'Nichts gefunden',
                'Armor 3D model setup': '3D-Rüstungsmodell einrichten',
                'Add 3D armor layers and 2D inventory icons. Choose the armor material to replace and upload your files.': 'Füge 3D-Rüstungsebenen und 2D-Inventar-Icons hinzu. Wähle das zu ersetzende Rüstungsmaterial und lade deine Dateien hoch.',
                'Armor material to replace:': 'Zu ersetzendes Rüstungsmaterial:',
                'Материал брони (Заменяем):': 'Zu ersetzendes Rüstungsmaterial:',
                '3D Layer 1': '3D-Ebene 1',
                '3D Слой 1': '3D-Ebene 1',
                '(Helmet, Chestplate, Boots)': '(Helm, Brustplatte, Stiefel)',
                '(Шлем, Нагрудник, Ботинки)': '(Helm, Brustplatte, Stiefel)',
                '3D Layer 2': '3D-Ebene 2',
                '3D Слой 2': '3D-Ebene 2',
                '(Leggings)': '(Beinschutz)',
                '(Поножи)': '(Beinschutz)',
                'Inventory icons:': 'Inventar-Icons:',
                'Иконки инвентаря:': 'Inventar-Icons:',
                'Helmet': 'Helm',
                'Шлем': 'Helm',
                'Chestplate': 'Brustplatte',
                'Нагрудник': 'Brustplatte',
                'Leggings': 'Beinschutz',
                'Поножи': 'Beinschutz',
                'Boots': 'Stiefel',
                'Ботинки': 'Stiefel',
                '(Icon)': '(Icon)',
                '(Иконка)': '(Icon)',
                '+ Add a full armor set': '+ Vollständiges Rüstungsset hinzufügen',
                'Sliced': 'Geschnitten',
                'Нарезано': 'Geschnitten',
                'Base': 'Basis',
                'Основа': 'Basis',
                'Top': 'Oben',
                'Верх': 'Oben',
                'Bottom': 'Unten',
                'Низ': 'Unten',
                'Front': 'Vorne',
                'Перед': 'Vorne',
                'Back': 'Hinten',
                'Зад': 'Hinten',
                'Left side': 'Linke Seite',
                'Лев.Бок': 'Linke Seite',
                'Right side': 'Rechte Seite',
                'Прв.Бок': 'Rechte Seite',
                'All sides': 'Alle Seiten',
                'Общ.Бок': 'Alle Seiten'
            },
            placeholder: {
                'Item name (e.g. iron_pickaxe)': 'Item-Name (z. B. iron_pickaxe)',
                'Название предмета (напр. iron_pickaxe)': 'Item-Name (z. B. iron_pickaxe)',
                'Block texture name (e.g. oak_planks)': 'Blocktextur-Name (z. B. oak_planks)',
                'Название текстуры блока (напр. oak_planks)': 'Blocktextur-Name (z. B. oak_planks)',
                'Search items...': 'Items suchen...',
                'Search blocks...': 'Blöcke suchen...'
            }
        }
    };

    const dict = dictionaries[lang];

    function replaceExactText(element) {
        if (!element || element.children.length) return;
        const current = element.textContent.trim();
        if (!current || !(current in dict.exact)) return;
        element.textContent = dict.exact[current];
    }

    function replacePlaceholders(root) {
        root.querySelectorAll('[placeholder]').forEach((element) => {
            const current = element.getAttribute('placeholder');
            if (current in dict.placeholder) {
                element.setAttribute('placeholder', dict.placeholder[current]);
            }
        });
    }

    function fixStatusHtml(root) {
        root.querySelectorAll('.status-text, small').forEach((element) => {
            let html = element.innerHTML;
            Object.entries(dict.exact).forEach(([from, to]) => {
                html = html.replaceAll(from, to);
            });
            if (html !== element.innerHTML) element.innerHTML = html;
        });
    }

    function translate(root) {
        const scope = root && root.querySelectorAll ? root : document;
        scope.querySelectorAll('button, span, p, h2, h3, label, small, a, option, div').forEach(replaceExactText);
        replacePlaceholders(scope);
        fixStatusHtml(scope);
    }

    let scheduled = false;
    function scheduleTranslate() {
        if (scheduled) return;
        scheduled = true;
        window.requestAnimationFrame(() => {
            scheduled = false;
            translate(document);
        });
    }

    document.addEventListener('DOMContentLoaded', scheduleTranslate);
    scheduleTranslate();

    const observer = new MutationObserver(scheduleTranslate);
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['placeholder']
    });
})();
