(function () {
    const DEFAULT_RADIUS = 7;
    const DEFAULT_THICKNESS = 1;
    const COPY_RESET_MS = 1400;
    const CELL_PADDING = 0.14;
    const AXIS_COLOR = 'rgba(148, 163, 184, 0.18)';
    const GRID_COLOR = 'rgba(148, 163, 184, 0.16)';
    const FILL_COLOR = '#60a5fa';
    const FILL_COLOR_ALT = '#93c5fd';
    const EMPTY_COLOR = 'rgba(15, 23, 42, 0.78)';

    const LOCALE = (document.documentElement.lang || 'en').slice(0, 2).toLowerCase();

    const TEXT = {
        en: {
            copied: 'Copied',
            noLayer: 'No layer',
            noBlocks: 'No blocks to show.',
            blocks: 'blocks',
            singleLayer: 'Single layer',
            layer: 'Layer',
            radius: 'radius',
            currentMode: 'Current mode',
            widestSpanSuffix: 'blocks',
            diameterSuffix: 'blocks'
        },
        ru: {
            copied: 'Скопировано',
            noLayer: 'Нет слоя',
            noBlocks: 'Здесь пока нечего показывать.',
            blocks: 'блоков',
            singleLayer: 'Один слой',
            layer: 'Слой',
            radius: 'радиус',
            currentMode: 'Режим',
            widestSpanSuffix: 'блоков',
            diameterSuffix: 'блоков'
        },
        fr: {
            copied: 'Copié',
            noLayer: 'Aucune couche',
            noBlocks: 'Aucun bloc à afficher.',
            blocks: 'blocs',
            singleLayer: 'Couche unique',
            layer: 'Couche',
            radius: 'rayon',
            currentMode: 'Mode',
            widestSpanSuffix: 'blocs',
            diameterSuffix: 'blocs'
        },
        de: {
            copied: 'Kopiert',
            noLayer: 'Keine Ebene',
            noBlocks: 'Keine Blöcke zum Anzeigen.',
            blocks: 'Blöcke',
            singleLayer: 'Einzelne Ebene',
            layer: 'Ebene',
            radius: 'Radius',
            currentMode: 'Modus',
            widestSpanSuffix: 'Blöcke',
            diameterSuffix: 'Blöcke'
        }
    };

    const SHAPE_META = {
        solid_sphere: {
            en: {
                label: 'Solid sphere',
                note: 'Use the solid sphere when you need a heavy volume, a buried chamber, or a clean base that you plan to carve later.'
            },
            ru: {
                label: 'Сплошная сфера',
                note: 'Сплошная сфера удобна, когда нужен плотный объём, спрятанная комната или чистая база под дальнейшую резьбу.'
            },
            fr: {
                label: 'Sphère pleine',
                note: 'La sphère pleine convient quand il faut un volume massif, une chambre enterrée ou une base propre à retravailler ensuite.'
            },
            de: {
                label: 'Volle Kugel',
                note: 'Die volle Kugel passt, wenn du ein massives Volumen, einen versteckten Raum oder eine saubere Basis zum späteren Ausschneiden brauchst.'
            }
        },
        hollow_sphere: {
            en: {
                label: 'Hollow sphere',
                note: 'The hollow shell keeps the outside curve while saving blocks and leaving space for stairs, lights, or an interior room.'
            },
            ru: {
                label: 'Полая сфера',
                note: 'Полая сфера сохраняет внешний силуэт, но экономит блоки и оставляет место под лестницы, свет и интерьер.'
            },
            fr: {
                label: 'Sphère creuse',
                note: 'La coque creuse garde la courbe extérieure tout en économisant des blocs et en laissant de la place pour l’intérieur.'
            },
            de: {
                label: 'Hohle Kugel',
                note: 'Die hohle Kugel behält die Außenform, spart Blöcke und lässt Platz für Treppen, Licht oder einen Innenraum.'
            }
        },
        upper_dome: {
            en: {
                label: 'Upper dome',
                note: 'Use the upper dome for observatories, shrine roofs, greenhouse caps, and any build that only needs the top half.'
            },
            ru: {
                label: 'Верхний купол',
                note: 'Верхний купол подходит для обсерваторий, святилищ, теплиц и любых построек, где нужна только верхняя половина.'
            },
            fr: {
                label: 'Dôme supérieur',
                note: 'Le dôme supérieur fonctionne bien pour les observatoires, les toits de sanctuaire, les serres et toute forme qui ne garde que la moitié haute.'
            },
            de: {
                label: 'Oberes Kuppelstück',
                note: 'Die obere Kuppel ist praktisch für Observatorien, Schrein-Dächer, Gewächshäuser und alle Formen, die nur die obere Hälfte brauchen.'
            }
        },
        lower_dome: {
            en: {
                label: 'Lower dome',
                note: 'The lower dome is useful for bowls, basements, underground vaults, and round shapes that should feel heavier at the bottom.'
            },
            ru: {
                label: 'Нижний купол',
                note: 'Нижний купол полезен для чаш, подвалов, подземных залов и круглых форм, которым нужен вес снизу.'
            },
            fr: {
                label: 'Dôme inférieur',
                note: 'Le dôme inférieur aide pour les bols, les caves, les salles souterraines et les formes rondes qui doivent porter plus de poids en bas.'
            },
            de: {
                label: 'Untere Kuppel',
                note: 'Die untere Kuppel ist nützlich für Schalen, Keller, unterirdische Hallen und runde Formen, die unten schwerer wirken sollen.'
            }
        },
        filled_circle: {
            en: {
                label: 'Filled circle',
                note: 'A filled circle works as a floor, pond, ritual mark, tower base, or any top-down round footprint before the build goes vertical.'
            },
            ru: {
                label: 'Заполненный круг',
                note: 'Заполненный круг хорош как пол, пруд, ритуальная площадка, основание башни или любая круглая площадка до вертикальной сборки.'
            },
            fr: {
                label: 'Cercle plein',
                note: 'Le cercle plein sert de sol, de bassin, de marque rituelle, de base de tour ou de toute empreinte ronde vue du dessus.'
            },
            de: {
                label: 'Gefüllter Kreis',
                note: 'Der gefüllte Kreis eignet sich als Boden, Teich, Ritualfläche, Turmbasis oder jede andere runde Grundfläche von oben.'
            }
        },
        outline_circle: {
            en: {
                label: 'Outline circle',
                note: 'Start with the outline when you want a clean ring, a wall footprint, or a fast scaffold before you decide how thick the build should become.'
            },
            ru: {
                label: 'Контурный круг',
                note: 'Контурный круг удобен как чистое кольцо, след под стену или быстрая разметка до того, как ты решишь, насколько толстой делать постройку.'
            },
            fr: {
                label: 'Cercle contour',
                note: 'Le cercle contour sert de bague propre, d’empreinte de mur ou de repère rapide avant de décider l’épaisseur finale.'
            },
            de: {
                label: 'Kreisumriss',
                note: 'Der Kreisumriss ist ideal als sauberer Ring, Wand-Grundriss oder schneller Bau-Scaffold, bevor du die endgültige Dicke festlegst.'
            }
        }
    };

    const state = {
        shape: 'solid_sphere',
        radius: DEFAULT_RADIUS,
        thickness: DEFAULT_THICKNESS,
        layers: [],
        layerIndex: 0,
        totalBlocks: 0,
        widestSpan: 0,
        diameter: DEFAULT_RADIUS * 2 + 1
    };

    const els = {};
    let topCtx;
    let frontCtx;
    let layerCtx;

    function t(key) {
        const table = TEXT[LOCALE] || TEXT.en;
        return table[key] || TEXT.en[key] || key;
    }

    function shapeText(shape, field) {
        const entry = SHAPE_META[shape];
        if (!entry) return '';
        const localized = entry[LOCALE] || entry.en;
        return localized[field] || entry.en[field] || '';
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function copyTextFallback(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    }

    async function copyText(text, button) {
        if (!text) return;

        try {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(text);
            } else {
                copyTextFallback(text);
            }
        } catch (error) {
            copyTextFallback(text);
        }

        if (button) {
            const original = button.dataset.defaultLabel || button.textContent;
            const copied = button.dataset.copiedLabel || t('copied');
            button.dataset.defaultLabel = original;
            button.textContent = copied;
            window.clearTimeout(button._copyTimer);
            button._copyTimer = window.setTimeout(() => {
                button.textContent = original;
            }, COPY_RESET_MS);
        }
    }

    function computeSpan(grid) {
        const size = grid.length;
        let minX = size;
        let maxX = -1;
        let minZ = size;
        let maxZ = -1;

        for (let z = 0; z < size; z += 1) {
            for (let x = 0; x < size; x += 1) {
                if (!grid[z][x]) continue;
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minZ = Math.min(minZ, z);
                maxZ = Math.max(maxZ, z);
            }
        }

        if (maxX < 0 || maxZ < 0) return 0;
        return Math.max(maxX - minX + 1, maxZ - minZ + 1);
    }

    function isFilled(shape, x, y, z, radius, thickness) {
        if (shape === 'filled_circle') {
            return Math.sqrt((x * x) + (z * z)) <= radius + 0.25;
        }

        if (shape === 'outline_circle') {
            const distance2d = Math.sqrt((x * x) + (z * z));
            const innerCircle = Math.max(0, radius - Math.max(1, thickness));
            return distance2d <= radius + 0.25 && distance2d > innerCircle - 0.25;
        }

        const distance = Math.sqrt((x * x) + (y * y) + (z * z));
        const outer = distance <= radius + 0.25;
        if (!outer) return false;

        if (shape === 'solid_sphere') return true;
        if (shape === 'upper_dome') return y >= 0;
        if (shape === 'lower_dome') return y <= 0;

        const innerSphere = Math.max(0, radius - Math.max(1, thickness));
        return distance > innerSphere - 0.25;
    }

    function buildGridForLayer(shape, radius, thickness, yValue) {
        const grid = [];
        let count = 0;

        for (let z = -radius; z <= radius; z += 1) {
            const row = [];
            for (let x = -radius; x <= radius; x += 1) {
                const filled = isFilled(shape, x, yValue, z, radius, thickness);
                row.push(filled);
                if (filled) count += 1;
            }
            grid.push(row);
        }

        return {
            y: yValue,
            grid,
            count,
            span: computeSpan(grid)
        };
    }

    function buildShape() {
        const shape = state.shape;
        const radius = state.radius;
        const thickness = state.thickness;
        const layers = [];
        let totalBlocks = 0;
        let widestSpan = 0;

        if (shape === 'filled_circle' || shape === 'outline_circle') {
            const layer = buildGridForLayer(shape, radius, thickness, 0);
            layers.push(layer);
            totalBlocks = layer.count;
            widestSpan = layer.span;
        } else {
            for (let y = radius; y >= -radius; y -= 1) {
                const layer = buildGridForLayer(shape, radius, thickness, y);
                if (layer.count === 0) continue;
                layers.push(layer);
                totalBlocks += layer.count;
                widestSpan = Math.max(widestSpan, layer.span);
            }
        }

        state.layers = layers;
        state.totalBlocks = totalBlocks;
        state.widestSpan = widestSpan;
        state.diameter = radius * 2 + 1;
        state.layerIndex = layers.reduce((bestIndex, layer, index, collection) => {
            if (!collection[bestIndex] || layer.count > collection[bestIndex].count) return index;
            return bestIndex;
        }, 0);
    }

    function buildProjection(mode) {
        const size = state.diameter;
        const projection = Array.from({ length: size }, () => Array(size).fill(-Infinity));

        state.layers.forEach((layer) => {
            const y = layer.y;
            layer.grid.forEach((row, zIndex) => {
                row.forEach((filled, xIndex) => {
                    if (!filled) return;
                    if (mode === 'top') {
                        projection[zIndex][xIndex] = Math.max(projection[zIndex][xIndex], y);
                    } else {
                        projection[state.radius - y][xIndex] = Math.max(projection[state.radius - y][xIndex], state.radius - zIndex);
                    }
                });
            });
        });

        return projection;
    }

    function drawProjection(ctx, projection) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const rows = projection.length;
        const cols = rows ? projection[0].length : 0;
        const cell = Math.floor(Math.min(width / Math.max(1, cols), height / Math.max(1, rows)));
        const drawWidth = cell * cols;
        const drawHeight = cell * rows;
        const offsetX = Math.floor((width - drawWidth) / 2);
        const offsetY = Math.floor((height - drawHeight) / 2);

        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = EMPTY_COLOR;
        ctx.fillRect(0, 0, width, height);

        for (let row = 0; row < rows; row += 1) {
            for (let col = 0; col < cols; col += 1) {
                const value = projection[row][col];
                const x = offsetX + col * cell;
                const y = offsetY + row * cell;

                ctx.fillStyle = value > -Infinity ? (value % 2 === 0 ? FILL_COLOR : FILL_COLOR_ALT) : 'rgba(30, 41, 59, 0.96)';
                ctx.fillRect(x, y, cell, cell);
                ctx.strokeStyle = GRID_COLOR;
                ctx.lineWidth = 1;
                ctx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
            }
        }
    }

    function drawLayerCanvas() {
        const layer = state.layers[state.layerIndex];
        const width = layerCtx.canvas.width;
        const height = layerCtx.canvas.height;
        const size = layer ? layer.grid.length : state.diameter;
        const cell = Math.floor(Math.min(width, height) / Math.max(1, size));
        const drawSize = cell * size;
        const offsetX = Math.floor((width - drawSize) / 2);
        const offsetY = Math.floor((height - drawSize) / 2);

        layerCtx.clearRect(0, 0, width, height);
        layerCtx.fillStyle = EMPTY_COLOR;
        layerCtx.fillRect(0, 0, width, height);

        if (!layer) return;

        layer.grid.forEach((row, zIndex) => {
            row.forEach((filled, xIndex) => {
                const x = offsetX + xIndex * cell;
                const y = offsetY + zIndex * cell;

                layerCtx.fillStyle = filled ? FILL_COLOR : 'rgba(15, 23, 42, 0.9)';
                layerCtx.fillRect(x, y, cell, cell);

                if (xIndex === state.radius || zIndex === state.radius) {
                    layerCtx.fillStyle = filled ? 'rgba(191, 219, 254, 0.22)' : AXIS_COLOR;
                    layerCtx.fillRect(x, y, cell, cell);
                }

                if (filled) {
                    layerCtx.fillStyle = 'rgba(191, 219, 254, 0.24)';
                    layerCtx.fillRect(
                        x + cell * CELL_PADDING,
                        y + cell * CELL_PADDING,
                        cell * (1 - CELL_PADDING * 2),
                        cell * (1 - CELL_PADDING * 2)
                    );
                }

                layerCtx.strokeStyle = GRID_COLOR;
                layerCtx.lineWidth = 1;
                layerCtx.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
            });
        });
    }

    function formatLayerLabel(layer) {
        if (!layer) return t('noLayer');
        if (state.shape === 'filled_circle' || state.shape === 'outline_circle') {
            return `${t('singleLayer')} - ${layer.count} ${t('blocks')}`;
        }
        const sign = layer.y > 0 ? '+' : '';
        return `${t('layer')} ${sign}${layer.y} - ${layer.count} ${t('blocks')}`;
    }

    function buildLayerText(layer) {
        if (!layer) return t('noBlocks');

        const title = state.shape === 'filled_circle' || state.shape === 'outline_circle'
            ? `${shapeText(state.shape, 'label')} | ${t('radius')} ${state.radius}`
            : `${shapeText(state.shape, 'label')} | ${t('radius')} ${state.radius} | y=${layer.y > 0 ? `+${layer.y}` : layer.y}`;
        const lines = layer.grid.map((row) => row.map((filled) => (filled ? '#' : '.')).join(' '));
        return `${title}\n\n${lines.join('\n')}`;
    }

    function buildAllLayersText() {
        return state.layers.map((layer, index) => {
            const layerTitle = state.shape === 'filled_circle' || state.shape === 'outline_circle'
                ? `${t('singleLayer')} ${index + 1}`
                : `${t('layer')} ${layer.y > 0 ? `+${layer.y}` : layer.y}`;
            return `${layerTitle}\n${buildLayerText(layer).split('\n').slice(2).join('\n')}`;
        }).join('\n\n');
    }

    function updateLayerOptions() {
        const currentY = state.layers[state.layerIndex] ? state.layers[state.layerIndex].y : null;
        els.layerSelect.innerHTML = '';

        state.layers.forEach((layer, index) => {
            const option = document.createElement('option');
            option.value = String(index);
            option.textContent = state.shape === 'filled_circle' || state.shape === 'outline_circle'
                ? `${t('singleLayer')} - ${layer.count} ${t('blocks')}`
                : `Y ${layer.y > 0 ? `+${layer.y}` : layer.y} - ${layer.count} ${t('blocks')}`;
            if (layer.y === currentY || index === state.layerIndex) option.selected = true;
            els.layerSelect.appendChild(option);
        });

        els.layerRange.max = String(Math.max(0, state.layers.length - 1));
        els.layerRange.value = String(state.layerIndex);
        els.layerSelect.value = String(state.layerIndex);
        els.prevLayer.disabled = state.layerIndex <= 0;
        els.nextLayer.disabled = state.layerIndex >= state.layers.length - 1;
    }

    function updateSummary() {
        const layer = state.layers[state.layerIndex];
        els.layerLabel.textContent = formatLayerLabel(layer);
        els.layerText.textContent = buildLayerText(layer);
        els.shapeNote.textContent = shapeText(state.shape, 'note');
        els.shapeValue.textContent = shapeText(state.shape, 'label');
        els.radiusValue.textContent = String(state.radius);
        els.diameterValue.textContent = `${state.diameter} ${t('diameterSuffix')}`;
        els.totalBlocksValue.textContent = String(state.totalBlocks);
        els.layerCountValue.textContent = String(state.layers.length);
        els.widestSpanValue.textContent = `${state.widestSpan || 0} ${t('widestSpanSuffix')}`;
        els.currentLayerBlocksValue.textContent = layer ? String(layer.count) : '0';
        els.thicknessField.style.display = state.shape === 'solid_sphere' || state.shape === 'filled_circle' || state.shape === 'upper_dome' || state.shape === 'lower_dome' ? 'none' : '';
    }

    function renderAll() {
        updateLayerOptions();
        updateSummary();
        drawProjection(topCtx, buildProjection('top'));
        drawProjection(frontCtx, buildProjection('front'));
        drawLayerCanvas();
    }

    function setLayerIndex(nextIndex) {
        state.layerIndex = clamp(nextIndex, 0, Math.max(0, state.layers.length - 1));
        renderAll();
    }

    function syncRadius(nextValue) {
        const radius = clamp(Number(nextValue || DEFAULT_RADIUS), 1, 64);
        state.radius = radius;
        els.radiusRange.value = String(radius);
        els.radiusNumber.value = String(radius);
        if (state.thickness > state.radius) {
            state.thickness = state.radius;
            els.thickness.value = String(state.thickness);
        }
        buildShape();
        renderAll();
    }

    function syncThickness(nextValue) {
        state.thickness = clamp(Number(nextValue || DEFAULT_THICKNESS), 1, Math.max(1, state.radius));
        els.thickness.value = String(state.thickness);
        buildShape();
        renderAll();
    }

    function init() {
        els.shape = document.getElementById('sphereShape');
        els.radiusRange = document.getElementById('sphereRadiusRange');
        els.radiusNumber = document.getElementById('sphereRadiusNumber');
        els.thickness = document.getElementById('sphereThickness');
        els.thicknessField = document.getElementById('sphereThicknessField');
        els.layerRange = document.getElementById('sphereLayerRange');
        els.layerSelect = document.getElementById('sphereLayerSelect');
        els.prevLayer = document.getElementById('spherePrevLayer');
        els.nextLayer = document.getElementById('sphereNextLayer');
        els.layerLabel = document.getElementById('sphereLayerLabel');
        els.layerText = document.getElementById('sphereLayerText');
        els.copyCurrent = document.getElementById('sphereCopyCurrent');
        els.copyAll = document.getElementById('sphereCopyAll');
        els.shapeNote = document.getElementById('sphereShapeNote');
        els.shapeValue = document.getElementById('sphereShapeValue');
        els.radiusValue = document.getElementById('sphereRadiusValue');
        els.diameterValue = document.getElementById('sphereDiameterValue');
        els.totalBlocksValue = document.getElementById('sphereTotalBlocksValue');
        els.layerCountValue = document.getElementById('sphereLayerCountValue');
        els.widestSpanValue = document.getElementById('sphereWidestSpanValue');
        els.currentLayerBlocksValue = document.getElementById('sphereCurrentLayerBlocksValue');

        topCtx = document.getElementById('sphereTopCanvas').getContext('2d');
        frontCtx = document.getElementById('sphereFrontCanvas').getContext('2d');
        layerCtx = document.getElementById('sphereLayerCanvas').getContext('2d');

        els.shape.addEventListener('change', () => {
            state.shape = els.shape.value;
            buildShape();
            renderAll();
        });

        els.radiusRange.addEventListener('input', () => syncRadius(els.radiusRange.value));
        els.radiusNumber.addEventListener('input', () => syncRadius(els.radiusNumber.value));
        els.thickness.addEventListener('change', () => syncThickness(els.thickness.value));

        els.layerRange.addEventListener('input', () => setLayerIndex(Number(els.layerRange.value)));
        els.layerSelect.addEventListener('change', () => setLayerIndex(Number(els.layerSelect.value)));
        els.prevLayer.addEventListener('click', () => setLayerIndex(state.layerIndex - 1));
        els.nextLayer.addEventListener('click', () => setLayerIndex(state.layerIndex + 1));

        els.copyCurrent.addEventListener('click', () => copyText(buildLayerText(state.layers[state.layerIndex]), els.copyCurrent));
        els.copyAll.addEventListener('click', () => copyText(buildAllLayersText(), els.copyAll));

        buildShape();
        renderAll();
    }

    document.addEventListener('DOMContentLoaded', init);
}());
