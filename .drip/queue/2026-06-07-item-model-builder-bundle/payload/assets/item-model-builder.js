(function () {
  const copy = {
    en: {
      modeLabels: {
        model: 'Direct model',
        select: 'Select by property',
        range_dispatch: 'Range dispatch',
        condition: 'Condition'
      },
      modeOptions: {
        model: ['minecraft:model'],
        select: ['minecraft:custom_model_data', 'minecraft:main_hand', 'minecraft:display_context'],
        range_dispatch: ['minecraft:damage', 'minecraft:cooldown', 'minecraft:custom_model_data'],
        condition: ['minecraft:using_item', 'minecraft:damaged', 'minecraft:selected']
      },
      branchWhen: 'When', branchModel: 'Model path', branchThreshold: 'Threshold', branchDelete: 'Remove',
      summary: (filePath, mode, count) => 'File: ' + filePath + '. Mode: ' + mode + '. Branches: ' + count + '.',
      noteModel: 'Use a direct model when one clean file path is enough and the item does not branch at all.',
      noteSelect: 'Use select when a property chooses between named cases such as custom_model_data slots, display context, or the main hand.',
      noteRange: 'Use range_dispatch when a numeric property steps through thresholds like damage or cooldown.',
      noteCondition: 'Use condition for true/false states such as selected, damaged, or using_item.',
      examples: {
        model: { ns:'cubeinsquare', file:'paper/guild_pass', fallback:'cubeinsquare:item/paper/guild_pass', branches:[] },
        select: { ns:'cubeinsquare', file:'book/formulary', fallback:'minecraft:item/book', property:'minecraft:custom_model_data', index:0, branches:[{when:'novice', model:'cubeinsquare:item/book/formulary_novice'}, {when:'master', model:'cubeinsquare:item/book/formulary_master'}] },
        range_dispatch: { ns:'cubeinsquare', file:'wand/charge', fallback:'cubeinsquare:item/wand/charge_0', property:'minecraft:damage', branches:[{when:'0.25', model:'cubeinsquare:item/wand/charge_1'}, {when:'0.6', model:'cubeinsquare:item/wand/charge_2'}] },
        condition: { ns:'cubeinsquare', file:'compass/selected', fallback:'cubeinsquare:item/compass_idle', property:'minecraft:selected', branches:[{when:'true', model:'cubeinsquare:item/compass_selected'}, {when:'false', model:'cubeinsquare:item/compass_idle'}] },
        singleProp: { mode:'model', ns:'cubeinsquare', file:'token/archive_key', fallback:'cubeinsquare:item/token/archive_key', branches:[] },
        stateSwitch: { mode:'condition', ns:'cubeinsquare', file:'compass/selected', fallback:'cubeinsquare:item/compass_idle', property:'minecraft:selected', branches:[{when:'true', model:'cubeinsquare:item/compass_selected'}, {when:'false', model:'cubeinsquare:item/compass_idle'}] },
        chargeStages: { mode:'range_dispatch', ns:'cubeinsquare', file:'wand/charge', fallback:'cubeinsquare:item/wand/charge_0', property:'minecraft:cooldown', branches:[{when:'0.2', model:'cubeinsquare:item/wand/charge_1'}, {when:'0.6', model:'cubeinsquare:item/wand/charge_2'}, {when:'0.9', model:'cubeinsquare:item/wand/charge_3'}] },
        handContext: { mode:'select', ns:'cubeinsquare', file:'lantern/hand', fallback:'cubeinsquare:item/lantern/hand_idle', property:'minecraft:main_hand', branches:[{when:'left', model:'cubeinsquare:item/lantern/hand_left'}, {when:'right', model:'cubeinsquare:item/lantern/hand_right'}] }
      }
    },
    ru: {
      modeLabels: { model:'Одна модель', select:'Select по свойству', range_dispatch:'Range dispatch', condition:'Condition' },
      modeOptions: { model:['minecraft:model'], select:['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context'], range_dispatch:['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data'], condition:['minecraft:using_item','minecraft:damaged','minecraft:selected'] },
      branchWhen:'Когда', branchModel:'Путь модели', branchThreshold:'Порог', branchDelete:'Убрать',
      summary:(filePath, mode, count) => 'Файл: ' + filePath + '. Режим: ' + mode + '. Веток: ' + count + '.',
      noteModel:'Используйте прямую модель, когда нужен один фиксированный путь и ветвление вообще не требуется.',
      noteSelect:'Режим select нужен, когда свойство выбирает между именованными кейсами: слотами custom_model_data, контекстом отображения или рукой.',
      noteRange:'Range dispatch нужен, когда числовое свойство проходит через пороги вроде урона или кулдауна.',
      noteCondition:'Condition подходит для true/false состояний вроде selected, damaged или using_item.',
      examples: {}
    },
    fr: {
      modeLabels: { model:'Modèle direct', select:'Select par propriété', range_dispatch:'Range dispatch', condition:'Condition' },
      modeOptions: { model:['minecraft:model'], select:['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context'], range_dispatch:['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data'], condition:['minecraft:using_item','minecraft:damaged','minecraft:selected'] },
      branchWhen:'Quand', branchModel:'Chemin du modèle', branchThreshold:'Seuil', branchDelete:'Retirer',
      summary:(filePath, mode, count) => 'Fichier : ' + filePath + '. Mode : ' + mode + '. Branches : ' + count + '.',
      noteModel:'Utilisez un modèle direct quand un seul chemin fixe suffit et qu’aucune branche n’est nécessaire.',
      noteSelect:'Utilisez select quand une propriété choisit entre des cas nommés comme custom_model_data, display_context ou la main.',
      noteRange:'Range dispatch sert quand une propriété numérique passe par des seuils comme damage ou cooldown.',
      noteCondition:'Condition sert aux états vrai/faux comme selected, damaged ou using_item.',
      examples: {}
    },
    de: {
      modeLabels: { model:'Direktes Modell', select:'Select nach Eigenschaft', range_dispatch:'Range dispatch', condition:'Condition' },
      modeOptions: { model:['minecraft:model'], select:['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context'], range_dispatch:['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data'], condition:['minecraft:using_item','minecraft:damaged','minecraft:selected'] },
      branchWhen:'Wenn', branchModel:'Modellpfad', branchThreshold:'Schwelle', branchDelete:'Entfernen',
      summary:(filePath, mode, count) => 'Datei: ' + filePath + '. Modus: ' + mode + '. Zweige: ' + count + '.',
      noteModel:'Nutze ein direktes Modell, wenn ein einziger fester Pfad reicht und keine Verzweigung nötig ist.',
      noteSelect:'Nutze select, wenn eine Eigenschaft zwischen benannten Fällen wie custom_model_data, display_context oder der Hand wählt.',
      noteRange:'Range dispatch ist gut, wenn ein numerischer Wert über Schwellen wie Schaden oder Cooldown läuft.',
      noteCondition:'Condition passt zu true/false-Zuständen wie selected, damaged oder using_item.',
      examples: {}
    }
  };

  const lang = document.documentElement.lang || 'en';
  const locale = copy[lang] || copy.en;
  locale.examples = { ...copy.en.examples, ...locale.examples };

  const modeInput = document.getElementById('imb-mode');
  const namespaceInput = document.getElementById('imb-namespace');
  const fileInput = document.getElementById('imb-file');
  const fallbackInput = document.getElementById('imb-fallback');
  const propertyInput = document.getElementById('imb-property');
  const indexInput = document.getElementById('imb-index');
  const indexField = document.querySelector('[data-imb-index-field]');
  const propertyField = document.querySelector('[data-imb-property-field]');
  const branchList = document.getElementById('imb-branch-list');
  const output = document.getElementById('imb-output');
  const summary = document.getElementById('imb-summary');
  const modeNote = document.getElementById('imb-mode-note');
  const pathPreview = document.getElementById('imb-path-preview');
  const copyButton = document.getElementById('imb-copy');

  function buildBranchRow(mode, value = {}) {
    const card = document.createElement('div');
    card.className = 'imb-branch-card';
    const whenLabel = mode === 'range_dispatch' ? locale.branchThreshold : locale.branchWhen;
    card.innerHTML =
      '<div class="tool-form-grid">' +
        '<div class="tool-field"><label>' + whenLabel + '</label><input class="imb-when" type="text" value="' + (value.when || '') + '"></div>' +
        '<div class="tool-field"><label>' + locale.branchModel + '</label><input class="imb-model" type="text" value="' + (value.model || '') + '"></div>' +
      '</div>' +
      '<div class="imb-branch-actions"><button class="tool-button tool-button-secondary imb-remove" type="button">' + locale.branchDelete + '</button></div>';
    card.querySelector('.imb-remove').addEventListener('click', () => {
      card.remove();
      update();
    });
    card.querySelectorAll('input').forEach((input) => input.addEventListener('input', update));
    return card;
  }

  function getBranchData() {
    return Array.from(branchList.querySelectorAll('.imb-branch-card')).map((card) => ({
      when: card.querySelector('.imb-when').value.trim(),
      model: card.querySelector('.imb-model').value.trim()
    })).filter((branch) => branch.model);
  }

  function populatePropertyOptions() {
    const previous = propertyInput.value;
    const options = locale.modeOptions[modeInput.value] || locale.modeOptions.model;
    propertyInput.innerHTML = options.map((option) => '<option value="' + option + '">' + option + '</option>').join('');
    if (options.includes(previous)) propertyInput.value = previous;
    propertyField.hidden = modeInput.value === 'model';
    indexField.hidden = !(modeInput.value === 'select' && propertyInput.value === 'minecraft:custom_model_data');
  }

  function definitionObject() {
    const fallbackModel = fallbackInput.value.trim() || 'minecraft:item/paper';
    const branches = getBranchData();
    if (modeInput.value === 'model') {
      return { model: { type: 'minecraft:model', model: fallbackModel } };
    }
    if (modeInput.value === 'select') {
      const model = {
        type: 'minecraft:select',
        property: propertyInput.value,
        cases: branches.map((branch) => ({
          when: /^-?\d+(\.\d+)?$/.test(branch.when) ? Number(branch.when) : branch.when,
          model: { type: 'minecraft:model', model: branch.model }
        })),
        fallback: { type: 'minecraft:model', model: fallbackModel }
      };
      if (propertyInput.value === 'minecraft:custom_model_data') model.index = Number(indexInput.value || 0);
      return { model };
    }
    if (modeInput.value === 'range_dispatch') {
      return {
        model: {
          type: 'minecraft:range_dispatch',
          property: propertyInput.value,
          entries: branches.map((branch) => ({
            threshold: Number(branch.when || 0),
            model: { type: 'minecraft:model', model: branch.model }
          })).sort((a, b) => a.threshold - b.threshold),
          fallback: { type: 'minecraft:model', model: fallbackModel }
        }
      };
    }
    return {
      model: {
        type: 'minecraft:condition',
        property: propertyInput.value,
        on_true: { type: 'minecraft:model', model: branches[0]?.model || fallbackModel },
        on_false: { type: 'minecraft:model', model: branches[1]?.model || fallbackModel }
      }
    };
  }

  function noteForMode(mode) {
    if (mode === 'model') return locale.noteModel;
    if (mode === 'select') return locale.noteSelect;
    if (mode === 'range_dispatch') return locale.noteRange;
    return locale.noteCondition;
  }

  function update() {
    populatePropertyOptions();
    const filePath = 'assets/' + (namespaceInput.value.trim() || 'minecraft') + '/items/' + (fileInput.value.trim() || 'item') + '.json';
    output.value = JSON.stringify(definitionObject(), null, 2);
    const modeLabel = locale.modeLabels[modeInput.value] || modeInput.value;
    summary.textContent = locale.summary(filePath, modeLabel, getBranchData().length);
    modeNote.textContent = noteForMode(modeInput.value);
    pathPreview.textContent = filePath;
  }

  function loadScenario(name) {
    const example = locale.examples[name] || locale.examples.select;
    const nextMode = example.mode || name;
    namespaceInput.value = example.ns || 'cubeinsquare';
    fileInput.value = example.file || 'item';
    fallbackInput.value = example.fallback || 'minecraft:item/paper';
    modeInput.value = nextMode;
    populatePropertyOptions();
    if (example.property) propertyInput.value = example.property;
    indexInput.value = typeof example.index !== 'undefined' ? example.index : 0;
    branchList.innerHTML = '';
    (example.branches || []).forEach((branch) => branchList.appendChild(buildBranchRow(nextMode, branch)));
    if (!(example.branches || []).length && nextMode === 'condition') {
      branchList.appendChild(buildBranchRow('condition', { when: 'true', model: fallbackInput.value.trim() || 'minecraft:item/paper' }));
      branchList.appendChild(buildBranchRow('condition', { when: 'false', model: fallbackInput.value.trim() || 'minecraft:item/paper' }));
    }
    update();
  }

  document.getElementById('imb-add-case').addEventListener('click', () => {
    branchList.appendChild(buildBranchRow(modeInput.value));
    update();
  });
  document.getElementById('imb-load-example').addEventListener('click', () => loadScenario(modeInput.value));
  document.getElementById('imb-reset').addEventListener('click', () => loadScenario('select'));
  document.querySelectorAll('[data-imb-example]').forEach((button) => {
    button.addEventListener('click', () => loadScenario(button.dataset.imbExample));
  });
  copyButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText(output.value);
    const original = copyButton.textContent;
    copyButton.textContent = copyButton.dataset.copiedLabel || original;
    setTimeout(() => { copyButton.textContent = original; }, 1400);
  });

  [modeInput, namespaceInput, fileInput, fallbackInput, propertyInput, indexInput].forEach((input) => {
    input.addEventListener('input', update);
    input.addEventListener('change', update);
  });
  propertyInput.addEventListener('change', update);
  modeInput.addEventListener('change', () => {
    if (modeInput.value === 'condition' && branchList.children.length < 2) {
      branchList.innerHTML = '';
      branchList.appendChild(buildBranchRow('condition', { when: 'true', model: fallbackInput.value.trim() || 'minecraft:item/paper' }));
      branchList.appendChild(buildBranchRow('condition', { when: 'false', model: fallbackInput.value.trim() || 'minecraft:item/paper' }));
    }
    update();
  });

  loadScenario('select');
})();