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
    const state = {
        size: DEFAULT_SIZE,
        zoom: DEFAULT_ZOOM,
        tool: 'brush',
        brushSize: 1,
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
        if (elements.redoButton) {
            elements.redoButton.disabled = state.redoStack.length === 0;
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
        elements.toolValue.textContent = state.tool;
        elements.brushValue.textContent = `${state.brushSize}px`;
        elements.stage.classList.toggle('is-zooming', state.zoom < ZOOM_LEVELS[ZOOM_LEVELS.length - 1]);
        renderNavigator();
    }

    function eventToPixel(event) {
        const rect = editorCanvas.getBoundingClientRect();
        const x = Math.floor(((event.clientX - rect.left) / rect.width) * state.size);
        const y = Math.floor(((event.clientY - rect.top) / rect.height) * state.size);
        if (x < 0 || y < 0 || x >= state.size || y >= state.size) return null;
        return { x, y };
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
        editorCanvas.addEventListener('pointerdown', (event) => {
            const point = eventToPixel(event);
            if (!point) return;

            if (state.tool !== 'picker') {
                pushUndoSnapshot();
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

        elements.canvasSize.addEventListener('change', () => {
            pushUndoSnapshot();
            const nextSize = clamp(Number(elements.canvasSize.value || DEFAULT_SIZE), 8, 256);
            rebuildTextureCanvas(nextSize, true);
            state.size = nextSize;
            setZoom(recommendedZoomForSize(nextSize), { x: nextSize / 2, y: nextSize / 2 });
            if (window.CubeAnalytics) {
                window.CubeAnalytics.track('texture_painter_resize', { texture_size: nextSize });
            }
        });

        elements.undoButton.addEventListener('click', undo);
        elements.redoButton.addEventListener('click', redo);
        elements.fitButton.addEventListener('click', () => {
            setZoom(recommendedZoomForSize(state.size), { x: state.size / 2, y: state.size / 2 });
        });
    }

    function bindFileControls() {
        elements.uploadButton.addEventListener('click', () => elements.fileInput.click());
        elements.fileInput.addEventListener('change', () => {
            const [file] = elements.fileInput.files || [];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = () => {
                const image = new Image();
                image.onload = () => {
                    pushUndoSnapshot();
                    textureCtx.clearRect(0, 0, state.size, state.size);
                    textureCtx.drawImage(image, 0, 0, image.width, image.height, 0, 0, state.size, state.size);
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

        elements.exportButton.addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = textureCanvas.toDataURL('image/png');
            link.download = `minecraft-texture-${state.size}.png`;
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
        elements.uploadButton = document.getElementById('textureUploadButton');
        elements.exportButton = document.getElementById('textureExportButton');
        elements.clearButton = document.getElementById('textureClearButton');
        elements.starterButton = document.getElementById('textureStarterButton');
        elements.undoButton = document.getElementById('textureUndoButton');
        elements.redoButton = document.getElementById('textureRedoButton');
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
        bindKeyboardShortcuts();
        bindFileControls();
        elements.alphaValue.textContent = `${elements.alpha.value}%`;
        elements.zoom.value = String(state.zoom);
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
