(function () {
    const root = document.querySelector('[data-villager-tool]');
    if (!root) return;

    function trackEvent(name, params, options) {
        if (window.CubeAnalytics && typeof window.CubeAnalytics.track === 'function') {
            window.CubeAnalytics.track(name, params, options);
        }
    }

    const pageLang = (document.documentElement.lang || '').toLowerCase().split('-')[0] || 'ru';
    const isEnglish = pageLang === 'en';
    const text = isEnglish ? {
        trade: 'Trade',
        buyItem: 'Buy item',
        buyCount: 'Buy count',
        secondBuyItem: 'Second buy item',
        secondBuyCount: 'Second count',
        sellItem: 'Sell item',
        sellCount: 'Sell count',
        sellName: 'Custom sell name',
        customModelData: 'CustomModelData',
        maxUses: 'Max uses',
        xp: 'Villager XP',
        priceMultiplier: 'Price multiplier',
        rewardExp: 'Player gets XP',
        remove: 'Remove',
        copied: 'Copied',
        copy: 'Copy command',
        summary: (trades, chars) => `${trades} trade${trades === 1 ? '' : 's'} generated. Command length: ${chars} characters.`,
        empty: 'Add at least one trade with a buy item and a sell item.',
        defaults: {
            villagerName: 'Story trader',
            buy: 'emerald',
            sell: 'paper',
            sellName: 'Signed contract'
        }
    } : {
        trade: 'Сделка',
        buyItem: 'Предмет покупки',
        buyCount: 'Количество покупки',
        secondBuyItem: 'Второй предмет покупки',
        secondBuyCount: 'Количество второго',
        sellItem: 'Предмет продажи',
        sellCount: 'Количество продажи',
        sellName: 'Кастомное имя продажи',
        customModelData: 'CustomModelData',
        maxUses: 'Лимит сделок',
        xp: 'Опыт жителя',
        priceMultiplier: 'Множитель цены',
        rewardExp: 'Игрок получает опыт',
        remove: 'Удалить',
        copied: 'Скопировано',
        copy: 'Копировать команду',
        summary: (trades, chars) => `Сгенерировано сделок: ${trades}. Длина команды: ${chars} символов.`,
        empty: 'Добавьте хотя бы одну сделку с предметом покупки и предметом продажи.',
        defaults: {
            villagerName: 'Сюжетный торговец',
            buy: 'emerald',
            sell: 'paper',
            sellName: 'Подписанный контракт'
        }
    };

    if (pageLang === 'fr') {
        Object.assign(text, {
            trade: 'Échange',
            buyItem: 'Objet demandé',
            buyCount: 'Quantité demandée',
            secondBuyItem: 'Deuxième objet demandé',
            secondBuyCount: 'Deuxième quantité',
            sellItem: 'Objet vendu',
            sellCount: 'Quantité vendue',
            sellName: 'Nom personnalisé de l’objet',
            customModelData: 'CustomModelData',
            maxUses: 'Limite d’échanges',
            xp: 'XP du villageois',
            priceMultiplier: 'Multiplicateur de prix',
            rewardExp: 'Le joueur reçoit de l’XP',
            remove: 'Supprimer',
            copied: 'Copié',
            copy: 'Copier la commande',
            summary: (trades, chars) => `${trades} échange${trades === 1 ? '' : 's'} généré${trades === 1 ? '' : 's'}. Longueur de la commande : ${chars} caractères.`,
            empty: 'Ajoutez au moins un échange avec un objet demandé et un objet vendu.'
        });
        text.defaults = {
            villagerName: 'Marchand narratif',
            buy: 'emerald',
            sell: 'paper',
            sellName: 'Contrat signé'
        };
    }

    if (pageLang === 'de') {
        Object.assign(text, {
            trade: 'Handel',
            buyItem: 'Kaufgegenstand',
            buyCount: 'Kaufmenge',
            secondBuyItem: 'Zweiter Kaufgegenstand',
            secondBuyCount: 'Zweite Menge',
            sellItem: 'Verkaufsgegenstand',
            sellCount: 'Verkaufsmenge',
            sellName: 'Benutzerdefinierter Verkaufsname',
            customModelData: 'CustomModelData',
            maxUses: 'Maximale Nutzungen',
            xp: 'Dorfbewohner-XP',
            priceMultiplier: 'Preismultiplikator',
            rewardExp: 'Spieler erhält XP',
            remove: 'Entfernen',
            copied: 'Kopiert',
            copy: 'Befehl kopieren',
            summary: (trades, chars) => `${trades} Handel erzeugt. Befehlslänge: ${chars} Zeichen.`,
            empty: 'Füge mindestens einen Handel mit Kaufgegenstand und Verkaufsgegenstand hinzu.'
        });
        text.defaults = {
            villagerName: 'Story-Händler',
            buy: 'emerald',
            sell: 'paper',
            sellName: 'Unterschriebener Vertrag'
        };
    }

    const form = root.querySelector('#villagerForm');
    const tradeList = root.querySelector('#tradeList');
    const addTradeButton = root.querySelector('#addTradeButton');
    const resetButton = root.querySelector('#resetVillagerButton');
    const copyButton = root.querySelector('#copyVillagerCommand');
    const output = root.querySelector('#villagerCommandOutput');
    const summary = root.querySelector('#villagerSummary');

    function fieldValue(id, fallback = '') {
        const field = root.querySelector(`#${id}`);
        return field ? field.value.trim() || fallback : fallback;
    }

    function checked(id) {
        const field = root.querySelector(`#${id}`);
        return Boolean(field && field.checked);
    }

    function numberValue(value, fallback, min, max) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return Math.min(max, Math.max(min, Math.round(parsed)));
    }

    function decimalValue(value, fallback, min, max) {
        const parsed = Number(value);
        if (!Number.isFinite(parsed)) return fallback;
        return Math.min(max, Math.max(min, parsed));
    }

    function namespaced(value, fallback) {
        const clean = (value || fallback || '').trim().toLowerCase().replace(/\s+/g, '_');
        if (!clean) return `minecraft:${fallback}`;
        return clean.includes(':') ? clean : `minecraft:${clean}`;
    }

    function snbtString(value) {
        return JSON.stringify(String(value));
    }

    function escapeJsonUnicode(value) {
        return String(value).replace(/[\u007F-\uFFFF]/g, (char) => {
            const code = char.charCodeAt(0).toString(16).padStart(4, '0');
            return `\\u${code}`;
        });
    }

    function snbtJsonText(value) {
        const json = JSON.stringify({
            text: String(value),
            italic: false
        }).replace(/[\u007F-\uFFFF]/g, escapeJsonUnicode);
        return `'${json.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
    }

    function itemStack(data, version) {
        const id = namespaced(data.id, 'emerald');
        const count = numberValue(data.count, 1, 1, 64);
        const customName = (data.name || '').trim();
        const customModelData = numberValue(data.customModelData, 0, 0, 2147483647);

        if (version === 'legacy') {
            const parts = [`id:${snbtString(id)}`, `Count:${count}b`];
            const tagParts = [];
            if (customModelData > 0) tagParts.push(`CustomModelData:${customModelData}`);
            if (customName) tagParts.push(`display:{Name:${snbtJsonText(customName)}}`);
            if (tagParts.length) parts.push(`tag:{${tagParts.join(',')}}`);
            return `{${parts.join(',')}}`;
        }

        const parts = [`id:${snbtString(id)}`, `count:${count}`];
        const components = [];
        if (customName) components.push(`"minecraft:custom_name":${snbtJsonText(customName)}`);
        if (customModelData > 0) {
            if (version === 'modern') {
                components.push(`"minecraft:custom_model_data":{floats:[${customModelData}f]}`);
            } else {
                components.push(`"minecraft:custom_model_data":${customModelData}`);
            }
        }
        if (components.length) parts.push(`components:{${components.join(',')}}`);
        return `{${parts.join(',')}}`;
    }

    function createTradeCard(values = {}) {
        const card = document.createElement('article');
        card.className = 'trade-card';
        card.dataset.tradeCard = '';
        card.innerHTML = `
            <div class="trade-card-header">
                <h3 data-trade-title>${text.trade}</h3>
                <button class="tool-button tool-button-danger" type="button" data-remove-trade>${text.remove}</button>
            </div>
            <div class="tool-form-grid">
                <div class="tool-field">
                    <label>${text.buyItem}</label>
                    <input data-field="buy-id" list="villagerItemSuggestions" value="${values.buyId || text.defaults.buy}" placeholder="emerald">
                </div>
                <div class="tool-field">
                    <label>${text.buyCount}</label>
                    <input data-field="buy-count" type="number" min="1" max="64" value="${values.buyCount || 8}">
                </div>
                <div class="tool-field">
                    <label>${text.secondBuyItem}</label>
                    <input data-field="buy2-id" list="villagerItemSuggestions" value="${values.buy2Id || ''}" placeholder="diamond">
                </div>
                <div class="tool-field">
                    <label>${text.secondBuyCount}</label>
                    <input data-field="buy2-count" type="number" min="1" max="64" value="${values.buy2Count || 1}">
                </div>
                <div class="tool-field">
                    <label>${text.sellItem}</label>
                    <input data-field="sell-id" list="villagerItemSuggestions" value="${values.sellId || text.defaults.sell}" placeholder="paper">
                </div>
                <div class="tool-field">
                    <label>${text.sellCount}</label>
                    <input data-field="sell-count" type="number" min="1" max="64" value="${values.sellCount || 1}">
                </div>
                <div class="tool-field">
                    <label>${text.sellName}</label>
                    <input data-field="sell-name" value="${values.sellName || text.defaults.sellName}" placeholder="${text.defaults.sellName}">
                </div>
                <div class="tool-field">
                    <label>${text.customModelData}</label>
                    <input data-field="cmd" type="number" min="0" value="${values.customModelData || 0}">
                </div>
                <div class="tool-field">
                    <label>${text.maxUses}</label>
                    <input data-field="max-uses" type="number" min="1" max="999999" value="${values.maxUses || 999999}">
                </div>
                <div class="tool-field">
                    <label>${text.xp}</label>
                    <input data-field="xp" type="number" min="0" max="999999" value="${values.xp || 0}">
                </div>
                <div class="tool-field">
                    <label>${text.priceMultiplier}</label>
                    <input data-field="price-multiplier" type="number" min="0" max="10" step="0.05" value="${values.priceMultiplier || 0}">
                </div>
                <div class="tool-check">
                    <input data-field="reward-exp" type="checkbox" ${values.rewardExp ? 'checked' : ''}>
                    <label>${text.rewardExp}</label>
                </div>
            </div>
        `;
        tradeList.appendChild(card);
        updateTradeTitles();
        updateCommand();
    }

    function readCardField(card, name) {
        const field = card.querySelector(`[data-field="${name}"]`);
        if (!field) return '';
        return field.type === 'checkbox' ? field.checked : field.value.trim();
    }

    function collectRecipes(version) {
        const cards = Array.from(tradeList.querySelectorAll('[data-trade-card]'));
        return cards.map((card) => {
            const buyId = readCardField(card, 'buy-id');
            const sellId = readCardField(card, 'sell-id');
            if (!buyId || !sellId) return '';

            const recipe = [
                `buy:${itemStack({ id: buyId, count: readCardField(card, 'buy-count') }, version)}`
            ];
            const buy2Id = readCardField(card, 'buy2-id');
            if (buy2Id) {
                recipe.push(`buyB:${itemStack({ id: buy2Id, count: readCardField(card, 'buy2-count') }, version)}`);
            }
            recipe.push(`sell:${itemStack({
                id: sellId,
                count: readCardField(card, 'sell-count'),
                name: readCardField(card, 'sell-name'),
                customModelData: readCardField(card, 'cmd')
            }, version)}`);
            recipe.push(`maxUses:${numberValue(readCardField(card, 'max-uses'), 999999, 1, 999999)}`);
            recipe.push(`rewardExp:${readCardField(card, 'reward-exp') ? '1b' : '0b'}`);
            recipe.push(`priceMultiplier:${decimalValue(readCardField(card, 'price-multiplier'), 0, 0, 10)}f`);
            recipe.push(`xp:${numberValue(readCardField(card, 'xp'), 0, 0, 999999)}`);
            recipe.push('demand:0');
            return `{${recipe.join(',')}}`;
        }).filter(Boolean);
    }

    function buildCommand() {
        const version = fieldValue('vt-version', 'modern');
        const recipes = collectRecipes(version);
        if (!recipes.length) return '';

        const tags = [
            `VillagerData:{type:${snbtString(namespaced(fieldValue('vt-type', 'plains'), 'plains'))},profession:${snbtString(namespaced(fieldValue('vt-profession', 'librarian'), 'librarian'))},level:${numberValue(fieldValue('vt-level', '5'), 5, 1, 5)}}`,
            `Offers:{Recipes:[${recipes.join(',')}]}`,
            'PersistenceRequired:1b'
        ];

        const villagerName = fieldValue('vt-name', text.defaults.villagerName);
        if (villagerName) tags.push(`CustomName:${snbtJsonText(villagerName)}`);
        if (checked('vt-no-ai')) tags.push('NoAI:1b');
        if (checked('vt-invulnerable')) tags.push('Invulnerable:1b');
        if (checked('vt-silent')) tags.push('Silent:1b');

        return `/summon minecraft:villager ~ ~1 ~ {${tags.join(',')}}`;
    }

    function updateTradeTitles() {
        tradeList.querySelectorAll('[data-trade-card]').forEach((card, index) => {
            const title = card.querySelector('[data-trade-title]');
            if (title) title.textContent = `${text.trade} ${index + 1}`;
        });
    }

    function updateCommand() {
        const command = buildCommand();
        output.value = command || text.empty;
        const recipeCount = collectRecipes(fieldValue('vt-version', 'modern')).length;
        summary.textContent = command ? text.summary(recipeCount, command.length) : text.empty;
        if (copyButton) copyButton.textContent = text.copy;
    }

    function resetTool() {
        form.reset();
        tradeList.innerHTML = '';
        root.querySelector('#vt-name').value = text.defaults.villagerName;
        createTradeCard();
        updateCommand();
    }

    async function copyCommand() {
        const command = buildCommand();
        if (!command) return;
        try {
            await navigator.clipboard.writeText(command);
        } catch (error) {
            output.focus();
            output.select();
            document.execCommand('copy');
        }
        trackEvent('villager_command_copy', {
            syntax_version: fieldValue('vt-version', 'modern'),
            trade_count: collectRecipes(fieldValue('vt-version', 'modern')).length,
            has_no_ai: checked('vt-no-ai'),
            has_invulnerable: checked('vt-invulnerable'),
            has_silent: checked('vt-silent')
        }, { conversionKey: 'villager_command_copy' });
        copyButton.textContent = text.copied;
        window.setTimeout(() => {
            copyButton.textContent = text.copy;
        }, 1600);
    }

    root.addEventListener('input', updateCommand);
    root.addEventListener('change', updateCommand);
    root.addEventListener('click', (event) => {
        const removeButton = event.target.closest('[data-remove-trade]');
        if (removeButton) {
            const card = removeButton.closest('[data-trade-card]');
            if (card && tradeList.children.length > 1) {
                card.remove();
                updateTradeTitles();
                updateCommand();
            }
            return;
        }
        if (event.target === addTradeButton) {
            createTradeCard({ buyCount: 1, sellId: 'diamond', sellName: '' });
            trackEvent('villager_trade_added', {
                trade_count: tradeList.querySelectorAll('[data-trade-card]').length
            });
        }
        if (event.target === resetButton) resetTool();
        if (event.target === copyButton) copyCommand();
    });

    root.querySelector('#vt-name').value = text.defaults.villagerName;
    createTradeCard();
})();
