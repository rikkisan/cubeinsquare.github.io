
(function () {
    const lang = document.documentElement.lang || 'en';
    const copy = {
        en: { noteFilled:'Use filled circles for plazas, pads, or tower floors.', noteOutline:'Use outline circles for borders and crisp round frames.', noteRing:'Rings are good when a border needs thickness and weight.', noteArch:'Arches help when you care about a side profile more than a footprint.', noteDome:'Use the dome profile as a stack of radii for roofs and caps.', width:'Width', cells:'Blocks', layers:'Layers', copied:'Copied' },
        ru: { noteFilled:'Заполненный круг подходит для площадей, платформ и полов башен.', noteOutline:'Контур круга хорош для границ и чистых округлых рамок.', noteRing:'Кольца полезны, когда границе нужен визуальный вес.', noteArch:'Арки удобны, когда важен боковой профиль, а не полный отпечаток.', noteDome:'Профиль купола лучше читать как стек радиусов для крыш.', width:'Ширина', cells:'Блоки', layers:'Слои', copied:'Скопировано' },
        fr: { noteFilled:'Les cercles pleins sont utiles pour places, plateformes et sols.', noteOutline:'Les contours de cercle marchent bien pour des cadres ronds nets.', noteRing:'Les anneaux sont utiles quand une bordure a besoin d’épaisseur.', noteArch:'Les arches servent quand le profil compte plus que l’empreinte.', noteDome:'Le profil de dôme se lit comme une pile de rayons pour les toits.', width:'Largeur', cells:'Blocs', layers:'Couches', copied:'Copié' },
        de: { noteFilled:'Gefüllte Kreise eignen sich für Plätze, Plattformen und Turmböden.', noteOutline:'Kreisumrisse sind gut für Ränder und saubere runde Rahmen.', noteRing:'Ringe helfen, wenn eine Grenze sichtbares Gewicht braucht.', noteArch:'Bögen sind sinnvoll, wenn das Seitenprofil wichtiger ist als die Grundfläche.', noteDome:'Das Kuppelprofil liest man am besten als Radienstapel für Dächer.', width:'Breite', cells:'Blöcke', layers:'Lagen', copied:'Kopiert' }
    }[lang] || { noteFilled:'', noteOutline:'', noteRing:'', noteArch:'', noteDome:'', width:'Width', cells:'Blocks', layers:'Layers', copied:'Copied' };

    const mode = document.getElementById('cdp-mode');
    const radius = document.getElementById('cdp-radius');
    const thickness = document.getElementById('cdp-thickness');
    const canvas = document.getElementById('cdp-canvas');
    const output = document.getElementById('cdp-output');
    const stats = document.getElementById('cdp-stats');
    const stack = document.getElementById('cdp-stack');
    const copyButton = document.getElementById('cdp-copy');
    const ctx = canvas.getContext('2d');

    function gridForMode() {
        const r = Math.max(1, Number(radius.value || 1));
        const t = Math.max(1, Number(thickness.value || 1));
        if (mode.value === 'arch' || mode.value === 'dome_profile') {
            const rows = [];
            for (let y = r; y >= 0; y -= 1) {
                const span = Math.round(Math.sqrt(Math.max(0, r * r - y * y)));
                const row = [];
                for (let x = -r; x <= r; x += 1) {
                    const on = mode.value === 'arch'
                        ? Math.abs(Math.abs(x) - span) <= 0.5 || (y === 0 && Math.abs(x) <= span)
                        : Math.abs(x) <= span;
                    row.push(on ? 1 : 0);
                }
                rows.push({ y, span, row });
            }
            return rows;
        }
        const rows = [];
        for (let y = r; y >= -r; y -= 1) {
            const row = [];
            for (let x = -r; x <= r; x += 1) {
                const dist = Math.sqrt(x * x + y * y);
                let on = false;
                if (mode.value === 'filled_circle') on = dist <= r + 0.15;
                if (mode.value === 'outline_circle') on = Math.abs(dist - r) <= 0.55;
                if (mode.value === 'ring') on = dist <= r + 0.15 && dist >= Math.max(0, r - t) - 0.35;
                row.push(on ? 1 : 0);
            }
            rows.push({ y, span: row.filter(Boolean).length, row });
        }
        return rows;
    }

    function draw(rows) {
        const size = rows[0]?.row.length || 1;
        const cell = Math.max(8, Math.floor((canvas.width - 32) / size));
        const actual = cell * size;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f1429';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        const startX = Math.floor((canvas.width - actual) / 2);
        const startY = Math.floor((canvas.height - actual) / 2);
        rows.forEach((line, rowIndex) => {
            line.row.forEach((value, columnIndex) => {
                ctx.fillStyle = value ? '#74a1ff' : 'rgba(116,161,255,0.08)';
                ctx.fillRect(startX + columnIndex * cell, startY + rowIndex * cell, cell - 1, cell - 1);
            });
        });
    }

    function update() {
        const rows = gridForMode();
        draw(rows);
        output.textContent = rows.map((line) => line.row.map((value) => value ? '#' : '.').join('')).join('\n');
        const filled = rows.reduce((sum, line) => sum + line.row.filter(Boolean).length, 0);
        const width = rows[0]?.row.length || 0;
        const note = mode.value === 'filled_circle' ? copy.noteFilled : mode.value === 'outline_circle' ? copy.noteOutline : mode.value === 'ring' ? copy.noteRing : mode.value === 'arch' ? copy.noteArch : copy.noteDome;
        stats.innerHTML = [
            [copy.width, width],
            [copy.cells, filled],
            [copy.layers, rows.length]
        ].map(([label, value]) => `<div class="sphere-stat-card"><strong>${value}</strong><span>${label}</span></div>`).join('');
        stats.innerHTML += `<div class="sphere-stat-card"><strong>${mode.options[mode.selectedIndex].text}</strong><span>${note}</span></div>`;
        stack.innerHTML = mode.value === 'dome_profile'
            ? rows.map((line, index) => `<div class="planner-stack-row"><span>Y +${line.y}</span><strong>${line.span * 2 + 1} blocks</strong></div>`).join('')
            : '';
    }

    copyButton.addEventListener('click', async () => {
        await navigator.clipboard.writeText(output.textContent);
        const original = copyButton.textContent;
        copyButton.textContent = copyButton.dataset.copiedLabel || copy.copied;
        setTimeout(() => { copyButton.textContent = original; }, 1200);
    });
    [mode, radius, thickness].forEach((field) => field.addEventListener('input', update));
    update();
})();
