// Engine Room — 3D diorama of the fishery (companion to the 2D drawing in engine-room-fishery.js).
// A harbour on a museum turntable: the sea in a glass tank with living waves, fish you can count,
// boats that bob, spawn rising from the sea floor. Drag to spin, click a part.
// three.js is loaded on demand from jsDelivr, only when the 3D view is opened.

window.EngineRoomFishery3D = (function () {
    const THREE_URL = 'https://cdn.jsdelivr.net/npm/three@0.169.0/build/three.module.min.js';
    let THREE = null;

    const C = {
        ink: '#1E2023', card: '#F8F1E1', blue: '#2E7DB5', mustard: '#DDA22C', red: '#B5392A',
        green: '#2F6A3E', teal: '#1E6A5E', steel: '#A7B3B8', link: '#4B4840',
        water: '#2E6F9E', wave: '#9CC3DE', silver: '#C9D3D9', sand: '#C9B48A',
        stone1: '#6F6B63', stone2: '#8F8A80', deck: '#B9B2A2'
    };

    const SEA = { x0: -6.6, x1: 6.6, z0: -0.6, z1: 5.6, floor: -3.8, level: -0.4 };
    const FISH_UNIT = 25, BOAT_UNIT = 25;

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
        const cam = { dist: 30, elev: 0.36 };
        const placeCamera = () => {
            camera.position.set(0, Math.sin(cam.elev) * cam.dist, Math.cos(cam.elev) * cam.dist);
            camera.lookAt(0, -0.8, 0);
        };
        placeCamera();

        scene.add(new T.HemisphereLight(0xf2f7ff, 0x34404a, 1.5));
        const sun = new T.DirectionalLight(0xffffff, 2.3);
        sun.position.set(8, 16, 12);
        sun.castShadow = true;
        sun.shadow.mapSize.set(1024, 1024);
        Object.assign(sun.shadow.camera, { left: -14, right: 14, top: 14, bottom: -14, near: 1, far: 50 });
        scene.add(sun);

        const world = new T.Group();
        scene.add(world);

        // ---------- Helpers ----------
        const pickables = [], disposables = [];
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
        const reg = (obj, term) => obj.traverse(o => { if (o.isMesh || o.isSprite) { o.userData.term = term; pickables.push(o); } });

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
            const m = new T.SpriteMaterial({ map: tex });
            disposables.push(tex, m);
            const s = new T.Sprite(m);
            s.scale.set(size * w / 96, size, 1);
            s.position.set(...pos);
            world.add(s);
            if (term) reg(s, term);
            return s;
        };

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
                ctx.fillStyle = C.ink; ctx.fillRect(28, 8, 200, 80);
                ctx.font = `700 54px "Courier Prime", "Courier New", monospace`;
                ctx.fillStyle = color; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
                ctx.fillText(text, 128, 50);
                tex.needsUpdate = true;
            };
        };

        const cloud = (x, y, z) => {
            const g = new T.Group();
            [[0, 0, 0, 0.75], [0.7, 0.15, 0, 0.6], [-0.7, 0.1, 0, 0.55], [0.25, 0.55, 0, 0.55], [-0.3, 0.45, 0.15, 0.5]].forEach(([dx, dy, dz, r]) =>
                mesh(new T.SphereGeometry(r, 20, 14), mat('#FFFFFF', { roughness: 1 }), [dx, dy, dz], g));
            g.position.set(x, y, z);
            world.add(g);
            reg(g, 'cloud');
        };

        const pipes = [];
        const pipe = (x0, x1, y, z, color, term, valveX) => {
            const len = Math.abs(x1 - x0);
            const tube = mesh(new T.CylinderGeometry(0.36, 0.36, len, 24, 1, true), glass(C.steel, 0.32), [(x0 + x1) / 2, y, z]);
            tube.rotation.z = Math.PI / 2;
            tube.castShadow = false;
            reg(tube, term);
            [x0, x1].forEach(x => { const f = mesh(new T.TorusGeometry(0.38, 0.07, 8, 24), mat(C.steel, { metalness: 0.6, roughness: 0.3 }), [x, y, z]); f.rotation.y = Math.PI / 2; });
            const parts = [];
            for (let i = 0; i < 9; i++) {
                const p = mesh(new T.SphereGeometry(0.17, 12, 10), mat(color, { emissive: color, emissiveIntensity: 0.25 }), [x0, y, z]);
                p.castShadow = false;
                p.userData.u = i / 9;
                reg(p, term);
                parts.push(p);
            }
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
            const p = { x0, x1, y, z, parts, handle };
            pipes.push(p);
            return p;
        };

        // ---------- Plinth ----------
        mesh(new T.CylinderGeometry(11.2, 11.6, 1, 64), mat(C.ink), [0, -4.8, 0]);
        mesh(new T.TorusGeometry(11.25, 0.12, 8, 96), mat(C.mustard, { metalness: 0.5, roughness: 0.3 }), [0, -4.3, 0]).rotation.x = Math.PI / 2;

        // ---------- Harbour quay (back) ----------
        mesh(new T.BoxGeometry(20, 2.2, 5.2), mat(C.stone1, { roughness: 0.95 }), [0, -2.7, -3.2]);
        mesh(new T.BoxGeometry(20, 1.6, 5.2), mat(C.stone2, { roughness: 0.9 }), [0, -0.8, -3.2]);
        mesh(new T.BoxGeometry(20, 0.12, 5.2), mat(C.deck, { roughness: 0.8 }), [0, 0.0, -3.2]);
        // bollards along the quay edge
        for (let x = -8; x <= 8; x += 4) mesh(new T.CylinderGeometry(0.16, 0.2, 0.4, 12), mat(C.ink), [x, 0.26, -0.85]);
        label('Harbour', [-8.3, 0.75, -1.2], null, 0.42);

        // ---------- The sea (front): glass tank, sand floor, living wave surface ----------
        const seaW = SEA.x1 - SEA.x0, seaD = SEA.z1 - SEA.z0, seaH = SEA.level - SEA.floor;
        const seaCx = (SEA.x0 + SEA.x1) / 2, seaCz = (SEA.z0 + SEA.z1) / 2;
        mesh(new T.BoxGeometry(seaW, 0.2, seaD), mat(C.sand, { roughness: 1 }), [seaCx, SEA.floor - 0.1, seaCz]);
        const water = mesh(new T.BoxGeometry(seaW, seaH, seaD), glass(C.water, 0.32), [seaCx, (SEA.floor + SEA.level) / 2, seaCz]);
        water.castShadow = false;
        reg(water, 'resource');
        // glass tank frame
        const frameMat = mat(C.ink, { metalness: 0.4 });
        [[SEA.x0, SEA.z1], [SEA.x1, SEA.z1], [SEA.x0, SEA.z0], [SEA.x1, SEA.z0]].forEach(([x, z]) =>
            mesh(new T.BoxGeometry(0.12, seaH + 0.3, 0.12), frameMat, [x, (SEA.floor + SEA.level) / 2, z]));
        mesh(new T.BoxGeometry(seaW, 0.12, 0.12), frameMat, [seaCx, SEA.floor, SEA.z1]);
        mesh(new T.BoxGeometry(seaW, 0.12, 0.12), frameMat, [seaCx, SEA.level + 0.15, SEA.z1]);

        const waveGeo = new T.PlaneGeometry(seaW, seaD, 66, 30);
        waveGeo.rotateX(-Math.PI / 2);
        const waveMat = mat(C.wave, { metalness: 0.55, roughness: 0.16, flatShading: true, transparent: true, opacity: 0.88, side: T.DoubleSide });
        const waveMesh = mesh(waveGeo, waveMat, [seaCx, SEA.level, seaCz]);
        waveMesh.castShadow = false;
        reg(waveMesh, 'resource');
        const wavePos = waveGeo.attributes.position;
        const waveBase = Float32Array.from(wavePos.array);
        const waveAt = (x, z, t) => 0.13 * (Math.sin(x * 0.9 + t * 1.4) + 0.6 * Math.sin(z * 1.3 + t * 1.1) + 0.3 * Math.sin((x + z) * 2.1 + t * 2.3));

        // ---------- Fish: one per 25 units ----------
        const fishGeo = new T.SphereGeometry(1, 14, 10); disposables.push(fishGeo);
        const tailGeo = new T.ConeGeometry(0.11, 0.2, 4); disposables.push(tailGeo);
        const fishMat = mat(C.silver, { metalness: 0.75, roughness: 0.22 });
        const fish = [];
        for (let i = 0; i < 1000 / FISH_UNIT; i++) {
            const g = new T.Group();
            const body = new T.Mesh(fishGeo, fishMat); body.scale.set(0.3, 0.12, 0.09); body.castShadow = true; g.add(body);
            const tail = new T.Mesh(tailGeo, fishMat); tail.rotation.z = Math.PI / 2; tail.position.x = -0.36; g.add(tail);
            const school = i % 4;
            g.userData = {
                cx: -4.2 + school * 2.8 + (Math.random() - 0.5) * 1.2,
                cy: -2.6 + (school % 2) * 0.9 + (Math.random() - 0.5) * 0.6,
                cz: 2.5 + (Math.random() - 0.5) * 2.2,
                rx: 0.9 + Math.random() * 0.9, rz: 0.6 + Math.random() * 0.8,
                speed: (0.5 + Math.random() * 0.4) * (school % 2 ? 1 : -1),
                phase: Math.random() * Math.PI * 2
            };
            world.add(g);
            reg(g, 'resource');
            fish.push(g);
        }

        // ---------- Spawn bubbles: regeneration rising from the sea floor ----------
        const bubbleGeo = new T.SphereGeometry(0.07, 8, 6); disposables.push(bubbleGeo);
        const bubbleMat = mat('#EAF4FB', { transparent: true, opacity: 0.8, emissive: '#9CC3DE', emissiveIntensity: 0.3 });
        const bubbles = [];
        for (let i = 0; i < 30; i++) {
            const b = new T.Mesh(bubbleGeo, bubbleMat);
            b.userData = { x: SEA.x0 + 0.6 + Math.random() * (seaW - 1.2), z: SEA.z0 + 0.6 + Math.random() * (seaD - 1.2), u: Math.random() };
            world.add(b);
            reg(b, 'regeneration');
            bubbles.push(b);
        }

        // ---------- Boats: one per 25 units of fleet ----------
        const boats = [];
        for (let i = 0; i < 18; i++) {
            const g = new T.Group();
            mesh(new T.BoxGeometry(1.0, 0.26, 0.42), mat(C.red, { roughness: 0.5 }), [0, 0, 0], g);
            mesh(new T.BoxGeometry(0.22, 0.24, 0.42), mat(C.red, { roughness: 0.5 }), [0.58, 0.05, 0], g).rotation.z = 0.5;
            mesh(new T.BoxGeometry(0.34, 0.28, 0.3), mat(C.card), [-0.15, 0.27, 0], g);
            mesh(new T.CylinderGeometry(0.025, 0.025, 0.7, 6), mat(C.ink), [0.15, 0.45, 0], g);
            const col = i % 6, row = Math.floor(i / 6);
            g.userData = { x: SEA.x0 + 1.2 + col * 2.1 + (row % 2) * 0.7, z: 0.6 + row * 1.85, phase: Math.random() * 6 };
            g.visible = false;
            world.add(g);
            reg(g, 'capital');
            boats.push(g);
        }

        // ---------- Fleet tank and its pipes (on the quay) ----------
        const fleetTank = (() => {
            const g = new T.Group(), r = 1.45, h = 3.0;
            mesh(new T.CylinderGeometry(r, r, h, 40, 1, true), glass('#DDE6EA', 0.3), [0, h / 2, 0], g).castShadow = false;
            mesh(new T.TorusGeometry(r, 0.08, 8, 48), mat(C.ink), [0, h, 0], g).rotation.x = Math.PI / 2;
            mesh(new T.CylinderGeometry(r + 0.1, r + 0.2, 0.25, 40), mat(C.ink), [0, 0, 0], g);
            const fill = mesh(new T.CylinderGeometry(r - 0.08, r - 0.08, 1, 40), mat(C.red, { roughness: 0.3, emissive: C.red, emissiveIntensity: 0.08 }), [0, 0.5, 0], g);
            g.position.set(0, 0.06, -3.2);
            world.add(g);
            reg(g, 'capital');
            return { fill, h };
        })();
        const capRead = readout([0, 3.9, -3.2], '#F1E8D3');
        const fishRead = readout([0, 0.75, SEA.z1 + 0.2], C.wave);
        label('Fleet', [0, 4.7, -3.2], 'capital', 0.5);
        label('Fish in the sea', [0, -4.55, SEA.z1 + 0.6], 'resource', 0.5);

        cloud(-9.3, 1.6, -3.2);
        cloud(9.3, 1.6, -3.2);
        cloud(-9.6, -2.2, 2.5);
        cloud(9.6, -2.2, 2.5);
        label('Market', [9.6, -1.1, 2.5], 'cloud', 0.38);
        const inv = pipe(-8.4, -1.55, 1.6, -3.2, C.green, 'investment', -4.8);
        const dep = pipe(1.55, 8.4, 1.6, -3.2, C.steel, 'depreciation', 4.8);
        const regP = pipe(-8.9, SEA.x0, -2.2, 2.5, C.teal, 'regeneration', -7.75);
        const harP = pipe(SEA.x1, 8.9, -2.2, 2.5, C.mustard, 'harvest', 7.75);
        label('Investment', [-4.8, 3.15, -3.2], 'investment', 0.42);
        label('Depreciation', [4.8, 3.15, -3.2], 'depreciation', 0.42);
        label('Regeneration', [-7.75, -3.25, 3.3], 'regeneration', 0.38);
        label('Harvest', [7.75, -3.25, 3.3], 'harvest', 0.38);

        // ---------- Converters, links, loops ----------
        const conv = (name, pos, term) => {
            const s = mesh(new T.SphereGeometry(0.3, 18, 14), mat(C.card), pos);
            reg(s, term);
            label(name, [pos[0], pos[1] + 0.62, pos[2]], term, 0.4);
        };
        conv('Growth goal', [-3, 4.6, -3.2], 'growth-goal');
        conv('Capital lifetime', [6.6, 4.0, -3.2], 'lifetime');
        conv('Profit', [-5.6, 1.1, -0.5], 'profit');
        conv('Price', [-8.2, 2.5, -0.7], 'price');
        conv('Yield per boat', [2.6, 1.0, -0.4], 'yield');
        conv('Technology', [5.6, 1.8, -0.5], 'technology');
        conv('Regeneration rate', [-7.9, 0.2, 4.2], 'regeneration-rate');
        conv('Quota', [7.9, 0.2, 4.2], 'quota');

        const link = (a, ctrl, b, term) => {
            const curve = new T.QuadraticBezierCurve3(new T.Vector3(...a), new T.Vector3(...ctrl), new T.Vector3(...b));
            const tube = mesh(new T.TubeGeometry(curve, 32, 0.045, 6, false), mat(C.link), null);
            tube.castShadow = false;
            const tip = mesh(new T.ConeGeometry(0.13, 0.36, 10), mat(C.link), b);
            tip.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), curve.getTangent(1));
            reg(tube, term); reg(tip, term);
        };
        link([-3, 4.3, -3.2], [-4.3, 4.6, -3.2], [-4.8, 2.85, -3.2], 'growth-goal');
        link([-5.6, 1.4, -0.6], [-5.6, 2.7, -2.2], [-4.95, 2.4, -3.0], 'profit');
        link([-7.9, 2.3, -0.7], [-7.2, 1.3, -0.6], [-5.9, 1.1, -0.5], 'price');
        link([2.3, 1.1, -0.5], [-3, 3.0, -0.6], [-7.9, 2.55, -0.7], 'price');
        link([1.2, 0.4, -2.0], [6.2, 1.8, 0.8], [7.75, -1.25, 2.5], 'harvest');
        link([7.5, -1.5, 2.5], [0, 2.6, 0.9], [-5.3, 1.0, -0.4], 'profit');
        link([2.9, 0.8, -0.3], [6.4, 0.6, 1.2], [7.7, -1.2, 2.4], 'yield');
        link([5.3, 1.8, -0.5], [4.1, 1.7, -0.5], [2.95, 1.1, -0.4], 'technology');
        link([1.6, -0.3, 0.8], [2.1, 0.4, 0.2], [2.5, 0.75, -0.3], 'yield');
        link([-5.8, -0.5, 3.6], [-6.9, 0.3, 4.1], [-7.6, 0.2, 4.2], 'regeneration-rate');
        link([-7.9, -0.1, 4.1], [-8.0, -1.0, 3.3], [-7.8, -1.6, 2.7], 'regeneration-rate');
        link([7.9, -0.1, 4.1], [8.0, -1.0, 3.3], [7.8, -1.6, 2.7], 'quota');
        link([1.2, 3.1, -3.2], [3.2, 4.4, -3.2], [4.6, 2.8, -3.2], 'depreciation');
        link([6.3, 3.8, -3.2], [5.7, 3.7, -3.2], [5.0, 2.8, -3.2], 'lifetime');

        const loops = [];
        const loop = (letter, color, pos, term) => {
            const ring = mesh(new T.TorusGeometry(0.62, 0.11, 12, 40), mat(color, { roughness: 0.35, emissive: color, emissiveIntensity: 0.2 }), pos);
            reg(ring, term);
            label(letter, pos, term, 0.55);
            loops.push(ring);
        };
        loop('R', C.red, [-4.2, 0.9, -1.2], 'reinforcing');
        loop('B', C.blue, [2.9, 3.5, -1.6], 'balancing');
        loop('B', C.blue, [4.6, 0.4, 0.4], 'balancing');
        loop('B', C.teal, [-6.6, 1.0, 2.0], 'regeneration-rate');

        // ---------- Interaction: drag to spin, click to pick ----------
        const el = renderer.domElement;
        el.style.touchAction = 'pan-y';
        el.style.cursor = 'grab';
        let drag = null, lastInteract = -1e9, spin = -0.25, swayT = 0;
        const raycaster = new T.Raycaster(), ndc = new T.Vector2();
        el.addEventListener('pointerdown', e => {
            drag = { x: e.clientX, y: e.clientY, moved: 0 };
            spin = world.rotation.y; swayT = 0;
            el.setPointerCapture(e.pointerId);
            el.style.cursor = 'grabbing';
        });
        el.addEventListener('pointermove', e => {
            if (!drag) return;
            const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
            drag.moved += Math.abs(dx) + Math.abs(dy);
            drag.x = e.clientX; drag.y = e.clientY;
            spin += dx * 0.009;
            world.rotation.y = spin;
            if (e.pointerType === 'mouse') { cam.elev = Math.max(0.05, Math.min(0.8, cam.elev + dy * 0.004)); placeCamera(); }
            lastInteract = performance.now();
        });
        el.addEventListener('pointerup', e => {
            if (!drag) return;
            el.style.cursor = 'grab';
            if (drag.moved < 6) {
                const r = el.getBoundingClientRect();
                ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
                raycaster.setFromCamera(ndc, camera);
                const hit = raycaster.intersectObjects(pickables, false).find(h => h.object.userData.term && h.object.visible);
                if (hit && onPick) onPick(hit.object.userData.term);
            }
            drag = null;
            lastInteract = performance.now();
        });
        el.addEventListener('pointercancel', () => { drag = null; });

        // ---------- Highlight ----------
        const glowColor = new T.Color(C.mustard);
        function highlight(term) {
            const meshes = pickables.filter(o => o.isMesh && o.material.emissive);
            meshes.forEach(o => {
                if (o.userData.baseEmissive === undefined) {
                    o.userData.baseEmissive = o.material.emissive.clone();
                    o.userData.baseIntensity = o.material.emissiveIntensity;
                }
                o.material.emissive.copy(o.userData.baseEmissive);
                o.material.emissiveIntensity = o.userData.baseIntensity;
            });
            meshes.filter(o => o.userData.term === term).forEach(o => { o.material.emissive.copy(glowColor); o.material.emissiveIntensity = 0.75; });
        }

        // ---------- State from the simulation ----------
        const frame = { capital: 5, capMax: 400, fish: 1000, r0: 1000, investment: 0, depreciation: 0, regeneration: 0, harvest: 0, flowMax: 1 };
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
        let raf = null, prev = performance.now(), disposed = false, clock = 0;
        const loopFn = now => {
            if (!container.isConnected) return dispose();
            const dt = Math.min(0.05, (now - prev) / 1000);
            prev = now;
            if (!reduce) clock += dt;

            if (!reduce && !drag && now - lastInteract > 3500) swayT += dt * 0.35;
            world.rotation.y = spin + Math.sin(swayT) * 0.45;

            // waves
            for (let i = 0; i < wavePos.count; i++) {
                const x = waveBase[i * 3] + seaCx, z = waveBase[i * 3 + 2] + seaCz;
                wavePos.array[i * 3 + 1] = waveAt(x, z, clock);
            }
            wavePos.needsUpdate = true;
            waveGeo.computeVertexNormals();

            // fleet tank
            const capF = Math.min(1, frame.capital / frame.capMax);
            fleetTank.fill.scale.y = Math.max(0.001, capF * fleetTank.h);
            fleetTank.fill.position.y = (capF * fleetTank.h) / 2 + 0.12;
            capRead(frame.capital);
            fishRead(frame.fish);

            // fish: count = stock / 25
            const nFish = Math.max(0, Math.min(fish.length, Math.round(frame.fish / FISH_UNIT)));
            fish.forEach((g, i) => {
                g.visible = i < nFish;
                if (!g.visible) return;
                const u = g.userData, a = clock * u.speed + u.phase;
                g.position.set(u.cx + Math.cos(a) * u.rx, u.cy + Math.sin(a * 2) * 0.12, u.cz + Math.sin(a) * u.rz);
                const dir = Math.sign(u.speed), vx = -Math.sin(a) * u.rx * dir, vz = Math.cos(a) * u.rz * dir;
                g.rotation.y = -Math.atan2(vz, vx); // head (+x) points along the swim direction
            });

            // boats: count = fleet / 25, riding the waves
            const nBoats = Math.min(boats.length, Math.round(frame.capital / BOAT_UNIT));
            boats.forEach((g, i) => {
                g.visible = i < nBoats;
                if (!g.visible) return;
                const { x, z, phase } = g.userData;
                g.position.set(x, SEA.level + 0.14 + waveAt(x, z, clock), z);
                g.rotation.z = (waveAt(x + 0.4, z, clock) - waveAt(x - 0.4, z, clock)) * 0.9;
                g.rotation.x = Math.sin(clock * 1.2 + phase) * 0.05;
            });

            // spawn bubbles: how many and how fast follow regeneration
            const rf = Math.min(1, frame.regeneration / frame.flowMax);
            const nBub = Math.round(bubbles.length * rf);
            bubbles.forEach((b, i) => {
                b.visible = i < nBub;
                if (!b.visible) return;
                if (!reduce) b.userData.u = (b.userData.u + dt * (0.15 + rf * 0.5)) % 1;
                b.position.set(b.userData.x + Math.sin(clock * 2 + i) * 0.05, SEA.floor + 0.1 + b.userData.u * (seaH - 0.3), b.userData.z);
            });

            // pipes: particles and valve handles follow the flows
            [[inv, frame.investment], [dep, frame.depreciation], [regP, frame.regeneration], [harP, frame.harvest]].forEach(([p, v]) => {
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
