(function () {
    const SKIN_SIZE = 64;
    const DEFAULT_ZOOM = 8;
    const DEFAULT_PREVIEW_ZOOM = 1;
    const DEFAULT_ALPHA = 100;
    const HISTORY_LIMIT = 40;
    const PREVIEW_GRID_EDGE_INSET_RATIO = 0.08;
    const PREVIEW_GRID_VISIBILITY_EPSILON = 0.001;
    const UI_LANG = (document.documentElement.lang || 'en').toLowerCase();
    const UI_TEXT = {
        en: {
            tools: {
                brush: 'brush',
                eraser: 'eraser',
                picker: 'picker',
                orbit: 'orbit'
            },
            layers: {
                base: 'base',
                overlay: 'outer'
            },
            models: {
                wide: 'wide',
                slim: 'slim'
            },
            controls: {
                undo: 'Undo',
                redo: 'Redo',
                undoTitle: 'Undo (Ctrl+Z)',
                redoTitle: 'Redo (Ctrl+Y)',
                previewZoom: '3D zoom',
                pixelGrid: 'Pixel grid',
                largePreview: 'Large 3D view'
            }
        },
        ru: {
            tools: {
                brush: 'кисть',
                eraser: 'ластик',
                picker: 'пипетка',
                orbit: 'орбита'
            },
            layers: {
                base: 'база',
                overlay: 'верхний'
            },
            models: {
                wide: 'широкие',
                slim: 'тонкие'
            },
            controls: {
                undo: 'Отменить',
                redo: 'Повторить',
                undoTitle: 'Отменить (Ctrl+Z)',
                redoTitle: 'Повторить (Ctrl+Y)',
                previewZoom: 'Зум 3D',
                pixelGrid: 'Пиксельная сетка',
                largePreview: 'Большой 3D-вид'
            }
        },
        fr: {
            tools: {
                brush: 'pinceau',
                eraser: 'gomme',
                picker: 'pipette',
                orbit: 'orbite'
            },
            layers: {
                base: 'base',
                overlay: 'exterieur'
            },
            models: {
                wide: 'large',
                slim: 'mince'
            },
            controls: {
                undo: 'Annuler',
                redo: 'Rétablir',
                undoTitle: 'Annuler (Ctrl+Z)',
                redoTitle: 'Rétablir (Ctrl+Y)',
                previewZoom: 'Zoom 3D',
                pixelGrid: 'Grille de pixels',
                largePreview: 'Grande vue 3D'
            }
        },
        de: {
            tools: {
                brush: 'pinsel',
                eraser: 'radierer',
                picker: 'pipette',
                orbit: 'orbit'
            },
            layers: {
                base: 'basis',
                overlay: 'aussen'
            },
            models: {
                wide: 'breit',
                slim: 'schmal'
            },
            controls: {
                undo: 'Rückgängig',
                redo: 'Wiederholen',
                undoTitle: 'Rückgängig (Ctrl+Z)',
                redoTitle: 'Wiederholen (Ctrl+Y)',
                previewZoom: '3D-Zoom',
                pixelGrid: 'Pixelraster',
                largePreview: 'Große 3D-Ansicht'
            }
        }
    };

    const state = {
        tool: 'brush',
        paintLayer: 'base',
        modelType: 'wide',
        previewOrbiting: false,
        recentColors: [],
        hiddenParts: {
            head: false,
            body: false,
            rightArm: false,
            leftArm: false,
            rightLeg: false,
            leftLeg: false
        },
        brushSize: 1,
        zoom: DEFAULT_ZOOM,
        previewZoom: DEFAULT_PREVIEW_ZOOM,
        showPixelGrid: true,
        largePreview: false,
        editorPainting: false,
        previewPainting: false,
        undoStack: [],
        redoStack: [],
        lastEditorPoint: null,
        lastPreviewPoint: null,
        previewHoverCell: null,
        previewSyncQueued: false
    };

    const commonLayout = {
        head: {
            size: [8, 8, 8],
            base: {
                right: [0, 8, 8, 8],
                left: [16, 8, 8, 8],
                top: [8, 0, 8, 8],
                bottom: [16, 0, 8, 8],
                front: [8, 8, 8, 8],
                back: [24, 8, 8, 8]
            },
            overlay: {
                right: [32, 8, 8, 8],
                left: [48, 8, 8, 8],
                top: [40, 0, 8, 8],
                bottom: [48, 0, 8, 8],
                front: [40, 8, 8, 8],
                back: [56, 8, 8, 8]
            }
        },
        body: {
            size: [8, 12, 4],
            base: {
                right: [16, 20, 4, 12],
                left: [28, 20, 4, 12],
                top: [20, 16, 8, 4],
                bottom: [28, 16, 8, 4],
                front: [20, 20, 8, 12],
                back: [32, 20, 8, 12]
            },
            overlay: {
                right: [16, 36, 4, 12],
                left: [28, 36, 4, 12],
                top: [20, 32, 8, 4],
                bottom: [28, 32, 8, 4],
                front: [20, 36, 8, 12],
                back: [32, 36, 8, 12]
            }
        },
        rightLeg: {
            size: [4, 12, 4],
            base: {
                right: [0, 20, 4, 12],
                left: [8, 20, 4, 12],
                top: [4, 16, 4, 4],
                bottom: [8, 16, 4, 4],
                front: [4, 20, 4, 12],
                back: [12, 20, 4, 12]
            },
            overlay: {
                right: [0, 36, 4, 12],
                left: [8, 36, 4, 12],
                top: [4, 32, 4, 4],
                bottom: [8, 32, 4, 4],
                front: [4, 36, 4, 12],
                back: [12, 36, 4, 12]
            }
        },
        leftLeg: {
            size: [4, 12, 4],
            base: {
                right: [16, 52, 4, 12],
                left: [24, 52, 4, 12],
                top: [20, 48, 4, 4],
                bottom: [24, 48, 4, 4],
                front: [20, 52, 4, 12],
                back: [28, 52, 4, 12]
            },
            overlay: {
                right: [0, 52, 4, 12],
                left: [8, 52, 4, 12],
                top: [4, 48, 4, 4],
                bottom: [8, 48, 4, 4],
                front: [4, 52, 4, 12],
                back: [12, 52, 4, 12]
            }
        }
    };

    const armLayouts = {
        wide: {
            rightArm: {
                size: [4, 12, 4],
                base: {
                    right: [40, 20, 4, 12],
                    left: [48, 20, 4, 12],
                    top: [44, 16, 4, 4],
                    bottom: [48, 16, 4, 4],
                    front: [44, 20, 4, 12],
                    back: [52, 20, 4, 12]
                },
                overlay: {
                    right: [40, 36, 4, 12],
                    left: [48, 36, 4, 12],
                    top: [44, 32, 4, 4],
                    bottom: [48, 32, 4, 4],
                    front: [44, 36, 4, 12],
                    back: [52, 36, 4, 12]
                }
            },
            leftArm: {
                size: [4, 12, 4],
                base: {
                    right: [32, 52, 4, 12],
                    left: [40, 52, 4, 12],
                    top: [36, 48, 4, 4],
                    bottom: [40, 48, 4, 4],
                    front: [36, 52, 4, 12],
                    back: [44, 52, 4, 12]
                },
                overlay: {
                    right: [48, 52, 4, 12],
                    left: [56, 52, 4, 12],
                    top: [52, 48, 4, 4],
                    bottom: [56, 48, 4, 4],
                    front: [52, 52, 4, 12],
                    back: [60, 52, 4, 12]
                }
            }
        },
        slim: {
            rightArm: {
                size: [3, 12, 4],
                base: {
                    right: [40, 20, 4, 12],
                    left: [47, 20, 4, 12],
                    top: [44, 16, 3, 4],
                    bottom: [47, 16, 3, 4],
                    front: [44, 20, 3, 12],
                    back: [51, 20, 3, 12]
                },
                overlay: {
                    right: [40, 36, 4, 12],
                    left: [47, 36, 4, 12],
                    top: [44, 32, 3, 4],
                    bottom: [47, 32, 3, 4],
                    front: [44, 36, 3, 12],
                    back: [51, 36, 3, 12]
                }
            },
            leftArm: {
                size: [3, 12, 4],
                base: {
                    right: [32, 52, 4, 12],
                    left: [39, 52, 4, 12],
                    top: [36, 48, 3, 4],
                    bottom: [39, 48, 3, 4],
                    front: [36, 52, 3, 12],
                    back: [43, 52, 3, 12]
                },
                overlay: {
                    right: [48, 52, 4, 12],
                    left: [55, 52, 4, 12],
                    top: [52, 48, 3, 4],
                    bottom: [55, 48, 3, 4],
                    front: [52, 52, 3, 12],
                    back: [59, 52, 3, 12]
                }
            }
        }
    };

    const elements = {};
    let skinCanvas;
    let skinCtx;
    let editorCanvas;
    let editorCtx;
    let skinViewer;
    let previewRaycaster;
    let previewPointer;
    let previewVisibleMeshes = [];
    let previewHelperRoot;
    let previewHelperMeshes = [];
    let previewGridCtx;
    let previewResizeObserver;
    const previewPartNames = ['head', 'body', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'];
    const previewFaceNames = ['right', 'left', 'top', 'bottom', 'front', 'back'];

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function getLayoutForModel(modelType) {
        return {
            head: commonLayout.head,
            body: commonLayout.body,
            rightArm: armLayouts[modelType].rightArm,
            leftArm: armLayouts[modelType].leftArm,
            rightLeg: commonLayout.rightLeg,
            leftLeg: commonLayout.leftLeg
        };
    }

    function getPartPositionsForModel(modelType) {
        return {
            head: [0, 12, 0],
            body: [0, 2, 0],
            rightArm: [modelType === 'slim' ? -5.5 : -6, 2, 0],
            leftArm: [modelType === 'slim' ? 5.5 : 6, 2, 0],
            rightLeg: [-2, -10, 0],
            leftLeg: [2, -10, 0]
        };
    }

    function getOverlayGrow(partName) {
        return partName === 'head' ? 0.5 : 0.25;
    }

    function getSkinviewModelType() {
        return state.modelType === 'slim' ? 'slim' : 'default';
    }

    function createOffscreenSkinCanvas() {
        skinCanvas = document.createElement('canvas');
        skinCanvas.width = SKIN_SIZE;
        skinCanvas.height = SKIN_SIZE;
        skinCtx = skinCanvas.getContext('2d', { willReadFrequently: true });
        skinCtx.imageSmoothingEnabled = false;
    }

    function getColorRgba() {
        const hex = String(elements.color.value || '#ffffff').replace('#', '');
        const alpha = clamp(Number(elements.alpha.value || DEFAULT_ALPHA), 0, 100) / 100;
        const expanded = hex.length === 3 ? hex.split('').map((char) => char + char).join('') : hex;

        return {
            r: parseInt(expanded.slice(0, 2), 16),
            g: parseInt(expanded.slice(2, 4), 16),
            b: parseInt(expanded.slice(4, 6), 16),
            a: Math.round(alpha * 255)
        };
    }

    function getCurrentColorSnapshot() {
        return {
            hex: String(elements.color.value || '#ffffff'),
            alpha: clamp(Number(elements.alpha.value || DEFAULT_ALPHA), 0, 100)
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

    function mixHex(hex, targetHex, amount) {
        const from = hexToRgb(hex);
        const to = hexToRgb(targetHex);
        return rgbToHex(
            from.r + (to.r - from.r) * amount,
            from.g + (to.g - from.g) * amount,
            from.b + (to.b - from.b) * amount
        );
    }

    function renderColorButtons(container, snapshots) {
        if (!container) return;

        container.innerHTML = '';
        snapshots.forEach((snapshot) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'skin-recent-color';
            button.style.setProperty('--swatch', snapshot.hex);
            button.title = `${snapshot.hex.toUpperCase()} | ${snapshot.alpha}%`;
            button.setAttribute('aria-label', `Use color ${snapshot.hex.toUpperCase()} at ${snapshot.alpha}% opacity`);
            button.addEventListener('click', () => applyColorSnapshot(snapshot));
            container.appendChild(button);
        });
    }

    function renderRecentColors() {
        if (!elements.recentColors) return;
        renderColorButtons(elements.recentColors, state.recentColors);
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

    function createHistorySnapshot() {
        return {
            imageData: skinCtx.getImageData(0, 0, SKIN_SIZE, SKIN_SIZE)
        };
    }

    function pushUndoSnapshot() {
        state.undoStack.push(createHistorySnapshot());
        if (state.undoStack.length > HISTORY_LIMIT) {
            state.undoStack.shift();
        }
        state.redoStack = [];
        updateHistoryButtons();
    }

    function restoreHistorySnapshot(snapshot) {
        if (!snapshot || !snapshot.imageData) return;
        skinCtx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
        skinCtx.putImageData(snapshot.imageData, 0, 0);
        updateTexture();
    }

    function undo() {
        if (!state.undoStack.length) {
            updateHistoryButtons();
            return;
        }
        state.redoStack.push(createHistorySnapshot());
        restoreHistorySnapshot(state.undoStack.pop());
        updateHistoryButtons();
    }

    function redo() {
        if (!state.redoStack.length) {
            updateHistoryButtons();
            return;
        }
        state.undoStack.push(createHistorySnapshot());
        restoreHistorySnapshot(state.redoStack.pop());
        updateHistoryButtons();
    }

    function updateHistoryButtons() {
        if (elements.undo) {
            elements.undo.disabled = state.undoStack.length === 0;
        }
        if (elements.redo) {
            elements.redo.disabled = state.redoStack.length === 0;
        }
    }

    function updateStats() {
        const labels = UI_TEXT[UI_LANG] || UI_TEXT.en;
        elements.dimensions.textContent = `${SKIN_SIZE} x ${SKIN_SIZE}`;
        elements.mode.textContent = labels.tools[state.tool] || state.tool;
        elements.brush.textContent = `${state.brushSize}px`;
        if (elements.layerValue) {
            elements.layerValue.textContent = state.paintLayer === 'overlay'
                ? labels.layers.overlay
                : labels.layers.base;
        }
        if (elements.modelValue) {
            elements.modelValue.textContent = state.modelType === 'slim'
                ? labels.models.slim
                : labels.models.wide;
        }
    }

    function updateLayerButtons() {
        document.querySelectorAll('[data-skin-layer]').forEach((button) => {
            const isActive = button.dataset.skinLayer === state.paintLayer;
            button.classList.toggle('is-active', isActive);
            button.classList.toggle('resource-link-secondary', !isActive);
        });
        applyPreviewPartVisibility();
        updateStats();
    }

    function updateModelButtons() {
        document.querySelectorAll('[data-skin-model]').forEach((button) => {
            const isActive = button.dataset.skinModel === state.modelType;
            button.classList.toggle('is-active', isActive);
            button.classList.toggle('resource-link-secondary', !isActive);
        });
        updateStats();
    }

    function setActiveTool(tool) {
        state.tool = tool;

        if (skinViewer && skinViewer.controls) {
            skinViewer.controls.enabled = tool === 'orbit' || state.previewOrbiting;
        }

        document.querySelectorAll('[data-skin-tool]').forEach((button) => {
            const isActive = button.dataset.skinTool === tool;
            button.classList.toggle('is-active', isActive);
            button.classList.toggle('resource-link-secondary', !isActive);
        });

        updateStats();
    }

    function createToolField(id, label, controlHtml) {
        const field = document.createElement('div');
        field.className = 'tool-field';
        field.innerHTML = `<label for="${id}">${label}</label>${controlHtml}`;
        return field;
    }

    function createToolCheck(id, label, checked) {
        const wrapper = document.createElement('label');
        wrapper.className = 'tool-check';
        wrapper.innerHTML = `<input id="${id}" type="checkbox"${checked ? ' checked' : ''}><span>${label}</span>`;
        return wrapper;
    }

    function ensureEnhancementControls() {
        const labels = (UI_TEXT[UI_LANG] || UI_TEXT.en).controls || UI_TEXT.en.controls;

        if (!document.getElementById('skinUndoButton')) {
            const toolGrid = document.querySelector('[data-skin-tool="brush"]') ? document.querySelector('[data-skin-tool="brush"]').closest('.skin-tool-grid') : null;
            if (toolGrid) {
                const undoButton = document.createElement('button');
                undoButton.className = 'resource-link resource-link-secondary skin-tool-button';
                undoButton.id = 'skinUndoButton';
                undoButton.type = 'button';
                undoButton.textContent = labels.undo;
                undoButton.title = labels.undoTitle;

                const redoButton = document.createElement('button');
                redoButton.className = 'resource-link resource-link-secondary skin-tool-button';
                redoButton.id = 'skinRedoButton';
                redoButton.type = 'button';
                redoButton.textContent = labels.redo;
                redoButton.title = labels.redoTitle;

                toolGrid.appendChild(undoButton);
                toolGrid.appendChild(redoButton);
            }
        }

        if (!document.getElementById('skinPreviewZoom')) {
            const atlasZoomField = document.getElementById('skinZoom') ? document.getElementById('skinZoom').closest('.tool-field') : null;
            const previewZoomField = createToolField(
                'skinPreviewZoom',
                labels.previewZoom,
                '<input id="skinPreviewZoom" type="range" min="60" max="200" step="5" value="100"><span class="row-toolbar-label" id="skinPreviewZoomValue">100%</span>'
            );
            if (atlasZoomField) {
                atlasZoomField.insertAdjacentElement('afterend', previewZoomField);
            }
        }

        const checkGrid = document.querySelector('.tool-check-grid');
        if (checkGrid && !document.getElementById('skinPixelGrid')) {
            checkGrid.appendChild(createToolCheck('skinPixelGrid', labels.pixelGrid, true));
        }
        if (checkGrid && !document.getElementById('skinLargePreview')) {
            checkGrid.appendChild(createToolCheck('skinLargePreview', labels.largePreview, false));
        }
    }

    function renderAtlas() {
        const size = state.zoom;
        const canvasSize = SKIN_SIZE * size;

        if (editorCanvas.width !== canvasSize || editorCanvas.height !== canvasSize) {
            editorCanvas.width = canvasSize;
            editorCanvas.height = canvasSize;
        }

        editorCtx.imageSmoothingEnabled = false;
        editorCtx.clearRect(0, 0, canvasSize, canvasSize);

        for (let y = 0; y < SKIN_SIZE; y += 1) {
            for (let x = 0; x < SKIN_SIZE; x += 1) {
                editorCtx.fillStyle = (x + y) % 2 === 0 ? 'rgba(15, 23, 42, 0.88)' : 'rgba(30, 41, 59, 0.88)';
                editorCtx.fillRect(x * size, y * size, size, size);
            }
        }

        editorCtx.drawImage(skinCanvas, 0, 0, canvasSize, canvasSize);

        if (state.showPixelGrid && size >= 4) {
            editorCtx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
            editorCtx.lineWidth = 1;

            for (let axis = 0; axis <= SKIN_SIZE; axis += 1) {
                const offset = axis * size + 0.5;
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
    }

    function fillRegion(rect, color) {
        if (!Array.isArray(rect)) return;
        skinCtx.fillStyle = color;
        skinCtx.fillRect(rect[0], rect[1], rect[2], rect[3]);
    }

    function fillPartLayer(partDefinition, layerName, palette) {
        const faces = partDefinition[layerName];
        if (!faces) return;

        fillRegion(faces.front, palette.front || palette.side || palette.main);
        fillRegion(faces.back, palette.back || palette.side || palette.main);
        fillRegion(faces.right, palette.right || palette.side || palette.main);
        fillRegion(faces.left, palette.left || palette.side || palette.main);
        fillRegion(faces.top, palette.top || palette.main);
        fillRegion(faces.bottom, palette.bottom || palette.main);
    }

    function syncPreviewSkin() {
        if (!skinViewer) return;

        skinViewer.loadSkin(skinCanvas, {
            model: getSkinviewModelType()
        });
        skinViewer.playerObject.skin.modelType = getSkinviewModelType();
        normalizePreviewModelGeometry();
        skinViewer.playerObject.skin.setOuterLayerVisible(Boolean(elements.overlay.checked));
        refreshVisiblePreviewMeshes();
        syncHelperModelTransform();
        applyPreviewPartVisibility();
        skinViewer.render();
    }

    function queuePreviewSync() {
        if (!skinViewer || state.previewSyncQueued) return;

        state.previewSyncQueued = true;
        window.requestAnimationFrame(() => {
            state.previewSyncQueued = false;
            syncPreviewSkin();
        });
    }

    function updateTexture() {
        renderAtlas();
        updateStats();
        queuePreviewSync();
    }

    function drawRectPixel(x, y) {
        const half = Math.floor((state.brushSize - 1) / 2);
        const color = getColorRgba();
        const startX = clamp(x - half, 0, SKIN_SIZE - state.brushSize);
        const startY = clamp(y - half, 0, SKIN_SIZE - state.brushSize);

        if (state.tool === 'eraser') {
            skinCtx.clearRect(startX, startY, state.brushSize, state.brushSize);
            return;
        }

        skinCtx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})`;
        skinCtx.fillRect(startX, startY, state.brushSize, state.brushSize);
    }

    function samplePixel(x, y) {
        const pixel = skinCtx.getImageData(clamp(x, 0, SKIN_SIZE - 1), clamp(y, 0, SKIN_SIZE - 1), 1, 1).data;
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
            drawRectPixel(x0, y0);
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

    function paintPoint(point, lastPointKey) {
        if (!point) return;

        if (state.tool === 'picker') {
            samplePixel(point.x, point.y);
            return;
        }

        const previous = state[lastPointKey];
        if (previous && previous.paintKey === point.paintKey) {
            drawLine(previous, point);
        } else {
            drawRectPixel(point.x, point.y);
        }

        state[lastPointKey] = point;
        updateTexture();
    }

    function editorEventToPixel(event) {
        const rect = editorCanvas.getBoundingClientRect();
        const scaleX = editorCanvas.width / rect.width;
        const scaleY = editorCanvas.height / rect.height;
        const x = Math.floor(((event.clientX - rect.left) * scaleX) / state.zoom);
        const y = Math.floor(((event.clientY - rect.top) * scaleY) / state.zoom);

        if (x < 0 || y < 0 || x >= SKIN_SIZE || y >= SKIN_SIZE) return null;
        return { x, y, paintKey: 'atlas' };
    }

    function bindEditorPainting() {
        editorCanvas.addEventListener('pointerdown', (event) => {
            const point = editorEventToPixel(event);
            if (!point) return;

            if (state.tool !== 'picker' && state.tool !== 'orbit') {
                pushUndoSnapshot();
                if (state.tool === 'brush') {
                    rememberPaintedColor();
                }
            }

            state.editorPainting = true;
            state.lastEditorPoint = null;
            editorCanvas.setPointerCapture(event.pointerId);
            paintPoint(point, 'lastEditorPoint');
        });

        editorCanvas.addEventListener('pointermove', (event) => {
            if (!state.editorPainting) return;
            const point = editorEventToPixel(event);
            if (!point) return;
            paintPoint(point, 'lastEditorPoint');
        });

        const stopEditorPaint = () => {
            state.editorPainting = false;
            state.lastEditorPoint = null;
        };

        editorCanvas.addEventListener('pointerup', stopEditorPaint);
        editorCanvas.addEventListener('pointerleave', stopEditorPaint);
        editorCanvas.addEventListener('pointercancel', stopEditorPaint);
    }

    function createHelperFace(partName, layerName, faceName, rect, width, height, position, rotation) {
        const geometry = new THREE.PlaneGeometry(width, height);
        const material = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0,
            side: THREE.FrontSide,
            depthWrite: false
        });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(position[0], position[1], position[2]);
        mesh.rotation.set(rotation[0], rotation[1], rotation[2]);
        mesh.userData = {
            partName,
            layerName,
            faceName,
            rect,
            flipX: faceName === 'bottom',
            flipY: false
        };
        previewHelperMeshes.push(mesh);
        return mesh;
    }

    function createHelperPart(partName, definition, layerName, grow) {
        const group = new THREE.Group();
        const width = definition.size[0] + grow * 2;
        const height = definition.size[1] + grow * 2;
        const depth = definition.size[2] + grow * 2;
        const faces = definition[layerName];

        group.add(createHelperFace(partName, layerName, 'front', faces.front, width, height, [0, 0, depth / 2], [0, 0, 0]));
        group.add(createHelperFace(partName, layerName, 'back', faces.back, width, height, [0, 0, -depth / 2], [0, Math.PI, 0]));
        group.add(createHelperFace(partName, layerName, 'right', faces.right, depth, height, [-width / 2, 0, 0], [0, -Math.PI / 2, 0]));
        group.add(createHelperFace(partName, layerName, 'left', faces.left, depth, height, [width / 2, 0, 0], [0, Math.PI / 2, 0]));
        group.add(createHelperFace(partName, layerName, 'top', faces.top, width, depth, [0, height / 2, 0], [-Math.PI / 2, 0, 0]));
        group.add(createHelperFace(partName, layerName, 'bottom', faces.bottom, width, depth, [0, -height / 2, 0], [Math.PI / 2, 0, 0]));

        return group;
    }

    function normalizePreviewModelGeometry() {
        if (!skinViewer || !skinViewer.playerObject || !skinViewer.playerObject.skin) return;

        const skin = skinViewer.playerObject.skin;
        if (skin.rightLeg) {
            skin.rightLeg.position.x = -2;
            skin.rightLeg.position.z = 0;
        }
        if (skin.leftLeg) {
            skin.leftLeg.position.x = 2;
            skin.leftLeg.position.z = 0;
        }
        skin.updateMatrixWorld(true);
        skinViewer.playerObject.updateMatrixWorld(true);
    }

    function disposePreviewHelperRoot() {
        if (!previewHelperRoot) return;

        if (previewHelperRoot.parent) {
            previewHelperRoot.parent.remove(previewHelperRoot);
        }

        previewHelperRoot.traverse((node) => {
            if (node.geometry) node.geometry.dispose();
            if (node.material) node.material.dispose();
        });

        previewHelperRoot = null;
        previewHelperMeshes = [];
    }

    function buildPreviewHelperModel() {
        const layout = getLayoutForModel(state.modelType);
        const positions = getPartPositionsForModel(state.modelType);
        disposePreviewHelperRoot();

        previewHelperRoot = new THREE.Group();

        ['head', 'body', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'].forEach((partName) => {
            const partRoot = new THREE.Group();
            partRoot.add(createHelperPart(partName, layout[partName], 'base', 0));
            partRoot.add(createHelperPart(partName, layout[partName], 'overlay', getOverlayGrow(partName)));
            partRoot.position.set(positions[partName][0], positions[partName][1], positions[partName][2]);
            previewHelperRoot.add(partRoot);
        });

        syncHelperModelTransform();
        applyPreviewPartVisibility();
    }

    function syncHelperModelTransform() {
        if (!previewHelperRoot) return;

        if (skinViewer && skinViewer.playerObject) {
            previewHelperRoot.position.copy(skinViewer.playerObject.position);
            previewHelperRoot.quaternion.copy(skinViewer.playerObject.quaternion);
            previewHelperRoot.scale.copy(skinViewer.playerObject.scale);
        }

        previewHelperRoot.updateMatrixWorld(true);
    }

    function updateHelperOverlayVisibility() {
        applyPreviewPartVisibility();
    }

    function applyPreviewPartVisibility() {
        const showOverlay = Boolean(elements.overlay.checked);
        previewHelperMeshes.forEach((mesh) => {
            const hidden = Boolean(state.hiddenParts[mesh.userData.partName]);
            mesh.visible = mesh.userData.layerName === 'overlay' ? showOverlay && !hidden : !hidden;
        });

        if (!skinViewer || !skinViewer.playerObject || !skinViewer.playerObject.skin) return;

        previewPartNames.forEach((partName) => {
            const part = skinViewer.playerObject.skin[partName];
            if (!part) return;

            const hidden = Boolean(state.hiddenParts[partName]);
            if (part.innerLayer) {
                part.innerLayer.visible = !hidden;
            }
            if (part.outerLayer) {
                part.outerLayer.visible = showOverlay && !hidden;
            }
        });

        if (skinViewer) {
            skinViewer.render();
        }
        drawPreviewPixelGrid();
    }

    function refreshVisiblePreviewMeshes() {
        previewVisibleMeshes = [];
        if (!skinViewer || !skinViewer.playerObject || !skinViewer.playerObject.skin) return;

        const collectLayerMeshes = (root, partName, layerName) => {
            if (!root || !root.traverse) return;
            root.traverse((node) => {
                if (!node.isMesh) return;
                node.userData.skinPaintPart = partName;
                node.userData.skinPaintLayer = layerName;
                previewVisibleMeshes.push(node);
            });
        };

        previewPartNames.forEach((partName) => {
            const part = skinViewer.playerObject.skin[partName];
            if (!part) return;

            collectLayerMeshes(part.innerLayer, partName, 'base');
            collectLayerMeshes(part.outerLayer, partName, 'overlay');
        });
    }

    function updatePreviewZoomValue() {
        if (elements.previewZoomValue) {
            elements.previewZoomValue.textContent = `${Math.round(state.previewZoom * 100)}%`;
        }
        if (elements.previewZoom) {
            elements.previewZoom.value = String(Math.round(state.previewZoom * 100));
            updateRangeProgress(elements.previewZoom);
        }
    }

    function updateRangeProgress(input) {
        if (!input) return;

        const min = Number(input.min || 0);
        const max = Number(input.max || 100);
        const value = Number(input.value || min);
        const progress = max > min ? ((value - min) / (max - min)) * 100 : 0;

        input.style.setProperty('--range-progress', `${clamp(progress, 0, 100)}%`);

        const field = input.closest('.tool-field');
        if (field) {
            field.classList.add('skin-range-field');
        }
    }

    function syncRangeControls() {
        document.querySelectorAll('[data-skin-editor] input[type="range"]').forEach(updateRangeProgress);
    }

    function resizePreviewGridOverlay() {
        if (!elements.previewGridOverlay || !elements.preview) return null;

        const rect = elements.preview.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        const targetWidth = Math.floor(width * ratio);
        const targetHeight = Math.floor(height * ratio);

        if (elements.previewGridOverlay.width !== targetWidth || elements.previewGridOverlay.height !== targetHeight) {
            elements.previewGridOverlay.width = targetWidth;
            elements.previewGridOverlay.height = targetHeight;
        }

        previewGridCtx = previewGridCtx || elements.previewGridOverlay.getContext('2d');
        previewGridCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
        return { width, height };
    }

    function drawProjectedLine(ctx, from, to) {
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.5)';
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.34)';
        ctx.stroke();
    }

    function drawProjectedPolygon(ctx, points) {
        if (points.some((point) => !point)) return;

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.closePath();
        ctx.fillStyle = 'rgba(96, 165, 250, 0.24)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.82)';
        ctx.stroke();
    }

    function projectPreviewPoint(mesh, localX, localY, viewport) {
        const point = new THREE.Vector3(localX, localY, 0).applyMatrix4(mesh.matrixWorld).project(skinViewer.camera);
        if (point.z < -1 || point.z > 1) return null;

        return {
            x: (point.x + 1) * 0.5 * viewport.width,
            y: (1 - point.y) * 0.5 * viewport.height
        };
    }

    function isPreviewFaceTowardCamera(mesh, cameraPosition) {
        const center = mesh.getWorldPosition(new THREE.Vector3());
        const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(mesh.getWorldQuaternion(new THREE.Quaternion())).normalize();
        return normal.dot(cameraPosition.clone().sub(center).normalize()) > 0.02;
    }

    function isNearestPreviewFace(mesh, candidates, viewport) {
        const width = mesh.geometry && mesh.geometry.parameters ? mesh.geometry.parameters.width : 1;
        const height = mesh.geometry && mesh.geometry.parameters ? mesh.geometry.parameters.height : 1;
        const samples = [];

        for (let yStep = 0; yStep <= 4; yStep += 1) {
            for (let xStep = 0; xStep <= 4; xStep += 1) {
                samples.push([
                    -width * 0.48 + (width * 0.96 * xStep) / 4,
                    -height * 0.48 + (height * 0.96 * yStep) / 4
                ]);
            }
        }

        return samples.some(([x, y]) => {
            const point = new THREE.Vector3(x, y, 0).applyMatrix4(mesh.matrixWorld).project(skinViewer.camera);
            if (point.z < -1 || point.z > 1) return false;
            if (point.x < -1.05 || point.x > 1.05 || point.y < -1.05 || point.y > 1.05) return false;

            previewRaycaster.setFromCamera(new THREE.Vector2(point.x, point.y), skinViewer.camera);
            const hits = previewRaycaster.intersectObjects(candidates, false);
            return Boolean(hits.length && hits[0].object === mesh);
        });
    }

    function projectWorldPoint(point, viewport) {
        const projected = point.clone().project(skinViewer.camera);
        if (projected.z < -1 || projected.z > 1) return null;

        const screenX = (projected.x + 1) * 0.5 * viewport.width;
        const screenY = (1 - projected.y) * 0.5 * viewport.height;

        return {
            ndc: projected,
            screen: {
                x: Math.round(screenX * 2) / 2,
                y: Math.round(screenY * 2) / 2
            }
        };
    }

    function getPreviewFaceData(mesh, sideIndex) {
        const geometry = mesh && mesh.geometry;
        const position = geometry && geometry.attributes ? geometry.attributes.position : null;
        const uv = geometry && geometry.attributes ? geometry.attributes.uv : null;
        const normal = geometry && geometry.attributes ? geometry.attributes.normal : null;
        const start = sideIndex * 4;

        if (!position || !uv || start + 3 >= position.count) return null;

        const points = [];
        const uvs = [];
        for (let index = 0; index < 4; index += 1) {
            const vertexIndex = start + index;
            points.push(new THREE.Vector3().fromBufferAttribute(position, vertexIndex));
            uvs.push(new THREE.Vector2().fromBufferAttribute(uv, vertexIndex));
        }

        const minU = Math.min(...uvs.map((point) => point.x));
        const maxU = Math.max(...uvs.map((point) => point.x));
        const minV = Math.min(...uvs.map((point) => point.y));
        const maxV = Math.max(...uvs.map((point) => point.y));
        if (maxU - minU <= 0 || maxV - minV <= 0) return null;

        const findCorner = (targetU, targetV) => {
            let bestIndex = 0;
            let bestDistance = Number.POSITIVE_INFINITY;
            uvs.forEach((point, index) => {
                const distance = Math.abs(point.x - targetU) + Math.abs(point.y - targetV);
                if (distance < bestDistance) {
                    bestDistance = distance;
                    bestIndex = index;
                }
            });
            return points[bestIndex];
        };

        const localNormal = normal && start < normal.count
            ? new THREE.Vector3().fromBufferAttribute(normal, start).normalize()
            : new THREE.Vector3(0, 0, 1);

        return {
            mesh,
            sideIndex,
            minU,
            maxU,
            minV,
            maxV,
            p00: findCorner(minU, minV),
            p10: findCorner(maxU, minV),
            p11: findCorner(maxU, maxV),
            p01: findCorner(minU, maxV),
            normal: localNormal.transformDirection(mesh.matrixWorld).normalize()
        };
    }

    function faceUvToWorld(face, u, v) {
        const t = (u - face.minU) / (face.maxU - face.minU);
        const s = (v - face.minV) / (face.maxV - face.minV);
        const bottom = face.p00.clone().lerp(face.p10, t);
        const top = face.p01.clone().lerp(face.p11, t);
        return bottom.lerp(top, s).applyMatrix4(face.mesh.matrixWorld);
    }

    function isFaceTowardCamera(face, cameraPosition) {
        const center = faceUvToWorld(face, (face.minU + face.maxU) / 2, (face.minV + face.maxV) / 2);
        return face.normal.dot(cameraPosition.clone().sub(center).normalize()) > 0.16;
    }

    function isFaceNearestAtPoint(face, u, v, targetMeshes) {
        const safeU = clamp(u, face.minU + PREVIEW_GRID_VISIBILITY_EPSILON, face.maxU - PREVIEW_GRID_VISIBILITY_EPSILON);
        const safeV = clamp(v, face.minV + PREVIEW_GRID_VISIBILITY_EPSILON, face.maxV - PREVIEW_GRID_VISIBILITY_EPSILON);
        const viewportPoint = faceUvToWorld(face, safeU, safeV).project(skinViewer.camera);
        if (viewportPoint.z < -1 || viewportPoint.z > 1) return false;
        if (viewportPoint.x < -1.05 || viewportPoint.x > 1.05 || viewportPoint.y < -1.05 || viewportPoint.y > 1.05) return false;

        previewRaycaster.setFromCamera(new THREE.Vector2(viewportPoint.x, viewportPoint.y), skinViewer.camera);
        const hits = previewRaycaster.intersectObjects(targetMeshes, false);
        return Boolean(hits.length && hits[0].object === face.mesh && Math.floor(hits[0].faceIndex / 2) === face.sideIndex);
    }

    function isPreviewFaceVisible(face, targetMeshes) {
        const samples = [
            [0.5, 0.5],
            [0.18, 0.18],
            [0.82, 0.18],
            [0.82, 0.82],
            [0.18, 0.82],
            [0.5, 0.18],
            [0.82, 0.5],
            [0.5, 0.82],
            [0.18, 0.5]
        ];

        return samples.some(([uPart, vPart]) => (
            isFaceNearestAtPoint(
                face,
                face.minU + (face.maxU - face.minU) * uPart,
                face.minV + (face.maxV - face.minV) * vPart,
                targetMeshes
            )
        ));
    }

    function drawScreenLine(ctx, from, to) {
        if (!from || !to) return;

        ctx.beginPath();
        ctx.moveTo(from.screen.x, from.screen.y);
        ctx.lineTo(to.screen.x, to.screen.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(2, 6, 23, 0.62)';
        ctx.stroke();
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(226, 232, 240, 0.52)';
        ctx.stroke();
    }

    function getFaceGridInset(face, columns, rows) {
        return {
            u: ((face.maxU - face.minU) / columns) * PREVIEW_GRID_EDGE_INSET_RATIO,
            v: ((face.maxV - face.minV) / rows) * PREVIEW_GRID_EDGE_INSET_RATIO
        };
    }

    function drawFaceGrid(ctx, face, viewport, targetMeshes) {
        const columns = Math.max(1, Math.round((face.maxU - face.minU) * SKIN_SIZE));
        const rows = Math.max(1, Math.round((face.maxV - face.minV) * SKIN_SIZE));
        const inset = getFaceGridInset(face, columns, rows);
        const minDrawU = face.minU + inset.u;
        const maxDrawU = face.maxU - inset.u;
        const minDrawV = face.minV + inset.v;
        const maxDrawV = face.maxV - inset.v;

        for (let column = 1; column < columns; column += 1) {
            const u = face.minU + (face.maxU - face.minU) * (column / columns);
            for (let row = 0; row < rows; row += 1) {
                const v0 = clamp(face.minV + (face.maxV - face.minV) * (row / rows), minDrawV, maxDrawV);
                const v1 = clamp(face.minV + (face.maxV - face.minV) * ((row + 1) / rows), minDrawV, maxDrawV);
                if (v1 <= v0) continue;
                if (!isFaceNearestAtPoint(face, u, (v0 + v1) / 2, targetMeshes)) continue;
                drawScreenLine(
                    ctx,
                    projectWorldPoint(faceUvToWorld(face, u, v0), viewport),
                    projectWorldPoint(faceUvToWorld(face, u, v1), viewport)
                );
            }
        }

        for (let row = 1; row < rows; row += 1) {
            const v = face.minV + (face.maxV - face.minV) * (row / rows);
            for (let column = 0; column < columns; column += 1) {
                const u0 = clamp(face.minU + (face.maxU - face.minU) * (column / columns), minDrawU, maxDrawU);
                const u1 = clamp(face.minU + (face.maxU - face.minU) * ((column + 1) / columns), minDrawU, maxDrawU);
                if (u1 <= u0) continue;
                if (!isFaceNearestAtPoint(face, (u0 + u1) / 2, v, targetMeshes)) continue;
                drawScreenLine(
                    ctx,
                    projectWorldPoint(faceUvToWorld(face, u0, v), viewport),
                    projectWorldPoint(faceUvToWorld(face, u1, v), viewport)
                );
            }
        }
    }

    function drawPreviewHoverCell(ctx, face, viewport) {
        const hover = state.previewHoverCell;
        if (!hover || hover.object !== face.mesh || hover.sideIndex !== face.sideIndex || !hover.pixel) return;

        const columns = Math.max(1, Math.round((face.maxU - face.minU) * SKIN_SIZE));
        const rows = Math.max(1, Math.round((face.maxV - face.minV) * SKIN_SIZE));
        const inset = getFaceGridInset(face, columns, rows);
        const u0 = clamp(hover.pixel.x / SKIN_SIZE, face.minU + inset.u, face.maxU - inset.u);
        const u1 = clamp((hover.pixel.x + 1) / SKIN_SIZE, face.minU + inset.u, face.maxU - inset.u);
        const v0 = clamp(1 - (hover.pixel.y + 1) / SKIN_SIZE, face.minV + inset.v, face.maxV - inset.v);
        const v1 = clamp(1 - hover.pixel.y / SKIN_SIZE, face.minV + inset.v, face.maxV - inset.v);
        if (u1 <= u0 || v1 <= v0) return;

        const points = [
            projectWorldPoint(faceUvToWorld(face, u0, v1), viewport),
            projectWorldPoint(faceUvToWorld(face, u1, v1), viewport),
            projectWorldPoint(faceUvToWorld(face, u1, v0), viewport),
            projectWorldPoint(faceUvToWorld(face, u0, v0), viewport)
        ];

        if (points.some((point) => !point)) return;

        ctx.beginPath();
        ctx.moveTo(points[0].screen.x, points[0].screen.y);
        points.slice(1).forEach((point) => ctx.lineTo(point.screen.x, point.screen.y));
        ctx.closePath();
        ctx.fillStyle = 'rgba(96, 165, 250, 0.32)';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.stroke();
    }

    function drawPreviewPixelGrid() {
        if (!elements.previewGridOverlay || !previewGridCtx) return;

        const viewport = resizePreviewGridOverlay();
        if (!viewport) return;

        previewGridCtx.clearRect(0, 0, viewport.width, viewport.height);

        if (!state.showPixelGrid || !skinViewer || !skinViewer.camera || !previewVisibleMeshes.length) {
            return;
        }

        skinViewer.camera.updateMatrixWorld(true);
        const gridLayer = state.paintLayer === 'overlay' ? 'overlay' : 'base';
        const cameraPosition = skinViewer.camera.getWorldPosition(new THREE.Vector3());
        const targetMeshes = previewVisibleMeshes.filter((mesh) => (
            mesh.userData.skinPaintLayer === gridLayer &&
            isPreviewObjectVisible(mesh) &&
            !state.hiddenParts[mesh.userData.skinPaintPart]
        ));

        targetMeshes.forEach((mesh) => {
            mesh.updateMatrixWorld(true);
            for (let sideIndex = 0; sideIndex < previewFaceNames.length; sideIndex += 1) {
                const face = getPreviewFaceData(mesh, sideIndex);
                if (!face) continue;
                if (!isFaceTowardCamera(face, cameraPosition)) continue;
                if (!isPreviewFaceVisible(face, targetMeshes)) continue;

                drawFaceGrid(previewGridCtx, face, viewport, targetMeshes);
                drawPreviewHoverCell(previewGridCtx, face, viewport);
            }
        });
    }

    function applyPreviewZoom() {
        if (skinViewer && skinViewer.camera) {
            skinViewer.camera.zoom = state.previewZoom;
            skinViewer.camera.updateProjectionMatrix();
            skinViewer.render();
        }
        updatePreviewZoomValue();
        drawPreviewPixelGrid();
    }

    function setPreviewZoom(nextZoom) {
        state.previewZoom = clamp(Number(nextZoom) || DEFAULT_PREVIEW_ZOOM, 0.6, 2);
        applyPreviewZoom();
    }

    function applyPreviewSize() {
        if (elements.previewCard) {
            elements.previewCard.classList.toggle('is-large-preview', state.largePreview);
        }
        window.requestAnimationFrame(onResize);
    }

    function setPreviewHomeView() {
        if (!skinViewer || !skinViewer.camera || !skinViewer.controls) return;

        skinViewer.playerObject.position.set(0, 0, 0);
        skinViewer.playerObject.rotation.set(0, 0, 0);
        skinViewer.camera.position.set(0, 2, 40);
        skinViewer.controls.target.set(0, 2, 0);
        skinViewer.controls.update();
        applyPreviewZoom();
        syncHelperModelTransform();
    }

    function initPreview() {
        const canvas = document.createElement('canvas');
        canvas.className = 'skin-viewer-canvas';
        const gridOverlay = document.createElement('canvas');
        gridOverlay.className = 'skin-grid-overlay';
        elements.preview.innerHTML = '';
        elements.preview.appendChild(canvas);
        elements.preview.appendChild(gridOverlay);
        elements.previewGridOverlay = gridOverlay;
        previewGridCtx = gridOverlay.getContext('2d');

        skinViewer = new skinview3d.SkinViewer({
            canvas,
            width: Math.max(300, elements.preview.clientWidth),
            height: Math.max(320, elements.preview.clientHeight),
            skin: skinCanvas,
            model: getSkinviewModelType(),
            enableControls: true,
            zoom: 1,
            fov: 45,
            background: 0x11182f
        });

        skinViewer.animation = null;
        skinViewer.autoRotate = false;
        skinViewer.controls.enablePan = false;
        skinViewer.controls.enableZoom = false;
        skinViewer.controls.enableDamping = true;
        skinViewer.controls.rotateSpeed = 0.8;
        skinViewer.controls.mouseButtons.LEFT = THREE.MOUSE.ROTATE;
        skinViewer.controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
        skinViewer.controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        if (skinViewer.controls.addEventListener) {
            skinViewer.controls.addEventListener('change', () => {
                drawPreviewPixelGrid();
            });
        }
        setPreviewHomeView();
        normalizePreviewModelGeometry();
        skinViewer.playerObject.skin.setOuterLayerVisible(Boolean(elements.overlay.checked));

        previewRaycaster = new THREE.Raycaster();
        previewPointer = new THREE.Vector2();

        refreshVisiblePreviewMeshes();
        buildPreviewHelperModel();
        bindPreviewPainting();
        if (window.ResizeObserver) {
            if (previewResizeObserver) previewResizeObserver.disconnect();
            previewResizeObserver = new ResizeObserver(onResize);
            previewResizeObserver.observe(elements.preview);
        }
        onResize();
        syncPreviewSkin();
    }

    function previewEventToIntersection(event) {
        if (!skinViewer || !previewRaycaster || !previewPointer) return null;

        const rect = skinViewer.canvas.getBoundingClientRect();
        previewPointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        previewPointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        skinViewer.camera.updateMatrixWorld(true);
        previewRaycaster.setFromCamera(previewPointer, skinViewer.camera);

        const targetLayer = state.paintLayer === 'overlay' ? 'overlay' : 'base';
        const targetMeshes = previewVisibleMeshes.filter((mesh) => (
            mesh.userData.skinPaintLayer === targetLayer &&
            isPreviewObjectVisible(mesh) &&
            !state.hiddenParts[mesh.userData.skinPaintPart]
        ));
        if (!targetMeshes.length) return null;

        const intersections = previewRaycaster.intersectObjects(targetMeshes, false);
        if (!intersections.length) return null;

        return intersections.find((entry) => {
            if (!entry.face || !entry.object) return true;
            const worldNormal = entry.face.normal.clone().transformDirection(entry.object.matrixWorld);
            return worldNormal.dot(previewRaycaster.ray.direction) < 0;
        }) || intersections[0] || null;
    }

    function isPreviewObjectVisible(object) {
        let current = object;
        while (current) {
            if (!current.visible) return false;
            current = current.parent;
        }
        return true;
    }

    function getIntersectionFaceName(intersection) {
        if (!intersection || typeof intersection.faceIndex !== 'number') return 'model';
        return previewFaceNames[Math.floor(intersection.faceIndex / 2)] || 'model';
    }

    function intersectionToTexturePixel(intersection) {
        if (!intersection || !intersection.uv) return null;

        return {
            x: clamp(Math.floor(clamp(intersection.uv.x, 0, 0.999999) * SKIN_SIZE), 0, SKIN_SIZE - 1),
            y: clamp(Math.floor(clamp(1 - intersection.uv.y, 0, 0.999999) * SKIN_SIZE), 0, SKIN_SIZE - 1)
        };
    }

    function intersectionToPixel(intersection) {
        if (!intersection) return null;

        if (intersection.object && intersection.object.userData && intersection.object.userData.skinPaintLayer && intersection.uv) {
            const pixel = intersectionToTexturePixel(intersection);
            if (!pixel) return null;

            return {
                x: pixel.x,
                y: pixel.y,
                paintKey: [
                    intersection.object.userData.skinPaintPart || 'model',
                    intersection.object.userData.skinPaintLayer,
                    getIntersectionFaceName(intersection)
                ].join(':')
            };
        }

        if (intersection.object && intersection.object.userData && Array.isArray(intersection.object.userData.rect) && intersection.uv) {
            const rect = intersection.object.userData.rect;
            const u = intersection.object.userData.flipX ? 1 - intersection.uv.x : intersection.uv.x;
            const v = intersection.object.userData.flipY ? 1 - intersection.uv.y : intersection.uv.y;
            return {
                x: clamp(rect[0] + Math.floor(clamp(u, 0, 0.999999) * rect[2]), 0, SKIN_SIZE - 1),
                y: clamp(rect[1] + Math.floor(clamp(1 - v, 0, 0.999999) * rect[3]), 0, SKIN_SIZE - 1),
                paintKey: [
                    intersection.object.userData.partName,
                    intersection.object.userData.layerName,
                    intersection.object.userData.faceName
                ].join(':')
            };
        }

        if (intersection.uv) {
            return {
                x: clamp(Math.floor(intersection.uv.x * SKIN_SIZE), 0, SKIN_SIZE - 1),
                y: clamp(Math.floor((1 - intersection.uv.y) * SKIN_SIZE), 0, SKIN_SIZE - 1),
                paintKey: 'model'
            };
        }

        return null;
    }

    function arePreviewHoverCellsEqual(a, b) {
        if (!a && !b) return true;
        if (!a || !b) return false;

        if (a.object || b.object) {
            return a.object === b.object &&
                a.sideIndex === b.sideIndex &&
                a.pixel &&
                b.pixel &&
                a.pixel.x === b.pixel.x &&
                a.pixel.y === b.pixel.y;
        }

        return a.gridFace === b.gridFace &&
            a.column === b.column &&
            a.row === b.row;
    }

    function setPreviewHoverCell(nextHoverCell) {
        if (arePreviewHoverCellsEqual(state.previewHoverCell, nextHoverCell)) return;
        state.previewHoverCell = nextHoverCell;
        drawPreviewPixelGrid();
    }

    function updatePreviewHoverCell(intersection) {
        if (intersection && intersection.object && intersection.object.userData && intersection.object.userData.skinPaintLayer && intersection.uv) {
            const pixel = intersectionToTexturePixel(intersection);
            setPreviewHoverCell(pixel ? {
                object: intersection.object,
                sideIndex: Math.floor(intersection.faceIndex / 2),
                pixel
            } : null);
            return;
        }

        if (!intersection || !intersection.object || !intersection.uv || !Array.isArray(intersection.object.userData.rect)) {
            setPreviewHoverCell(null);
            return;
        }

        const rect = intersection.object.userData.rect;
        const u = intersection.object.userData.flipX ? 1 - intersection.uv.x : intersection.uv.x;
        const v = intersection.object.userData.flipY ? 1 - intersection.uv.y : intersection.uv.y;
        setPreviewHoverCell({
            gridFace: null,
            column: clamp(Math.floor(clamp(u, 0, 0.999999) * rect[2]), 0, rect[2] - 1),
            row: clamp(Math.floor(clamp(1 - v, 0, 0.999999) * rect[3]), 0, rect[3] - 1)
        });
    }

    function bindPreviewPainting() {
        const canvas = skinViewer.canvas;

        const startTemporaryOrbit = (event) => {
            if (event.button !== 2 || !skinViewer || !skinViewer.controls) return;
            state.previewOrbiting = true;
            skinViewer.controls.enabled = true;
        };

        const stopTemporaryOrbit = () => {
            if (!state.previewOrbiting) return;
            state.previewOrbiting = false;
            if (skinViewer && skinViewer.controls) {
                skinViewer.controls.enabled = state.tool === 'orbit';
            }
        };

        canvas.addEventListener('contextmenu', (event) => event.preventDefault());
        canvas.addEventListener('wheel', (event) => {
            event.preventDefault();
            event.stopPropagation();
            const direction = event.deltaY > 0 ? -1 : 1;
            setPreviewZoom(state.previewZoom + direction * 0.1);
        }, { passive: false, capture: true });
        canvas.addEventListener('pointerdown', startTemporaryOrbit, true);

        canvas.addEventListener('pointermove', (event) => {
            if (state.previewOrbiting || state.tool === 'orbit') {
                updatePreviewHoverCell(null);
                return;
            }
            updatePreviewHoverCell(previewEventToIntersection(event));
        });

        canvas.addEventListener('pointerdown', (event) => {
            if (event.button === 2 || state.previewOrbiting || state.tool === 'orbit') return;

            const intersection = previewEventToIntersection(event);
            if (!intersection) return;
            updatePreviewHoverCell(intersection);

            if (state.tool !== 'picker') {
                pushUndoSnapshot();
                if (state.tool === 'brush') {
                    rememberPaintedColor();
                }
            }

            state.previewPainting = true;
            state.lastPreviewPoint = null;
            skinViewer.controls.enabled = false;
            canvas.setPointerCapture(event.pointerId);
            paintPoint(intersectionToPixel(intersection), 'lastPreviewPoint');
        });

        canvas.addEventListener('pointermove', (event) => {
            if (state.previewOrbiting || !state.previewPainting) return;

            const intersection = previewEventToIntersection(event);
            if (!intersection) {
                state.lastPreviewPoint = null;
                return;
            }
            paintPoint(intersectionToPixel(intersection), 'lastPreviewPoint');
        });

        const stopPreviewPaint = () => {
            state.previewPainting = false;
            state.lastPreviewPoint = null;
            stopTemporaryOrbit();
            if (skinViewer && skinViewer.controls) {
                skinViewer.controls.enabled = state.tool === 'orbit' || state.previewOrbiting;
            }
        };

        canvas.addEventListener('pointerup', stopPreviewPaint);
        canvas.addEventListener('pointerleave', () => {
            updatePreviewHoverCell(null);
            stopPreviewPaint();
        });
        canvas.addEventListener('pointercancel', () => {
            updatePreviewHoverCell(null);
            stopPreviewPaint();
        });
    }

    function isRegionFullyTransparent(x, y, width, height) {
        const pixels = skinCtx.getImageData(x, y, width, height).data;
        for (let index = 3; index < pixels.length; index += 4) {
            if (pixels[index] !== 0) {
                return false;
            }
        }
        return true;
    }

    function detectModelType() {
        const transparentRegions = [
            [47, 16, 1, 4],
            [50, 16, 1, 4],
            [47, 20, 1, 12],
            [54, 20, 1, 12],
            [47, 32, 1, 4],
            [50, 32, 1, 4],
            [47, 36, 1, 12],
            [54, 36, 1, 12],
            [39, 48, 1, 4],
            [42, 48, 1, 4],
            [39, 52, 1, 12],
            [46, 52, 1, 12],
            [55, 48, 1, 4],
            [58, 48, 1, 4],
            [55, 52, 1, 12],
            [62, 52, 1, 12]
        ];

        return transparentRegions.every((region) => isRegionFullyTransparent(region[0], region[1], region[2], region[3])) ? 'slim' : 'wide';
    }

    function paintFallbackSteveSkin() {
        skinCtx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
        const layout = getLayoutForModel('wide');
        const skinTone = '#c68642';
        const skinShadow = '#a96b35';
        const hair = '#5c3b24';
        const hairShadow = '#402616';
        const shirt = '#4f8fb5';
        const shirtShadow = '#3f7696';
        const shirtDark = '#315f79';
        const pants = '#37516f';
        const pantsShadow = '#283c57';
        const boots = '#3d3d44';

        fillPartLayer(layout.head, 'base', {
            main: skinTone,
            side: skinTone,
            top: hair,
            bottom: skinShadow,
            back: skinTone
        });
        fillPartLayer(layout.body, 'base', {
            main: shirt,
            side: shirtDark,
            top: shirtShadow,
            bottom: shirtDark,
            back: shirtShadow
        });
        fillPartLayer(layout.rightArm, 'base', {
            main: skinTone,
            side: skinTone,
            top: skinShadow,
            bottom: skinShadow,
            back: skinShadow
        });
        fillPartLayer(layout.leftArm, 'base', {
            main: skinTone,
            side: skinTone,
            top: skinShadow,
            bottom: skinShadow,
            back: skinShadow
        });
        fillPartLayer(layout.rightLeg, 'base', {
            main: pants,
            side: pantsShadow,
            top: pantsShadow,
            bottom: boots,
            back: pantsShadow
        });
        fillPartLayer(layout.leftLeg, 'base', {
            main: pants,
            side: pantsShadow,
            top: pantsShadow,
            bottom: boots,
            back: pantsShadow
        });

        fillRegion(layout.body.base.front, shirt);
        fillRegion(layout.body.base.back, shirtShadow);
        fillRegion(layout.body.base.right, shirtDark);
        fillRegion(layout.body.base.left, shirtDark);
        fillRegion(layout.body.base.top, shirtShadow);

        fillRegion(layout.rightArm.base.front, skinTone);
        fillRegion(layout.rightArm.base.back, skinShadow);
        fillRegion(layout.rightArm.base.right, skinShadow);
        fillRegion(layout.rightArm.base.left, skinShadow);
        fillRegion(layout.leftArm.base.front, skinTone);
        fillRegion(layout.leftArm.base.back, skinShadow);
        fillRegion(layout.leftArm.base.right, skinShadow);
        fillRegion(layout.leftArm.base.left, skinShadow);

        skinCtx.fillStyle = shirt;
        skinCtx.fillRect(layout.rightArm.base.front[0], layout.rightArm.base.front[1], layout.rightArm.base.front[2], 4);
        skinCtx.fillRect(layout.rightArm.base.back[0], layout.rightArm.base.back[1], layout.rightArm.base.back[2], 4);
        skinCtx.fillRect(layout.rightArm.base.right[0], layout.rightArm.base.right[1], layout.rightArm.base.right[2], 4);
        skinCtx.fillRect(layout.rightArm.base.left[0], layout.rightArm.base.left[1], layout.rightArm.base.left[2], 4);
        skinCtx.fillRect(layout.leftArm.base.front[0], layout.leftArm.base.front[1], layout.leftArm.base.front[2], 4);
        skinCtx.fillRect(layout.leftArm.base.back[0], layout.leftArm.base.back[1], layout.leftArm.base.back[2], 4);
        skinCtx.fillRect(layout.leftArm.base.right[0], layout.leftArm.base.right[1], layout.leftArm.base.right[2], 4);
        skinCtx.fillRect(layout.leftArm.base.left[0], layout.leftArm.base.left[1], layout.leftArm.base.left[2], 4);

        skinCtx.fillStyle = boots;
        skinCtx.fillRect(layout.rightLeg.base.front[0], layout.rightLeg.base.front[1] + 10, layout.rightLeg.base.front[2], 2);
        skinCtx.fillRect(layout.rightLeg.base.back[0], layout.rightLeg.base.back[1] + 10, layout.rightLeg.base.back[2], 2);
        skinCtx.fillRect(layout.leftLeg.base.front[0], layout.leftLeg.base.front[1] + 10, layout.leftLeg.base.front[2], 2);
        skinCtx.fillRect(layout.leftLeg.base.back[0], layout.leftLeg.base.back[1] + 10, layout.leftLeg.base.back[2], 2);

        fillRegion(layout.head.base.front, skinTone);
        fillRegion(layout.head.base.back, hairShadow);
        fillRegion(layout.head.base.right, hairShadow);
        fillRegion(layout.head.base.left, hairShadow);
        fillRegion(layout.head.base.top, hair);

        skinCtx.fillStyle = hair;
        skinCtx.fillRect(layout.head.base.front[0], layout.head.base.front[1], layout.head.base.front[2], 2);
        skinCtx.fillRect(layout.head.base.front[0], layout.head.base.front[1] + 2, 1, 2);
        skinCtx.fillRect(layout.head.base.front[0] + 7, layout.head.base.front[1] + 2, 1, 2);
        skinCtx.fillRect(layout.head.base.front[0], layout.head.base.front[1] + 4, 2, 1);
        skinCtx.fillRect(layout.head.base.front[0] + 6, layout.head.base.front[1] + 4, 2, 1);

        skinCtx.fillStyle = '#17212f';
        skinCtx.fillRect(layout.head.base.front[0] + 2, layout.head.base.front[1] + 3, 2, 2);
        skinCtx.fillRect(layout.head.base.front[0] + 4, layout.head.base.front[1] + 3, 2, 2);
        skinCtx.fillStyle = '#ffffff';
        skinCtx.fillRect(layout.head.base.front[0] + 3, layout.head.base.front[1] + 3, 1, 1);
        skinCtx.fillRect(layout.head.base.front[0] + 5, layout.head.base.front[1] + 3, 1, 1);
        skinCtx.fillStyle = '#8c4a2f';
        skinCtx.fillRect(layout.head.base.front[0] + 3, layout.head.base.front[1] + 6, 2, 1);

        setModelType('wide', { track: false });
        setPaintLayer('base');
        setPreviewHomeView();
        updateTexture();
    }

    function resetStarterSkin(options) {
        const shouldRemember = !options || options.remember !== false;
        const image = new Image();
        image.onload = () => {
            if (shouldRemember) {
                pushUndoSnapshot();
            }
            importSkinFromImage(image);
            setPaintLayer('base');
            setPreviewHomeView();
        };
        image.onerror = () => {
            if (shouldRemember) {
                pushUndoSnapshot();
            }
            paintFallbackSteveSkin();
        };
        image.src = '/assets/skin-editor-starter.png?v=20260422';
    }

    function importSkinFromImage(image) {
        skinCtx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
        skinCtx.drawImage(image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);

        if (image.height === 32) {
            skinCtx.drawImage(image, 0, 16, 16, 16, 16, 48, 16, 16);
            skinCtx.drawImage(image, 40, 16, 16, 16, 32, 48, 16, 16);
        }

        setModelType(image.height === 64 ? detectModelType() : 'wide', { track: false });
        updateTexture();
    }

    function bindFileControls() {
        if (elements.undo) {
            elements.undo.addEventListener('click', undo);
        }
        if (elements.redo) {
            elements.redo.addEventListener('click', redo);
        }

        elements.upload.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', () => {
            const [file] = elements.fileInput.files || [];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                const image = new Image();
                image.onload = () => {
                    if (!((image.width === 64 && image.height === 64) || (image.width === 64 && image.height === 32))) {
                        window.alert('Please upload a classic Minecraft skin in 64x64 or legacy 64x32 format.');
                        return;
                    }

                    pushUndoSnapshot();
                    importSkinFromImage(image);
                    if (window.CubeAnalytics) {
                        window.CubeAnalytics.track('skin_editor_upload', {
                            skin_width: image.width,
                            skin_height: image.height,
                            skin_model: state.modelType
                        });
                    }
                };
                image.src = String(reader.result || '');
            };
            reader.readAsDataURL(file);
        });

        elements.download.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = skinCanvas.toDataURL('image/png');
            link.download = 'minecraft-skin.png';
            link.click();

            if (window.CubeAnalytics) {
                window.CubeAnalytics.track('skin_editor_export', {
                    export_type: 'png'
                });
            }
        });

        elements.reset.addEventListener('click', () => resetStarterSkin({ remember: true }));
        elements.clear.addEventListener('click', () => {
            pushUndoSnapshot();
            skinCtx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
            updateTexture();
        });
    }

    function setModelType(modelType, options) {
        const nextModel = modelType === 'slim' ? 'slim' : 'wide';
        const shouldTrack = !options || options.track !== false;

        if (state.modelType === nextModel && previewHelperRoot) {
            updateModelButtons();
            queuePreviewSync();
            return;
        }

        state.modelType = nextModel;
        updateModelButtons();
        buildPreviewHelperModel();
        queuePreviewSync();

        if (shouldTrack && window.CubeAnalytics) {
            window.CubeAnalytics.track('skin_editor_model_change', {
                skin_model: state.modelType
            });
        }
    }

    function setPaintLayer(layerName) {
        state.paintLayer = layerName === 'overlay' ? 'overlay' : 'base';
        updateLayerButtons();
    }

    function setPartHidden(partName, hidden) {
        if (!Object.prototype.hasOwnProperty.call(state.hiddenParts, partName)) return;
        state.hiddenParts[partName] = Boolean(hidden);
        applyPreviewPartVisibility();
    }

    function bindControls() {
        document.querySelectorAll('[data-skin-tool]').forEach((button) => {
            button.addEventListener('click', () => setActiveTool(button.dataset.skinTool));
        });
        document.querySelectorAll('[data-skin-layer]').forEach((button) => {
            button.addEventListener('click', () => setPaintLayer(button.dataset.skinLayer));
        });
        document.querySelectorAll('[data-skin-model]').forEach((button) => {
            button.addEventListener('click', () => setModelType(button.dataset.skinModel));
        });
        document.querySelectorAll('[data-skin-part]').forEach((input) => {
            input.addEventListener('change', () => {
                setPartHidden(input.dataset.skinPart, input.checked);
            });
        });

        elements.brushSize.addEventListener('change', () => {
            state.brushSize = clamp(Number(elements.brushSize.value || 1), 1, 8);
            updateStats();
        });

        elements.zoom.addEventListener('change', () => {
            state.zoom = clamp(Number(elements.zoom.value || DEFAULT_ZOOM), 4, 16);
            renderAtlas();
        });

        if (elements.pixelGrid) {
            elements.pixelGrid.addEventListener('change', () => {
                state.showPixelGrid = Boolean(elements.pixelGrid.checked);
                renderAtlas();
                applyPreviewPartVisibility();
            });
        }

        if (elements.largePreview) {
            elements.largePreview.addEventListener('change', () => {
                state.largePreview = Boolean(elements.largePreview.checked);
                applyPreviewSize();
            });
        }

        if (elements.previewZoom) {
            elements.previewZoom.addEventListener('input', () => {
                setPreviewZoom(Number(elements.previewZoom.value || 100) / 100);
                updateRangeProgress(elements.previewZoom);
            });
        }

        elements.alpha.addEventListener('input', () => {
            elements.alphaValue.textContent = `${elements.alpha.value}%`;
            updateRangeProgress(elements.alpha);
        });

        elements.overlay.addEventListener('change', () => {
            updateHelperOverlayVisibility();
            if (skinViewer) {
                skinViewer.render();
            }
        });
        elements.color.addEventListener('input', renderSimilarColors);
        elements.alpha.addEventListener('change', renderSimilarColors);
    }

    function bindKeyboardShortcuts() {
        document.addEventListener('keydown', (event) => {
            if (!(event.ctrlKey || event.metaKey) || event.altKey) return;

            const active = document.activeElement;
            if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || active.tagName === 'SELECT') && active !== elements.color) {
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

    function onResize() {
        if (!skinViewer) return;
        const rect = elements.preview.getBoundingClientRect();
        skinViewer.setSize(Math.max(300, Math.floor(rect.width)), Math.max(320, Math.floor(rect.height)));
        setPreviewHomeView();
        skinViewer.render();
        drawPreviewPixelGrid();
    }

    function initElements() {
        elements.preview = document.getElementById('skinPreview');
        elements.color = document.getElementById('skinColor');
        elements.alpha = document.getElementById('skinAlpha');
        elements.alphaValue = document.getElementById('skinAlphaValue');
        elements.brushSize = document.getElementById('skinBrushSize');
        elements.zoom = document.getElementById('skinZoom');
        ensureEnhancementControls();
        elements.previewZoom = document.getElementById('skinPreviewZoom');
        elements.previewZoomValue = document.getElementById('skinPreviewZoomValue');
        elements.pixelGrid = document.getElementById('skinPixelGrid');
        elements.largePreview = document.getElementById('skinLargePreview');
        elements.undo = document.getElementById('skinUndoButton');
        elements.redo = document.getElementById('skinRedoButton');
        elements.overlay = document.getElementById('skinShowOverlay');
        elements.upload = document.getElementById('skinUploadButton');
        elements.download = document.getElementById('skinDownloadButton');
        elements.reset = document.getElementById('skinResetButton');
        elements.clear = document.getElementById('skinClearButton');
        elements.fileInput = document.getElementById('skinFileInput');
        elements.dimensions = document.getElementById('skinDimensions');
        elements.layerValue = document.getElementById('skinLayerValue');
        elements.mode = document.getElementById('skinMode');
        elements.brush = document.getElementById('skinBrush');
        elements.modelValue = document.getElementById('skinModelValue');
        elements.recentColors = document.getElementById('skinRecentColors');
        elements.similarColors = document.getElementById('skinSimilarColors');
        elements.previewCard = elements.preview ? elements.preview.closest('.skin-preview-card') : null;
        editorCanvas = document.getElementById('skinEditorCanvas');
        editorCtx = editorCanvas.getContext('2d');
        syncRangeControls();
    }

    function init() {
        if (!document.querySelector('[data-skin-editor]')) return;
        if (!window.skinview3d || !window.THREE) {
            console.error('Skin editor dependencies did not load.');
            return;
        }

        initElements();
        state.brushSize = Number(elements.brushSize.value || 1);
        state.zoom = Number(elements.zoom.value || DEFAULT_ZOOM);
        state.previewZoom = clamp(Number(elements.previewZoom ? elements.previewZoom.value : 100) / 100, 0.6, 2);
        state.showPixelGrid = elements.pixelGrid ? Boolean(elements.pixelGrid.checked) : true;
        state.largePreview = elements.largePreview ? Boolean(elements.largePreview.checked) : false;
        if (elements.previewCard) {
            elements.previewCard.classList.toggle('is-large-preview', state.largePreview);
        }
        createOffscreenSkinCanvas();
        bindControls();
        bindKeyboardShortcuts();
        bindFileControls();
        bindEditorPainting();
        initPreview();
        window.addEventListener('resize', onResize);

        elements.alphaValue.textContent = `${elements.alpha.value}%`;
        updatePreviewZoomValue();
        renderSimilarColors();

        resetStarterSkin({ remember: false });
        renderAtlas();
        updateStats();
        updateHistoryButtons();
        updateLayerButtons();
        updateModelButtons();
        setActiveTool('brush');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
