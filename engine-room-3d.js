// Engine Room — 3D diorama of the oil economy (companion to the 2D drawing in engine-room.js).
// A museum turntable: drag to spin, click a part to see what it is.
// three.js is loaded on demand from jsDelivr, only when the 3D view is opened.

window.EngineRoom3D = (function () {
    const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';
    let THREE = null;

    // Fixed doctrine palette, so the diorama reads the same with lights on or off
    const C = {
        ink: '#1E2023', paper: '#F1E8D3', card: '#F8F1E1', blue: '#2E7DB5', mustard: '#DDA22C',
        red: '#B5392A', green: '#2F6A3E', steel: '#A7B3B8', midnight: '#252660', teal: '#1E6A5E',
        soil1: '#5C4630', soil2: '#7A5C3E', soil3: '#9C7A52', grass: '#55703F', link: '#4B4840'
    };

    async function mount(container, { onPick }) {
        if (!THREE) THREE = await import(THREE_URL);
        const T = THREE;
        if (document.fonts && document.fonts.ready) await document.fonts.ready;

        // ---------- Renderer, camera, lights ----------
        const renderer = new T.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = T.PCFSoftShadowMap;
        container.appendChild(renderer.domElement);

        const scene = new T.Scene();
        const camera = new T.PerspectiveCamera(34, 1, 0.1, 200);
        const cam = { dist: 30, elev: 0.32 };
        const placeCamera = () => {
            camera.position.set(0, Math.sin(cam.elev) * cam.dist, Math.cos(cam.elev) * cam.dist);
            camera.lookAt(0, -0.6, 0);
        };
        placeCamera();

        scene.add(new T.HemisphereLight(0xfff6e2, 0x3a3a40, 1.5));
        const sun = new T.DirectionalLight(0xffffff, 2.4);
        sun.position.set(9, 16, 12);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 });
        scene.add(sun);

        const world = new T.Group();
        scene.add(world);

        // ---------- Helpers ----------
        const pickables = [], byTerm = {};
        const disposables = [];
        const mat = (color, o = {}) => { const m = new T.MeshStandardMaterial({ color, roughness: 0.62, metalness: 0.08, ...o }); disposables.push(m); return m; };
        const glass = (color, opacity = 0.28) => { const m = new T.MeshPhysicalMaterial({ color, transparent: true, opacity, roughness: 0.08, metalness: 0, depthWrite: false }); disposables.push(m); return m; };
        const mesh = (geo, material, pos, parent = world) => {
            disposables.push(geo);
            const m = new T.Mesh(geo, material);
            if (pos) m.position.set(...pos);
            m.castShadow = true; m.receiveShadow = true;
            parent.add(m);
            return m;
        };
        const reg = (obj, term) => obj.traverse(o => {
            if (o.isMesh || o.isSprite) {
                o.userData.term = term;
                pickables.push(o);
                (byTerm[term] = byTerm[term] || []).push(o);
            }
        });

        // Museum placard labels (cream card, ink text)
        const label = (text, pos, term, size = 0.62) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const font = `700 64px "Archivo", Arial, sans-serif`;
            ctx.font = font;
            const w = Math.ceil(ctx.measureText(text.toUpperCase()).width) + 48;
            canvas.width = w; canvas.height = 96;
            ctx.font = font;
            ctx.fillStyle = 'rgba(248,241,225,0.94)';
            ctx.fillRect(0, 0, w, 96);
            ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(2, 2, w - 4, 92);
            ctx.fillStyle = C.ink; ctx.textBaseline = 'middle';
            ctx.fillText(text.toUpperCase(), 24, 50);
            const tex = new T.CanvasTexture(canvas);
            tex.colorSpace = T.SRGBColorSpace;
            const m = new T.SpriteMaterial({ map: tex, depthTest: true });
            disposables.push(tex, m);
            const s = new T.Sprite(m);
            s.scale.set(size * w / 96, size, 1);
            s.position.set(...pos);
            world.add(s);
            if (term) reg(s, term);
            return s;
        };

        // Value readout sprite, redrawn only when the number changes
        const readout = (pos, color) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256; canvas.height = 96;
            const ctx = canvas.getContext('2d');
            const tex = new T.CanvasTexture(canvas);
            tex.colorSpace = T.SRGBColorSpace;
            const m = new T.SpriteMaterial({ map: tex, depthTest: false });
            disposables.push(tex, m);
            const s = new T.Sprite(m);
            s.scale.set(2.2, 0.82, 1);
            s.position.set(...pos);
            s.renderOrder = 10;
            world.add(s);
            let last = null;
            return v => {
                const text = Math.round(v).toLocaleString('en-US');
                if (text === last) return;
                last = text;
                ctx.clearRect(0, 0, 256, 96);
                ctx.fillStyle = C.ink;
                ctx.fillRect(28, 8, 200, 80);
                ctx.font = `700 54px "Courier Prime", "Courier New", monospace`;
                ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(text, 128, 50);
                tex.needsUpdate = true;
            };
        };

        // ---------- Plinth and ground (cutaway) ----------
        mesh(new T.CylinderGeometry(11.2, 11.6, 1, 64), mat(C.ink), [0, -4.8, 0]);
        mesh(new T.TorusGeometry(11.25, 0.12, 8, 96), mat(C.mustard, { metalness: 0.5, roughness: 0.3 }), [0, -4.3, 0]).rotation.x = Math.PI / 2;
        const layers = [[-4.3, -2.9, C.soil1], [-2.9, -1.2, C.soil2], [-1.2, -0.12, C.soil3], [-0.12, 0, C.grass]];
        layers.forEach(([y0, y1, col]) => mesh(new T.BoxGeometry(20, y1 - y0, 6.2), mat(col, { roughness: 0.95 }), [0, (y0 + y1) / 2, -2.7]));
        mesh(new T.BoxGeometry(20, 0.3, 5.4), mat(C.soil1, { roughness: 0.95 }), [0, -4.15, 3.1]);
        // Cut edge: back wall of the open trench
        label('Above ground', [-8.2, 0.55, 0.6], null, 0.42);
        label('Below ground', [-8.2, -0.75, 0.6], null, 0.42);

        // ---------- Clouds (model edges) ----------
        const cloud = (x, y, z) => {
            const g = new T.Group();
            [[0, 0, 0, 0.75], [0.7, 0.15, 0, 0.6], [-0.7, 0.1, 0, 0.55], [0.25, 0.55, 0, 0.55], [-0.3, 0.45, 0.15, 0.5]].forEach(([dx, dy, dz, r]) =>
                mesh(new T.SphereGeometry(r, 20, 14), mat('#FFFFFF', { roughness: 1 }), [dx, dy, dz], g));
            g.position.set(x, y, z);
            world.add(g);
            reg(g, 'cloud');
            return g;
        };

        // ---------- Pipes with flowing particles and ball valves ----------
        const pipes = [];
        const pipe = (x0, x1, y, z, color, term, valveX) => {
            const len = Math.abs(x1 - x0);
            const tube = mesh(new T.CylinderGeometry(0.36, 0.36, len, 24, 1, true), glass(C.steel, 0.32), [(x0 + x1) / 2, y, z]);
            tube.rotation.z = Math.PI / 2;
            tube.castShadow = false;
            reg(tube, term);
            [x0, x1].forEach(x => { const f = mesh(new T.TorusGeometry(0.38, 0.07, 8, 24), mat(C.steel, { metalness: 0.6, roughness: 0.3 }), [x, y, z]); f.rotation.y = Math.PI / 2; });
            // particles
            const parts = [];
            for (let i = 0; i < 11; i++) {
                const p = mesh(new T.SphereGeometry(0.17, 12, 10), mat(color, { emissive: color, emissiveIntensity: 0.25 }), [x0, y, z]);
                p.castShadow = false;
                p.userData.u = i / 11;
                reg(p, term);
                parts.push(p);
            }
            // ball valve: body + quarter-turn handle (crosswise = closed, along the pipe = open)
            const valve = new T.Group();
            mesh(new T.SphereGeometry(0.55, 20, 16), mat(C.ink, { metalness: 0.4, roughness: 0.4 }), [0, 0, 0], valve);
            mesh(new T.CylinderGeometry(0.08, 0.08, 0.55, 10), mat(C.ink), [0, 0.65, 0], valve);
            const handle = new T.Group();
            mesh(new T.BoxGeometry(1.5, 0.14, 0.22), mat(color, { roughness: 0.4 }), [0, 0, 0], handle);
            handle.position.y = 0.95;
            valve.add(handle);
            valve.position.set(valveX, y, z);
            world.add(valve);
            reg(valve, 'faucet');
            reg(handle, term);
            pipes.push({ x0, x1, y, z, parts, handle, flow: 0 });
            return pipes[pipes.length - 1];
        };

        // ---------- Stocks: glass tanks with liquid ----------
        const tank = (x, y0, z, r, h, color, term) => {
            const g = new T.Group();
            const shell = mesh(new T.CylinderGeometry(r, r, h, 40, 1, true), glass('#DDE6EA', 0.3), [0, h / 2, 0], g);
            shell.castShadow = false;
            mesh(new T.TorusGeometry(r, 0.08, 8, 48), mat(C.ink), [0, h, 0], g).rotation.x = Math.PI / 2;
            mesh(new T.CylinderGeometry(r + 0.1, r + 0.2, 0.25, 40), mat(C.ink), [0, 0, 0], g);
            const fill = mesh(new T.CylinderGeometry(r - 0.08, r - 0.08, 1, 40), mat(color, { roughness: 0.3, emissive: color, emissiveIntensity: 0.08 }), [0, 0.5, 0], g);
            g.position.set(x, y0, z);
            world.add(g);
            reg(g, term);
            return { fill, h };
        };

        const capital = tank(0, 0.05, -1.5, 1.55, 3.3, C.blue, 'capital');
        const resource = tank(-4, -3.95, 2.3, 1.95, 3.2, C.mustard, 'resource');
        const capRead = readout([0, 4.15, -1.5], C.paper);
        const resRead = readout([-4, -0.2, 2.3], C.mustard);
        label('Capital', [0, 4.95, -1.5], 'capital', 0.5);
        label('Resource', [-4, -4.55, 4.4], 'resource', 0.5);

        cloud(-9.3, 1.75, -1.5);
        cloud(9.3, 1.75, -1.5);
        cloud(8.9, -2.3, 2.3);
        const inv = pipe(-8.4, -1.6, 1.75, -1.5, C.green, 'investment', -4.8);
        const dep = pipe(1.6, 8.4, 1.75, -1.5, C.red, 'depreciation', 4.8);
        const ext = pipe(-2.05, 7.9, -2.3, 2.3, C.mustard, 'extraction', 2.6);
        label('Investment', [-4.8, 3.35, -1.5], 'investment', 0.42);
        label('Depreciation', [4.8, 3.35, -1.5], 'depreciation', 0.42);
        label('Extraction', [2.6, -0.95, 2.3], 'extraction', 0.42);

        // ---------- Pumpjacks: one per 10 units of capital (count, don't scale) ----------
        const jacks = [];
        for (let row = 0; row < 2; row++) {
            for (let i = 0; i < 10; i++) {
                const g = new T.Group();
                mesh(new T.BoxGeometry(1.1, 0.12, 0.42), mat(C.ink), [0, 0.06, 0], g);
                mesh(new T.BoxGeometry(0.09, 0.85, 0.09), mat(C.steel, { metalness: 0.5 }), [-0.1, 0.5, 0.12], g);
                mesh(new T.BoxGeometry(0.09, 0.85, 0.09), mat(C.steel, { metalness: 0.5 }), [-0.1, 0.5, -0.12], g);
                const beam = new T.Group();
                mesh(new T.BoxGeometry(1.35, 0.1, 0.12), mat(C.ink), [0, 0, 0], beam);
                mesh(new T.BoxGeometry(0.2, 0.38, 0.15), mat(C.red), [0.68, -0.1, 0], beam);
                mesh(new T.BoxGeometry(0.22, 0.22, 0.22), mat(C.steel), [-0.6, -0.12, 0], beam);
                beam.position.set(-0.1, 0.95, 0);
                g.add(beam);
                g.position.set(-8.1 + i * 1.8 + row * 0.9, 0, -3.7 - row * 1.35);
                g.visible = false;
                world.add(g);
                reg(g, 'capital');
                jacks.push({ g, beam, phase: Math.random() * Math.PI * 2 });
            }
        }

        // ---------- Converters and information links ----------
        const conv = (name, pos, term) => {
            const s = mesh(new T.SphereGeometry(0.3, 18, 14), mat(C.card), pos);
            reg(s, term);
            label(name, [pos[0], pos[1] + 0.62, pos[2]], term, 0.4);
        };
        conv('Growth goal', [-3, 4.6, -1.5], 'growth-goal');
        conv('Capital lifetime', [6.6, 4.0, -1.5], 'lifetime');
        conv('Profit', [-6.3, 0.9, 1.6], 'profit');
        conv('Price', [-8.6, 2.7, 1.4], 'price');
        conv('Yield per capital', [-0.9, -0.45, 3.2], 'yield');

        const link = (a, ctrl, b, term) => {
            const curve = new T.QuadraticBezierCurve3(new T.Vector3(...a), new T.Vector3(...ctrl), new T.Vector3(...b));
            const tube = mesh(new T.TubeGeometry(curve, 32, 0.045, 6, false), mat(C.link), null);
            tube.castShadow = false;
            const tip = mesh(new T.ConeGeometry(0.13, 0.36, 10), mat(C.link), b);
            const dir = curve.getTangent(1);
            tip.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir);
            reg(tube, term); reg(tip, term);
        };
        link([-3, 4.3, -1.5], [-4.3, 4.6, -1.5], [-4.8, 3.0, -1.5], 'growth-goal');
        link([-6.2, 1.2, 1.5], [-6, 2.4, 0], [-5.05, 2.55, -1.3], 'profit');
        link([-8.3, 2.5, 1.4], [-7.6, 1.5, 1.6], [-6.6, 1.0, 1.6], 'price');
        link([0.9, 0.3, -0.2], [2.4, 0.6, 1.7], [2.6, -1.25, 2.3], 'extraction');
        link([2.2, -1.6, 2.5], [-2.5, 1.6, 2.6], [-6.0, 0.8, 1.7], 'profit');
        link([-2.4, -0.9, 2.9], [-1.9, -0.3, 3.2], [-1.25, -0.45, 3.2], 'yield');
        link([-0.55, -0.6, 3.2], [1.4, -0.6, 3.1], [2.25, -1.55, 2.6], 'yield');
        link([1.2, 3.3, -1.5], [3.2, 4.6, -1.5], [4.6, 3.0, -1.5], 'depreciation');
        link([6.3, 3.8, -1.5], [5.7, 3.7, -1.5], [5.0, 3.0, -1.5], 'lifetime');

        // ---------- Loop rings ----------
        const loops = [];
        const loop = (letter, color, pos, term) => {
            const ring = mesh(new T.TorusGeometry(0.62, 0.11, 12, 40), mat(color, { roughness: 0.35, emissive: color, emissiveIntensity: 0.2 }), pos);
            reg(ring, term);
            label(letter, pos, term, 0.55);
            loops.push(ring);
        };
        loop('R', C.red, [-4.6, 0.9, 0.6], 'reinforcing');
        loop('B', C.blue, [2.9, 3.6, -0.6], 'balancing');
        loop('B', C.blue, [0.6, -1.5, 3.6], 'balancing');

        // ---------- Interaction: drag to spin, click to pick ----------
        const el = renderer.domElement;
        el.style.touchAction = 'pan-y';
        el.style.cursor = 'grab';
        let drag = null, lastInteract = -1e9;
        let spin = -0.25, swayT = 0; // resting angle set by the visitor; idle sway around it
        const raycaster = new T.Raycaster(), ndc = new T.Vector2();
        el.addEventListener('pointerdown', e => {
            drag = { x: e.clientX, y: e.clientY, moved: 0, id: e.pointerId };
            spin = world.rotation.y; swayT = 0; // continue from the current angle, no jump
            el.setPointerCapture(e.pointerId);
            el.style.cursor = 'grabbing';
        });
        el.addEventListener('pointermove', e => {
            if (!drag) return;
            const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
            drag.moved += Math.abs(dx) + Math.abs(dy);
            drag.x = e.clientX; drag.y = e.clientY;
            spin += dx * 0.009;
            swayT = 0;
            world.rotation.y = spin;
            if (e.pointerType === 'mouse') { cam.elev = Math.max(0.05, Math.min(0.75, cam.elev + dy * 0.004)); placeCamera(); }
            lastInteract = performance.now();
        });
        const end = e => {
            if (!drag) return;
            el.style.cursor = 'grab';
            if (drag.moved < 6) {
                const r = el.getBoundingClientRect();
                ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
                raycaster.setFromCamera(ndc, camera);
                const hit = raycaster.intersectObjects(pickables, false).find(h => h.object.userData.term);
                if (hit && onPick) onPick(hit.object.userData.term);
            }
            drag = null;
            lastInteract = performance.now();
        };
        el.addEventListener('pointerup', end);
        el.addEventListener('pointercancel', () => { drag = null; });

        // ---------- Highlight ----------
        const glowColor = new T.Color(C.mustard);
        function highlight(term) {
            pickables.forEach(o => {
                if (!o.isMesh || !o.material.emissive) return;
                if (o.userData.baseEmissive === undefined) {
                    o.userData.baseEmissive = o.material.emissive.clone();
                    o.userData.baseIntensity = o.material.emissiveIntensity;
                }
                if (o.userData.term === term) { o.material.emissive.copy(glowColor); o.material.emissiveIntensity = 0.75; }
                else { o.material.emissive.copy(o.userData.baseEmissive); o.material.emissiveIntensity = o.userData.baseIntensity; }
            });
        }

        // ---------- State from the simulation ----------
        const frame = { capital: 5, capMax: 50, resource: 1000, r0: 1000, investment: 0, depreciation: 0, extraction: 0, flowMax: 1 };
        function update(f) { Object.assign(frame, f); }

        // ---------- Resize and loop ----------
        const resize = () => {
            const w = container.clientWidth, h = container.clientHeight;
            if (!w || !h) return;
            renderer.setSize(w, h, false);
            renderer.domElement.style.width = w + 'px';
            renderer.domElement.style.height = h + 'px';
            camera.aspect = w / h;
            cam.dist = w < 560 ? 40 : 30;
            placeCamera();
            camera.updateProjectionMatrix();
        };
        const ro = new ResizeObserver(resize);
        ro.observe(container);
        resize();

        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        let raf = null, prev = performance.now(), disposed = false;
        const loopFn = now => {
            if (!container.isConnected) return dispose();
            const dt = Math.min(0.05, (now - prev) / 1000);
            prev = now;

            if (!reduce && !drag && now - lastInteract > 3500) swayT += dt * 0.35;
            world.rotation.y = spin + Math.sin(swayT) * 0.45;

            // tanks
            const capF = Math.min(1, frame.capital / frame.capMax);
            capital.fill.scale.y = Math.max(0.001, capF * capital.h);
            capital.fill.position.y = (capF * capital.h) / 2 + 0.12;
            const resF = Math.max(0, Math.min(1, frame.resource / frame.r0));
            resource.fill.scale.y = Math.max(0.001, resF * resource.h);
            resource.fill.position.y = (resF * resource.h) / 2 + 0.12;
            capRead(frame.capital);
            resRead(frame.resource);

            // pipes: particle speed and size follow the flow; valve handle turns open
            [[inv, frame.investment], [dep, frame.depreciation], [ext, frame.extraction]].forEach(([p, v]) => {
                const f = Math.min(1, v / frame.flowMax);
                const target = Math.PI / 2 * (1 - f);
                p.handle.rotation.y += (target - p.handle.rotation.y) * Math.min(1, dt * 8);
                p.parts.forEach(pt => {
                    pt.visible = v > 0.05;
                    if (!reduce) pt.userData.u = (pt.userData.u + dt * (0.04 + f * 0.5)) % 1;
                    pt.position.x = p.x0 + (p.x1 - p.x0) * pt.userData.u;
                    pt.scale.setScalar(0.45 + f * 0.9);
                });
            });

            // pumpjacks: count = capital / 10, nod speed = yield per unit capital
            const count = Math.min(jacks.length, Math.round(frame.capital / 10));
            const yieldPer = frame.capital > 0.5 ? frame.extraction / frame.capital : 0;
            jacks.forEach((j, i) => {
                j.g.visible = i < count;
                if (j.g.visible && !reduce) j.beam.rotation.z = Math.sin(now / 1000 * (1 + yieldPer * 5) + j.phase) * 0.28 * Math.min(1, yieldPer * 1.4 + 0.15);
            });

            loops.forEach((r, i) => { if (!reduce) r.rotation.y += dt * (0.6 + i * 0.15); });

            renderer.render(scene, camera);
            raf = requestAnimationFrame(loopFn);
        };
        raf = requestAnimationFrame(loopFn);

        function dispose() {
            if (disposed) return;
            disposed = true;
            if (raf) cancelAnimationFrame(raf);
            ro.disconnect();
            disposables.forEach(d => d.dispose && d.dispose());
            renderer.dispose();
            renderer.domElement.remove();
        }

        return { update, highlight, dispose };
    }

    return { mount };
})();
