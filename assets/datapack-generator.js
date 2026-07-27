(() => {
  const root = document.querySelector('[data-datapack-generator]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);

  // Data pack formats, from the version table. Getting this wrong is the most
  // common reason a pack shows up as "incompatible" and refuses to enable.
  const VERSIONS = [
    { id: '1.21.7', label: '1.21.7 - 1.21.8', format: 81, singular: true },
    { id: '1.21.6', label: '1.21.6',          format: 80, singular: true },
    { id: '1.21.5', label: '1.21.5',          format: 71, singular: true },
    { id: '1.21.4', label: '1.21.4',          format: 61, singular: true },
    { id: '1.21.2', label: '1.21.2 - 1.21.3', format: 57, singular: true },
    { id: '1.21',   label: '1.21 - 1.21.1',   format: 48, singular: true },
    { id: '1.20.5', label: '1.20.5 - 1.20.6', format: 41, singular: false },
    { id: '1.20.3', label: '1.20.3 - 1.20.4', format: 26, singular: false },
    { id: '1.20.2', label: '1.20.2',          format: 18, singular: false },
    { id: '1.20',   label: '1.20 - 1.20.1',   format: 15, singular: false }
  ];

  const LOCALE = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: {
      empty: 'Pick at least one thing to include.',
      ready: (n) => `${n} file(s) ready.`,
      zipMissing: 'The ZIP library did not load. You can still copy each file below and create them by hand.',
      building: 'Building...',
      copied: 'Copied'
    },
    ru: {
      empty: 'Выберите хотя бы один пункт.',
      ready: (n) => `Готово файлов: ${n}.`,
      zipMissing: 'Библиотека ZIP не загрузилась. Можно скопировать каждый файл ниже и создать их вручную.',
      building: 'Собираю...',
      copied: 'Скопировано'
    },
    fr: {
      empty: 'Choisissez au moins un élément à inclure.',
      ready: (n) => `${n} fichier(s) prêt(s).`,
      zipMissing: 'La bibliothèque ZIP ne s’est pas chargée. Vous pouvez copier chaque fichier ci-dessous et les créer à la main.',
      building: 'Construction...',
      copied: 'Copié'
    },
    de: {
      empty: 'Wähle mindestens einen Punkt aus.',
      ready: (n) => `${n} Datei(en) bereit.`,
      zipMissing: 'Die ZIP-Bibliothek wurde nicht geladen. Du kannst jede Datei unten kopieren und von Hand anlegen.',
      building: 'Wird erstellt...',
      copied: 'Kopiert'
    }
  };
  const t = T[LOCALE] || T.en;

  function currentVersion() {
    return VERSIONS.find((v) => v.id === $('dp-version').value) || VERSIONS[3];
  }

  // 1.21 (snapshot 24w21a) renamed every content directory to the singular:
  // functions -> function, loot_tables -> loot_table, and so on. A pack that
  // uses the old plural names on 1.21+ loads but silently does nothing.
  function dir(version, name) {
    if (version.singular) return name;
    const plural = {
      function: 'functions',
      advancement: 'advancements',
      loot_table: 'loot_tables',
      recipe: 'recipes',
      predicate: 'predicates',
      item_modifier: 'item_modifiers',
      structure: 'structures'
    };
    return plural[name] || name;
  }

  function safeNamespace(value) {
    const raw = String(value || '').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_');
    return raw || 'mypack';
  }

  function safeFileName(value) {
    return String(value || 'pack').trim().replace(/[^a-zA-Z0-9а-яёА-ЯЁ _-]/g, '_').replace(/\s+/g, '_') || 'pack';
  }

  function jsonFile(value) {
    return JSON.stringify(value, null, 2) + '\n';
  }

  /** Build the whole pack as a list of { path, content } entries. */
  function buildFiles() {
    const version = currentVersion();
    const ns = safeNamespace($('dp-namespace').value);
    const name = $('dp-name').value.trim() || 'My data pack';
    const description = $('dp-description').value.trim() || 'Created with Cube in Square';
    const files = [];

    files.push({
      path: 'pack.mcmeta',
      content: jsonFile({ pack: { pack_format: version.format, description } })
    });

    const wantLoad = $('dp-load').checked;
    const wantTick = $('dp-tick').checked;

    if (wantLoad) {
      files.push({
        path: `data/${ns}/${dir(version, 'function')}/load.mcfunction`,
        content: `# Runs once when the pack loads and on every /reload\ntellraw @a {"text":"[${name}] loaded","color":"green"}\n`
      });
    }
    if (wantTick) {
      files.push({
        path: `data/${ns}/${dir(version, 'function')}/tick.mcfunction`,
        content: '# Runs every tick (20x per second) - keep this cheap\n# execute as @a at @s run ...\n'
      });
    }
    if (wantLoad || wantTick) {
      // The load/tick hooks live in the minecraft namespace, and tags/functions
      // was renamed to tags/function in 1.21 as well.
      const tagDir = version.singular ? 'tags/function' : 'tags/functions';
      if (wantLoad) {
        files.push({
          path: `data/minecraft/${tagDir}/load.json`,
          content: jsonFile({ values: [`${ns}:load`] })
        });
      }
      if (wantTick) {
        files.push({
          path: `data/minecraft/${tagDir}/tick.json`,
          content: jsonFile({ values: [`${ns}:tick`] })
        });
      }
    }

    if ($('dp-loot').checked) {
      files.push({
        path: `data/${ns}/${dir(version, 'loot_table')}/example_chest.json`,
        content: jsonFile({
          type: 'minecraft:chest',
          pools: [{
            rolls: { min: 1, max: 3 },
            entries: [
              { type: 'minecraft:item', name: 'minecraft:iron_ingot', weight: 8 },
              { type: 'minecraft:item', name: 'minecraft:diamond', weight: 1 }
            ]
          }]
        })
      });
    }

    if ($('dp-recipe').checked) {
      // Recipe JSON moved twice. 1.20.5 renamed the result's "item" to "id",
      // and 1.21.2 let ingredients be bare id strings instead of {"item": id}.
      const fmt = version.format;
      const ingredient = (id) => (fmt >= 57 ? id : { item: id });
      const result = fmt >= 41
        ? { id: 'minecraft:diamond_block', count: 1 }
        : { item: 'minecraft:diamond_block', count: 1 };

      files.push({
        path: `data/${ns}/${dir(version, 'recipe')}/example_shaped.json`,
        content: jsonFile({
          type: 'minecraft:crafting_shaped',
          category: 'misc',
          pattern: [' # ', '#X#', ' # '],
          key: { '#': ingredient('minecraft:iron_ingot'), X: ingredient('minecraft:diamond') },
          result: result
        })
      });
    }

    if ($('dp-advancement').checked) {
      // The display icon follows the same "item" -> "id" rename as recipes.
      const icon = version.format >= 41
        ? { id: 'minecraft:map' }
        : { item: 'minecraft:map' };

      files.push({
        path: `data/${ns}/${dir(version, 'advancement')}/example_root.json`,
        content: jsonFile({
          display: {
            icon: icon,
            title: name,
            description: description,
            frame: 'task',
            show_toast: true,
            announce_to_chat: true
          },
          criteria: { entered: { trigger: 'minecraft:tick' } }
        })
      });
    }

    return { files, version, ns };
  }

  function renderTree(files) {
    return files.map((f) => f.path).sort().join('\n');
  }

  function update() {
    const { files, version } = buildFiles();
    const hasContent = files.length > 1;

    $('dp-format-note').textContent = `pack_format ${version.format}`;
    $('dp-tree').textContent = hasContent ? renderTree(files) : t.empty;
    $('dp-summary').textContent = hasContent ? t.ready(files.length) : t.empty;
    $('dp-mcmeta').value = files[0].content.trim();
    $('dp-download').disabled = !hasContent;

    // Show whichever generated file the preview selector points at.
    const select = $('dp-file-select');
    const previous = select.value;
    select.innerHTML = '';
    files.forEach((f) => {
      const option = document.createElement('option');
      option.value = f.path;
      option.textContent = f.path;
      select.appendChild(option);
    });
    if (files.some((f) => f.path === previous)) select.value = previous;
    showSelectedFile(files);
  }

  function showSelectedFile(files) {
    const list = files || buildFiles().files;
    const wanted = $('dp-file-select').value;
    const file = list.find((f) => f.path === wanted) || list[0];
    $('dp-file-content').value = file ? file.content : '';
  }

  async function download() {
    const { files, ns } = buildFiles();
    if (typeof JSZip === 'undefined') {
      $('dp-summary').textContent = t.zipMissing;
      return;
    }
    const button = $('dp-download');
    const label = button.textContent;
    button.textContent = t.building;
    button.disabled = true;
    try {
      const zip = new JSZip();
      files.forEach((f) => zip.file(f.path, f.content));
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = safeFileName($('dp-name').value || ns) + '.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } finally {
      button.textContent = label;
      button.disabled = false;
      update();
    }
  }

  async function copyFrom(field, button) {
    try {
      await navigator.clipboard.writeText($(field).value);
      const label = button.textContent;
      button.textContent = t.copied;
      setTimeout(() => { button.textContent = label; }, 1200);
    } catch (error) {
      /* clipboard blocked; the textarea is selectable anyway */
    }
  }

  // Populate the version dropdown from the table so the two cannot drift.
  const versionSelect = $('dp-version');
  VERSIONS.forEach((v) => {
    const option = document.createElement('option');
    option.value = v.id;
    option.textContent = v.label;
    versionSelect.appendChild(option);
  });
  versionSelect.value = '1.21.4';

  root.addEventListener('input', update);
  root.addEventListener('change', update);
  $('dp-file-select').addEventListener('change', () => showSelectedFile());
  $('dp-download').addEventListener('click', download);
  $('dp-copy-mcmeta').addEventListener('click', (e) => copyFrom('dp-mcmeta', e.currentTarget));
  $('dp-copy-file').addEventListener('click', (e) => copyFrom('dp-file-content', e.currentTarget));

  update();
})();
