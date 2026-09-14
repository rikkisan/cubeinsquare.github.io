(() => {
  const root = document.querySelector('[data-enchant-randomizer]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);

  const LOCALE = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: { copied: 'Copied', empty: 'Enter a base item id first.',
          summary: (e, a) => `${e} enchantment(s), ${a} attribute(s) rolled.` },
    ru: { copied: 'Скопировано', empty: 'Сначала укажите id предмета.',
          summary: (e, a) => `Зачарований: ${e}, атрибутов: ${a}.` },
    fr: { copied: 'Copié', empty: 'Indiquez d’abord un id d’objet de base.',
          summary: (e, a) => `${e} enchantement(s), ${a} attribut(s) tirés.` },
    de: { copied: 'Kopiert', empty: 'Zuerst eine Basis-Item-ID eingeben.',
          summary: (e, a) => `${e} Verzauberung(en), ${a} Attribut(e) gewürfelt.` }
  };
  const t = T[LOCALE] || T.en;

  /**
   * Vanilla enchantment table, trimmed to what a /give or loot table can
   * actually apply. `conflicts` lists ids this cannot roll alongside, per the
   * vanilla incompatibility groups (see /wiki-enchantment-conflicts/).
   */
  const ENCHANTMENTS = [
    { id: 'protection', maxLevel: 4, treasure: false, weight: 10, categories: ['armor_head', 'armor_chest', 'armor_legs', 'armor_feet'], conflicts: ['fire_protection', 'blast_protection', 'projectile_protection'] },
    { id: 'fire_protection', maxLevel: 4, treasure: false, weight: 5, categories: ['armor_head', 'armor_chest', 'armor_legs', 'armor_feet'], conflicts: ['protection', 'blast_protection', 'projectile_protection'] },
    { id: 'blast_protection', maxLevel: 4, treasure: false, weight: 2, categories: ['armor_head', 'armor_chest', 'armor_legs', 'armor_feet'], conflicts: ['protection', 'fire_protection', 'projectile_protection'] },
    { id: 'projectile_protection', maxLevel: 4, treasure: false, weight: 5, categories: ['armor_head', 'armor_chest', 'armor_legs', 'armor_feet'], conflicts: ['protection', 'fire_protection', 'blast_protection'] },
    { id: 'feather_falling', maxLevel: 4, treasure: false, weight: 5, categories: ['armor_feet'], conflicts: [] },
    { id: 'respiration', maxLevel: 3, treasure: false, weight: 2, categories: ['armor_head'], conflicts: [] },
    { id: 'aqua_affinity', maxLevel: 1, treasure: false, weight: 2, categories: ['armor_head'], conflicts: [] },
    { id: 'thorns', maxLevel: 3, treasure: false, weight: 1, categories: ['armor_chest'], conflicts: [] },
    { id: 'depth_strider', maxLevel: 3, treasure: false, weight: 2, categories: ['armor_feet'], conflicts: ['frost_walker'] },
    { id: 'frost_walker', maxLevel: 2, treasure: true, weight: 2, categories: ['armor_feet'], conflicts: ['depth_strider'] },
    { id: 'soul_speed', maxLevel: 3, treasure: true, weight: 1, categories: ['armor_feet'], conflicts: [] },
    { id: 'swift_sneak', maxLevel: 3, treasure: true, weight: 1, categories: ['armor_legs'], conflicts: [] },
    { id: 'binding_curse', maxLevel: 1, treasure: true, weight: 1, categories: ['armor_head', 'armor_chest', 'armor_legs', 'armor_feet'], conflicts: [] },
    { id: 'sharpness', maxLevel: 5, treasure: false, weight: 10, categories: ['sword'], conflicts: ['smite', 'bane_of_arthropods'] },
    { id: 'smite', maxLevel: 5, treasure: false, weight: 5, categories: ['sword'], conflicts: ['sharpness', 'bane_of_arthropods'] },
    { id: 'bane_of_arthropods', maxLevel: 5, treasure: false, weight: 5, categories: ['sword'], conflicts: ['sharpness', 'smite'] },
    { id: 'knockback', maxLevel: 2, treasure: false, weight: 5, categories: ['sword'], conflicts: [] },
    { id: 'fire_aspect', maxLevel: 2, treasure: false, weight: 2, categories: ['sword'], conflicts: [] },
    { id: 'looting', maxLevel: 3, treasure: false, weight: 2, categories: ['sword'], conflicts: [] },
    { id: 'sweeping_edge', maxLevel: 3, treasure: false, weight: 2, categories: ['sword'], conflicts: [] },
    { id: 'efficiency', maxLevel: 5, treasure: false, weight: 10, categories: ['tool'], conflicts: [] },
    { id: 'silk_touch', maxLevel: 1, treasure: false, weight: 1, categories: ['tool'], conflicts: ['fortune'] },
    { id: 'fortune', maxLevel: 3, treasure: false, weight: 2, categories: ['tool'], conflicts: ['silk_touch'] },
    { id: 'power', maxLevel: 5, treasure: false, weight: 10, categories: ['bow'], conflicts: [] },
    { id: 'punch', maxLevel: 2, treasure: false, weight: 5, categories: ['bow'], conflicts: [] },
    { id: 'flame', maxLevel: 1, treasure: false, weight: 2, categories: ['bow'], conflicts: [] },
    { id: 'infinity', maxLevel: 1, treasure: false, weight: 1, categories: ['bow'], conflicts: [] },
    { id: 'multishot', maxLevel: 1, treasure: false, weight: 2, categories: ['crossbow'], conflicts: ['piercing'] },
    { id: 'piercing', maxLevel: 4, treasure: false, weight: 10, categories: ['crossbow'], conflicts: ['multishot'] },
    { id: 'quick_charge', maxLevel: 3, treasure: false, weight: 5, categories: ['crossbow'], conflicts: [] },
    { id: 'loyalty', maxLevel: 3, treasure: false, weight: 10, categories: ['trident'], conflicts: ['riptide'] },
    { id: 'riptide', maxLevel: 3, treasure: false, weight: 2, categories: ['trident'], conflicts: ['loyalty', 'channeling'] },
    { id: 'channeling', maxLevel: 1, treasure: true, weight: 1, categories: ['trident'], conflicts: ['riptide'] },
    { id: 'impaling', maxLevel: 5, treasure: false, weight: 5, categories: ['trident'], conflicts: [] },
    { id: 'luck_of_the_sea', maxLevel: 3, treasure: false, weight: 2, categories: ['fishing_rod'], conflicts: [] },
    { id: 'lure', maxLevel: 3, treasure: false, weight: 2, categories: ['fishing_rod'], conflicts: [] },
    { id: 'unbreaking', maxLevel: 3, treasure: false, weight: 5, categories: ['sword', 'tool', 'bow', 'crossbow', 'trident', 'fishing_rod', 'armor_head', 'armor_chest', 'armor_legs', 'armor_feet'], conflicts: [] },
    { id: 'mending', maxLevel: 1, treasure: true, weight: 2, categories: ['sword', 'tool', 'bow', 'crossbow', 'trident', 'fishing_rod', 'armor_head', 'armor_chest', 'armor_legs', 'armor_feet'], conflicts: [] },
    { id: 'curse_of_vanishing', maxLevel: 1, treasure: true, weight: 1, categories: ['sword', 'tool', 'bow', 'crossbow', 'trident', 'fishing_rod', 'armor_head', 'armor_chest', 'armor_legs', 'armor_feet'], conflicts: [] }
  ];

  /** Generic attribute ids, stable since 1.9 and still valid in 1.21.x. */
  const ATTRIBUTES = [
    { id: 'generic.attack_damage', label: 'Attack damage', weight: 10, defaultOperation: 'add_value', range: [1, 8], slots: ['mainhand', 'offhand'] },
    { id: 'generic.attack_speed', label: 'Attack speed', weight: 5, defaultOperation: 'add_value', range: [-1, 1], slots: ['mainhand', 'offhand'] },
    { id: 'generic.max_health', label: 'Max health', weight: 10, defaultOperation: 'add_value', range: [1, 20], slots: ['head', 'chest', 'legs', 'feet', 'mainhand', 'offhand'] },
    { id: 'generic.movement_speed', label: 'Movement speed', weight: 5, defaultOperation: 'add_multiplied_base', range: [0.05, 0.4], slots: ['feet', 'legs', 'chest', 'head'] },
    { id: 'generic.armor', label: 'Armor', weight: 5, defaultOperation: 'add_value', range: [1, 10], slots: ['head', 'chest', 'legs', 'feet'] },
    { id: 'generic.armor_toughness', label: 'Armor toughness', weight: 2, defaultOperation: 'add_value', range: [1, 6], slots: ['head', 'chest', 'legs', 'feet'] },
    { id: 'generic.knockback_resistance', label: 'Knockback resistance', weight: 2, defaultOperation: 'add_value', range: [0.1, 0.6], slots: ['head', 'chest', 'legs', 'feet'] },
    { id: 'generic.luck', label: 'Luck', weight: 1, defaultOperation: 'add_value', range: [1, 4], slots: ['mainhand', 'offhand'] }
  ];

  const CATEGORY_SLOT = {
    armor_head: 'head', armor_chest: 'chest', armor_legs: 'legs', armor_feet: 'feet',
    sword: 'mainhand', tool: 'mainhand', bow: 'mainhand', crossbow: 'mainhand',
    trident: 'mainhand', fishing_rod: 'mainhand', any: 'mainhand'
  };

  let advancedBuilt = false;

  function namespacedItem(value) {
    const raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!raw) return '';
    return raw.includes(':') ? raw : 'minecraft:' + raw;
  }

  function eligibleEnchantments() {
    const category = $('er-category').value;
    return ENCHANTMENTS.filter((e) => category === 'any' || e.categories.includes(category));
  }

  function randomInt(min, max) {
    const lo = Math.min(min, max), hi = Math.max(min, max);
    return Math.round(lo + Math.random() * (hi - lo));
  }

  function randomFloat(min, max) {
    const lo = Math.min(min, max), hi = Math.max(min, max);
    return lo + Math.random() * (hi - lo);
  }

  function weightedPick(pool) {
    const total = pool.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
    if (total <= 0) return null;
    let roll = Math.random() * total;
    for (const item of pool) {
      roll -= Math.max(0, item.weight);
      if (roll <= 0) return item;
    }
    return pool[pool.length - 1];
  }

  /** Advanced-mode weight/lock table rows, rebuilt when the category changes. */
  function buildAdvancedTables() {
    const enchBody = $('er-ench-body');
    const attrBody = $('er-attr-body');
    const list = eligibleEnchantments();

    enchBody.innerHTML = '';
    list.forEach((e) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${e.id}${e.treasure ? ' <span class="status-pill">treasure</span>' : ''}</td>
        <td><input type="number" class="er-weight-input" min="0" max="99" value="${e.weight}" data-er-weight="${e.id}"></td>
        <td><input type="checkbox" class="er-lock-checkbox" data-er-lock="${e.id}"></td>
        <td><input type="number" class="er-value-input" min="1" max="${Math.max(e.maxLevel, 10)}" value="${e.maxLevel}" data-er-value="${e.id}" disabled></td>`;
      enchBody.appendChild(row);
    });

    attrBody.innerHTML = '';
    ATTRIBUTES.forEach((a) => {
      const row = document.createElement('tr');
      const mid = (a.range[0] + a.range[1]) / 2;
      row.innerHTML = `
        <td>${a.label}</td>
        <td><input type="number" class="er-weight-input" min="0" max="99" value="${a.weight}" data-er-aweight="${a.id}"></td>
        <td><input type="checkbox" class="er-lock-checkbox" data-er-alock="${a.id}"></td>
        <td><input type="number" step="0.05" class="er-value-input" value="${Math.round(mid * 100) / 100}" data-er-avalue="${a.id}" disabled></td>`;
      attrBody.appendChild(row);
    });

    enchBody.querySelectorAll('[data-er-lock]').forEach((box) => {
      box.addEventListener('change', () => {
        const input = enchBody.querySelector(`[data-er-value="${box.dataset.erLock}"]`);
        input.disabled = !box.checked;
      });
    });
    attrBody.querySelectorAll('[data-er-alock]').forEach((box) => {
      box.addEventListener('change', () => {
        const input = attrBody.querySelector(`[data-er-avalue="${box.dataset.erAlock}"]`);
        input.disabled = !box.checked;
      });
    });

    advancedBuilt = true;
  }

  /** Roll enchantments respecting locks (advanced), weights and conflicts. */
  function rollEnchantments(isAdvanced) {
    const respectConflicts = $('er-respect-conflicts').checked;
    const allowAboveCap = $('er-allow-above-cap').checked;
    const picked = [];
    const usedIds = new Set();

    if (isAdvanced) {
      const enchBody = $('er-ench-body');
      enchBody.querySelectorAll('tr').forEach((row) => {
        const lock = row.querySelector('[data-er-lock]');
        if (lock && lock.checked) {
          const id = lock.dataset.erLock;
          const level = Number(row.querySelector('[data-er-value]').value) || 1;
          picked.push({ id, level, locked: true });
          usedIds.add(id);
        }
      });
      const pool = eligibleEnchantments()
        .filter((e) => !usedIds.has(e.id))
        .map((e) => {
          const weightInput = enchBody.querySelector(`[data-er-weight="${e.id}"]`);
          return { ...e, weight: weightInput ? Number(weightInput.value) || 0 : e.weight };
        });
      const count = randomInt(Number($('er-ench-count-min').value), Number($('er-ench-count-max').value));
      let remaining = Math.max(0, count - picked.length);
      const candidates = pool.slice();
      while (remaining > 0 && candidates.length) {
        const conflictFree = respectConflicts
          ? candidates.filter((c) => !picked.some((p) => c.conflicts.includes(p.id) || (ENCHANTMENTS.find((x) => x.id === p.id) || {}).conflicts?.includes(c.id)))
          : candidates;
        if (!conflictFree.length) break;
        const choice = weightedPick(conflictFree);
        if (!choice) break;
        const idx = candidates.indexOf(choice);
        if (idx >= 0) candidates.splice(idx, 1);
        const maxLevel = allowAboveCap ? Math.max(choice.maxLevel, Number($('er-ench-level-max').value) || choice.maxLevel) : choice.maxLevel;
        const minLevel = Math.min(Number($('er-ench-level-min').value) || 1, maxLevel);
        picked.push({ id: choice.id, level: randomInt(minLevel, maxLevel), locked: false, levelRange: [minLevel, maxLevel] });
        remaining--;
      }
      return picked;
    }

    const pool = eligibleEnchantments();
    const count = Math.min(pool.length, randomInt(Number($('er-ench-count-min').value), Number($('er-ench-count-max').value)));
    const candidates = pool.slice();
    for (let i = 0; i < count && candidates.length; i++) {
      const conflictFree = respectConflicts
        ? candidates.filter((c) => !picked.some((p) => c.conflicts.includes(p.id)))
        : candidates;
      if (!conflictFree.length) break;
      const choice = conflictFree[randomInt(0, conflictFree.length - 1)];
      const idx = candidates.indexOf(choice);
      if (idx >= 0) candidates.splice(idx, 1);
      const maxLevel = allowAboveCap ? Math.max(choice.maxLevel, Number($('er-ench-level-max').value) || choice.maxLevel) : choice.maxLevel;
      const minLevel = Math.min(Number($('er-ench-level-min').value) || 1, maxLevel);
      picked.push({ id: choice.id, level: randomInt(minLevel, maxLevel), locked: false, levelRange: [minLevel, maxLevel] });
    }
    return picked;
  }

  function rollAttributes(isAdvanced) {
    const picked = [];
    const usedIds = new Set();
    const category = $('er-category').value;
    const slot = CATEGORY_SLOT[category] || 'mainhand';

    if (isAdvanced) {
      const attrBody = $('er-attr-body');
      attrBody.querySelectorAll('tr').forEach((row) => {
        const lock = row.querySelector('[data-er-alock]');
        if (lock && lock.checked) {
          const id = lock.dataset.erAlock;
          const amount = Number(row.querySelector('[data-er-avalue]').value) || 0;
          const meta = ATTRIBUTES.find((a) => a.id === id);
          picked.push({ id, amount, operation: meta ? meta.defaultOperation : 'add_value', slot, locked: true });
          usedIds.add(id);
        }
      });
      const pool = ATTRIBUTES.filter((a) => !usedIds.has(a.id)).map((a) => {
        const weightInput = attrBody.querySelector(`[data-er-aweight="${a.id}"]`);
        return { ...a, weight: weightInput ? Number(weightInput.value) || 0 : a.weight };
      });
      const count = randomInt(Number($('er-attr-count-min').value), Number($('er-attr-count-max').value));
      let remaining = Math.max(0, count - picked.length);
      const candidates = pool.slice();
      while (remaining > 0 && candidates.length) {
        const choice = weightedPick(candidates);
        if (!choice) break;
        const idx = candidates.indexOf(choice);
        if (idx >= 0) candidates.splice(idx, 1);
        picked.push({ id: choice.id, amount: randomFloat(choice.range[0], choice.range[1]), operation: choice.defaultOperation, slot, locked: false, amountRange: choice.range });
        remaining--;
      }
      return picked;
    }

    const operation = $('er-attr-operation').value;
    const count = Math.min(ATTRIBUTES.length, randomInt(Number($('er-attr-count-min').value), Number($('er-attr-count-max').value)));
    const candidates = ATTRIBUTES.slice();
    const min = Number($('er-attr-amount-min').value);
    const max = Number($('er-attr-amount-max').value);
    for (let i = 0; i < count && candidates.length; i++) {
      const choice = candidates.splice(randomInt(0, candidates.length - 1), 1)[0];
      picked.push({ id: choice.id, amount: randomFloat(min, max), operation: operation === 'random' ? choice.defaultOperation : operation, slot, locked: false, amountRange: [min, max] });
    }
    return picked;
  }

  function roundAmount(n) {
    return Math.round(n * 100) / 100;
  }

  /** Modern (1.20.5+) /give uses data components; legacy uses NBT tags. */
  function buildGiveCommand(item, enchantments, attributes, isModern) {
    if (isModern) {
      const parts = [];
      if (enchantments.length) {
        const levels = enchantments.map((e) => `"minecraft:${e.id}":${e.level}`).join(',');
        parts.push(`minecraft:enchantments={levels:{${levels}}}`);
      }
      if (attributes.length) {
        const mods = attributes.map((a, i) =>
          `{type:"minecraft:${a.id}",id:"harbor:roll_${i}",amount:${roundAmount(a.amount)},operation:"${a.operation}",slot:"${a.slot}"}`
        ).join(',');
        parts.push(`minecraft:attribute_modifiers={modifiers:[${mods}],show_in_tooltip:true}`);
      }
      const components = parts.length ? `[${parts.join(',')}]` : '';
      return `/give @p ${item}${components} 1`;
    }

    const nbt = [];
    if (enchantments.length) {
      const list = enchantments.map((e) => `{id:"minecraft:${e.id}",lvl:${e.level}}`).join(',');
      nbt.push(`Enchantments:[${list}]`);
    }
    if (attributes.length) {
      const legacyOp = { add_value: 0, add_multiplied_base: 1, add_multiplied_total: 2 };
      const list = attributes.map((a, i) =>
        `{AttributeName:"${a.id}",Name:"harbor.roll_${i}",Amount:${roundAmount(a.amount)},Operation:${legacyOp[a.operation] ?? 0},Slot:"${a.slot}"}`
      ).join(',');
      nbt.push(`AttributeModifiers:[${list}]`);
    }
    const tag = nbt.length ? `{${nbt.join(',')}}` : '';
    return `/give @p ${item}${tag} 1`;
  }

  function numberProvider(value, range) {
    if (!range || range[0] === range[1]) return roundAmount(value);
    return { type: 'minecraft:uniform', min: roundAmount(range[0]), max: roundAmount(range[1]) };
  }

  /**
   * Loot-table mode reuses the same rolled enchantments/attributes as the
   * /give command (same ids, same conflict/weight/lock rules) but writes
   * each unlocked one as a minecraft:uniform number provider instead of a
   * fixed value, so the game rolls it fresh on every drop.
   */
  function buildLootEntry(item, enchantments, attributes) {
    const functions = [];

    if (enchantments.length) {
      functions.push({
        function: 'minecraft:set_enchantments',
        enchantments: Object.fromEntries(enchantments.map((e) => [
          `minecraft:${e.id}`,
          e.locked ? e.level : numberProvider(e.level, e.levelRange)
        ]))
      });
    }
    if (attributes.length) {
      functions.push({
        function: 'minecraft:set_attributes',
        modifiers: attributes.map((a) => ({
          attribute: `minecraft:${a.id}`,
          amount: a.locked ? roundAmount(a.amount) : numberProvider(a.amount, a.amountRange),
          operation: a.operation,
          id: `harbor:roll_${a.id.split('.').pop()}`,
          slot: a.slot
        }))
      });
    }

    return { type: 'minecraft:item', name: item, functions };
  }

  function outputFormat() {
    const active = root.querySelector('[data-er-format].is-active');
    return active ? active.dataset.erFormat : 'give';
  }

  function currentMode() {
    const active = root.querySelector('[data-er-mode].is-active');
    return active ? active.dataset.erMode : 'basic';
  }

  function currentVersion() {
    const active = root.querySelector('[data-er-version].is-active');
    return active ? active.dataset.erVersion : 'modern';
  }

  function syncVisibility() {
    const mode = currentMode();
    $('er-basic-panel').hidden = mode !== 'basic';
    $('er-advanced-panel').hidden = mode !== 'advanced';
    if (mode === 'advanced' && !advancedBuilt) buildAdvancedTables();
  }

  function randomize() {
    syncVisibility();
    const item = namespacedItem($('er-item').value);
    if (!item) {
      $('er-output').value = '';
      $('er-summary').textContent = t.empty;
      return;
    }
    const isAdvanced = currentMode() === 'advanced';
    const enchantments = rollEnchantments(isAdvanced);
    const attributes = rollAttributes(isAdvanced);

    if (outputFormat() === 'give') {
      $('er-output').value = buildGiveCommand(item, enchantments, attributes, currentVersion() === 'modern');
    } else {
      $('er-output').value = JSON.stringify(buildLootEntry(item, enchantments, attributes), null, 2);
    }
    $('er-summary').textContent = t.summary(enchantments.length, attributes.length);
  }

  root.querySelectorAll('[data-er-format]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-er-format]').forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');
      randomize();
    });
  });
  root.querySelectorAll('[data-er-version]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-er-version]').forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');
      randomize();
    });
  });
  root.querySelectorAll('[data-er-mode]').forEach((button) => {
    button.addEventListener('click', () => {
      root.querySelectorAll('[data-er-mode]').forEach((b) => b.classList.remove('is-active'));
      button.classList.add('is-active');
      syncVisibility();
    });
  });

  $('er-category').addEventListener('change', () => { advancedBuilt = false; syncVisibility(); });
  $('er-randomize').addEventListener('click', randomize);

  $('er-copy').addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText($('er-output').value);
      const button = event.currentTarget;
      const label = button.textContent;
      button.textContent = t.copied;
      setTimeout(() => { button.textContent = label; }, 1200);
    } catch (error) {
      /* clipboard blocked; the textarea stays selectable */
    }
  });

  $('er-download').addEventListener('click', () => {
    if (!$('er-output').value) return;
    const isJson = outputFormat() !== 'give';
    const blob = new Blob([$('er-output').value], { type: isJson ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = isJson ? 'enchantment_loot_entry.json' : 'enchantment_give_command.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  syncVisibility();
  randomize();
})();
