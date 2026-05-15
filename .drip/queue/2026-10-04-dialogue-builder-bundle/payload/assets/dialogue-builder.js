(() => {
  const locale = (document.documentElement.lang || 'en').slice(0, 2);
  const copy = {"copied":{"en":"Copied","ru":"Скопировано","fr":"Copié","de":"Kopiert"},"lineLabel":{"en":"Line","ru":"Линия","fr":"Ligne","de":"Zeile"},"remove":{"en":"Remove","ru":"Убрать","fr":"Retirer","de":"Entfernen"},"channel":{"en":"Channel","ru":"Канал","fr":"Canal","de":"Kanal"},"speakerOverride":{"en":"Speaker override","ru":"Переопределить спикера","fr":"Intervenant","de":"Sprecher überschreiben"},"color":{"en":"Color","ru":"Цвет","fr":"Couleur","de":"Farbe"},"style":{"en":"Style","ru":"Стиль","fr":"Style","de":"Stil"},"text":{"en":"Text","ru":"Текст","fr":"Texte","de":"Text"},"noLines":{"en":"No dialogue lines yet.","ru":"Диалоговых строк пока нет.","fr":"Aucune ligne de dialogue pour le moment.","de":"Noch keine Dialogzeilen."},"summaryPattern":{"en":"{count} line(s) prepared. Channels: {channels}.","ru":"Подготовлено строк: {count}. Каналы: {channels}.","fr":"{count} ligne(s) prêtes. Canaux : {channels}.","de":"{count} Zeile(n) vorbereitet. Kanäle: {channels}."},"presets":{"en":{"court":{"target":"@a","defaultSpeaker":"Judge","prefix":"colon","speakerColor":"gold","lines":[{"channel":"tellraw","speaker":"","color":"white","style":"plain","text":"This court is now in session."},{"channel":"tellraw","speaker":"Accuser","color":"yellow","style":"plain","text":"We present the testimony and ask for silence until the end."},{"channel":"title","speaker":"","color":"red","style":"bold","text":"Verdict delivered"}]},"quest":{"target":"@p","defaultSpeaker":"Guide","prefix":"colon","speakerColor":"aqua","lines":[{"channel":"tellraw","speaker":"","color":"white","style":"plain","text":"If the door is already open, you are not late by a step but by someone else’s mistake."},{"channel":"actionbar","speaker":"","color":"yellow","style":"plain","text":"Find the archive key"}]},"ritual":{"target":"@a","defaultSpeaker":"Chorus","prefix":"dash","speakerColor":"light_purple","lines":[{"channel":"tellraw","speaker":"","color":"light_purple","style":"italic","text":"The third bell has already sounded. There is no road back now."},{"channel":"actionbar","speaker":"","color":"red","style":"bold","text":"Do not leave the circle"}]},"duel":{"target":"@a","defaultSpeaker":"Herald","prefix":"colon","speakerColor":"gold","lines":[{"channel":"title","speaker":"","color":"yellow","style":"bold","text":"Draw steel"},{"channel":"actionbar","speaker":"","color":"red","style":"bold","text":"Begins in 3..."}]}},"ru":{"court":{"target":"@a","defaultSpeaker":"Судья","prefix":"colon","speakerColor":"gold","lines":[{"channel":"tellraw","speaker":"","color":"white","style":"plain","text":"Заседание объявляется открытым."},{"channel":"tellraw","speaker":"Обвинитель","color":"yellow","style":"plain","text":"Предъявляем показания и просим всех молчать до конца."},{"channel":"title","speaker":"","color":"red","style":"bold","text":"Вердикт вынесен"}]},"quest":{"target":"@p","defaultSpeaker":"Проводник","prefix":"colon","speakerColor":"aqua","lines":[{"channel":"tellraw","speaker":"","color":"white","style":"plain","text":"Если дверь уже открыта, значит ты опоздал не на шаг, а на чью-то ошибку."},{"channel":"actionbar","speaker":"","color":"yellow","style":"plain","text":"Найди архивный ключ"}]},"ritual":{"target":"@a","defaultSpeaker":"Хор","prefix":"dash","speakerColor":"light_purple","lines":[{"channel":"tellraw","speaker":"","color":"light_purple","style":"italic","text":"Третий звон уже прозвучал. Назад дороги нет."},{"channel":"actionbar","speaker":"","color":"red","style":"bold","text":"Не выходите из круга"}]},"duel":{"target":"@a","defaultSpeaker":"Глашатай","prefix":"colon","speakerColor":"gold","lines":[{"channel":"title","speaker":"","color":"yellow","style":"bold","text":"К оружию"},{"channel":"actionbar","speaker":"","color":"red","style":"bold","text":"Начало через 3..."}]}},"fr":{"court":{"target":"@a","defaultSpeaker":"Juge","prefix":"colon","speakerColor":"gold","lines":[{"channel":"tellraw","speaker":"","color":"white","style":"plain","text":"L’audience est ouverte."},{"channel":"tellraw","speaker":"Accusateur","color":"yellow","style":"plain","text":"Nous présentons les témoignages et demandons le silence jusqu’à la fin."},{"channel":"title","speaker":"","color":"red","style":"bold","text":"Verdict prononcé"}]},"quest":{"target":"@p","defaultSpeaker":"Guide","prefix":"colon","speakerColor":"aqua","lines":[{"channel":"tellraw","speaker":"","color":"white","style":"plain","text":"Si la porte est déjà ouverte, tu n’es pas en retard d’un pas mais de l’erreur de quelqu’un."},{"channel":"actionbar","speaker":"","color":"yellow","style":"plain","text":"Trouver la clé des archives"}]},"ritual":{"target":"@a","defaultSpeaker":"Chœur","prefix":"dash","speakerColor":"light_purple","lines":[{"channel":"tellraw","speaker":"","color":"light_purple","style":"italic","text":"La troisième cloche a déjà sonné. Il n’y a plus de retour."},{"channel":"actionbar","speaker":"","color":"red","style":"bold","text":"Ne quittez pas le cercle"}]},"duel":{"target":"@a","defaultSpeaker":"Héraut","prefix":"colon","speakerColor":"gold","lines":[{"channel":"title","speaker":"","color":"yellow","style":"bold","text":"Aux armes"},{"channel":"actionbar","speaker":"","color":"red","style":"bold","text":"Début dans 3..."}]}},"de":{"court":{"target":"@a","defaultSpeaker":"Richter","prefix":"colon","speakerColor":"gold","lines":[{"channel":"tellraw","speaker":"","color":"white","style":"plain","text":"Die Verhandlung ist eröffnet."},{"channel":"tellraw","speaker":"Ankläger","color":"yellow","style":"plain","text":"Wir legen die Aussagen vor und bitten bis zum Ende um Ruhe."},{"channel":"title","speaker":"","color":"red","style":"bold","text":"Urteil gesprochen"}]},"quest":{"target":"@p","defaultSpeaker":"Führer","prefix":"colon","speakerColor":"aqua","lines":[{"channel":"tellraw","speaker":"","color":"white","style":"plain","text":"Wenn die Tür schon offen ist, bist du nicht einen Schritt zu spät, sondern zu jemandes Fehler."},{"channel":"actionbar","speaker":"","color":"yellow","style":"plain","text":"Archivschnlüssel finden"}]},"ritual":{"target":"@a","defaultSpeaker":"Chor","prefix":"dash","speakerColor":"light_purple","lines":[{"channel":"tellraw","speaker":"","color":"light_purple","style":"italic","text":"Die dritte Glocke hat bereits geklungen. Es gibt keinen Rückweg mehr."},{"channel":"actionbar","speaker":"","color":"red","style":"bold","text":"Verlasst den Kreis nicht"}]},"duel":{"target":"@a","defaultSpeaker":"Herold","prefix":"colon","speakerColor":"gold","lines":[{"channel":"title","speaker":"","color":"yellow","style":"bold","text":"Zu den Waffen"},{"channel":"actionbar","speaker":"","color":"red","style":"bold","text":"Beginn in 3..."}]}}}};
  const localeData = {"en":{"lang":"en","locale":"en_US","navWiki":"Wiki","navTools":"Tools","navProject":"Project","search":"Search the site...","allArticles":"All articles","toolTitle":"Minecraft Dialogue Builder","toolDesc":"Build NPC lines, narration, actionbars, and title beats for Minecraft scenes without hand-writing every tellraw object.","toolLead":"Draft short scene dialogue for trials, rituals, warnings, quest turns, and ambient narration. Choose the channel, keep the pacing readable, and copy commands that are ready to split into command blocks or datapack functions.","readGuide":"Read guide","openBooks":"Open book & letter builder","readArticle":"Dialogue pacing article","quickStarts":"Quick starts","quickSummary":"Load a scene skeleton, then rewrite the voices for your world.","sceneSetup":"Scene setup","targetLabel":"Audience target","speakerLabel":"Default speaker","prefixLabel":"Prefix style","speakerColorLabel":"Speaker color","note":"Tellraw handles spoken lines best. Titles and actionbars work better for short impact beats and system pressure.","linesTitle":"Dialogue lines","addLine":"Add line","lineSummary":"Keep each beat short enough to scan. If the player needs a full document, move that text into a book instead.","outputTitle":"Generated commands","copyCommands":"Copy commands","whereTitle":"Where this helps","whereItems":["Trials, confrontations, ritual scenes, and faction briefings that need fast readable dialogue.","NPC guidance that should feel in-world instead of like a giant wall of narration.","Actionbar and title beats that add pressure without replacing spoken lines."],"beforeTitle":"Before export","beforeItems":["Reserve titles for strong beats. If every line becomes a title, players stop reading them.","Use books for evidence, letters, contracts, and anything players should revisit later.","If the speaker matters as an object, pair the scene with named items, books, or props from the rest of the toolset."],"prefixOptions":[["colon","Speaker: line"],["dash","Speaker - line"],["none","No prefix"]],"channelOptions":[["tellraw","Tellraw chat"],["title","Title"],["subtitle","Subtitle"],["actionbar","Actionbar"]],"colorOptions":[["white","White"],["gold","Gold"],["yellow","Yellow"],["gray","Gray"],["green","Green"],["aqua","Aqua"],["light_purple","Purple"],["red","Red"]],"styleOptions":[["plain","Plain"],["italic","Italic"],["bold","Bold"]],"quickLabels":{"court":"Courtroom","quest":"Quest turn","ritual":"Ritual","duel":"Duel"},"guideTitle":"How to use the Minecraft Dialogue Builder","guideDesc":"Build tellraw lines, titles, subtitles, and actionbars for Minecraft scenes without losing readability or pacing.","guideLead":"Good Minecraft dialogue is not about raw text volume. It is about where a line lands, how quickly the player can read it, and whether the channel matches the emotional weight of the moment. This builder exists to keep those decisions visible instead of hiding them behind command syntax.","guideSections":[["1. Decide whether the line should live in chat, on screen, or in pressure UI","Tellraw works best for actual spoken lines and short narration that can sit inside the flow of play. Titles work best for impact moments. Actionbars are strongest when the line should feel like pressure, timing, or system guidance rather than conversation."],["2. Keep one beat per line","If one command tries to carry setup, reaction, lore, and instruction at the same time, players stop reading halfway through. A courtroom opening, ritual warning, and duel countdown all read better when each line holds one beat."],["3. Let the speaker do part of the work","A clear speaker prefix saves a lot of confusion in crowded scenes. Use a stable color and prefix style so players learn the voice quickly, then keep the spoken line itself short."],["4. Use books when memory matters","Dialogue is great for live scene flow. Books, letters, and notes are better when the player should carry the information away and read it again later. That is why this builder sits next to the book tool instead of replacing it."]],"guideFaq":[["Should I use titles for every important line?","Usually no. Titles work best when they stay rare enough to feel heavy."],["What if one character needs a long speech?","Split it into several short beats or move part of the text into a book or note."],["When should I use actionbar instead of tellraw?","Use actionbar for countdowns, warnings, and pressure cues that should not sit in chat history."],["Can this replace branching dialogue systems?","Not fully. It helps with readable command output and scene pacing, not with full quest logic."]],"articleTitle":"How to write Minecraft dialogue players will actually read","articleDesc":"A practical guide to pacing Minecraft dialogue, choosing channels, and keeping scene text readable during live play.","articleLead":"The fastest way to kill a scene in Minecraft is to turn every emotional beat into a slab of text. Players do not stop caring because the lore is bad. They stop caring because the line hits them in the wrong place, at the wrong length, through the wrong channel.","articleBlocks":[["Write for interruption, not for theatre silence","Minecraft scenes live in a noisy world. Players move, type, panic, and miss half a sentence. Good dialogue survives interruption by keeping each beat compact and legible."],["Give each channel a job","Tellraw carries conversation. Titles carry shock. Actionbars carry pressure. Once every channel has a job, scenes start feeling intentional instead of crowded."],["A small pacing table helps immediately","<table class=\"compact-table\"><thead><tr><th>Scene beat</th><th>Usually works best with</th><th>Avoid</th></tr></thead><tbody><tr><td>Trial opening</td><td>Tellraw + one title at the verdict</td><td>Spamming titles for every statement</td></tr><tr><td>Ritual warning</td><td>Tellraw line + actionbar pressure</td><td>Long lore dumps while danger is active</td></tr><tr><td>Duel start</td><td>Short title or actionbar countdown</td><td>Multi-line exposition before combat</td></tr><tr><td>Quest clue</td><td>Tellraw or a note/book if it must persist</td><td>Hiding the clue in a giant speech block</td></tr></tbody></table>"],["Move persistent information into objects","If the player should carry the information later, dialogue is the wrong container. Put that material into a book, letter, clue item, or readable prop instead of forcing everyone to memorize a speech in real time."]],"articleFaq":[["Should NPC dialogue sound different from system text?","Yes. If everything uses the same channel and tone, scenes flatten quickly."],["Is it okay to leave some lines incomplete?","Sometimes that actually feels better. Fragmented warnings or interrupted testimony can sound more alive than polished exposition."],["What usually makes dialogue unreadable?","Too much text per beat, no channel discipline, and no respect for how fast Minecraft play moves."]],"localeLinks":{"tool":"/dialogue-builder/","guide":"/wiki-dialogue-builder/","article":"/wiki-readable-minecraft-dialogue/"},"footerPrivacy":"Privacy Policy"},"ru":{"lang":"ru","locale":"ru_RU","navWiki":"Вики","navTools":"Инструменты","navProject":"О проекте","search":"Поиск по сайту...","allArticles":"Все статьи","toolTitle":"Конструктор диалогов Minecraft","toolDesc":"Собирает реплики NPC, narration, actionbar и title-моменты для сцен Minecraft без ручной возни с tellraw JSON.","toolLead":"Подготовьте короткие сценические реплики для суда, ритуала, предупреждения, квестового поворота или атмосферной narration. Выберите канал, удержите ритм чтения и скопируйте команды, которые потом легко разложить по командным блокам или функциям.","readGuide":"Читать гайд","openBooks":"Открыть конструктор книг","readArticle":"Статья про ритм диалогов","quickStarts":"Быстрые заготовки","quickSummary":"Загрузите каркас сцены, а потом перепишите голоса под свой мир.","sceneSetup":"Настройки сцены","targetLabel":"Цель","speakerLabel":"Спикер по умолчанию","prefixLabel":"Стиль префикса","speakerColorLabel":"Цвет имени","note":"Tellraw лучше всего подходит для живых реплик. Title и actionbar сильнее работают как короткие ударные моменты и системное давление.","linesTitle":"Линии диалога","addLine":"Добавить линию","lineSummary":"Пусть каждая реплика остаётся короткой и читаемой. Если игроку нужен полноценный документ, перенесите текст в книгу.","outputTitle":"Готовые команды","copyCommands":"Скопировать команды","whereTitle":"Где это полезно","whereItems":["Суды, конфронтации, ритуалы и фракционные брифинги, которым нужны быстрые читаемые реплики.","Подсказки от NPC, которые должны ощущаться частью мира, а не стеной narration.","Actionbar и title-моменты, которые добавляют давление, не заменяя разговор."],"beforeTitle":"Перед экспортом","beforeItems":["Оставляйте title для сильных ударов. Если каждая строчка станет title, игроки перестанут их читать.","Книги лучше подходят для доказательств, писем, контрактов и всего, к чему нужно вернуться позже.","Если важен сам объект, свяжите сцену с именованными предметами, книгами или пропами из остального набора инструментов."],"prefixOptions":[["colon","Имя: реплика"],["dash","Имя - реплика"],["none","Без префикса"]],"channelOptions":[["tellraw","Чат tellraw"],["title","Title"],["subtitle","Subtitle"],["actionbar","Actionbar"]],"colorOptions":[["white","Белый"],["gold","Золотой"],["yellow","Жёлтый"],["gray","Серый"],["green","Зелёный"],["aqua","Бирюзовый"],["light_purple","Фиолетовый"],["red","Красный"]],"styleOptions":[["plain","Обычный"],["italic","Курсив"],["bold","Жирный"]],"quickLabels":{"court":"Суд","quest":"Квест","ritual":"Ритуал","duel":"Дуэль"},"guideTitle":"Как пользоваться конструктором диалогов Minecraft","guideDesc":"Собирайте tellraw-реплики, title, subtitle и actionbar для сцен Minecraft без потери читаемости и ритма.","guideLead":"Хороший диалог в Minecraft держится не на объёме текста, а на том, куда падает реплика, насколько быстро её можно прочитать и подходит ли канал под вес момента. Этот инструмент держит эти решения на виду, а не прячет их за синтаксисом команды.","guideSections":[["1. Сначала решите, жить ли реплике в чате, на экране или в pressure UI","Tellraw лучше всего работает для живых реплик и короткой narration внутри сцены. Title нужен для ударных моментов. Actionbar сильнее всего там, где реплика должна ощущаться как давление, таймер или системная подсказка, а не как разговор."],["2. Одна реплика — один beat","Если одна команда одновременно несёт завязку, реакцию, лор и инструкцию, игроки перестают читать её на середине. Открытие суда, ритуальное предупреждение и отсчёт перед дуэлью лучше читаются, когда каждая строка держит один beat."],["3. Пусть часть работы делает сам говорящий","Чёткий префикс спикера спасает от путаницы в многолюдных сценах. Дайте голосу стабильный цвет и стиль, а сам текст оставьте коротким."],["4. Когда важна память, переходите в книги","Диалоги хороши для живого течения сцены. Книги, письма и записки лучше работают там, где игрок должен унести информацию с собой и перечитать её позже. Поэтому этот инструмент стоит рядом с книжным, а не заменяет его."]],"guideFaq":[["Нужно ли пихать важные реплики в title?","Обычно нет. Title работает сильнее, когда остаётся редким и тяжёлым."],["Что делать, если персонажу нужен длинный монолог?","Разбейте его на несколько коротких beat или вынесите часть текста в книгу или записку."],["Когда брать actionbar вместо tellraw?","Для отсчётов, предупреждений и pressure cues, которые не должны лежать в истории чата."],["Заменяет ли это ветвящиеся диалоговые системы?","Не полностью. Инструмент помогает с читаемым выводом команд и ритмом сцены, а не с полной квестовой логикой."]],"articleTitle":"Как писать диалоги для Minecraft, которые игроки реально читают","articleDesc":"Практический разбор того, как удерживать ритм реплик Minecraft, выбирать правильный канал и не ломать сцену стеной текста.","articleLead":"Самый быстрый способ убить сцену в Minecraft — превратить каждый эмоциональный момент в бетонную плиту текста. Игроки перестают цепляться не потому, что лор плохой, а потому что реплика попадает не туда, не тем объёмом и не через тот канал.","articleBlocks":[["Пишите так, будто вас могут прервать в любую секунду","Сцены в Minecraft живут в шумном мире. Игроки двигаются, пишут, паникуют и пропускают полстроки. Хороший диалог переживает это, потому что каждый beat остаётся коротким и разборчивым."],["Пусть у каждого канала будет своя работа","Tellraw несёт разговор. Title несёт шок. Actionbar несёт давление. Когда у канала появляется функция, сцена начинает ощущаться собранной, а не перегруженной."],["Небольшая таблица ритма помогает сразу","<table class=\"compact-table\"><thead><tr><th>Beat сцены</th><th>Что обычно работает лучше</th><th>Чего лучше не делать</th></tr></thead><tbody><tr><td>Открытие суда</td><td>Tellraw + один title на вердикте</td><td>Спамить title на каждое заявление</td></tr><tr><td>Ритуальное предупреждение</td><td>Tellraw-реплика + pressure в actionbar</td><td>Лить длинный лор, пока опасность уже активна</td></tr><tr><td>Старт дуэли</td><td>Короткий title или actionbar-отсчёт</td><td>Многострочное вступление перед боем</td></tr><tr><td>Квестовая улика</td><td>Tellraw или записка/книга, если она должна остаться</td><td>Прятать улику внутри огромной речи</td></tr></tbody></table>"],["Постоянную информацию переносите в объекты","Если игрок должен вернуться к информации позже, диалог — плохой контейнер. Лучше вынести это в книгу, письмо, улику или читаемый проп, чем заставлять всех запоминать речь на ходу."]],"articleFaq":[["Должны ли реплики NPC звучать иначе, чем системный текст?","Да. Если всё идёт через один канал и в одном тоне, сцены быстро сплющиваются."],["Нормально ли оставлять некоторые реплики оборванными?","Иногда это даже работает лучше. Обрезанные предупреждения или прерванные показания звучат живее, чем отполированная экспозиция."],["Что чаще всего делает диалог нечитаемым?","Слишком много текста на один beat, отсутствие дисциплины каналов и игнор скорости самого Minecraft."]],"localeLinks":{"tool":"/ru/dialogue-builder/","guide":"/ru/wiki-dialogue-builder/","article":"/ru/wiki-readable-minecraft-dialogue/"},"footerPrivacy":"Политика конфиденциальности"},"fr":{"lang":"fr","locale":"fr_FR","navWiki":"Wiki","navTools":"Outils","navProject":"Projet","search":"Rechercher sur le site...","allArticles":"Tous les articles","toolTitle":"Constructeur de dialogues Minecraft","toolDesc":"Crée des répliques de PNJ, de la narration, des actionbars et des moments en title pour Minecraft sans écrire chaque tellraw à la main.","toolLead":"Préparez des répliques courtes pour un procès, un rituel, un avertissement, un tournant de quête ou une narration d’ambiance. Choisissez le canal, gardez un rythme lisible et copiez des commandes prêtes à être réparties dans des command blocks ou des fonctions.","readGuide":"Lire le guide","openBooks":"Ouvrir le constructeur de livres","readArticle":"Article sur le rythme du dialogue","quickStarts":"Démarrages rapides","quickSummary":"Chargez un squelette de scène, puis réécrivez les voix pour votre monde.","sceneSetup":"Réglages de la scène","targetLabel":"Cible","speakerLabel":"Intervenant par défaut","prefixLabel":"Style du préfixe","speakerColorLabel":"Couleur du nom","note":"Tellraw reste le meilleur choix pour les répliques vivantes. Les titles et actionbars sont plus forts pour les impacts courts et la pression système.","linesTitle":"Lignes de dialogue","addLine":"Ajouter une ligne","lineSummary":"Gardez chaque réplique assez courte pour être lue vite. Si le joueur a besoin d’un vrai document, passez plutôt par un livre.","outputTitle":"Commandes générées","copyCommands":"Copier les commandes","whereTitle":"Où cela aide","whereItems":["Procès, confrontations, rituels et briefings de faction qui ont besoin de répliques rapides et lisibles.","Guidage de PNJ qui doit sembler appartenir au monde plutôt qu’à un mur de narration.","Moments en actionbar ou title qui ajoutent de la pression sans remplacer la parole."],"beforeTitle":"Avant l’export","beforeItems":["Gardez les titles pour les gros impacts. Si chaque ligne devient un title, les joueurs cessent de les lire.","Les livres sont meilleurs pour les preuves, lettres, contrats et tout ce qu’on doit relire plus tard.","Si l’objet lui-même compte, reliez la scène à des items nommés, des livres ou des accessoires du reste du site."],"prefixOptions":[["colon","Nom : réplique"],["dash","Nom - réplique"],["none","Sans préfixe"]],"channelOptions":[["tellraw","Chat tellraw"],["title","Title"],["subtitle","Subtitle"],["actionbar","Actionbar"]],"colorOptions":[["white","Blanc"],["gold","Or"],["yellow","Jaune"],["gray","Gris"],["green","Vert"],["aqua","Aqua"],["light_purple","Violet"],["red","Rouge"]],"styleOptions":[["plain","Normal"],["italic","Italique"],["bold","Gras"]],"quickLabels":{"court":"Procès","quest":"Quête","ritual":"Rituel","duel":"Duel"},"guideTitle":"Comment utiliser le constructeur de dialogues Minecraft","guideDesc":"Créez des répliques tellraw, des titles, des subtitles et des actionbars pour vos scènes Minecraft sans perdre en lisibilité ni en rythme.","guideLead":"Un bon dialogue Minecraft n’est pas une question de volume de texte. Tout dépend de l’endroit où la ligne tombe, de la vitesse à laquelle le joueur peut la lire et du fait que le canal corresponde au poids émotionnel du moment. Cet outil garde ces décisions visibles au lieu de les cacher derrière la syntaxe des commandes.","guideSections":[["1. Décidez si la ligne doit vivre dans le chat, à l’écran ou dans l’UI de pression","Tellraw fonctionne le mieux pour les répliques et la petite narration pendant l’action. Les titles servent aux impacts. Les actionbars sont idéales pour la pression, les minuteries et les indications système plutôt que pour une vraie conversation."],["2. Une ligne, un beat","Si une seule commande doit porter contexte, réaction, lore et instruction en même temps, les joueurs cessent de lire au milieu. Une ouverture de procès, un avertissement rituel ou un compte à rebours de duel se lisent bien mieux quand chaque ligne tient un seul beat."],["3. Laissez l’orateur faire une partie du travail","Un préfixe clair évite beaucoup de confusion dans les scènes chargées. Donnez à une voix une couleur et une forme stables, puis gardez la ligne elle-même courte."],["4. Quand la mémoire compte, passez aux livres","Le dialogue sert au flux vivant de la scène. Les livres, lettres et notes sont meilleurs lorsque le joueur doit emporter l’information et la relire plus tard. C’est pour cela que cet outil vit à côté du constructeur de livres au lieu de le remplacer."]],"guideFaq":[["Faut-il mettre toutes les lignes importantes en title ?","En général non. Les titles fonctionnent mieux quand elles restent rares et lourdes."],["Que faire si un personnage a besoin d’un long monologue ?","Découpez-le en plusieurs beats courts ou déplacez une partie du texte dans un livre ou une note."],["Quand utiliser actionbar plutôt que tellraw ?","Pour des comptes à rebours, avertissements et signaux de pression qui ne doivent pas rester dans l’historique du chat."],["Est-ce que cela remplace un vrai système de dialogue à embranchements ?","Pas complètement. L’outil aide pour la lisibilité des commandes et le rythme, pas pour toute la logique de quête."]],"articleTitle":"Comment écrire des dialogues Minecraft que les joueurs lisent vraiment","articleDesc":"Guide pratique pour rythmer le dialogue Minecraft, choisir le bon canal et garder le texte lisible en jeu.","articleLead":"Le moyen le plus rapide de tuer une scène dans Minecraft est de transformer chaque émotion en bloc de texte. Les joueurs ne décrochent pas parce que le lore est mauvais, mais parce que la ligne arrive au mauvais endroit, à la mauvaise longueur, dans le mauvais canal.","articleBlocks":[["Écrivez pour un monde qui interrompt","Les scènes Minecraft vivent dans le bruit. Les joueurs bougent, écrivent, paniquent et ratent la moitié d’une phrase. Un bon dialogue survit à cela en gardant chaque beat compact et lisible."],["Donnez un rôle à chaque canal","Tellraw porte la conversation. Les titles portent le choc. L’actionbar porte la pression. Quand chaque canal a un rôle, la scène paraît construite au lieu d’être encombrée."],["Un petit tableau de rythme aide tout de suite","<table class=\"compact-table\"><thead><tr><th>Beat de scène</th><th>Ce qui marche le mieux</th><th>À éviter</th></tr></thead><tbody><tr><td>Ouverture du procès</td><td>Tellraw + un title pour le verdict</td><td>Spam de titles à chaque déclaration</td></tr><tr><td>Avertissement rituel</td><td>Réplique tellraw + pression en actionbar</td><td>Déverser du lore pendant que le danger est déjà là</td></tr><tr><td>Début du duel</td><td>Petit title ou compte à rebours en actionbar</td><td>Une exposition en plusieurs lignes avant le combat</td></tr><tr><td>Indice de quête</td><td>Tellraw ou note/livre si l’indice doit rester</td><td>Cacher l’indice dans un énorme discours</td></tr></tbody></table>"],["Déplacez l’information durable vers des objets","Si le joueur doit revenir à l’information plus tard, le dialogue est un mauvais contenant. Placez-la plutôt dans un livre, une lettre, un indice ou un accessoire lisible."]],"articleFaq":[["Les dialogues de PNJ doivent-ils sonner différemment du texte système ?","Oui. Si tout passe par le même canal et le même ton, la scène s’écrase vite."],["Est-ce grave si certaines lignes restent incomplètes ?","Pas du tout. Des avertissements interrompus ou un témoignage coupé peuvent sembler plus vivants qu’une exposition parfaitement polie."],["Qu’est-ce qui rend le dialogue illisible le plus souvent ?","Trop de texte par beat, aucun rôle clair pour les canaux et un oubli de la vitesse réelle du jeu."]],"localeLinks":{"tool":"/fr/dialogue-builder/","guide":"/fr/wiki-dialogue-builder/","article":"/fr/wiki-readable-minecraft-dialogue/"},"footerPrivacy":"Politique de confidentialité"},"de":{"lang":"de","locale":"de_DE","navWiki":"Wiki","navTools":"Werkzeuge","navProject":"Projekt","search":"Seite durchsuchen...","allArticles":"Alle Artikel","toolTitle":"Minecraft Dialog-Builder","toolDesc":"Erstellt NPC-Zeilen, Erzählertext, Actionbars und Title-Momente für Minecraft, ohne jedes tellraw von Hand zu schreiben.","toolLead":"Bereite kurze Szenenzeilen für Gerichte, Rituale, Warnungen, Quest-Wendungen oder atmosphärische Erzählertexte vor. Wähle den Kanal, halte den Lesefluss klar und kopiere Befehle, die du danach in Command-Blöcke oder Funktionen aufteilen kannst.","readGuide":"Leitfaden lesen","openBooks":"Buch-Builder öffnen","readArticle":"Artikel zum Dialogrhythmus","quickStarts":"Schnellstarts","quickSummary":"Lade ein Szenengerüst und schreibe die Stimmen dann für deine Welt um.","sceneSetup":"Szenen-Setup","targetLabel":"Ziel","speakerLabel":"Standardsprecher","prefixLabel":"Präfixstil","speakerColorLabel":"Namensfarbe","note":"Tellraw eignet sich am besten für lebendige Dialogzeilen. Titles und Actionbars funktionieren stärker für kurze Einschläge und Systemdruck.","linesTitle":"Dialogzeilen","addLine":"Zeile hinzufügen","lineSummary":"Halte jede Zeile kurz genug zum schnellen Lesen. Wenn Spieler ein richtiges Dokument brauchen, gehört der Text eher in ein Buch.","outputTitle":"Erzeugte Befehle","copyCommands":"Befehle kopieren","whereTitle":"Wo das hilft","whereItems":["Gerichte, Konfrontationen, Rituale und Fraktions-Briefings mit schnell lesbaren Dialogzeilen.","NPC-Hinweise, die wie Teil der Welt wirken sollen statt wie eine Textwand.","Actionbar- und Title-Momente, die Druck aufbauen, ohne gesprochene Zeilen zu ersetzen."],"beforeTitle":"Vor dem Export","beforeItems":["Spare Titles für starke Einschläge auf. Wenn jede Zeile ein Title wird, lesen Spieler sie nicht mehr.","Bücher sind besser für Beweise, Briefe, Verträge und alles, was später noch einmal gelesen werden soll.","Wenn das Objekt selbst wichtig ist, kombiniere die Szene mit benannten Items, Büchern oder Requisiten aus dem restlichen Toolset."],"prefixOptions":[["colon","Name: Zeile"],["dash","Name - Zeile"],["none","Ohne Präfix"]],"channelOptions":[["tellraw","Tellraw-Chat"],["title","Title"],["subtitle","Subtitle"],["actionbar","Actionbar"]],"colorOptions":[["white","Weiß"],["gold","Gold"],["yellow","Gelb"],["gray","Grau"],["green","Grün"],["aqua","Aqua"],["light_purple","Lila"],["red","Rot"]],"styleOptions":[["plain","Normal"],["italic","Kursiv"],["bold","Fett"]],"quickLabels":{"court":"Gericht","quest":"Quest","ritual":"Ritual","duel":"Duell"},"guideTitle":"So nutzt du den Minecraft Dialog-Builder","guideDesc":"Erstelle Tellraw-Zeilen, Titles, Subtitles und Actionbars für Minecraft-Szenen, ohne Lesbarkeit und Takt zu verlieren.","guideLead":"Guter Minecraft-Dialog hängt nicht von reiner Textmenge ab. Entscheidend ist, wo die Zeile landet, wie schnell sie gelesen werden kann und ob der Kanal zum emotionalen Gewicht des Moments passt. Dieser Builder hält diese Entscheidungen sichtbar, statt sie hinter Befehlssyntax zu verstecken.","guideSections":[["1. Entscheide zuerst, ob die Zeile in den Chat, auf den Bildschirm oder in Druck-UI gehört","Tellraw ist am besten für gesprochene Zeilen und kurze Erzählerstücke mitten im Spiel. Titles eignen sich für harte Einschläge. Actionbars funktionieren am stärksten für Druck, Timer und Systemhinweise statt für eigentliche Gespräche."],["2. Eine Zeile, ein Beat","Wenn ein einzelner Befehl gleichzeitig Kontext, Reaktion, Lore und Anweisung tragen muss, hören Spieler in der Mitte auf zu lesen. Ein Gerichtsauftakt, eine Ritualwarnung oder ein Duell-Countdown wirken viel klarer, wenn jede Zeile nur einen Beat trägt."],["3. Lass den Sprecher einen Teil der Arbeit erledigen","Ein klares Sprecherpräfix spart in dichten Szenen viel Verwirrung. Gib der Stimme eine feste Farbe und Form und halte die eigentliche Zeile kurz."],["4. Wenn Erinnerung wichtig ist, wechsle zu Büchern","Dialog ist stark für den lebendigen Fluss einer Szene. Bücher, Briefe und Notizen sind besser, wenn Spieler die Information mitnehmen und später noch einmal lesen sollen. Darum steht dieses Tool neben dem Buch-Builder, statt ihn zu ersetzen."]],"guideFaq":[["Soll ich jede wichtige Zeile als Title ausgeben?","Meistens nein. Titles wirken stärker, wenn sie selten genug bleiben."],["Was ist, wenn ein Charakter einen langen Monolog braucht?","Teile ihn in mehrere kurze Beats auf oder verschiebe einen Teil des Textes in ein Buch oder eine Notiz."],["Wann nehme ich Actionbar statt Tellraw?","Für Countdowns, Warnungen und Drucksignale, die nicht im Chatverlauf liegen bleiben sollen."],["Ersetzt das richtige verzweigte Dialogsysteme?","Nicht vollständig. Es hilft bei lesbaren Befehlen und Szenenrhythmus, nicht bei kompletter Questlogik."]],"articleTitle":"So schreibst du Minecraft-Dialoge, die Spieler wirklich lesen","articleDesc":"Praktischer Leitfaden für lesbaren Minecraft-Dialog, saubere Kanalwahl und besseres Szenentempo.","articleLead":"Der schnellste Weg, eine Szene in Minecraft zu töten, ist jede emotionale Regung in einen Textblock zu pressen. Spieler springen nicht ab, weil die Lore schlecht ist, sondern weil die Zeile am falschen Ort, in der falschen Länge und über den falschen Kanal ankommt.","articleBlocks":[["Schreibe für Unterbrechung, nicht für Theaterstille","Minecraft-Szenen leben in einem lauten Raum. Spieler bewegen sich, tippen, geraten in Panik und verpassen halbe Sätze. Guter Dialog überlebt das, weil jeder Beat kompakt und lesbar bleibt."],["Gib jedem Kanal eine Aufgabe","Tellraw trägt das Gespräch. Titles tragen den Schock. Actionbars tragen den Druck. Sobald jeder Kanal eine Aufgabe hat, wirkt die Szene gebaut statt überladen."],["Eine kleine Takt-Tabelle hilft sofort","<table class=\"compact-table\"><thead><tr><th>Szenenbeat</th><th>Funktioniert meist am besten mit</th><th>Vermeiden</th></tr></thead><tbody><tr><td>Gerichtsauftakt</td><td>Tellraw + ein Title beim Urteil</td><td>Titles für jede einzelne Aussage</td></tr><tr><td>Ritualwarnung</td><td>Tellraw-Zeile + Druck in der Actionbar</td><td>Lange Lore, während die Gefahr schon aktiv ist</td></tr><tr><td>Duellstart</td><td>Kurzer Title oder Actionbar-Countdown</td><td>Mehrzeilige Exposition vor dem Kampf</td></tr><tr><td>Quest-Hinweis</td><td>Tellraw oder Notiz/Buch, wenn er bleiben soll</td><td>Den Hinweis in einer riesigen Rede verstecken</td></tr></tbody></table>"],["Dauerhafte Informationen gehören in Objekte","Wenn Spieler später noch einmal auf Informationen zurückkommen sollen, ist Dialog der falsche Behälter. Verschiebe das Material in ein Buch, einen Brief, einen Hinweis oder ein lesbares Requisit."]],"articleFaq":[["Soll NPC-Dialog anders klingen als Systemtext?","Ja. Wenn alles über denselben Kanal und denselben Ton läuft, werden Szenen schnell flach."],["Ist es okay, manche Zeilen unvollständig zu lassen?","Ja. Abgebrochene Warnungen oder unterbrochene Aussagen fühlen sich oft lebendiger an als perfekt geglättete Exposition."],["Was macht Dialog meistens unlesbar?","Zu viel Text pro Beat, keine klare Kanaldisziplin und kein Respekt vor dem Tempo des Spiels."]],"localeLinks":{"tool":"/de/dialogue-builder/","guide":"/de/wiki-dialogue-builder/","article":"/de/wiki-readable-minecraft-dialogue/"},"footerPrivacy":"Datenschutzrichtlinie"}};
  const targetInput = document.getElementById('dg-target');
  const speakerInput = document.getElementById('dg-speaker');
  const prefixInput = document.getElementById('dg-prefix');
  const speakerColorInput = document.getElementById('dg-speaker-color');
  const linesRoot = document.getElementById('dg-lines');
  const addLineButton = document.getElementById('dg-add-line');
  const summary = document.getElementById('dg-summary');
  const output = document.getElementById('dg-output');
  const copyButton = document.getElementById('dg-copy');
  const channelOptions = (localeData[locale] || localeData.en).channelOptions;
  const colorOptions = (localeData[locale] || localeData.en).colorOptions;
  const styleOptions = (localeData[locale] || localeData.en).styleOptions;
  const presetSets = copy.presets;

  function optionMarkup(options, selected) {
    return options.map(([value, label]) => '<option value="' + value + '"' + (value === selected ? ' selected' : '') + '>' + label + '</option>').join('');
  }

  function prefixText(name, style) {
    if (!name) return '';
    if (style === 'dash') return name + ' - ';
    if (style === 'none') return '';
    return name + ': ';
  }

  function relabel() {
    Array.from(linesRoot.children).forEach((card, index) => {
      const label = card.querySelector('strong');
      if (label) label.textContent = (copy.lineLabel[locale] || copy.lineLabel.en) + ' ' + (index + 1);
    });
  }

  function lineData() {
    return Array.from(linesRoot.querySelectorAll('.dg-line-card')).map((card) => ({
      channel: card.querySelector('[data-field="channel"]').value,
      speaker: card.querySelector('[data-field="speaker"]').value.trim(),
      color: card.querySelector('[data-field="color"]').value,
      style: card.querySelector('[data-field="style"]').value,
      text: card.querySelector('textarea').value.trim(),
    })).filter((entry) => entry.text);
  }

  function commandForLine(data) {
    const target = (targetInput.value || '@a').trim() || '@a';
    const speaker = (data.speaker || speakerInput.value || '').trim();
    const speakerColor = speakerColorInput.value || 'gold';
    if (data.channel === 'tellraw') {
      if (speaker && (prefixInput.value || 'colon') !== 'none') {
        return '/tellraw ' + target + ' ' + JSON.stringify([
          { text: prefixText(speaker, prefixInput.value || 'colon'), color: speakerColor },
          { text: data.text, color: data.color || 'white', ...(data.style === 'italic' ? { italic: true } : {}), ...(data.style === 'bold' ? { bold: true } : {}) },
        ]);
      }
      return '/tellraw ' + target + ' ' + JSON.stringify([
        { text: data.text, color: data.color || 'white', ...(data.style === 'italic' ? { italic: true } : {}), ...(data.style === 'bold' ? { bold: true } : {}) },
      ]);
    }
    const payload = {
      text: (speaker && (prefixInput.value || 'colon') !== 'none' ? prefixText(speaker, prefixInput.value || 'colon') : '') + data.text,
      color: data.color || 'white',
    };
    if (data.style === 'italic') payload.italic = true;
    if (data.style === 'bold') payload.bold = true;
    return '/title ' + target + ' ' + data.channel + ' ' + JSON.stringify(payload);
  }

  function update() {
    const lines = lineData();
    const channelMap = Object.fromEntries(channelOptions);
    const used = [...new Set(lines.map((line) => channelMap[line.channel] || line.channel))];
    if (!lines.length) {
      summary.textContent = copy.noLines[locale] || copy.noLines.en;
    } else {
      summary.textContent = (copy.summaryPattern[locale] || copy.summaryPattern.en)
        .replace('{count}', String(lines.length))
        .replace('{channels}', used.join(', '));
    }
    output.value = lines.map(commandForLine).join('\n');
  }

  function addLine(seed = {}) {
    const card = document.createElement('div');
    card.className = 'dg-line-card';
    card.innerHTML =
      '<div class="dg-line-header"><strong></strong><button type="button" class="tool-button tool-button-secondary dg-remove">' + (copy.remove[locale] || copy.remove.en) + '</button></div>' +
      '<div class="dg-line-grid">' +
      '<label class="tool-field"><span>' + (copy.channel[locale] || copy.channel.en) + '</span><select data-field="channel">' + optionMarkup(channelOptions, seed.channel || 'tellraw') + '</select></label>' +
      '<label class="tool-field"><span>' + (copy.speakerOverride[locale] || copy.speakerOverride.en) + '</span><input type="text" data-field="speaker" value="' + (seed.speaker || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;') + '"></label>' +
      '<label class="tool-field"><span>' + (copy.color[locale] || copy.color.en) + '</span><select data-field="color">' + optionMarkup(colorOptions, seed.color || 'white') + '</select></label>' +
      '<label class="tool-field"><span>' + (copy.style[locale] || copy.style.en) + '</span><select data-field="style">' + optionMarkup(styleOptions, seed.style || 'plain') + '</select></label>' +
      '</div>' +
      '<label class="tool-field"><span>' + (copy.text[locale] || copy.text.en) + '</span><textarea></textarea></label>';
    const area = card.querySelector('textarea');
    area.value = seed.text || '';
    card.querySelectorAll('input, select, textarea').forEach((input) => {
      input.addEventListener('input', update);
      input.addEventListener('change', update);
    });
    card.querySelector('.dg-remove').addEventListener('click', () => {
      card.remove();
      relabel();
      update();
    });
    linesRoot.appendChild(card);
    relabel();
  }

  function setActivePreset(name) {
    document.querySelectorAll('[data-dg-preset]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.dgPreset === name);
    });
  }

  function applyPreset(name) {
    const preset = (presetSets[locale] || presetSets.en)[name];
    if (!preset) return;
    targetInput.value = preset.target || '@a';
    speakerInput.value = preset.defaultSpeaker || '';
    prefixInput.value = preset.prefix || 'colon';
    speakerColorInput.value = preset.speakerColor || 'gold';
    linesRoot.innerHTML = '';
    (preset.lines || []).forEach((line) => addLine(line));
    setActivePreset(name);
    update();
  }

  document.querySelectorAll('[data-dg-preset]').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.dgPreset));
  });
  [targetInput, speakerInput, prefixInput, speakerColorInput].forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });
  addLineButton.addEventListener('click', () => {
    addLine({ channel: 'tellraw', color: 'white', style: 'plain', text: '' });
    update();
  });
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = output.value;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    const original = copyButton.textContent;
    copyButton.textContent = copy.copied[locale] || copy.copied.en;
    setTimeout(() => {
      copyButton.textContent = original;
    }, 1400);
  });

  applyPreset('court');
})();

