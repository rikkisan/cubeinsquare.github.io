(function () {
    const root = document.querySelector('[data-item-builder]');
    if (!root) return;

    function trackEvent(name, params, options) {
        if (window.CubeAnalytics && typeof window.CubeAnalytics.track === 'function') {
            window.CubeAnalytics.track(name, params, options);
        }
    }

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
        legacyGroup: root.querySelector('[data-version-group="legacy"]')
    };

    const examples = {
        legacy: {
            version: 'legacy',
            baseItem: 'paper',
            count: '1',
            name: 'Guild archive pass',
            lore: 'Stamped for the old city archive.\nUse the hidden ID in logic, not the title.',
            hiddenId: 'rp.guild.pass',
            numericCmd: '2047',
            itemModel: '',
            modernFloat: '',
            modernString: '',
            modernColor: '',
            modernFlag: false
        },
        current: {
            version: 'current',
            baseItem: 'paper',
            count: '1',
            name: 'Guild archive pass',
            lore: 'Stamped for the old city archive.\nUse the hidden ID in logic, not the title.',
            hiddenId: 'rp.guild.pass',
            numericCmd: '2047',
            itemModel: '',
            modernFloat: '',
            modernString: '',
            modernColor: '',
            modernFlag: false
        },
        modern: {
            version: 'modern',
            baseItem: 'paper',
            count: '1',
            name: 'Guild archive pass',
            lore: 'Stamped for the old city archive.\nVisible art and hidden logic finally live in separate lanes.',
            hiddenId: 'rp.guild.pass',
            numericCmd: '',
            itemModel: 'cubeinsquare:item/paper/guild_pass',
            modernFloat: '2047',
            modernString: 'guild_pass',
            modernColor: '#5da9ff',
            modernFlag: true
        }
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
        if (version === 'legacy') return 'Before 1.20.5';
        if (version === 'current') return '1.20.5-1.21.3';
        return '1.21.4+';
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
            { label: 'Version', value: versionLabel(state.version) },
            { label: 'Base item', value: state.baseItem }
        ];

        if (state.hiddenId) chips.push({ label: 'Hidden item id', value: state.hiddenId });

        if (state.version === 'modern') {
            if (state.itemModel) chips.push({ label: 'item_model', value: state.itemModel });
            if (state.modernFloat !== '') chips.push({ label: 'Float slot 0', value: String(state.modernFloat) });
            if (state.modernString) chips.push({ label: 'String slot 0', value: state.modernString });
            if (state.modernFlag) chips.push({ label: 'Flag slot 0', value: 'true' });
            if (state.modernColor) chips.push({ label: 'Color slot 0', value: state.modernColor });
        } else if (state.numericCmd > 0) {
            chips.push({ label: 'Numeric CMD', value: String(state.numericCmd) });
        }

        return chips;
    }

    function updatePreview(state, command) {
        refs.previewName.textContent = state.name || 'Unnamed custom item';
        refs.previewMeta.textContent = `${versionLabel(state.version)} | ${state.baseItem} | ${state.count} item${state.count === 1 ? '' : 's'}`;
        refs.previewCopy.textContent =
            state.version === 'modern'
                ? 'This version can carry a visible model route, a readable hidden ID, and richer custom_model_data slots at the same time.'
                : 'This version keeps the command compact and useful for older packs, older quest rewards, and legacy server utilities.';

        refs.previewChips.innerHTML = '';
        buildChips(state).forEach((chipData) => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            chip.innerHTML = `<strong>${chipData.label}</strong><code>${chipData.value}</code>`;
            refs.previewChips.appendChild(chip);
        });

        refs.output.value = command;
        refs.summary.textContent = `Version: ${versionLabel(state.version)}. Command length: ${command.length} characters.`;
    }

    function updateVersionUi(state) {
        const modern = state.version === 'modern';
        refs.modernGroup.hidden = !modern;
        refs.legacyGroup.hidden = modern;

        refs.versionNote.textContent = modern
            ? 'Use 1.21.4+ when you want item_model, readable string states, float slots, flag slots, or color slots inside custom_model_data.'
            : 'Use 1.20.5-1.21.3 or legacy mode when you mainly need a compact give command with a visible name, lore, a hidden item ID, and one numeric CustomModelData value.';
    }

    function updateAll() {
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

    refs.form.addEventListener('input', updateAll);
    refs.form.addEventListener('change', updateAll);

    refs.example.addEventListener('click', () => {
        const version = fieldValue('ci-version', 'modern');
        fillForm(examples[version] || examples.modern);
        trackEvent('custom_item_example_load', { version });
    });

    refs.reset.addEventListener('click', () => {
        refs.form.reset();
        fillForm(examples.modern);
    });

    refs.copy.dataset.defaultLabel = refs.copy.textContent;
    refs.copy.addEventListener('click', copyCommand);

    fillForm(examples.modern);
})();
