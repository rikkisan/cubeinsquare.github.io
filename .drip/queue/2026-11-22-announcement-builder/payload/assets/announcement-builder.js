(() => {
  const root = document.querySelector('[data-announcement-builder]');
  if (!root) return;
  const $ = (id) => document.getElementById(id);
  const track = (name, params) => { if (window.CubeAnalytics) window.CubeAnalytics.track(name, params); };

  // Data pack formats, the same table as the data pack generator.
  const VERSIONS = [
    { id: '26.3',    label: '26.3',             format: 121, singular: true },
    { id: '26.2',    label: '26.2',             format: 107, singular: true },
    { id: '26.1',    label: '26.1',             format: 101, singular: true },
    { id: '1.21.11', label: '1.21.11',          format: 94,  singular: true },
    { id: '1.21.9',  label: '1.21.9 - 1.21.10', format: 88,  singular: true },
    { id: '1.21.7',  label: '1.21.7 - 1.21.8',  format: 81,  singular: true },
    { id: '1.21.6',  label: '1.21.6',           format: 80,  singular: true },
    { id: '1.21.5',  label: '1.21.5',           format: 71,  singular: true },
    { id: '1.21.4',  label: '1.21.4',           format: 61,  singular: true },
    { id: '1.21.2',  label: '1.21.2 - 1.21.3',  format: 57,  singular: true },
    { id: '1.21',    label: '1.21 - 1.21.1',    format: 48,  singular: true },
    { id: '1.20.5',  label: '1.20.5 - 1.20.6',  format: 41,  singular: false },
    { id: '1.20.3',  label: '1.20.3 - 1.20.4',  format: 26,  singular: false },
    { id: '1.20.2',  label: '1.20.2',           format: 18,  singular: false },
    { id: '1.20',    label: '1.20 - 1.20.1',    format: 15,  singular: false }
  ];
  const COLORS = ['white', 'gray', 'dark_gray', 'yellow', 'gold', 'red', 'dark_red', 'green', 'dark_green', 'aqua', 'dark_aqua', 'blue', 'light_purple', 'dark_purple'];

  const LOCALE = (document.documentElement.lang || 'en').slice(0, 2);
  const T = {
    en: {
      message: 'Message', remove: 'Remove', text: 'Text', color: 'Color', bold: 'Bold',
      link: 'Link (optional)', hover: 'Hover text (optional)', linkOff: 'Links are clickable only in chat.',
      empty: 'Add at least one message with text.', copied: 'Copied',
      summary: (n, mins, order) => `${n} message(s), one every ${mins} min, ${order}.`,
      inOrder: 'in order', atRandom: 'at random', randomOld: 'Random order needs 1.20.2 or newer; this version gets them in order.',
      commandsNote: '# Server console: as written. Chat or a command block: put a slash in front.',
      startComment: '# Runs on every /reload when the pack starts itself; or run: function ',
      stopComment: '# Stops the broadcast until the next /reload or start.',
      nextComment: '# Shows the next message and books the one after it.'
    },
    ru: {
      message: 'Сообщение', remove: 'Убрать', text: 'Текст', color: 'Цвет', bold: 'Жирный',
      link: 'Ссылка (необязательно)', hover: 'Подсказка при наведении (необязательно)', linkOff: 'Ссылки кликаются только в чате.',
      empty: 'Добавьте хотя бы одно сообщение с текстом.', copied: 'Скопировано',
      summary: (n, mins, order) => `Сообщений: ${n}, по одному раз в ${mins} мин, ${order}.`,
      inOrder: 'по очереди', atRandom: 'в случайном порядке', randomOld: 'Случайный порядок работает с 1.20.2; для этой версии сообщения идут по очереди.',
      commandsNote: '# Консоль сервера: как есть. Чат или командный блок: добавьте слэш в начало.',
      startComment: '# Выполняется при каждом /reload, если пак запускается сам; вручную: function ',
      stopComment: '# Останавливает рассылку до следующего /reload или запуска.',
      nextComment: '# Показывает следующее сообщение и назначает следующее за ним.'
    },
    fr: {
      message: 'Message', remove: 'Retirer', text: 'Texte', color: 'Couleur', bold: 'Gras',
      link: 'Lien (optionnel)', hover: 'Texte au survol (optionnel)', linkOff: 'Les liens ne sont cliquables que dans le chat.',
      empty: 'Ajoutez au moins un message avec du texte.', copied: 'Copié',
      summary: (n, mins, order) => `${n} message(s), un toutes les ${mins} min, ${order}.`,
      inOrder: 'dans l’ordre', atRandom: 'au hasard', randomOld: 'L’ordre aléatoire demande la 1.20.2 ou plus ; cette version les reçoit dans l’ordre.',
      commandsNote: '# Console du serveur : tel quel. Chat ou bloc de commande : ajoutez une barre oblique devant.',
      startComment: '# S’exécute à chaque /reload si le pack démarre seul ; à la main : function ',
      stopComment: '# Arrête l’annonce jusqu’au prochain /reload ou démarrage.',
      nextComment: '# Affiche le message suivant et programme celui d’après.'
    },
    de: {
      message: 'Nachricht', remove: 'Entfernen', text: 'Text', color: 'Farbe', bold: 'Fett',
      link: 'Link (optional)', hover: 'Hover-Text (optional)', linkOff: 'Links sind nur im Chat klickbar.',
      empty: 'Füge mindestens eine Nachricht mit Text hinzu.', copied: 'Kopiert',
      summary: (n, mins, order) => `${n} Nachricht(en), eine alle ${mins} Min., ${order}.`,
      inOrder: 'der Reihe nach', atRandom: 'zufällig', randomOld: 'Zufällige Reihenfolge braucht 1.20.2 oder neuer; diese Version bekommt sie der Reihe nach.',
      commandsNote: '# Serverkonsole: so wie es steht. Chat oder Befehlsblock: einen Schrägstrich davorsetzen.',
      startComment: '# Läuft bei jedem /reload, wenn das Paket selbst startet; von Hand: function ',
      stopComment: '# Stoppt die Durchsage bis zum nächsten /reload oder Start.',
      nextComment: '# Zeigt die nächste Nachricht und plant die danach.'
    }
  };
  const t = T[LOCALE] || T.en;

  const PRESETS = (window.CUBE_ANNOUNCEMENT_PRESETS || {});
  let messages = [];

  function currentVersion() {
    return VERSIONS.find((v) => v.id === $('ab-version').value) || VERSIONS[0];
  }

  function safeNamespace(value) {
    return String(value || 'announce').trim().toLowerCase().replace(/[^a-z0-9_.-]/g, '_') || 'announce';
  }

  function safeFileName(value) {
    return String(value || 'announcements').trim().replace(/[^a-zA-Z0-9а-яёА-ЯЁ _-]/g, '_').replace(/\s+/g, '_') || 'announcements';
  }

  function dir(version, name) {
    // 1.21 renamed the folders to the singular (functions -> function, tags/functions -> tags/function).
    return version.singular ? name : name + 's';
  }

  function mcmeta(version, description) {
    // 1.21.9 (data pack format 88) replaced pack_format with min_format and max_format.
    const pack = version.format >= 88
      ? { description, min_format: version.format, max_format: version.format }
      : { pack_format: version.format, description };
    return JSON.stringify({ pack }, null, 2) + '\n';
  }

  /**
   * One text component per message. Quoted keys make it valid JSON (before 1.21.5) and valid
   * SNBT (1.21.5 and newer), so the same command runs on every version. Hover and click are
   * written in both namings: 1.21.5 renamed them, and each version ignores the other's keys.
   */
  function messageComponent(message, withPrefix, allowLink) {
    const parts = [];
    const prefix = $('ab-prefix').value;
    if (withPrefix && prefix.trim()) parts.push({ text: prefix, color: $('ab-prefix-color').value });
    const part = { text: message.text, color: message.color || 'white' };
    if (message.bold) part.bold = true;
    const url = String(message.link || '').trim();
    if (allowLink && /^https?:\/\//i.test(url)) {
      part.underlined = true;
      const hover = String(message.hover || '').trim() || url;
      part.hoverEvent = { action: 'show_text', contents: hover };
      part.hover_event = { action: 'show_text', value: hover };
      part.clickEvent = { action: 'open_url', value: url };
      part.click_event = { action: 'open_url', url: url };
    }
    parts.push(part);
    return JSON.stringify(parts.length === 1 ? parts[0] : parts);
  }

  function messageCommands(message) {
    const target = String($('ab-target').value || '@a').trim() || '@a';
    const channel = $('ab-channel').value;
    if (channel === 'actionbar') return [`title ${target} actionbar ${messageComponent(message, true, false)}`];
    if (channel === 'title') {
      // A title has no room for a prefix; the prefix goes into the subtitle above it when set.
      const lines = [`title ${target} times 10 70 20`];
      if ($('ab-prefix').value.trim()) {
        lines.push(`title ${target} subtitle ${JSON.stringify({ text: $('ab-prefix').value.trim(), color: $('ab-prefix-color').value })}`);
      }
      lines.push(`title ${target} title ${messageComponent(message, false, false)}`);
      return lines;
    }
    return [`tellraw ${target} ${messageComponent(message, true, true)}`];
  }

  function activeMessages() {
    return messages.filter((m) => String(m.text || '').trim());
  }

  function intervalMinutes() {
    const n = Math.round(Number($('ab-interval').value));
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 1440) : 5;
  }

  function useRandom(version) {
    // /random arrived in 1.20.2 (data pack format 18).
    return $('ab-order').value === 'random' && version.format >= 18;
  }

  function buildFiles() {
    const version = currentVersion();
    const ns = safeNamespace($('ab-namespace').value);
    // Objective names take letters, digits and _ . - + ; the namespace already fits that set.
    const objective = ns + '.broadcast';
    const list = activeMessages();
    const ticks = intervalMinutes() * 1200;
    const fnDir = dir(version, 'function');
    const files = [];

    files.push({ path: 'pack.mcmeta', content: mcmeta(version, String($('ab-name').value || 'Announcements').trim()) });

    files.push({
      path: `data/${ns}/${fnDir}/start.mcfunction`,
      content: [
        t.startComment + ns + ':start',
        `scoreboard objectives add ${objective} dummy`,
        `scoreboard players set #next ${objective} 0`,
        `schedule function ${ns}:next ${ticks}t replace`
      ].join('\n') + '\n'
    });

    const next = [t.nextComment];
    if (useRandom(version)) {
      next.push(`execute store result score #next ${objective} run random value 1..${list.length}`);
    } else {
      next.push(`scoreboard players add #next ${objective} 1`);
      next.push(`execute if score #next ${objective} matches ${list.length + 1}.. run scoreboard players set #next ${objective} 1`);
    }
    list.forEach((message, index) => {
      messageCommands(message).forEach((command) => {
        next.push(`execute if score #next ${objective} matches ${index + 1} run ${command}`);
      });
    });
    next.push(`schedule function ${ns}:next ${ticks}t replace`);
    files.push({ path: `data/${ns}/${fnDir}/next.mcfunction`, content: next.join('\n') + '\n' });

    files.push({ path: `data/${ns}/${fnDir}/stop.mcfunction`, content: t.stopComment + '\n' + `schedule clear ${ns}:next` + '\n' });

    if ($('ab-autostart').checked) {
      files.push({
        path: `data/minecraft/${dir(version, 'tags/function')}/load.json`,
        content: JSON.stringify({ values: [`${ns}:start`] }, null, 2) + '\n'
      });
    }
    return files;
  }

  function commandsText() {
    const lines = [t.commandsNote];
    activeMessages().forEach((message) => messageCommands(message).forEach((line) => lines.push(line)));
    return lines.join('\n');
  }

  function field(labelText, control) {
    const label = document.createElement('label');
    label.className = 'tool-field';
    const span = document.createElement('span');
    span.textContent = labelText;
    label.append(span, control);
    return label;
  }

  function render() {
    const list = $('ab-messages');
    list.innerHTML = '';
    const chat = $('ab-channel').value === 'chat';
    messages.forEach((message, index) => {
      const card = document.createElement('div');
      card.className = 'trade-card';
      const header = document.createElement('div');
      header.className = 'trade-card-header';
      const title = document.createElement('h3');
      title.textContent = `${t.message} ${index + 1}`;
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'tool-button tool-button-secondary';
      remove.textContent = t.remove;
      remove.addEventListener('click', () => { messages.splice(index, 1); render(); update(); });
      header.append(title, remove);

      const grid = document.createElement('div');
      grid.className = 'tool-form-grid';
      const text = document.createElement('input');
      text.type = 'text';
      text.value = message.text;
      text.addEventListener('input', () => { message.text = text.value; update(); });
      const color = document.createElement('select');
      COLORS.forEach((c) => { const o = document.createElement('option'); o.value = c; o.textContent = c; color.append(o); });
      color.value = message.color || 'white';
      color.addEventListener('change', () => { message.color = color.value; update(); });
      const bold = document.createElement('input');
      bold.type = 'checkbox';
      bold.checked = Boolean(message.bold);
      bold.addEventListener('change', () => { message.bold = bold.checked; update(); });
      const boldLine = document.createElement('label');
      boldLine.className = 'tool-checkline';
      const boldText = document.createElement('span');
      boldText.textContent = t.bold;
      boldLine.append(bold, boldText);
      const link = document.createElement('input');
      link.type = 'url';
      link.placeholder = 'https://';
      link.value = message.link || '';
      link.disabled = !chat;
      link.addEventListener('input', () => { message.link = link.value; update(); });
      const hover = document.createElement('input');
      hover.type = 'text';
      hover.value = message.hover || '';
      hover.disabled = !chat;
      hover.addEventListener('input', () => { message.hover = hover.value; update(); });

      const textField = field(t.text, text);
      textField.style.gridColumn = '1 / -1';
      grid.append(textField, field(t.color, color), boldLine, field(t.link, link), field(t.hover, hover));
      card.append(header, grid);
      if (!chat) {
        const note = document.createElement('p');
        note.className = 'tool-summary';
        note.textContent = t.linkOff;
        card.append(note);
      }
      list.append(card);
    });
  }

  function update() {
    const version = currentVersion();
    const list = activeMessages();
    $('ab-format-note').textContent = version.format >= 88 ? `min_format ${version.format}` : `pack_format ${version.format}`;
    if (!list.length) {
      $('ab-commands').value = t.empty;
      $('ab-tree').value = '';
      $('ab-file-content').value = '';
      $('ab-summary').textContent = t.empty;
      return;
    }
    const files = buildFiles();
    $('ab-commands').value = commandsText();
    $('ab-tree').value = files.map((f) => f.path).join('\n');
    let summary = t.summary(list.length, intervalMinutes(), useRandom(version) ? t.atRandom : t.inOrder);
    if ($('ab-order').value === 'random' && !useRandom(version)) summary += ' ' + t.randomOld;
    $('ab-summary').textContent = summary;

    const select = $('ab-file-select');
    const previous = select.value;
    select.innerHTML = '';
    files.forEach((f) => { const o = document.createElement('option'); o.value = f.path; o.textContent = f.path; select.append(o); });
    if (files.some((f) => f.path === previous)) select.value = previous;
    else select.value = files.find((f) => f.path.endsWith('next.mcfunction')).path;
    $('ab-file-content').value = (files.find((f) => f.path === select.value) || files[0]).content;
  }

  function applyPreset(key) {
    const preset = PRESETS[key];
    if (!preset) return;
    if (preset.channel) $('ab-channel').value = preset.channel;
    if (preset.prefix !== undefined) $('ab-prefix').value = preset.prefix;
    if (preset.prefixColor) $('ab-prefix-color').value = preset.prefixColor;
    if (preset.interval) $('ab-interval').value = preset.interval;
    if (preset.order) $('ab-order').value = preset.order;
    messages = preset.messages.map((m) => ({ ...m }));
    render();
    update();
  }

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

  async function download() {
    if (!activeMessages().length || typeof window.JSZip !== 'function') return;
    const zip = new window.JSZip();
    buildFiles().forEach((f) => zip.file(f.path, f.content));
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = safeFileName($('ab-name').value) + '.zip';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 4000);
    track('tool_download', { file_kind: 'zip', mc_version: currentVersion().id });
  }

  const versionSelect = $('ab-version');
  VERSIONS.forEach((v) => { const o = document.createElement('option'); o.value = v.id; o.textContent = v.label; versionSelect.append(o); });
  const prefixColor = $('ab-prefix-color');
  COLORS.forEach((c) => { const o = document.createElement('option'); o.value = c; o.textContent = c; prefixColor.append(o); });
  prefixColor.value = 'gold';

  root.querySelectorAll('[data-ab-preset]').forEach((button) => {
    button.addEventListener('click', () => {
      applyPreset(button.dataset.abPreset);
      track('tool_example_load');
    });
  });
  $('ab-add').addEventListener('click', () => { messages.push({ text: '', color: 'white', bold: false, link: '', hover: '' }); render(); update(); });
  ['ab-name', 'ab-namespace', 'ab-prefix', 'ab-interval', 'ab-target'].forEach((id) => $(id).addEventListener('input', update));
  ['ab-version', 'ab-prefix-color', 'ab-order', 'ab-autostart'].forEach((id) => $(id).addEventListener('change', update));
  $('ab-channel').addEventListener('change', () => { render(); update(); });
  $('ab-file-select').addEventListener('change', update);
  $('ab-copy-commands').addEventListener('click', (e) => copyText(activeMessages().length ? $('ab-commands').value : '', e.currentTarget, 'command'));
  $('ab-copy-file').addEventListener('click', (e) => copyText($('ab-file-content').value, e.currentTarget, 'file_content'));
  $('ab-download').addEventListener('click', download);

  applyPreset(Object.keys(PRESETS)[0]);
})();
