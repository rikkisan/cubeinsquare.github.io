(function () {
  const copy = window.CUBE_NOTIFICATION_COPY || {};
  const modeInput = document.getElementById('nb-mode');
  const targetInput = document.getElementById('nb-target');
  const titleInput = document.getElementById('nb-title');
  const subtitleInput = document.getElementById('nb-subtitle');
  const bodyInput = document.getElementById('nb-body');
  const colorInput = document.getElementById('nb-color');
  const fadeInInput = document.getElementById('nb-fade-in');
  const stayInput = document.getElementById('nb-stay');
  const fadeOutInput = document.getElementById('nb-fade-out');
  const boldInput = document.getElementById('nb-bold');
  const italicInput = document.getElementById('nb-italic');
  const output = document.getElementById('nb-output');
  const summary = document.getElementById('nb-summary');
  const note = document.getElementById('nb-mode-note');
  const copyButton = document.getElementById('nb-copy');

  function componentJson(text) {
    return JSON.stringify({
      text,
      color: colorInput.value || 'white',
      ...(boldInput.checked ? { bold: true } : {}),
      ...(italicInput.checked ? { italic: true } : {})
    });
  }

  function commands() {
    const mode = modeInput.value;
    const target = (targetInput.value || '@a').trim();
    const title = (titleInput.value || bodyInput.value || '').trim();
    const subtitle = (subtitleInput.value || '').trim();
    const body = (bodyInput.value || titleInput.value || '').trim();
    const fadeIn = Number(fadeInInput.value || 10);
    const stay = Number(stayInput.value || 60);
    const fadeOut = Number(fadeOutInput.value || 20);
    const lines = [];

    if (mode === 'title') {
      lines.push('/title ' + target + ' times ' + fadeIn + ' ' + stay + ' ' + fadeOut);
      if (title) lines.push('/title ' + target + ' title ' + componentJson(title));
      if (subtitle) lines.push('/title ' + target + ' subtitle ' + componentJson(subtitle));
      return lines;
    }
    if (mode === 'actionbar') {
      if (body) lines.push('/title ' + target + ' actionbar ' + componentJson(body));
      return lines;
    }
    if (mode === 'tellraw') {
      if (body) lines.push('/tellraw ' + target + ' ' + componentJson(body));
      return lines;
    }
    lines.push('/title ' + target + ' times ' + fadeIn + ' ' + stay + ' ' + fadeOut);
    if (title) lines.push('/title ' + target + ' title ' + componentJson(title));
    if (subtitle) lines.push('/title ' + target + ' subtitle ' + componentJson(subtitle));
    if (body) lines.push('/title ' + target + ' actionbar ' + componentJson(body));
    return lines;
  }

  function update() {
    const lines = commands();
    const modeName = (copy.modeNames && copy.modeNames[modeInput.value]) || modeInput.value;
    output.value = lines.join('\n');
    summary.textContent = formatSummary(lines.length, modeName);
    if (copy.modeNotes) note.textContent = copy.modeNotes[modeInput.value] || '';
  }

  function formatSummary(count, mode) {
    const pattern = copy.summaryPattern || '{count} command(s) generated. Mode: {mode}.';
    return pattern.replace('{count}', String(count)).replace('{mode}', String(mode));
  }

  function applyPreset(name) {
    const preset = (copy.presetData || {})[name];
    if (!preset) return;
    modeInput.value = preset.mode;
    titleInput.value = preset.title || '';
    subtitleInput.value = preset.subtitle || '';
    bodyInput.value = preset.body || '';
    colorInput.value = preset.color || 'white';
    boldInput.checked = !!preset.bold;
    italicInput.checked = !!preset.italic;
    fadeInInput.value = preset.fadeIn ?? 10;
    stayInput.value = preset.stay ?? 60;
    fadeOutInput.value = preset.fadeOut ?? 20;
    update();
  }

  document.querySelectorAll('[data-nb-preset]').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.nbPreset));
  });

  [modeInput, targetInput, titleInput, subtitleInput, bodyInput, colorInput, fadeInInput, stayInput, fadeOutInput, boldInput, italicInput].forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });

  copyButton.addEventListener('click', async () => {
    const text = output.value;
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    const original = copyButton.textContent;
    copyButton.textContent = copy.copiedLabel || original;
    setTimeout(() => { copyButton.textContent = original; }, 1400);
  });

  applyPreset('warning');
})();
