/* Shared voxel preview. Uses the generator's exact occupied cells. */
(function () {
    'use strict';
    const FACES = [
        { n: [1, 0, 0], v: [[.5,-.5,.5],[.5,-.5,-.5],[.5,.5,-.5],[.5,.5,.5]] },
        { n: [-1, 0, 0], v: [[-.5,-.5,-.5],[-.5,-.5,.5],[-.5,.5,.5],[-.5,.5,-.5]] },
        { n: [0, 1, 0], v: [[-.5,.5,.5],[.5,.5,.5],[.5,.5,-.5],[-.5,.5,-.5]] },
        { n: [0, -1, 0], v: [[-.5,-.5,-.5],[.5,-.5,-.5],[.5,-.5,.5],[-.5,-.5,.5]] },
        { n: [0, 0, 1], v: [[-.5,-.5,.5],[.5,-.5,.5],[.5,.5,.5],[-.5,.5,.5]] },
        { n: [0, 0, -1], v: [[.5,-.5,-.5],[-.5,-.5,-.5],[-.5,.5,-.5],[.5,.5,-.5]] }
    ];
    const TRIANGLES = [0, 1, 2, 0, 2, 3];

    // Only exposed faces are emitted; no meshes or edges per individual block.
    function buildSurface(layers, radius, selectedY, mode) {
        const visible = layers.filter(layer => mode === 'all' ||
            (mode === 'slice' ? layer.y === selectedY : layer.y <= selectedY));
        const byY = new Map(visible.map(layer => [layer.y, layer.grid]));
        const occupied = (x, y, z) => Boolean(byY.get(y)?.[z]?.[x]);
        let faceCount = 0;
        function visit(callback) {
            for (const layer of visible) {
                for (let z = 0; z < layer.grid.length; z++) {
                    for (let x = 0; x < layer.grid[z].length; x++) {
                        if (!layer.grid[z][x]) continue;
                        for (const face of FACES) {
                            if (!occupied(x + face.n[0], layer.y + face.n[1], z + face.n[2])) {
                                callback(x, layer.y, z, face);
                            }
                        }
                    }
                }
            }
        }
        visit(() => faceCount++);
        const positions = new Float32Array(faceCount * 18);
        const normals = new Float32Array(faceCount * 18);
        const colors = new Float32Array(faceCount * 18);
        const uvs = new Float32Array(faceCount * 12);
        const corners = [[0,0],[1,0],[1,1],[0,1]];
        let p = 0;
        let u = 0;
        visit((x, y, z, face) => {
            const highlighted = mode === 'cutaway' && y === selectedY;
            const tint = highlighted ? [0.03, 0.45, 0.37] : [0.10, 0.32, 0.72];
            for (const index of TRIANGLES) {
                const vertex = face.v[index];
                positions[p] = x - radius + vertex[0];
                positions[p + 1] = y + vertex[1];
                positions[p + 2] = z - radius + vertex[2];
                normals.set(face.n, p);
                colors.set(tint, p);
                p += 3;
                uvs.set(corners[index], u);
                u += 2;
            }
        });
        return { positions, normals, colors, uvs, faceCount };
    }

    function create(container, onError) {
        const THREE = window.THREE;
        if (!THREE || !THREE.OrbitControls) throw new Error('3D library unavailable');
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.outputEncoding = THREE.sRGBEncoding;
        container.appendChild(renderer.domElement);
        renderer.domElement.setAttribute('aria-hidden', 'true');
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(38, 1, .1, 2000);
        const controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = false;
        controls.enablePan = false;
        controls.mouseButtons.RIGHT = THREE.MOUSE.ROTATE;
        scene.add(new THREE.HemisphereLight(0xe8f4ff, 0x44516d, .85));
        const light = new THREE.DirectionalLight(0xffffff, .8);
        light.position.set(1, 2, 3);
        scene.add(light);

        // A shared tiny texture marks block boundaries without an edge mesh.
        const tile = document.createElement('canvas');
        tile.width = tile.height = 64;
        const ctx = tile.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 64, 64);
        ctx.strokeStyle = '#708bad';
        ctx.lineWidth = 2;
        ctx.strokeRect(1, 1, 62, 62);
        const texture = new THREE.CanvasTexture(tile);
        const material = new THREE.MeshLambertMaterial({ vertexColors: true, map: texture });
        let mesh = null;
        let grid = null;
        let active = false;
        let disposed = false;
        let frame = 0;
        let currentLayers = null;
        let radius = 7;
        let currentY = null;
        let currentMode = null;
        let fitPending = true;

        function requestRender() {
            if (disposed || !active || document.hidden || frame) return;
            frame = requestAnimationFrame(() => {
                frame = 0;
                if (!disposed && active && !document.hidden) renderer.render(scene, camera);
            });
        }
        function resize() {
            const width = container.clientWidth;
            const height = container.clientHeight;
            if (!width || !height) return;
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            if (fitPending) resetCamera();
            requestRender();
        }
        function resetCamera() {
            if (!container.clientWidth || !container.clientHeight) {
                fitPending = true;
                return;
            }
            fitPending = false;
            const bounds = new THREE.Box3();
            // Frame the whole original shape, even while inspecting a single slice.
            const ys = currentLayers?.map(layer => layer.y) || [-radius, radius];
            const low = Math.min(...ys);
            const high = Math.max(...ys);
            bounds.min.set(-radius - .5, low - .5, -radius - .5);
            bounds.max.set(radius + .5, high + .5, radius + .5);
            const center = bounds.getCenter(new THREE.Vector3());
            const sphereRadius = bounds.getSize(new THREE.Vector3()).length() / 2;
            const vertical = THREE.MathUtils.degToRad(camera.fov / 2);
            const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
            const distance = sphereRadius / Math.sin(Math.min(vertical, horizontal)) * 1.08;
            controls.target.copy(center);
            camera.position.copy(center).add(new THREE.Vector3(1, .8, 1.2).normalize().multiplyScalar(distance));
            controls.minDistance = Math.max(1, sphereRadius * .3);
            controls.maxDistance = distance * 4;
            camera.near = .1;
            camera.far = Math.max(2000, distance * 6);
            camera.updateProjectionMatrix();
            controls.update();
            requestRender();
        }
        function update(layers, nextRadius, selectedY, mode) {
            if (disposed) return;
            const shapeChanged = layers !== currentLayers;
            const surfaceChanged = shapeChanged || mode !== currentMode ||
                (mode !== 'all' && selectedY !== currentY);
            currentLayers = layers;
            radius = nextRadius;
            currentY = selectedY;
            currentMode = mode;
            if (surfaceChanged) {
                const surface = buildSurface(layers, radius, selectedY, mode);
                const geometry = new THREE.BufferGeometry();
                geometry.setAttribute('position', new THREE.BufferAttribute(surface.positions, 3));
                geometry.setAttribute('normal', new THREE.BufferAttribute(surface.normals, 3));
                geometry.setAttribute('color', new THREE.BufferAttribute(surface.colors, 3));
                geometry.setAttribute('uv', new THREE.BufferAttribute(surface.uvs, 2));
                geometry.computeBoundingSphere();
                if (mesh) {
                    mesh.geometry.dispose();
                    scene.remove(mesh);
                }
                mesh = new THREE.Mesh(geometry, material);
                scene.add(mesh);
            }
            if (shapeChanged) {
                if (grid) {
                    grid.geometry.dispose();
                    grid.material.dispose();
                    scene.remove(grid);
                }
                const size = (radius * 2 + 1) * 1.5;
                grid = new THREE.GridHelper(size, 12, 0x607da4, 0x354963);
                grid.position.y = Math.min(...layers.map(layer => layer.y)) - .55;
                grid.material.transparent = true;
                grid.material.opacity = .45;
                scene.add(grid);
                fitPending = true;
                resize();
            }
            requestRender();
        }
        function setActive(value) {
            active = value;
            controls.enabled = value;
            if (!value && frame) {
                cancelAnimationFrame(frame);
                frame = 0;
            }
            if (value) resize();
        }
        function zoom(factor) {
            camera.position.sub(controls.target).multiplyScalar(factor);
            camera.position.clampLength(controls.minDistance, controls.maxDistance).add(controls.target);
            controls.update();
            requestRender();
        }
        function onContextLost(event) {
            event.preventDefault();
            dispose();
            onError();
        }
        function dispose() {
            if (disposed) return;
            disposed = true;
            cancelAnimationFrame(frame);
            observer.disconnect();
            document.removeEventListener('visibilitychange', requestRender);
            renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
            controls.dispose();
            mesh?.geometry.dispose();
            if (grid) {
                grid.geometry.dispose();
                grid.material.dispose();
            }
            material.dispose();
            texture.dispose();
            renderer.dispose();
            renderer.domElement.remove();
        }
        const observer = new ResizeObserver(resize);
        observer.observe(container);
        controls.addEventListener('change', requestRender);
        document.addEventListener('visibilitychange', requestRender);
        renderer.domElement.addEventListener('webglcontextlost', onContextLost);
        return { update, setActive, zoom, resetCamera, dispose };
    }
    window.SpherePreview = { create, buildSurface };
}());
