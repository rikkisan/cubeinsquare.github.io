(function () {
  const lang = document.documentElement.lang || 'en';
  const copy = {
    en: {
      noteFilled: 'Use filled circles for plazas, pads, or tower floors.',
      noteOutline: 'Use outline circles for borders and crisp round frames.',
      noteRing: 'Rings are good when a border needs thickness and weight.',
      noteArch: 'Arches help when the side profile matters more than the footprint.',
      noteDome: 'Use the dome profile as a stack of radii for roofs and caps.',
      width: 'Width', cells: 'Blocks', layers: 'Layers', diameter: 'Diameter', copied: 'Copied'
    },
    ru: {
      noteFilled: 'Заполненный круг хорош для площадок, платформ и полов башен.',
      noteOutline: 'Контур круга подходит для границ и чистых круглых рамок.',
      noteRing: 'Кольца полезны, когда границе нужен визуальный вес и толщина.',
      noteArch: 'Арки удобны, когда важнее боковой профиль, а не отпечаток.',
      noteDome: 'Профиль купола лучше читать как стек радиусов для крыш и колпаков.',
      width: 'Ширина', cells: 'Блоки', layers: 'Слои', diameter: 'Диаметр', copied: 'Скопировано'
    },
    fr: {
      noteFilled: 'Les cercles pleins servent pour places, plateformes et sols de tour.',
      noteOutline: 'Les contours de cercle sont utiles pour les bordures et cadres ronds nets.',
      noteRing: 'Les anneaux donnent de l’épaisseur et du poids à une bordure.',
      noteArch: 'Les arches servent quand le profil compte plus que l’empreinte.',
      noteDome: 'Lisez le profil de dôme comme une pile de rayons pour toits et caps.',
      width: 'Largeur', cells: 'Blocs', layers: 'Couches', diameter: 'Diamètre', copied: 'Copié'
    },
    de: {
      noteFilled: 'Gefüllte Kreise eignen sich für Plätze, Plattformen und Turmböden.',
      noteOutline: 'Kreisumrisse sind gut für Ränder und saubere runde Rahmen.',
      noteRing: 'Ringe helfen, wenn eine Grenze sichtbares Gewicht und Dicke braucht.',
      noteArch: 'Bögen sind sinnvoll, wenn das Seitenprofil wichtiger ist als die Grundfläche.',
      noteDome: 'Das Kuppelprofil liest man am besten als Radienstapel für Dächer.',
      width: 'Breite', cells: 'Blöcke', layers: 'Lagen', diameter: 'Durchmesser', copied: 'Kopiert'
    }
  }[lang] || { noteFilled:'', noteOutline:'', noteRing:'', noteArch:'', noteDome:'', width:'Width', cells:'Blocks', layers:'Layers', diameter:'Diameter', copied:'Copied' };

  const mode = document.getElementById('cdp-mode');
  const radius = document.getElementById('cdp-radius');
  const thickness = document.getElementById('cdp-thickness');
  const thicknessField = document.querySelector('[data-cdp-thickness-field]');
  const canvas = document.getElementById('cdp-canvas');
  const output = document.getElementById('cdp-output');
  const stats = document.getElementById('cdp-stats');
  const stack = document.getElementById('cdp-stack');
  const modeNote = document.getElementById('cdp-mode-note');
  const copyButton = document.getElementById('cdp-copy');
  const copyStackButton = document.getElementById('cdp-copy-stack');
  const ctx = canvas.getContext('2d');

  const presets = {
    town: { mode: 'filled_circle', radius: 8, thickness: 2 },
    ring: { mode: 'ring', radius: 10, thickness: 2 },
    cap: { mode: 'dome_profile', radius: 7, thickness: 2 },
    arch: { mode: 'arch', radius: 6, thickness: 2 }
  };

  function gridForMode() {
    const r = Math.max(1, Number(radius.value || 1));
    const t = Math.max(1, Number(thickness.value || 1));
    if (mode.value === 'arch' || mode.value === 'dome_profile') {
      const rows = [];
      for (let y = r; y >= 0; y -= 1) {
        const span = Math.round(Math.sqrt(Math.max(0, r * r - y * y)));
        const row = [];
        for (let x = -r; x <= r; x += 1) {
          const on = mode.value === 'arch'
            ? Math.abs(Math.abs(x) - span) <= 0.5 || (y === 0 && Math.abs(x) <= span)
            : Math.abs(x) <= span;
          row.push(on ? 1 : 0);
        }
        rows.push({ y, radius: span, width: span * 2 + 1, row });
      }
      return rows;
    }
    const rows = [];
    for (let y = r; y >= -r; y -= 1) {
      const row = [];
      for (let x = -r; x <= r; x += 1) {
        const dist = Math.sqrt(x * x + y * y);
        let on = false;
        if (mode.value === 'filled_circle') on = dist <= r + 0.15;
        if (mode.value === 'outline_circle') on = Math.abs(dist - r) <= 0.55;
        if (mode.value === 'ring') on = dist <= r + 0.15 && dist >= Math.max(0, r - t) - 0.35;
        row.push(on ? 1 : 0);
      }
      rows.push({ y, width: row.length, filled: row.filter(Boolean).length, row });
    }
    return rows;
  }

  function draw(rows) {
    const size = rows[0]?.row.length || 1;
    const cell = Math.max(8, Math.floor((canvas.width - 32) / size));
    const actual = cell * size;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#0f1429';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const startX = Math.floor((canvas.width - actual) / 2);
    const startY = Math.floor((canvas.height - actual) / 2);
    rows.forEach((line, rowIndex) => {
      line.row.forEach((value, columnIndex) => {
        ctx.fillStyle = value ? '#74a1ff' : 'rgba(116,161,255,0.08)';
        ctx.fillRect(startX + columnIndex * cell, startY + rowIndex * cell, cell - 1, cell - 1);
      });
    });
  }

  function modeMessage() {
    if (mode.value === 'filled_circle') return copy.noteFilled;
    if (mode.value === 'outline_circle') return copy.noteOutline;
    if (mode.value === 'ring') return copy.noteRing;
    if (mode.value === 'arch') return copy.noteArch;
    return copy.noteDome;
  }

  function update() {
    const rows = gridForMode();
    draw(rows);
    output.textContent = rows.map((line) => line.row.map((value) => value ? '#' : '.').join('')).join('\n');
    const filled = rows.reduce((sum, line) => sum + line.row.filter(Boolean).length, 0);
    const width = rows[0]?.row.length || 0;
    modeNote.textContent = modeMessage();
    thicknessField.hidden = mode.value !== 'ring';
    stats.innerHTML = [
      [copy.width, width],
      [copy.diameter, Math.max(1, Number(radius.value || 1)) * 2 + 1],
      [copy.cells, filled],
      [copy.layers, rows.length]
    ].map(([label, value]) => '<div class="sphere-stat-card"><strong>' + value + '</strong><span>' + label + '</span></div>').join('');
    if (mode.value === 'dome_profile') {
      stack.innerHTML = rows.map((line) => '<div class="planner-stack-row"><span>Y +' + line.y + '</span><strong>' + line.width + ' blocks</strong></div>').join('');
      copyStackButton.hidden = false;
    } else {
      stack.innerHTML = '';
      copyStackButton.hidden = true;
    }
  }

  function copyStack() {
    const rows = gridForMode();
    const text = rows.map((line) => 'Y +' + line.y + ': ' + line.width + ' blocks').join('\n');
    return navigator.clipboard.writeText(text);
  }

  function loadPreset(name) {
    const preset = presets[name];
    if (!preset) return;
    mode.value = preset.mode;
    radius.value = preset.radius;
    thickness.value = preset.thickness;
    update();
  }

  copyButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.textContent);
    const original = copyButton.textContent;
    copyButton.textContent = copyButton.dataset.copiedLabel || copy.copied;
    setTimeout(() => { copyButton.textContent = original; }, 1200);
  });
  copyStackButton.addEventListener('click', async () => {
    await copyStack();
    const original = copyStackButton.textContent;
    copyStackButton.textContent = copyStackButton.dataset.copiedLabel || copy.copied;
    setTimeout(() => { copyStackButton.textContent = original; }, 1200);
  });
  document.querySelectorAll('[data-cdp-preset]').forEach((button) => {
    button.addEventListener('click', () => loadPreset(button.dataset.cdpPreset));
  });
  [mode, radius, thickness].forEach((field) => field.addEventListener('input', update));
  update();
})();