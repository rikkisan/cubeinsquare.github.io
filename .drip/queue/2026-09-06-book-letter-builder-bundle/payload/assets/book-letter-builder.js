(function () {
  const copy = window.CUBE_BOOK_BUILDER_COPY || {};
  const versionInput = document.getElementById('blb-version');
  const typeInput = document.getElementById('blb-type');
  const titleInput = document.getElementById('blb-title');
  const authorInput = document.getElementById('blb-author');
  const generationInput = document.getElementById('blb-generation');
  const targetInput = document.getElementById('blb-target');
  const pagesRoot = document.getElementById('blb-pages');
  const addPageButton = document.getElementById('blb-add-page');
  const versionNote = document.getElementById('blb-version-note');
  const summary = document.getElementById('blb-summary');
  const output = document.getElementById('blb-output');
  const copyButton = document.getElementById('blb-copy');

  function escapeText(text) {
    return String(text)
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/\n/g, '\\n');
  }

  function pageData() {
    return Array.from(pagesRoot.querySelectorAll('textarea')).map((area) => area.value.trim()).filter(Boolean);
  }

  function addPage(text = '') {
    const card = document.createElement('div');
    card.className = 'blb-page-card';
    const index = pagesRoot.children.length + 1;
    card.innerHTML = '<div class="blb-page-header"><strong>' + (copy.pageLabel || 'Page') + ' ' + index + '</strong><button type="button" class="tool-button tool-button-secondary blb-remove-page">' + (copy.removePage || 'Remove') + '</button></div><textarea></textarea>';
    const area = card.querySelector('textarea');
    area.value = text;
    area.addEventListener('input', update);
    card.querySelector('.blb-remove-page').addEventListener('click', () => {
      card.remove();
      relabelPages();
      update();
    });
    pagesRoot.appendChild(card);
    relabelPages();
  }

  function relabelPages() {
    Array.from(pagesRoot.children).forEach((card, index) => {
      const label = card.querySelector('strong');
      if (label) label.textContent = (copy.pageLabel || 'Page') + ' ' + (index + 1);
    });
  }

  function modernCommand(pages) {
    const target = (targetInput.value || '@p').trim();
    const isSigned = typeInput.value === 'signed';
    const item = isSigned ? 'minecraft:written_book' : 'minecraft:writable_book';
    if (!isSigned) {
      return '/give ' + target + ' ' + item + '[minecraft:writable_book_content={pages:[' + pages.map((page) => JSON.stringify({ raw: page })).join(',') + ']}] 1';
    }
    return '/give ' + target + ' ' + item + '[written_book_content={title:"' + escapeText(titleInput.value || '') + '",author:"' + escapeText(authorInput.value || '') + '",generation:"' + (generationInput.value || 'original') + '",pages:[' + pages.map((page) => JSON.stringify({ raw: page })).join(',') + ']}] 1';
  }

  function legacyCommand(pages) {
    const target = (targetInput.value || '@p').trim();
    const isSigned = typeInput.value === 'signed';
    const item = isSigned ? 'minecraft:written_book' : 'minecraft:writable_book';
    const pageArray = '[' + pages.map((page) => '"' + escapeText(page) + '"').join(',') + ']';
    if (!isSigned) {
      return '/give ' + target + ' ' + item + '{pages:' + pageArray + '} 1';
    }
    return '/give ' + target + ' ' + item + '{title:"' + escapeText(titleInput.value || '') + '",author:"' + escapeText(authorInput.value || '') + '",pages:' + pageArray + '} 1';
  }

  function formatSummary(pageCount) {
    const modeName = (copy.versionNames && copy.versionNames[versionInput.value]) || versionInput.value;
    return (copy.summaryPattern || '{count} page(s) prepared. Syntax: {mode}.')
      .replace('{count}', String(pageCount))
      .replace('{mode}', modeName);
  }

  function update() {
    const pages = pageData();
    versionNote.textContent = (copy.versionNotes && copy.versionNotes[versionInput.value]) || '';
    summary.textContent = formatSummary(pages.length);
    output.value = versionInput.value === 'legacy' ? legacyCommand(pages) : modernCommand(pages);
  }

  function applyPreset(name) {
    const preset = (copy.exampleData || {})[name];
    if (!preset) return;
    versionInput.value = preset.version || 'modern';
    typeInput.value = preset.type || 'signed';
    titleInput.value = preset.title || '';
    authorInput.value = preset.author || '';
    generationInput.value = preset.generation || 'original';
    targetInput.value = preset.target || '@p';
    pagesRoot.innerHTML = '';
    (preset.pages || ['']).forEach((page) => addPage(page));
    update();
  }

  document.querySelectorAll('[data-blb-preset]').forEach((button) => {
    button.addEventListener('click', () => applyPreset(button.dataset.blbPreset));
  });
  addPageButton.addEventListener('click', () => {
    addPage('');
    update();
  });
  [versionInput, typeInput, titleInput, authorInput, generationInput, targetInput].forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(output.value);
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = output.value;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      document.body.removeChild(area);
    }
    const original = copyButton.textContent;
    copyButton.textContent = copy.copiedButton || original;
    setTimeout(() => { copyButton.textContent = original; }, 1400);
  });

  applyPreset('letter');
})();
