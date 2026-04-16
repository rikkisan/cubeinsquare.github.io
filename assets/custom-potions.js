(function () {
    const root = document.querySelector('[data-potion-tool]');
    if (!root) return;

    const lang = (document.documentElement.lang || 'ru').toLowerCase().split('-')[0];
    const stringsByLang = {
        ru: {
            effect: 'Эффект',
            effectLabel: 'Эффект',
            duration: 'Длительность (сек)',
            level: 'Уровень',
            ambient: 'Ambient',
            particles: 'Частицы',
            icon: 'Иконка',
            remove: 'Удалить',
            addEffect: '+ Добавить эффект',
            loadExample: 'Загрузить пример',
            reset: 'Сбросить',
            copy: 'Копировать команду',
            copied: 'Скопировано',
            emptyName: 'Безымянное зелье',
            customOnly: 'Без базового зелья',
            previewSyntax: 'Синтаксис',
            previewEffects: (count) => `Эффектов: ${count}`,
            summary: (count, chars) => `Эффектов в команде: ${count}. Длина команды: ${chars} символов.`,
            empty: 'Добавьте базовое зелье или хотя бы один кастомный эффект.',
            skipped: (items) => `Эти эффекты пропущены в legacy-формате: ${items.join(', ')}.`,
            example: {
                type: 'lingering_potion',
                basePotion: 'slow_falling',
                count: 1,
                name: 'Туманное зелье разведчика',
                lore: ['Висит в воздухе дольше обычного.', 'Подходит для входа в башню.'],
                color: '#6d7cff',
                customModelData: 24,
                effects: [
                    { id: 'slow_falling', duration: 60, level: 1, ambient: false, particles: true, icon: true },
                    { id: 'night_vision', duration: 30, level: 1, ambient: false, particles: true, icon: true }
                ]
            }
        },
        en: {
            effect: 'Effect',
            effectLabel: 'Effect',
            duration: 'Duration (sec)',
            level: 'Level',
            ambient: 'Ambient',
            particles: 'Particles',
            icon: 'Icon',
            remove: 'Remove',
            addEffect: '+ Add effect',
            loadExample: 'Load example',
            reset: 'Reset',
            copy: 'Copy command',
            copied: 'Copied',
            emptyName: 'Unnamed potion',
            customOnly: 'No base potion',
            previewSyntax: 'Syntax',
            previewEffects: (count) => `Effects: ${count}`,
            summary: (count, chars) => `${count} effect${count === 1 ? '' : 's'} in the command. Command length: ${chars} characters.`,
            empty: 'Add a base potion or at least one custom effect.',
            skipped: (items) => `These effects were skipped in legacy syntax: ${items.join(', ')}.`,
            example: {
                type: 'lingering_potion',
                basePotion: 'slow_falling',
                count: 1,
                name: 'Scout Mist Draught',
                lore: ['Hangs in the air longer than a normal bottle.', 'Useful for scripted tower entries.'],
                color: '#6d7cff',
                customModelData: 24,
                effects: [
                    { id: 'slow_falling', duration: 60, level: 1, ambient: false, particles: true, icon: true },
                    { id: 'night_vision', duration: 30, level: 1, ambient: false, particles: true, icon: true }
                ]
            }
        },
        fr: {
            effect: 'Effet',
            effectLabel: 'Effet',
            duration: 'Durée (sec)',
            level: 'Niveau',
            ambient: 'Ambient',
            particles: 'Particules',
            icon: 'Icône',
            remove: 'Supprimer',
            addEffect: '+ Ajouter un effet',
            loadExample: 'Charger un exemple',
            reset: 'Réinitialiser',
            copy: 'Copier la commande',
            copied: 'Copié',
            emptyName: 'Potion sans nom',
            customOnly: 'Sans potion de base',
            previewSyntax: 'Syntaxe',
            previewEffects: (count) => `Effets : ${count}`,
            summary: (count, chars) => `${count} effet${count === 1 ? '' : 's'} dans la commande. Longueur : ${chars} caractères.`,
            empty: 'Ajoutez une potion de base ou au moins un effet personnalisé.',
            skipped: (items) => `Ces effets sont ignorés en syntaxe legacy : ${items.join(', ')}.`,
            example: {
                type: 'lingering_potion',
                basePotion: 'slow_falling',
                count: 1,
                name: 'Brume d’éclaireur',
                lore: ['Reste dans l’air plus longtemps qu’une fiole normale.', 'Pratique pour une entrée de tour scénarisée.'],
                color: '#6d7cff',
                customModelData: 24,
                effects: [
                    { id: 'slow_falling', duration: 60, level: 1, ambient: false, particles: true, icon: true },
                    { id: 'night_vision', duration: 30, level: 1, ambient: false, particles: true, icon: true }
                ]
            }
        },
        de: {
            effect: 'Effekt',
            effectLabel: 'Effekt',
            duration: 'Dauer (Sek)',
            level: 'Stufe',
            ambient: 'Ambient',
            particles: 'Partikel',
            icon: 'Icon',
            remove: 'Entfernen',
            addEffect: '+ Effekt hinzufügen',
            loadExample: 'Beispiel laden',
            reset: 'Zurücksetzen',
            copy: 'Befehl kopieren',
            copied: 'Kopiert',
            emptyName: 'Unbenannter Trank',
            customOnly: 'Kein Basis-Trank',
            previewSyntax: 'Syntax',
            previewEffects: (count) => `Effekte: ${count}`,
            summary: (count, chars) => `${count} Effekt${count === 1 ? '' : 'e'} im Befehl. Befehlslänge: ${chars} Zeichen.`,
            empty: 'Füge einen Basis-Trank oder mindestens einen benutzerdefinierten Effekt hinzu.',
            skipped: (items) => `Diese Effekte wurden in der Legacy-Syntax ausgelassen: ${items.join(', ')}.`,
            example: {
                type: 'lingering_potion',
                basePotion: 'slow_falling',
                count: 1,
                name: 'Nebeltrank des Spähers',
                lore: ['Bleibt länger in der Luft als eine normale Flasche.', 'Praktisch für skriptgesteuerte Turmeingänge.'],
                color: '#6d7cff',
                customModelData: 24,
                effects: [
                    { id: 'slow_falling', duration: 60, level: 1, ambient: false, particles: true, icon: true },
                    { id: 'night_vision', duration: 30, level: 1, ambient: false, particles: true, icon: true }
                ]
            }
        }
    };

    const text = stringsByLang[lang] || stringsByLang.ru;
    const LEGACY_EFFECT_IDS = {
        speed: 1,
        slowness: 2,
        haste: 3,
        mining_fatigue: 4,
        strength: 5,
        instant_health: 6,
        instant_damage: 7,
        jump_boost: 8,
        nausea: 9,
        regeneration: 10,
        resistance: 11,
        fire_resistance: 12,
        water_breathing: 13,
        invisibility: 14,
        blindness: 15,
        night_vision: 16,
        hunger: 17,
        weakness: 18,
        poison: 19,
        wither: 20,
        health_boost: 21,
        absorption: 22,
        saturation: 23,
        glowing: 24,
        levitation: 25,
        luck: 26,
        unluck: 27,
        slow_falling: 28,
        conduit_power: 29,
        dolphins_grace: 30,
        bad_omen: 31,
        hero_of_the_village: 32,
        darkness: 33
    };

    const references = {
        form: root.querySelector('#potionForm'),
        effectList: root.querySelector('#potionEffectList'),
        addEffectButton: root.querySelector('#addPotionEffectButton'),
        exampleButton: root.querySelector('#loadPotionExampleButton'),
        resetButton: root.querySelector('#resetPotionButton'),
        copyButton: root.querySelector('#copyPotionCommandButton'),
        output: root.querySelector('#potionCommandOutput'),
        summary: root.querySelector('#potionSummary'),
        previewArt: root.querySelector('#potionPreviewArt'),
        previewName: root.querySelector('#potionPreviewName'),
        previewMeta: root.querySelector('#potionPreviewMeta'),
        previewChips: root.querySelector('#potionPreviewChips'),
        useColor: root.querySelector('#pp-use-color'),
        colorPicker: root.querySelector('#pp-color'),
        colorHex: root.querySelector('#pp-color-hex')
    };

    function fieldValue(id, fallback) {
        const field = root.querySelector(`#${id}`);
        if (!field) return fallback;
        const value = field.value.trim();
        return value || fallback;
    }

    function boolValue(id) {
        const field = root.querySelector(`#${id}`);
        return Boolean(field && field.checked);
    }

    function intValue(value, fallback, min, max) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return Math.min(max, Math.max(min, Math.round(parsed)));
    }

    function namespaced(value) {
        const clean = String(value || '').trim().toLowerCase().replace(/\s+/g, '_');
        if (!clean) return '';
        return clean.includes(':') ? clean : `minecraft:${clean}`;
    }

    function jsonTextLiteral(value) {
        const json = JSON.stringify({ text: String(value), italic: false });
        return `'${json.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    }

    function splitLore(value) {
        return String(value || '')
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean);
    }

    function normalizeHex(value) {
        const match = String(value || '').trim().match(/^#?([0-9a-fA-F]{6})$/);
        if (!match) return '#7c3aed';
        return `#${match[1].toLowerCase()}`;
    }

    function hexToDecimal(hex) {
        return parseInt(hex.slice(1), 16);
    }

    function readEffectField(card, fieldName) {
        const field = card.querySelector(`[data-field="${fieldName}"]`);
        if (!field) return '';
        return field.type === 'checkbox' ? field.checked : field.value.trim();
    }

    function selectedText(id) {
        const field = root.querySelector(`#${id}`);
        if (!field) return '';
        if (field.tagName === 'SELECT') {
            return field.options[field.selectedIndex] ? field.options[field.selectedIndex].textContent.trim() : '';
        }
        return field.value.trim();
    }

    function createEffectCard(values) {
        const data = values || {};
        const card = document.createElement('article');
        card.className = 'effect-card';
        card.dataset.effectCard = '';
        card.innerHTML = `
            <div class="effect-card-header">
                <h3 data-effect-title>${text.effect}</h3>
                <button class="tool-button tool-button-danger" type="button" data-remove-effect>${text.remove}</button>
            </div>
            <div class="tool-form-grid">
                <div class="tool-field">
                    <label>${text.effectLabel}</label>
                    <input data-field="effect-id" list="potionEffectSuggestions" value="${data.id || 'speed'}" placeholder="speed">
                </div>
                <div class="tool-field">
                    <label>${text.duration}</label>
                    <input data-field="duration" type="number" min="1" max="3600" value="${data.duration || 45}">
                </div>
                <div class="tool-field">
                    <label>${text.level}</label>
                    <input data-field="level" type="number" min="1" max="255" value="${data.level || 1}">
                </div>
            </div>
            <div class="effect-check-grid">
                <div class="tool-check"><input data-field="ambient" type="checkbox" ${data.ambient ? 'checked' : ''}><label>${text.ambient}</label></div>
                <div class="tool-check"><input data-field="particles" type="checkbox" ${data.particles === false ? '' : 'checked'}><label>${text.particles}</label></div>
                <div class="tool-check"><input data-field="icon" type="checkbox" ${data.icon === false ? '' : 'checked'}><label>${text.icon}</label></div>
            </div>
        `;
        references.effectList.appendChild(card);
        updateEffectTitles();
        updateAll();
    }

    function collectEffects(version) {
        const cards = Array.from(references.effectList.querySelectorAll('[data-effect-card]'));
        const parts = [];
        const names = [];
        const skipped = [];

        cards.forEach((card) => {
            const rawEffect = readEffectField(card, 'effect-id');
            const effectId = namespaced(rawEffect).replace(/^minecraft:/, '');
            if (!effectId) return;

            const duration = intValue(readEffectField(card, 'duration'), 45, 1, 3600) * 20;
            const amplifier = intValue(readEffectField(card, 'level'), 1, 1, 255) - 1;
            const ambient = Boolean(readEffectField(card, 'ambient'));
            const particles = Boolean(readEffectField(card, 'particles'));
            const icon = Boolean(readEffectField(card, 'icon'));

            names.push(effectId);

            if (version === 'legacy') {
                const numericId = LEGACY_EFFECT_IDS[effectId];
                if (!numericId) {
                    skipped.push(`minecraft:${effectId}`);
                    return;
                }
                parts.push(`{Id:${numericId}b,Duration:${duration},Amplifier:${amplifier}b,Ambient:${ambient ? '1b' : '0b'},ShowParticles:${particles ? '1b' : '0b'},ShowIcon:${icon ? '1b' : '0b'}}`);
                return;
            }

            parts.push(`{id:"minecraft:${effectId}",duration:${duration},amplifier:${amplifier},ambient:${ambient ? 'true' : 'false'},show_particles:${particles ? 'true' : 'false'},show_icon:${icon ? 'true' : 'false'}}`);
        });

        return { parts, names, skipped };
    }

    function buildCommand() {
        const version = fieldValue('pp-version', 'current');
        const itemType = fieldValue('pp-item-type', 'potion');
        const basePotion = namespaced(fieldValue('pp-base-potion', '')).replace(/^minecraft:none$/, '');
        const count = intValue(fieldValue('pp-count', '1'), 1, 1, 64);
        const name = fieldValue('pp-name', '');
        const loreLines = splitLore(fieldValue('pp-lore', ''));
        const useColor = boolValue('pp-use-color');
        const color = normalizeHex(fieldValue('pp-color-hex', references.colorPicker ? references.colorPicker.value : '#7c3aed'));
        const colorValue = hexToDecimal(color);
        const customModelData = intValue(fieldValue('pp-custom-model-data', '0'), 0, 0, 2147483647);
        const effects = collectEffects(version);

        if (!basePotion && !effects.parts.length) {
            return {
                command: '',
                effectCount: effects.names.length,
                color,
                skipped: effects.skipped
            };
        }

        if (version === 'legacy') {
            const tags = [];
            if (basePotion) tags.push(`Potion:"${basePotion}"`);
            if (effects.parts.length) tags.push(`CustomPotionEffects:[${effects.parts.join(',')}]`);
            if (useColor) tags.push(`CustomPotionColor:${colorValue}`);
            const displayParts = [];
            if (name) displayParts.push(`Name:${jsonTextLiteral(name)}`);
            if (loreLines.length) displayParts.push(`Lore:[${loreLines.map(jsonTextLiteral).join(',')}]`);
            if (displayParts.length) tags.push(`display:{${displayParts.join(',')}}`);
            if (customModelData > 0) tags.push(`CustomModelData:${customModelData}`);

            return {
                command: `/give @p minecraft:${itemType}{${tags.join(',')}} ${count}`,
                effectCount: effects.parts.length,
                color,
                skipped: effects.skipped
            };
        }

        const components = [];
        const potionContents = [];
        if (basePotion) potionContents.push(`potion:"${basePotion}"`);
        if (effects.parts.length) potionContents.push(`custom_effects:[${effects.parts.join(',')}]`);
        if (useColor) potionContents.push(`custom_color:${colorValue}`);
        if (potionContents.length) components.push(`potion_contents={${potionContents.join(',')}}`);
        if (name) components.push(`item_name=${jsonTextLiteral(name)}`);
        if (loreLines.length) components.push(`lore=[${loreLines.map(jsonTextLiteral).join(',')}]`);
        if (customModelData > 0) components.push(`custom_model_data=${customModelData}`);

        const suffix = components.length ? `[${components.join(',')}]` : '';
        return {
            command: `/give @p minecraft:${itemType}${suffix} ${count}`,
            effectCount: effects.parts.length,
            color,
            skipped: effects.skipped
        };
    }

    function updateEffectTitles() {
        references.effectList.querySelectorAll('[data-effect-card]').forEach((card, index) => {
            const title = card.querySelector('[data-effect-title]');
            if (title) title.textContent = `${text.effect} ${index + 1}`;
        });
    }

    function updateColorFields() {
        if (!references.colorPicker || !references.colorHex || !references.useColor) return;
        const disabled = !references.useColor.checked;
        references.colorPicker.disabled = disabled;
        references.colorHex.disabled = disabled;
        if (!disabled) {
            const raw = String(references.colorHex.value || '').trim();
            const valid = raw.match(/^#?([0-9a-fA-F]{6})$/);
            if (valid) {
                const hex = `#${valid[1].toLowerCase()}`;
                references.colorPicker.value = hex;
                references.colorHex.value = hex;
            }
        }
    }

    function fillPreview(result) {
        const name = fieldValue('pp-name', '') || text.emptyName;
        const syntax = selectedText('pp-version');
        const itemType = selectedText('pp-item-type');
        const basePotion = fieldValue('pp-base-potion', '').trim() || text.customOnly;
        const effects = collectEffects(fieldValue('pp-version', 'current'));

        references.previewArt.style.setProperty('--potion-liquid', result.color || '#7c3aed');
        references.previewName.textContent = name;
        references.previewMeta.textContent = `${text.previewSyntax}: ${syntax} • ${itemType} • ${text.previewEffects(result.effectCount)}`;
        references.previewChips.innerHTML = '';

        [basePotion].concat(effects.names.map((effectId) => `minecraft:${effectId}`)).forEach((label) => {
            const chip = document.createElement('span');
            chip.className = 'chip';
            const code = document.createElement('code');
            code.textContent = label;
            chip.appendChild(code);
            references.previewChips.appendChild(chip);
        });
    }

    function updateAll() {
        updateColorFields();
        const result = buildCommand();
        references.output.value = result.command || text.empty;
        let summaryText = result.command ? text.summary(result.effectCount, result.command.length) : text.empty;
        if (result.skipped.length) summaryText += ` ${text.skipped(result.skipped)}`;
        references.summary.textContent = summaryText;
        references.copyButton.textContent = text.copy;
        fillPreview(result);
    }

    function loadExample() {
        const example = text.example;
        root.querySelector('#pp-item-type').value = example.type;
        root.querySelector('#pp-base-potion').value = example.basePotion;
        root.querySelector('#pp-count').value = example.count;
        root.querySelector('#pp-name').value = example.name;
        root.querySelector('#pp-lore').value = example.lore.join('\n');
        root.querySelector('#pp-use-color').checked = true;
        root.querySelector('#pp-color').value = example.color;
        root.querySelector('#pp-color-hex').value = example.color;
        root.querySelector('#pp-custom-model-data').value = example.customModelData;
        references.effectList.innerHTML = '';
        example.effects.forEach(createEffectCard);
        updateAll();
    }

    function resetTool() {
        if (references.form) references.form.reset();
        root.querySelector('#pp-base-potion').value = '';
        root.querySelector('#pp-color').value = '#7c3aed';
        root.querySelector('#pp-color-hex').value = '#7c3aed';
        references.effectList.innerHTML = '';
        createEffectCard({ id: 'speed', duration: 45, level: 1, particles: true, icon: true });
        updateAll();
    }

    async function copyCommand() {
        const result = buildCommand();
        if (!result.command) return;
        try {
            await navigator.clipboard.writeText(result.command);
        } catch (error) {
            references.output.focus();
            references.output.select();
            document.execCommand('copy');
        }
        references.copyButton.textContent = text.copied;
        window.setTimeout(() => {
            references.copyButton.textContent = text.copy;
        }, 1600);
    }

    root.addEventListener('input', function (event) {
        if (event.target === references.colorPicker) {
            references.colorHex.value = references.colorPicker.value;
        }
        if (event.target === references.colorHex) {
            const match = String(references.colorHex.value || '').trim().match(/^#?([0-9a-fA-F]{6})$/);
            if (match) {
                references.colorPicker.value = `#${match[1].toLowerCase()}`;
            }
        }
        updateAll();
    });

    root.addEventListener('change', updateAll);

    root.addEventListener('click', function (event) {
        const removeButton = event.target.closest('[data-remove-effect]');
        if (removeButton) {
            const card = removeButton.closest('[data-effect-card]');
            if (card && references.effectList.children.length > 1) {
                card.remove();
                updateEffectTitles();
                updateAll();
            }
            return;
        }
        if (event.target === references.addEffectButton) createEffectCard({ id: 'strength', duration: 30, level: 1, particles: true, icon: true });
        if (event.target === references.exampleButton) loadExample();
        if (event.target === references.resetButton) resetTool();
        if (event.target === references.copyButton) copyCommand();
    });

    root.querySelector('#pp-add-effect-label').textContent = text.addEffect;
    root.querySelector('#pp-example-label').textContent = text.loadExample;
    root.querySelector('#pp-reset-label').textContent = text.reset;
    references.copyButton.textContent = text.copy;

    resetTool();
})();
