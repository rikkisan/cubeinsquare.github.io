(function () {
    const DEFAULT_SIZE = 16;
    const DEFAULT_ZOOM = 18;
    const ZOOM_BY_SIZE = {
        16: 18,
        32: 12,
        64: 8,
        128: 6
    };
    const state = {
        size: DEFAULT_SIZE,
        zoom: DEFAULT_ZOOM,
        tool: 'brush',
        brushSize: 1,
        painting: false,
        lastPoint: null
    };

    const elements = {};
    let textureCanvas;
    let textureCtx;
    let editorCanvas;
    let editorCtx;

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function recommendedZoomForSize(size) {
        return ZOOM_BY_SIZE[size] || 8;
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
            state.painting = true;
            state.lastPoint = null;
            editorCanvas.setPointerCapture(event.pointerId);
            paintPoint(point);
        });

        editorCanvas.addEventListener('pointermove', (event) => {
            if (!state.painting) return;
            paintPoint(eventToPixel(event));
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

    function bindControls() {
        document.querySelectorAll('[data-texture-tool]').forEach((button) => {
            button.addEventListener('click', () => setTool(button.dataset.textureTool));
        });

        elements.brushSize.addEventListener('change', () => {
            state.brushSize = clamp(Number(elements.brushSize.value || 1), 1, 8);
            renderCanvas();
        });

        elements.zoom.addEventListener('change', () => {
            state.zoom = clamp(Number(elements.zoom.value || DEFAULT_ZOOM), 6, 28);
            renderCanvas();
        });

        elements.alpha.addEventListener('input', () => {
            elements.alphaValue.textContent = `${elements.alpha.value}%`;
        });

        elements.canvasSize.addEventListener('change', () => {
            const nextSize = clamp(Number(elements.canvasSize.value || DEFAULT_SIZE), 8, 256);
            rebuildTextureCanvas(nextSize, true);
            state.size = nextSize;
            state.zoom = recommendedZoomForSize(nextSize);
            elements.zoom.value = String(state.zoom);
            renderCanvas();
            if (window.CubeAnalytics) {
                window.CubeAnalytics.track('texture_painter_resize', { texture_size: nextSize });
            }
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
                    textureCtx.clearRect(0, 0, state.size, state.size);
                    textureCtx.drawImage(image, 0, 0, image.width, image.height, 0, 0, state.size, state.size);
                    renderCanvas();
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
            textureCtx.clearRect(0, 0, state.size, state.size);
            renderCanvas();
        });

        elements.starterButton.addEventListener('click', () => {
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
        elements.canvasSizeValue = document.getElementById('textureCanvasSizeValue');
        elements.toolValue = document.getElementById('textureToolValue');
        elements.brushValue = document.getElementById('textureBrushValue');
    }

    function init() {
        if (!document.querySelector('[data-texture-painter]')) return;
        initElements();
        bindCanvasPainting();
        bindControls();
        bindFileControls();
        elements.alphaValue.textContent = `${elements.alpha.value}%`;
        elements.zoom.value = String(state.zoom);
        setTool('brush');
        renderCanvas();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
