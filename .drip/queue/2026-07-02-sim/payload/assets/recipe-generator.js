(() => {
  const root = document.querySelector('[data-recipe-generator]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);

  // Data pack format per version, used only to decide which JSON shape to
  // emit. Recipe JSON changed twice: 1.20.5 renamed the crafting result's
  // "item" to "id" and turned cooking results into objects, and 1.21.2 let
  // ingredients be bare id strings instead of {"item": id}.
  const VERSIONS = [
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
  const T = {
    en: { copied: 'Copied', empty: 'Fill the grid or ingredient list first.',
          shaped: (n) => `${n} distinct ingredient(s) in the grid.`,
          list: (n) => `${n} ingredient(s).` },
    ru: { copied: 'Скопировано', empty: 'Сначала заполните сетку или список ингредиентов.',
          shaped: (n) => `Разных ингредиентов в сетке: ${n}.`,
          list: (n) => `Ингредиентов: ${n}.` },
    fr: { copied: 'Copié', empty: 'Remplissez d’abord la grille ou la liste.',
          shaped: (n) => `${n} ingrédient(s) distinct(s) dans la grille.`,
          list: (n) => `${n} ingrédient(s).` },
    de: { copied: 'Kopiert', empty: 'Fülle zuerst das Raster oder die Zutatenliste.',
          shaped: (n) => `${n} verschiedene Zutat(en) im Raster.`,
          list: (n) => `${n} Zutat(en).` }
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
  function craftingResult(id, count, fmt) {
    return fmt >= 41 ? { id: id, count: count } : { item: id, count: count };
  }
  function cookingResult(id, fmt) {
    return fmt >= 41 ? { id: id } : id;
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

    if (type === 'minecraft:crafting_shaped') {
      const shaped = buildShaped(fmt);
      if (!shaped) return { json: null, note: t.empty };
      const recipe = { type: type };
      if (category) recipe.category = category;
      recipe.pattern = shaped.pattern;
      recipe.key = shaped.key;
      recipe.result = craftingResult(resultId, resultCount, fmt);
      return { json: recipe, note: t.shaped(shaped.count) };
    }

    if (type === 'minecraft:crafting_shapeless') {
      const items = listIngredients();
      if (!items.length) return { json: null, note: t.empty };
      const recipe = { type: type };
      if (category) recipe.category = category;
      recipe.ingredients = items.map((id) => ingredient(id, fmt));
      recipe.result = craftingResult(resultId, resultCount, fmt);
      return { json: recipe, note: t.list(items.length) };
    }

    if (COOKING.includes(type)) {
      const items = listIngredients();
      if (!items.length) return { json: null, note: t.empty };
      const recipe = { type: type };
      if (category) recipe.category = category;
      recipe.ingredient = ingredient(items[0], fmt);
      recipe.result = cookingResult(resultId, fmt);
      const xp = Number($('rc-experience').value);
      if (Number.isFinite(xp) && xp > 0) recipe.experience = xp;
      const time = Number($('rc-cookingtime').value);
      if (Number.isFinite(time) && time > 0) recipe.cookingtime = Math.round(time);
      return { json: recipe, note: t.list(1) };
    }

    // stonecutting
    const items = listIngredients();
    if (!items.length) return { json: null, note: t.empty };
    const recipe = { type: type, ingredient: ingredient(items[0], fmt) };
    recipe.result = fmt >= 41
      ? { id: resultId, count: resultCount }
      : resultId;
    if (fmt < 41) recipe.count = resultCount;
    return { json: recipe, note: t.list(1) };
  }

  function filePath() {
    const ns = String($('rc-namespace').value || 'harbor').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_') || 'harbor';
    const file = String($('rc-file').value || 'recipe').trim().toLowerCase().replace(/[^a-z0-9_/.-]/g, '_') || 'recipe';
    // 1.21 renamed recipes/ to recipe/; this targets 1.21+ layouts.
    return `data/${ns}/recipe/${file}.json`;
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
    $('rc-list-label').textContent = (isCooking || isStonecutting)
      ? $('rc-list-panel').dataset.singleLabel
      : $('rc-list-panel').dataset.multiLabel;
  }

  function update() {
    syncVisibility();
    const built = buildRecipe();
    $('rc-output').value = built.json ? JSON.stringify(built.json, null, 2) : '';
    $('rc-summary').textContent = built.note;
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
    });
  });

  $('rc-clear-grid').addEventListener('click', () => {
    for (let i = 0; i < 9; i++) $('rc-cell-' + i).value = '';
    update();
  });

  $('rc-copy').addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText($('rc-output').value);
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
  });

  PRESETS.shaped();
  update();
})();