(() => {
  const locale = (document.documentElement.lang || 'en').slice(0, 2);
  const host = document.querySelector('.tool-primary-column');
  if (!host || document.querySelector('[data-message-designer]')) return;

  const copy = {
    en: {
      title: 'Message designer',
      lead: 'Build one polished chat, title, subtitle, or actionbar message with multiple colored parts.',
      target: 'Target',
      channel: 'Channel',
      fadeIn: 'Fade in',
      stay: 'Stay',
      fadeOut: 'Fade out',
      text: 'Text',
      color: 'Color',
      style: 'Style',
      hover: 'Hover text',
      click: 'Click command',
      optional: 'Optional',
      output: 'Message command',
      copy: 'Copy message',
      copied: 'Copied',
      presets: ['Server warning', 'Quest complete', 'Ritual begins', 'Court verdict'],
      preview: 'Preview'
    },
    ru: {
      title: 'Дизайнер сообщений',
      lead: 'Соберите одно красивое сообщение в чат, title, subtitle или actionbar из нескольких цветных частей.',
      target: 'Цель',
      channel: 'Канал',
      fadeIn: 'Появление',
      stay: 'Держать',
      fadeOut: 'Исчезание',
      text: 'Текст',
      color: 'Цвет',
      style: 'Стиль',
      hover: 'Текст при наведении',
      click: 'Команда по клику',
      optional: 'Необязательно',
      output: 'Команда сообщения',
      copy: 'Скопировать сообщение',
      copied: 'Скопировано',
      presets: ['Предупреждение сервера', 'Квест завершён', 'Ритуал начался', 'Вердикт суда'],
      preview: 'Предпросмотр'
    },
    fr: {
      title: 'Designer de messages',
      lead: 'Créez un message de chat, title, subtitle ou actionbar avec plusieurs parties colorées.',
      target: 'Cible',
      channel: 'Canal',
      fadeIn: 'Apparition',
      stay: 'Durée',
      fadeOut: 'Disparition',
      text: 'Texte',
      color: 'Couleur',
      style: 'Style',
      hover: 'Texte au survol',
      click: 'Commande au clic',
      optional: 'Optionnel',
      output: 'Commande du message',
      copy: 'Copier le message',
      copied: 'Copié',
      presets: ['Alerte serveur', 'Quête terminée', 'Rituel lancé', 'Verdict'],
      preview: 'Aperçu'
    },
    de: {
      title: 'Nachrichten-Designer',
      lead: 'Erstelle eine schöne Chat-, Title-, Subtitle- oder Actionbar-Nachricht aus mehreren farbigen Teilen.',
      target: 'Ziel',
      channel: 'Kanal',
      fadeIn: 'Einblenden',
      stay: 'Dauer',
      fadeOut: 'Ausblenden',
      text: 'Text',
      color: 'Farbe',
      style: 'Stil',
      hover: 'Hover-Text',
      click: 'Klick-Befehl',
      optional: 'Optional',
      output: 'Nachrichtenbefehl',
      copy: 'Nachricht kopieren',
      copied: 'Kopiert',
      presets: ['Serverwarnung', 'Quest abgeschlossen', 'Ritual beginnt', 'Urteil'],
      preview: 'Vorschau'
    }
  }[locale] || {};

  const presets = [
    { channel: 'title', target: '@a', times: [10, 60, 20], hover: '', click: '', parts: [['WARNING', 'red', 'bold'], ['  Gate breach detected', 'gold', 'plain'], ['', 'white', 'plain']] },
    { channel: 'actionbar', target: '@p', times: [5, 40, 10], hover: '', click: '', parts: [['Quest complete: ', 'green', 'bold'], ['The archive key is yours', 'aqua', 'plain'], ['', 'white', 'plain']] },
    { channel: 'title', target: '@a', times: [20, 70, 20], hover: '', click: '', parts: [['The ritual ', 'light_purple', 'italic'], ['begins', 'dark_purple', 'bold'], ['', 'white', 'plain']] },
    { channel: 'tellraw', target: '@a', times: [10, 60, 20], hover: 'Open the evidence chest', click: '/warp court', parts: [['Judge: ', 'gold', 'bold'], ['The verdict is final.', 'white', 'plain'], [' Court is dismissed.', 'gray', 'italic']] }
  ];

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function options(items, selected) {
    return items.map((item) => '<option value="' + item + '"' + (item === selected ? ' selected' : '') + '>' + item + '</option>').join('');
  }

  const panel = document.createElement('div');
  panel.className = 'tool-panel message-designer';
  panel.dataset.messageDesigner = 'true';
  panel.innerHTML = `
    <div class="section-heading"><div><h2>${copy.title}</h2><p class="tool-summary">${copy.lead}</p></div></div>
    <div class="tool-chip-row">${copy.presets.map((label, index) => `<button class="tool-chip-button" type="button" data-md-preset="${index}">${label}</button>`).join('')}</div>
    <div class="tool-form-grid message-designer-grid">
      <label class="tool-field"><span>${copy.target}</span><input id="md-target" type="text" value="@a"></label>
      <label class="tool-field"><span>${copy.channel}</span><select id="md-channel"><option value="tellraw">tellraw chat</option><option value="title">title</option><option value="subtitle">subtitle</option><option value="actionbar">actionbar</option></select></label>
      <label class="tool-field"><span>${copy.fadeIn}</span><input id="md-fade-in" type="number" min="0" value="10"></label>
      <label class="tool-field"><span>${copy.stay}</span><input id="md-stay" type="number" min="1" value="60"></label>
      <label class="tool-field"><span>${copy.fadeOut}</span><input id="md-fade-out" type="number" min="0" value="20"></label>
    </div>
    <div class="message-part-list">
      ${[0, 1, 2].map((index) => `
        <div class="message-part" data-md-part="${index}">
          <label class="tool-field"><span>${copy.text} ${index + 1}</span><input data-md-text type="text"></label>
          <label class="tool-field"><span>${copy.color}</span><select data-md-color>${options(['white','gray','gold','yellow','green','aqua','blue','light_purple','dark_purple','red'], 'white')}</select></label>
          <label class="tool-field"><span>${copy.style}</span><select data-md-style>${options(['plain','bold','italic','underlined'], 'plain')}</select></label>
        </div>
      `).join('')}
    </div>
    <div class="tool-form-grid">
      <label class="tool-field"><span>${copy.hover} <small>${copy.optional}</small></span><input id="md-hover" type="text"></label>
      <label class="tool-field"><span>${copy.click} <small>${copy.optional}</small></span><input id="md-click" type="text" placeholder="/warp spawn"></label>
    </div>
    <div class="message-preview-wrap"><p class="tool-summary">${copy.preview}</p><div id="md-preview" class="message-preview"></div></div>
    <label class="tool-field"><span>${copy.output}</span><textarea id="md-output" class="command-output" readonly></textarea></label>
    <div class="tool-button-row"><button id="md-copy" class="tool-button" type="button">${copy.copy}</button></div>
  `;
  const anchor = host.querySelector('.tool-panel:nth-of-type(3)') || host.firstElementChild;
  host.insertBefore(panel, anchor ? anchor.nextSibling : null);

  const target = panel.querySelector('#md-target');
  const channel = panel.querySelector('#md-channel');
  const fadeIn = panel.querySelector('#md-fade-in');
  const stay = panel.querySelector('#md-stay');
  const fadeOut = panel.querySelector('#md-fade-out');
  const hover = panel.querySelector('#md-hover');
  const click = panel.querySelector('#md-click');
  const preview = panel.querySelector('#md-preview');
  const output = panel.querySelector('#md-output');
  const copyButton = panel.querySelector('#md-copy');

  function componentFromPart(part, firstInteractive) {
    const text = part.querySelector('[data-md-text]').value;
    const color = part.querySelector('[data-md-color]').value;
    const style = part.querySelector('[data-md-style]').value;
    const component = { text, color };
    if (style === 'bold') component.bold = true;
    if (style === 'italic') component.italic = true;
    if (style === 'underlined') component.underlined = true;
    if (firstInteractive && hover.value.trim()) component.hoverEvent = { action: 'show_text', value: hover.value.trim() };
    if (firstInteractive && click.value.trim()) component.clickEvent = { action: 'run_command', value: click.value.trim() };
    return component;
  }

  function components() {
    return Array.from(panel.querySelectorAll('.message-part'))
      .filter((part) => part.querySelector('[data-md-text]').value.trim())
      .map((part, index) => componentFromPart(part, index === 0));
  }

  function timesCommand() {
    return '/title ' + (target.value.trim() || '@a') + ' times ' + Number(fadeIn.value || 0) + ' ' + Number(stay.value || 60) + ' ' + Number(fadeOut.value || 0);
  }

  function messageCommand() {
    const payload = JSON.stringify(components().length ? components() : [{ text: '', color: 'white' }]);
    if (channel.value === 'tellraw') return '/tellraw ' + (target.value.trim() || '@a') + ' ' + payload;
    return timesCommand() + '\n/title ' + (target.value.trim() || '@a') + ' ' + channel.value + ' ' + payload;
  }

  function updatePreview() {
    const parts = components();
    preview.className = 'message-preview is-' + channel.value;
    preview.innerHTML = parts.map((part) => {
      const classes = ['mc-' + part.color];
      if (part.bold) classes.push('is-bold');
      if (part.italic) classes.push('is-italic');
      if (part.underlined) classes.push('is-underlined');
      return '<span class="' + classes.join(' ') + '">' + escapeHtml(part.text) + '</span>';
    }).join('') || '&nbsp;';
    output.value = messageCommand();
  }

  function applyPreset(index) {
    const preset = presets[index] || presets[0];
    target.value = preset.target;
    channel.value = preset.channel;
    fadeIn.value = preset.times[0];
    stay.value = preset.times[1];
    fadeOut.value = preset.times[2];
    hover.value = preset.hover;
    click.value = preset.click;
    panel.querySelectorAll('.message-part').forEach((part, partIndex) => {
      const data = preset.parts[partIndex] || ['', 'white', 'plain'];
      part.querySelector('[data-md-text]').value = data[0];
      part.querySelector('[data-md-color]').value = data[1];
      part.querySelector('[data-md-style]').value = data[2];
    });
    panel.querySelectorAll('[data-md-preset]').forEach((button) => {
      button.classList.toggle('is-active', Number(button.dataset.mdPreset) === index);
    });
    updatePreview();
  }

  panel.addEventListener('input', updatePreview);
  panel.addEventListener('change', updatePreview);
  panel.querySelectorAll('[data-md-preset]').forEach((button) => {
    button.addEventListener('click', () => applyPreset(Number(button.dataset.mdPreset)));
  });
  copyButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.value);
    const original = copyButton.textContent;
    copyButton.textContent = copy.copied;
    setTimeout(() => {
      copyButton.textContent = original;
    }, 1400);
  });
  applyPreset(0);
})();
