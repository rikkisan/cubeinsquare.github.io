var fso = new ActiveXObject("Scripting.FileSystemObject");
var currentFolder = fso.GetAbsolutePathName(".");

var articles = [
  {
    slug: "wiki-custom-item-no-json",
    content: {
      en: {
        title: "How to create a custom item in Minecraft 1.20.5+ without JSON",
        desc: "Learn how to easily build custom items using the new Data Components in Minecraft 1.21.4+ without manually writing JSON files.",
        body: "<h2>The problem with JSON and modern Minecraft</h2>\n<p>For years, creating custom items meant digging through NBT tags and JSON files. With the release of Minecraft 1.20.5 and the transition to 1.21.4+, the game shifted from NBT to Data Components. While this makes the game run better, it has left many server admins confused by the new syntax.</p>\n<h2>Why Components scare creators</h2>\n<p>Old NBT looked like this: <code>{CustomModelData:1}</code>. The new component system looks like this: <code>[minecraft:custom_model_data=1]</code>. It seems simple, but when you add lore, names, and custom states, the brackets and quotes become a nightmare to format manually.</p>\n<h2>Creating items visually</h2>\n<p>Instead of guessing where a comma goes, you can use our <a href='/custom-item-builder/'>Custom Item Builder</a>. You just type your item name, paste your lore, and set your Custom Model Data. The tool automatically generates the exact <code>/give</code> command for the version you select.</p>\n<ul>\n    <li><strong>No syntax errors:</strong> The builder ensures your quotes and brackets are perfectly balanced.</li>\n    <li><strong>Version switching:</strong> Easily toggle between legacy NBT and modern Components to see how the command changes.</li>\n    <li><strong>Fast iteration:</strong> Tweak your item and copy the new command instantly.</li>\n</ul>\n<p>Stop wasting hours debugging JSON arrays. Use the visual builder and get back to actually playing and managing your server!</p>"
      },
      ru: {
        title: "Как создать кастомный предмет в Minecraft 1.20.5+ без знания JSON",
        desc: "Узнайте, как легко создавать предметы с новой системой компонентов в Minecraft 1.21.4+, не прописывая JSON вручную.",
        body: "<h2>Проблема с JSON в современном Minecraft</h2>\n<p>Годами создание предметов требовало копания в NBT-тегах и JSON. С выходом 1.20.5 и переходом к 1.21.4+ игра сменила NBT на компоненты данных. Хотя это улучшает оптимизацию, новый синтаксис пугает многих создателей серверов.</p>\n<h2>Почему компоненты вызывают сложности</h2>\n<p>Старый NBT выглядел так: <code>{CustomModelData:1}</code>. Новая система: <code>[minecraft:custom_model_data=1]</code>. Кажется просто, но стоит добавить лор, цвет и имя, как скобки и кавычки превращаются в кошмар.</p>\n<h2>Создание предметов через визуальный интерфейс</h2>\n<p>Вместо того чтобы гадать, где поставить запятую, используйте наш <a href='/custom-item-builder/'>Генератор предметов</a>. Вы просто вводите имя, вставляете лор и задаете Custom Model Data. Инструмент сам собирает правильную команду <code>/give</code>.</p>\n<ul>\n    <li><strong>Никаких ошибок синтаксиса:</strong> Билдер сам следит за кавычками и скобками.</li>\n    <li><strong>Поддержка версий:</strong> Переключайтесь между старым NBT и новыми компонентами в один клик.</li>\n    <li><strong>Быстрая работа:</strong> Меняйте настройки и сразу копируйте готовую команду.</li>\n</ul>\n<p>Хватит тратить часы на поиск пропущенной запятой в JSON. Используйте визуальный редактор и сэкономьте свои нервы!</p>"
      },
      de: {
        title: "Benutzerdefiniertes Item in Minecraft 1.20.5+ ohne JSON erstellen",
        desc: "Erfahre, wie du benutzerdefinierte Items mit den neuen Datenkomponenten in Minecraft 1.21.4+ erstellst, ohne JSON manuell zu schreiben.",
        body: "<h2>Das Problem mit JSON und dem modernen Minecraft</h2>\n<p>Jahrelang bedeutete das Erstellen von Items das Wühlen in NBT-Tags und JSON-Dateien. Mit Minecraft 1.20.5 und 1.21.4+ wechselte das Spiel von NBT zu Datenkomponenten. Das verbessert die Leistung, verwirrt aber viele Server-Admins.</p>\n<h2>Warum Komponenten abschrecken</h2>\n<p>Altes NBT sah so aus: <code>{CustomModelData:1}</code>. Das neue System: <code>[minecraft:custom_model_data=1]</code>. Es wirkt einfach, aber mit Lore und Namen wird die Syntax schnell zum Albtraum.</p>\n<h2>Items visuell erstellen</h2>\n<p>Anstatt zu raten, wo ein Komma fehlt, nutze unseren <a href='/custom-item-builder/'>Custom Item Builder</a>. Gib den Namen ein, füge Lore hinzu und setze die Custom Model Data. Das Tool generiert den exakten <code>/give</code>-Befehl.</p>\n<ul>\n    <li><strong>Keine Syntaxfehler:</strong> Der Builder sorgt für perfekte Klammern und Anführungszeichen.</li>\n    <li><strong>Versionswechsel:</strong> Wechsle einfach zwischen Legacy-NBT und modernen Komponenten.</li>\n    <li><strong>Schnelle Iteration:</strong> Passe dein Item an und kopiere den Befehl sofort.</li>\n</ul>\n<p>Verschwende keine Stunden mehr mit dem Debuggen von JSON. Nutze den visuellen Builder und konzentriere dich auf deinen Server!</p>"
      },
      fr: {
        title: "Créer un objet personnalisé dans Minecraft 1.20.5+ sans JSON",
        desc: "Découvrez comment créer facilement des objets avec les nouveaux composants de données de Minecraft 1.21.4+ sans écrire de JSON.",
        body: "<h2>Le problème avec JSON et Minecraft moderne</h2>\n<p>Pendant des années, créer des objets impliquait de manipuler des tags NBT et du JSON. Avec Minecraft 1.20.5 et 1.21.4+, le jeu est passé du NBT aux Composants de Données. Cela améliore les performances, mais la syntaxe effraie de nombreux créateurs.</p>\n<h2>Pourquoi les composants font peur</h2>\n<p>L'ancien NBT ressemblait à ceci : <code>{CustomModelData:1}</code>. Le nouveau système : <code>[minecraft:custom_model_data=1]</code>. Cela semble simple, mais avec du lore et des noms, les crochets et guillemets deviennent un cauchemar.</p>\n<h2>Création d'objets visuelle</h2>\n<p>Au lieu de deviner où va une virgule, utilisez notre <a href='/custom-item-builder/'>Générateur d'objets</a>. Tapez le nom, collez le lore et définissez le Custom Model Data. L'outil génère la commande <code>/give</code> exacte.</p>\n<ul>\n    <li><strong>Aucune erreur de syntaxe :</strong> Le générateur équilibre parfaitement les crochets.</li>\n    <li><strong>Changement de version :</strong> Passez facilement du NBT classique aux composants modernes.</li>\n    <li><strong>Itération rapide :</strong> Modifiez votre objet et copiez la commande instantanément.</li>\n</ul>\n<p>Ne perdez plus des heures à déboguer du JSON. Utilisez l'éditeur visuel et concentrez-vous sur votre serveur !</p>"
      }
    }
  },
  {
    slug: "wiki-custom-weapon",
    content: {
      en: {
        title: "Step-by-step: Creating unique weapons with custom attributes",
        desc: "Learn how to generate custom weapons with specific attack damage, speed, and visual effects in Minecraft.",
        body: "<h2>Beyond standard swords</h2>\n<p>Vanilla Minecraft only offers a few weapon tiers. If you are running an RPG server, you need custom weapons with unique stats. You need a dagger that attacks fast but deals little damage, or a heavy hammer that is slow but devastating.</p>\n<h2>Setting weapon attributes</h2>\n<p>In Minecraft, weapon stats are modified using the <code>attribute_modifiers</code> component. This allows you to override the base damage and attack speed of any item.</p>\n<ul>\n    <li><strong>Attack Damage:</strong> Determines how many hearts the weapon takes away.</li>\n    <li><strong>Attack Speed:</strong> Determines the cooldown between swings.</li>\n</ul>\n<h2>Using our Generator</h2>\n<p>You can package your custom weapon textures and models easily using our <a href='/resource-pack-generator/'>Resource Pack Generator</a>. Once you have the visual part ready, you can use command builders to attach the exact damage and speed attributes.</p>\n<p>For the best player experience, always pair custom stats with a custom texture using CustomModelData, so players can easily distinguish the heavy hammer from a standard iron sword.</p>"
      },
      ru: {
        title: "Пошаговое руководство: создание уникального оружия с характеристиками",
        desc: "Узнайте, как создавать кастомное оружие с собственным уроном, скоростью атаки и визуальными моделями в Minecraft.",
        body: "<h2>Больше, чем просто мечи</h2>\n<p>В ванильном Minecraft всего несколько тиров оружия. Для RPG-сервера нужно уникальное оружие: быстрый кинжал со слабым уроном или медленный, но сокрушительный молот.</p>\n<h2>Настройка атрибутов оружия</h2>\n<p>Характеристики меняются с помощью компонента <code>attribute_modifiers</code>. Это позволяет переопределить базовый урон и скорость атаки любого предмета.</p>\n<ul>\n    <li><strong>Урон (Attack Damage):</strong> Сколько сердец отнимает удар.</li>\n    <li><strong>Скорость (Attack Speed):</strong> Время перезарядки между взмахами.</li>\n</ul>\n<h2>Связка визуала и логики</h2>\n<p>Вы можете легко упаковать текстуры вашего нового оружия с помощью нашего <a href='/resource-pack-generator/'>Генератора ресурспаков</a>. Когда визуальная часть готова, используйте генераторы команд, чтобы привязать нужный урон и скорость.</p>\n<p>Для лучшего опыта всегда связывайте уникальные статы с уникальной текстурой через CustomModelData, чтобы игроки визуально отличали ваш тяжелый молот от обычной железной мотыги.</p>"
      },
      de: {
        title: "Schritt-für-Schritt: Erstellen einzigartiger Waffen mit eigenen Attributen",
        desc: "Erfahre, wie du benutzerdefinierte Waffen mit spezifischem Angriffsschaden, Geschwindigkeit und visuellen Effekten in Minecraft erstellst.",
        body: "<h2>Mehr als Standard-Schwerter</h2>\n<p>Vanilla Minecraft bietet nur wenige Waffenstufen. Für einen RPG-Server brauchst du individuelle Waffen: einen schnellen Dolch oder einen langsamen, verheerenden Hammer.</p>\n<h2>Waffenattribute einstellen</h2>\n<p>Waffenwerte werden mit der <code>attribute_modifiers</code>-Komponente geändert. Damit kannst du den Grundschaden und die Angriffsgeschwindigkeit jedes Items überschreiben.</p>\n<ul>\n    <li><strong>Angriffsschaden:</strong> Wie viele Herzen die Waffe abzieht.</li>\n    <li><strong>Angriffsgeschwindigkeit:</strong> Die Abklingzeit zwischen Schlägen.</li>\n</ul>\n<h2>Visuelles und Logik verbinden</h2>\n<p>Du kannst die Texturen deiner neuen Waffe ganz einfach mit unserem <a href='/resource-pack-generator/'>Resource Pack Generator</a> verpacken. Verbinde immer benutzerdefinierte Werte mit einer eigenen Textur über CustomModelData, damit Spieler den Hammer leicht von einem Standard-Schwert unterscheiden können.</p>"
      },
      fr: {
        title: "Guide pas à pas : Créer des armes uniques avec des attributs personnalisés",
        desc: "Découvrez comment générer des armes avec des dégâts, une vitesse et des modèles visuels spécifiques dans Minecraft.",
        body: "<h2>Au-delà des épées standards</h2>\n<p>Minecraft Vanilla n'offre que quelques niveaux d'armes. Pour un serveur RPG, il vous faut des armes uniques : une dague rapide mais faible, ou un marteau lent mais dévastateur.</p>\n<h2>Définir les attributs de l'arme</h2>\n<p>Les statistiques sont modifiées via le composant <code>attribute_modifiers</code>, permettant de remplacer les dégâts et la vitesse d'attaque de base de n'importe quel objet.</p>\n<ul>\n    <li><strong>Dégâts d'attaque :</strong> Le nombre de cœurs retirés par coup.</li>\n    <li><strong>Vitesse d'attaque :</strong> Le temps de recharge entre les frappes.</li>\n</ul>\n<h2>Lier le visuel et la logique</h2>\n<p>Vous pouvez facilement emballer les textures de votre nouvelle arme en utilisant notre <a href='/resource-pack-generator/'>Générateur de Resource Pack</a>. Pour une meilleure expérience, associez toujours des statistiques personnalisées à une texture unique via CustomModelData.</p>"
      }
    }
  },
  {
    slug: "wiki-blockbench-custom-model",
    content: {
      en: {
        title: "How to add a Custom Model Data model to an item: A visual tutorial",
        desc: "Learn how to link a 3D Blockbench model to a vanilla Minecraft item using Custom Model Data and our visual tools.",
        body: "<h2>From Blockbench to Minecraft</h2>\n<p>You've designed a beautiful 3D model in Blockbench, exported the JSON, and now you want it in the game. But how do you actually make it appear when a player holds a specific item?</p>\n<h2>The Resource Pack Structure</h2>\n<p>Your 3D model JSON goes into <code>assets/minecraft/models/item/</code>. But you must also override a vanilla item to point to your new model. This is where Custom Model Data comes in.</p>\n<p>Instead of writing the override code manually, you can use our <a href='/resource-pack-generator/'>Resource Pack Generator</a>. You just upload your custom model and texture, assign it a CustomModelData ID, and the generator builds the correct folder structure and JSON overrides automatically.</p>\n<h2>Spawning the item</h2>\n<p>Once the resource pack is loaded, you need a command to give yourself the item. Open the <a href='/custom-item-builder/'>Custom Item Builder</a>, type the same CustomModelData ID you used in the generator, and copy the <code>/give</code> command. It's that simple!</p>"
      },
      ru: {
        title: "Как добавить кастомную модель (Custom Model Data) предмету: наглядный туториал",
        desc: "Узнайте, как привязать 3D-модель из Blockbench к ванильному предмету Minecraft через Custom Model Data с помощью наших инструментов.",
        body: "<h2>От Blockbench к Minecraft</h2>\n<p>Вы нарисовали красивую 3D-модель в Blockbench, экспортировали JSON, и теперь хотите увидеть её в игре. Как заставить её появиться в руках игрока?</p>\n<h2>Структура ресурспака</h2>\n<p>Ваш JSON-файл модели отправляется в <code>assets/minecraft/models/item/</code>. Но вам нужно еще переопределить ванильный предмет, чтобы он ссылался на вашу модель. Для этого и нужна система Custom Model Data.</p>\n<p>Вместо того чтобы писать код переопределения вручную, используйте наш <a href='/resource-pack-generator/'>Генератор ресурспаков</a>. Просто загрузите вашу модель и текстуру, назначьте ей ID CustomModelData, и генератор сам создаст нужные папки и JSON-файлы.</p>\n<h2>Выдача предмета в игре</h2>\n<p>Когда ресурспак установлен, вам нужна команда для получения предмета. Откройте <a href='/custom-item-builder/'>Генератор предметов</a>, введите тот же ID CustomModelData, который вы указали в ресурспаке, и скопируйте готовую команду <code>/give</code>. Всё предельно просто!</p>"
      },
      de: {
        title: "Wie man ein Custom Model Data-Modell zu einem Item hinzufügt: Ein visuelles Tutorial",
        desc: "Erfahre, wie du ein 3D-Blockbench-Modell mithilfe von Custom Model Data an ein Vanilla-Minecraft-Item bindest.",
        body: "<h2>Von Blockbench zu Minecraft</h2>\n<p>Du hast ein 3D-Modell in Blockbench entworfen und als JSON exportiert. Wie sorgst du nun dafür, dass es im Spiel erscheint?</p>\n<h2>Die Resource Pack-Struktur</h2>\n<p>Dein JSON-Modell gehört in <code>assets/minecraft/models/item/</code>. Du musst jedoch ein Vanilla-Item überschreiben, damit es auf dein neues Modell verweist. Hier kommt Custom Model Data ins Spiel.</p>\n<p>Anstatt den Code manuell zu schreiben, nutze unseren <a href='/resource-pack-generator/'>Resource Pack Generator</a>. Lade dein Modell hoch, weise ihm eine CustomModelData-ID zu, und der Generator erledigt den Rest.</p>\n<h2>Das Item spawnen</h2>\n<p>Sobald das Pack geladen ist, brauchst du einen Befehl. Öffne den <a href='/custom-item-builder/'>Custom Item Builder</a>, gib dieselbe CustomModelData-ID ein und kopiere den <code>/give</code>-Befehl. So einfach ist das!</p>"
      },
      fr: {
        title: "Comment ajouter un modèle Custom Model Data à un objet : Un tutoriel visuel",
        desc: "Apprenez à lier un modèle 3D Blockbench à un objet Minecraft classique en utilisant le Custom Model Data et nos outils.",
        body: "<h2>De Blockbench à Minecraft</h2>\n<p>Vous avez créé un modèle 3D dans Blockbench et exporté le JSON. Comment le faire apparaître dans le jeu ?</p>\n<h2>La structure du Resource Pack</h2>\n<p>Votre modèle JSON va dans <code>assets/minecraft/models/item/</code>. Mais vous devez modifier un objet vanilla pour qu'il pointe vers votre nouveau modèle grâce au Custom Model Data.</p>\n<p>Au lieu d'écrire le code manuellement, utilisez notre <a href='/resource-pack-generator/'>Générateur de Resource Pack</a>. Téléchargez votre modèle, attribuez-lui un ID CustomModelData, et le générateur fait le reste.</p>\n<h2>Obtenir l'objet en jeu</h2>\n<p>Une fois le pack chargé, vous avez besoin d'une commande. Ouvrez le <a href='/custom-item-builder/'>Générateur d'objets</a>, tapez le même ID CustomModelData et copiez la commande <code>/give</code>. C'est aussi simple que ça !</p>"
      }
    }
  },
  {
    slug: "wiki-components-vs-nbt",
    content: {
      en: {
        title: "Components instead of NBT: Everything about items in modern Minecraft",
        desc: "Understand the difference between old NBT tags and the new Data Components system in Minecraft 1.20.5+.",
        body: "<h2>The End of NBT</h2>\n<p>For over a decade, Minecraft used NBT (Named Binary Tag) to store item data like names, enchantments, and lore. In Minecraft 1.20.5, Mojang entirely replaced item NBT with Data Components.</p>\n<h2>What changed?</h2>\n<p>Components are more modular and explicit. Instead of arbitrary nested JSON structures, each attribute has a strict component name. For example, <code>{display:{Name:'{\"text\":\"Sword\"}'}}</code> became <code>[minecraft:custom_name='{\"text\":\"Sword\"}']</code>.</p>\n<h2>How our tools simplify the transition</h2>\n<p>The syntax shift broke millions of existing command blocks and server plugins. Memorizing the new bracket system is tedious. Our tools, like the <a href='/custom-potions/'>Custom Potions Builder</a> and <a href='/custom-villager-trades/'>Villager Trades Builder</a>, have built-in version toggles.</p>\n<p>You can design your items visually, and the site will automatically translate your configuration into perfectly formatted Data Components for 1.21.4+ or legacy NBT for older servers.</p>"
      },
      ru: {
        title: "Компоненты вместо NBT: всё, что нужно знать о создании предметов",
        desc: "Поймите разницу между старыми NBT-тегами и новой системой компонентов данных в Minecraft 1.20.5+.",
        body: "<h2>Конец эпохи NBT</h2>\n<p>Более десяти лет Minecraft использовал NBT для хранения данных предметов (имена, чары, лор). В версии 1.20.5 разработчики полностью заменили NBT предметов на компоненты данных.</p>\n<h2>Что изменилось?</h2>\n<p>Компоненты более модульные и строгие. Вместо вложенных JSON-структур теперь используются явные имена компонентов. Например, <code>{display:{Name:'{\"text\":\"Меч\"}'}}</code> превратилось в <code>[minecraft:custom_name='{\"text\":\"Меч\"}']</code>.</p>\n<h2>Как наши инструменты упрощают переход</h2>\n<p>Смена синтаксиса сломала миллионы командных блоков и плагинов. Запоминать новую систему скобок утомительно. Наши инструменты, такие как <a href='/custom-potions/'>Генератор зелий</a> и <a href='/custom-villager-trades/'>Торги жителей</a>, имеют встроенный переключатель версий.</p>\n<p>Вы создаете предмет визуально, а сайт сам переводит ваши настройки в идеально отформатированные компоненты для 1.21.4+ или в старый NBT для старых серверов.</p>"
      },
      de: {
        title: "Komponenten statt NBT: Alles über Items im modernen Minecraft",
        desc: "Verstehe den Unterschied zwischen alten NBT-Tags und dem neuen Datenkomponenten-System in Minecraft 1.20.5+.",
        body: "<h2>Das Ende von NBT</h2>\n<p>Über ein Jahrzehnt lang nutzte Minecraft NBT, um Item-Daten wie Namen und Lore zu speichern. In Minecraft 1.20.5 hat Mojang Item-NBT vollständig durch Datenkomponenten ersetzt.</p>\n<h2>Was hat sich geändert?</h2>\n<p>Komponenten sind modularer und expliziter. Anstelle von verschachtelten JSON-Strukturen hat jedes Attribut einen strikten Komponentennamen. Zum Beispiel wurde <code>{display:{Name:'{\"text\":\"Schwert\"}'}}</code> zu <code>[minecraft:custom_name='{\"text\":\"Schwert\"}']</code>.</p>\n<h2>Wie unsere Tools den Übergang vereinfachen</h2>\n<p>Die Änderung der Syntax brach Millionen von Befehlsblöcken. Unsere Tools, wie der <a href='/custom-potions/'>Trank-Generator</a>, haben eingebaute Versionsschalter. Du gestaltest visuell, und die Seite generiert perfekt formatierte Komponenten für 1.21.4+ oder Legacy-NBT für ältere Server.</p>"
      },
      fr: {
        title: "Composants au lieu de NBT : Tout sur les objets dans Minecraft moderne",
        desc: "Comprenez la différence entre les anciens tags NBT et le nouveau système de composants de données dans Minecraft 1.20.5+.",
        body: "<h2>La fin du NBT</h2>\n<p>Pendant plus d'une décennie, Minecraft a utilisé le NBT pour stocker les données des objets. Dans Minecraft 1.20.5, Mojang a entièrement remplacé le NBT des objets par des Composants de Données.</p>\n<h2>Qu'est-ce qui a changé ?</h2>\n<p>Les composants sont plus modulaires et explicites. Au lieu de structures JSON imbriquées, chaque attribut a un nom strict. Par exemple, <code>{display:{Name:'{\"text\":\"Épée\"}'}}</code> est devenu <code>[minecraft:custom_name='{\"text\":\"Épée\"}']</code>.</p>\n<h2>Comment nos outils simplifient la transition</h2>\n<p>Le changement de syntaxe a cassé des millions de blocs de commande. Nos outils, comme le <a href='/custom-potions/'>Générateur de Potions</a>, ont des sélecteurs de version intégrés. Concevez visuellement, et le site génère des composants parfaitement formatés pour la 1.21.4+ ou du NBT legacy.</p>"
      }
    }
  },
  {
    slug: "wiki-give-command-not-working",
    content: {
      en: {
        title: "Why is your /give command not working? Common syntax errors",
        desc: "Troubleshoot your broken Minecraft /give commands, fix bracket errors, and learn how to use command generators effectively.",
        body: "<h2>The Red Text of Doom</h2>\n<p>Every server admin knows the pain of pressing Enter and seeing the dreaded red error text in the Minecraft chat. Usually, it's just a tiny typo ruining the entire <code>/give</code> command.</p>\n<h2>Common mistakes</h2>\n<ol>\n    <li><strong>Unbalanced brackets:</strong> Forgetting to close a <code>}</code> or <code>]</code> is the #1 cause of broken commands.</li>\n    <li><strong>Wrong version syntax:</strong> Using NBT curly braces <code>{}</code> in 1.21.4, or using Component square brackets <code>[]</code> in 1.19.</li>\n    <li><strong>Unescaped quotes:</strong> Putting double quotes inside double quotes without escaping them.</li>\n</ol>\n<h2>Stop writing commands manually</h2>\n<p>The human brain isn't built to parse nested JSON arrays. Instead of torturing yourself, use tools that guarantee valid syntax. Need a custom item? Use the <a href='/custom-item-builder/'>Custom Item Builder</a>. Need a villager? Use the <a href='/custom-villager-trades/'>Villager Trades Builder</a>. Don't suffer through syntax errors when generators can do the math for you.</p>"
      },
      ru: {
        title: "Почему ваш /give не работает? Разбор типичных ошибок",
        desc: "Решение проблем со сломанными командами /give в Minecraft, исправление ошибок со скобками и использование генераторов команд.",
        body: "<h2>Красный текст отчаяния</h2>\n<p>Каждый админ сервера знает эту боль: нажимаешь Enter, и чат заливает красным текстом ошибки. Обычно виновата одна крошечная опечатка, которая ломает всю команду <code>/give</code>.</p>\n<h2>Типичные ошибки</h2>\n<ol>\n    <li><strong>Незакрытые скобки:</strong> Забытая <code>}</code> или <code>]</code> — причина №1 сломанных команд.</li>\n    <li><strong>Синтаксис не той версии:</strong> Использование фигурных скобок NBT <code>{}</code> в 1.21.4 или квадратных скобок компонентов <code>[]</code> в 1.19.</li>\n    <li><strong>Неэкранированные кавычки:</strong> Двойные кавычки внутри двойных кавычек без обратного слеша.</li>\n</ol>\n<h2>Хватит писать команды вручную</h2>\n<p>Человеческий мозг не создан для чтения вложенных JSON-массивов. Вместо того чтобы мучиться, используйте инструменты, которые гарантируют валидный синтаксис. Нужен предмет? Используйте <a href='/custom-item-builder/'>Генератор предметов</a>. Нужен житель? Поможет <a href='/custom-villager-trades/'>Генератор торгов</a>. Не страдайте от ошибок синтаксиса — доверьте это генераторам.</p>"
      },
      de: {
        title: "Warum funktioniert Ihr /give-Befehl nicht? Häufige Syntaxfehler",
        desc: "Fehlerbehebung für kaputte /give-Befehle in Minecraft, Behebung von Klammerfehlern und effektive Nutzung von Befehlsgeneratoren.",
        body: "<h2>Der rote Text des Untergangs</h2>\n<p>Jeder Server-Admin kennt den Schmerz: Man drückt Enter und sieht roten Fehlertext im Chat. Meistens ruiniert ein winziger Tippfehler den gesamten <code>/give</code>-Befehl.</p>\n<h2>Häufige Fehler</h2>\n<ol>\n    <li><strong>Fehlende Klammern:</strong> Das Vergessen einer <code>}</code> oder <code>]</code> ist Fehlerursache Nummer eins.</li>\n    <li><strong>Falsche Versionssyntax:</strong> Verwendung von NBT-Klammern <code>{}</code> in 1.21.4 oder Komponentenklammern <code>[]</code> in 1.19.</li>\n    <li><strong>Nicht maskierte Anführungszeichen:</strong> Doppelte Anführungszeichen innerhalb doppelter Anführungszeichen.</li>\n</ol>\n<h2>Hören Sie auf, Befehle manuell zu schreiben</h2>\n<p>Das menschliche Gehirn ist nicht dafür gemacht, verschachtelte JSON-Arrays zu analysieren. Nutze Tools, die eine gültige Syntax garantieren, wie den <a href='/custom-item-builder/'>Custom Item Builder</a>. Quälen Sie sich nicht mit Syntaxfehlern herum!</p>"
      },
      fr: {
        title: "Pourquoi votre commande /give ne fonctionne-t-elle pas ? Erreurs courantes",
        desc: "Dépannez vos commandes /give Minecraft, corrigez les erreurs de crochets et apprenez à utiliser les générateurs.",
        body: "<h2>Le texte rouge de la mort</h2>\n<p>Tout administrateur de serveur connaît la douleur d'appuyer sur Entrée et de voir un texte d'erreur rouge. Généralement, une petite faute de frappe ruine toute la commande <code>/give</code>.</p>\n<h2>Erreurs courantes</h2>\n<ol>\n    <li><strong>Crochets déséquilibrés :</strong> Oublier de fermer une <code>}</code> ou <code>]</code> est la cause numéro un.</li>\n    <li><strong>Mauvaise syntaxe de version :</strong> Utiliser des accolades NBT <code>{}</code> en 1.21.4, ou des crochets de Composants <code>[]</code> en 1.19.</li>\n    <li><strong>Guillemets non échappés :</strong> Mettre des guillemets doubles à l'intérieur de guillemets doubles.</li>\n</ol>\n<h2>Arrêtez d'écrire manuellement</h2>\n<p>Le cerveau humain n'est pas fait pour analyser des tableaux JSON imbriqués. Utilisez des outils qui garantissent une syntaxe valide, comme le <a href='/custom-item-builder/'>Générateur d'objets</a>. Ne souffrez plus des erreurs de syntaxe !</p>"
      }
    }
  },
  {
    slug: "wiki-complex-command-blocks",
    content: {
      en: {
        title: "How to generate complex command block commands in a few clicks",
        desc: "Speed up your map making and server administration by using visual builders for complex Minecraft commands.",
        body: "<h2>The Command Block Ceiling</h2>\n<p>When you start making adventure maps or RPG server mechanics, simple commands aren't enough. You need villagers that sell custom items, or potions that grant glowing, speed, and night vision all at once. Writing these commands into command blocks manually takes forever and is incredibly prone to typos.</p>\n<h2>Visual Builders</h2>\n<p>Visual builders turn command architecture into UI toggles. Want a villager that trades 5 custom tokens for a specific lore-heavy sword? Our <a href='/custom-villager-trades/'>Custom Villager Trades</a> tool lets you drag and drop prices and rewards, and instantly outputs a 500-character <code>/summon</code> command.</p>\n<h2>Efficiency for Admins</h2>\n<p>Using web tools guarantees your syntax is correct before you even paste it into the command block. Keep our toolkit open in a browser tab while you build, and your map-making speed will multiply.</p>"
      },
      ru: {
        title: "Как генерировать сложные команды для командных блоков за пару кликов",
        desc: "Ускорьте создание карт и администрирование сервера, используя визуальные генераторы для сложных команд Minecraft.",
        body: "<h2>Потолок командных блоков</h2>\n<p>При создании приключенческих карт или RPG-механик простых команд недостаточно. Вам нужны жители, продающие кастомные предметы, или зелья, дающие свечение, скорость и ночное зрение одновременно. Писать такие команды в блоки вручную — это долго и чревато опечатками.</p>\n<h2>Визуальные генераторы</h2>\n<p>Визуальные генераторы превращают архитектуру команд в понятный интерфейс. Нужен житель, который меняет 5 кастомных токенов на меч с лором? Наш инструмент <a href='/custom-villager-trades/'>Торги жителей</a> позволяет настроить цены и награды, моментально выдавая команду <code>/summon</code> на 500 символов.</p>\n<h2>Эффективность для админов</h2>\n<p>Использование веб-инструментов гарантирует правильность синтаксиса еще до вставки в блок. Держите наш набор инструментов открытым во вкладке браузера во время строительства, и скорость вашей работы возрастет многократно.</p>"
      },
      de: {
        title: "Wie man komplexe Befehlsblock-Befehle mit wenigen Klicks generiert",
        desc: "Beschleunige das Erstellen von Maps und die Serververwaltung durch visuelle Builder für komplexe Minecraft-Befehle.",
        body: "<h2>Die Grenze der Befehlsblöcke</h2>\n<p>Wenn du Adventure-Maps oder RPG-Mechaniken erstellst, reichen einfache Befehle nicht aus. Du brauchst Dorfbewohner, die benutzerdefinierte Items verkaufen. Das manuelle Schreiben dieser Befehle dauert ewig und ist fehleranfällig.</p>\n<h2>Visuelle Builder</h2>\n<p>Visuelle Builder verwandeln die Befehlsarchitektur in eine Benutzeroberfläche. Willst du einen Dorfbewohner, der 5 Tokens gegen ein Schwert tauscht? Unser Tool für <a href='/custom-villager-trades/'>Dorfbewohner-Handel</a> erledigt das und gibt sofort einen riesigen <code>/summon</code>-Befehl aus.</p>\n<h2>Effizienz für Admins</h2>\n<p>Web-Tools garantieren, dass deine Syntax korrekt ist, bevor du sie in den Befehlsblock einfügst. Deine Geschwindigkeit beim Erstellen von Maps wird sich vervielfachen.</p>"
      },
      fr: {
        title: "Générer des commandes de blocs de commande complexes en quelques clics",
        desc: "Accélérez la création de cartes et la gestion de serveurs en utilisant des générateurs visuels pour les commandes complexes.",
        body: "<h2>Le plafond des blocs de commande</h2>\n<p>Lorsque vous créez des cartes d'aventure ou des mécaniques RPG, les commandes simples ne suffisent pas. Vous avez besoin de villageois qui vendent des objets personnalisés. Écrire ces commandes manuellement prend un temps fou.</p>\n<h2>Générateurs visuels</h2>\n<p>Les générateurs visuels transforment l'architecture des commandes en interface utilisateur. Vous voulez un villageois qui échange 5 jetons contre une épée ? Notre outil <a href='/custom-villager-trades/'>Échanges de Villageois</a> permet de le configurer et génère instantanément une commande <code>/summon</code> de 500 caractères.</p>\n<h2>Efficacité pour les administrateurs</h2>\n<p>L'utilisation d'outils web garantit que votre syntaxe est correcte avant même de la coller dans le bloc de commande. Votre vitesse de création sera décuplée.</p>"
      }
    }
  }
];

