(function () {
    const DEFAULT_SIZE = 16;
    const DEFAULT_ZOOM = 18;
    const ZOOM_LEVELS = [6, 8, 12, 18, 24, 32];
    const ZOOM_BY_SIZE = {
        16: 18,
        32: 12,
        64: 8,
        128: 6
    };
    const HISTORY_LIMIT = 40;
    const UI_LANG = (document.documentElement.lang || 'en').toLowerCase().split('-')[0];
    const UI_TEXT = {
        en: {
            toolNames: { brush: 'brush', eraser: 'eraser', picker: 'picker', zoom: 'zoom' },
            colorAria: (hex, alpha) => `Use color ${hex} at ${alpha}% opacity`
        },
        ru: {
            toolNames: { brush: 'Кисть', eraser: 'Ластик', picker: 'Пипетка', zoom: 'Зум' },
            colorAria: (hex, alpha) => `Использовать цвет ${hex} с непрозрачностью ${alpha}%`
        },
        fr: {
            toolNames: { brush: 'Pinceau', eraser: 'Gomme', picker: 'Pipette', zoom: 'Zoom' },
            colorAria: (hex, alpha) => `Utiliser la couleur ${hex} avec ${alpha}% d’opacité`
        },
        de: {
            toolNames: { brush: 'Pinsel', eraser: 'Radierer', picker: 'Pipette', zoom: 'Zoom' },
            colorAria: (hex, alpha) => `Farbe ${hex} mit ${alpha}% Deckkraft verwenden`
        }
    };
    const PALETTE_TEXT = {
        en: {
            title: 'Palette from image',
            action: 'Extract palette',
            hint: 'Upload any reference image and keep its main colors close while you paint.',
            empty: 'No extracted palette yet.',
            ready: (count) => `${count} colors ready from the image.`,
            invalid: 'Could not read colors from that image.'
        },
        ru: {
            title: '\u041f\u0430\u043b\u0438\u0442\u0440\u0430 \u0438\u0437 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0438',
            action: '\u0412\u044b\u0442\u0430\u0449\u0438\u0442\u044c \u043f\u0430\u043b\u0438\u0442\u0440\u0443',
            hint: '\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 \u043b\u044e\u0431\u0443\u044e \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0443-\u0440\u0435\u0444\u0435\u0440\u0435\u043d\u0441, \u0447\u0442\u043e\u0431\u044b \u0434\u0435\u0440\u0436\u0430\u0442\u044c \u0435\u0451 \u043e\u0441\u043d\u043e\u0432\u043d\u044b\u0435 \u0446\u0432\u0435\u0442\u0430 \u0440\u044f\u0434\u043e\u043c.',
            empty: '\u041f\u0430\u043b\u0438\u0442\u0440\u0430 \u0435\u0449\u0451 \u043d\u0435 \u0438\u0437\u0432\u043b\u0435\u0447\u0435\u043d\u0430.',
            ready: (count) => `\u0413\u043e\u0442\u043e\u0432\u043e: ${count} \u0446\u0432\u0435\u0442.`,
            invalid: '\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u0447\u0438\u0442\u0430\u0442\u044c \u0446\u0432\u0435\u0442\u0430 \u0441 \u044d\u0442\u043e\u0439 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0438.'
        },
        fr: {
            title: 'Palette depuis une image',
            action: 'Extraire la palette',
            hint: 'Importez une image de r\u00e9f\u00e9rence pour garder ses couleurs principales sous la main pendant la peinture.',
            empty: 'Aucune palette extraite pour le moment.',
            ready: (count) => `${count} couleurs pr\u00eates depuis l\u2019image.`,
            invalid: 'Impossible de lire les couleurs de cette image.'
        },
        de: {
            title: 'Palette aus Bild',
            action: 'Palette extrahieren',
            hint: 'Lade ein Referenzbild hoch und halte seine wichtigsten Farben beim Zeichnen griffbereit.',
            empty: 'Noch keine Palette extrahiert.',
            ready: (count) => `${count} Farben aus dem Bild bereit.`,
            invalid: 'Die Farben aus diesem Bild konnten nicht gelesen werden.'
        }
    };
    const text = UI_TEXT[UI_LANG] || UI_TEXT.en;
    const paletteText = PALETTE_TEXT[UI_LANG] || PALETTE_TEXT.en;
    const FILE_NAME_TEXT = {
        en: {
            label: 'Export file name',
            placeholder: 'minecraft-texture-16',
            hint: 'The .png extension is added automatically on export.'
        },
        ru: {
            label: '\u0418\u043c\u044f \u0444\u0430\u0439\u043b\u0430 \u0434\u043b\u044f \u044d\u043a\u0441\u043f\u043e\u0440\u0442\u0430',
            placeholder: 'minecraft-texture-16',
            hint: '\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u0438\u0435 .png \u0434\u043e\u0431\u0430\u0432\u0438\u0442\u0441\u044f \u0430\u0432\u0442\u043e\u043c\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438.'
        },
        fr: {
            label: 'Nom du fichier export\u00e9',
            placeholder: 'minecraft-texture-16',
            hint: 'L\u2019extension .png est ajout\u00e9e automatiquement \u00e0 l\u2019export.'
        },
        de: {
            label: 'Export-Dateiname',
            placeholder: 'minecraft-texture-16',
            hint: 'Die Endung .png wird beim Export automatisch angeh\u00e4ngt.'
        }
    };
    const fileNameText = FILE_NAME_TEXT[UI_LANG] || FILE_NAME_TEXT.en;
    const state = {
        size: DEFAULT_SIZE,
        zoom: DEFAULT_ZOOM,
        tool: 'brush',
        brushSize: 1,
        extractedPalette: [],
        recentColors: [],
        painting: false,
        lastPoint: null,
        undoStack: [],
        redoStack: [],
        navigatorDragging: false
    };

    const elements = {};
    let textureCanvas;
    let textureCtx;
    let editorCanvas;
    let editorCtx;
    let navigatorCtx;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function recommendedZoomForSize(size) {
        return ZOOM_BY_SIZE[size] || 8;
    }

    function normalizeZoomLevel(value) {
        const numeric = clamp(Number(value || DEFAULT_ZOOM), ZOOM_LEVELS[0], ZOOM_LEVELS[ZOOM_LEVELS.length - 1]);
        return ZOOM_LEVELS.reduce((closest, candidate) => (Math.abs(candidate - numeric) < Math.abs(closest - numeric) ? candidate : closest), ZOOM_LEVELS[0]);
    }

    function getColorRgba() {
        const hex = String(elements.color.value || '#ffffff').replace('#', '');
        const alpha = clamp(Number(elements.alpha.value || 100), 0, 100) / 100;
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
            a: Math.round(alpha * 255)
        };
    }

    function getCurrentColorSnapshot() {
        return {
            hex: String(elements.color.value || '#ffffff'),
            alpha: clamp(Number(elements.alpha.value || 100), 0, 100)
        };
    }

    function applyColorSnapshot(snapshot) {
        if (!snapshot) return;
        elements.color.value = snapshot.hex;
        elements.alpha.value = snapshot.alpha;
        elements.alphaValue.textContent = `${snapshot.alpha}%`;
        renderSimilarColors();
    }

    function hexToRgb(hex) {
        const value = String(hex || '#ffffff').replace('#', '');
        return {
            r: parseInt(value.slice(0, 2), 16),
            g: parseInt(value.slice(2, 4), 16),
            b: parseInt(value.slice(4, 6), 16)
        };
    }

    function rgbToHex(r, g, b) {
        return `#${[r, g, b].map((value) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, '0')).join('')}`;
    }

    function sanitizeFileBaseName(value, fallback) {
        const base = String(value || '')
            .replace(/\.[^./\\]+$/, '')
            .replace(/[<>:"/\\|?*\u0000-\u001F]/g, '')
            .trim()
            .replace(/\s+/g, ' ')
            .replace(/[. ]+$/g, '');
        return base || fallback;
    }

    function colorDistance(first, second) {
        return Math.sqrt(
            ((first.r || 0) - (second.r || 0)) ** 2 +
            ((first.g || 0) - (second.g || 0)) ** 2 +
            ((first.b || 0) - (second.b || 0)) ** 2
        );
    }

    function extractPaletteFromSource(source, options) {
        const config = Object.assign({
            maxColors: 8,
            maxDimension: 48,
            minAlpha: 24,
            minDistance: 42
        }, options || {});

        const width = Number(source && source.width) || 0;
        const height = Number(source && source.height) || 0;
        if (!width || !height) return [];

        const ratio = Math.min(1, config.maxDimension / Math.max(width, height));
        const sampleWidth = Math.max(1, Math.round(width * ratio));
        const sampleHeight = Math.max(1, Math.round(height * ratio));
        const sampleCanvas = document.createElement('canvas');
        sampleCanvas.width = sampleWidth;
        sampleCanvas.height = sampleHeight;
        const sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });
        sampleCtx.imageSmoothingEnabled = true;
        sampleCtx.clearRect(0, 0, sampleWidth, sampleHeight);
        sampleCtx.drawImage(source, 0, 0, width, height, 0, 0, sampleWidth, sampleHeight);

        const { data } = sampleCtx.getImageData(0, 0, sampleWidth, sampleHeight);
        const buckets = new Map();

        for (let index = 0; index < data.length; index += 4) {
            const alpha = data[index + 3];
            if (alpha < config.minAlpha) continue;

            const red = data[index];
            const green = data[index + 1];
            const blue = data[index + 2];
            const key = `${Math.round(red / 32)}|${Math.round(green / 32)}|${Math.round(blue / 32)}`;
            const bucket = buckets.get(key) || { count: 0, red: 0, green: 0, blue: 0 };
            bucket.count += 1;
            bucket.red += red;
            bucket.green += green;
            bucket.blue += blue;
            buckets.set(key, bucket);
        }

        const candidates = Array.from(buckets.values())
            .sort((left, right) => right.count - left.count)
            .map((bucket) => ({
                r: bucket.red / bucket.count,
                g: bucket.green / bucket.count,
                b: bucket.blue / bucket.count
            }));

        const palette = [];
        candidates.forEach((candidate) => {
            if (palette.length >= config.maxColors) return;
            if (palette.some((entry) => colorDistance(entry, candidate) < config.minDistance)) return;
            palette.push(candidate);
        });

        if (palette.length < config.maxColors) {
            candidates.forEach((candidate) => {
                if (palette.length >= config.maxColors) return;
                if (palette.some((entry) => colorDistance(entry, candidate) < 18)) return;
                palette.push(candidate);
            });
        }

        return palette.slice(0, config.maxColors).map((entry) => ({
            hex: rgbToHex(entry.r, entry.g, entry.b),
            alpha: 100
        }));
    }

    function mixHex(hex, targetHex, amount) {
        const from = hexToRgb(hex);
        const to = hexToRgb(targetHex);
        return rgbToHex(
            from.r + (to.r - from.r) * amount,
            from.g + (to.g - from.g) * amount,
            from.b + (to.b - from.b) * amount
        );
    }

    function fillRectPixels(x, y, width, height, color) {
        textureCtx.fillStyle = color;
        textureCtx.fillRect(x, y, width, height);
    }

    function drawPixelNoise(x, y, color) {
        textureCtx.fillStyle = color;
        textureCtx.fillRect(x, y, 1, 1);
    }

    function applyBlockTemplate() {
        const templateSize = 64;
        const tileSize = 16;
        const base = String(elements.color.value || '#8b5cf6');
        const light = mixHex(base, '#ffffff', 0.12);
        const lighter = mixHex(base, '#ffffff', 0.24);
        const dark = mixHex(base, '#000000', 0.16);
        const darker = mixHex(base, '#000000', 0.3);
        const deepest = mixHex(base, '#000000', 0.42);
        const accent = mixHex(base, '#d1d5db', 0.16);
        const renameWithDefault = shouldAutoRenameTextureFile();

        function fillTilePixels(originX, originY, localX, localY, width, height, color) {
            fillRectPixels(originX + localX, originY + localY, width, height, color);
        }

        function drawTile(originX, originY, variant) {
            fillTilePixels(originX, originY, 0, 0, tileSize, tileSize, base);

            fillTilePixels(originX, originY, 0, 0, tileSize, 1, light);
            fillTilePixels(originX, originY, 0, 0, 1, tileSize, light);
            fillTilePixels(originX, originY, 0, tileSize - 1, tileSize, 1, dark);
            fillTilePixels(originX, originY, tileSize - 1, 0, 1, tileSize, dark);

            fillTilePixels(originX, originY, 1, 1, tileSize - 2, tileSize - 2, mixHex(base, '#ffffff', 0.04));
            fillTilePixels(originX, originY, 4, 2, 4, 1, lighter);
            fillTilePixels(originX, originY, 9, 3, 2, 1, light);
            fillTilePixels(originX, originY, 3, 9, 3, 1, accent);
            fillTilePixels(originX, originY, 10, 10, 2, 1, darker);

            if (variant === 'top') {
                fillTilePixels(originX, originY, 2, 2, 3, 2, lighter);
                fillTilePixels(originX, originY, 10, 2, 2, 2, lighter);
                fillTilePixels(originX, originY, 6, 7, 2, 2, dark);
            } else if (variant === 'bottom') {
                fillTilePixels(originX, originY, 3, 11, 4, 1, deepest);
                fillTilePixels(originX, originY, 10, 10, 2, 2, darker);
                fillTilePixels(originX, originY, 6, 5, 1, 2, dark);
            } else if (variant === 'front') {
                fillTilePixels(originX, originY, 2, 4, 3, 2, darker);
                fillTilePixels(originX, originY, 3, 5, 1, 1, deepest);
                fillTilePixels(originX, originY, 10, 6, 1, 2, light);
            } else if (variant === 'back') {
                fillTilePixels(originX, originY, 11, 4, 2, 2, darker);
                fillTilePixels(originX, originY, 4, 11, 3, 1, dark);
                fillTilePixels(originX, originY, 5, 5, 1, 2, light);
            } else if (variant === 'left') {
                fillTilePixels(originX, originY, 2, 2, 2, 3, darker);
                fillTilePixels(originX, originY, 2, 10, 2, 1, dark);
                fillTilePixels(originX, originY, 9, 7, 1, 1, lighter);
            } else if (variant === 'right') {
                fillTilePixels(originX, originY, 11, 3, 2, 3, darker);
                fillTilePixels(originX, originY, 10, 10, 2, 1, dark);
                fillTilePixels(originX, originY, 5, 6, 1, 1, lighter);
            }
        }

        if (state.size !== templateSize) {
            rebuildTextureCanvas(templateSize, false);
            state.size = templateSize;
            elements.canvasSize.value = String(templateSize);
            if (renameWithDefault) {
                syncTextureFileName(true);
            }
        }

        textureCtx.clearRect(0, 0, templateSize, templateSize);

        drawTile(16, 0, 'top');
        drawTile(0, 16, 'left');
        drawTile(16, 16, 'front');
        drawTile(32, 16, 'right');
        drawTile(48, 16, 'back');
        drawTile(16, 32, 'bottom');

        renderCanvas();
        setExtractedPalette(extractPaletteFromSource(textureCanvas));
        setZoom(recommendedZoomForSize(templateSize), { x: templateSize / 2, y: templateSize / 2 });
        centerStageOnPixel(templateSize / 2, templateSize / 2);
    }

    function renderColorButtons(container, snapshots) {
        if (!container) return;

        container.innerHTML = '';
        snapshots.forEach((snapshot) => {
            const hex = snapshot.hex.toUpperCase();
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'texture-recent-color';
            button.style.setProperty('--swatch', snapshot.hex);
            button.title = `${hex} | ${snapshot.alpha}%`;
            button.setAttribute('aria-label', text.colorAria(hex, snapshot.alpha));
            button.addEventListener('click', () => applyColorSnapshot(snapshot));
            container.appendChild(button);
        });
    }

    function renderRecentColors() {
        if (!elements.recentColors) return;
        renderColorButtons(elements.recentColors, state.recentColors);
    }

    function updateExtractedPaletteHint(message) {
        if (!elements.paletteHint) return;
        elements.paletteHint.textContent = message || paletteText.hint;
    }

    function renderExtractedPalette() {
        if (!elements.extractedColors) return;
        renderColorButtons(elements.extractedColors, state.extractedPalette);
    }

    function setExtractedPalette(snapshots) {
        state.extractedPalette = Array.isArray(snapshots) ? snapshots.slice(0, 8) : [];
        renderExtractedPalette();
        updateExtractedPaletteHint(
            state.extractedPalette.length
                ? paletteText.ready(state.extractedPalette.length)
                : paletteText.empty
        );
    }

    function buildSimilarColorSnapshots() {
        const current = getCurrentColorSnapshot();
        const variants = [
            mixHex(current.hex, '#ffffff', 0.18),
            mixHex(current.hex, '#ffffff', 0.35),
            current.hex,
            mixHex(current.hex, '#000000', 0.18),
            mixHex(current.hex, '#000000', 0.35),
            mixHex(current.hex, '#ffd166', 0.18),
            mixHex(current.hex, '#60a5fa', 0.18),
            mixHex(current.hex, '#22c55e', 0.18)
        ];
        const seen = new Set();
        return variants
            .map((hex) => ({ hex, alpha: current.alpha }))
            .filter((snapshot) => {
                const key = `${snapshot.hex}|${snapshot.alpha}`;
                if (seen.has(key)) return false;
                seen.add(key);
                return true;
            })
            .slice(0, 10);
    }

    function renderSimilarColors() {
        if (!elements.similarColors) return;
        renderColorButtons(elements.similarColors, buildSimilarColorSnapshots());
    }

    function rememberPaintedColor() {
        const snapshot = getCurrentColorSnapshot();
        const key = `${snapshot.hex}|${snapshot.alpha}`;
        state.recentColors = [snapshot]
            .concat(state.recentColors.filter((entry) => `${entry.hex}|${entry.alpha}` !== key))
            .slice(0, 10);
        renderRecentColors();
    }

    function ensurePaletteExtractor() {
        if (!elements.similarColors || document.getElementById('texturePaletteUploadButton')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'tool-field texture-palette-field';
        wrapper.innerHTML = `
            <div class="texture-palette-head">
                <label>${paletteText.title}</label>
                <button class="resource-link resource-link-secondary texture-inline-action" id="texturePaletteUploadButton" type="button">${paletteText.action}</button>
            </div>
            <input class="texture-hidden-input" id="texturePaletteFileInput" type="file" accept="image/*">
            <p class="texture-palette-note" id="texturePaletteHint">${paletteText.empty}</p>
            <div class="texture-recent-colors texture-extracted-colors" id="textureExtractedColors" aria-label="${paletteText.title}"></div>
        `;

        const targetField = elements.similarColors.closest('.tool-field');
        if (targetField && targetField.parentNode) {
            targetField.parentNode.insertBefore(wrapper, targetField.nextSibling);
        }
    }

    function ensureFileNameField() {
        if (!elements.fileInput || document.getElementById('textureFileNameInput')) return;
        const panel = elements.fileInput.closest('.tool-panel');
        const grid = panel ? panel.querySelector('.texture-tool-grid') : null;
        if (!panel || !grid) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'tool-field texture-file-name-field';
        wrapper.innerHTML = `
            <label for="textureFileNameInput">${fileNameText.label}</label>
            <input id="textureFileNameInput" type="text" autocomplete="off" placeholder="${fileNameText.placeholder}">
            <p class="texture-file-note texture-file-name-note">${fileNameText.hint}</p>
        `;
        panel.insertBefore(wrapper, grid);
    }

    function getTextureDefaultBaseName(size) {
        return `minecraft-texture-${Number(size || state.size || DEFAULT_SIZE)}`;
    }

    function shouldAutoRenameTextureFile() {
        if (!elements.fileNameInput) return false;
        const current = sanitizeFileBaseName(elements.fileNameInput.value, '');
        return !current || /^minecraft-texture-\d+$/.test(current);
    }

    function syncTextureFileName(force) {
        if (!elements.fileNameInput) return;
        if (force || shouldAutoRenameTextureFile()) {
            elements.fileNameInput.value = getTextureDefaultBaseName(state.size);
        }
    }

    function getTextureExportBaseName() {
        return sanitizeFileBaseName(
            elements.fileNameInput ? elements.fileNameInput.value : '',
            getTextureDefaultBaseName(state.size)
        );
    }

    function getStagePadding() {
        const style = window.getComputedStyle(elements.stage);
        return {
            left: parseFloat(style.paddingLeft || '0') || 0,
            right: parseFloat(style.paddingRight || '0') || 0,
            top: parseFloat(style.paddingTop || '0') || 0,
            bottom: parseFloat(style.paddingBottom || '0') || 0
        };
    }

    function getVisibleCanvasSize() {
        const padding = getStagePadding();
        return {
            width: Math.max(0, elements.stage.clientWidth - padding.left - padding.right),
            height: Math.max(0, elements.stage.clientHeight - padding.top - padding.bottom)
        };
    }

    function getViewportCenterPixel() {
        const visible = getVisibleCanvasSize();
        const x = clamp((elements.stage.scrollLeft + visible.width / 2) / state.zoom, 0, state.size - 0.5);
        const y = clamp((elements.stage.scrollTop + visible.height / 2) / state.zoom, 0, state.size - 0.5);
        return { x, y };
    }

    function centerStageOnPixel(pixelX, pixelY) {
        const visible = getVisibleCanvasSize();
        const nextLeft = pixelX * state.zoom - visible.width / 2;
        const nextTop = pixelY * state.zoom - visible.height / 2;

        elements.stage.scrollLeft = clamp(nextLeft, 0, Math.max(0, elements.stage.scrollWidth - elements.stage.clientWidth));
        elements.stage.scrollTop = clamp(nextTop, 0, Math.max(0, elements.stage.scrollHeight - elements.stage.clientHeight));
        renderNavigator();
    }

    function setZoom(nextZoom, focusPoint) {
        state.zoom = normalizeZoomLevel(nextZoom);
        elements.zoom.value = String(state.zoom);
        renderCanvas();
        if (focusPoint) {
            centerStageOnPixel(focusPoint.x, focusPoint.y);
        } else {
            renderNavigator();
        }
    }

    function stepZoom(direction, focusPoint) {
        const currentIndex = Math.max(0, ZOOM_LEVELS.indexOf(state.zoom));
        const nextIndex = clamp(currentIndex + direction, 0, ZOOM_LEVELS.length - 1);
        if (ZOOM_LEVELS[nextIndex] === state.zoom) return;
        setZoom(ZOOM_LEVELS[nextIndex], focusPoint);
    }

    function createSnapshot() {
        return {
            size: state.size,
            zoom: state.zoom,
            imageData: textureCtx.getImageData(0, 0, state.size, state.size)
        };
    }

    function updateHistoryButtons() {
        if (elements.undoButton) {
            elements.undoButton.disabled = state.undoStack.length === 0;
        }
        if (elements.undoQuickButton) {
            elements.undoQuickButton.disabled = state.undoStack.length === 0;
        }
        if (elements.redoButton) {
            elements.redoButton.disabled = state.redoStack.length === 0;
        }
        if (elements.redoQuickButton) {
            elements.redoQuickButton.disabled = state.redoStack.length === 0;
        }
    }

    function pushUndoSnapshot() {
        state.undoStack.push(createSnapshot());
        if (state.undoStack.length > HISTORY_LIMIT) {
            state.undoStack.shift();
        }
        state.redoStack = [];
        updateHistoryButtons();
    }

    function restoreSnapshot(snapshot) {
        if (!snapshot) return;

        if (snapshot.size !== state.size) {
            rebuildTextureCanvas(snapshot.size, false);
            state.size = snapshot.size;
            elements.canvasSize.value = String(snapshot.size);
        }

        textureCtx.clearRect(0, 0, state.size, state.size);
        textureCtx.putImageData(snapshot.imageData, 0, 0);
        state.zoom = normalizeZoomLevel(snapshot.zoom);
        elements.zoom.value = String(state.zoom);
        renderCanvas();
        centerStageOnPixel(state.size / 2, state.size / 2);
        updateHistoryButtons();
    }

    function undo() {
        if (!state.undoStack.length) return;
        state.redoStack.push(createSnapshot());
        const snapshot = state.undoStack.pop();
        restoreSnapshot(snapshot);
    }

    function redo() {
        if (!state.redoStack.length) return;
        state.undoStack.push(createSnapshot());
        const snapshot = state.redoStack.pop();
        restoreSnapshot(snapshot);
    }

    function rebuildTextureCanvas(nextSize, preserve) {
        const previous = document.createElement('canvas');
        previous.width = textureCanvas.width;
        previous.height = textureCanvas.height;
        previous.getContext('2d').drawImage(textureCanvas, 0, 0);

        textureCanvas.width = nextSize;
        textureCanvas.height = nextSize;
        textureCtx = textureCanvas.getContext('2d', { willReadFrequently: true });
        textureCtx.imageSmoothingEnabled = false;

        if (preserve) {
            textureCtx.clearRect(0, 0, nextSize, nextSize);
            textureCtx.drawImage(previous, 0, 0, previous.width, previous.height, 0, 0, nextSize, nextSize);
        } else {
            textureCtx.clearRect(0, 0, nextSize, nextSize);
        }
    }

    function drawPixel(x, y) {
        const half = Math.floor((state.brushSize - 1) / 2);
        const startX = x - half;
        const startY = y - half;

        if (state.tool === 'eraser') {
            textureCtx.clearRect(startX, startY, state.brushSize, state.brushSize);
            return;
        }

        const color = getColorRgba();
        textureCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
        textureCtx.fillRect(startX, startY, state.brushSize, state.brushSize);
    }

    function samplePixel(x, y) {
        const pixel = textureCtx.getImageData(clamp(x, 0, state.size - 1), clamp(y, 0, state.size - 1), 1, 1).data;
        const alpha = Math.round((pixel[3] / 255) * 100);
        const hex = `#${[pixel[0], pixel[1], pixel[2]].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
        elements.color.value = hex;
        elements.alpha.value = alpha;
        elements.alphaValue.textContent = `${alpha}%`;
        renderSimilarColors();
    }

    function drawLine(start, end) {
        let x0 = start.x;
        let y0 = start.y;
        const x1 = end.x;
        const y1 = end.y;
        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            drawPixel(x0, y0);
            if (x0 === x1 && y0 === y1) break;
            const err2 = err * 2;
            if (err2 > -dy) {
                err -= dy;
                x0 += sx;
            }
            if (err2 < dx) {
                err += dx;
                y0 += sy;
            }
        }
    }

    function renderNavigator() {
        if (!navigatorCtx || !elements.navigator) return;

        const width = elements.navigator.width;
        const height = elements.navigator.height;
        navigatorCtx.clearRect(0, 0, width, height);

        const tile = 12;
        for (let y = 0; y < height; y += tile) {
            for (let x = 0; x < width; x += tile) {
                navigatorCtx.fillStyle = ((x / tile) + (y / tile)) % 2 === 0 ? 'rgba(15, 23, 42, 0.96)' : 'rgba(30, 41, 59, 0.94)';
                navigatorCtx.fillRect(x, y, tile, tile);
            }
        }

        navigatorCtx.imageSmoothingEnabled = false;
        navigatorCtx.drawImage(textureCanvas, 0, 0, width, height);

        const visible = getVisibleCanvasSize();
        const widthRatio = visible.width / Math.max(editorCanvas.width, 1);
        const heightRatio = visible.height / Math.max(editorCanvas.height, 1);
        const viewportWidth = widthRatio >= 1 ? width : clamp(widthRatio * width, 12, width);
        const viewportHeight = heightRatio >= 1 ? height : clamp(heightRatio * height, 12, height);
        const viewportX = clamp((elements.stage.scrollLeft / Math.max(editorCanvas.width, 1)) * width, 0, Math.max(0, width - viewportWidth));
        const viewportY = clamp((elements.stage.scrollTop / Math.max(editorCanvas.height, 1)) * height, 0, Math.max(0, height - viewportHeight));

        navigatorCtx.strokeStyle = 'rgba(96, 165, 250, 0.96)';
        navigatorCtx.lineWidth = 2;
        navigatorCtx.strokeRect(viewportX, viewportY, viewportWidth, viewportHeight);
        navigatorCtx.fillStyle = 'rgba(59, 130, 246, 0.16)';
        navigatorCtx.fillRect(viewportX, viewportY, viewportWidth, viewportHeight);
    }

    function renderCanvas() {
        const canvasSize = state.size * state.zoom;
        editorCanvas.width = canvasSize;
        editorCanvas.height = canvasSize;
        editorCtx.imageSmoothingEnabled = false;
        editorCtx.clearRect(0, 0, canvasSize, canvasSize);

        for (let y = 0; y < state.size; y += 1) {
            for (let x = 0; x < state.size; x += 1) {
                editorCtx.fillStyle = (x + y) % 2 === 0 ? 'rgba(15, 23, 42, 0.88)' : 'rgba(30, 41, 59, 0.88)';
                editorCtx.fillRect(x * state.zoom, y * state.zoom, state.zoom, state.zoom);
            }
        }

        editorCtx.drawImage(textureCanvas, 0, 0, canvasSize, canvasSize);

        if (state.zoom >= 6) {
            editorCtx.strokeStyle = 'rgba(148, 163, 184, 0.18)';
            editorCtx.lineWidth = 1;
            for (let axis = 0; axis <= state.size; axis += 1) {
                const offset = axis * state.zoom + 0.5;
                editorCtx.beginPath();
                editorCtx.moveTo(offset, 0);
                editorCtx.lineTo(offset, canvasSize);
                editorCtx.stroke();
                editorCtx.beginPath();
                editorCtx.moveTo(0, offset);
                editorCtx.lineTo(canvasSize, offset);
                editorCtx.stroke();
            }
        }

        elements.canvasSizeValue.textContent = `${state.size} x ${state.size}`;
        elements.toolValue.textContent = text.toolNames[state.tool] || state.tool;
        elements.brushValue.textContent = `${state.brushSize}px`;
        elements.stage.classList.toggle('is-zooming', state.zoom < ZOOM_LEVELS[ZOOM_LEVELS.length - 1]);
        elements.stage.classList.toggle('is-zoom-tool', state.tool === 'zoom');
        renderNavigator();
    }

    function eventToPixel(event) {
        const rect = editorCanvas.getBoundingClientRect();
        const x = Math.floor(((event.clientX - rect.left) / rect.width) * state.size);
        const y = Math.floor(((event.clientY - rect.top) / rect.height) * state.size);
        if (x < 0 || y < 0 || x >= state.size || y >= state.size) return null;
        return { x, y };
    }

    function wheelEventToFocusPoint(event) {
        const rect = editorCanvas.getBoundingClientRect();
        const insideCanvas = event.clientX >= rect.left && event.clientX <= rect.right && event.clientY >= rect.top && event.clientY <= rect.bottom;
        if (!insideCanvas) {
            return getViewportCenterPixel();
        }

        const point = eventToPixel(event);
        if (!point) {
            return getViewportCenterPixel();
        }

        return {
            x: point.x + 0.5,
            y: point.y + 0.5
        };
    }

    function paintPoint(point) {
        if (!point) return;

        if (state.tool === 'picker') {
            samplePixel(point.x, point.y);
            return;
        }

        if (state.lastPoint) {
            drawLine(state.lastPoint, point);
        } else {
            drawPixel(point.x, point.y);
        }

        state.lastPoint = point;
        renderCanvas();
    }

    function bindCanvasPainting() {
        editorCanvas.addEventListener('contextmenu', (event) => {
            if (state.tool === 'zoom') {
                event.preventDefault();
            }
        });

        editorCanvas.addEventListener('pointerdown', (event) => {
            const point = eventToPixel(event);
            if (!point) return;

            if (state.tool === 'zoom') {
                event.preventDefault();
                stepZoom(event.button === 2 || event.shiftKey ? -1 : 1, { x: point.x + 0.5, y: point.y + 0.5 });
                return;
            }

            if (state.tool !== 'picker') {
                pushUndoSnapshot();
                if (state.tool === 'brush') {
                    rememberPaintedColor();
                }
            }

            state.painting = true;
            state.lastPoint = null;
            editorCanvas.setPointerCapture(event.pointerId);
            paintPoint(point);
        });

        editorCanvas.addEventListener('pointermove', (event) => {
            if (!state.painting) return;
            paintPoint(eventToPixel(event));
        });

        editorCanvas.addEventListener('dblclick', (event) => {
            const point = eventToPixel(event);
            if (!point) return;
            stepZoom(event.shiftKey ? -1 : 1, { x: point.x + 0.5, y: point.y + 0.5 });
        });

        const stopPaint = () => {
            state.painting = false;
            state.lastPoint = null;
        };

        editorCanvas.addEventListener('pointerup', stopPaint);
        editorCanvas.addEventListener('pointerleave', stopPaint);
        editorCanvas.addEventListener('pointercancel', stopPaint);
    }

    function setTool(tool) {
        state.tool = tool;
        document.querySelectorAll('[data-texture-tool]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.textureTool === tool);
        });
        renderCanvas();
    }

    function bindNavigator() {
        const updateFromNavigator = (event) => {
            const rect = elements.navigator.getBoundingClientRect();
            const x = clamp((event.clientX - rect.left) / rect.width, 0, 1) * state.size;
            const y = clamp((event.clientY - rect.top) / rect.height, 0, 1) * state.size;
            centerStageOnPixel(x, y);
        };

        elements.stage.addEventListener('scroll', renderNavigator);
        elements.navigator.addEventListener('pointerdown', (event) => {
            state.navigatorDragging = true;
            elements.navigator.setPointerCapture(event.pointerId);
            updateFromNavigator(event);
        });
        elements.navigator.addEventListener('pointermove', (event) => {
            if (!state.navigatorDragging) return;
            updateFromNavigator(event);
        });
        const stopDrag = () => {
            state.navigatorDragging = false;
        };
        elements.navigator.addEventListener('pointerup', stopDrag);
        elements.navigator.addEventListener('pointercancel', stopDrag);
        elements.navigator.addEventListener('pointerleave', stopDrag);
    }

    function bindWheelZoom() {
        elements.stage.addEventListener('wheel', (event) => {
            if (!event.deltaY) return;
            event.preventDefault();
            stepZoom(event.deltaY > 0 ? -1 : 1, wheelEventToFocusPoint(event));
        }, { passive: false });
    }

    function bindKeyboardShortcuts() {
        window.addEventListener('keydown', (event) => {
            if (!(event.ctrlKey || event.metaKey) || event.altKey) return;
            const active = document.activeElement;
            const tag = active ? active.tagName : '';
            const inputType = active && tag === 'INPUT' ? String(active.type || '').toLowerCase() : '';
            const isTypingField = tag === 'TEXTAREA'
                || active?.isContentEditable
                || (tag === 'INPUT' && ['text', 'search', 'email', 'url', 'tel', 'password', 'number'].includes(inputType));
            if (isTypingField) {
                return;
            }

            const key = String(event.key || '').toLowerCase();
            if (key === 'z') {
                event.preventDefault();
                if (event.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            } else if (key === 'y') {
                event.preventDefault();
                redo();
            }
        });
    }

    function bindControls() {
        document.querySelectorAll('[data-texture-tool]').forEach((button) => {
            button.addEventListener('click', () => setTool(button.dataset.textureTool));
        });

        elements.brushSize.addEventListener('change', () => {
            state.brushSize = clamp(Number(elements.brushSize.value || 1), 1, 8);
            renderCanvas();
        });

        elements.zoom.addEventListener('change', () => {
            setZoom(elements.zoom.value, getViewportCenterPixel());
        });

        elements.alpha.addEventListener('input', () => {
            elements.alphaValue.textContent = `${elements.alpha.value}%`;
        });
        elements.color.addEventListener('input', renderSimilarColors);
        elements.alpha.addEventListener('change', renderSimilarColors);

        elements.canvasSize.addEventListener('change', () => {
            const renameWithDefault = shouldAutoRenameTextureFile();
            pushUndoSnapshot();
            const nextSize = clamp(Number(elements.canvasSize.value || DEFAULT_SIZE), 8, 256);
            rebuildTextureCanvas(nextSize, true);
            state.size = nextSize;
            if (renameWithDefault) {
                syncTextureFileName(true);
            }
            setZoom(recommendedZoomForSize(nextSize), { x: nextSize / 2, y: nextSize / 2 });
            if (window.CubeAnalytics) {
                window.CubeAnalytics.track('texture_painter_resize', { texture_size: nextSize });
            }
        });

        elements.undoButton.addEventListener('click', (event) => {
            event.preventDefault();
            undo();
        });
        elements.undoQuickButton.addEventListener('click', (event) => {
            event.preventDefault();
            undo();
        });
        elements.redoButton.addEventListener('click', (event) => {
            event.preventDefault();
            redo();
        });
        elements.redoQuickButton.addEventListener('click', (event) => {
            event.preventDefault();
            redo();
        });
        elements.zoomOutButton.addEventListener('click', (event) => {
            event.preventDefault();
            stepZoom(-1, getViewportCenterPixel());
        });
        elements.zoomInButton.addEventListener('click', (event) => {
            event.preventDefault();
            stepZoom(1, getViewportCenterPixel());
        });
        elements.fitButton.addEventListener('click', (event) => {
            event.preventDefault();
            setZoom(recommendedZoomForSize(state.size), { x: state.size / 2, y: state.size / 2 });
        });
    }

    function bindFileControls() {
        elements.uploadButton.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', () => {
            const [file] = elements.fileInput.files || [];
            if (!file) return;

            if (elements.fileNameInput) {
                elements.fileNameInput.value = sanitizeFileBaseName(file.name, getTextureDefaultBaseName(state.size));
            }

            const reader = new FileReader();
            reader.onload = () => {
                const image = new Image();
                image.onload = () => {
                    pushUndoSnapshot();
                    textureCtx.clearRect(0, 0, state.size, state.size);
                    textureCtx.drawImage(image, 0, 0, image.width, image.height, 0, 0, state.size, state.size);
                    setExtractedPalette(extractPaletteFromSource(image));
                    renderCanvas();
                    centerStageOnPixel(state.size / 2, state.size / 2);
                    if (window.CubeAnalytics) {
                        window.CubeAnalytics.track('texture_painter_upload', {
                            source_width: image.width,
                            source_height: image.height,
                            target_size: state.size
                        });
                    }
                };
                image.src = String(reader.result || '');
            };
            reader.readAsDataURL(file);
        });

        if (elements.paletteUploadButton && elements.paletteFileInput) {
            elements.paletteUploadButton.addEventListener('click', () => elements.paletteFileInput.click());
            elements.paletteFileInput.addEventListener('change', () => {
                const [file] = elements.paletteFileInput.files || [];
                if (!file) return;

                const reader = new FileReader();
                reader.onload = () => {
                    const image = new Image();
                    image.onload = () => {
                        const palette = extractPaletteFromSource(image);
                        if (!palette.length) {
                            updateExtractedPaletteHint(paletteText.invalid);
                            return;
                        }

                        setExtractedPalette(palette);
                        if (window.CubeAnalytics) {
                            window.CubeAnalytics.track('texture_painter_palette_extract', {
                                palette_size: palette.length,
                                source_width: image.width,
                                source_height: image.height
                            });
                        }
                    };
                    image.onerror = () => updateExtractedPaletteHint(paletteText.invalid);
                    image.src = String(reader.result || '');
                };
                reader.readAsDataURL(file);
            });
        }

        elements.exportButton.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = textureCanvas.toDataURL('image/png');
            link.download = `${getTextureExportBaseName()}.png`;
            link.click();
            if (window.CubeAnalytics) {
                window.CubeAnalytics.track('texture_painter_export', { texture_size: state.size });
            }
        });

        elements.clearButton.addEventListener('click', () => {
            pushUndoSnapshot();
            textureCtx.clearRect(0, 0, state.size, state.size);
            renderCanvas();
        });

        elements.blockTemplateButton.addEventListener('click', () => {
            pushUndoSnapshot();
            rememberPaintedColor();
            applyBlockTemplate();
            if (window.CubeAnalytics) {
                window.CubeAnalytics.track('texture_painter_block_template', {
                    texture_size: state.size
                });
            }
        });

        elements.starterButton.addEventListener('click', () => {
            pushUndoSnapshot();
            textureCtx.clearRect(0, 0, state.size, state.size);
            textureCtx.fillStyle = '#8b5cf6';
            textureCtx.fillRect(0, 0, state.size, state.size);
            textureCtx.fillStyle = '#c4b5fd';
            textureCtx.fillRect(0, 0, state.size, Math.max(2, Math.floor(state.size / 6)));
            textureCtx.fillStyle = '#1e293b';
            textureCtx.fillRect(0, Math.floor(state.size / 2), state.size, Math.max(2, Math.floor(state.size / 4)));
            textureCtx.fillStyle = '#e2e8f0';
            textureCtx.fillRect(Math.floor(state.size / 4), Math.floor(state.size / 4), Math.floor(state.size / 2), Math.floor(state.size / 8));
            setExtractedPalette(extractPaletteFromSource(textureCanvas));
            renderCanvas();
        });
    }

    function initElements() {
        textureCanvas = document.createElement('canvas');
        textureCanvas.width = DEFAULT_SIZE;
        textureCanvas.height = DEFAULT_SIZE;
        textureCtx = textureCanvas.getContext('2d', { willReadFrequently: true });
        textureCtx.imageSmoothingEnabled = false;

        editorCanvas = document.getElementById('textureEditorCanvas');
        editorCtx = editorCanvas.getContext('2d');
        elements.stage = document.querySelector('.texture-stage');
        elements.navigator = document.getElementById('textureNavigatorCanvas');
        navigatorCtx = elements.navigator.getContext('2d');
        navigatorCtx.imageSmoothingEnabled = false;
        elements.canvasSize = document.getElementById('textureCanvasSize');
        elements.zoom = document.getElementById('textureZoom');
        elements.color = document.getElementById('textureColor');
        elements.alpha = document.getElementById('textureAlpha');
        elements.alphaValue = document.getElementById('textureAlphaValue');
        elements.brushSize = document.getElementById('textureBrushSize');
        elements.fileInput = document.getElementById('textureFileInput');
        ensureFileNameField();
        elements.fileNameInput = document.getElementById('textureFileNameInput');
        elements.uploadButton = document.getElementById('textureUploadButton');
        elements.exportButton = document.getElementById('textureExportButton');
        elements.blockTemplateButton = document.getElementById('textureBlockTemplateButton');
        elements.clearButton = document.getElementById('textureClearButton');
        elements.starterButton = document.getElementById('textureStarterButton');
        elements.recentColors = document.getElementById('textureRecentColors');
        elements.similarColors = document.getElementById('textureSimilarColors');
        ensurePaletteExtractor();
        elements.paletteUploadButton = document.getElementById('texturePaletteUploadButton');
        elements.paletteFileInput = document.getElementById('texturePaletteFileInput');
        elements.paletteHint = document.getElementById('texturePaletteHint');
        elements.extractedColors = document.getElementById('textureExtractedColors');
        elements.undoButton = document.getElementById('textureUndoButton');
        elements.undoQuickButton = document.getElementById('textureUndoQuickButton');
        elements.redoButton = document.getElementById('textureRedoButton');
        elements.redoQuickButton = document.getElementById('textureRedoQuickButton');
        elements.zoomOutButton = document.getElementById('textureZoomOutButton');
        elements.zoomInButton = document.getElementById('textureZoomInButton');
        elements.fitButton = document.getElementById('textureFitButton');
        elements.canvasSizeValue = document.getElementById('textureCanvasSizeValue');
        elements.toolValue = document.getElementById('textureToolValue');
        elements.brushValue = document.getElementById('textureBrushValue');
    }

    function init() {
        if (!document.querySelector('[data-texture-painter]')) return;
        initElements();
        bindCanvasPainting();
        bindControls();
        bindNavigator();
        bindWheelZoom();
        bindKeyboardShortcuts();
        bindFileControls();
        elements.alphaValue.textContent = `${elements.alpha.value}%`;
        elements.zoom.value = String(state.zoom);
        renderSimilarColors();
        updateExtractedPaletteHint(paletteText.empty);
        syncTextureFileName(true);
        setTool('brush');
        renderCanvas();
        centerStageOnPixel(state.size / 2, state.size / 2);
        updateHistoryButtons();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
