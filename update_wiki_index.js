var fso = new ActiveXObject("Scripting.FileSystemObject");
var currentFolder = fso.GetAbsolutePathName(".");

var locales = [
  { 
    code: "en", 
    pathPrefix: "wiki\\index.html", 
    sectionTitle: "How-to Guides", 
    sectionIntro: "These guides answer specific questions about modern Minecraft commands and item mechanics.",
    sidebarTitle: "How-to Guides",
    articles: [
      { slug: "wiki-custom-item-no-json", kicker: "Item Guide", title: "How to create a custom item in Minecraft 1.20.5+ without JSON", desc: "Build items without knowing JSON components." },
      { slug: "wiki-custom-weapon", kicker: "Item Guide", title: "Step-by-step: Creating unique weapons", desc: "Setting custom attributes for unique weapons." },
      { slug: "wiki-blockbench-custom-model", kicker: "Visual Guide", title: "How to add a Custom Model Data model", desc: "Link a 3D model to an item in resource packs." },
      { slug: "wiki-components-vs-nbt", kicker: "Mechanics", title: "Components instead of NBT", desc: "Understanding the shift in modern Minecraft versions." },
      { slug: "wiki-give-command-not-working", kicker: "Troubleshooting", title: "Why is your /give command not working?", desc: "Fixing syntax and bracket errors easily." },
      { slug: "wiki-complex-command-blocks", kicker: "Command Blocks", title: "Generating complex commands quickly", desc: "Visual builders for map makers." }
    ],
    readLabel: "Read article"
  },
  { 
    code: "ru", 
    pathPrefix: "ru\\wiki\\index.html", 
    sectionTitle: "Обучающие гайды", 
    sectionIntro: "Эти статьи закроют вопросы новичков и помогут разобраться с современными механиками и генераторами команд без копания в коде.",
    sidebarTitle: "Обучающие гайды",
    articles: [
      { slug: "wiki-custom-item-no-json", kicker: "Создание предметов", title: "Как создать предмет без знания JSON", desc: "Фокус на обновленную систему компонентов, которая многих пугает." },
      { slug: "wiki-custom-weapon", kicker: "Оружие и броня", title: "Пошаговое руководство: создание уникального оружия", desc: "Как прописать урон, скорость атаки и эффекты через визуальный интерфейс." },
      { slug: "wiki-blockbench-custom-model", kicker: "Модели", title: "Как добавить кастомную модель предмету", desc: "О том, как связать визуальную часть из Blockbench с логикой через билдeр." },
      { slug: "wiki-components-vs-nbt", kicker: "Теория", title: "Компоненты вместо NBT", desc: "Объяснение разницы и того, как инструмент упрощает этот переход." },
      { slug: "wiki-give-command-not-working", kicker: "Ошибки", title: "Почему ваш /give не работает?", desc: "Разбор типичных ошибок в синтаксисе команд и их исправление." },
      { slug: "wiki-complex-command-blocks", kicker: "Командные блоки", title: "Сложные команды для командных блоков за пару кликов", desc: "Генерация через наш сайт вместо ручного написания." }
    ],
    readLabel: "Читать статью"
  },
  { 
    code: "de", 
    pathPrefix: "de\\wiki\\index.html", 
    sectionTitle: "Anleitungen", 
    sectionIntro: "Diese Anleitungen beantworten spezifische Fragen zu modernen Minecraft-Befehlen und Gegenstandsmechaniken.",
    sidebarTitle: "Anleitungen",
    articles: [
      { slug: "wiki-custom-item-no-json", kicker: "Item-Guide", title: "Benutzerdefiniertes Item ohne JSON", desc: "Erstellen von Items ohne JSON-Kenntnisse." },
      { slug: "wiki-custom-weapon", kicker: "Item-Guide", title: "Einzigartige Waffen erstellen", desc: "Festlegen benutzerdefinierter Attribute für Waffen." },
      { slug: "wiki-blockbench-custom-model", kicker: "Visual Guide", title: "Custom Model Data hinzufügen", desc: "Ein 3D-Modell mit einem Item verknüpfen." },
      { slug: "wiki-components-vs-nbt", kicker: "Mechanik", title: "Komponenten statt NBT", desc: "Den Wandel in modernen Minecraft-Versionen verstehen." },
      { slug: "wiki-give-command-not-working", kicker: "Fehlerbehebung", title: "Warum funktioniert Ihr /give-Befehl nicht?", desc: "Syntax- und Klammerfehler einfach beheben." },
      { slug: "wiki-complex-command-blocks", kicker: "Befehlsblöcke", title: "Komplexe Befehle generieren", desc: "Visuelle Builder für Map-Ersteller." }
    ],
    readLabel: "Artikel lesen"
  },
  { 
    code: "fr", 
    pathPrefix: "fr\\wiki\\index.html", 
    sectionTitle: "Guides pratiques", 
    sectionIntro: "Ces guides répondent à des questions spécifiques sur les commandes et mécanismes modernes de Minecraft.",
    sidebarTitle: "Guides pratiques",
    articles: [
      { slug: "wiki-custom-item-no-json", kicker: "Guide Objet", title: "Créer un objet personnalisé sans JSON", desc: "Créez des objets sans connaître les composants JSON." },
      { slug: "wiki-custom-weapon", kicker: "Guide Objet", title: "Créer des armes uniques", desc: "Définition d'attributs personnalisés pour des armes." },
      { slug: "wiki-blockbench-custom-model", kicker: "Guide Visuel", title: "Ajouter un modèle Custom Model Data", desc: "Lier un modèle 3D à un objet dans un resource pack." },
      { slug: "wiki-components-vs-nbt", kicker: "Mécaniques", title: "Composants au lieu de NBT", desc: "Comprendre le changement dans les versions modernes." },
      { slug: "wiki-give-command-not-working", kicker: "Dépannage", title: "Pourquoi votre commande /give ne fonctionne pas ?", desc: "Corrigez facilement les erreurs de syntaxe." },
      { slug: "wiki-complex-command-blocks", kicker: "Blocs de commande", title: "Générer des commandes complexes", desc: "Générateurs visuels pour créateurs de cartes." }
    ],
    readLabel: "Lire l'article"
  }
];

