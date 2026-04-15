// Хранилище всех загруженных файлов
    // format: filesData[id] = base64 String
    const filesData = {};
    const mcPackData = window.MC_PACK_DATA || {};
    const TRANSPARENT_PIXEL = mcPackData.transparentPixel || "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=";
    const isEnglish = (document.documentElement.lang || '').toLowerCase().startsWith('en');
    const UI_TEXT = isEnglish ? {
        upload: 'Upload',
        sliced: 'Sliced',
        itemNamePlaceholder: 'Item name (e.g. iron_pickaxe)',
        itemNamePlaceholderShort: 'Item name',
        blockTexturePlaceholder: 'Block texture name (e.g. oak_planks)',
        blockTexturePlaceholderShort: 'Block texture name',
        sliceTexture: 'Slice texture',
        preview: 'Preview',
        armorMaterialLabel: 'Armor material to replace:',
        armorMaterials: {
            leather: 'Leather (with _overlay trick)',
            iron: 'Iron',
            gold: 'Golden',
            diamond: 'Diamond',
            netherite: 'Netherite',
            chainmail: 'Chainmail',
            turtle: 'Turtle shell',
            copper: 'Copper (if from mods)'
        },
        armorLayer1: '3D Layer 1',
        armorLayer1Hint: '(Helmet, Chestplate, Boots)',
        armorLayer2: '3D Layer 2',
        armorLayer2Hint: '(Leggings)',
        inventoryIcons: 'Inventory icons:',
        helmet: 'Helmet',
        chestplate: 'Chestplate',
        leggings: 'Leggings',
        boots: 'Boots',
        iconHint: '(Icon)',
        base: 'Base',
        top: 'Top',
        bottom: 'Bottom',
        front: 'Front',
        back: 'Back',
        leftSide: 'Left side',
        rightSide: 'Right side',
        allSides: 'All sides',
        noResults: 'Nothing found',
        emptyAlert: 'You have not uploaded anything. Add at least one texture.',
        buildingArchive: '⏳ Building archive...',
        buildError: 'Build error: ',
        packDefault: 'CubeInSquarePack',
        createdWith: 'Created with Minecraft Resource Pack Generator',
        invalidResolution: (width, height) => `⚠️ Careful! Image resolution (${width}x${height}) is not divisible by 16. Minecraft may display the texture incorrectly.`,
        faceLabels: { main: 'Base', top: 'Top', bottom: 'Bottom', front: 'Front', back: 'Back', left: 'Left', right: 'Right', side: 'Side' }
    } : {
        upload: 'Загрузить',
        sliced: 'Нарезано',
        itemNamePlaceholder: 'Название предмета (напр. iron_pickaxe)',
        itemNamePlaceholderShort: 'Название предмета',
        blockTexturePlaceholder: 'Название текстуры блока (напр. oak_planks)',
        blockTexturePlaceholderShort: 'Название текстуры блока',
        sliceTexture: 'Нарезать текстуру',
        preview: 'Предпросмотр',
        armorMaterialLabel: 'Материал брони (Заменяем):',
        armorMaterials: {
            leather: 'Кожаная (с трюком _overlay)',
            iron: 'Железная',
            gold: 'Золотая',
            diamond: 'Алмазная',
            netherite: 'Незеритовая',
            chainmail: 'Кольчужная',
            turtle: 'Черепаший панцирь',
            copper: 'Медная (если из модов)'
        },
        armorLayer1: '3D Слой 1',
        armorLayer1Hint: '(Шлем, Нагрудник, Ботинки)',
        armorLayer2: '3D Слой 2',
        armorLayer2Hint: '(Поножи)',
        inventoryIcons: 'Иконки инвентаря:',
        helmet: 'Шлем',
        chestplate: 'Нагрудник',
        leggings: 'Поножи',
        boots: 'Ботинки',
        iconHint: '(Иконка)',
        base: 'Основа',
        top: 'Верх',
        bottom: 'Низ',
        front: 'Перед',
        back: 'Зад',
        leftSide: 'Лев.Бок',
        rightSide: 'Прв.Бок',
        allSides: 'Общ.Бок',
        noResults: 'Ничего не найдено',
        emptyAlert: 'Вы ничего не загрузили! Добавьте хотя бы одну текстуру.',
        buildingArchive: '⏳ Сборка архива...',
        buildError: 'Ошибка сборки: ',
        packDefault: 'KubVKvadratePack',
        createdWith: 'Создано в генераторе ресурс-паков Minecraft',
        invalidResolution: (width, height) => `⚠️ Осторожно! Разрешение картинки (${width}x${height}) не кратно 16. Майнкрафт может криво отобразить текстуру.`,
        faceLabels: { main: 'Осн', top: 'Врх', bottom: 'Низ', front: 'Прд', back: 'Зад', left: 'Лев', right: 'Прв', side: 'Бок' }
    };
    
    // Переключение вкладок
    function openTab(tabId, btn) {
        document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        if (btn) btn.classList.add('active');
    }

    // Обработка загрузки файлов
    function handleFileUpload(file, id, previewId, statusId) {
        if (!file || !file.type.startsWith('image/')) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            
            const imgCheck = new Image();
            imgCheck.onload = () => {
                if (imgCheck.width % 16 !== 0 || imgCheck.height % 16 !== 0) {
                    alert(UI_TEXT.invalidResolution(imgCheck.width, imgCheck.height));
                }
            };
            imgCheck.src = result;

            filesData[id] = result.split(',')[1]; // Сохраняем только base64 данные
            
            // UI Обновление - превьювер и статус
            const preview = document.getElementById(previewId);
            const status = document.getElementById(statusId);
            if(preview) {
                preview.src = result;
                preview.style.display = 'block';
            }
            if(status) {
                status.textContent = "✔";
                status.style.color = '#34d399';
                status.style.display = 'inline';
            }
            
            const clearBtn = document.getElementById(`clear_${id}`);
            if(clearBtn) {
                clearBtn.style.display = 'flex';
            }
            
            // Автозаполнение имени (для Предметов и Блоков), если оно пустое
            let rowIdBase = id;
            if (id.startsWith('dyn_blocks_')) {
                rowIdBase = id.split('_').slice(0, 3).join('_');
            }
            const row = document.getElementById(`row_${rowIdBase}`);
            if (row) {
                const input = row.querySelector('.dynamic-input');
                if (input && !input.value) {
                    let cName = file.name.replace(/\.[^/.]+$/, ""); // удаляем расширение
                    cName = cName.replace(/_(top|bottom|front|side)$/i, ''); // удаляем суффиксы сторон
                    input.value = cName;
                }
            }
        };
        reader.readAsDataURL(file);
    }

    function bindUploadZone(id) {
        const inputEl = document.getElementById(id);
        if(!inputEl) return;
        const zone = inputEl.parentElement;

        inputEl.addEventListener('change', (e) => {
            handleFileUpload(e.target.files[0], id, `prev_${id}`, `stat_${id}`);
        });

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('dragover');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('dragover');
            if (e.dataTransfer.files.length) {
                handleFileUpload(e.dataTransfer.files[0], id, `prev_${id}`, `stat_${id}`);
            }
        });
    }

    function clearUploadZone(id) {
        delete filesData[id];
        
        const preview = document.getElementById(`prev_${id}`);
        if(preview) {
            preview.src = '';
            preview.style.display = 'none';
        }
        
        const status = document.getElementById(`stat_${id}`);
            if(status) {
                if (id.startsWith('dyn_blocks_')) {
                    status.style.display = 'none';
                } else {
                    status.innerHTML = UI_TEXT.upload;
                }
                status.style.color = 'var(--text-dim)';
            }
        
        const input = document.getElementById(id);
        if(input) input.value = '';
        
        const clearBtn = document.getElementById(`clear_${id}`);
        if(clearBtn) clearBtn.style.display = 'none';
    }

    function getBlockZoneHtml(baseId, sideId, title, suffixText) {
        const fullId = `${baseId}_${sideId}`;
        return `
            <div style="position:relative; flex: 1 1 110px; min-width: 100px;">
                <label class="upload-zone" style="height: 100%; box-sizing: border-box; min-height: 80px; padding: 10px; gap: 2px;">
                    <span style="font-size: 0.9rem; font-weight: bold; line-height: 1.1;">${title}</span>
                    <span style="font-size: 0.75rem; color: var(--text-dim);">${suffixText}</span>
                    <span class="status-text" id="stat_${fullId}" style="display:none; margin-top: 4px;">✔</span>
                    <input type="file" accept="image/png" id="${fullId}">
                    <img class="preview-img" id="prev_${fullId}" style="display:none; max-width: 40px; max-height: 40px; margin-top: 4px;">
                </label>
                <button class="clear-zone-btn" id="clear_${fullId}" onclick="clearUploadZone('${fullId}')">×</button>
            </div>
        `;
    }

    function updateAllGiveCommands() {
        document.querySelectorAll('#items-container .dynamic-row').forEach(row => {
            const id = row.id.replace('row_', '');
            try { updateGiveCommand(id); } catch(e) {}
        });
    }

    function updateGiveCommand(id) {
        const itemInput = document.getElementById(`input_${id}`);
        const cmdInput = document.getElementById(`cmd_${id}`);
        const givePreview = document.getElementById(`give_${id}`);
        if (!itemInput || !givePreview) return;

        let itemName = itemInput.value.trim();
        let cmd = cmdInput ? cmdInput.value.trim() : "";
        
        if (!itemName) {
            givePreview.style.display = 'none';
            return;
        }
        
        const versionSelect = document.getElementById('gameVersionSelect');
        const version = versionSelect ? versionSelect.value : '1.20.4';
        givePreview.style.display = 'block';

        if (cmd) {
            if (version === '1.20.4') {
                givePreview.innerText = `/give @p minecraft:${itemName}{CustomModelData:${cmd}} 1`;
            } else {
                givePreview.innerText = `/give @p minecraft:${itemName}[minecraft:custom_model_data=${cmd}] 1`;
            }
        } else {
            givePreview.innerText = `/give @p minecraft:${itemName} 1`;
        }
    }

    let dynCounter = 0;
    function addDynamicRow(type, placeholder) {
        dynCounter++;
        const id = `dyn_${type}_${dynCounter}`;
        const container = document.getElementById(`${type}-container`);
        const row = document.createElement('div');
        row.className = 'dynamic-row';
        row.id = `row_${id}`;
        
        if (type === 'items') {
            row.style.flexDirection = 'column';
            row.style.alignItems = 'stretch';
            row.innerHTML = `
                <div style="display: flex; gap: 10px; width: 100%; align-items: center; flex-wrap: wrap;">
                    <input type="text" class="dynamic-input" placeholder="${placeholder}" id="input_${id}" list="mc_items_list" style="flex: 2; min-width: 150px;" oninput="updateGiveCommand('${id}')">
                    <input type="number" class="dynamic-input" placeholder="CustomModelData (CMD)" id="cmd_${id}" style="flex: 1; min-width: 150px;" oninput="updateGiveCommand('${id}')" min="1">
                    <button class="btn-slice" style="background:#10b981;" onclick="openPreview('${id}', 'items')">👁️</button>
                    <button class="btn-remove" onclick="removeDynamicRow('${id}', 'items')">×</button>
                </div>
                <div style="background: rgba(0,0,0,0.4); padding: 5px 10px; border-radius: 4px; font-family: monospace; color: #cbd5e1; font-size: 0.85rem; margin-top: 5px; overflow-x: auto; white-space: nowrap; display: none;" id="give_${id}"></div>
                <div style="position:relative; width: 100%; margin-top: 15px; flex: 1;">
                    <label class="upload-zone dynamic-upload" style="height: 100%;">
                        <span class="status-text" id="stat_${id}">${UI_TEXT.upload}</span>
                        <input type="file" accept="image/png" id="${id}">
                        <img class="preview-img" id="prev_${id}">
                    </label>
                    <button class="clear-zone-btn" id="clear_${id}" onclick="clearUploadZone('${id}')">×</button>
                </div>
            `;
            container.appendChild(row);
            bindUploadZone(id);
        } else if (type === 'blocks') {
            row.style.flexDirection = 'column';
            row.style.alignItems = 'stretch';
            row.innerHTML = `
                <div style="display: flex; gap: 15px; width: 100%; align-items: center;">
                    <input type="text" class="dynamic-input" placeholder="${placeholder}" id="input_${id}" list="mc_blocks_list">
                    <button class="btn-slice" onclick="openSlicer('${id}')">✂️ ${UI_TEXT.sliceTexture}</button>
                    <button class="btn-slice" style="background:#10b981;" onclick="openPreview('${id}', 'blocks')">👁️ ${UI_TEXT.preview}</button>
                    <button class="btn-remove" onclick="removeDynamicRow('${id}', 'blocks')">×</button>
                </div>
                <div class="block-sides" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
                    ${getBlockZoneHtml(id, 'main', UI_TEXT.base, '')}
                    ${getBlockZoneHtml(id, 'top', UI_TEXT.top, '_top')}
                    ${getBlockZoneHtml(id, 'bottom', UI_TEXT.bottom, '_bottom')}
                    ${getBlockZoneHtml(id, 'front', UI_TEXT.front, '_front')}
                    ${getBlockZoneHtml(id, 'back', UI_TEXT.back, '_back')}
                    ${getBlockZoneHtml(id, 'left', UI_TEXT.leftSide, '_left')}
                    ${getBlockZoneHtml(id, 'right', UI_TEXT.rightSide, '_right')}
                    ${getBlockZoneHtml(id, 'side', UI_TEXT.allSides, '_side')}
                </div>
            `;
            container.appendChild(row);
            ['main', 'top', 'bottom', 'front', 'back', 'left', 'right', 'side'].forEach(side => bindUploadZone(`${id}_${side}`));
        } else if (type === 'armor') {
            row.style.flexDirection = 'column';
            row.style.alignItems = 'stretch';
            row.innerHTML = `
                <div style="display: flex; gap: 15px; width: 100%; align-items: center;">
                    <span style="font-size: 0.9rem; color: var(--text-dim); white-space: nowrap;">${UI_TEXT.armorMaterialLabel}</span>
                    <select id="mat_${id}" style="background: rgba(0,0,0,0.5); color: white; border: 1px solid #475569; padding: 10px; border-radius: 4px; font-size: 1rem; outline: none; flex: 1;">
                        <option value="leather">${UI_TEXT.armorMaterials.leather}</option>
                        <option value="iron">${UI_TEXT.armorMaterials.iron}</option>
                        <option value="gold">${UI_TEXT.armorMaterials.gold}</option>
                        <option value="diamond">${UI_TEXT.armorMaterials.diamond}</option>
                        <option value="netherite">${UI_TEXT.armorMaterials.netherite}</option>
                        <option value="chainmail">${UI_TEXT.armorMaterials.chainmail}</option>
                        <option value="turtle">${UI_TEXT.armorMaterials.turtle}</option>
                        <option value="copper">${UI_TEXT.armorMaterials.copper}</option>
                    </select>
                    <button class="btn-slice" style="background:#10b981;" onclick="openPreview('${id}', 'armor')">👁️ ${UI_TEXT.preview}</button>
                    <button class="btn-remove" onclick="removeDynamicRow('${id}', 'armor')">×</button>
                </div>
                <div class="block-sides" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 15px;">
                    ${getBlockZoneHtml(id, 'layer_1', UI_TEXT.armorLayer1, UI_TEXT.armorLayer1Hint)}
                    ${getBlockZoneHtml(id, 'layer_2', UI_TEXT.armorLayer2, UI_TEXT.armorLayer2Hint)}
                </div>
                <div style="font-size: 0.9rem; color: var(--text-dim); margin-top: 15px; margin-bottom: -5px;">${UI_TEXT.inventoryIcons}</div>
                <div class="block-sides" style="display: flex; flex-wrap: wrap; gap: 10px; margin-top: 10px;">
                    ${getBlockZoneHtml(id, 'icon_helmet', UI_TEXT.helmet, UI_TEXT.iconHint)}
                    ${getBlockZoneHtml(id, 'icon_chestplate', UI_TEXT.chestplate, UI_TEXT.iconHint)}
                    ${getBlockZoneHtml(id, 'icon_leggings', UI_TEXT.leggings, UI_TEXT.iconHint)}
                    ${getBlockZoneHtml(id, 'icon_boots', UI_TEXT.boots, UI_TEXT.iconHint)}
                </div>
            `;
            container.appendChild(row);
            ['layer_1', 'layer_2', 'icon_helmet', 'icon_chestplate', 'icon_leggings', 'icon_boots'].forEach(layer => bindUploadZone(`${id}_${layer}`));
        }
        return id;
    }

    function removeDynamicRow(id, type) {
        document.getElementById(`row_${id}`).remove();
        if (type === 'items') {
            delete filesData[id];
        } else if (type === 'armor') {
            ['layer_1', 'layer_2', 'icon_helmet', 'icon_chestplate', 'icon_leggings', 'icon_boots'].forEach(layer => delete filesData[`${id}_${layer}`]);
        } else if (type === 'blocks') {
            ['main', 'top', 'bottom', 'front', 'back', 'left', 'right', 'side'].forEach(side => {
                delete filesData[`${id}_${side}`];
            });
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Изначально ничего не добавляем, чтобы подставлялось то, что выбрал пользователь
        addDynamicRow('armor');
    });

    document.getElementById('generateBtn').addEventListener('click', () => {
        const zip = new JSZip();
        
        let packName = document.getElementById('packNameInput').value.trim();
        if (!packName) packName = UI_TEXT.packDefault;
        
        let safeFileName = packName.replace(/[^a-z0-9а-яё_-]/gi, '_');

        // MCMETA
        zip.file("pack.mcmeta", JSON.stringify({
            pack: { 
                pack_format: 15, 
                description: `§b${packName}\n§7${UI_TEXT.createdWith}` 
            }
        }, null, 2));

        const assetsFolder = zip.folder("assets/minecraft");
        const armorFolder = assetsFolder.folder("textures/models/armor");
        const itemFolder = assetsFolder.folder("textures/item");
        const blockFolder = assetsFolder.folder("textures/block");
        const blockModelFolder = assetsFolder.folder("models/block");
        const blockStateFolder = assetsFolder.folder("blockstates");

        // --- БРОНЯ ---
        const emptyImageBase64 = TRANSPARENT_PIXEL;
        let leatherEmptyGenerated = false;

        document.querySelectorAll('#armor-container .dynamic-row').forEach(row => {
            const rowId = row.id.replace('row_', '');
            const material = document.getElementById(`mat_${rowId}`).value;

            ['layer_1', 'layer_2'].forEach(layer => {
                const fileId = `${rowId}_${layer}`;
                if (filesData[fileId]) {
                    if (material === 'leather') {
                        // Используем _overlay для кожи
                        armorFolder.file(`${material}_${layer}_overlay.png`, filesData[fileId], {base64: true});
                        
                        // Кладем пустой файл 1 раз, чтобы база кожи стала невидимой
                        if (!leatherEmptyGenerated) {
                            armorFolder.file("leather_layer_1.png", emptyImageBase64, {base64: true});
                            armorFolder.file("leather_layer_2.png", emptyImageBase64, {base64: true});
                            leatherEmptyGenerated = true;
                        }
                    } else {
                        // Обычная ванильная броня (например: diamond_layer_1.png)
                        armorFolder.file(`${material}_${layer}.png`, filesData[fileId], {base64: true});
                    }
                }
            });

            const iconMap = {
                'icon_helmet': '_helmet',
                'icon_chestplate': '_chestplate',
                'icon_leggings': '_leggings',
                'icon_boots': '_boots'
            };

            for (const [key, part] of Object.entries(iconMap)) {
                const fileId = `${rowId}_${key}`;
                if (filesData[fileId]) {
                    if (material === 'leather') {
                        itemFolder.file(`leather${part}_overlay.png`, filesData[fileId], {base64: true});
                        itemFolder.file(`leather${part}.png`, emptyImageBase64, {base64: true});
                    } else if (material === 'gold') {
                        // Для брони предметы называются golden_ , а не gold_!
                        itemFolder.file(`golden${part}.png`, filesData[fileId], {base64: true});
                    } else if (material === 'turtle' && part === '_helmet') {
                        // Для черепашьего панциря
                        itemFolder.file(`turtle_helmet.png`, filesData[fileId], {base64: true});
                    } else if (material !== 'turtle') {
                        itemFolder.file(`${material}${part}.png`, filesData[fileId], {base64: true});
                    }
                }
            }
        });

        // --- ПРЕДМЕТЫ ---
        const itemModelFolder = assetsFolder.folder("models").folder("item");
        const itemOverrides = {};

        document.querySelectorAll('#items-container .dynamic-row').forEach(row => {
            const id = row.id.replace('row_', '');
            let val = document.getElementById(`input_${id}`).value.trim();
            const cmdInput = document.getElementById(`cmd_${id}`);
            const cmdVal = cmdInput ? cmdInput.value.trim() : '';
            
            if (val && filesData[id]) {
                const baseItem = val.replace('.png', '');
                
                if (cmdVal) {
                    if (!itemOverrides[baseItem]) itemOverrides[baseItem] = [];
                    itemOverrides[baseItem].push({ cmd: parseInt(cmdVal), fileId: id });
                } else {
                    itemFolder.file(`${baseItem}.png`, filesData[id], {base64: true});
                }
            }
        });

        for (const [baseItem, overrides] of Object.entries(itemOverrides)) {
            const isHandheld = baseItem.includes('sword') || baseItem.includes('pickaxe') || baseItem.includes('axe') || baseItem.includes('hoe') || baseItem.includes('shovel') || baseItem.includes('stick') || baseItem.includes('trident');
            const parentModel = isHandheld ? "item/handheld" : "item/generated";
            
            const baseModelJson = {
                "parent": parentModel,
                "textures": { "layer0": `item/${baseItem}` },
                "overrides": []
            };
            
            overrides.sort((a,b) => a.cmd - b.cmd).forEach(ov => {
                const customModelName = `custom_${baseItem}_${ov.cmd}`;
                
                baseModelJson.overrides.push({
                    "predicate": { "custom_model_data": ov.cmd },
                    "model": `item/${customModelName}`
                });
                
                const customModelJson = {
                    "parent": parentModel,
                    "textures": { "layer0": `item/${customModelName}` }
                };
                itemModelFolder.file(`${customModelName}.json`, JSON.stringify(customModelJson, null, 2));
                itemFolder.file(`${customModelName}.png`, filesData[ov.fileId], {base64: true});
            });
            
            itemModelFolder.file(`${baseItem}.json`, JSON.stringify(baseModelJson, null, 2));
        }

        // --- БЛОКИ ---
        document.querySelectorAll('#blocks-container .dynamic-row').forEach(row => {
            const rowId = row.id.replace('row_', ''); // e.g. dyn_blocks_1
            let baseVal = document.getElementById(`input_${rowId}`).value.trim();
            if (baseVal) {
                baseVal = baseVal.replace('.png', '');
                const sides = [
                    { idSuffix: 'main', nameSuffix: '' },
                    { idSuffix: 'top', nameSuffix: '_top' },
                    { idSuffix: 'bottom', nameSuffix: '_bottom' },
                    { idSuffix: 'front', nameSuffix: '_front' },
                    { idSuffix: 'back', nameSuffix: '_back' },
                    { idSuffix: 'left', nameSuffix: '_left' },
                    { idSuffix: 'right', nameSuffix: '_right' },
                    { idSuffix: 'side', nameSuffix: '_side' }
                ];

                sides.forEach(side => {
                    const fileId = `${rowId}_${side.idSuffix}`;
                    if (filesData[fileId]) {
                        blockFolder.file(`${baseVal}${side.nameSuffix}.png`, filesData[fileId], {base64: true});
                    }
                });

                // Генерация JSON модели, если чекбокс включен
                const genModelCheck = document.getElementById(`gen_model_${rowId}`);
                if (genModelCheck && genModelCheck.checked) {
                    const getTexturePath = (idSuffix, alt1, alt2) => {
                        if (filesData[`${rowId}_${idSuffix}`]) return `minecraft:block/${baseVal}_${idSuffix}`;
                        if (alt1 && filesData[`${rowId}_${alt1}`]) return `minecraft:block/${baseVal}_${alt1}`;
                        if (alt2 && filesData[`${rowId}_${alt2}`]) return `minecraft:block/${baseVal}_${alt2}`;
                        if (filesData[`${rowId}_main`]) return `minecraft:block/${baseVal}`;
                        return `minecraft:block/${baseVal}`; // Ванильный фоллбек
                    };

                    const modelData = {
                        "parent": "minecraft:block/cube",
                        "textures": {
                            "particle": getTexturePath('front', 'side', 'top'),
                            "up": getTexturePath('top', 'side', 'main'),
                            "down": getTexturePath('bottom', 'side', 'top'),
                            "north": getTexturePath('front', 'side', 'main'),
                            "south": getTexturePath('back', 'side', 'front'),
                            "west": getTexturePath('right', 'side', 'main'),
                            "east": getTexturePath('left', 'side', 'main')
                        }
                    };
                    blockModelFolder.file(`${baseVal}.json`, JSON.stringify(modelData, null, 2));

                    // Создаем blockstate, чтобы отключить или включить рандомное вращение
                    const rotSelect = document.getElementById(`model_rot_${rowId}`);
                    const rotVal = rotSelect ? rotSelect.value : 'fixed';
                    
                    let blockstateData;
                    if (rotVal === 'random') {
                        blockstateData = {
                            "variants": {
                                "": [
                                    { "model": `minecraft:block/${baseVal}` },
                                    { "model": `minecraft:block/${baseVal}`, "y": 90 },
                                    { "model": `minecraft:block/${baseVal}`, "y": 180 },
                                    { "model": `minecraft:block/${baseVal}`, "y": 270 }
                                ]
                            }
                        };
                    } else {
                        blockstateData = {
                            "variants": {
                                "": { "model": `minecraft:block/${baseVal}` }
                            }
                        };
                    }
                    
                    blockStateFolder.file(`${baseVal}.json`, JSON.stringify(blockstateData, null, 2));
                }
            }
        });

        // Проверка: есть ли хоть один файл (помимо mcmeta)
        if(Object.keys(zip.files).length <= 1) {
            alert(UI_TEXT.emptyAlert);
            return;
        }

        const btn = document.getElementById('generateBtn');
        const originalText = btn.innerText;
        btn.innerText = UI_TEXT.buildingArchive;
        
        zip.generateAsync({type: "blob"}).then(function(content) {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `${safeFileName}.zip`;
            link.click();
            btn.innerText = originalText;
        }).catch(err => {
            alert(UI_TEXT.buildError + err);
            btn.innerText = originalText;
        });
    });

    // -- Библиотека и Загрузка данных --
    let globalBlocks = new Set();
    let loadedItems = [];
    let loadedBlocks = [];
    const baseAssetUrl = mcPackData.textureBaseUrl || "https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/";
    const blocksDataUrl = mcPackData.blocksUrl || "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/pc/1.20/blocks.json";
    const itemsDataUrl = mcPackData.itemsUrl || "https://raw.githubusercontent.com/PrismarineJS/minecraft-data/master/data/pc/1.20/items.json";
    const spawnEggBaseUrl = mcPackData.spawnEggBaseUrl || "https://raw.githubusercontent.com/Mojang/bedrock-samples/main/resource_pack/textures/items/spawn_eggs/";
    const shieldTextureUrl = mcPackData.shieldTextureUrl || "https://minecraft.wiki/images/Shield_JE2_BE1.png";

    // Global tooltip div
    const mcTooltip = document.createElement('div');
    mcTooltip.className = 'mc-tooltip';
    mcTooltip.innerHTML = `<div class="tt-title"></div><div class="tt-id"></div>`;
    document.body.appendChild(mcTooltip);

    document.addEventListener('mousemove', (e) => {
        if (mcTooltip.style.display === 'flex') {
            mcTooltip.style.left = (e.clientX + 15) + 'px';
            mcTooltip.style.top = (e.clientY) + 'px';
        }
    });

    function renderGalleryGrid(type, data, query = "") {
        const grid = document.getElementById(`gallery-${type}`);
        if (!grid) return;
        grid.innerHTML = '';
        
        let count = 0;
        const lowerQuery = query.toLowerCase().trim();
        
        for (let i = 0; i < data.length; i++) {
            if (count >= 1500 && !lowerQuery) break; // Limit default render to 1500 for perf if no query
            
            const item = data[i];
            if (lowerQuery && !item.name.includes(lowerQuery)) continue;
            
            const el = document.createElement('div');
            el.className = 'gallery-item';
            
            let texUrl = '';
            let ext = '.png';
            if (type === 'items') {
                let texName = item.name;
                if (texName.endsWith('_spawn_egg')) {
                    let mobName = texName.replace('_spawn_egg', '');
                    if (mobName === 'tropical_fish') mobName = 'tropicalfish';
                    texUrl = `${spawnEggBaseUrl}spawn_egg_${mobName}.png`;
                } else {
                    let folder = 'item';
                    if (texName === 'compass') texName = 'compass_16';
                    else if (texName === 'clock') texName = 'clock_16';
                    else if (texName === 'recovery_compass') texName = 'recovery_compass_16';
                    else if (texName === 'tipped_arrow') texName = 'tipped_arrow_base';
                    else if (texName === 'enchanted_golden_apple') texName = 'golden_apple';
                    else if (texName === 'crossbow') texName = 'crossbow_standby';
                    else if (texName === 'debug_stick') texName = 'stick';
                    
                    if (item.name === 'shield') {
                        texUrl = shieldTextureUrl;
                    } else {
                        texUrl = baseAssetUrl + `${folder}/${texName}` + ext;
                    }
                }
            } else if (type === 'blocks') {
                texUrl = baseAssetUrl + `block/${item.bestTex || item.name}` + ext;
            }
            
            let imgStyle = '';
            let badge = '';
            if (item.name === 'enchanted_golden_apple') {
                imgStyle = 'filter: drop-shadow(0 0 8px magenta) drop-shadow(0 0 5px gold);';
                badge = `<span style="position:absolute; top:-2px; right:-2px; font-size:12px; pointer-events:none;">✨</span>`;
            } else if (item.name === 'debug_stick') {
                imgStyle = 'filter: drop-shadow(0 0 5px cyan);';
            } else if (item.name === 'tipped_arrow') {
                badge = `<span style="position:absolute; top:-2px; right:-2px; font-size:12px; pointer-events:none;">🧪</span>`;
            }
            
            el.innerHTML = `
                <div style="position:relative; display:flex; justify-content:center; align-items:center;">
                    <img loading="lazy" src="${texUrl}" style="${imgStyle}" onerror="this.src='data:image/png;base64,${TRANSPARENT_PIXEL}'">
                    ${badge}
                </div>
                <span>${item.name}</span>
            `;
            
            el.onmouseenter = () => {
                const titleStr = item.name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                mcTooltip.querySelector('.tt-title').innerText = titleStr;
                mcTooltip.querySelector('.tt-id').innerText = `minecraft:${item.name}`;
                mcTooltip.style.display = 'flex';
            };
            el.onmouseleave = () => {
                mcTooltip.style.display = 'none';
            };
            
            el.onclick = () => {
                mcTooltip.style.display = 'none';
                const id = addDynamicRow(type, type === 'items' ? UI_TEXT.itemNamePlaceholderShort : (type === 'blocks' ? UI_TEXT.blockTexturePlaceholderShort : ''));
                if (type === 'items' || type === 'blocks') {
                    const inp = document.getElementById(`input_${id}`);
                    if(inp) {
                        inp.value = item.name;
                        if (type === 'items') setTimeout(() => { updateGiveCommand(id); }, 10);
                    }
                } else if (type === 'armor') {
                    const sel = document.getElementById(`mat_${id}`);
                    if(sel) sel.value = item.name;
                }
                const row = document.getElementById(`row_${id}`);
                if (row) {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    row.style.boxShadow = "0 0 15px var(--accent)";
                    setTimeout(() => row.style.boxShadow = "none", 1500);
                }
            };
            
            grid.appendChild(el);
            count++;
        }
        
        if (count === 0) grid.innerHTML = `<div style="color:#555; padding: 20px;">${UI_TEXT.noResults}</div>`;
    }

    window.filterGallery = function(type, query) {
        if (type === 'items') renderGalleryGrid('items', loadedItems, query);
        else if (type === 'blocks') renderGalleryGrid('blocks', loadedBlocks, query);
    };

    // Загрузка списков для автодополнения (используем PrismarineJS)
    const rawBlocks = mcPackData.rawBlockTextures || [];
    function getBestBlockTexture(b) {
        const arr = [b, b+'_front', b+'_top', b+'_side', b+'_0', b+'_stage7', b+'_still', b+'_bottom', b+'_base'];
        for(let t of arr) {
            if(rawBlocks.includes(t)) return t;
        }
        return null;
    }

    fetch(blocksDataUrl)
        .then(res => res.json())
        .then(blockData => {
            blockData.forEach(b => globalBlocks.add(b.name));
            
            loadedBlocks = blockData.filter(b => {
                const best = getBestBlockTexture(b.name);
                if (best) {
                    b.bestTex = best;
                    return true;
                }
                return false;
            });
            
            renderGalleryGrid('blocks', loadedBlocks);
            
            const list = document.getElementById('mc_blocks_list');
            loadedBlocks.forEach(block => {
                const opt = document.createElement('option');
                opt.value = block.name;
                list.appendChild(opt);
            });
            
            fetch(itemsDataUrl)
                .then(res => res.json())
                .then(itemData => {
                    loadedItems = itemData.filter(i => {
                        return !globalBlocks.has(i.name) && 
                               !i.name.match(/_(helmet|chestplate|leggings|boots|armor)$/);
                    });
                    renderGalleryGrid('items', loadedItems);
                    
                    const itemList = document.getElementById('mc_items_list');
                    loadedItems.forEach(item => {
                        const opt = document.createElement('option');
                        opt.value = item.name;
                        itemList.appendChild(opt);
                    });
                }).catch(e => {
                    console.log('Не удалось загрузить предметы:', e);
                    loadedItems = mcPackData.fallbackItems || [];
                    renderGalleryGrid('items', loadedItems);
                });
        }).catch(e => {
            console.log('Не удалось загрузить блоки:', e);
            loadedBlocks = mcPackData.fallbackBlocks || [];
            loadedItems = mcPackData.fallbackItems || [];
            renderGalleryGrid('blocks', loadedBlocks);
            renderGalleryGrid('items', loadedItems);
        });

    // --- Логика Слайсера ---
    let slicerContext = {
        blockId: null, // Напр. dyn_blocks_1
        img: null,
        selections: {}, // { sideId: {x, y} в пикселях исходного изображения }
        isDragging: false,
        dragTarget: null,
        dragOffsetX: 0,
        dragOffsetY: 0
    };

    function openSlicer(blockId) {
        slicerContext = { blockId: blockId, img: null, selections: {}, isDragging: false, dragTarget: null, dragOffsetX: 0, dragOffsetY: 0 };
        document.getElementById('slicerModal').style.display = 'flex';
        document.getElementById('slicerContainer').style.display = 'none';
        document.getElementById('slicerControls').style.display = 'none';
        document.getElementById('slicerInput').value = '';
        
        // Сброс активных кнопок
        document.querySelectorAll('#slicerControls .slicer-btn').forEach(b => {
             b.style.boxShadow = 'none';
             b.style.background = 'rgba(255, 255, 255, 0.1)';
        });
    }

    function closeSlicer() {
        document.getElementById('slicerModal').style.display = 'none';
    }

    function loadAtlas(input) {
        if (!input.files || !input.files[0]) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                if (img.width % 16 !== 0 || img.height % 16 !== 0) {
                    alert(UI_TEXT.invalidResolution(img.width, img.height));
                }
                slicerContext.img = img;
                slicerContext.selections = {};
                
                document.querySelectorAll('#slicerControls .slicer-btn').forEach(b => {
                     b.style.boxShadow = 'none';
                     b.style.background = 'rgba(255, 255, 255, 0.1)';
                });

                document.getElementById('slicerContainer').style.display = 'inline-block';
                document.getElementById('slicerControls').style.display = 'flex';
                redrawCanvas();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }

    function redrawCanvas() {
        if (!slicerContext.img) return;
        
        const canvas = document.getElementById('slicerCanvas');
        const ctx = canvas.getContext('2d');
        const gridSize = parseInt(document.getElementById('slicerGridSize').value) || 16;
        const zoom = parseInt(document.getElementById('slicerZoom').value) || 4;

        const imgW = slicerContext.img.width;
        const imgH = slicerContext.img.height;
        
        canvas.width = imgW * zoom;
        canvas.height = imgH * zoom;

        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Рисуем шахматный фон
        ctx.fillStyle = '#444';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#666';
        const bgGrid = 8 * zoom;
        for (let x = 0; x < canvas.width; x += bgGrid) {
            for (let y = 0; y < canvas.height; y += bgGrid) {
                if ((x / bgGrid + y / bgGrid) % 2 === 0) ctx.fillRect(x, y, bgGrid, bgGrid);
            }
        }

        // Рисуем картинку
        ctx.drawImage(slicerContext.img, 0, 0, imgW * zoom, imgH * zoom);

        // Рисуем сетку (тонко)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.lineWidth = 1;
        const scaledGrid = gridSize * zoom;
        
        ctx.beginPath();
        for (let x = 0; x <= canvas.width; x += scaledGrid) {
            ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height);
        }
        for (let y = 0; y <= canvas.height; y += scaledGrid) {
            ctx.moveTo(0, y); ctx.lineTo(canvas.width, y);
        }
        ctx.stroke();

        // Рисуем назначения (Top, Bottom, etc)
        const faceColors = {
            main: 'rgba(168, 85, 247, 0.7)',
            top: 'rgba(239, 68, 68, 0.7)',
            bottom: 'rgba(59, 130, 246, 0.7)',
            front: 'rgba(16, 185, 129, 0.7)',
            back: 'rgba(99, 102, 241, 0.7)',
            left: 'rgba(236, 72, 153, 0.7)',
            right: 'rgba(20, 184, 166, 0.7)',
            side: 'rgba(245, 158, 11, 0.7)'
        };
        const faceLabels = UI_TEXT.faceLabels;

        for (const [face, coords] of Object.entries(slicerContext.selections)) {
            ctx.fillStyle = faceColors[face] || 'rgba(0,0,0,0.5)';
            const tX = coords.x * zoom;
            const tY = coords.y * zoom;
            
            // Если мы прямо сейчас перетаскиваем этот кубик, делаем его чуть прозрачнее
            if (slicerContext.isDragging && slicerContext.dragTarget === face) {
                ctx.globalAlpha = 0.5;
            } else {
                ctx.globalAlpha = 1.0;
            }

            ctx.fillRect(tX, tY, scaledGrid, scaledGrid);
            
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.strokeRect(tX, tY, scaledGrid, scaledGrid);
            
            // Текст
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.shadowColor = "black";
            ctx.shadowBlur = 4;
            ctx.fillText(faceLabels[face], tX + scaledGrid/2, tY + scaledGrid/2);
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1.0;
        }
    }

    // Слушатель событий перетаскивания и кликов по канвасу
    document.addEventListener('DOMContentLoaded', () => {
        const canvas = document.getElementById('slicerCanvas');
        if (canvas) {
            function getMousePos(e) {
                const rect = canvas.getBoundingClientRect();
                const scaleX = canvas.width / rect.width;
                const scaleY = canvas.height / rect.height;
                const zoom = parseInt(document.getElementById('slicerZoom').value) || 4;
                return {
                    x: (e.clientX - rect.left) * scaleX / zoom, // в координатах исходной картинки px
                    y: (e.clientY - rect.top) * scaleY / zoom
                };
            }

            canvas.addEventListener('mousedown', (e) => {
                if (!slicerContext.img) return;
                const pos = getMousePos(e);
                const gridSize = parseInt(document.getElementById('slicerGridSize').value) || 16;
                const zoom = parseInt(document.getElementById('slicerZoom').value) || 4;

                // Проверяем, кликнули ли мы внутрь существующего кубика
                slicerContext.dragTarget = null;
                for (const [face, coords] of Object.entries(slicerContext.selections)) {
                    if (pos.x >= coords.x && pos.x <= coords.x + gridSize &&
                        pos.y >= coords.y && pos.y <= coords.y + gridSize) {
                        
                        slicerContext.isDragging = true;
                        slicerContext.dragTarget = face;
                        slicerContext.dragOffsetX = pos.x - coords.x;
                        slicerContext.dragOffsetY = pos.y - coords.y;
                        break;
                    }
                }
                
                // Чтобы при клике канвас не пытался выделять текст
                e.preventDefault();
                redrawCanvas();
            });

            canvas.addEventListener('mousemove', (e) => {
                if (slicerContext.isDragging && slicerContext.dragTarget && slicerContext.img) {
                    const pos = getMousePos(e);
                    const gridSize = parseInt(document.getElementById('slicerGridSize').value) || 16;
                    
                    let newX = pos.x - slicerContext.dragOffsetX;
                    let newY = pos.y - slicerContext.dragOffsetY;
                    
                    const snapEnabled = document.getElementById('slicerSnap').checked;
                    if (snapEnabled) {
                        newX = Math.round(newX / gridSize) * gridSize;
                        newY = Math.round(newY / gridSize) * gridSize;
                    } else {
                        newX = Math.round(newX);
                        newY = Math.round(newY);
                    }
                    
                    // Обрезаем, чтобы не выходило за границы картинки
                    newX = Math.max(0, Math.min(slicerContext.img.width - gridSize, newX));
                    newY = Math.max(0, Math.min(slicerContext.img.height - gridSize, newY));

                    slicerContext.selections[slicerContext.dragTarget].x = newX;
                    slicerContext.selections[slicerContext.dragTarget].y = newY;
                    redrawCanvas();
                }
            });

            const stopDrag = () => {
                if(slicerContext.isDragging) {
                    slicerContext.isDragging = false;
                    slicerContext.dragTarget = null;
                    redrawCanvas();
                }
            };

            canvas.addEventListener('mouseup', stopDrag);
            canvas.addEventListener('mouseleave', stopDrag);

            // Удаление квадратов по ПКМ
            canvas.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                if (!slicerContext.img) return;
                const pos = getMousePos(e);
                const gridSize = parseInt(document.getElementById('slicerGridSize').value) || 16;
                
                for (const [face, coords] of Object.entries(slicerContext.selections)) {
                    if (pos.x >= coords.x && pos.x <= coords.x + gridSize &&
                        pos.y >= coords.y && pos.y <= coords.y + gridSize) {
                        
                        delete slicerContext.selections[face];
                        const btn = document.querySelector(`.slicer-btn.${face}`);
                        if (btn) {
                            btn.style.boxShadow = 'none';
                            btn.style.background = 'rgba(255, 255, 255, 0.1)';
                        }
                        redrawCanvas();
                        break;
                    }
                }
            });
        }
    });

    function assignFace(side) {
        if (!slicerContext.img) return;
        
        const btn = document.querySelector(`.slicer-btn.${side}`);
        
        if (slicerContext.selections[side]) {
            // Если уже есть - выключаем (удаляем кубик)
            delete slicerContext.selections[side];
            if (btn) {
                btn.style.boxShadow = 'none';
                btn.style.background = 'rgba(255, 255, 255, 0.1)';
            }
        } else {
            // Включаем - добавляем кубик в угол или центр
            slicerContext.selections[side] = { x: 0, y: 0 };
            if (btn) {
                btn.style.boxShadow = 'inset 0 0 10px rgba(0,0,0,0.5)';
                btn.style.background = 'var(--accent)';
            }
        }
        redrawCanvas();
    }

    function clearSlicerSelections() {
        slicerContext.selections = {};
        document.querySelectorAll('#slicerControls .slicer-btn').forEach(btn => {
            if (!btn.hasAttribute('onclick') || btn.getAttribute('onclick').includes('clearSlicer')) return;
            btn.style.boxShadow = 'none';
            btn.style.background = 'rgba(255, 255, 255, 0.1)';
        });
        redrawCanvas();
    }

    // Применение нарезки
    function applySlices() {
        if (!slicerContext.img || !slicerContext.blockId) return;
        const gridSize = parseInt(document.getElementById('slicerGridSize').value) || 16;
        
        let rowIdBase = slicerContext.blockId; 
        
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = gridSize;
        tempCanvas.height = gridSize;
        const ctx = tempCanvas.getContext('2d');

        let appliedCount = 0;
        for (const [side, coords] of Object.entries(slicerContext.selections)) {
            ctx.clearRect(0, 0, gridSize, gridSize);
            ctx.drawImage(
                slicerContext.img, 
                coords.x, coords.y, gridSize, gridSize, // Область исходника в пикселях
                0, 0, gridSize, gridSize
            );
            
            const dataUrl = tempCanvas.toDataURL('image/png');
            const fileId = `${rowIdBase}_${side}`;
            filesData[fileId] = dataUrl.split(',')[1];
            
            const preview = document.getElementById(`prev_${fileId}`);
            const status = document.getElementById(`stat_${fileId}`);
            if (preview) {
                preview.src = dataUrl;
                preview.style.display = 'block';
            }
            if (status) {
                status.innerHTML = `✔<br><small style="font-size:9px;">(${UI_TEXT.sliced})</small>`;
                status.style.color = '#34d399';
                status.style.display = 'block';
                status.style.lineHeight = '1.2';
            }
            const clearBtn = document.getElementById(`clear_${fileId}`);
            if(clearBtn) clearBtn.style.display = 'flex';
            
            appliedCount++;
        }
        
        closeSlicer();
        if(appliedCount > 0) {
            const inputName = document.getElementById(`input_${rowIdBase}`);
            const fileInput = document.getElementById('slicerInput');
            if (inputName && !inputName.value && fileInput.files[0]) {
                let name = fileInput.files[0].name.replace(/\.[^/.]+$/, "");
                name = name.replace(/_(top|bottom|front|side|atlas)$/i, '');
                inputName.value = name;
            }
        }
    }

    // --- 3D Preview Logic ---
    let preScene, preCamera, preRenderer, preControls;
    let preAnimId;
    let preCurrentObj;

    function initPreviewEnv() {
        if (preRenderer) return;
        const container = document.getElementById('previewContainer');
        preScene = new THREE.Scene();
        preCamera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
        preRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        preRenderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(preRenderer.domElement);

        preControls = new THREE.OrbitControls(preCamera, preRenderer.domElement);
        preControls.enableDamping = true;
        preControls.dampingFactor = 0.05;

        const light1 = new THREE.AmbientLight(0xffffff, 0.6);
        preScene.add(light1);
        const light2 = new THREE.DirectionalLight(0xffffff, 0.8);
        light2.position.set(10, 20, 10);
        preScene.add(light2);

        window.addEventListener('resize', () => {
            if (document.getElementById('previewModal').style.display !== 'flex') return;
            preCamera.aspect = container.clientWidth / container.clientHeight;
            preCamera.updateProjectionMatrix();
            preRenderer.setSize(container.clientWidth, container.clientHeight);
        });
    }

    function texLoad(b64) {
        if (!b64) return null;
        let t = new THREE.TextureLoader().load("data:image/png;base64," + b64);
        t.magFilter = THREE.NearestFilter;
        t.minFilter = THREE.NearestFilter;
        return t;
    }

    function getPreviewFaceLabels() {
        const isEnglish = document.documentElement.lang === 'en';
        return isEnglish
            ? { top: 'Top', bottom: 'Bottom', front: 'Front', back: 'Back', left: 'Left', right: 'Right' }
            : { top: 'Верх', bottom: 'Низ', front: 'Перед', back: 'Зад', left: 'Лево', right: 'Право' };
    }

    function createPreviewLabelTexture(text) {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 80;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = 'rgba(2, 6, 23, 0.72)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = 'rgba(96, 165, 250, 0.92)';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, canvas.width - 4, canvas.height - 4);
        ctx.font = '700 30px Arial, sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, canvas.width / 2, canvas.height / 2);

        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.LinearFilter;
        texture.minFilter = THREE.LinearFilter;
        return texture;
    }

    function createPreviewFaceLabel(text, position, rotation) {
        const labelTexture = createPreviewLabelTexture(text);
        const labelMaterial = new THREE.MeshBasicMaterial({
            map: labelTexture,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });
        const label = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.14), labelMaterial);
        label.position.set(position[0], position[1], position[2]);
        label.rotation.set(rotation[0], rotation[1], rotation[2]);
        return label;
    }

    function addBlockFaceLabels(targetGroup) {
        const labels = getPreviewFaceLabels();
        const gap = 0.535;
        const under = -0.68;
        const labelSpecs = [
            { key: 'front', position: [0, under, gap], rotation: [0, 0, 0] },
            { key: 'back', position: [0, under, -gap], rotation: [0, Math.PI, 0] },
            { key: 'left', position: [-gap, under, 0], rotation: [0, -Math.PI / 2, 0] },
            { key: 'right', position: [gap, under, 0], rotation: [0, Math.PI / 2, 0] },
            { key: 'top', position: [0, gap, 0.68], rotation: [-Math.PI / 2, 0, 0] },
            { key: 'bottom', position: [0, -gap, 0.68], rotation: [Math.PI / 2, 0, 0] }
        ];

        labelSpecs.forEach(spec => {
            targetGroup.add(createPreviewFaceLabel(labels[spec.key], spec.position, spec.rotation));
        });
    }

    function openPreview(id, type) {
        document.getElementById('previewModal').style.display = 'flex';
        initPreviewEnv();
        
        if (preCurrentObj) preScene.remove(preCurrentObj);
        preCurrentObj = new THREE.Group();
        preScene.add(preCurrentObj);

        // Показ UI контроля камеры только для предметов
        document.getElementById('cameraControls').style.display = (type === 'items') ? 'flex' : 'none';

        if (type === 'blocks') {
            const geom = new THREE.BoxGeometry(1, 1, 1);
            
            const getTex = (side, fback, fback2) => texLoad(filesData[`${id}_${side}`]) || texLoad(filesData[`${id}_${fback}`]) || texLoad(filesData[`${id}_${fback2}`]) || texLoad(filesData[`${id}_main`]);
            
            const mats = [
                new THREE.MeshStandardMaterial({ map: getTex('right', 'side'), transparent: true, alphaTest: 0.5 }), // right (east)
                new THREE.MeshStandardMaterial({ map: getTex('left', 'side'), transparent: true, alphaTest: 0.5 }),  // left (west)
                new THREE.MeshStandardMaterial({ map: getTex('top', 'side'), transparent: true, alphaTest: 0.5 }),   // top (up)
                new THREE.MeshStandardMaterial({ map: getTex('bottom', 'side'), transparent: true, alphaTest: 0.5 }),// bottom (down)
                new THREE.MeshStandardMaterial({ map: getTex('front', 'side'), transparent: true, alphaTest: 0.5 }), // front (north)
                new THREE.MeshStandardMaterial({ map: getTex('back', 'side'), transparent: true, alphaTest: 0.5 })   // back (south)
            ];
            
            // Заглушка если ничего нет
            mats.forEach(m => {
                if(!m.map) {
                    m.color.setHex(0xff00ff);
                }
            });

            const mesh = new THREE.Mesh(geom, mats);
            preCurrentObj.add(mesh);
            addBlockFaceLabels(preCurrentObj);
            preCamera.position.set(1.5, 1.5, 2);
            preControls.target.set(0, 0, 0);
        } else if (type === 'items') {
            const map = texLoad(filesData[id]);
            const geom = new THREE.PlaneGeometry(1, 1);
            const mat = new THREE.MeshStandardMaterial({ map: map, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
            if (!map) mat.color.setHex(0xff00ff);
            
            const mesh = new THREE.Mesh(geom, mat);
            // Немного сдвигаем чтобы предмет стоял
            preCurrentObj.add(mesh);
            preCurrentObj.userData.isItem = true;
            
            preCamera.position.set(0, 0.5, 2);
            preControls.target.set(0, 0, 0);
        } else if (type === 'armor') {
            // Упрощенная модель Стива. 1 единица = 1 пиксель (будем скейлить чтобы влезло в камеру)
            const map1 = texLoad(filesData[`${id}_layer_1`]);
            const map2 = texLoad(filesData[`${id}_layer_2`]);
            
            // Используем только простую заливку если UV слишком сложно, но попытаемся наложить карту.
            const mat1 = new THREE.MeshStandardMaterial({ map: map1, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
            const mat2 = new THREE.MeshStandardMaterial({ map: map2, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide });
            if (!map1) mat1.color.setHex(0xaaaaaa);
            
            function createPart(w, h, d, yPos, mat) {
                const g = new THREE.BoxGeometry(w/16, h/16, d/16);
                const m = new THREE.Mesh(g, mat);
                m.position.y = yPos/16;
                return m;
            }
            
            // Голова
            preCurrentObj.add(createPart(8, 8, 8, 28, mat1));
            // Тело
            preCurrentObj.add(createPart(8, 12, 4, 18, mat1)); // нагрудник
            // Руки
            let la = createPart(4, 12, 4, 18, mat1); la.position.x = 6/16; preCurrentObj.add(la);
            let ra = createPart(4, 12, 4, 18, mat1); ra.position.x = -6/16; preCurrentObj.add(ra);
            
            // Ноги / Поножи
            let ll = createPart(4, 12, 4, 6, mat2); ll.position.x = 2/16; preCurrentObj.add(ll);
            let rl = createPart(4, 12, 4, 6, mat2); rl.position.x = -2/16; preCurrentObj.add(rl);
            
            // Ботинки
            let llb = createPart(4.2, 4, 4.2, 2, mat1); llb.position.x = 2/16; preCurrentObj.add(llb);
            let rlb = createPart(4.2, 4, 4.2, 2, mat1); rlb.position.x = -2/16; preCurrentObj.add(rlb);

            // Подвигаем модель к центру для вращения
            preCurrentObj.position.y = -1;
            
            preCamera.position.set(0, 0.5, 2.5);
            preControls.target.set(0, 0, 0);
        }

        preControls.update();
        setCameraView('third_front'); // по умолчанию
        
        if (preAnimId) cancelAnimationFrame(preAnimId);
        
        function animate() {
            preAnimId = requestAnimationFrame(animate);
            preControls.update();
            
            if (preCurrentObj && preCurrentObj.userData.isItem) {
                if (preCurrentObj.userData.view === 'first') {
                    // Закрепляем предмет сбоку как в руках
                    preCurrentObj.rotation.set(0, -Math.PI / 4, 0);
                    preCurrentObj.position.set(0.6, -0.4, -1.2);
                } else {
                    preCurrentObj.rotation.y += 0.02; // вращение предмета
                    preCurrentObj.position.set(0, Math.sin(Date.now() / 300) * 0.1, 0); // подпрыгивание
                    preCurrentObj.rotation.x = 0;
                    preCurrentObj.rotation.z = 0;
                }
            } else if (type === 'blocks') {
                preCurrentObj.rotation.y += 0.005; // медленное вращение блока
            }
            
            preRenderer.render(preScene, preCamera);
        }
        animate();
    }

    function closePreview() {
        document.getElementById('previewModal').style.display = 'none';
        if (preAnimId) cancelAnimationFrame(preAnimId);
        
        if (preCurrentObj) {
            preCurrentObj.children.forEach(c => {
                if (c.geometry) c.geometry.dispose();
                if (c.material) {
                    if (Array.isArray(c.material)) {
                        c.material.forEach(m => {
                            if (m.map) m.map.dispose();
                            m.dispose();
                        });
                    } else {
                        if (c.material.map) c.material.map.dispose();
                        c.material.dispose();
                    }
                }
            });
            preScene.remove(preCurrentObj);
            preCurrentObj = null;
        }
    }

    function setCameraView(view) {
        if (!preCamera || !preControls) return;
        
        // Кнопки визуал
        document.querySelectorAll('#cameraControls .slicer-btn').forEach(b => b.style.background = 'rgba(255, 255, 255, 0.1)');
        
        if (preCurrentObj) preCurrentObj.userData.view = view;
        
        if (view === 'first') {
            const firstBtn = document.getElementById('btn_cam_first');
            if (firstBtn) firstBtn.style.background = 'var(--accent)';
            preCamera.position.set(0, 0, 0); 
            preControls.target.set(0, 0, -1);
        } else if (view === 'third_front') {
            const frontBtn = document.getElementById('btn_cam_front');
            if (frontBtn) frontBtn.style.background = 'var(--accent)';
            preCamera.position.set(0, 0.5, 2.5);
            preControls.target.set(0, 0, 0);
        }
        preControls.update();
    }

    Object.assign(window, {
        openTab,
        handleFileUpload,
        bindUploadZone,
        clearUploadZone,
        getBlockZoneHtml,
        updateAllGiveCommands,
        updateGiveCommand,
        addDynamicRow,
        removeDynamicRow,
        filterGallery: window.filterGallery,
        getBestBlockTexture,
        openSlicer,
        closeSlicer,
        loadAtlas,
        redrawCanvas,
        assignFace,
        clearSlicerSelections,
        applySlices,
        openPreview,
        closePreview,
        setCameraView
    });
