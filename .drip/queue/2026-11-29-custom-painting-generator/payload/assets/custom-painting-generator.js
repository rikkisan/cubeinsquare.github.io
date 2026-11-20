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
      texture: (w, h) => `Texture ${w} × ${h} px`,
      big: 'Over 1024 px on a side: slow to load and heavy on memory. 16 or 32 pixels per block is enough for most walls.',
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
      pickVanilla: (name, w, h) => `${name} (${w} × ${h})`
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
      texture: (w, h) => `Текстура ${w} × ${h} px`,
      big: 'Больше 1024 px по стороне: долго грузится и занимает много памяти. Для большинства стен хватает 16 или 32 пикселей на блок.',
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
      pickVanilla: (name, w, h) => `${name} (${w} × ${h})`
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
      texture: (w, h) => `Texture ${w} × ${h} px`,
      big: 'Plus de 1024 px de côté : lent à charger et lourd en mémoire. 16 ou 32 pixels par bloc suffisent pour la plupart des murs.',
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
      pickVanilla: (name, w, h) => `${name} (${w} × ${h})`
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
      texture: (w, h) => `Textur ${w} × ${h} px`,
      big: 'Über 1024 px Kantenlänge: lädt langsam und braucht viel Speicher. 16 oder 32 Pixel pro Block reichen für die meisten Wände.',
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
      pickVanilla: (name, w, h) => `${name} (${w} × ${h})`
    }
  };
  const t = T[LOCALE] || T.en;

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

  function field(labelText, control, wide) {
    const label = el('label', { class: 'tool-field' + (wide ? ' pg-wide' : '') }, [el('span', { text: labelText }), control]);
    return label;
  }

  function checkLine(text, input) {
    return el('label', { class: 'pg-check' }, [input, el('span', { text })]);
  }

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
        grid.append(field(t.id, id, true), field(t.width, w), field(t.height, h), match, field(t.title, title), field(t.author, author), checkLine(t.placeable, placeable));
        if (!hasTitleAuthor(version)) grid.append(el('p', { class: 'tool-summary pg-wide', text: t.titleOld }));
        grid.append(el('p', { class: 'pg-warning pg-wide pg-dup', hidden: true }));
      } else {
        const names = vanillaNames(version);
        if (!p.vanillaTouched || !names.includes(p.vanilla)) p.vanilla = closestVanilla(p, names);
        const vanilla = select(names.map((name) => [name, t.pickVanilla(name, VANILLA[name][0], VANILLA[name][1])]), p.vanilla);
        vanilla.addEventListener('change', () => { p.vanilla = vanilla.value; p.vanillaTouched = true; scheduleRender(p); });
        grid.append(field(t.replaces, vanilla, true), el('p', { class: 'pg-warning pg-wide pg-dup', hidden: true }));
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
      const focusXField = field(t.focusX, focusX);
      const focusYField = field(t.focusY, focusY);
      const bgField = field(t.background, bg);
      const ditherLine = checkLine(t.dither, dither);
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
      imageGrid.append(field(t.fit, fit), focusXField, focusYField, bgField, field(t.ppb, ppb), field(t.colors, colors), ditherLine, field(t.contrast, contrast), field(t.saturation, saturation));
      sync();
      fields.append(el('h4', { class: 'pg-subhead', text: t.imageHead }), imageGrid);

      card.append(el('div', { class: 'pg-card-body' }, [drop, fields]));
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
    const size = card.querySelector('.pg-texture-size');
    const big = p.texture.width > 1024 || p.texture.height > 1024;
    size.textContent = t.texture(p.texture.width, p.texture.height) + (big ? '. ' + t.big : '');
    size.classList.toggle('pg-warning', big);
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
      last.forEach((p, vanilla) => files.push({ pack: 'rp', path: `assets/minecraft/textures/painting/${vanilla}.png`, canvas: p.texture }));
      return files;
    }
    ready.forEach((p) => files.push({ pack: 'rp', path: `assets/${ns}/textures/painting/${ids.get(p)}.png`, canvas: p.texture }));

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
    });
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
