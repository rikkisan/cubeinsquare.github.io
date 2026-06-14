(function () {
  const STORAGE_KEY = 'cubeinsquare-custom-item-catalog-v1';
  const lang = document.documentElement.lang || 'en';
  const copy = {
    en: {
      empty: 'No entries yet. Add one item and the catalog starts doing the memory work for you.',
      items: 'Items', duplicates: 'Duplicate IDs', visuals: 'Duplicate hooks',
      edit: 'Edit', remove: 'Remove', copied: 'Copied', noMatches: 'No matching items.',
      duplicateIdFlag: 'Duplicate hidden ID', duplicateHookFlag: 'Duplicate visual hook',
      importError: 'That file could not be imported. Use a JSON array of catalog entries.',
      clearConfirm: 'Clear the local catalog in this browser?'
    },
    ru: {
      empty: 'Пока записей нет. Добавьте один предмет, и каталог начнёт держать память за вас.',
      items: 'Предметы', duplicates: 'Дубли ID', visuals: 'Дубли хуков',
      edit: 'Редактировать', remove: 'Удалить', copied: 'Скопировано', noMatches: 'Совпадений нет.',
      duplicateIdFlag: 'Дубль скрытого ID', duplicateHookFlag: 'Дубль визуального хука',
      importError: 'Не удалось импортировать файл. Нужен JSON-массив записей каталога.',
      clearConfirm: 'Очистить локальный каталог в этом браузере?'
    },
    fr: {
      empty: 'Aucune entrée pour le moment. Ajoutez un premier objet et le catalogue prendra déjà le relais de la mémoire.',
      items: 'Objets', duplicates: 'IDs en double', visuals: 'Hooks en double',
      edit: 'Modifier', remove: 'Supprimer', copied: 'Copié', noMatches: 'Aucun objet correspondant.',
      duplicateIdFlag: 'ID caché en double', duplicateHookFlag: 'Hook visuel en double',
      importError: 'Impossible d’importer ce fichier. Utilisez un tableau JSON d’entrées de catalogue.',
      clearConfirm: 'Vider le catalogue local de ce navigateur ?'
    },
    de: {
      empty: 'Noch keine Einträge. Füge das erste Item hinzu, dann übernimmt der Katalog bereits einen Teil der Erinnerungsarbeit.',
      items: 'Items', duplicates: 'Doppelte IDs', visuals: 'Doppelte Hooks',
      edit: 'Bearbeiten', remove: 'Löschen', copied: 'Kopiert', noMatches: 'Keine passenden Items.',
      duplicateIdFlag: 'Doppelte versteckte ID', duplicateHookFlag: 'Doppelter visueller Hook',
      importError: 'Diese Datei konnte nicht importiert werden. Verwende ein JSON-Array mit Katalogeinträgen.',
      clearConfirm: 'Lokalen Katalog in diesem Browser leeren?'
    }
  }[lang] || {
    empty: 'No entries yet.', items: 'Items', duplicates: 'Duplicate IDs', visuals: 'Duplicate hooks', edit: 'Edit', remove: 'Remove', copied: 'Copied', noMatches: 'No matches.', duplicateIdFlag: 'Duplicate hidden ID', duplicateHookFlag: 'Duplicate visual hook', importError: 'Import failed.', clearConfirm: 'Clear the catalog?'
  };

  const fields = {
    id: document.getElementById('cic-id'),
    name: document.getElementById('cic-name'),
    base: document.getElementById('cic-base'),
    version: document.getElementById('cic-version'),
    hidden: document.getElementById('cic-hidden'),
    model: document.getElementById('cic-model'),
    cmd: document.getElementById('cic-cmd'),
    tags: document.getElementById('cic-tags'),
    notes: document.getElementById('cic-notes')
  };
  const search = document.getElementById('cic-search');
  const stats = document.getElementById('cic-stats');
  const list = document.getElementById('cic-list');
  const importFile = document.getElementById('cic-import-file');
  let editingId = null;

  function loadCatalog() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    } catch (error) {
      return [];
    }
  }
  function saveCatalog(entries) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  }
  function normalizeEntry(entry) {
    return {
      id: String(entry.id || '').trim(),
      name: String(entry.name || '').trim(),
      base: String(entry.base || '').trim(),
      version: String(entry.version || 'modern').trim(),
      hidden: String(entry.hidden || '').trim(),
      model: String(entry.model || '').trim(),
      cmd: String(entry.cmd || '').trim(),
      tags: Array.isArray(entry.tags) ? entry.tags.map((tag) => String(tag).trim()).filter(Boolean) : String(entry.tags || '').split(',').map((tag) => tag.trim()).filter(Boolean),
      notes: String(entry.notes || '').trim()
    };
  }
  function formEntry() {
    return normalizeEntry({
      id: fields.id.value,
      name: fields.name.value,
      base: fields.base.value,
      version: fields.version.value,
      hidden: fields.hidden.value,
      model: fields.model.value,
      cmd: fields.cmd.value,
      tags: fields.tags.value,
      notes: fields.notes.value
    });
  }
  function resetForm() {
    Object.values(fields).forEach((field) => {
      if (field.tagName === 'SELECT') field.selectedIndex = 0;
      else field.value = '';
    });
    editingId = null;
  }
  function buildDuplicateMaps(entries) {
    const hiddenMap = new Map();
    const hookMap = new Map();
    entries.forEach((entry) => {
      if (entry.hidden) hiddenMap.set(entry.hidden, (hiddenMap.get(entry.hidden) || 0) + 1);
      const hookKey = [entry.version, entry.model, entry.cmd].join('|');
      if (entry.model || entry.cmd) hookMap.set(hookKey, (hookMap.get(hookKey) || 0) + 1);
    });
    return { hiddenMap, hookMap };
  }
  function duplicateStats(entries) {
    const { hiddenMap, hookMap } = buildDuplicateMaps(entries);
    return {
      duplicateIds: Array.from(hiddenMap.values()).filter((count) => count > 1).reduce((sum, count) => sum + count, 0),
      duplicateHooks: Array.from(hookMap.values()).filter((count) => count > 1).reduce((sum, count) => sum + count, 0),
      hiddenMap,
      hookMap
    };
  }
  function render() {
    const entries = loadCatalog().map(normalizeEntry);
    const query = search.value.trim().toLowerCase();
    const filtered = entries.filter((entry) => !query || JSON.stringify(entry).toLowerCase().includes(query)).sort((a, b) => (a.name || a.id).localeCompare(b.name || b.id));
    const dupes = duplicateStats(entries);
    stats.innerHTML = [
      [copy.items, entries.length],
      [copy.duplicates, dupes.duplicateIds],
      [copy.visuals, dupes.duplicateHooks]
    ].map(([label, value]) => '<div class="sphere-stat-card"><strong>' + value + '</strong><span>' + label + '</span></div>').join('');

    if (!entries.length) {
      list.innerHTML = '<p class="tool-summary">' + copy.empty + '</p>';
      return;
    }
    if (!filtered.length) {
      list.innerHTML = '<p class="tool-summary">' + copy.noMatches + '</p>';
      return;
    }

    list.innerHTML = filtered.map((entry) => {
      const flags = [];
      if (entry.hidden && dupes.hiddenMap.get(entry.hidden) > 1) flags.push(copy.duplicateIdFlag);
      const hookKey = [entry.version, entry.model, entry.cmd].join('|');
      if ((entry.model || entry.cmd) && dupes.hookMap.get(hookKey) > 1) flags.push(copy.duplicateHookFlag);
      const subtitle = [entry.base || 'paper', entry.hidden || '—', entry.version].join(' | ');
      return '<article class="catalog-entry">' +
        '<div class="catalog-entry-head">' +
          '<div><strong>' + (entry.name || entry.id || entry.hidden || 'Item') + '</strong><p class="tool-summary">' + subtitle + '</p></div>' +
          '<div class="catalog-entry-actions">' +
            '<button class="tool-button tool-button-secondary" type="button" data-action="edit" data-id="' + entry.id + '">' + copy.edit + '</button>' +
            '<button class="tool-button tool-button-secondary" type="button" data-action="copy" data-id="' + entry.id + '">JSON</button>' +
            '<button class="tool-button tool-button-secondary" type="button" data-action="delete" data-id="' + entry.id + '">' + copy.remove + '</button>' +
          '</div>' +
        '</div>' +
        (flags.length ? '<div class="catalog-flags">' + flags.map((flag) => '<span class="catalog-flag">' + flag + '</span>').join('') + '</div>' : '') +
        '<p>' + (entry.notes || '') + '</p>' +
        '<div class="catalog-entry-tags">' + (entry.tags || []).map((tag) => '<span class="catalog-chip">' + tag + '</span>').join('') + '</div>' +
      '</article>';
    }).join('');

    list.querySelectorAll('button[data-action]').forEach((button) => {
      const entry = entries.find((item) => item.id === button.dataset.id);
      if (!entry) return;
      button.addEventListener('click', async () => {
        if (button.dataset.action === 'edit') {
          editingId = entry.id;
          fields.id.value = entry.id || '';
          fields.name.value = entry.name || '';
          fields.base.value = entry.base || '';
          fields.version.value = entry.version || 'modern';
          fields.hidden.value = entry.hidden || '';
          fields.model.value = entry.model || '';
          fields.cmd.value = entry.cmd || '';
          fields.tags.value = (entry.tags || []).join(', ');
          fields.notes.value = entry.notes || '';
        }
        if (button.dataset.action === 'copy') {
          await navigator.clipboard.writeText(JSON.stringify(entry, null, 2));
          const original = button.textContent;
          button.textContent = copy.copied;
          setTimeout(() => { button.textContent = original; }, 1200);
        }
        if (button.dataset.action === 'delete') {
          saveCatalog(entries.filter((item) => item.id !== entry.id));
          if (editingId === entry.id) resetForm();
          render();
        }
      });
    });
  }

  function exportContent(type) {
    const entries = loadCatalog().map(normalizeEntry);
    if (!entries.length) return;
    let text = '';
    let mime = 'text/plain;charset=utf-8';
    let ext = 'txt';
    if (type === 'json') { text = JSON.stringify(entries, null, 2); mime = 'application/json'; ext = 'json'; }
    if (type === 'csv') {
      const rows = [['id','name','base','version','hidden','model','cmd','tags','notes']];
      entries.forEach((entry) => rows.push([entry.id, entry.name, entry.base, entry.version, entry.hidden, entry.model, entry.cmd, (entry.tags || []).join('|'), entry.notes]));
      text = rows.map((row) => row.map((cell) => '"' + String(cell || '').replaceAll('"','""') + '"').join(',')).join('\n');
      mime = 'text/csv;charset=utf-8';
      ext = 'csv';
    }
    if (type === 'md') {
      text = ['| ID | Name | Base | Hidden ID | Model / CMD |', '|---|---|---|---|---|', ...entries.map((entry) => '| ' + (entry.id || '') + ' | ' + (entry.name || '') + ' | ' + (entry.base || '') + ' | ' + (entry.hidden || '') + ' | ' + (entry.model || entry.cmd || '') + ' |')].join('\n');
      mime = 'text/markdown;charset=utf-8';
      ext = 'md';
    }
    const url = URL.createObjectURL(new Blob([text], { type: mime }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'custom-item-catalog.' + ext;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  async function importJsonFile(file) {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const imported = Array.isArray(data) ? data.map(normalizeEntry).filter((entry) => entry.id) : [];
      if (!imported.length) throw new Error('Invalid import');
      const current = loadCatalog().map(normalizeEntry);
      const merged = new Map(current.map((entry) => [entry.id, entry]));
      imported.forEach((entry) => merged.set(entry.id, entry));
      saveCatalog(Array.from(merged.values()));
      render();
    } catch (error) {
      alert(copy.importError);
    }
  }

  document.getElementById('cic-save').addEventListener('click', () => {
    const entry = formEntry();
    if (!entry.id) return;
    const entries = loadCatalog().map(normalizeEntry);
    const next = editingId ? entries.map((item) => item.id === editingId ? entry : item) : [...entries.filter((item) => item.id !== entry.id), entry];
    saveCatalog(next);
    resetForm();
    render();
  });
  document.getElementById('cic-reset').addEventListener('click', () => { resetForm(); });
  document.getElementById('cic-example').addEventListener('click', () => {
    fields.id.value = 'guild-pass';
    fields.name.value = 'Guild archive pass';
    fields.base.value = 'paper';
    fields.version.value = 'modern';
    fields.hidden.value = 'rp.guild.pass';
    fields.model.value = 'cubeinsquare:item/paper/guild_pass';
    fields.cmd.value = 'guild_pass';
    fields.tags.value = 'guild, pass, archive';
    fields.notes.value = 'Used for guarded rooms and scripted checks.';
  });
  document.getElementById('cic-import-json').addEventListener('click', () => importFile.click());
  importFile.addEventListener('change', async () => {
    const file = importFile.files && importFile.files[0];
    if (file) await importJsonFile(file);
    importFile.value = '';
  });
  document.getElementById('cic-export-json').addEventListener('click', () => exportContent('json'));
  document.getElementById('cic-export-csv').addEventListener('click', () => exportContent('csv'));
  document.getElementById('cic-export-md').addEventListener('click', () => exportContent('md'));
  document.getElementById('cic-clear').addEventListener('click', () => {
    if (!loadCatalog().length) return;
    if (!confirm(copy.clearConfirm)) return;
    localStorage.removeItem(STORAGE_KEY);
    resetForm();
    render();
  });
  search.addEventListener('input', render);
  render();
})();