(() => {
  const root = document.querySelector('[data-loot-table-generator]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);

  const LOCALE = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: {
      pool: 'Pool', entry: 'Entry', removePool: 'Remove pool', removeEntry: 'Remove',
      item: 'Item id', weight: 'Weight', countMin: 'Min count', countMax: 'Max count',
      customName: 'Custom name (optional)', chance: 'Drop chance',
      rollsMin: 'Min rolls', rollsMax: 'Max rolls', addEntry: 'Add entry',
      noPools: 'Add a pool to start.', copied: 'Copied',
      summary: (p, e) => `${p} pool(s), ${e} entry/entries.`
    },
    ru: {
      pool: 'Пул', entry: 'Запись', removePool: 'Убрать пул', removeEntry: 'Убрать',
      item: 'ID предмета', weight: 'Вес', countMin: 'Мин. количество', countMax: 'Макс. количество',
      customName: 'Своё имя (необязательно)', chance: 'Шанс выпадения',
      rollsMin: 'Мин. роллов', rollsMax: 'Макс. роллов', addEntry: 'Добавить запись',
      noPools: 'Добавьте пул, чтобы начать.', copied: 'Скопировано',
      summary: (p, e) => `Пулов: ${p}, записей: ${e}.`
    },
    fr: {
      pool: 'Pool', entry: 'Entrée', removePool: 'Retirer le pool', removeEntry: 'Retirer',
      item: 'ID de l’objet', weight: 'Poids', countMin: 'Quantité min', countMax: 'Quantité max',
      customName: 'Nom personnalisé (optionnel)', chance: 'Probabilité',
      rollsMin: 'Tirages min', rollsMax: 'Tirages max', addEntry: 'Ajouter une entrée',
      noPools: 'Ajoutez un pool pour commencer.', copied: 'Copié',
      summary: (p, e) => `${p} pool(s), ${e} entrée(s).`
    },
    de: {
      pool: 'Pool', entry: 'Eintrag', removePool: 'Pool entfernen', removeEntry: 'Entfernen',
      item: 'Item-ID', weight: 'Gewicht', countMin: 'Min. Anzahl', countMax: 'Max. Anzahl',
      customName: 'Eigener Name (optional)', chance: 'Drop-Chance',
      rollsMin: 'Min. Rolls', rollsMax: 'Max. Rolls', addEntry: 'Eintrag hinzufügen',
      noPools: 'Füge einen Pool hinzu, um zu starten.', copied: 'Kopiert',
      summary: (p, e) => `${p} Pool(s), ${e} Eintrag/Einträge.`
    }
  };
  const t = T[LOCALE] || T.en;

  const PRESETS = {
    dungeon: {
      type: 'minecraft:chest', file: 'harbor_dungeon',
      pools: [{ rollsMin: 2, rollsMax: 4, entries: [
        { item: 'minecraft:iron_ingot', weight: 10, min: 1, max: 4, name: '', chance: 1 },
        { item: 'minecraft:gold_ingot', weight: 5, min: 1, max: 3, name: '', chance: 1 },
        { item: 'minecraft:diamond', weight: 1, min: 1, max: 1, name: '', chance: 1 }
      ] }]
    },
    mob: {
      type: 'minecraft:entity', file: 'harbor_guard',
      pools: [{ rollsMin: 1, rollsMax: 1, entries: [
        { item: 'minecraft:iron_sword', weight: 1, min: 1, max: 1, name: 'Guard blade', chance: 0.15 }
      ] }]
    },
    fishing: {
      type: 'minecraft:fishing', file: 'harbor_catch',
      pools: [{ rollsMin: 1, rollsMax: 1, entries: [
        { item: 'minecraft:cod', weight: 20, min: 1, max: 1, name: '', chance: 1 },
        { item: 'minecraft:name_tag', weight: 1, min: 1, max: 1, name: '', chance: 1 }
      ] }]
    }
  };

  let pools = [];

  const num = (value, fallback, min, max) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  };

  function namespacedItem(value) {
    const raw = String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
    if (!raw) return 'minecraft:stone';
    return raw.includes(':') ? raw : 'minecraft:' + raw;
  }

  /**
   * Minecraft accepts a bare integer or a number provider object here. The
   * explicit uniform form is emitted rather than the {min,max} shorthand so
   * the output is unambiguous across versions.
   */
  function countProvider(min, max) {
    return min === max ? min : { type: 'minecraft:uniform', min, max };
  }

  function buildTable() {
    const table = { type: $('lt-type').value, pools: [] };

    pools.forEach((pool) => {
      const rollsMin = num(pool.rollsMin, 1, 0, 100);
      const rollsMax = Math.max(rollsMin, num(pool.rollsMax, 1, 0, 100));
      const entries = [];

      pool.entries.forEach((entry) => {
        const min = num(entry.min, 1, 1, 64);
        const max = Math.max(min, num(entry.max, 1, 1, 64));
        const built = {
          type: 'minecraft:item',
          name: namespacedItem(entry.item),
          weight: num(entry.weight, 1, 1, 1000)
        };

        const functions = [];
        if (min !== 1 || max !== 1) {
          functions.push({ function: 'minecraft:set_count', count: countProvider(min, max) });
        }
        if (String(entry.name || '').trim()) {
          functions.push({
            function: 'minecraft:set_name',
            name: { text: String(entry.name).trim(), italic: false }
          });
        }
        if (functions.length) built.functions = functions;

        const chance = Number(entry.chance);
        if (Number.isFinite(chance) && chance > 0 && chance < 1) {
          built.conditions = [{ condition: 'minecraft:random_chance', chance: chance }];
        }

        entries.push(built);
      });

      if (!entries.length) return;
      table.pools.push({ rolls: countProvider(rollsMin, rollsMax), entries });
    });

    return table;
  }

  function filePath() {
    const ns = String($('lt-namespace').value || 'harbor').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_') || 'harbor';
    const file = String($('lt-file').value || 'loot_table').trim().toLowerCase().replace(/[^a-z0-9_/.-]/g, '_') || 'loot_table';
    // 1.21 renamed loot_tables to loot_table; the generator targets 1.21+.
    return `data/${ns}/loot_table/${file}.json`;
  }

  function field(labelText, value, type, onInput, attrs) {
    const label = document.createElement('label');
    label.className = 'tool-field';
    const span = document.createElement('span');
    span.textContent = labelText;
    const input = document.createElement('input');
    input.type = type;
    input.value = value;
    Object.entries(attrs || {}).forEach(([k, v]) => input.setAttribute(k, v));
    input.addEventListener('input', () => { onInput(input.value); update(); });
    label.appendChild(span);
    label.appendChild(input);
    return label;
  }

  function render() {
    const host = $('lt-pools');
    host.innerHTML = '';

    if (!pools.length) {
      const empty = document.createElement('p');
      empty.className = 'tool-summary';
      empty.textContent = t.noPools;
      host.appendChild(empty);
      return;
    }

    pools.forEach((pool, pi) => {
      const card = document.createElement('article');
      card.className = 'trade-card';

      const header = document.createElement('div');
      header.className = 'trade-card-header';
      const title = document.createElement('h3');
      title.textContent = `${t.pool} ${pi + 1}`;
      const removeButton = document.createElement('button');
      removeButton.type = 'button';
      removeButton.className = 'tool-button tool-button-secondary';
      removeButton.textContent = t.removePool;
      removeButton.addEventListener('click', () => { pools.splice(pi, 1); render(); update(); });
      header.appendChild(title);
      header.appendChild(removeButton);
      card.appendChild(header);

      const rollsGrid = document.createElement('div');
      rollsGrid.className = 'tool-form-grid';
      rollsGrid.appendChild(field(t.rollsMin, pool.rollsMin, 'number', (v) => { pool.rollsMin = v; }, { min: 0, max: 100 }));
      rollsGrid.appendChild(field(t.rollsMax, pool.rollsMax, 'number', (v) => { pool.rollsMax = v; }, { min: 0, max: 100 }));
      card.appendChild(rollsGrid);

      pool.entries.forEach((entry, ei) => {
        const block = document.createElement('div');
        block.className = 'tool-panel';

        const entryHeader = document.createElement('div');
        entryHeader.className = 'trade-card-header';
        const entryTitle = document.createElement('h3');
        entryTitle.textContent = `${t.entry} ${ei + 1}`;
        const removeEntry = document.createElement('button');
        removeEntry.type = 'button';
        removeEntry.className = 'tool-button tool-button-secondary';
        removeEntry.textContent = t.removeEntry;
        removeEntry.addEventListener('click', () => { pool.entries.splice(ei, 1); render(); update(); });
        entryHeader.appendChild(entryTitle);
        entryHeader.appendChild(removeEntry);
        block.appendChild(entryHeader);

        const grid = document.createElement('div');
        grid.className = 'tool-form-grid';
        grid.appendChild(field(t.item, entry.item, 'text', (v) => { entry.item = v; }));
        grid.appendChild(field(t.weight, entry.weight, 'number', (v) => { entry.weight = v; }, { min: 1, max: 1000 }));
        grid.appendChild(field(t.countMin, entry.min, 'number', (v) => { entry.min = v; }, { min: 1, max: 64 }));
        grid.appendChild(field(t.countMax, entry.max, 'number', (v) => { entry.max = v; }, { min: 1, max: 64 }));
        grid.appendChild(field(t.customName, entry.name, 'text', (v) => { entry.name = v; }));
        grid.appendChild(field(t.chance, entry.chance, 'number', (v) => { entry.chance = v; }, { min: 0, max: 1, step: 0.05 }));
        block.appendChild(grid);
        card.appendChild(block);
      });

      const addButton = document.createElement('button');
      addButton.type = 'button';
      addButton.className = 'tool-button';
      addButton.textContent = t.addEntry;
      addButton.addEventListener('click', () => {
        pool.entries.push({ item: 'minecraft:stone', weight: 1, min: 1, max: 1, name: '', chance: 1 });
        render(); update();
      });
      card.appendChild(addButton);

      host.appendChild(card);
    });
  }

  function update() {
    const table = buildTable();
    const entryCount = table.pools.reduce((sum, p) => sum + p.entries.length, 0);
    $('lt-output').value = JSON.stringify(table, null, 2);
    $('lt-path').textContent = filePath();
    $('lt-summary').textContent = t.summary(table.pools.length, entryCount);
  }

  function applyPreset(key) {
    const preset = PRESETS[key] || PRESETS.dungeon;
    $('lt-type').value = preset.type;
    $('lt-file').value = preset.file;
    pools = preset.pools.map((p) => ({
      rollsMin: p.rollsMin, rollsMax: p.rollsMax,
      entries: p.entries.map((e) => Object.assign({}, e))
    }));
    render();
    update();
  }

  $('lt-add-pool').addEventListener('click', () => {
    pools.push({ rollsMin: 1, rollsMax: 1, entries: [{ item: 'minecraft:stone', weight: 1, min: 1, max: 1, name: '', chance: 1 }] });
    render(); update();
  });

  document.querySelectorAll('[data-lt-preset]').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.ltPreset));
  });

  $('lt-copy').addEventListener('click', async (event) => {
    try {
      await navigator.clipboard.writeText($('lt-output').value);
      const button = event.currentTarget;
      const label = button.textContent;
      button.textContent = t.copied;
      setTimeout(() => { button.textContent = label; }, 1200);
    } catch (error) {
      /* clipboard blocked; the textarea stays selectable */
    }
  });

  $('lt-download').addEventListener('click', () => {
    const blob = new Blob([$('lt-output').value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = (String($('lt-file').value || 'loot_table').trim() || 'loot_table') + '.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  root.addEventListener('change', (event) => {
    if (event.target && event.target.id === 'lt-type') update();
  });
  $('lt-namespace').addEventListener('input', update);
  $('lt-file').addEventListener('input', update);

  applyPreset('dungeon');
})();