for (var i = 0; i < locales.length; i++) {
  var locale = locales[i];
  var filePath = currentFolder + "\\" + locale.pathPrefix;
  if (!fso.FileExists(filePath)) continue;

  var file = fso.OpenTextFile(filePath, 1);
  var html = file.ReadAll();
  file.Close();

  // 1. Add to sidebar
  var sidebarHtml = '<div class="wiki-sidebar-group">\n                        <h2>' + locale.sidebarTitle + '</h2>\n';
  var pre = locale.code === "en" ? "" : "/" + locale.code;
  for (var j = 0; j < locale.articles.length; j++) {
    sidebarHtml += '                        <a href="' + pre + '/' + locale.articles[j].slug + '/">' + locale.articles[j].title + '</a>\n';
  }
  sidebarHtml += '                    </div>\n';

  // Inject before "RP systems" / "Серверные системы" in sidebar
  var sidebarRegex = /(<div class="wiki-sidebar-group">\s*<h2>(?:RP systems|Серверные системы|RP-Systeme|Systèmes RP).*?<\/div>\s*<\/div>)/i;
  if (html.indexOf(locale.sidebarTitle) === -1) {
    html = html.replace(sidebarRegex, sidebarHtml + '                    $1');
  }

  // 2. Add to main content
  var contentHtml = '\n            <section class="page-section" id="how-to-guides">\n                <h2 class="section-title">' + locale.sectionTitle + '</h2>\n                <p class="section-intro">' + locale.sectionIntro + '</p>\n                <div class="resource-grid">\n';
  for (var k = 0; k < locale.articles.length; k++) {
    var a = locale.articles[k];
    contentHtml += '                    <article class="resource-card">\n                        <p class="wiki-card-kicker">' + a.kicker + '</p>\n                        <h3>' + a.title + '</h3>\n                        <p>' + a.desc + '</p>\n                        <a class="resource-link" href="' + pre + '/' + a.slug + '/">' + locale.readLabel + '</a>\n                    </article>\n';
  }
  contentHtml += '                </div>\n            </section>\n';

  var contentRegex = /(<section class="page-section" id="(?:advanced-rp-guides|rp-systems)".*?<\/section>\s*)/i;
  // wait, the id might be advanced-rp-guides on all languages
  var contentRegex2 = /(<section class="page-section" id="advanced-rp-guides">)/i;
  
  if (html.indexOf(locale.sectionTitle) === -1) {
    html = html.replace(contentRegex2, contentHtml + '\n            $1');
  }

  var outFile = fso.CreateTextFile(filePath, true);
  outFile.Write(html);
  outFile.Close();
  WScript.Echo("Updated " + filePath);
}
