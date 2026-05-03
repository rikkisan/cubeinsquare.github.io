
(function () {
    const copy = {
        en: {
            modeOptions: {
                model: ['Direct model', ['minecraft:model']],
                select: ['Select by property', ['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context']],
                range_dispatch: ['Range dispatch', ['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data']],
                condition: ['Condition', ['minecraft:using_item','minecraft:damaged','minecraft:selected']]
            },
            branchWhen: 'When',
            branchModel: 'Model path',
            branchThreshold: 'Threshold',
            branchDelete: 'Remove',
            summary: (filePath, mode, count) => `File: ${filePath}. Mode: ${mode}. Branches: ${count}.`,
            examples: {
                model: { ns:'cubeinsquare', file:'paper/guild_pass', fallback:'cubeinsquare:item/paper/guild_pass' },
                select: { ns:'cubeinsquare', file:'book/formulary', fallback:'minecraft:item/book', property:'minecraft:custom_model_data', index:0, branches:[{when:'novice',model:'cubeinsquare:item/book/formulary_novice'},{when:'master',model:'cubeinsquare:item/book/formulary_master'}] },
                range_dispatch: { ns:'cubeinsquare', file:'wand/charge', fallback:'cubeinsquare:item/wand/charge_0', property:'minecraft:damage', branches:[{when:'0.25',model:'cubeinsquare:item/wand/charge_1'},{when:'0.6',model:'cubeinsquare:item/wand/charge_2'}] },
                condition: { ns:'cubeinsquare', file:'compass/selected', fallback:'cubeinsquare:item/compass_idle', property:'minecraft:selected', branches:[{when:'true',model:'cubeinsquare:item/compass_selected'},{when:'false',model:'cubeinsquare:item/compass_idle'}] }
            }
        },
        ru: {
            modeOptions: {
                model: ['Прямая model', ['minecraft:model']],
                select: ['Select по свойству', ['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context']],
                range_dispatch: ['Range dispatch', ['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data']],
                condition: ['Condition', ['minecraft:using_item','minecraft:damaged','minecraft:selected']]
            },
            branchWhen: 'Когда',
            branchModel: 'Путь модели',
            branchThreshold: 'Порог',
            branchDelete: 'Убрать',
            summary: (filePath, mode, count) => `Файл: ${filePath}. Режим: ${mode}. Веток: ${count}.`,
            examples: {}
        },
        fr: {
            modeOptions: {
                model: ['Model direct', ['minecraft:model']],
                select: ['Select par propriété', ['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context']],
                range_dispatch: ['Range dispatch', ['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data']],
                condition: ['Condition', ['minecraft:using_item','minecraft:damaged','minecraft:selected']]
            },
            branchWhen: 'Quand',
            branchModel: 'Chemin du modèle',
            branchThreshold: 'Seuil',
            branchDelete: 'Retirer',
            summary: (filePath, mode, count) => `Fichier : ${filePath}. Mode : ${mode}. Branches : ${count}.`,
            examples: {}
        },
        de: {
            modeOptions: {
                model: ['Direktes model', ['minecraft:model']],
                select: ['Select nach Eigenschaft', ['minecraft:custom_model_data','minecraft:main_hand','minecraft:display_context']],
                range_dispatch: ['Range dispatch', ['minecraft:damage','minecraft:cooldown','minecraft:custom_model_data']],
                condition: ['Condition', ['minecraft:using_item','minecraft:damaged','minecraft:selected']]
            },
            branchWhen: 'Wenn',
            branchModel: 'Modellpfad',
            branchThreshold: 'Schwelle',
            branchDelete: 'Entfernen',
            summary: (filePath, mode, count) => `Datei: ${filePath}. Modus: ${mode}. Zweige: ${count}.`,
            examples: {}
        }
    };

    const lang = document.documentElement.lang || 'en';
    const locale = copy[lang] || copy.en;
    locale.examples = copy.en.examples;

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
    const copyButton = document.getElementById('imb-copy');

    function buildBranchRow(mode, value = {}) {
        const card = document.createElement('div');
        card.className = 'imb-branch-card';
        const whenLabel = mode === 'range_dispatch' ? locale.branchThreshold : locale.branchWhen;
        const whenValue = value.when || '';
        const modelValue = value.model || '';
        card.innerHTML = `
            <div class="tool-form-grid">
                <div class="tool-field">
                    <label>${whenLabel}</label>
                    <input class="imb-when" type="text" value="${whenValue}">
                </div>
                <div class="tool-field">
                    <label>${locale.branchModel}</label>
                    <input class="imb-model" type="text" value="${modelValue}">
                </div>
            </div>
            <div class="imb-branch-actions">
                <button class="tool-button tool-button-secondary imb-remove" type="button">${locale.branchDelete}</button>
            </div>
        `;
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
        const [label, options] = locale.modeOptions[modeInput.value];
        propertyInput.innerHTML = options.map((option) => `<option value="${option}">${option}</option>`).join('');
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
            if (propertyInput.value === 'minecraft:custom_model_data') {
                model.index = Number(indexInput.value || 0);
            }
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

    function update() {
        populatePropertyOptions();
        const filePath = `assets/${namespaceInput.value.trim() || 'minecraft'}/items/${fileInput.value.trim() || 'item'}.json`;
        const json = JSON.stringify(definitionObject(), null, 2);
        output.value = json;
        summary.textContent = locale.summary(filePath, modeInput.value, getBranchData().length);
    }

    function loadExample(kind) {
        const example = locale.examples[kind];
        namespaceInput.value = example.ns;
        fileInput.value = example.file;
        fallbackInput.value = example.fallback;
        modeInput.value = kind;
        populatePropertyOptions();
        if (example.property) propertyInput.value = example.property;
        if (typeof example.index !== 'undefined') indexInput.value = example.index;
        branchList.innerHTML = '';
        (example.branches || []).forEach((branch) => branchList.appendChild(buildBranchRow(kind, branch)));
        if (!(example.branches || []).length && kind === 'condition') {
            branchList.appendChild(buildBranchRow(kind, { when: 'true', model: example.fallback }));
            branchList.appendChild(buildBranchRow(kind, { when: 'false', model: example.fallback }));
        }
        update();
    }

    document.getElementById('imb-add-case').addEventListener('click', () => {
        branchList.appendChild(buildBranchRow(modeInput.value));
        update();
    });
    document.getElementById('imb-load-example').addEventListener('click', () => loadExample(modeInput.value));
    document.getElementById('imb-reset').addEventListener('click', () => loadExample('select'));
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

    loadExample('select');
})();