var templateFile = fso.OpenTextFile(currentFolder + "\\wiki-custom-model-data\\index.html", 1);
var template = templateFile.ReadAll();
templateFile.Close();

var locales = [
  { code: "en", pathPrefix: "" },
  { code: "ru", pathPrefix: "ru\\" },
  { code: "de", pathPrefix: "de\\" },
  { code: "fr", pathPrefix: "fr\\" }
];

function buildHtml(article, locale) {
  var isEn = (locale.code === "en");
  var content = article.content[locale.code];
  var newHtml = template;
  
  newHtml = newHtml.replace(/<title>.*?<\/title>/g, "<title>" + content.title + " | Cube in Square</title>");
  newHtml = newHtml.replace(/<meta name="description" content=".*?">/g, '<meta name="description" content="' + content.desc + '">');
  newHtml = newHtml.replace(/wiki-custom-model-data/g, article.slug);
  newHtml = newHtml.replace(/<meta property="og:title" content=".*?">/g, '<meta property="og:title" content="' + content.title + ' | Cube in Square">');
  newHtml = newHtml.replace(/<meta property="og:description" content=".*?">/g, '<meta property="og:description" content="' + content.desc + '">');
  newHtml = newHtml.replace(/<meta name="twitter:title" content=".*?">/g, '<meta name="twitter:title" content="' + content.title + ' | Cube in Square">');
  newHtml = newHtml.replace(/<meta name="twitter:description" content=".*?">/g, '<meta name="twitter:description" content="' + content.desc + '">');
  
  var sw = '<div class="language-switch" aria-label="Language"><a ' + (locale.code === 'ru' ? 'class="is-active" ' : '') + 'href="/ru/' + article.slug + '/">RU</a><a ' + (locale.code === 'en' ? 'class="is-active" ' : '') + 'href="/' + article.slug + '/">EN</a><a ' + (locale.code === 'fr' ? 'class="is-active" ' : '') + 'href="/fr/' + article.slug + '/">FR</a><a ' + (locale.code === 'de' ? 'class="is-active" ' : '') + 'href="/de/' + article.slug + '/">DE</a></div>';
  newHtml = newHtml.replace(/<div class="language-switch".*?<\/div>/g, sw);
  
  newHtml = newHtml.replace(/<html lang=".*?">/g, '<html lang="' + locale.code + '">');

  var backLabel = locale.code === 'ru' ? '← Все статьи' : locale.code === 'de' ? '← Alle Artikel' : locale.code === 'fr' ? '← Tous les articles' : '← All articles';
  var prefix = locale.code === 'en' ? '' : '/' + locale.code;
  
  var bodyRegex = /<main class="page-shell wiki-article">[\s\S]*?<\/main>/;
  var articleHtml = '<main class="page-shell wiki-article">\n    <a class="article-back" href="' + prefix + '/wiki/">' + backLabel + '</a>\n    <section class="page-hero"><h1>' + content.title + '</h1><p class="page-lead">' + content.desc + '</p></section>\n    <article>\n        ' + content.body + '\n    </article>\n</main>';
  
  newHtml = newHtml.replace(bodyRegex, articleHtml);
  return newHtml;
}

for (var i = 0; i < articles.length; i++) {
  var article = articles[i];
  for (var j = 0; j < locales.length; j++) {
    var locale = locales[j];
    var dir = currentFolder + "\\" + locale.pathPrefix + article.slug;
    if (!fso.FolderExists(dir)) {
      fso.CreateFolder(dir);
    }
    
    var html = buildHtml(article, locale);
    
    var outFile = fso.CreateTextFile(dir + "\\index.html", true);
    outFile.Write(html);
    outFile.Close();
    WScript.Echo("Generated " + dir + "\\index.html");
  }
}
