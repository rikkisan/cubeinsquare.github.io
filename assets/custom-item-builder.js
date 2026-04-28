(function () {
    const root = document.querySelector('[data-item-builder]');
    if (!root) return;

    function trackEvent(name, params, options) {
        if (window.CubeAnalytics && typeof window.CubeAnalytics.track === 'function') {
            window.CubeAnalytics.track(name, params, options);
        }
    }

    const lang = (document.documentElement.lang || 'ru').toLowerCase().split('-')[0];
    const stringsByLang = {
        en: {
            unnamed: 'Unnamed custom item',
            items: (count) => `item${count === 1 ? '' : 's'}`,
            versionLegacy: 'Before 1.20.5',
            versionCurrent: '1.20.5-1.21.3',
            versionModern: '1.21.4+',
            copyModern: 'This version can carry a visible model route, a readable hidden ID, and richer custom_model_data slots at the same time.',
            copyLegacy: 'This version keeps the command compact and useful for older packs, older quest rewards, and legacy server utilities.',
            summary: (version, length) => `Version: ${version}. Command length: ${length} characters.`,
            labels: {
                version: 'Version',
                baseItem: 'Base item',
                hiddenId: 'Hidden item id',
                itemModel: 'item_model',
                floatSlot: 'Float slot 0',
                stringSlot: 'String slot 0',
                flagSlot: 'Flag slot 0',
                colorSlot: 'Color slot 0',
                numericCmd: 'Numeric CMD'
            },
            exampleLegacy: {
                version: 'legacy',
                baseItem: 'paper',
                count: '1',
                name: 'Guild archive pass',
                lore: 'Stamped for the old city archive.',
                hiddenId: 'rp.guild.pass',
                numericCmd: '2047',
                itemModel: '',
                modernFloat: '',
                modernString: '',
                modernColor: '',
                modernFlag: false
            },
            exampleModern: {
                version: 'modern',
                baseItem: 'paper',
                count: '1',
                name: 'Guild archive pass',
                lore: 'Stamped for the old city archive.',
                hiddenId: 'rp.guild.pass',
                numericCmd: '',
                itemModel: 'cubeinsquare:item/paper/guild_pass',
                modernFloat: '2047',
                modernString: 'guild_pass',
                modernColor: '#5da9ff',
                modernFlag: true
            }
        },
        ru: {
            unnamed: 'Безымянный кастомный предмет',
            items: (count) => `предмет${count === 1 ? '' : 'ов'}`,
            versionLegacy: 'До 1.20.5',
            versionCurrent: '1.20.5-1.21.3',
            versionModern: '1.21.4+',
            copyModern: 'Эта версия позволяет одновременно хранить путь к визуальной модели, читаемый скрытый ID и богатые слоты custom_model_data.',
            copyLegacy: 'Эта версия оставляет команду компактной и полезной для старых паков, старых квестов и утилит серверов.',
            summary: (version, length) => `Версия: ${version}. Длина: ${length} символов.`,
            labels: {
                version: 'Версия',
                baseItem: 'Базовый предмет',
                hiddenId: 'Скрытый ID',
                itemModel: 'item_model',
                floatSlot: 'Float слот 0',
                stringSlot: 'String слот 0',
                flagSlot: 'Flag слот 0',
                colorSlot: 'Color слот 0',
                numericCmd: 'Числовой CMD'
            },
            exampleLegacy: {
                version: 'legacy',
                baseItem: 'paper',
                count: '1',
                name: 'Пропуск в архив гильдии',
                lore: 'Штамп старого городского архива.',
                hiddenId: 'rp.guild.pass',
                numericCmd: '2047',
                itemModel: '',
                modernFloat: '',
                modernString: '',
                modernColor: '',
                modernFlag: false
            },
            exampleModern: {
                version: 'modern',
                baseItem: 'paper',
                count: '1',
                name: 'Пропуск в архив гильдии',
                lore: 'Штамп старого городского архива.',
                hiddenId: 'rp.guild.pass',
                numericCmd: '',
                itemModel: 'cubeinsquare:item/paper/guild_pass',
                modernFloat: '2047',
                modernString: 'guild_pass',
                modernColor: '#5da9ff',
                modernFlag: true
            }
        },
        de: {
            unnamed: 'Unbenanntes Item',
            items: (count) => `Item${count === 1 ? '' : 's'}`,
            versionLegacy: 'Vor 1.20.5',
            versionCurrent: '1.20.5-1.21.3',
            versionModern: '1.21.4+',
            copyModern: 'Diese Version kann gleichzeitig eine visuelle Modellroute, eine lesbare versteckte ID und reichhaltige custom_model_data-Slots tragen.',
            copyLegacy: 'Diese Version hält den Befehl kompakt und nützlich für ältere Packs, ältere Quest-Belohnungen und alte Server-Tools.',
            summary: (version, length) => `Version: ${version}. Länge: ${length} Zeichen.`,
            labels: {
                version: 'Version',
                baseItem: 'Basis-Item',
                hiddenId: 'Versteckte ID',
                itemModel: 'item_model',
                floatSlot: 'Float-Slot 0',
                stringSlot: 'String-Slot 0',
                flagSlot: 'Flag-Slot 0',
                colorSlot: 'Color-Slot 0',
                numericCmd: 'Numerische CMD'
            },
            exampleLegacy: {
                version: 'legacy',
                baseItem: 'paper',
                count: '1',
                name: 'Gildenarchivpass',
                lore: 'Gestempelt für das alte Stadtarchiv.',
                hiddenId: 'rp.guild.pass',
                numericCmd: '2047',
                itemModel: '',
                modernFloat: '',
                modernString: '',
                modernColor: '',
                modernFlag: false
            },
            exampleModern: {
                version: 'modern',
                baseItem: 'paper',
                count: '1',
                name: 'Gildenarchivpass',
                lore: 'Gestempelt für das alte Stadtarchiv.',
                hiddenId: 'rp.guild.pass',
                numericCmd: '',
                itemModel: 'cubeinsquare:item/paper/guild_pass',
                modernFloat: '2047',
                modernString: 'guild_pass',
                modernColor: '#5da9ff',
                modernFlag: true
            }
        },
        fr: {
            unnamed: 'Objet personnalisé sans nom',
            items: (count) => `objet${count === 1 ? '' : 's'}`,
            versionLegacy: 'Avant 1.20.5',
            versionCurrent: '1.20.5-1.21.3',
            versionModern: '1.21.4+',
            copyModern: 'Cette version peut transporter simultanément une route de modèle visible, un ID caché lisible et des slots custom_model_data enrichis.',
            copyLegacy: 'Cette version garde la commande compacte pour les anciens packs, anciennes récompenses et vieux utilitaires de serveur.',
            summary: (version, length) => `Version : ${version}. Longueur : ${length} caractères.`,
            labels: {
                version: 'Version',
                baseItem: 'Objet de base',
                hiddenId: 'ID caché',
                itemModel: 'item_model',
                floatSlot: 'Slot Float 0',
                stringSlot: 'Slot String 0',
                flagSlot: 'Slot Flag 0',
                colorSlot: 'Slot Color 0',
                numericCmd: 'CMD numérique'
            },
            exampleLegacy: {
                version: 'legacy',
                baseItem: 'paper',
                count: '1',
                name: 'Laissez-passer d’archives',
                lore: 'Tamponné pour les anciennes archives de la ville.',
                hiddenId: 'rp.guild.pass',
                numericCmd: '2047',
                itemModel: '',
                modernFloat: '',
                modernString: '',
                modernColor: '',
                modernFlag: false
            },
            exampleModern: {
                version: 'modern',
                baseItem: 'paper',
                count: '1',
                name: 'Laissez-passer d’archives',
                lore: 'Tamponné pour les anciennes archives de la ville.',
                hiddenId: 'rp.guild.pass',
                numericCmd: '',
                itemModel: 'cubeinsquare:item/paper/guild_pass',
                modernFloat: '2047',
                modernString: 'guild_pass',
                modernColor: '#5da9ff',
                modernFlag: true
            }
        }
    };

    const text = stringsByLang[lang] || stringsByLang.en;

    const refs = {
        form: root.querySelector('#itemBuilderForm'),
        example: root.querySelector('#loadItemExampleButton'),
        reset: root.querySelector('#resetItemBuilderButton'),
        copy: root.querySelector('#copyItemCommandButton'),
        output: root.querySelector('#customItemCommandOutput'),
        summary: root.querySelector('#customItemSummary'),
        versionNote: root.querySelector('#itemVersionNote'),
        previewName: root.querySelector('#itemPreviewName'),
        previewMeta: root.querySelector('#itemPreviewMeta'),
        previewCopy: root.querySelector('#itemPreviewCopy'),
        previewChips: root.querySelector('#itemPreviewChips'),
        modernGroup: root.querySelector('[data-version-group="modern"]'),
        legacyGroup: root.querySelector('[data-version-group="legacy"]'),
        clearModelBtn: root.querySelector('#ci-clear-model'),
        colorPicker: root.querySelector('#ci-modern-color-picker'),
        colorHex: root.querySelector('#ci-modern-color')
    };

    const fieldMap = {
        version: 'ci-version',
        baseItem: 'ci-base-item',
        count: 'ci-count',
        name: 'ci-name',
        lore: 'ci-lore',
        hiddenId: 'ci-hidden-id',
        numericCmd: 'ci-cmd-number',
        itemModel: 'ci-item-model',
        modernFloat: 'ci-modern-float',
        modernString: 'ci-modern-string',
        modernColor: 'ci-modern-color',
        modernFlag: 'ci-modern-flag'
    };

    function fieldValue(id, fallback) {
        const field = root.querySelector(`#${id}`);
        if (!field) return fallback || '';
        const value = typeof field.value === 'string' ? field.value.trim() : '';
        return value || fallback || '';
    }

    function checked(id) {
        const field = root.querySelector(`#${id}`);
        return Boolean(field && field.checked);
    }

    function intValue(value, fallback, min, max) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return Math.min(max, Math.max(min, Math.round(parsed)));
    }

    function namespacedItem(value, fallback) {
        const clean = String(value || fallback || '').trim().toLowerCase().replace(/\s+/g, '_');
        if (!clean) return `minecraft:${fallback}`;
        return clean.includes(':') ? clean : `minecraft:${clean}`;
    }

    function normalizeHex(value) {
        const match = String(value || '').trim().match(/^#?([0-9a-fA-F]{6})$/);
        return match ? `#${match[1].toLowerCase()}` : '';
    }

    function hexToDecimal(value) {
        const normalized = normalizeHex(value);
        return normalized ? parseInt(normalized.slice(1), 16) : null;
    }

    function jsonTextLiteral(value) {
        const json = JSON.stringify({
            text: String(value),
            italic: false
        });
        return `'${json.replace(/'/g, "\\'")}'`;
    }

    function snbtString(value) {
        return JSON.stringify(String(value));
    }

    function splitLore(value) {
        return String(value || '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    function getState() {
        return {
            version: fieldValue('ci-version', 'modern'),
            baseItem: namespacedItem(fieldValue('ci-base-item', 'paper'), 'paper'),
            count: intValue(fieldValue('ci-count', '1'), 1, 1, 64),
            name: fieldValue('ci-name', ''),
            loreLines: splitLore(fieldValue('ci-lore', '')),
            hiddenId: fieldValue('ci-hidden-id', ''),
            numericCmd: intValue(fieldValue('ci-cmd-number', '0'), 0, 0, 2147483647),
            itemModel: fieldValue('ci-item-model', ''),
            modernFloat: fieldValue('ci-modern-float', ''),
            modernString: fieldValue('ci-modern-string', ''),
            modernColor: normalizeHex(fieldValue('ci-modern-color', '')),
            modernFlag: checked('ci-modern-flag')
        };
    }

    function versionLabel(version) {
        if (version === 'legacy') return text.versionLegacy;
        if (version === 'current') return text.versionCurrent;
        return text.versionModern;
    }

    function buildLegacyCommand(state) {
        const parts = [];
        if (state.numericCmd > 0) parts.push(`CustomModelData:${state.numericCmd}`);
        if (state.name || state.loreLines.length) {
            const display = [];
            if (state.name) display.push(`Name:${jsonTextLiteral(state.name)}`);
            if (state.loreLines.length) display.push(`Lore:[${state.loreLines.map(jsonTextLiteral).join(',')}]`);
            parts.push(`display:{${display.join(',')}}`);
        }
        if (state.hiddenId) parts.push(`cube_item_id:${snbtString(state.hiddenId)}`);

        const suffix = parts.length ? `{${parts.join(',')}}` : '';
        return `/give @p ${state.baseItem}${suffix} ${state.count}`;
    }

    function buildCurrentCommand(state) {
        const components = [];
        if (state.name) components.push(`minecraft:custom_name=${jsonTextLiteral(state.name)}`);
        if (state.loreLines.length) components.push(`minecraft:lore=[${state.loreLines.map(jsonTextLiteral).join(',')}]`);
        if (state.hiddenId) components.push(`minecraft:custom_data={item_id:${snbtString(state.hiddenId)}}`);
        if (state.numericCmd > 0) components.push(`minecraft:custom_model_data=${state.numericCmd}`);

        const suffix = components.length ? `[${components.join(',')}]` : '';
        return `/give @p ${state.baseItem}${suffix} ${state.count}`;
    }

    function buildModernCommand(state) {
        const components = [];
        if (state.name) components.push(`minecraft:custom_name=${jsonTextLiteral(state.name)}`);
        if (state.loreLines.length) components.push(`minecraft:lore=[${state.loreLines.map(jsonTextLiteral).join(',')}]`);
        if (state.itemModel) components.push(`minecraft:item_model=${snbtString(state.itemModel)}`);
        if (state.hiddenId) components.push(`minecraft:custom_data={item_id:${snbtString(state.hiddenId)}}`);

        const cmdParts = [];
        if (state.modernFloat !== '') {
            const parsed = Number(state.modernFloat);
            if (Number.isFinite(parsed)) {
                const value = Number.isInteger(parsed) ? parsed.toFixed(1) : String(parsed);
                cmdParts.push(`floats:[${value}f]`);
            }
        }
        if (state.modernString) cmdParts.push(`strings:[${snbtString(state.modernString)}]`);
        if (state.modernFlag) cmdParts.push('flags:[true]');
        const colorValue = hexToDecimal(state.modernColor);
        if (colorValue !== null) cmdParts.push(`colors:[${colorValue}]`);
        if (cmdParts.length) components.push(`minecraft:custom_model_data={${cmdParts.join(',')}}`);

        const suffix = components.length ? `[${components.join(',')}]` : '';
        return `/give @p ${state.baseItem}${suffix} ${state.count}`;
    }

    function buildCommand(state) {
        if (state.version === 'legacy') return buildLegacyCommand(state);
        if (state.version === 'current') return buildCurrentCommand(state);
        return buildModernCommand(state);
    }

    function buildChips(state) {
        const chips = [
            { label: text.labels.version, value: versionLabel(state.version) },
            { label: text.labels.baseItem, value: state.baseItem }
        ];

        if (state.hiddenId) chips.push({ label: text.labels.hiddenId, value: state.hiddenId });

        if (state.version === 'modern') {
            if (state.itemModel) chips.push({ label: text.labels.itemModel, value: state.itemModel });
            if (state.modernFloat !== '') chips.push({ label: text.labels.floatSlot, value: String(state.modernFloat) });
            if (state.modernString) chips.push({ label: text.labels.stringSlot, value: state.modernString });
            if (state.modernFlag) chips.push({ label: text.labels.flagSlot, value: 'true' });
            if (state.modernColor) chips.push({ label: text.labels.colorSlot, value: state.modernColor });
        } else if (state.numericCmd > 0) {
            chips.push({ label: text.labels.numericCmd, value: String(state.numericCmd) });
        }

        return chips;
    }

    function updatePreview(state, command) {
        refs.previewName.textContent = state.name || text.unnamed;
        refs.previewMeta.textContent = `${versionLabel(state.version)} | ${state.baseItem} | ${state.count} ${text.items(state.count)}`;
        refs.previewCopy.textContent = state.version === 'modern' ? text.copyModern : text.copyLegacy;

        refs.previewChips.innerHTML = '';
        buildChips(state).forEach((chipData) => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `<strong>${chipData.label}</strong><code>${chipData.value}</code>`;
            refs.previewChips.appendChild(chip);
        });

        refs.output.value = command;
        refs.summary.textContent = text.summary(versionLabel(state.version), command.length);
    }

    function updateVersionUi(state) {
        const modern = state.version === 'modern';
        refs.modernGroup.hidden = !modern;
        refs.legacyGroup.hidden = modern;
    }

    function updateColorFields() {
        if (!refs.colorPicker || !refs.colorHex) return;
        const raw = String(refs.colorHex.value || '').trim();
        const valid = raw.match(/^#?([0-9a-fA-F]{6})$/);
        if (valid) {
            const hex = `#${valid[1].toLowerCase()}`;
            refs.colorPicker.value = hex;
        }
    }

    function updateAll() {
        updateColorFields();
        const state = getState();
        updateVersionUi(state);
        updatePreview(state, buildCommand(state));
    }

    function fillForm(data) {
        Object.entries(data).forEach(([key, value]) => {
            const targetId = fieldMap[key];
            if (!targetId) return;
            const field = root.querySelector(`#${targetId}`);
            if (!field) return;
            if (field.type === 'checkbox') {
                field.checked = Boolean(value);
            } else {
                field.value = value;
            }
        });
        updateAll();
    }

    async function copyCommand() {
        const command = refs.output.value.trim();
        if (!command) return;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(command);
            } else {
                const textarea = document.createElement('textarea');
                textarea.value = command;
                textarea.setAttribute('readonly', '');
                textarea.style.position = 'fixed';
                textarea.style.opacity = '0';
                document.body.appendChild(textarea);
                textarea.focus();
                textarea.select();
                document.execCommand('copy');
                document.body.removeChild(textarea);
            }
        } catch (error) {
            return;
        }

        const label = refs.copy.dataset.defaultLabel || refs.copy.textContent;
        refs.copy.textContent = 'Copied';
        window.setTimeout(() => {
            refs.copy.textContent = label;
        }, 1400);

        trackEvent('custom_item_command_copy', {
            version: getState().version,
            command_length: command.length
        });
    }

    refs.form.addEventListener('input', (event) => {
        if (event.target === refs.colorPicker) {
            refs.colorHex.value = refs.colorPicker.value;
        }
        if (event.target === refs.colorHex) {
            const match = String(refs.colorHex.value || '').trim().match(/^#?([0-9a-fA-F]{6})$/);
            if (match) {
                refs.colorPicker.value = `#${match[1].toLowerCase()}`;
            }
        }
        updateAll();
    });
    refs.form.addEventListener('change', updateAll);

    if (refs.clearModelBtn) {
        refs.clearModelBtn.addEventListener('click', () => {
            const modelInput = root.querySelector('#ci-item-model');
            if (modelInput) {
                modelInput.value = '';
                updateAll();
            }
        });
    }

    refs.example.addEventListener('click', () => {
        const version = fieldValue('ci-version', 'modern');
        const exampleData = version === 'modern' ? text.exampleModern : text.exampleLegacy;
        fillForm(exampleData);
        trackEvent('custom_item_example_load', { version });
    });

    refs.reset.addEventListener('click', () => {
        refs.form.reset();
        fillForm(text.exampleModern);
    });

    refs.copy.dataset.defaultLabel = refs.copy.textContent;
    refs.copy.addEventListener('click', copyCommand);

    fillForm(text.exampleModern);
})();
