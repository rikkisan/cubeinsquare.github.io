(function () {
    const SKIN_SIZE = 64;
    const DEFAULT_ZOOM = 8;
    const DEFAULT_ALPHA = 100;
    const state = {
        tool: 'brush',
        modelType: 'wide',
        brushSize: 1,
        zoom: DEFAULT_ZOOM,
        alpha: DEFAULT_ALPHA,
        editorPainting: false,
        previewPainting: false,
        lastEditorPoint: null,
        lastPreviewPoint: null
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
            head: [0, 28, 0],
            body: [0, 18, 0],
            rightArm: [modelType === 'slim' ? -5.5 : -6, 18, 0],
            leftArm: [modelType === 'slim' ? 5.5 : 6, 18, 0],
            rightLeg: [-2, 6, 0],
            leftLeg: [2, 6, 0]
        };
    }

    let skinCanvas;
    let skinCtx;
    let editorCanvas;
    let editorCtx;
    let texture;
    let scene;
    let camera;
    let renderer;
    let controls;
    let raycaster;
    let pointer;
    let previewRoot;
    let previewPaintables = [];
    let animationHandle = 0;

    const elements = {};

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
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

    function setActiveTool(tool) {
        state.tool = tool;
        controls.enabled = tool === 'orbit';

        document.querySelectorAll('[data-skin-tool]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.skinTool === tool);
        });
    }

    function createOffscreenSkinCanvas() {
        skinCanvas = document.createElement('canvas');
        skinCanvas.width = SKIN_SIZE;
        skinCanvas.height = SKIN_SIZE;
        skinCtx = skinCanvas.getContext('2d', { willReadFrequently: true });
        skinCtx.imageSmoothingEnabled = false;
    }

    function createTexture() {
        texture = new THREE.CanvasTexture(skinCanvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.flipY = false;
    }

    const BOX_FACE_ORDER = ['right', 'left', 'top', 'bottom', 'front', 'back'];

    function setBoxFaceUv(geometry, faceIndex, rect) {
        const [x, y, width, height] = rect;
        const u0 = x / SKIN_SIZE;
        const u1 = (x + width) / SKIN_SIZE;
        const v0 = 1 - y / SKIN_SIZE;
        const v1 = 1 - (y + height) / SKIN_SIZE;
        const vertexOffset = faceIndex * 4;
        const uv = geometry.attributes.uv;

        uv.setXY(vertexOffset + 0, u0, v0);
        uv.setXY(vertexOffset + 1, u1, v0);
        uv.setXY(vertexOffset + 2, u0, v1);
        uv.setXY(vertexOffset + 3, u1, v1);
    }

    function createCuboid(layerName, definition, grow, material) {
        const width = definition.size[0] + grow * 2;
        const height = definition.size[1] + grow * 2;
        const depth = definition.size[2] + grow * 2;
        const geometry = new THREE.BoxGeometry(width, height, depth);
        const faces = definition[layerName];

        BOX_FACE_ORDER.forEach((faceName, faceIndex) => {
            setBoxFaceUv(geometry, faceIndex, faces[faceName]);
        });
        geometry.attributes.uv.needsUpdate = true;

        const mesh = new THREE.Mesh(geometry, material);
        previewPaintables.push(mesh);
        return mesh;
    }

    function addBodyPart(root, partName, definition, position, materialBase, materialOverlay) {
        const group = new THREE.Group();

        previewPaintables = previewPaintables.filter(Boolean);
        group.add(createCuboid('base', definition, 0, materialBase));

        if (definition.overlay) {
            const overlayGroup = createCuboid('overlay', definition, 0.45, materialOverlay);
            overlayGroup.userData.isOverlay = true;
            group.add(overlayGroup);
        }

        group.position.set(position[0], position[1], position[2]);
        root.add(group);
        return group;
    }

    function disposePreviewRoot() {
        if (!previewRoot) return;

        previewRoot.traverse((node) => {
            if (node.geometry) {
                node.geometry.dispose();
            }
            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material.forEach((material) => material.dispose());
                } else {
                    node.material.dispose();
                }
            }
        });

        scene.remove(previewRoot);
        previewRoot = null;
    }

    function buildPreviewModel() {
        const layout = getLayoutForModel(state.modelType);
        const partPositions = getPartPositionsForModel(state.modelType);
        previewPaintables = [];
        disposePreviewRoot();
        previewRoot = new THREE.Group();
        const baseMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01
        });
        const overlayMaterial = new THREE.MeshStandardMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.01
        });

        ['head', 'body', 'rightArm', 'leftArm', 'rightLeg', 'leftLeg'].forEach((partName) => {
            addBodyPart(previewRoot, partName, layout[partName], partPositions[partName], baseMaterial, overlayMaterial);
        });

        previewRoot.rotation.y = Math.PI / 5;
        scene.add(previewRoot);
        updateOverlayVisibility();
    }

    function updateModelButtons() {
        document.querySelectorAll('[data-skin-model]').forEach((button) => {
            button.classList.toggle('is-active', button.dataset.skinModel === state.modelType);
        });
        if (elements.modelValue) {
            elements.modelValue.textContent = state.modelType === 'slim' ? 'slim' : 'wide';
        }
    }

    function setModelType(modelType, options) {
        const nextModel = modelType === 'slim' ? 'slim' : 'wide';
        const shouldTrack = !options || options.track !== false;

        if (state.modelType === nextModel && previewRoot) {
            updateModelButtons();
            return;
        }

        state.modelType = nextModel;
        updateModelButtons();

        if (scene && texture) {
            buildPreviewModel();
            renderer.render(scene, camera);
        }

        if (shouldTrack && window.CubeAnalytics) {
            window.CubeAnalytics.track('skin_editor_model_change', {
                skin_model: state.modelType
            });
        }
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

    function initPreview() {
        const container = elements.preview;
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.set(34, 24, 34);

        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(container.clientWidth, container.clientHeight);
        container.appendChild(renderer.domElement);

        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.target.set(0, 16, 0);
        controls.minDistance = 18;
        controls.maxDistance = 70;
        controls.enablePan = false;
        controls.enabled = false;

        raycaster = new THREE.Raycaster();
        pointer = new THREE.Vector2();

        scene.add(new THREE.AmbientLight(0xffffff, 0.75));
        const frontLight = new THREE.DirectionalLight(0xffffff, 0.9);
        frontLight.position.set(30, 36, 22);
        scene.add(frontLight);

        const rimLight = new THREE.DirectionalLight(0x60a5fa, 0.55);
        rimLight.position.set(-18, 12, -20);
        scene.add(rimLight);

        buildPreviewModel();
        bindPreviewPainting();
        onResize();
        animate();
    }

    function updateTexture() {
        texture.needsUpdate = true;
        renderAtlas();
        updateStats();
    }

    function updateOverlayVisibility() {
        const showOverlay = Boolean(elements.overlay.checked);
        previewRoot.traverse((node) => {
            if (node.userData && node.userData.isOverlay) {
                node.visible = showOverlay;
            }
        });
    }

    function updateStats() {
        elements.dimensions.textContent = `${SKIN_SIZE} x ${SKIN_SIZE}`;
        elements.mode.textContent = state.tool;
        elements.brush.textContent = `${state.brushSize}px`;
        if (elements.modelValue) {
            elements.modelValue.textContent = state.modelType === 'slim' ? 'slim' : 'wide';
        }
    }

    function drawRectPixel(x, y) {
        const half = Math.floor((state.brushSize - 1) / 2);
        const color = getColorRgba();
        const startX = x - half;
        const startY = y - half;

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
        if (previous) {
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
        const x = Math.floor((event.clientX - rect.left) * scaleX / state.zoom);
        const y = Math.floor((event.clientY - rect.top) * scaleY / state.zoom);

        if (x < 0 || y < 0 || x >= SKIN_SIZE || y >= SKIN_SIZE) return null;
        return { x, y };
    }

    function bindEditorPainting() {
        editorCanvas.addEventListener('pointerdown', (event) => {
            const point = editorEventToPixel(event);
            if (!point) return;

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

    function previewEventToIntersection(event) {
        const rect = renderer.domElement.getBoundingClientRect();
        pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(pointer, camera);

        return raycaster.intersectObjects(previewPaintables, false)[0] || null;
    }

    function intersectionToPixel(intersection) {
        if (!intersection || !intersection.uv) return null;

        return {
            x: clamp(Math.floor(intersection.uv.x * SKIN_SIZE), 0, SKIN_SIZE - 1),
            y: clamp(Math.floor((1 - intersection.uv.y) * SKIN_SIZE), 0, SKIN_SIZE - 1)
        };
    }

    function bindPreviewPainting() {
        const canvas = renderer.domElement;

        canvas.addEventListener('pointerdown', (event) => {
            if (state.tool === 'orbit') return;

            const intersection = previewEventToIntersection(event);
            if (!intersection) return;

            state.previewPainting = true;
            state.lastPreviewPoint = null;
            controls.enabled = false;
            canvas.setPointerCapture(event.pointerId);
            paintPoint(intersectionToPixel(intersection), 'lastPreviewPoint');
        });

        canvas.addEventListener('pointermove', (event) => {
            if (!state.previewPainting) return;

            const intersection = previewEventToIntersection(event);
            if (!intersection) return;
            paintPoint(intersectionToPixel(intersection), 'lastPreviewPoint');
        });

        const stopPreviewPaint = () => {
            state.previewPainting = false;
            state.lastPreviewPoint = null;
            controls.enabled = state.tool === 'orbit';
        };

        canvas.addEventListener('pointerup', stopPreviewPaint);
        canvas.addEventListener('pointerleave', stopPreviewPaint);
        canvas.addEventListener('pointercancel', stopPreviewPaint);
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

        if (size >= 6) {
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

    function resetStarterSkin() {
        skinCtx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);

        const fills = [
            { rect: [8, 8, 8, 8], color: '#f0c9a5' },
            { rect: [8, 0, 8, 8], color: '#7b4d2d' },
            { rect: [20, 20, 8, 12], color: '#2563eb' },
            { rect: [16, 20, 4, 12], color: '#1d4ed8' },
            { rect: [28, 20, 4, 12], color: '#1d4ed8' },
            { rect: [44, 20, 4, 12], color: '#2563eb' },
            { rect: [48, 20, 4, 12], color: '#2563eb' },
            { rect: [36, 52, 4, 12], color: '#2563eb' },
            { rect: [40, 52, 4, 12], color: '#2563eb' },
            { rect: [4, 20, 4, 12], color: '#0f172a' },
            { rect: [8, 20, 4, 12], color: '#0f172a' },
            { rect: [20, 52, 4, 12], color: '#0f172a' },
            { rect: [24, 52, 4, 12], color: '#0f172a' }
        ];

        fills.forEach((item) => {
            skinCtx.fillStyle = item.color;
            skinCtx.fillRect(item.rect[0], item.rect[1], item.rect[2], item.rect[3]);
        });

        skinCtx.fillStyle = '#202020';
        skinCtx.fillRect(10, 11, 2, 2);
        skinCtx.fillRect(20, 11, 2, 2);
        skinCtx.fillStyle = '#7a2e1d';
        skinCtx.fillRect(12, 14, 8, 2);

        setModelType('wide', { track: false });
        updateTexture();
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

        elements.reset.addEventListener('click', resetStarterSkin);
        elements.clear.addEventListener('click', () => {
            skinCtx.clearRect(0, 0, SKIN_SIZE, SKIN_SIZE);
            updateTexture();
        });
    }

    function bindControls() {
        document.querySelectorAll('[data-skin-tool]').forEach((button) => {
            button.addEventListener('click', () => setActiveTool(button.dataset.skinTool));
        });
        document.querySelectorAll('[data-skin-model]').forEach((button) => {
            button.addEventListener('click', () => setModelType(button.dataset.skinModel));
        });

        elements.brushSize.addEventListener('change', () => {
            state.brushSize = clamp(Number(elements.brushSize.value || 1), 1, 8);
            updateStats();
        });

        elements.zoom.addEventListener('change', () => {
            state.zoom = clamp(Number(elements.zoom.value || DEFAULT_ZOOM), 4, 16);
            renderAtlas();
        });

        elements.alpha.addEventListener('input', () => {
            elements.alphaValue.textContent = `${elements.alpha.value}%`;
        });

        elements.overlay.addEventListener('change', updateOverlayVisibility);
    }

    function animate() {
        animationHandle = window.requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
    }

    function onResize() {
        if (!renderer || !camera) return;
        const rect = elements.preview.getBoundingClientRect();
        const width = Math.max(300, Math.floor(rect.width));
        const height = Math.max(320, Math.floor(rect.height));
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    }

    function initElements() {
        elements.preview = document.getElementById('skinPreview');
        elements.color = document.getElementById('skinColor');
        elements.alpha = document.getElementById('skinAlpha');
        elements.alphaValue = document.getElementById('skinAlphaValue');
        elements.brushSize = document.getElementById('skinBrushSize');
        elements.zoom = document.getElementById('skinZoom');
        elements.overlay = document.getElementById('skinShowOverlay');
        elements.upload = document.getElementById('skinUploadButton');
        elements.download = document.getElementById('skinDownloadButton');
        elements.reset = document.getElementById('skinResetButton');
        elements.clear = document.getElementById('skinClearButton');
        elements.fileInput = document.getElementById('skinFileInput');
        elements.dimensions = document.getElementById('skinDimensions');
        elements.mode = document.getElementById('skinMode');
        elements.brush = document.getElementById('skinBrush');
        elements.modelValue = document.getElementById('skinModelValue');
        editorCanvas = document.getElementById('skinEditorCanvas');
        editorCtx = editorCanvas.getContext('2d');
    }

    function init() {
        if (!document.querySelector('[data-skin-editor]')) return;

        initElements();
        createOffscreenSkinCanvas();
        createTexture();
        bindControls();
        bindFileControls();
        bindEditorPainting();
        initPreview();
        window.addEventListener('resize', onResize);

        state.brushSize = Number(elements.brushSize.value || 1);
        state.zoom = Number(elements.zoom.value || DEFAULT_ZOOM);
        elements.alphaValue.textContent = `${elements.alpha.value}%`;

        resetStarterSkin();
        renderAtlas();
        updateStats();
        updateModelButtons();
        setActiveTool('brush');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
