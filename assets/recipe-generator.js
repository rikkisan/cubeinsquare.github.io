(() => {
  const root = document.querySelector('[data-recipe-generator]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const track = (name, params) => { if (window.CubeAnalytics) window.CubeAnalytics.track(name, params); };

  // Data pack format per version, used only to decide which JSON shape to
  // emit. Recipe JSON changed twice: 1.20.5 renamed the crafting result's
  // "item" to "id" and turned cooking results into objects, and 1.21.2 let
  // ingredients be bare id strings instead of {"item": id}.
  const VERSIONS = [
    { id: '26.3',   label: '26.3',            format: 121 },
    { id: '26.2',   label: '26.2',            format: 107 },
    { id: '26.1',   label: '26.1',            format: 101 },
    { id: '1.21.7', label: '1.21.7 - 1.21.8', format: 81 },
    { id: '1.21.6', label: '1.21.6',          format: 80 },
    { id: '1.21.5', label: '1.21.5',          format: 71 },
    { id: '1.21.4', label: '1.21.4',          format: 61 },
    { id: '1.21.2', label: '1.21.2 - 1.21.3', format: 57 },
    { id: '1.21',   label: '1.21 - 1.21.1',   format: 48 },
    { id: '1.20.5', label: '1.20.5 - 1.20.6', format: 41 },
    { id: '1.20',   label: '1.20 - 1.20.4',   format: 26 }
  ];

  const LOCALE = (document.documentElement.lang || 'en').slice(0, 2);
  const ruItems = (n) => {
    const a = n % 10, b = n % 100;
    if (a === 1 && b !== 11) return 'предмет';
    return a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'предмета' : 'предметов';
  };
  const T = {
    en: { copied: 'Copied', empty: 'Fill the grid or ingredient list first.',
          shaped: (n) => `${n} distinct ingredient(s) in the grid.`,
          list: (n) => `${n} ingredient(s).`,
          libTarget: 'Next item goes to:', libSlot: (n) => `slot ${n}`, libResult: 'the result',
          libList: 'the ingredient list', libResultLabel: 'Result slot',
          libCount: (n, v) => `${n.toLocaleString('en')} items exist in ${v}.`,
          libFound: (n) => `Found: ${n}.`, libNone: 'No item matches.', libSince: (v) => `Since ${v}`,
          libMissing: (list, v) => `Not in ${v}: ${list}. Pick a newer version or another item.`,
          compBadJson: 'Other components: not a JSON object, so they were left out.',
          compBadEnch: (line) => `Enchantment line not understood: "${line}".` },
    ru: { copied: 'Скопировано', empty: 'Сначала заполните сетку или список ингредиентов.',
          shaped: (n) => `Разных ингредиентов в сетке: ${n}.`,
          list: (n) => `Ингредиентов: ${n}.`,
          libTarget: 'Следующий предмет пойдёт в:', libSlot: (n) => `слот ${n}`, libResult: 'результат',
          libList: 'список ингредиентов', libResultLabel: 'Слот результата',
          libCount: (n, v) => `В версии ${v} есть ${n.toLocaleString('ru')} ${ruItems(n)}.`,
          libFound: (n) => `Найдено: ${n}.`, libNone: 'Ничего не нашлось.', libSince: (v) => `С версии ${v}`,
          libMissing: (list, v) => `Нет в версии ${v}: ${list}. Выберите версию новее или другой предмет.`,
          compBadJson: 'Другие компоненты: это не JSON-объект, поэтому они пропущены.',
          compBadEnch: (line) => `Не понял строку зачарования: «${line}».` },
    fr: { copied: 'Copié', empty: 'Remplissez d’abord la grille ou la liste.',
          shaped: (n) => `${n} ingrédient(s) distinct(s) dans la grille.`,
          list: (n) => `${n} ingrédient(s).`,
          libTarget: 'Le prochain objet ira dans :', libSlot: (n) => `la case ${n}`, libResult: 'le résultat',
          libList: 'la liste d’ingrédients', libResultLabel: 'Case du résultat',
          libCount: (n, v) => `${n.toLocaleString('fr')} objets existent en ${v}.`,
          libFound: (n) => `Trouvés : ${n}.`, libNone: 'Aucun objet ne correspond.', libSince: (v) => `Depuis la ${v}`,
          libMissing: (list, v) => `Absent en ${v} : ${list}. Choisissez une version plus récente ou un autre objet.`,
          compBadJson: 'Autres composants : ce n’est pas un objet JSON, ils ont été ignorés.',
          compBadEnch: (line) => `Ligne d’enchantement incomprise : « ${line} ».` },
    de: { copied: 'Kopiert', empty: 'Fülle zuerst das Raster oder die Zutatenliste.',
          shaped: (n) => `${n} verschiedene Zutat(en) im Raster.`,
          list: (n) => `${n} Zutat(en).`,
          libTarget: 'Das nächste Item kommt in:', libSlot: (n) => `Feld ${n}`, libResult: 'das Ergebnis',
          libList: 'die Zutatenliste', libResultLabel: 'Ergebnisfeld',
          libCount: (n, v) => `In ${v} gibt es ${n.toLocaleString('de')} Items.`,
          libFound: (n) => `Gefunden: ${n}.`, libNone: 'Kein Item passt.', libSince: (v) => `Seit ${v}`,
          libMissing: (list, v) => `Nicht in ${v}: ${list}. Wähle eine neuere Version oder ein anderes Item.`,
          compBadJson: 'Weitere Komponenten: kein JSON-Objekt, daher weggelassen.',
          compBadEnch: (line) => `Verzauberungszeile nicht verstanden: „${line}“.` }
  };
  const t = T[LOCALE] || T.en;

  const COOKING = ['minecraft:smelting', 'minecraft:blasting', 'minecraft:smoking', 'minecraft:campfire_cooking'];
  const KEY_CHARS = '#XABCDEFG';

  function currentFormat() {
    const v = VERSIONS.find((x) => x.id === $('rc-version').value);
    return v ? v.format : 61;
  }

  function namespacedItem(value) {
    const raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!raw) return '';
    if (raw.startsWith('#')) {
      const tag = raw.slice(1);
      return '#' + (tag.includes(':') ? tag : 'minecraft:' + tag);
    }
    return raw.includes(':') ? raw : 'minecraft:' + raw;
  }

  /** An ingredient is a bare id from 1.21.2 on, and {"item": id} before that. */
  function ingredient(id, fmt) {
    return fmt >= 57 ? id : { item: id };
  }

  /**
   * Crafting results became {"id": ...} in 1.20.5; before that they were
   * {"item": ...}. Cooking and stonecutting results were a plain id string
   * before 1.20.5 and are an object from then on.
   */
  function craftingResult(id, count, fmt, components) {
    if (fmt < 41) return { item: id, count: count };
    const result = { id: id, count: count };
    if (components) result.components = components;
    return result;
  }
  function cookingResult(id, fmt, components) {
    if (fmt < 41) return id;
    return components ? { id: id, components: components } : { id: id };
  }

  /**
   * Components on the result item (1.20.5+). Text was a JSON string until 1.21.4 and a text
   * component from 1.21.5 (format 71), and enchantments lost their "levels" wrapper there too.
   * Returns { components, problems }; components is null when nothing is set.
   */
  function resultComponents(fmt, resultId) {
    const problems = [];
    if (fmt < 41) return { components: null, problems };
    const components = {};
    const text = (value, extra) => {
      const component = Object.assign({ text: value }, extra || {});
      if (fmt >= 71) return extra ? component : value;
      return JSON.stringify(component);
    };

    const name = String($('rc-name').value || '').trim();
    if (name) components['minecraft:item_name'] = text(name);

    const lore = String($('rc-lore').value || '').split('\n').map((line) => line.trim()).filter(Boolean);
    if (lore.length) components['minecraft:lore'] = lore.map((line) => text(line, { color: 'gray', italic: false }));

    const levels = {};
    String($('rc-enchantments').value || '').split('\n').map((line) => line.trim()).filter(Boolean).forEach((line) => {
      // "sharpness 5", "minecraft:sharpness=5" or just "mending" (level 1).
      const match = line.toLowerCase().match(/^(\S+?)(?:\s*[\s=*]\s*(\d+))?$/);
      if (!match || !/^[a-z0-9_.-]+(:[a-z0-9_./-]+)?$/.test(match[1])) { problems.push(t.compBadEnch(line)); return; }
      const id = match[1].includes(':') ? match[1] : 'minecraft:' + match[1];
      levels[id] = Math.max(1, Math.min(255, Number(match[2]) || 1));
    });
    if (Object.keys(levels).length) components['minecraft:enchantments'] = fmt >= 71 ? levels : { levels: levels };

    if ($('rc-unbreakable').checked) components['minecraft:unbreakable'] = {};

    if (resultId === 'minecraft:light') {
      const level = Number($('rc-light-level').value);
      if (Number.isInteger(level) && level >= 0 && level < 15) components['minecraft:block_state'] = { level: String(level) };
    }

    const extraText = String($('rc-extra').value || '').trim();
    if (extraText) {
      let extra = null;
      try { extra = JSON.parse(extraText); } catch (error) { extra = null; }
      if (extra && typeof extra === 'object' && !Array.isArray(extra)) {
        Object.keys(extra).forEach((key) => {
          const full = key.includes(':') ? key : (key.startsWith('!') ? '!minecraft:' + key.slice(1) : 'minecraft:' + key);
          components[full] = extra[key];
        });
      } else {
        problems.push(t.compBadJson);
      }
    }
    return { components: Object.keys(components).length ? components : null, problems };
  }

  function gridItems() {
    return Array.from({ length: 9 }, (_, i) => namespacedItem($('rc-cell-' + i).value));
  }

  /**
   * Turn the 3x3 grid into a pattern plus key map, trimming empty edge rows
   * and columns the way vanilla recipes do -- a recipe padded with blank
   * rows still works, but it will not match a smaller crafting grid.
   */
  function buildShaped(fmt) {
    const cells = gridItems();
    const rows = [0, 1, 2].map((r) => cells.slice(r * 3, r * 3 + 3));

    let top = 0, bottom = 2, left = 0, right = 2;
    while (top <= bottom && rows[top].every((c) => !c)) top++;
    while (bottom >= top && rows[bottom].every((c) => !c)) bottom--;
    while (left <= right && rows.every((row) => !row[left])) left++;
    while (right >= left && rows.every((row) => !row[right])) right--;

    if (top > bottom || left > right) return null;

    const distinct = [];
    const keyOf = new Map();
    for (let r = top; r <= bottom; r++) {
      for (let c = left; c <= right; c++) {
        const item = rows[r][c];
        if (item && !keyOf.has(item)) {
          keyOf.set(item, KEY_CHARS[distinct.length] || String.fromCharCode(73 + distinct.length));
          distinct.push(item);
        }
      }
    }

    const pattern = [];
    for (let r = top; r <= bottom; r++) {
      let line = '';
      for (let c = left; c <= right; c++) {
        const item = rows[r][c];
        line += item ? keyOf.get(item) : ' ';
      }
      pattern.push(line);
    }

    const key = {};
    keyOf.forEach((char, item) => { key[char] = ingredient(item, fmt); });
    return { pattern, key, count: distinct.length };
  }

  function listIngredients() {
    return String($('rc-ingredients').value || '')
      .split(/[\n,]+/)
      .map((line) => namespacedItem(line))
      .filter(Boolean);
  }

  function buildRecipe() {
    const fmt = currentFormat();
    const type = $('rc-type').value;
    const resultId = namespacedItem($('rc-result').value) || 'minecraft:stone';
    const resultCount = Math.max(1, Math.min(64, Number($('rc-result-count').value) || 1));
    const category = $('rc-category').value;
    const extras = resultComponents(fmt, resultId);
    const components = extras.components;
    const problems = extras.problems;
    const note = (text) => [text].concat(problems).join(' ');

    if (type === 'minecraft:crafting_shaped') {
      const shaped = buildShaped(fmt);
      if (!shaped) return { json: null, note: t.empty };
      const recipe = { type: type };
      if (category) recipe.category = category;
      recipe.pattern = shaped.pattern;
      recipe.key = shaped.key;
      recipe.result = craftingResult(resultId, resultCount, fmt, components);
      return { json: recipe, note: note(t.shaped(shaped.count)) };
    }

    if (type === 'minecraft:crafting_shapeless') {
      const items = listIngredients();
      if (!items.length) return { json: null, note: t.empty };
      const recipe = { type: type };
      if (category) recipe.category = category;
      recipe.ingredients = items.map((id) => ingredient(id, fmt));
      recipe.result = craftingResult(resultId, resultCount, fmt, components);
      return { json: recipe, note: note(t.list(items.length)) };
    }

    if (COOKING.includes(type)) {
      const items = listIngredients();
      if (!items.length) return { json: null, note: t.empty };
      const recipe = { type: type };
      if (category) recipe.category = category;
      recipe.ingredient = ingredient(items[0], fmt);
      recipe.result = cookingResult(resultId, fmt, components);
      const xp = Number($('rc-experience').value);
      if (Number.isFinite(xp) && xp > 0) recipe.experience = xp;
      const time = Number($('rc-cookingtime').value);
      if (Number.isFinite(time) && time > 0) recipe.cookingtime = Math.round(time);
      return { json: recipe, note: note(t.list(1)) };
    }

    // stonecutting
    const items = listIngredients();
    if (!items.length) return { json: null, note: t.empty };
    const recipe = { type: type, ingredient: ingredient(items[0], fmt) };
    recipe.result = fmt >= 41
      ? craftingResult(resultId, resultCount, fmt, components)
      : resultId;
    if (fmt < 41) recipe.count = resultCount;
    return { json: recipe, note: note(t.list(1)) };
  }

  function filePath() {
    const ns = String($('rc-namespace').value || 'harbor').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_') || 'harbor';
    const file = String($('rc-file').value || 'recipe').trim().toLowerCase().replace(/[^a-z0-9_/.-]/g, '_') || 'recipe';
    // 1.21 (data pack format 48) renamed recipes/ to recipe/.
    return `data/${ns}/${currentFormat() >= 48 ? 'recipe' : 'recipes'}/${file}.json`;
  }

  /** Show only the controls the selected recipe type actually uses. */
  function syncVisibility() {
    const type = $('rc-type').value;
    const isShaped = type === 'minecraft:crafting_shaped';
    const isCooking = COOKING.includes(type);
    const isStonecutting = type === 'minecraft:stonecutting';

    $('rc-grid-panel').hidden = !isShaped;
    $('rc-list-panel').hidden = isShaped;
    $('rc-cooking-fields').hidden = !isCooking;
    $('rc-category-field').hidden = isStonecutting;
    $('rc-result-count-field').hidden = isCooking;
    // Result components exist from 1.20.5; the light level only matters for the light block.
    const withComponents = currentFormat() >= 41;
    $('rc-components-fields').hidden = !withComponents;
    $('rc-components-off').hidden = withComponents;
    $('rc-light-field').hidden = namespacedItem($('rc-result').value) !== 'minecraft:light';
    $('rc-list-label').textContent = (isCooking || isStonecutting)
      ? $('rc-list-panel').dataset.singleLabel
      : $('rc-list-panel').dataset.multiLabel;
  }

  /** Short slot caption: "minecraft:iron_ingot" -> "iron ingot". */
  function shortLabel(value) {
    const id = String(value || '').trim();
    if (!id) return '';
    return id.replace(/^#/, '').split(':').pop().replace(/_/g, ' ');
  }

  // ---- Item library ------------------------------------------------------------------------
  // Every 26.3 item with its icon, from assets/recipe-items.js (and recipe-items-<lang>.js for
  // local names). Icons load from the texture mirror; a failed icon falls back to a letter.
  const LIB = window.RECIPE_ITEM_LIBRARY || null;
  const LOCAL_NAMES = window.RECIPE_ITEM_NAMES || {};
  const library = LIB ? LIB.items.map(([id, tex, since, en]) => {
    const local = LOCAL_NAMES[id] || '';
    return { id, tex, since, en, name: local || en,
      search: [id.replace(/_/g, ' '), en, local].join(' ').toLowerCase() };
  }) : [];
  const libraryById = new Map(library.map((entry) => [entry.id, entry]));
  let target = { kind: 'cell', index: 0 };

  function libraryEntry(value) {
    const id = namespacedItem(value);
    if (!id || id.startsWith('#') || !id.startsWith('minecraft:')) return null;
    return libraryById.get(id.slice(10)) || null;
  }

  function versionIndex() {
    if (!LIB) return Infinity;
    const index = LIB.versions.indexOf($('rc-version').value);
    return index < 0 ? LIB.versions.length - 1 : index;
  }

  function versionLabel() {
    const option = $('rc-version').selectedOptions[0];
    return option ? option.textContent.trim() : $('rc-version').value;
  }

  function texturePath(entry) {
    if (entry.tex === '') return 'item/' + entry.id;
    if (entry.tex === '=') return 'block/' + entry.id;
    return entry.tex;
  }

  function fallbackIcon(entry, size) {
    const span = document.createElement('span');
    span.className = 'rc-icon rc-icon-fallback';
    span.style.width = span.style.height = size + 'px';
    span.textContent = (entry.name || entry.id).charAt(0).toUpperCase();
    return span;
  }

  /** An icon element for a library entry, `size` px on its longer side. */
  function itemIcon(entry, size, lazy) {
    if (!LIB || entry.tex === '-') return fallbackIcon(entry, size);
    if (entry.tex && typeof entry.tex === 'object') {
      // Entity-drawn items (heads, chests, banners, the shield): one face cropped from the entity texture.
      const [x, y, w, h] = entry.tex.c;
      const [tw, th] = entry.tex.s;
      const scale = size / Math.max(w, h);
      const span = document.createElement('span');
      span.className = 'rc-icon rc-icon-crop';
      span.style.width = Math.round(w * scale) + 'px';
      span.style.height = Math.round(h * scale) + 'px';
      span.style.backgroundImage = `url("${LIB.textureBase}${entry.tex.p}.png")`;
      span.style.backgroundSize = `${tw * scale}px ${th * scale}px`;
      span.style.backgroundPosition = `${-x * scale}px ${-y * scale}px`;
      if (entry.tex.t) {
        span.style.backgroundColor = entry.tex.t;
        span.style.backgroundBlendMode = 'multiply';
      }
      return span;
    }
    const img = document.createElement('img');
    img.className = 'rc-icon';
    img.width = size;
    img.height = size;
    img.alt = '';
    img.decoding = 'async';
    img.referrerPolicy = 'no-referrer';
    if (lazy) img.loading = 'lazy';
    img.addEventListener('error', () => img.replaceWith(fallbackIcon(entry, size)), { once: true });
    img.src = LIB.textureBase + texturePath(entry) + '.png';
    return img;
  }

  /** Draw (or clear) the icon inside a slot when its item changes. */
  function setSlotIcon(slot, entry, size) {
    const id = entry ? entry.id : '';
    if (slot.dataset.iconId === id) return;
    slot.dataset.iconId = id;
    const old = slot.querySelector(':scope > .rc-slot-icon');
    if (old) old.remove();
    slot.classList.toggle('has-icon', Boolean(entry));
    if (!entry) return;
    const holder = document.createElement('span');
    holder.className = 'rc-slot-icon';
    holder.setAttribute('aria-hidden', 'true');
    holder.append(itemIcon(entry, size, false));
    slot.prepend(holder);
  }

  /** Icons under the ingredient list for the recipe types that use it. */
  function paintListIcons() {
    const strip = $('rc-list-icons');
    if (!strip) return;
    const key = listIngredients().join('|');
    if (strip.dataset.key === key) return;
    strip.dataset.key = key;
    strip.replaceChildren();
    listIngredients().forEach((id) => {
      const entry = libraryEntry(id);
      const cell = document.createElement('span');
      cell.className = 'rc-list-icon';
      cell.title = entry ? `${entry.name} (${id})` : id;
      if (entry) cell.append(itemIcon(entry, 32, false));
      else cell.textContent = shortLabel(id).charAt(0).toUpperCase() || '?';
      strip.append(cell);
    });
  }

  function targetLabel() {
    if (target.kind === 'cell') return t.libSlot(target.index + 1);
    return target.kind === 'result' ? t.libResult : t.libList;
  }

  function paintTarget() {
    document.querySelectorAll('.craft-slot.is-target, .rc-list-field.is-target').forEach((el) => el.classList.remove('is-target'));
    let el = null;
    if (target.kind === 'cell') el = $('rc-cell-' + target.index)?.parentElement;
    else if (target.kind === 'result') el = $('rc-result-preview');
    else el = $('rc-ingredients')?.closest('.tool-field');
    if (el) el.classList.add('is-target', target.kind === 'list' ? 'rc-list-field' : 'craft-slot');
    const label = $('rc-lib-target');
    if (label) {
      label.replaceChildren(t.libTarget + ' ');
      const strong = document.createElement('strong');
      strong.textContent = targetLabel();
      label.append(strong);
    }
  }

  function setTarget(next) {
    target = next;
    paintTarget();
  }

  /** Keep the target on something visible when the recipe type changes. */
  function fitTarget() {
    const shaped = $('rc-type').value === 'minecraft:crafting_shaped';
    if (shaped && target.kind === 'list') setTarget({ kind: 'cell', index: 0 });
    else if (!shaped && target.kind === 'cell') setTarget({ kind: 'list' });
  }

  function placeItem(entry, where, advance) {
    const id = 'minecraft:' + entry.id;
    if (where.kind === 'cell') {
      $('rc-cell-' + where.index).value = id;
      if (advance && where.index < 8) setTarget({ kind: 'cell', index: where.index + 1 });
    } else if (where.kind === 'result') {
      $('rc-result').value = id;
    } else {
      const field = $('rc-ingredients');
      const single = $('rc-type').value !== 'minecraft:crafting_shapeless';
      const lines = listIngredients();
      field.value = single ? id : lines.concat(id).slice(0, 9).join('\n');
    }
    update();
  }

  const libGrid = $('rc-lib-grid');
  const libButtons = [];
  const tooltip = document.createElement('div');

  function showTooltip(entry, event) {
    tooltip.replaceChildren();
    const title = document.createElement('div');
    title.className = 'tt-title';
    title.textContent = entry.name;
    const idLine = document.createElement('div');
    idLine.className = 'tt-id';
    idLine.textContent = 'minecraft:' + entry.id;
    tooltip.append(title, idLine);
    if (entry.since > 0) {
      const since = document.createElement('div');
      since.className = 'tt-since';
      since.textContent = t.libSince(LIB.versions[entry.since]);
      tooltip.append(since);
    }
    tooltip.style.display = 'flex';
    moveTooltip(event);
  }

  function moveTooltip(event) {
    if (tooltip.style.display !== 'flex') return;
    const box = tooltip.getBoundingClientRect();
    const x = Math.min(event.clientX + 14, window.innerWidth - box.width - 8);
    const y = Math.min(event.clientY + 14, window.innerHeight - box.height - 8);
    tooltip.style.left = Math.max(8, x) + 'px';
    tooltip.style.top = Math.max(8, y) + 'px';
  }

  function hideTooltip() {
    tooltip.style.display = 'none';
  }

  function visibleButtons() {
    return libButtons.filter((button) => !button.hidden);
  }

  /** One tab stop for the whole grid; arrow keys move inside it. */
  function setRovingFocus(button, focus) {
    libButtons.forEach((b) => { b.tabIndex = -1; });
    if (!button) return;
    button.tabIndex = 0;
    if (focus) button.focus();
  }

  function filterLibrary() {
    if (!libGrid) return;
    const query = ($('rc-lib-search').value || '').trim().toLowerCase().replace(/_/g, ' ');
    const max = versionIndex();
    let shown = 0;
    libButtons.forEach((button) => {
      const entry = libraryById.get(button.dataset.id);
      const visible = entry.since <= max && (!query || entry.search.includes(query));
      button.hidden = !visible;
      if (visible) shown += 1;
    });
    const first = visibleButtons()[0];
    if (!libButtons.some((b) => b.tabIndex === 0 && !b.hidden)) setRovingFocus(first, false);
    $('rc-lib-status').textContent = query ? (shown ? t.libFound(shown) : t.libNone) : t.libCount(shown, versionLabel());
  }

  function buildLibrary() {
    if (!libGrid || !library.length) {
      const panel = $('rc-library');
      if (panel) panel.hidden = true;
      return;
    }
    tooltip.className = 'mc-tooltip';
    document.body.append(tooltip);
    const fragment = document.createDocumentFragment();
    library.forEach((entry) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'gallery-item rc-lib-item';
      button.dataset.id = entry.id;
      button.draggable = true;
      button.tabIndex = -1;
      button.setAttribute('aria-label', entry.name);
      button.append(itemIcon(entry, 32, true));
      libButtons.push(button);
      fragment.append(button);
    });
    libGrid.append(fragment);

    libGrid.addEventListener('click', (event) => {
      const button = event.target.closest('.rc-lib-item');
      if (!button) return;
      setRovingFocus(button, false);
      placeItem(libraryById.get(button.dataset.id), target, true);
    });
    libGrid.addEventListener('pointerover', (event) => {
      const button = event.target.closest('.rc-lib-item');
      if (button && event.pointerType === 'mouse') showTooltip(libraryById.get(button.dataset.id), event);
    });
    libGrid.addEventListener('pointermove', moveTooltip);
    libGrid.addEventListener('pointerleave', hideTooltip);
    libGrid.addEventListener('scroll', hideTooltip, { passive: true });
    libGrid.addEventListener('dragstart', (event) => {
      const button = event.target.closest('.rc-lib-item');
      if (!button) return;
      hideTooltip();
      event.dataTransfer.setData('application/x-cube-item', button.dataset.id);
      event.dataTransfer.setData('text/plain', 'minecraft:' + button.dataset.id);
      event.dataTransfer.effectAllowed = 'copy';
    });
    libGrid.addEventListener('keydown', (event) => {
      const list = visibleButtons();
      const index = list.indexOf(document.activeElement);
      if (index < 0) return;
      const columns = list.filter((b) => b.offsetTop === list[0].offsetTop).length || 1;
      const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: columns, ArrowUp: -columns };
      let next = null;
      if (event.key in moves) next = list[Math.max(0, Math.min(list.length - 1, index + moves[event.key]))];
      else if (event.key === 'Home') next = list[0];
      else if (event.key === 'End') next = list[list.length - 1];
      if (!next) return;
      event.preventDefault();
      setRovingFocus(next, true);
    });

    const search = $('rc-lib-search');
    search.addEventListener('input', filterLibrary);
    search.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        const first = visibleButtons()[0];
        if (first) placeItem(libraryById.get(first.dataset.id), target, true);
      } else if (event.key === 'ArrowDown') {
        const first = visibleButtons()[0];
        if (first) { event.preventDefault(); setRovingFocus(first, true); }
      }
    });

    // Where the next item goes: the slot, result or list the user last touched.
    for (let i = 0; i < 9; i++) {
      $('rc-cell-' + i).addEventListener('focus', () => setTarget({ kind: 'cell', index: i }));
    }
    $('rc-result').addEventListener('focus', () => setTarget({ kind: 'result' }));
    $('rc-ingredients').addEventListener('focus', () => setTarget({ kind: 'list' }));
    const preview = $('rc-result-preview');
    preview.tabIndex = 0;
    preview.setAttribute('role', 'button');
    preview.setAttribute('aria-label', t.libResultLabel);
    preview.addEventListener('click', () => setTarget({ kind: 'result' }));
    preview.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setTarget({ kind: 'result' });
      }
    });

    // Drops: library items onto a slot, the result or the ingredient list.
    const dropTargets = [];
    for (let i = 0; i < 9; i++) dropTargets.push([$('rc-cell-' + i).parentElement, { kind: 'cell', index: i }]);
    dropTargets.push([preview, { kind: 'result' }]);
    dropTargets.push([$('rc-ingredients').closest('.tool-field'), { kind: 'list' }]);
    dropTargets.forEach(([el, where]) => {
      el.addEventListener('dragover', (event) => {
        if (!event.dataTransfer.types.includes('application/x-cube-item')) return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        el.classList.add('is-drop');
      });
      el.addEventListener('dragleave', () => el.classList.remove('is-drop'));
      el.addEventListener('drop', (event) => {
        const id = event.dataTransfer.getData('application/x-cube-item');
        el.classList.remove('is-drop');
        if (!id || !libraryById.has(id)) return;
        event.preventDefault();
        placeItem(libraryById.get(id), where, false);
      });
    });

    paintTarget();
  }

  /** Items in the recipe that the chosen version does not have yet. */
  function missingInVersion() {
    if (!LIB) return '';
    const max = versionIndex();
    const type = $('rc-type').value;
    const used = (type === 'minecraft:crafting_shaped' ? gridItems() : listIngredients()).concat(namespacedItem($('rc-result').value));
    const missing = [];
    used.forEach((value) => {
      const entry = libraryEntry(value);
      if (entry && entry.since > max && !missing.includes(entry.name)) missing.push(entry.name);
    });
    return missing.length ? t.libMissing(missing.join(', '), versionLabel()) : '';
  }

  /** Reflect what is typed into the grid onto the crafting-table visual. */
  function paintGrid() {
    for (let i = 0; i < 9; i++) {
      const input = $('rc-cell-' + i);
      if (!input) continue;
      const slot = input.parentElement;
      const label = shortLabel(input.value);
      const entry = libraryEntry(input.value);
      slot.classList.toggle('is-filled', Boolean(label));
      slot.dataset.label = label;
      input.title = entry ? `${entry.name} (${input.value.trim()})` : input.value.trim();
      setSlotIcon(slot, entry, 48);
    }
    const preview = $('rc-result-preview');
    if (!preview) return;
    const label = shortLabel($('rc-result').value);
    const entry = libraryEntry($('rc-result').value);
    preview.dataset.label = label;
    preview.title = entry ? entry.name : label;
    preview.classList.toggle('is-filled', Boolean(label));
    setSlotIcon(preview, entry, 56);
    const count = Math.max(1, Math.min(64, Number($('rc-result-count').value) || 1));
    preview.dataset.count = count > 1 ? String(count) : '';
  }

  function update() {
    syncVisibility();
    fitTarget();
    paintGrid();
    paintListIcons();
    filterLibrary();
    const built = buildRecipe();
    $('rc-output').value = built.json ? JSON.stringify(built.json, null, 2) : '';
    $('rc-summary').textContent = [built.note, missingInVersion()].filter(Boolean).join(' ');
    $('rc-path').textContent = filePath();
  }

  const PRESETS = {
    shaped: () => {
      $('rc-type').value = 'minecraft:crafting_shaped';
      const cells = ['', 'minecraft:iron_ingot', '', 'minecraft:iron_ingot', 'minecraft:diamond', 'minecraft:iron_ingot', '', 'minecraft:iron_ingot', ''];
      cells.forEach((v, i) => { $('rc-cell-' + i).value = v; });
      $('rc-result').value = 'minecraft:diamond_block';
      $('rc-result-count').value = 1;
      $('rc-file').value = 'reinforced_block';
    },
    shapeless: () => {
      $('rc-type').value = 'minecraft:crafting_shapeless';
      $('rc-ingredients').value = 'minecraft:paper\nminecraft:ink_sac';
      $('rc-result').value = 'minecraft:written_book';
      $('rc-result-count').value = 1;
      $('rc-file').value = 'quick_note';
    },
    smelting: () => {
      $('rc-type').value = 'minecraft:smelting';
      $('rc-ingredients').value = 'minecraft:cobblestone';
      $('rc-result').value = 'minecraft:stone';
      $('rc-experience').value = '0.1';
      $('rc-cookingtime').value = '200';
      $('rc-file').value = 'harbor_smelt';
    }
  };

  const versionSelect = $('rc-version');
  VERSIONS.forEach((v) => {
    const option = document.createElement('option');
    option.value = v.id;
    option.textContent = v.label;
    versionSelect.appendChild(option);
  });
  versionSelect.value = '1.21.4';

  root.addEventListener('input', update);
  root.addEventListener('change', update);

  document.querySelectorAll('[data-rc-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      (PRESETS[button.dataset.rcPreset] || PRESETS.shaped)();
      update();
      track('tool_example_load');
    });
  });

  $('rc-clear-grid').addEventListener('click', () => {
    for (let i = 0; i < 9; i++) $('rc-cell-' + i).value = '';
    update();
  });

  $('rc-copy').addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText($('rc-output').value);
      track('tool_copy', { output_kind: 'json', mc_version: $('rc-version').value });
      const button = event.currentTarget;
      const label = button.textContent;
      button.textContent = t.copied;
      setTimeout(() => { button.textContent = label; }, 1200);
    } catch (error) {
      /* clipboard blocked; the textarea stays selectable */
    }
  });

  $('rc-download').addEventListener('click', () => {
    if (!$('rc-output').value) return;
    const blob = new Blob([$('rc-output').value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (String($('rc-file').value || 'recipe').trim() || 'recipe') + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    track('tool_download', { file_kind: 'json', mc_version: $('rc-version').value });
  });

  buildLibrary();
  PRESETS.shaped();
  update();
})();
