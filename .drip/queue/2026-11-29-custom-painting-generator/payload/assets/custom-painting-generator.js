(() => {
  const root = document.querySelector('[data-painting-generator]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const track = (name, params) => { if (window.CubeAnalytics) window.CubeAnalytics.track(name, params); };

  // Data pack (dp) and resource pack (rp) formats, the same tables as the data pack and resource pack generators.
  const VERSIONS = [
    { id: '26.3',    label: '26.3',             dp: 121, rp: 97 },
    { id: '26.2',    label: '26.2',             dp: 107, rp: 88 },
    { id: '26.1',    label: '26.1',             dp: 101, rp: 84 },
    { id: '1.21.11', label: '1.21.11',          dp: 94,  rp: 75 },
    { id: '1.21.9',  label: '1.21.9 - 1.21.10', dp: 88,  rp: 69 },
    { id: '1.21.7',  label: '1.21.7 - 1.21.8',  dp: 81,  rp: 64 },
    { id: '1.21.6',  label: '1.21.6',           dp: 80,  rp: 63 },
    { id: '1.21.5',  label: '1.21.5',           dp: 71,  rp: 55 },
    { id: '1.21.4',  label: '1.21.4',           dp: 61,  rp: 46 },
    { id: '1.21.2',  label: '1.21.2 - 1.21.3',  dp: 57,  rp: 42 },
    { id: '1.21',    label: '1.21 - 1.21.1',    dp: 48,  rp: 34 },
    { id: '1.20.5',  label: '1.20.5 - 1.20.6',  dp: 41,  rp: 32 },
    { id: '1.20.3',  label: '1.20.3 - 1.20.4',  dp: 26,  rp: 22 },
    { id: '1.20.2',  label: '1.20.2',           dp: 18,  rp: 18 },
    { id: '1.20',    label: '1.20 - 1.20.1',    dp: 15,  rp: 15 }
  ];
  // What changed for paintings, checked on vanilla servers (1.20.4 to 26.3) on 2026-11-20:
  const hasCustomPaintings = (v) => v.dp >= 48;  // 1.21: data/<ns>/painting_variant/*.json
  const hasTitleAuthor = (v) => v.dp >= 57;      // 1.21.2: title and author text components
  const hasVariantComponent = (v) => v.dp >= 71; // 1.21.5: painting[painting/variant="ns:id"]
  const hasComponents = (v) => v.dp >= 41;       // 1.20.5: painting[entity_data={...}]; older: painting{EntityTag:{...}}

  // Vanilla paintings: [width, height, first data pack format]. Read from the server jars of each version.
  const VANILLA = {
    kebab: [1, 1, 15], aztec: [1, 1, 15], alban: [1, 1, 15], aztec2: [1, 1, 15], bomb: [1, 1, 15], plant: [1, 1, 15],
    wasteland: [1, 1, 15], pool: [2, 1, 15], courbet: [2, 1, 15], sea: [2, 1, 15], sunset: [2, 1, 15], creebet: [2, 1, 15],
    wanderer: [1, 2, 15], graham: [1, 2, 15], match: [2, 2, 15], bust: [2, 2, 15], stage: [2, 2, 15], void: [2, 2, 15],
    skull_and_roses: [2, 2, 15], wither: [2, 2, 15], fighters: [4, 2, 15], pointer: [4, 4, 15], pigscene: [4, 4, 15],
    burning_skull: [4, 4, 15], skeleton: [4, 3, 15], donkey_kong: [4, 3, 15], earth: [2, 2, 15], wind: [2, 2, 15],
    water: [2, 2, 15], fire: [2, 2, 15], meditative: [1, 1, 48], prairie_ride: [1, 2, 48], baroque: [2, 2, 48],
    humble: [2, 2, 48], changing: [4, 2, 48], finding: [4, 2, 48], lowmist: [4, 2, 48], passage: [4, 2, 48],
    bouquet: [3, 3, 48], cavebird: [3, 3, 48], cotan: [3, 3, 48], endboss: [3, 3, 48], fern: [3, 3, 48],
    owlemons: [3, 3, 48], sunflowers: [3, 3, 48], tides: [3, 3, 48], backyard: [3, 4, 48], pond: [3, 4, 48],
    orb: [4, 4, 48], unpacked: [4, 4, 48], dennis: [3, 3, 94]
  };
  // A painting_variant wider or taller than 16 blocks is a registry error: the world does not load at all.
  const MAX_BLOCKS = 16;
  const PIXELS_PER_BLOCK = [16, 32, 64, 128];
  const PALETTES = ['full', '32', '16', '8'];

  // Load. Measured on a vanilla 26.3 server on 2026-11-20: 512 paintings of 16 x 16 blocks cost 0.15 ms per tick
  // (512 of 1 x 1: 0.03 ms), so the server is not what limits size. What grows is on the player's side: every
  // painting texture goes into one atlas image in video memory (4 bytes per pixel), and if that atlas does not fit
  // the graphics card's largest texture, the client crashes while loading the pack (SpriteLoader: "Stitching").
  const HEAVY_TEXTURE_PX = 1024 * 1024;
  const HEAVY_TOTAL_BYTES = 64 * 1024 * 1024;
  const OLD_GPU_TEXTURE = 8192;
  const MOST_GPU_TEXTURE = 16384;
  const BIG_DOWNLOAD_BYTES = 20 * 1024 * 1024;
  const VANILLA_MAX_SIDE = 4;
  const VANILLA_MAX_AREA = 16;

  const ruPlural = (n, one, few, many) => {
    const a = n % 10;
    const b = n % 100;
    if (a === 1 && b !== 11) return one;
    return a >= 2 && a <= 4 && (b < 12 || b > 14) ? few : many;
  };

  const LOCALE = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: {
      painting: 'Painting', remove: 'Remove', choose: 'Choose image', replaceImage: 'Other image',
      drop: 'or drop an image here', noImage: 'No image yet. Until you add one, this painting is left out of the packs.',
      id: 'ID (file name)', width: 'Width, blocks', height: 'Height, blocks', match: 'Match the image shape',
      title: 'Title (optional)', author: 'Author (optional)', placeable: 'Can appear when a plain painting is hung',
      replaces: 'Replaces', imageHead: 'Image', fit: 'Fit', fitCover: 'Crop to fill', fitContain: 'Whole image with a border',
      fitStretch: 'Stretch', focusX: 'Crop position, left to right', focusY: 'Crop position, top to bottom',
      background: 'Border color', ppb: 'Pixels per block', ppbVanilla: ' (vanilla)', colors: 'Colors',
      colorsAll: 'All colors', colorsN: (n) => `${n} colors`, dither: 'Dithering (smoother gradients with few colors)',
      contrast: 'Contrast', saturation: 'Saturation',
      texture: (w, h, mem) => `Texture ${w} × ${h} px, about ${mem} of video memory`,
      heavyTexture: 'A heavy texture for one painting. 16 or 32 pixels per block is enough for most walls; 64 if there is text or a face to read.',
      bigWall: (w, h) => `Bigger than any vanilla painting (they stop at 4 × 4). It needs a flat wall of ${w} × ${h} = ${w * h} solid blocks with nothing else hanging on it, and it drops within 5 seconds if a block behind it is broken.`,
      bigPlaceable: 'A plain painting hung on a wall where this one fits will never come out as a vanilla painting: the game picks among the largest paintings that fit, and this one is bigger than all of them.',
      loadHead: 'Load:',
      load: (n, blocks, mem, dl) => `${n} painting${n === 1 ? '' : 's'} on ${blocks.toLocaleString('en')} block${blocks === 1 ? '' : 's'} of wall. Textures: about ${mem} of video memory. Resource pack: ${dl || 'counting…'}.`,
      heavyTotal: (mem) => `All textures together take about ${mem} of video memory on every player's computer, and the pack loads slower. Lower the pixels per block on the biggest paintings.`,
      atlasOld: (side) => `The game puts the textures of all paintings into one image, here about ${side} × ${side} px. Older graphics cards stop at 8192 px; on them the game crashes with a "Stitching" error while loading the pack.`,
      atlasMost: (side) => `The game puts the textures of all paintings into one image, here about ${side} × ${side} px. Most graphics cards stop at 16384 px, so the game will very likely crash with a "Stitching" error while loading the pack. Lower the pixels per block.`,
      bigDownload: (size) => `The resource pack is ${size}. Players on a server download it when they join, which takes a while on a slow connection.`,
      units: ['KB', 'MB'],
      helpLabel: (label) => `Help: ${label}`,
      titleOld: 'Title and author are shown from 1.21.2; for this version the pack leaves them out.',
      oldVersion: 'New paintings need 1.21 or newer. On this version you can only replace vanilla paintings.',
      dupId: (id) => `Another painting already uses this ID, so this one is saved as ${id}.`,
      dupVanilla: 'Another card replaces the same painting; the last one wins.',
      none: 'Add an image to at least one painting to build the packs.',
      rp: 'Resource pack', dp: 'Data pack', png: (w, h) => `PNG image, ${w} × ${h} px`,
      summaryNew: (n) => `${n} new painting(s): the resource pack holds the pictures, the data pack registers them. Install both.`,
      summaryReplace: (n) => `${n} vanilla painting(s) replaced. Only the resource pack is needed.`,
      onlyMineNone: 'No painting is marked to appear when hung, so the placeable list is left as it is.',
      commandsNote: '# Server console: as written. Chat or a command block: put a slash in front.',
      copied: 'Copied', sampleName: 'sample landscape', sampleTitle: 'Sunset lake', packDesc: 'Paintings made with cubeinsquare.com',
      pickVanilla: (name, w, h) => `${name} (${w} × ${h})`,
      help: {
        name: 'Shown in the pack list in the game and used for the ZIP file names. Any text works.',
        namespace: 'The first half of every painting ID, as in paintings:sunset_lake. Lowercase letters, digits, _ - and . only. A word of your own keeps your paintings apart from other packs; minecraft is not allowed.',
        version: 'The Minecraft version you play. It sets the pack format numbers and the give command, which changed in 1.20.5 and 1.21.5. A pack made for another version may show as incompatible.',
        mode: 'New paintings are added next to the vanilla ones and need both packs (1.21+). Replacing swaps the picture of a vanilla painting, keeps its size and needs only the resource pack, so it also works on 1.20.',
        onlyMine: 'Off: your paintings join the vanilla ones when a plain painting is hung. On: only yours are candidates, so on a wall where none of them fits, a plain painting cannot be hung at all.',
        grid: 'Draws a line between blocks on the previews, so you can see where the picture is split. It does not change the texture.',
        id: 'The second half of the ID and the name of the PNG and JSON files. Lowercase Latin letters, digits and _ only; it is filled in from the image file name.',
        size: 'How many blocks the painting covers on the wall, 1 to 16 each way. The server hardly notices the size: a painting is one entity whatever its size. What grows is the wall it needs and the texture.',
        title: 'Shown in yellow in the tooltip of the painting item, for example in the creative inventory. Works from 1.21.2.',
        author: 'Shown in gray under the title in the tooltip of the painting item. Works from 1.21.2.',
        placeable: 'Adds the painting to the list a plain painting picks from when it is hung. The game keeps the largest paintings that fit the free wall and picks one of them at random, so a big painting wins on every wall where it fits.',
        replaces: 'The vanilla painting that gets your picture. Its size cannot change, so pick one with a similar shape; the size in blocks is in brackets.',
        fit: 'Crop to fill: the picture fills the frame and what does not fit is cut off. Whole image: everything stays and the gaps get the border color. Stretch: fills the frame and squashes the picture.',
        focusX: 'Moves the crop sideways: to the left keeps the left part of the picture, to the right keeps the right part.',
        focusY: 'Moves the crop up and down: to the left keeps the top of the picture, to the right keeps the bottom.',
        background: 'Fills the edges in whole image mode and any transparent pixels: paintings in the game are always opaque.',
        ppb: 'How many pixels make one block. Vanilla paintings use 16. More pixels give more detail, but the texture grows with the square: 16 × 16 blocks at 128 pixels is a 2048 × 2048 picture, about 16 MB of video memory for every player.',
        colors: 'Reduces the picture to a few colors taken from the image itself, for a flat, painted look that matches the pixel art of the game. It also makes the PNG smaller.',
        dither: 'Mixes dots of the available colors so smooth gradients, like a sky, do not break into stripes. Off gives clean flat areas, like a poster.',
        contrast: 'More contrast moves light and dark further apart. Paintings often hang in dim rooms, where +10 to +20 helps.',
        saturation: 'Makes the colors stronger or paler. All the way to the left gives a black and white picture.',
        load: 'Video memory is what all the textures take on the computer of every player who uses the pack; the game puts them into one shared image. The resource pack is the ZIP that players on a server download when they join. The server barely notices paintings: in our test 512 paintings of 16 × 16 blocks took 0.15 ms of the 50 ms each tick has, and 512 paintings take less than 80 KB of the world save.'
      }
    },
    ru: {
      painting: 'Картина', remove: 'Убрать', choose: 'Выбрать картинку', replaceImage: 'Другая картинка',
      drop: 'или перетащите её сюда', noImage: 'Картинки пока нет. Пока её нет, эта картина в паки не попадает.',
      id: 'ID (имя файла)', width: 'Ширина, блоков', height: 'Высота, блоков', match: 'Подогнать под форму картинки',
      title: 'Название (необязательно)', author: 'Автор (необязательно)', placeable: 'Может выпасть, когда вешают обычную картину',
      replaces: 'Заменяет', imageHead: 'Картинка', fit: 'Вписать', fitCover: 'Обрезать по размеру', fitContain: 'Целиком, с рамкой',
      fitStretch: 'Растянуть', focusX: 'Обрезка: слева направо', focusY: 'Обрезка: сверху вниз',
      background: 'Цвет рамки', ppb: 'Пикселей на блок', ppbVanilla: ' (как в игре)', colors: 'Цвета',
      colorsAll: 'Все цвета', colorsN: (n) => `${n} цветов`, dither: 'Дизеринг (плавнее переходы при малом числе цветов)',
      contrast: 'Контраст', saturation: 'Насыщенность',
      texture: (w, h, mem) => `Текстура ${w} × ${h} px, около ${mem} видеопамяти`,
      heavyTexture: 'Тяжёлая текстура для одной картины. Для большинства стен хватает 16 или 32 пикселей на блок; 64, если на картинке текст или лицо.',
      bigWall: (w, h) => `Больше любой ванильной картины (самые большие 4 × 4). Нужна ровная стена из твёрдых блоков, ${w} × ${h} = ${w * h}, на которой больше ничего не висит. Если сломать блок за картиной, она упадёт в течение 5 секунд.`,
      bigPlaceable: 'Обычная картина, повешенная на стену, куда помещается эта, никогда не окажется ванильной: игра выбирает среди самых больших подходящих картин, а эта больше любой ванильной.',
      loadHead: 'Нагрузка:',
      load: (n, blocks, mem, dl) => `${n} ${ruPlural(n, 'картина', 'картины', 'картин')} на ${blocks.toLocaleString('ru')} ${ruPlural(blocks, 'блоке', 'блоках', 'блоках')} стены. Текстуры: около ${mem} видеопамяти. Ресурс-пак: ${dl || 'считаем…'}.`,
      heavyTotal: (mem) => `Все текстуры вместе занимают около ${mem} видеопамяти у каждого игрока, и пак дольше загружается. Уменьшите число пикселей на блок у самых больших картин.`,
      atlasOld: (side) => `Игра складывает текстуры всех картин в одно изображение, здесь примерно ${side} × ${side} px. Старые видеокарты не держат больше 8192 px, и на них игра вылетит с ошибкой «Stitching» при загрузке пака.`,
      atlasMost: (side) => `Игра складывает текстуры всех картин в одно изображение, здесь примерно ${side} × ${side} px. Большинство видеокарт не держат больше 16384 px, так что игра почти наверняка вылетит с ошибкой «Stitching» при загрузке пака. Уменьшите число пикселей на блок.`,
      bigDownload: (size) => `Ресурс-пак весит ${size}. На сервере его скачивает каждый игрок при входе, и при медленном интернете это долго.`,
      units: ['КБ', 'МБ'],
      helpLabel: (label) => `Подсказка: ${label}`,
      titleOld: 'Название и автор показываются с 1.21.2; для этой версии пак их не записывает.',
      oldVersion: 'Новые картины работают с 1.21. На этой версии можно только заменить ванильные.',
      dupId: (id) => `Этот ID уже занят другой картиной, поэтому эта сохранится как ${id}.`,
      dupVanilla: 'Ту же картину заменяет другая карточка; останется последняя.',
      none: 'Добавьте картинку хотя бы в одну картину, чтобы собрать паки.',
      rp: 'Ресурс-пак', dp: 'Датапак', png: (w, h) => `PNG, ${w} × ${h} px`,
      summaryNew: (n) => `Новых картин: ${n}. В ресурс-паке сами изображения, датапак их регистрирует. Нужны оба.`,
      summaryReplace: (n) => `Заменено ванильных картин: ${n}. Нужен только ресурс-пак.`,
      onlyMineNone: 'Ни одна картина не отмечена как выпадающая, поэтому список placeable не меняется.',
      commandsNote: '# Консоль сервера: как есть. Чат или командный блок: добавьте слэш в начало.',
      copied: 'Скопировано', sampleName: 'пример пейзажа', sampleTitle: 'Закат над озером', packDesc: 'Картины, сделанные на cubeinsquare.com',
      pickVanilla: (name, w, h) => `${name} (${w} × ${h})`,
      help: {
        name: 'Показывается в списке паков в игре и в именах ZIP-файлов. Можно написать что угодно.',
        namespace: 'Первая половина ID каждой картины, как в paintings:sunset_lake. Только строчные латинские буквы, цифры, _ - и точка. Своё слово не даст вашим картинам пересечься с чужими паками; minecraft использовать нельзя.',
        version: 'Версия Minecraft, на которой вы играете. От неё зависят номера формата паков и команда give: она менялась в 1.20.5 и 1.21.5. Пак для другой версии игра может пометить как несовместимый.',
        mode: 'Новые картины добавляются к ванильным, и нужны оба пака (1.21+). Замена меняет рисунок ванильной картины и оставляет её размер; нужен только ресурс-пак, поэтому это работает и на 1.20.',
        onlyMine: 'Выключено: когда вешают обычную картину, ваши выпадают наравне с ванильными. Включено: выпадают только ваши, и на стену, куда не помещается ни одна из них, обычную картину повесить вообще не получится.',
        grid: 'Рисует на превью линии между блоками, чтобы было видно, где картинка разрежется. На саму текстуру не влияет.',
        id: 'Вторая половина ID и имя PNG- и JSON-файлов. Только строчные латинские буквы, цифры и _; подставляется из имени файла картинки.',
        size: 'Сколько блоков картина занимает на стене, от 1 до 16 в каждую сторону. Сервер размер почти не замечает: картина любого размера — это одна сущность. С размером растут стена, которая ей нужна, и текстура.',
        title: 'Показывается жёлтым в подсказке предмета-картины, например в творческом инвентаре. Работает с 1.21.2.',
        author: 'Показывается серым под названием в подсказке предмета-картины. Работает с 1.21.2.',
        placeable: 'Добавляет картину в список, из которого выбирается обычная картина, когда её вешают. Игра оставляет самые большие из картин, что помещаются на свободную стену, и берёт одну из них наугад. Поэтому большая картина выпадает на любой стене, куда помещается.',
        replaces: 'Ванильная картина, которая получит ваш рисунок. Её размер не меняется, поэтому выбирайте похожую по форме; размер в блоках указан в скобках.',
        fit: 'Обрезать по размеру: картинка заполняет рамку, лишнее срезается. Целиком: видно всё, пустые края заливаются цветом рамки. Растянуть: заполняет рамку, но искажает пропорции.',
        focusX: 'Сдвигает обрезку вбок: влево — остаётся левая часть картинки, вправо — правая.',
        focusY: 'Сдвигает обрезку вверх и вниз: влево — остаётся верх картинки, вправо — низ.',
        background: 'Заливает края в режиме «Целиком» и прозрачные пиксели: картины в игре всегда непрозрачные.',
        ppb: 'Сколько пикселей приходится на один блок. У ванильных картин 16. Больше пикселей — больше деталей, но текстура растёт в квадрате: 16 × 16 блоков по 128 пикселей — это картинка 2048 × 2048, около 16 МБ видеопамяти у каждого игрока.',
        colors: 'Сводит картинку к нескольким цветам из неё самой: получается плоский, «нарисованный» вид в духе пиксель-арта игры. Заодно PNG становится легче.',
        dither: 'Смешивает точки доступных цветов, чтобы плавные переходы вроде неба не распадались на полосы. Без него получаются чистые плоские заливки, как на плакате.',
        contrast: 'Больше контраста — сильнее разница между светлым и тёмным. Картины часто висят в полутёмных комнатах, там помогает +10…+20.',
        saturation: 'Делает цвета ярче или бледнее. До упора влево — чёрно-белая картинка.',
        load: 'Видеопамять — столько занимают все текстуры на компьютере каждого игрока с паком; игра складывает их в одно общее изображение. Ресурс-пак — ZIP, который игроки на сервере скачивают при входе. Сервер картины почти не замечает: в нашем тесте 512 картин 16 × 16 блоков заняли 0,15 мс из 50 мс, отведённых на такт, а в сохранении мира 512 картин занимают меньше 80 КБ.'
      }
    },
    fr: {
      painting: 'Tableau', remove: 'Retirer', choose: 'Choisir une image', replaceImage: 'Autre image',
      drop: 'ou déposez-la ici', noImage: 'Pas encore d’image. Sans image, ce tableau n’entre pas dans les packs.',
      id: 'ID (nom du fichier)', width: 'Largeur, en blocs', height: 'Hauteur, en blocs', match: 'Suivre la forme de l’image',
      title: 'Titre (optionnel)', author: 'Auteur (optionnel)', placeable: 'Peut sortir quand on accroche un tableau ordinaire',
      replaces: 'Remplace', imageHead: 'Image', fit: 'Cadrage', fitCover: 'Rogner pour remplir', fitContain: 'Image entière avec bordure',
      fitStretch: 'Étirer', focusX: 'Rognage, de gauche à droite', focusY: 'Rognage, de haut en bas',
      background: 'Couleur de la bordure', ppb: 'Pixels par bloc', ppbVanilla: ' (comme le jeu)', colors: 'Couleurs',
      colorsAll: 'Toutes les couleurs', colorsN: (n) => `${n} couleurs`, dither: 'Tramage (dégradés plus doux avec peu de couleurs)',
      contrast: 'Contraste', saturation: 'Saturation',
      texture: (w, h, mem) => `Texture ${w} × ${h} px, environ ${mem} de mémoire vidéo`,
      heavyTexture: 'Texture lourde pour un seul tableau. 16 ou 32 pixels par bloc suffisent pour la plupart des murs ; 64 s’il y a un texte ou un visage à lire.',
      bigWall: (w, h) => `Plus grand que tous les tableaux du jeu (ils s’arrêtent à 4 × 4). Il lui faut un mur plat de blocs pleins, ${w} × ${h} = ${w * h}, où rien d’autre n’est accroché, et il tombe dans les 5 secondes si un bloc derrière lui est cassé.`,
      bigPlaceable: 'Un tableau ordinaire accroché sur un mur où celui-ci tient ne sera jamais un tableau du jeu : le jeu choisit parmi les plus grands tableaux qui tiennent, et celui-ci les dépasse tous.',
      loadHead: 'Charge :',
      load: (n, blocks, mem, dl) => `${n} ${n < 2 ? 'tableau' : 'tableaux'} sur ${blocks.toLocaleString('fr')} ${blocks < 2 ? 'bloc' : 'blocs'} de mur. Textures : environ ${mem} de mémoire vidéo. Pack de ressources : ${dl || 'calcul…'}.`,
      heavyTotal: (mem) => `Toutes les textures réunies prennent environ ${mem} de mémoire vidéo chez chaque joueur, et le pack charge plus lentement. Baissez les pixels par bloc des plus grands tableaux.`,
      atlasOld: (side) => `Le jeu range les textures de tous les tableaux dans une seule image, ici environ ${side} × ${side} px. Les cartes graphiques anciennes s’arrêtent à 8192 px : sur elles, le jeu plante avec une erreur « Stitching » en chargeant le pack.`,
      atlasMost: (side) => `Le jeu range les textures de tous les tableaux dans une seule image, ici environ ${side} × ${side} px. La plupart des cartes graphiques s’arrêtent à 16384 px, le jeu plantera donc très probablement avec une erreur « Stitching » en chargeant le pack. Baissez les pixels par bloc.`,
      bigDownload: (size) => `Le pack de ressources pèse ${size}. Sur un serveur, chaque joueur le télécharge en se connectant, ce qui prend du temps avec une connexion lente.`,
      units: ['Ko', 'Mo'],
      helpLabel: (label) => `Aide : ${label}`,
      titleOld: 'Le titre et l’auteur s’affichent à partir de la 1.21.2 ; pour cette version, le pack les omet.',
      oldVersion: 'Les nouveaux tableaux demandent la 1.21 ou plus. Sur cette version, on peut seulement remplacer ceux du jeu.',
      dupId: (id) => `Un autre tableau utilise déjà cet ID, celui-ci est donc enregistré sous ${id}.`,
      dupVanilla: 'Une autre carte remplace le même tableau ; la dernière l’emporte.',
      none: 'Ajoutez une image à au moins un tableau pour construire les packs.',
      rp: 'Pack de ressources', dp: 'Data pack', png: (w, h) => `Image PNG, ${w} × ${h} px`,
      summaryNew: (n) => `${n} nouveau(x) tableau(x) : le pack de ressources contient les images, le data pack les enregistre. Installez les deux.`,
      summaryReplace: (n) => `${n} tableau(x) du jeu remplacé(s). Seul le pack de ressources est nécessaire.`,
      onlyMineNone: 'Aucun tableau n’est marqué pour sortir à l’accrochage, la liste placeable reste donc telle quelle.',
      commandsNote: '# Console du serveur : tel quel. Chat ou bloc de commande : ajoutez une barre oblique devant.',
      copied: 'Copié', sampleName: 'paysage d’exemple', sampleTitle: 'Lac au couchant', packDesc: 'Tableaux créés sur cubeinsquare.com',
      pickVanilla: (name, w, h) => `${name} (${w} × ${h})`,
      help: {
        name: 'Affiché dans la liste des packs du jeu et repris dans le nom des fichiers ZIP. N’importe quel texte convient.',
        namespace: 'La première moitié de l’ID de chaque tableau, comme dans paintings:sunset_lake. Lettres minuscules, chiffres, _ - et point uniquement. Un mot à vous évite que vos tableaux se mélangent à ceux d’autres packs ; minecraft est interdit.',
        version: 'La version de Minecraft sur laquelle vous jouez. Elle fixe les numéros de format des packs et la commande give, qui a changé en 1.20.5 et en 1.21.5. Un pack prévu pour une autre version peut être signalé comme incompatible.',
        mode: 'Les nouveaux tableaux s’ajoutent à ceux du jeu et demandent les deux packs (1.21 ou plus). Le remplacement change l’image d’un tableau du jeu, garde sa taille et ne demande que le pack de ressources : il marche donc aussi en 1.20.',
        onlyMine: 'Désactivé : vos tableaux sortent au même titre que ceux du jeu quand on accroche un tableau ordinaire. Activé : seuls les vôtres sortent, et sur un mur où aucun ne tient, on ne peut plus accrocher de tableau ordinaire du tout.',
        grid: 'Trace les limites des blocs sur les aperçus, pour voir où l’image sera découpée. La texture n’est pas modifiée.',
        id: 'La seconde moitié de l’ID et le nom des fichiers PNG et JSON. Lettres latines minuscules, chiffres et _ uniquement ; il est repris du nom du fichier image.',
        size: 'Le nombre de blocs que le tableau couvre sur le mur, de 1 à 16 dans chaque sens. Le serveur remarque à peine la taille : un tableau est une seule entité, quelle que soit sa taille. Ce qui grandit, c’est le mur nécessaire et la texture.',
        title: 'Affiché en jaune dans l’infobulle de l’objet tableau, par exemple dans l’inventaire créatif. Fonctionne à partir de la 1.21.2.',
        author: 'Affiché en gris sous le titre dans l’infobulle de l’objet tableau. Fonctionne à partir de la 1.21.2.',
        placeable: 'Ajoute le tableau à la liste dans laquelle pioche un tableau ordinaire qu’on accroche. Le jeu garde les plus grands tableaux qui tiennent sur le mur libre et en tire un au hasard : un grand tableau sort donc sur chaque mur où il tient.',
        replaces: 'Le tableau du jeu qui reçoit votre image. Sa taille ne change pas : choisissez-en un de forme proche ; la taille en blocs est entre parenthèses.',
        fit: 'Rogner pour remplir : l’image remplit le cadre, le surplus est coupé. Image entière : tout reste visible, les bords vides prennent la couleur de la bordure. Étirer : remplit le cadre en déformant l’image.',
        focusX: 'Déplace le rognage sur les côtés : vers la gauche, on garde la partie gauche de l’image ; vers la droite, la partie droite.',
        focusY: 'Déplace le rognage vers le haut ou le bas : vers la gauche, on garde le haut de l’image ; vers la droite, le bas.',
        background: 'Remplit les bords en mode image entière ainsi que les pixels transparents : dans le jeu, les tableaux sont toujours opaques.',
        ppb: 'Le nombre de pixels pour un bloc. Les tableaux du jeu en ont 16. Plus de pixels donnent plus de détails, mais la texture grossit au carré : 16 × 16 blocs à 128 pixels font une image de 2048 × 2048, environ 16 Mo de mémoire vidéo chez chaque joueur.',
        colors: 'Réduit l’image à quelques couleurs tirées d’elle-même, pour un rendu plat et peint dans l’esprit du pixel art du jeu. Le PNG devient aussi plus léger.',
        dither: 'Mélange des points des couleurs disponibles pour que les dégradés, comme un ciel, ne se cassent pas en bandes. Sans tramage, on obtient des aplats nets, façon affiche.',
        contrast: 'Plus de contraste écarte les clairs et les sombres. Les tableaux pendent souvent dans des pièces sombres, où +10 à +20 aide.',
        saturation: 'Rend les couleurs plus vives ou plus pâles. Tout à gauche, l’image passe en noir et blanc.',
        load: 'La mémoire vidéo, c’est ce que prennent toutes les textures chez chaque joueur qui utilise le pack ; le jeu les range dans une seule image commune. Le pack de ressources est le ZIP que les joueurs d’un serveur téléchargent en se connectant. Le serveur remarque à peine les tableaux : dans notre test, 512 tableaux de 16 × 16 blocs ont pris 0,15 ms sur les 50 ms d’un tick, et 512 tableaux occupent moins de 80 Ko dans la sauvegarde du monde.'
      }
    },
    de: {
      painting: 'Gemälde', remove: 'Entfernen', choose: 'Bild wählen', replaceImage: 'Anderes Bild',
      drop: 'oder hierher ziehen', noImage: 'Noch kein Bild. Ohne Bild kommt dieses Gemälde nicht in die Pakete.',
      id: 'ID (Dateiname)', width: 'Breite in Blöcken', height: 'Höhe in Blöcken', match: 'An die Bildform anpassen',
      title: 'Titel (optional)', author: 'Künstler (optional)', placeable: 'Kann erscheinen, wenn ein normales Gemälde aufgehängt wird',
      replaces: 'Ersetzt', imageHead: 'Bild', fit: 'Einpassen', fitCover: 'Zuschneiden und füllen', fitContain: 'Ganzes Bild mit Rand',
      fitStretch: 'Strecken', focusX: 'Ausschnitt von links nach rechts', focusY: 'Ausschnitt von oben nach unten',
      background: 'Randfarbe', ppb: 'Pixel pro Block', ppbVanilla: ' (wie im Spiel)', colors: 'Farben',
      colorsAll: 'Alle Farben', colorsN: (n) => `${n} Farben`, dither: 'Dithering (weichere Verläufe bei wenigen Farben)',
      contrast: 'Kontrast', saturation: 'Sättigung',
      texture: (w, h, mem) => `Textur ${w} × ${h} px, etwa ${mem} Grafikspeicher`,
      heavyTexture: 'Eine schwere Textur für ein einzelnes Gemälde. 16 oder 32 Pixel pro Block reichen für die meisten Wände; 64, wenn Text oder ein Gesicht erkennbar sein soll.',
      bigWall: (w, h) => `Größer als jedes Gemälde aus dem Spiel (die enden bei 4 × 4). Es braucht eine glatte Wand aus festen Blöcken, ${w} × ${h} = ${w * h}, an der sonst nichts hängt, und fällt innerhalb von 5 Sekunden herunter, wenn ein Block dahinter abgebaut wird.`,
      bigPlaceable: 'Ein normales Gemälde, das an eine Wand gehängt wird, auf die dieses passt, wird nie eines aus dem Spiel: Das Spiel wählt unter den größten passenden Gemälden, und dieses ist größer als alle aus dem Spiel.',
      loadHead: 'Last:',
      load: (n, blocks, mem, dl) => `${n} Gemälde auf ${blocks.toLocaleString('de')} ${blocks === 1 ? 'Block' : 'Blöcken'} Wand. Texturen: etwa ${mem} Grafikspeicher. Ressourcenpaket: ${dl || 'wird berechnet …'}.`,
      heavyTotal: (mem) => `Alle Texturen zusammen belegen bei jedem Spieler etwa ${mem} Grafikspeicher, und das Paket lädt langsamer. Senke die Pixel pro Block bei den größten Gemälden.`,
      atlasOld: (side) => `Das Spiel legt die Texturen aller Gemälde in ein einziges Bild, hier etwa ${side} × ${side} px. Ältere Grafikkarten schaffen höchstens 8192 px; auf ihnen stürzt das Spiel beim Laden des Pakets mit einem „Stitching“-Fehler ab.`,
      atlasMost: (side) => `Das Spiel legt die Texturen aller Gemälde in ein einziges Bild, hier etwa ${side} × ${side} px. Die meisten Grafikkarten schaffen höchstens 16384 px, das Spiel stürzt also sehr wahrscheinlich beim Laden des Pakets mit einem „Stitching“-Fehler ab. Senke die Pixel pro Block.`,
      bigDownload: (size) => `Das Ressourcenpaket ist ${size} groß. Auf einem Server lädt jeder Spieler es beim Betreten herunter, was bei langsamer Verbindung dauert.`,
      units: ['KB', 'MB'],
      helpLabel: (label) => `Hilfe: ${label}`,
      titleOld: 'Titel und Künstler werden ab 1.21.2 angezeigt; für diese Version lässt das Paket sie weg.',
      oldVersion: 'Neue Gemälde brauchen 1.21 oder neuer. In dieser Version kannst du nur die Gemälde aus dem Spiel ersetzen.',
      dupId: (id) => `Diese ID nutzt schon ein anderes Gemälde, deshalb wird dieses als ${id} gespeichert.`,
      dupVanilla: 'Eine andere Karte ersetzt dasselbe Gemälde; die letzte gewinnt.',
      none: 'Gib mindestens einem Gemälde ein Bild, um die Pakete zu bauen.',
      rp: 'Ressourcenpaket', dp: 'Datenpaket', png: (w, h) => `PNG-Bild, ${w} × ${h} px`,
      summaryNew: (n) => `${n} neue(s) Gemälde: Das Ressourcenpaket enthält die Bilder, das Datenpaket meldet sie an. Installiere beide.`,
      summaryReplace: (n) => `${n} Gemälde aus dem Spiel ersetzt. Nur das Ressourcenpaket ist nötig.`,
      onlyMineNone: 'Kein Gemälde ist zum Erscheinen beim Aufhängen markiert, die Liste placeable bleibt also, wie sie ist.',
      commandsNote: '# Serverkonsole: so wie es steht. Chat oder Befehlsblock: einen Schrägstrich davorsetzen.',
      copied: 'Kopiert', sampleName: 'Beispiellandschaft', sampleTitle: 'Abendsee', packDesc: 'Gemälde, erstellt auf cubeinsquare.com',
      pickVanilla: (name, w, h) => `${name} (${w} × ${h})`,
      help: {
        name: 'Erscheint in der Paketliste im Spiel und im Namen der ZIP-Dateien. Jeder Text geht.',
        namespace: 'Die erste Hälfte jeder Gemälde-ID, wie in paintings:sunset_lake. Nur Kleinbuchstaben, Ziffern, _ - und Punkt. Ein eigenes Wort hält deine Gemälde von anderen Paketen getrennt; minecraft ist nicht erlaubt.',
        version: 'Die Minecraft-Version, auf der du spielst. Sie bestimmt die Formatnummern der Pakete und den give-Befehl, der sich mit 1.20.5 und 1.21.5 geändert hat. Ein Paket für eine andere Version kann als inkompatibel angezeigt werden.',
        mode: 'Neue Gemälde kommen zu denen aus dem Spiel hinzu und brauchen beide Pakete (ab 1.21). Ersetzen tauscht das Bild eines Gemäldes aus dem Spiel, behält seine Größe und braucht nur das Ressourcenpaket, darum geht es auch auf 1.20.',
        onlyMine: 'Aus: Beim Aufhängen eines normalen Gemäldes kommen deine neben denen aus dem Spiel in Frage. An: Nur deine kommen in Frage, und an einer Wand, auf die keines davon passt, lässt sich gar kein normales Gemälde mehr aufhängen.',
        grid: 'Zeichnet in den Vorschauen Linien zwischen den Blöcken, damit du siehst, wo das Bild geteilt wird. Die Textur bleibt unverändert.',
        id: 'Die zweite Hälfte der ID und der Name der PNG- und JSON-Datei. Nur kleine lateinische Buchstaben, Ziffern und _; sie wird aus dem Dateinamen des Bildes übernommen.',
        size: 'Wie viele Blöcke das Gemälde an der Wand bedeckt, 1 bis 16 in jede Richtung. Der Server merkt die Größe kaum: Ein Gemälde ist ein einziges Objekt, egal wie groß. Mit der Größe wachsen die nötige Wand und die Textur.',
        title: 'Erscheint gelb im Tooltip des Gemälde-Items, zum Beispiel im Kreativinventar. Ab 1.21.2.',
        author: 'Erscheint grau unter dem Titel im Tooltip des Gemälde-Items. Ab 1.21.2.',
        placeable: 'Nimmt das Gemälde in die Liste auf, aus der ein normales Gemälde beim Aufhängen gewählt wird. Das Spiel behält die größten Gemälde, die auf die freie Wand passen, und lost eines davon aus. Ein großes Gemälde gewinnt also an jeder Wand, auf die es passt.',
        replaces: 'Das Gemälde aus dem Spiel, das dein Bild bekommt. Seine Größe ändert sich nicht, also wähle eines mit ähnlicher Form; die Größe in Blöcken steht in Klammern.',
        fit: 'Zuschneiden und füllen: Das Bild füllt den Rahmen, was übersteht, wird abgeschnitten. Ganzes Bild: Alles bleibt sichtbar, leere Ränder bekommen die Randfarbe. Strecken: füllt den Rahmen und verzerrt das Bild.',
        focusX: 'Verschiebt den Ausschnitt seitlich: nach links bleibt der linke Teil des Bildes, nach rechts der rechte.',
        focusY: 'Verschiebt den Ausschnitt nach oben oder unten: nach links bleibt der obere Teil des Bildes, nach rechts der untere.',
        background: 'Füllt im Modus „Ganzes Bild“ die Ränder und alle durchsichtigen Pixel: Gemälde sind im Spiel immer deckend.',
        ppb: 'Wie viele Pixel auf einen Block kommen. Die Gemälde aus dem Spiel haben 16. Mehr Pixel bringen mehr Details, aber die Textur wächst im Quadrat: 16 × 16 Blöcke mit 128 Pixeln sind ein Bild von 2048 × 2048, etwa 16 MB Grafikspeicher bei jedem Spieler.',
        colors: 'Reduziert das Bild auf wenige Farben aus dem Bild selbst, für einen flachen, gemalten Look, der zur Pixel-Art des Spiels passt. Die PNG wird dabei auch kleiner.',
        dither: 'Mischt Punkte der verfügbaren Farben, damit weiche Verläufe wie ein Himmel nicht in Streifen zerfallen. Ohne Dithering gibt es klare, flache Flächen wie auf einem Plakat.',
        contrast: 'Mehr Kontrast rückt Hell und Dunkel weiter auseinander. Gemälde hängen oft in dunklen Räumen, dort helfen +10 bis +20.',
        saturation: 'Macht die Farben kräftiger oder blasser. Ganz links wird das Bild schwarz-weiß.',
        load: 'Grafikspeicher ist, was alle Texturen auf dem Rechner jedes Spielers mit dem Paket belegen; das Spiel legt sie in ein gemeinsames Bild. Das Ressourcenpaket ist die ZIP, die Spieler auf einem Server beim Betreten herunterladen. Der Server merkt Gemälde kaum: In unserem Test brauchten 512 Gemälde mit 16 × 16 Blöcken 0,15 ms der 50 ms, die ein Tick hat, und 512 Gemälde belegen weniger als 80 KB im Weltspeicher.'
      }
    }
  };
  const t = T[LOCALE] || T.en;
  const numberLocale = T[LOCALE] ? LOCALE : 'en';

  function formatBytes(bytes) {
    const [kb, mb] = t.units;
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString(numberLocale)} ${kb}`;
    const value = bytes / (1024 * 1024);
    return `${value.toLocaleString(numberLocale, { maximumFractionDigits: value < 10 ? 1 : 0 })} ${mb}`;
  }

  let paintings = [];
  let nextKey = 1;
  let filesCache = [];
  const renderTimers = new Map();
  let outputTimer = 0;

  // ---------- settings ----------

  function currentVersion() {
    return VERSIONS.find((v) => v.id === $('pg-version').value) || VERSIONS[0];
  }

  function currentMode() {
    return hasCustomPaintings(currentVersion()) ? $('pg-mode').value : 'replace';
  }

  function safeNamespace(value) {
    const ns = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_').replace(/^_+|_+$/g, '');
    // New paintings in the minecraft namespace would sit among (and could overwrite) the vanilla ones.
    return ns && ns !== 'minecraft' ? ns : 'paintings';
  }

  function safeId(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_.-]/g, '').replace(/^[_.-]+|[_.-]+$/g, '').slice(0, 48) || 'painting';
  }

  function safeFileName(value) {
    return String(value || 'paintings').trim().replace(/[^a-zA-Z0-9а-яёА-ЯЁ _-]/g, '_').replace(/\s+/g, '_') || 'paintings';
  }

  function clampBlocks(value) {
    const n = Math.round(Number(value));
    return Number.isFinite(n) ? Math.min(MAX_BLOCKS, Math.max(1, n)) : 1;
  }

  function vanillaNames(version) {
    return Object.keys(VANILLA).filter((name) => VANILLA[name][2] <= version.dp);
  }

  function blockSize(p) {
    if (currentMode() === 'replace') {
      const entry = VANILLA[p.vanilla] || VANILLA.kebab;
      return [entry[0], entry[1]];
    }
    return [clampBlocks(p.w), clampBlocks(p.h)];
  }

  /** Until the user picks one, a card replaces the vanilla painting closest to its own (or its picture's)
   *  shape that no other card has taken yet, so a 3 × 2 picture does not land on a 1 × 1 painting. */
  function closestVanilla(p, names) {
    const ratio = p.image ? p.image.width / p.image.height : clampBlocks(p.w) / clampBlocks(p.h);
    const taken = new Set(paintings.filter((other) => other !== p && other.vanillaTouched).map((other) => other.vanilla));
    const earlier = paintings.slice(0, paintings.indexOf(p)).map((other) => other.vanilla);
    earlier.forEach((name) => taken.add(name));
    const pool = names.filter((name) => !taken.has(name));
    const score = (name) => {
      const [w, h] = VANILLA[name];
      return Math.abs(Math.log((w / h) / ratio)) * 10 - w * h * 0.01;
    };
    return (pool.length ? pool : names).reduce((best, name) => (score(name) < score(best) ? name : best));
  }

  // ---------- image pipeline ----------

  function makeCanvas(w, h) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    return canvas;
  }

  /** Draws a source rectangle into a destination rectangle. Upscaling keeps hard pixels (pixel art stays
   *  pixel art); downscaling halves in steps, which keeps fine detail that one big jump would alias away. */
  function drawScaled(ctx, src, sx, sy, sw, sh, dx, dy, dw, dh) {
    if (sw <= dw && sh <= dh) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(src, sx, sy, sw, sh, dx, dy, dw, dh);
      return;
    }
    let cur = src;
    let cx = sx;
    let cy = sy;
    let cw = sw;
    let ch = sh;
    while (cw > dw * 2 || ch > dh * 2) {
      const nw = Math.max(dw, Math.round(cw / 2));
      const nh = Math.max(dh, Math.round(ch / 2));
      const step = makeCanvas(nw, nh);
      const sctx = step.getContext('2d');
      sctx.imageSmoothingEnabled = true;
      sctx.imageSmoothingQuality = 'high';
      sctx.drawImage(cur, cx, cy, cw, ch, 0, 0, nw, nh);
      cur = step;
      cx = 0;
      cy = 0;
      cw = nw;
      ch = nh;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(cur, cx, cy, cw, ch, dx, dy, dw, dh);
  }

  function adjust(data, contrast, saturation) {
    if (!contrast && !saturation) return;
    const cf = 1 + contrast / 100;
    const sf = 1 + saturation / 100;
    for (let o = 0; o < data.length; o += 4) {
      let r = data[o];
      let g = data[o + 1];
      let b = data[o + 2];
      if (sf !== 1) {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        r = gray + (r - gray) * sf;
        g = gray + (g - gray) * sf;
        b = gray + (b - gray) * sf;
      }
      if (cf !== 1) {
        r = (r - 128) * cf + 128;
        g = (g - 128) * cf + 128;
        b = (b - 128) * cf + 128;
      }
      data[o] = r;
      data[o + 1] = g;
      data[o + 2] = b;
    }
  }

  /** Median cut: split the color box with the widest channel at its median until there are n boxes. */
  function medianCut(data, n) {
    const total = data.length / 4;
    const step = Math.max(1, Math.floor(total / 40000));
    const points = [];
    for (let i = 0; i < total; i += step) {
      const o = i * 4;
      points.push([data[o], data[o + 1], data[o + 2]]);
    }
    const boxes = [points];
    while (boxes.length < n) {
      let best = -1;
      let bestRange = 0;
      let bestChannel = 0;
      boxes.forEach((box, index) => {
        if (box.length < 2) return;
        for (let c = 0; c < 3; c += 1) {
          let min = 255;
          let max = 0;
          for (const point of box) {
            if (point[c] < min) min = point[c];
            if (point[c] > max) max = point[c];
          }
          if (max - min > bestRange) {
            bestRange = max - min;
            best = index;
            bestChannel = c;
          }
        }
      });
      if (best < 0) break;
      const box = boxes[best].sort((a, b) => a[bestChannel] - b[bestChannel]);
      const mid = box.length >> 1;
      boxes.splice(best, 1, box.slice(0, mid), box.slice(mid));
    }
    return boxes.filter((box) => box.length).map((box) => {
      let r = 0;
      let g = 0;
      let b = 0;
      box.forEach((point) => { r += point[0]; g += point[1]; b += point[2]; });
      return [Math.round(r / box.length), Math.round(g / box.length), Math.round(b / box.length)];
    });
  }

  function quantize(image, count, dither) {
    const { data, width, height } = image;
    const palette = medianCut(data, count);
    const cache = new Map();
    const nearest = (r, g, b) => {
      const key = (r << 16) | (g << 8) | b;
      let index = cache.get(key);
      if (index === undefined) {
        let bestDistance = Infinity;
        index = 0;
        for (let i = 0; i < palette.length; i += 1) {
          const dr = r - palette[i][0];
          const dg = g - palette[i][1];
          const db = b - palette[i][2];
          // Weighted toward green, which the eye separates best.
          const distance = 2 * dr * dr + 4 * dg * dg + 3 * db * db;
          if (distance < bestDistance) {
            bestDistance = distance;
            index = i;
          }
        }
        cache.set(key, index);
      }
      return palette[index];
    };
    const clamp = (v) => (v < 0 ? 0 : v > 255 ? 255 : Math.round(v));
    if (!dither) {
      for (let o = 0; o < data.length; o += 4) {
        const color = nearest(data[o], data[o + 1], data[o + 2]);
        data[o] = color[0];
        data[o + 1] = color[1];
        data[o + 2] = color[2];
      }
      return;
    }
    // Floyd-Steinberg: push each pixel's rounding error onto the neighbours not yet visited.
    const buffer = new Float32Array(width * height * 3);
    for (let i = 0; i < width * height; i += 1) {
      buffer[i * 3] = data[i * 4];
      buffer[i * 3 + 1] = data[i * 4 + 1];
      buffer[i * 3 + 2] = data[i * 4 + 2];
    }
    const spread = (x, y, er, eg, eb, k) => {
      if (x < 0 || x >= width || y >= height) return;
      const i = (y * width + x) * 3;
      buffer[i] += er * k;
      buffer[i + 1] += eg * k;
      buffer[i + 2] += eb * k;
    };
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const i = (y * width + x) * 3;
        const r = clamp(buffer[i]);
        const g = clamp(buffer[i + 1]);
        const b = clamp(buffer[i + 2]);
        const color = nearest(r, g, b);
        const o = (y * width + x) * 4;
        data[o] = color[0];
        data[o + 1] = color[1];
        data[o + 2] = color[2];
        const er = r - color[0];
        const eg = g - color[1];
        const eb = b - color[2];
        spread(x + 1, y, er, eg, eb, 7 / 16);
        spread(x - 1, y + 1, er, eg, eb, 3 / 16);
        spread(x, y + 1, er, eg, eb, 5 / 16);
        spread(x + 1, y + 1, er, eg, eb, 1 / 16);
      }
    }
  }

  function renderTexture(p) {
    const [bw, bh] = blockSize(p);
    const W = bw * p.ppb;
    const H = bh * p.ppb;
    const canvas = makeCanvas(W, H);
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    // Paintings are drawn opaque, so the border color also stands in for any transparent pixels.
    ctx.fillStyle = p.bg;
    ctx.fillRect(0, 0, W, H);
    if (p.image) {
      const sw = p.image.width;
      const sh = p.image.height;
      if (p.fit === 'stretch') {
        drawScaled(ctx, p.image, 0, 0, sw, sh, 0, 0, W, H);
      } else if (p.fit === 'contain') {
        const s = Math.min(W / sw, H / sh);
        const dw = Math.max(1, Math.round(sw * s));
        const dh = Math.max(1, Math.round(sh * s));
        drawScaled(ctx, p.image, 0, 0, sw, sh, Math.floor((W - dw) / 2), Math.floor((H - dh) / 2), dw, dh);
      } else {
        const s = Math.max(W / sw, H / sh);
        const cw = W / s;
        const ch = H / s;
        drawScaled(ctx, p.image, (sw - cw) * p.focusX / 100, (sh - ch) * p.focusY / 100, cw, ch, 0, 0, W, H);
      }
    }
    if (p.contrast || p.saturation || p.colors !== 'full') {
      const image = ctx.getImageData(0, 0, W, H);
      adjust(image.data, p.contrast, p.saturation);
      if (p.colors !== 'full') quantize(image, Number(p.colors), p.dither);
      ctx.putImageData(image, 0, 0);
    }
    return canvas;
  }

  function drawPreview(p, card) {
    const canvas = card.querySelector('.pg-preview');
    const tex = p.texture;
    if (!canvas || !tex) return;
    const box = card.querySelector('.pg-drop');
    const maxW = Math.max(120, (box ? box.clientWidth : 320) - 24);
    const maxH = 340;
    let s = Math.min(maxW / tex.width, maxH / tex.height);
    if (s >= 1) s = Math.floor(s);
    canvas.width = Math.max(1, Math.round(tex.width * s));
    canvas.height = Math.max(1, Math.round(tex.height * s));
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = s < 1;
    ctx.drawImage(tex, 0, 0, canvas.width, canvas.height);
    if ($('pg-grid').checked) {
      const [bw, bh] = blockSize(p);
      const stepX = canvas.width / bw;
      const stepY = canvas.height / bh;
      ctx.lineWidth = 1;
      for (const [color, offset] of [['rgba(0,0,0,0.45)', 1], ['rgba(255,255,255,0.55)', 0]]) {
        ctx.strokeStyle = color;
        ctx.beginPath();
        for (let x = 1; x < bw; x += 1) {
          const px = Math.round(x * stepX) + 0.5 + offset;
          ctx.moveTo(px, 0);
          ctx.lineTo(px, canvas.height);
        }
        for (let y = 1; y < bh; y += 1) {
          const py = Math.round(y * stepY) + 0.5 + offset;
          ctx.moveTo(0, py);
          ctx.lineTo(canvas.width, py);
        }
        ctx.stroke();
      }
    }
    canvas.hidden = !p.image;
  }

  async function loadImage(file) {
    if (window.createImageBitmap) {
      try {
        return await window.createImageBitmap(file);
      } catch (error) {
        // Fall back to an <img>, which some browsers decode where createImageBitmap refuses.
      }
    }
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('decode')); };
      img.src = url;
    });
  }

  /** A small landscape drawn on the spot, so the page shows a result before anyone uploads anything. */
  function sampleImage() {
    const canvas = makeCanvas(480, 320);
    const ctx = canvas.getContext('2d');
    const sky = ctx.createLinearGradient(0, 0, 0, 210);
    sky.addColorStop(0, '#203a74');
    sky.addColorStop(0.55, '#e0785a');
    sky.addColorStop(1, '#f6c46b');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 480, 320);
    ctx.fillStyle = '#fff2c4';
    ctx.beginPath();
    ctx.arc(330, 168, 34, 0, Math.PI * 2);
    ctx.fill();
    const ridge = (color, base, amp, freq, phase) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(0, 320);
      for (let x = 0; x <= 480; x += 8) {
        ctx.lineTo(x, base - Math.abs(Math.sin(x * freq + phase)) * amp - Math.sin(x * freq * 2.7) * amp * 0.25);
      }
      ctx.lineTo(480, 320);
      ctx.fill();
    };
    ridge('#5b3d6e', 210, 70, 0.012, 0.6);
    ridge('#2f2a4f', 238, 48, 0.02, 1.9);
    const lake = ctx.createLinearGradient(0, 250, 0, 320);
    lake.addColorStop(0, '#f0a46a');
    lake.addColorStop(1, '#1d2a52');
    ctx.fillStyle = lake;
    ctx.fillRect(0, 258, 480, 62);
    ctx.fillStyle = '#16142a';
    ctx.fillRect(0, 300, 480, 20);
    return canvas;
  }

  // ---------- painting cards ----------

  function newPainting(extra) {
    const version = currentVersion();
    const used = new Set(paintings.map((p) => p.vanilla));
    const free = vanillaNames(version).find((name) => !used.has(name)) || 'kebab';
    return {
      key: nextKey++, id: `painting_${paintings.length + 1}`, idTouched: false, w: 2, h: 2, title: '', author: '',
      placeable: true, vanilla: free, image: null, imageName: '', fit: 'cover', focusX: 50, focusY: 50, bg: '#1f2430',
      ppb: 16, colors: 'full', dither: false, contrast: 0, saturation: 0, texture: null, ...extra
    };
  }

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    Object.entries(attrs || {}).forEach(([key, value]) => {
      if (key === 'text') node.textContent = value;
      else if (key === 'class') node.className = value;
      else if (value === true) node.setAttribute(key, '');
      else if (value !== false && value !== undefined && value !== null) node.setAttribute(key, String(value));
    });
    (children || []).forEach((child) => node.append(child));
    return node;
  }

  // ---------- help bubbles ----------
  // Each "?" button carries its text in a visually hidden span that the button and its control point to with
  // aria-describedby, so screen readers get it without the bubble. The bubble itself is one shared element that
  // opens on hover or keyboard focus, stays open after a click or tap, and closes on Escape or a click elsewhere.

  let uid = 0;
  const nextId = (prefix) => `${prefix}-${++uid}`;

  function helpParts(key, labelText) {
    const note = el('span', { id: nextId('pg-help'), class: 'pg-help-text', text: t.help[key] });
    const button = el('button', { type: 'button', class: 'pg-help', 'aria-label': t.helpLabel(labelText), 'aria-describedby': note.id, 'data-help': note.id, text: '?' });
    return [button, note];
  }

  function field(labelText, control, wide, helpKey) {
    if (!control.id) control.id = nextId('pg-control');
    const row = el('span', { class: 'pg-label-row' }, [el('label', { for: control.id, text: labelText })]);
    const node = el('div', { class: 'tool-field' + (wide ? ' pg-wide' : '') }, [row, control]);
    if (helpKey) {
      const [button, note] = helpParts(helpKey, labelText);
      row.append(button);
      node.append(note);
      control.setAttribute('aria-describedby', note.id);
    }
    return node;
  }

  function checkLine(text, input, helpKey) {
    const node = el('div', { class: 'pg-check' }, [el('label', { class: 'pg-check-label' }, [input, el('span', { text })])]);
    if (helpKey) {
      const [button, note] = helpParts(helpKey, text);
      node.append(button, note);
      input.setAttribute('aria-describedby', note.id);
    }
    return node;
  }

  /** The pack panel is static HTML (label > span + control); give its fields the same shape and a "?". */
  function upgradeStatic(controlId, helpKey) {
    const control = $(controlId);
    const label = control && control.closest('label');
    if (!label) return;
    const text = label.querySelector('span').textContent;
    const node = control.type === 'checkbox' ? checkLine(text, control, helpKey) : field(text, control, false, helpKey);
    if (label.id) node.id = label.id;
    node.hidden = label.hidden;
    label.replaceWith(node);
  }

  const tip = el('div', { class: 'pg-tip', 'aria-hidden': 'true', hidden: true });
  document.body.append(tip);
  let tipOwner = null;
  let tipPinned = false;
  let tipTimer = 0;

  function placeTip() {
    if (!tipOwner || !tipOwner.isConnected) { closeTip(); return; }
    const r = tipOwner.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) { closeTip(); return; }
    const vw = document.documentElement.clientWidth;
    tip.style.left = '0px';
    tip.style.top = '0px';
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const center = r.left + r.width / 2;
    const left = Math.max(8, Math.min(center - w / 2, vw - w - 8));
    let top = r.bottom + 10;
    let above = false;
    if (top + h > window.innerHeight - 8 && r.top - 10 - h >= 8) {
      top = r.top - 10 - h;
      above = true;
    }
    tip.style.left = `${Math.round(left)}px`;
    tip.style.top = `${Math.round(top)}px`;
    tip.style.setProperty('--pg-tip-arrow', `${Math.round(Math.max(14, Math.min(w - 14, center - left)))}px`);
    tip.classList.toggle('is-above', above);
  }

  function openTip(button) {
    clearTimeout(tipTimer);
    if (tipOwner !== button) {
      closeTip();
      const note = document.getElementById(button.getAttribute('data-help'));
      if (!note) return;
      tipOwner = button;
      button.classList.add('is-open');
      tip.textContent = note.textContent;
      tip.hidden = false;
    }
    placeTip();
  }

  function closeTip() {
    clearTimeout(tipTimer);
    if (tipOwner) tipOwner.classList.remove('is-open');
    tipOwner = null;
    tipPinned = false;
    tip.hidden = true;
  }

  const helpButtonOf = (target) => (target && target.closest ? target.closest('.pg-help') : null);

  document.addEventListener('pointerover', (event) => {
    if (event.pointerType !== 'mouse') return;
    const button = helpButtonOf(event.target);
    if (button) openTip(button);
    else if (tip.contains(event.target)) clearTimeout(tipTimer);
  });
  document.addEventListener('pointerout', (event) => {
    if (event.pointerType !== 'mouse' || !tipOwner || tipPinned) return;
    if (helpButtonOf(event.target) !== tipOwner && !tip.contains(event.target)) return;
    const to = event.relatedTarget;
    if (to && (tipOwner.contains(to) || tip.contains(to))) return;
    // A short delay lets the pointer cross the gap onto the bubble, which then stays open.
    clearTimeout(tipTimer);
    tipTimer = setTimeout(closeTip, 180);
  });
  document.addEventListener('focusin', (event) => {
    const button = helpButtonOf(event.target);
    if (button) openTip(button);
  });
  document.addEventListener('focusout', (event) => {
    if (helpButtonOf(event.target) === tipOwner && tipOwner) closeTip();
  });
  document.addEventListener('click', (event) => {
    const button = helpButtonOf(event.target);
    if (!button) return;
    event.preventDefault();
    if (tipOwner === button && tipPinned) { closeTip(); return; }
    openTip(button);
    tipPinned = true;
  });
  document.addEventListener('pointerdown', (event) => {
    if (tipOwner && !helpButtonOf(event.target) && !tip.contains(event.target)) closeTip();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && tipOwner) closeTip();
  });
  window.addEventListener('scroll', () => { if (tipOwner) placeTip(); }, { passive: true, capture: true });
  window.addEventListener('resize', () => { if (tipOwner) placeTip(); });

  function select(options, value) {
    const node = el('select');
    options.forEach(([optionValue, text]) => node.append(el('option', { value: optionValue, text })));
    node.value = String(value);
    return node;
  }

  function range(min, max, value) {
    return el('input', { type: 'range', min, max, step: 1, value });
  }

  function renderCards() {
    const list = $('pg-paintings');
    if (tipOwner && list.contains(tipOwner)) closeTip();
    list.innerHTML = '';
    const mode = currentMode();
    const version = currentVersion();
    paintings.forEach((p, index) => {
      const card = el('div', { class: 'trade-card pg-card', 'data-key': p.key });
      const remove = el('button', { type: 'button', class: 'tool-button tool-button-secondary', text: t.remove });
      remove.addEventListener('click', () => {
        paintings = paintings.filter((other) => other !== p);
        renderCards();
        scheduleOutputs();
      });
      card.append(el('div', { class: 'trade-card-header' }, [el('h3', { text: `${t.painting} ${index + 1}` }), remove]));

      // Left: the picture and its drop zone.
      const fileInput = el('input', { type: 'file', accept: 'image/*', hidden: true });
      const choose = el('button', { type: 'button', class: 'tool-button tool-button-secondary', text: p.image ? t.replaceImage : t.choose });
      choose.addEventListener('click', () => fileInput.click());
      const drop = el('div', { class: 'pg-drop' }, [
        el('canvas', { class: 'pg-preview', hidden: !p.image }),
        el('p', { class: 'pg-empty', text: t.noImage, hidden: Boolean(p.image) }),
        el('div', { class: 'pg-drop-actions' }, [choose, el('span', { class: 'pg-dim', text: t.drop })]),
        el('p', { class: 'pg-dim pg-file-name', text: p.imageName }),
        el('p', { class: 'pg-dim pg-texture-size' }),
        fileInput
      ]);
      const takeFile = async (file) => {
        if (!file || !/^image\//.test(file.type)) return;
        try {
          p.image = await loadImage(file);
        } catch (error) {
          return;
        }
        p.imageName = file.name;
        if (!p.idTouched) p.id = safeId(file.name.replace(/\.[a-z0-9]+$/i, ''));
        renderCards();
        scheduleOutputs();
      };
      fileInput.addEventListener('change', () => takeFile(fileInput.files[0]));
      drop.addEventListener('dragover', (event) => { event.preventDefault(); drop.classList.add('is-over'); });
      drop.addEventListener('dragleave', () => drop.classList.remove('is-over'));
      drop.addEventListener('drop', (event) => {
        event.preventDefault();
        drop.classList.remove('is-over');
        takeFile(event.dataTransfer && event.dataTransfer.files[0]);
      });

      // Right: what the painting is, then how the picture is fitted.
      const fields = el('div', { class: 'pg-fields' });
      const grid = el('div', { class: 'tool-form-grid' });
      if (mode === 'new') {
        const id = el('input', { type: 'text', value: p.id, spellcheck: 'false' });
        id.addEventListener('input', () => { p.id = id.value; p.idTouched = true; scheduleOutputs(); });
        id.addEventListener('change', () => { p.id = safeId(id.value); id.value = p.id; scheduleOutputs(); });
        const w = el('input', { type: 'number', min: 1, max: MAX_BLOCKS, value: p.w });
        const h = el('input', { type: 'number', min: 1, max: MAX_BLOCKS, value: p.h });
        const sizeChanged = () => { p.w = clampBlocks(w.value); p.h = clampBlocks(h.value); scheduleRender(p); };
        w.addEventListener('input', sizeChanged);
        h.addEventListener('input', sizeChanged);
        w.addEventListener('change', () => { w.value = p.w; });
        h.addEventListener('change', () => { h.value = p.h; });
        const match = el('button', { type: 'button', class: 'tool-chip-button pg-wide', text: t.match, disabled: !p.image });
        match.addEventListener('click', () => {
          if (!p.image) return;
          // Keep the longer side, set the other from the picture's proportions.
          const ratio = p.image.width / p.image.height;
          const long = Math.max(p.w, p.h, 2);
          if (ratio >= 1) { p.w = long; p.h = clampBlocks(long / ratio); } else { p.h = long; p.w = clampBlocks(long * ratio); }
          w.value = p.w;
          h.value = p.h;
          scheduleRender(p);
        });
        const title = el('input', { type: 'text', value: p.title, maxlength: 64 });
        title.addEventListener('input', () => { p.title = title.value; scheduleOutputs(); });
        const author = el('input', { type: 'text', value: p.author, maxlength: 64 });
        author.addEventListener('input', () => { p.author = author.value; scheduleOutputs(); });
        const placeable = el('input', { type: 'checkbox', checked: p.placeable });
        placeable.addEventListener('change', () => { p.placeable = placeable.checked; scheduleOutputs(); });
        grid.append(field(t.id, id, true, 'id'), field(t.width, w, false, 'size'), field(t.height, h, false, 'size'), match, field(t.title, title, false, 'title'), field(t.author, author, false, 'author'), checkLine(t.placeable, placeable, 'placeable'));
        if (!hasTitleAuthor(version)) grid.append(el('p', { class: 'tool-summary pg-wide', text: t.titleOld }));
        grid.append(el('p', { class: 'pg-warning pg-wide pg-dup', hidden: true }));
      } else {
        const names = vanillaNames(version);
        if (!p.vanillaTouched || !names.includes(p.vanilla)) p.vanilla = closestVanilla(p, names);
        const vanilla = select(names.map((name) => [name, t.pickVanilla(name, VANILLA[name][0], VANILLA[name][1])]), p.vanilla);
        vanilla.addEventListener('change', () => { p.vanilla = vanilla.value; p.vanillaTouched = true; scheduleRender(p); });
        grid.append(field(t.replaces, vanilla, true, 'replaces'), el('p', { class: 'pg-warning pg-wide pg-dup', hidden: true }));
      }
      fields.append(grid);

      const imageGrid = el('div', { class: 'tool-form-grid' });
      const fit = select([['cover', t.fitCover], ['contain', t.fitContain], ['stretch', t.fitStretch]], p.fit);
      const focusX = range(0, 100, p.focusX);
      const focusY = range(0, 100, p.focusY);
      const bg = el('input', { type: 'color', value: p.bg });
      const ppb = select(PIXELS_PER_BLOCK.map((n) => [n, n + (n === 16 ? t.ppbVanilla : '')]), p.ppb);
      const colors = select(PALETTES.map((n) => [n, n === 'full' ? t.colorsAll : t.colorsN(n)]), p.colors);
      const dither = el('input', { type: 'checkbox', checked: p.dither });
      const contrast = range(-50, 50, p.contrast);
      const saturation = range(-100, 100, p.saturation);
      const focusXField = field(t.focusX, focusX, false, 'focusX');
      const focusYField = field(t.focusY, focusY, false, 'focusY');
      const bgField = field(t.background, bg, false, 'background');
      const ditherLine = checkLine(t.dither, dither, 'dither');
      const sync = () => {
        focusXField.hidden = p.fit !== 'cover';
        focusYField.hidden = p.fit !== 'cover';
        bgField.hidden = p.fit !== 'contain';
        ditherLine.hidden = p.colors === 'full';
      };
      fit.addEventListener('change', () => { p.fit = fit.value; sync(); scheduleRender(p); });
      focusX.addEventListener('input', () => { p.focusX = Number(focusX.value); scheduleRender(p); });
      focusY.addEventListener('input', () => { p.focusY = Number(focusY.value); scheduleRender(p); });
      bg.addEventListener('input', () => { p.bg = bg.value; scheduleRender(p); });
      ppb.addEventListener('change', () => { p.ppb = Number(ppb.value); scheduleRender(p); });
      colors.addEventListener('change', () => { p.colors = colors.value; sync(); scheduleRender(p); });
      dither.addEventListener('change', () => { p.dither = dither.checked; scheduleRender(p); });
      contrast.addEventListener('input', () => { p.contrast = Number(contrast.value); scheduleRender(p); });
      saturation.addEventListener('input', () => { p.saturation = Number(saturation.value); scheduleRender(p); });
      imageGrid.append(field(t.fit, fit, false, 'fit'), focusXField, focusYField, bgField, field(t.ppb, ppb, false, 'ppb'), field(t.colors, colors, false, 'colors'), ditherLine, field(t.contrast, contrast, false, 'contrast'), field(t.saturation, saturation, false, 'saturation'));
      sync();
      fields.append(el('h4', { class: 'pg-subhead', text: t.imageHead }), imageGrid);

      card.append(el('div', { class: 'pg-card-body' }, [drop, fields]), el('div', { class: 'pg-card-warnings' }));
      list.append(card);
      renderPainting(p);
    });
  }

  function cardFor(p) {
    return $('pg-paintings').querySelector(`[data-key="${p.key}"]`);
  }

  function renderPainting(p) {
    p.texture = renderTexture(p);
    const card = cardFor(p);
    if (!card) return;
    drawPreview(p, card);
    updateCardLoad(p, card);
  }

  /** The texture size line under the preview and the warnings at the bottom of the card. */
  function updateCardLoad(p, card) {
    const tex = p.texture;
    const line = card.querySelector('.pg-texture-size');
    const box = card.querySelector('.pg-card-warnings');
    if (!tex || !line || !box) return;
    line.textContent = t.texture(tex.width, tex.height, formatBytes(tex.width * tex.height * 4));
    const [bw, bh] = blockSize(p);
    const notes = [];
    if (tex.width * tex.height > HEAVY_TEXTURE_PX) notes.push(t.heavyTexture);
    if (currentMode() === 'new') {
      if (bw > VANILLA_MAX_SIDE || bh > VANILLA_MAX_SIDE) notes.push(t.bigWall(bw, bh));
      if (p.placeable && bw * bh > VANILLA_MAX_AREA) notes.push(t.bigPlaceable);
    }
    box.replaceChildren(...notes.map((text) => el('p', { class: 'pg-warning', text })));
  }

  function scheduleRender(p) {
    clearTimeout(renderTimers.get(p.key));
    renderTimers.set(p.key, setTimeout(() => { renderPainting(p); scheduleOutputs(); }, 90));
  }

  // ---------- pack contents ----------

  function readyPaintings() {
    return paintings.filter((p) => p.image);
  }

  /** IDs as written: a second painting with the same ID gets _2, _3 … so neither file overwrites the other. */
  function effectiveIds() {
    const seen = new Map();
    const ids = new Map();
    readyPaintings().forEach((p) => {
      const base = safeId(p.id);
      const count = (seen.get(base) || 0) + 1;
      seen.set(base, count);
      ids.set(p, count === 1 ? base : `${base}_${count}`);
    });
    return ids;
  }

  function packMeta(format, minMax, description) {
    const pack = minMax
      ? { description, min_format: format, max_format: format }
      : { pack_format: format, description };
    return JSON.stringify({ pack }, null, 2) + '\n';
  }

  function textComponent(text, color) {
    return { text, color };
  }

  function variantJson(p, id, ns, version) {
    const [w, h] = blockSize(p);
    const json = { asset_id: `${ns}:${id}`, width: w, height: h };
    if (hasTitleAuthor(version)) {
      // Vanilla paintings show the title in yellow and the author in gray; these match.
      if (p.title.trim()) json.title = textComponent(p.title.trim(), 'yellow');
      if (p.author.trim()) json.author = textComponent(p.author.trim(), 'gray');
    }
    return JSON.stringify(json, null, 2) + '\n';
  }

  function giveCommand(variant, version) {
    if (hasVariantComponent(version)) return `give @p minecraft:painting[minecraft:painting/variant="${variant}"]`;
    if (hasComponents(version)) return `give @p minecraft:painting[minecraft:entity_data={id:"minecraft:painting",variant:"${variant}"}]`;
    return `give @p minecraft:painting{EntityTag:{variant:"${variant}"}}`;
  }

  /** Every file of both packs; PNGs carry their canvas and are turned into bytes only when downloading. */
  function buildFiles() {
    const version = currentVersion();
    const mode = currentMode();
    const ns = safeNamespace($('pg-namespace').value);
    const name = String($('pg-name').value || '').trim() || t.packDesc;
    const ready = readyPaintings();
    const ids = effectiveIds();
    const files = [];
    if (!ready.length) return files;

    files.push({ pack: 'rp', path: 'pack.mcmeta', content: packMeta(version.rp, version.rp >= 65, name) });
    files.push({ pack: 'rp', path: 'pack.png', canvas: packIcon(ready[0].texture) });
    if (mode === 'replace') {
      const last = new Map();
      ready.forEach((p) => last.set(p.vanilla, p));
      last.forEach((p, vanilla) => files.push({ pack: 'rp', path: `assets/minecraft/textures/painting/${vanilla}.png`, canvas: p.texture, blocks: blockSize(p) }));
      return files;
    }
    ready.forEach((p) => files.push({ pack: 'rp', path: `assets/${ns}/textures/painting/${ids.get(p)}.png`, canvas: p.texture, blocks: blockSize(p) }));

    files.push({ pack: 'dp', path: 'pack.mcmeta', content: packMeta(version.dp, version.dp >= 88, name) });
    ready.forEach((p) => files.push({ pack: 'dp', path: `data/${ns}/painting_variant/${ids.get(p)}.json`, content: variantJson(p, ids.get(p), ns, version) }));
    const placeable = ready.filter((p) => p.placeable).map((p) => `${ns}:${ids.get(p)}`);
    if (placeable.length) {
      // Without "replace" the list is added to the vanilla one; with it, only these paintings are picked.
      const tag = $('pg-only-mine').checked ? { replace: true, values: placeable } : { values: placeable };
      files.push({ pack: 'dp', path: 'data/minecraft/tags/painting_variant/placeable.json', content: JSON.stringify(tag, null, 2) + '\n' });
    }
    return files;
  }

  function packIcon(texture) {
    const icon = makeCanvas(64, 64);
    const ctx = icon.getContext('2d');
    const side = Math.min(texture.width, texture.height);
    drawScaled(ctx, texture, (texture.width - side) / 2, (texture.height - side) / 2, side, side, 0, 0, 64, 64);
    return icon;
  }

  function commandsText() {
    const version = currentVersion();
    const mode = currentMode();
    const ns = safeNamespace($('pg-namespace').value);
    const ids = effectiveIds();
    const lines = [t.commandsNote];
    readyPaintings().forEach((p) => {
      lines.push(giveCommand(mode === 'replace' ? `minecraft:${p.vanilla}` : `${ns}:${ids.get(p)}`, version));
    });
    return lines.join('\n');
  }

  function treeText(files) {
    const version = currentVersion();
    const block = (pack, label, format) => {
      const own = files.filter((f) => f.pack === pack);
      if (!own.length) return [];
      return [`${label} (${format})`].concat(own.map((f) => '  ' + f.path + (f.canvas ? `  (${f.canvas.width} × ${f.canvas.height})` : '')));
    };
    return block('rp', t.rp, version.rp).concat(block('dp', t.dp, version.dp)).join('\n');
  }

  function updateWarnings() {
    const mode = currentMode();
    const ids = effectiveIds();
    const counts = new Map();
    readyPaintings().forEach((p) => counts.set(p.vanilla, (counts.get(p.vanilla) || 0) + 1));
    paintings.forEach((p) => {
      const card = cardFor(p);
      const note = card && card.querySelector('.pg-dup');
      if (!note) return;
      let text = '';
      if (mode === 'new' && p.image && ids.get(p) !== safeId(p.id)) text = t.dupId(ids.get(p));
      if (mode === 'replace' && p.image && counts.get(p.vanilla) > 1) text = t.dupVanilla;
      note.textContent = text;
      note.hidden = !text;
      updateCardLoad(p, card);
    });
  }

  // ---------- load summary ----------

  const loadText = el('span');
  const [loadHelp, loadNote] = helpParts('load', t.loadHead);
  const loadLine = el('p', { class: 'tool-summary pg-load', hidden: true }, [el('strong', { text: t.loadHead }), ' ', loadText, ' ', loadHelp, loadNote]);
  const loadWarnings = el('div', { class: 'pg-load-warnings' });
  $('pg-summary').after(loadLine, loadWarnings);
  let loadState = null;
  let downloadBytes = null;
  let sizeTimer = 0;
  let sizeJob = 0;
  const pngBytes = new WeakMap();

  /** Smallest power-of-two square that holds every painting texture plus the vanilla ones (16 px per block). */
  function atlasSide(pixels, maxSide) {
    let side = 256;
    while (side < maxSide || side * side < pixels) side *= 2;
    return side;
  }

  function vanillaPixels() {
    const version = currentVersion();
    return vanillaNames(version).reduce((sum, name) => sum + VANILLA[name][0] * VANILLA[name][1] * 256, 0);
  }

  function updateLoad(files) {
    const textures = files.filter((f) => f.pack === 'rp' && f.blocks);
    clearTimeout(sizeTimer);
    if (!textures.length) {
      loadState = null;
      loadLine.hidden = true;
      loadWarnings.replaceChildren();
      return;
    }
    let pixels = 0;
    let maxSide = 0;
    let blocks = 0;
    textures.forEach((f) => {
      pixels += f.canvas.width * f.canvas.height;
      maxSide = Math.max(maxSide, f.canvas.width, f.canvas.height);
      blocks += f.blocks[0] * f.blocks[1];
    });
    loadState = { count: textures.length, blocks, bytes: pixels * 4, side: atlasSide(pixels + vanillaPixels(), maxSide) };
    renderLoad();
    // PNG sizes need the encoder, so they are counted once the settings have been still for a moment.
    sizeTimer = setTimeout(() => measureDownload(files.filter((f) => f.pack === 'rp')), 500);
  }

  async function measureDownload(files) {
    const job = ++sizeJob;
    let total = 0;
    for (const f of files) {
      if (f.canvas) {
        let bytes = pngBytes.get(f.canvas);
        if (bytes === undefined) {
          const blob = await toBlob(f.canvas);
          if (job !== sizeJob) return;
          bytes = blob ? blob.size : 0;
          pngBytes.set(f.canvas, bytes);
        }
        total += bytes;
      } else {
        total += new Blob([f.content]).size;
      }
    }
    if (job !== sizeJob || !loadState) return;
    downloadBytes = total;
    renderLoad();
  }

  function renderLoad() {
    const s = loadState;
    if (!s) return;
    loadText.textContent = t.load(s.count, s.blocks, formatBytes(s.bytes), downloadBytes === null ? '' : formatBytes(downloadBytes));
    loadLine.hidden = false;
    const notes = [];
    if (s.bytes > HEAVY_TOTAL_BYTES) notes.push(t.heavyTotal(formatBytes(s.bytes)));
    if (s.side > MOST_GPU_TEXTURE) notes.push(t.atlasMost(s.side));
    else if (s.side > OLD_GPU_TEXTURE) notes.push(t.atlasOld(s.side));
    if (downloadBytes !== null && downloadBytes > BIG_DOWNLOAD_BYTES) notes.push(t.bigDownload(formatBytes(downloadBytes)));
    loadWarnings.replaceChildren(...notes.map((text) => el('p', { class: 'pg-warning', text })));
  }

  function updateOutputs() {
    const version = currentVersion();
    const mode = currentMode();
    const files = buildFiles();
    filesCache = files;
    updateWarnings();
    $('pg-format-note').textContent = mode === 'new' ? `RP ${version.rp} · DP ${version.dp}` : `RP ${version.rp}`;
    $('pg-download-dp').hidden = mode !== 'new';
    $('pg-only-mine-line').hidden = mode !== 'new';
    $('pg-mode-note').hidden = hasCustomPaintings(version);
    $('pg-mode').disabled = !hasCustomPaintings(version);
    updateLoad(files);
    if (!files.length) {
      $('pg-commands').value = t.none;
      $('pg-tree').value = '';
      $('pg-file-content').value = '';
      $('pg-file-select').innerHTML = '';
      $('pg-summary').textContent = t.none;
      $('pg-download-rp').disabled = true;
      $('pg-download-dp').disabled = true;
      return;
    }
    $('pg-download-rp').disabled = false;
    $('pg-download-dp').disabled = mode !== 'new';
    $('pg-commands').value = commandsText();
    $('pg-tree').value = treeText(files);
    let summary = mode === 'new' ? t.summaryNew(readyPaintings().length) : t.summaryReplace(new Set(readyPaintings().map((p) => p.vanilla)).size);
    if (mode === 'new' && $('pg-only-mine').checked && !readyPaintings().some((p) => p.placeable)) summary += ' ' + t.onlyMineNone;
    $('pg-summary').textContent = summary;

    const selectNode = $('pg-file-select');
    const previous = selectNode.value;
    selectNode.innerHTML = '';
    files.forEach((f, index) => {
      selectNode.append(el('option', { value: index, text: `${f.pack === 'rp' ? t.rp : t.dp}: ${f.path}` }));
    });
    const keep = Array.from(selectNode.options).find((o) => o.textContent === previous);
    const firstJson = files.findIndex((f) => f.path.endsWith('.json'));
    selectNode.value = keep ? keep.value : String(firstJson >= 0 ? firstJson : 0);
    showFile();
  }

  function showFile() {
    const file = filesCache[Number($('pg-file-select').value)];
    if (!file) { $('pg-file-content').value = ''; return; }
    $('pg-file-content').value = file.canvas ? t.png(file.canvas.width, file.canvas.height) : file.content;
  }

  function scheduleOutputs() {
    clearTimeout(outputTimer);
    outputTimer = setTimeout(updateOutputs, 60);
  }

  // ---------- copy and download ----------

  async function copyText(text, button, outputKind) {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      return;
    }
    const original = button.textContent;
    button.textContent = t.copied;
    setTimeout(() => { button.textContent = original; }, 1400);
    track('tool_copy', { output_kind: outputKind, mc_version: currentVersion().id });
  }

  const toBlob = (canvas) => new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));

  async function download(pack) {
    if (typeof window.JSZip !== 'function') return;
    const files = buildFiles().filter((f) => f.pack === pack);
    if (!files.length) return;
    const zip = new window.JSZip();
    for (const f of files) zip.file(f.path, f.canvas ? await toBlob(f.canvas) : f.content);
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${safeFileName($('pg-name').value)}_${pack === 'rp' ? 'resource_pack' : 'data_pack'}.zip`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    track('tool_download', { file_kind: 'zip', mc_version: currentVersion().id });
  }

  // ---------- wiring ----------

  const versionSelect = $('pg-version');
  VERSIONS.forEach((v) => versionSelect.append(el('option', { value: v.id, text: v.label })));
  [['pg-name', 'name'], ['pg-namespace', 'namespace'], ['pg-version', 'version'], ['pg-mode', 'mode'],
    ['pg-only-mine', 'onlyMine'], ['pg-grid', 'grid']].forEach(([id, key]) => upgradeStatic(id, key));

  $('pg-add').addEventListener('click', () => {
    paintings.push(newPainting());
    renderCards();
    scheduleOutputs();
  });
  $('pg-sample').addEventListener('click', () => {
    const extra = { image: sampleImage(), imageName: t.sampleName, id: 'sunset_lake', idTouched: true, w: 3, h: 2, title: t.sampleTitle, author: 'Cube in Square' };
    const empty = paintings.find((p) => !p.image);
    if (empty) Object.assign(empty, extra);
    else paintings.push(newPainting(extra));
    renderCards();
    scheduleOutputs();
    track('tool_example_load');
  });
  versionSelect.addEventListener('change', () => {
    if (!hasCustomPaintings(currentVersion())) $('pg-mode').value = 'replace';
    renderCards();
    scheduleOutputs();
  });
  $('pg-mode').addEventListener('change', () => { renderCards(); scheduleOutputs(); });
  $('pg-grid').addEventListener('change', () => paintings.forEach((p) => { const card = cardFor(p); if (card) drawPreview(p, card); }));
  ['pg-name', 'pg-namespace'].forEach((id) => $(id).addEventListener('input', scheduleOutputs));
  $('pg-only-mine').addEventListener('change', scheduleOutputs);
  $('pg-file-select').addEventListener('change', showFile);
  $('pg-copy-commands').addEventListener('click', (e) => copyText(readyPaintings().length ? $('pg-commands').value : '', e.currentTarget, 'command'));
  $('pg-copy-file').addEventListener('click', (e) => {
    const file = filesCache[Number($('pg-file-select').value)];
    copyText(file && !file.canvas ? file.content : '', e.currentTarget, 'file_content');
  });
  $('pg-download-rp').addEventListener('click', () => download('rp'));
  $('pg-download-dp').addEventListener('click', () => download('dp'));
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => paintings.forEach((p) => { const card = cardFor(p); if (card) drawPreview(p, card); }), 150);
  });

  paintings.push(newPainting());
  renderCards();
  updateOutputs();
})();
