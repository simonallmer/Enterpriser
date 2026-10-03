// Engine Room — interactive system models. Rendered by script.js at:
//   #/engine-room             exhibit hall
//   #/engine-room/<exhibit>   one exhibit
// Models follow Donella H. Meadows, "Thinking in Systems" (2008), ch. 2. Explanations are our own.

window.EngineRoom = (function () {

    // ---------- Glossary (own wording) ----------

    const GLOSSARY = {
        'stock': ['Stock', 'Something that piles up and can be counted at any moment: oil in the ground, machines in the yard. Drawn as a tank.'],
        'flow': ['Flow', 'The rate at which a stock fills or drains, per year. Drawn as a pipe.'],
        'faucet': ['Faucet', 'The valve on a flow. Whatever controls the faucet controls how fast the stock changes.'],
        'cloud': ['Cloud', 'The edge of the model. A flow comes from somewhere or goes somewhere, but we stop counting there.'],
        'link': ['Information link', 'A thin arrow. One part tells another how far to open its faucet. Nothing physical moves along it.'],
        'reinforcing': ['Reinforcing loop (R)', 'A loop that feeds itself. More leads to more. It is the engine of exponential growth, and of collapse.'],
        'balancing': ['Balancing loop (B)', 'A loop that pushes back toward a limit or a goal. It slows, stops or reverses change.'],
        'capital': ['Capital', 'Drills, pumps, pipelines and refineries: the machines that do the extracting.'],
        'investment': ['Investment', 'Profit put back into new machines. Never more than the growth goal plus replacing worn-out machines.'],
        'depreciation': ['Depreciation', 'Machines wear out. Each lasts about 20 years here, so one twentieth of capital disappears every year.'],
        'lifetime': ['Capital lifetime', 'How long one machine lasts before it must be replaced. Here: 20 years.'],
        'growth-goal': ['Growth goal', 'How fast the company wants its capital to grow each year. Try changing it.'],
        'profit': ['Profit', 'Income from selling what is extracted, minus the cost of running the machines.'],
        'price': ['Price', 'What one unit of the resource sells for. Either constant, or rising as the resource gets scarce.'],
        'yield': ['Yield per unit capital', 'How much one machine gets out of the ground per year. It falls as the easy deposits run out.'],
        'resource': ['Nonrenewable resource', 'A stock with no inflow. Every barrel taken out is gone for good.'],
        'extraction': ['Extraction', 'The flow out of the ground: capital × yield. It sells, and becomes profit.'],
        'exponential': ['Exponential growth', 'Growth by a fixed percentage. It doubles in fixed times: at 5% a year, roughly every 14 years.'],
        'peak': ['Peak', 'The year a flow is largest. After it, the balancing loop is in charge.']
    };

    // ---------- Model: capital constrained by a nonrenewable resource ----------
    // Calibrated to reproduce the behaviour of Meadows' Figures 38–41.

    const BASE_RESOURCE = 1000;
    const LIFETIME = 20;
    const OPERATING_COST = 0.4;   // per unit capital per year
    const YIELD_KNEE = 0.4;       // fraction of base resource below which yield falls
    const YIELD_SHAPE = 1.2;
    const SCARCITY_PRICE = 3;     // extra price at full depletion (rising-price mode)

    function simulate({ growth, size, rising }) {
        const dt = 0.125, years = 100, every = 4;
        let R = BASE_RESOURCE * size, K = 5;
        const t = [], E = [], C = [], S = [], I = [], D = [];
        for (let step = 0; step <= years / dt; step++) {
            const f = R / BASE_RESOURCE;
            const y = Math.pow(Math.min(1, f / YIELD_KNEE), YIELD_SHAPE);
            const extraction = Math.min(K * y, R / dt);
            const price = 1 + (rising ? SCARCITY_PRICE * Math.pow(1 - Math.min(f, 1), 2) : 0);
            const profit = price * extraction - OPERATING_COST * K;
            const investment = Math.max(0, Math.min(K * (growth + 1 / LIFETIME), profit));
            const depreciation = K / LIFETIME;
            if (step % every === 0) {
                t.push(step * dt); E.push(extraction); C.push(K); S.push(R); I.push(investment); D.push(depreciation);
            }
            K += (investment - depreciation) * dt;
            R -= extraction * dt;
        }
        const peakAt = arr => arr.reduce((best, v, i) => v > arr[best] ? i : best, 0);
        const pe = peakAt(E), pc = peakAt(C);
        const r0 = BASE_RESOURCE * size;
        const gone = S.findIndex(v => v < r0 * 0.05);
        return {
            t, E, C, S, I, D, r0,
            peakExtraction: { year: t[pe], value: E[pe] },
            peakCapital: { year: t[pc], value: C[pc] },
            depletedYear: gone >= 0 ? t[gone] : null,
            leftInGround: S[S.length - 1]
        };
    }

    // ---------- Shared bits ----------

    let H; // helpers from script.js: { esc, fmt, bulb }

    const CONTAINER = `<svg viewBox="0 0 120 60" aria-hidden="true">
        <rect x="4" y="8" width="112" height="46" rx="2" fill="var(--red)" stroke="currentColor" stroke-width="2"/>
        <g stroke="rgba(0,0,0,.28)" stroke-width="2">${Array.from({ length: 13 }, (_, i) => `<line x1="${14 + i * 7.6}" y1="12" x2="${14 + i * 7.6}" y2="50"/>`).join('')}</g>
        <g fill="currentColor"><rect x="4" y="8" width="7" height="6"/><rect x="109" y="8" width="7" height="6"/><rect x="4" y="48" width="7" height="6"/><rect x="109" y="48" width="7" height="6"/></g>
        <rect x="4" y="8" width="112" height="46" rx="2" fill="none" stroke="currentColor" stroke-width="2"/>
    </svg>`;

    const EXHIBITS = [
        { id: 'oil-economy', no: 1, title: 'The Oil Economy', text: 'A company grows on a resource that never comes back. Set the growth goal, double the oil field, raise the price. Watch where the peak goes.', open: true },
        { id: 'fishery', no: 2, title: 'The Fishery', text: 'Capital on a renewable resource. Fish grow back, unless the fleet grows faster.' },
        { id: 'thermostat', no: 3, title: 'The Thermostat', text: 'The simplest balancing loop, and why it never quite hits its goal.' },
        { id: 'square-metre', no: 4, title: 'One Square Metre', text: 'An Isotype chart: what a square metre costs around the world, and how many years of work buy it.' }
    ];

    // ---------- Exhibit hall ----------

    function renderHall(view) {
        view.innerHTML = `
            <div class="wrap">
                <div class="er-head">
                    <div class="er-emblem">${CONTAINER}</div>
                    <span class="label">Basement</span>
                    <h1>Engine Room</h1>
                    <p>Below the floors, the machinery. Systems you can run: tanks you can fill, faucets you can open, loops you can watch. Click any term to see what it means.</p>
                </div>
                <div class="exhibits">
                    ${EXHIBITS.map(x => `
                        <${x.open ? `a href="#/engine-room/${x.id}"` : 'div'} class="exhibit ${x.open ? 'open' : 'soon'}">
                            <span class="exhibit-lamp">${H.bulb(!!x.open)}</span>
                            <span class="label">Exhibit No. ${x.no}${x.open ? '' : ' · Coming soon'}</span>
                            <h2>${H.esc(x.title)}</h2>
                            <p>${H.esc(x.text)}</p>
                            ${x.open ? '<span class="exhibit-go">Step inside →</span>' : ''}
                        </${x.open ? 'a' : 'div'}>`).join('')}
                </div>
                <p class="er-credit">Models after Donella H. Meadows, <i>Thinking in Systems: A Primer</i> (2008). Explanations, numbers and drawings are our own.</p>
            </div>`;
    }

    // ---------- Oil economy exhibit ----------

    const term = (key, text) => `<button type="button" class="term" data-term="${key}">${text}</button>`;

    // Stock-and-flow diagram (Meadows Fig. 37 layout, in colour)
    function diagram() {
        const valve = (x, y, id, termKey) => `
            <g class="valve" data-term="${termKey}" transform="translate(${x} ${y})">
                <path d="M-12 -9 L12 9 L12 -9 L-12 9 Z" fill="var(--ink)"/>
                <g class="handle" id="${id}"><line x1="0" y1="0" x2="0" y2="-20" stroke="var(--ink)" stroke-width="3"/><line x1="-10" y1="-20" x2="10" y2="-20" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/></g>
                <circle r="3.5" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
            </g>`;
        const cloud = (x, y) => `<path data-term="cloud" class="cloud" transform="translate(${x} ${y})" d="M-26 8 a10 10 0 0 1 2-19 a13 13 0 0 1 24-5 a11 11 0 0 1 20 6 a9 9 0 0 1 4 18 Z"/>`;
        const conv = (x, y, label, key, anchor = 'middle', dx = 0, dy = -12) => `
            <g class="conv" data-term="${key}"><circle cx="${x}" cy="${y}" r="7"/><text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}">${label}</text></g>`;
        const link = (d, key = 'link') => `<path class="link" data-term="${key}" d="${d}" marker-end="url(#er-arrow)"/>`;
        return `
        <svg class="er-diagram" viewBox="0 0 760 470" role="img" aria-label="Stock and flow diagram of an oil company: capital, investment, depreciation, resource and extraction, with reinforcing and balancing loops">
            <defs>
                <marker id="er-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--ink-2)"/></marker>
                <marker id="er-flowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="4" markerHeight="4" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--ink)"/></marker>
                <clipPath id="er-cap-clip"><rect x="320" y="70" width="150" height="90"/></clipPath>
                <clipPath id="er-res-clip"><rect x="90" y="345" width="190" height="80"/></clipPath>
            </defs>

            <!-- ground -->
            <rect x="0" y="300" width="760" height="170" fill="var(--paper-2)" opacity=".7"/>
            <line x1="0" y1="300" x2="760" y2="300" stroke="var(--ink-3)" stroke-dasharray="2 5"/>
            <text x="12" y="292" class="er-small">ABOVE GROUND</text><text x="12" y="318" class="er-small">BELOW GROUND</text>

            <!-- investment inflow: cloud → faucet → capital -->
            ${cloud(70, 116)}
            <line class="pipe" x1="96" y1="115" x2="318" y2="115"/>
            <line class="liquid" id="er-inv-pipe" data-term="investment" x1="96" y1="115" x2="312" y2="115" stroke="var(--green)" marker-end="url(#er-flowhead)"/>
            ${valve(210, 115, 'er-inv-handle', 'investment')}
            <text x="210" y="148" text-anchor="middle" class="er-label" data-term="investment">investment</text>

            <!-- capital stock -->
            <g data-term="capital" class="stock">
                <rect x="320" y="70" width="150" height="90" class="tank"/>
                <rect id="er-cap-fill" x="320" y="160" width="150" height="0" fill="var(--blue)" clip-path="url(#er-cap-clip)"/>
                <rect x="320" y="70" width="150" height="90" class="tank-frame"/>
                <text x="395" y="62" text-anchor="middle" class="er-label">capital</text>
                <text id="er-cap-val" x="395" y="122" text-anchor="middle" class="er-value">5</text>
            </g>

            <!-- depreciation outflow -->
            <line class="pipe" x1="470" y1="115" x2="676" y2="115"/>
            <line class="liquid" id="er-dep-pipe" data-term="depreciation" x1="472" y1="115" x2="666" y2="115" stroke="var(--red)" marker-end="url(#er-flowhead)"/>
            ${valve(570, 115, 'er-dep-handle', 'depreciation')}
            <text x="570" y="148" text-anchor="middle" class="er-label" data-term="depreciation">depreciation</text>
            ${cloud(700, 116)}

            <!-- resource stock -->
            <g data-term="resource" class="stock">
                <rect x="90" y="345" width="190" height="80" class="tank"/>
                <rect id="er-res-fill" x="90" y="345" width="190" height="80" fill="var(--mustard)" clip-path="url(#er-res-clip)"/>
                <rect x="90" y="345" width="190" height="80" class="tank-frame"/>
                <text x="185" y="442" text-anchor="middle" class="er-label">resource (nonrenewable)</text>
                <text id="er-res-val" x="185" y="391" text-anchor="middle" class="er-value">1,000</text>
            </g>

            <!-- extraction outflow -->
            <line class="pipe" x1="280" y1="385" x2="616" y2="385"/>
            <line class="liquid" id="er-ext-pipe" data-term="extraction" x1="282" y1="385" x2="606" y2="385" stroke="var(--mustard)" marker-end="url(#er-flowhead)"/>
            ${valve(440, 385, 'er-ext-handle', 'extraction')}
            <text x="440" y="418" text-anchor="middle" class="er-label" data-term="extraction">extraction</text>
            ${cloud(640, 386)}

            <!-- converters -->
            ${conv(395, 24, 'growth goal', 'growth-goal')}
            ${conv(640, 180, 'capital lifetime', 'lifetime', 'start', 12, 4)}
            ${conv(200, 232, 'profit', 'profit', 'end', -12, 4)}
            ${conv(80, 262, 'price', 'price', 'end', -12, 4)}
            ${conv(300, 322, 'yield per unit capital', 'yield', 'start', 12, 4)}

            <!-- information links -->
            ${link('M389 30 Q330 60 222 104', 'growth-goal')}
            ${link('M193 225 Q190 180 207 132', 'profit')}
            ${link('M86 256 Q130 228 192 231', 'price')}
            ${link('M440 160 Q470 270 444 370', 'extraction')}
            ${link('M433 372 Q330 280 207 236', 'profit')}
            ${link('M200 345 Q230 320 293 322', 'yield')}
            ${link('M306 328 Q380 360 430 380', 'yield')}
            ${link('M460 92 Q520 70 564 102', 'depreciation')}
            ${link('M632 176 Q600 160 578 130', 'lifetime')}

            <!-- loop markers -->
            <g class="loop" data-term="reinforcing"><circle cx="262" cy="190" r="17" fill="var(--red)"/><text x="262" y="196" text-anchor="middle">R</text></g>
            <g class="loop" data-term="balancing"><circle cx="520" cy="196" r="17" fill="var(--blue)"/><text x="520" y="202" text-anchor="middle">B</text></g>
            <g class="loop" data-term="balancing"><circle cx="350" cy="250" r="17" fill="var(--blue)"/><text x="350" y="256" text-anchor="middle">B</text></g>
        </svg>`;
    }

    function niceMax(v) {
        const steps = [10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 4000, 5000];
        return steps.find(s => s >= v * 1.05) || Math.ceil(v / 1000) * 1000;
    }

    function chart(title, key, run, ghost, idx, color, fixedMax) {
        const W = 320, Hh = 150, x0 = 40, x1 = 310, y0 = 12, y1 = 118;
        const series = run[key], gseries = ghost ? ghost[key] : null;
        const max = fixedMax || niceMax(Math.max(...series, ...(gseries || [0])));
        const X = i => x0 + (run.t[i] / 100) * (x1 - x0);
        const Y = v => y1 - (v / max) * (y1 - y0);
        const path = (arr, upto) => arr.slice(0, upto + 1).map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
        const yr = run.t[idx];
        return `
            <figure class="er-chart">
                <figcaption><span class="label">${title}</span><span class="type er-chart-val" style="color:${color}">${H.fmt(Math.round(series[idx]))}</span></figcaption>
                <svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${title} over 100 years">
                    ${[0, 0.5, 1].map(f => `<line x1="${x0}" x2="${x1}" y1="${Y(max * f)}" y2="${Y(max * f)}" class="grid"/><text x="${x0 - 6}" y="${Y(max * f) + 4}" text-anchor="end" class="tick">${H.fmt(max * f)}</text>`).join('')}
                    ${[0, 25, 50, 75, 100].map(y => `<text x="${x0 + y / 100 * (x1 - x0)}" y="${y1 + 16}" text-anchor="middle" class="tick">${y}</text>`).join('')}
                    <text x="${x1}" y="${y1 + 30}" text-anchor="end" class="tick">years</text>
                    ${gseries ? `<path d="${path(gseries, gseries.length - 1)}" class="ghost"/>` : ''}
                    <path d="${path(series, idx)}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round"/>
                    <line x1="${x0 + yr / 100 * (x1 - x0)}" x2="${x0 + yr / 100 * (x1 - x0)}" y1="${y0}" y2="${y1}" class="cursor"/>
                </svg>
            </figure>`;
    }

    const state = { growth: 0.05, size: 1, rising: false, view: '2d' };
    let ghost = null, run = null, idx = 0, anim = null, model3d = null;

    function renderOil(view) {
        run = simulate(state);
        idx = 0;
        view.innerHTML = `
            <div class="wrap">
                <a class="crumb" href="#/engine-room">← Engine Room</a>
                <div class="er-title">
                    <span class="label">Exhibit No. 1</span>
                    <h1>Does the oil field <u>last</u>?</h1>
                    <p>A company finds a field with enough oil for 200 years at today's pace. It reinvests its profits to grow. Press <b>Run</b> and watch what happens.</p>
                </div>

                <div class="er-viewbar">
                    <span class="label">View</span>
                    <span class="keys">
                        <button type="button" class="key ${state.view === '2d' ? 'on' : ''}" data-view="2d">Drawing</button>
                        <button type="button" class="key ${state.view === '3d' ? 'on' : ''}" data-view="3d">3D Model</button>
                    </span>
                    <span class="er-hint" id="er-hint">${state.view === '3d' ? 'Drag to spin · click a part' : 'Click a part'}</span>
                </div>
                <div class="er-stage ${state.view === '3d' ? 'is-3d' : ''}">
                    ${diagram()}
                    <div class="er-3d" id="er-3d"></div>
                    <div class="er-def" id="er-def" aria-live="polite">
                        <span class="label">Click any part of the machine</span>
                        <p>Tanks, pipes, faucets, clouds and loops all explain themselves.</p>
                    </div>
                </div>

                <div class="console er-console">
                    <button type="button" class="key on er-play" id="er-play">Run</button>
                    <input type="range" id="er-year" min="0" max="${run.t.length - 1}" value="0" aria-label="Year">
                    <span class="type er-year-readout" id="er-year-readout">Year 0</span>
                    <span class="er-control"><span class="er-ctl-label">${term('growth-goal', 'Growth goal')}</span>
                        <span class="keys">${[0.01, 0.03, 0.05, 0.07].map(g => `<button type="button" class="key ${state.growth === g ? 'on' : ''}" data-growth="${g}">${Math.round(g * 100)}%</button>`).join('')}</span></span>
                    <span class="er-control"><span class="er-ctl-label">${term('resource', 'Oil field')}</span>
                        <span class="keys">${[1, 2, 4].map(s => `<button type="button" class="key ${state.size === s ? 'on' : ''}" data-size="${s}">×${s}</button>`).join('')}</span></span>
                    <span class="er-control"><span class="er-ctl-label">${term('price', 'Price')}</span>
                        <span class="keys"><button type="button" class="key ${!state.rising ? 'on' : ''}" data-rising="0">Constant</button><button type="button" class="key ${state.rising ? 'on' : ''}" data-rising="1">Rising</button></span></span>
                </div>

                <div class="er-charts" id="er-charts"></div>
                <div class="er-findings" id="er-findings"></div>

                <div class="er-lessons">
                    <h2>What the machine teaches</h2>
                    <ol>
                        <li>Growth runs on a ${term('reinforcing', 'reinforcing loop')}: more ${term('capital', 'capital')} → more ${term('extraction', 'extraction')} → more ${term('profit', 'profit')} → more capital.</li>
                        <li>A ${term('balancing', 'balancing loop')} ends it: more extraction → less ${term('resource', 'resource')} → lower ${term('yield', 'yield')} → less profit.</li>
                        <li>Faster growth, sooner ${term('peak', 'peak')}. Set the growth goal to 7%.</li>
                        <li>A field twice as big buys less than 20 years at 5% growth, little more than one doubling time of ${term('exponential', 'exponential growth')}. Try ×2, then ×4.</li>
                        <li>Rising prices keep investment going longer. Capital climbs higher, then falls harder. Better technology that cuts costs does the same.</li>
                        <li>The last oil stays underground. Getting it out costs more than it earns.</li>
                        <li>The real choice: get rich fast, or less rich for longer. A miner's job depends on the second.</li>
                    </ol>
                </div>
                <p class="er-credit">Model after Donella H. Meadows, <i>Thinking in Systems: A Primer</i> (2008), chapter 2, “A Renewable Stock Constrained by a Nonrenewable Stock.” Parameters and wording are our own simplification.</p>
            </div>`;

        bind(view);
        paint(view);
        if (state.view === '3d') open3d(view);
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { idx = run.t.length - 1; paint(view); } else play(view);
    }

    function paint(view) {
        const i = idx, maxIdx = run.t.length - 1;
        const capMax = niceMax(Math.max(...run.C));
        // tanks
        const capH = Math.min(90, (run.C[i] / capMax) * 90);
        const capFill = view.querySelector('#er-cap-fill');
        if (!capFill) return;
        capFill.setAttribute('y', 160 - capH); capFill.setAttribute('height', capH);
        const resH = (run.S[i] / run.r0) * 80;
        const resFill = view.querySelector('#er-res-fill');
        resFill.setAttribute('y', 425 - resH); resFill.setAttribute('height', resH);
        view.querySelector('#er-cap-val').textContent = H.fmt(Math.round(run.C[i]));
        view.querySelector('#er-res-val').textContent = H.fmt(Math.round(run.S[i]));
        // flows: liquid width and faucet handle angle
        const flowMax = Math.max(...run.E, ...run.I, 1);
        [['er-inv', run.I[i]], ['er-dep', run.D[i]], ['er-ext', run.E[i]]].forEach(([id, v]) => {
            const f = Math.min(1, v / flowMax);
            view.querySelector(`#${id}-pipe`).setAttribute('stroke-width', (1 + f * 13).toFixed(1));
            view.querySelector(`#${id}-pipe`).style.opacity = v < 0.05 ? 0.15 : 1;
            view.querySelector(`#${id}-handle`).setAttribute('transform', `rotate(${(-90 + f * 90).toFixed(0)})`);
        });
        if (model3d) model3d.update({
            capital: run.C[i], capMax, resource: run.S[i], r0: run.r0,
            investment: run.I[i], depreciation: run.D[i], extraction: run.E[i], flowMax
        });
        // charts and readouts
        view.querySelector('#er-charts').innerHTML =
            chart('Extraction per year', 'E', run, ghost, i, 'var(--mustard)') +
            chart('Capital', 'C', run, ghost, i, 'var(--blue)') +
            chart('Resource left', 'S', run, ghost, i, 'var(--ink)', Math.max(run.r0, ghost ? ghost.r0 : 0));
        view.querySelector('#er-year').value = i;
        view.querySelector('#er-year-readout').textContent = `Year ${Math.round(run.t[i])}`;
        const done = i === maxIdx;
        view.querySelector('#er-findings').innerHTML = done ? `
            <div><span class="label">Extraction peaks</span><b class="type">Year ${Math.round(run.peakExtraction.year)}</b></div>
            <div><span class="label">Capital peaks</span><b class="type">Year ${Math.round(run.peakCapital.year)}</b></div>
            <div><span class="label">Field 95% empty</span><b class="type">${run.depletedYear != null ? 'Year ' + Math.round(run.depletedYear) : 'Not within 100 yrs'}</b></div>
            <div><span class="label">Left in the ground</span><b class="type">${H.fmt(Math.round(run.leftInGround))} of ${H.fmt(run.r0)}</b></div>`
            : `<p class="sub">Findings appear when the run ends. ${ghost ? 'The dashed line is your previous run.' : ''}</p>`;
    }

    function stop() { if (anim) cancelAnimationFrame(anim); anim = null; }

    function play(view) {
        stop();
        const btn = view.querySelector('#er-play');
        if (idx >= run.t.length - 1) idx = 0;
        const start = performance.now(), from = idx, total = run.t.length - 1, ms = 10000 * (1 - from / total);
        btn.textContent = 'Pause';
        const tick = now => {
            if (!document.body.contains(btn)) return stop();
            idx = Math.min(total, Math.round(from + (total - from) * Math.min(1, (now - start) / ms)));
            paint(view);
            if (idx < total) anim = requestAnimationFrame(tick);
            else { anim = null; btn.textContent = 'Run again'; }
        };
        anim = requestAnimationFrame(tick);
    }

    function define(view, key) {
        const g = GLOSSARY[key];
        if (!g) return;
        view.querySelector('#er-def').innerHTML = `<span class="label">${H.esc(g[0])}</span><p>${H.esc(g[1])}</p>`;
        view.querySelectorAll('.er-diagram [data-term]').forEach(el => el.classList.toggle('hl', el.dataset.term === key));
        if (model3d) model3d.highlight(key);
    }

    function close3d() {
        if (model3d) { model3d.dispose(); model3d = null; }
    }

    async function open3d(view) {
        const box = view.querySelector('#er-3d');
        if (!box || model3d) return;
        if (!window.EngineRoom3D) { box.innerHTML = '<p class="er-3d-msg">3D model unavailable.</p>'; return; }
        box.innerHTML = '<p class="er-3d-msg">Assembling the model…</p>';
        try {
            const m = await window.EngineRoom3D.mount(box, { onPick: key => define(view, key) });
            if (!box.isConnected || state.view !== '3d') { m.dispose(); return; }
            box.querySelector('.er-3d-msg')?.remove();
            model3d = m;
            paint(view);
        } catch (err) {
            console.error(err);
            box.innerHTML = '<p class="er-3d-msg">The 3D model could not load (no WebGL or no connection). The drawing still works.</p>';
        }
    }

    function setView(view, mode) {
        state.view = mode;
        view.querySelectorAll('[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === mode));
        view.querySelector('.er-stage').classList.toggle('is-3d', mode === '3d');
        view.querySelector('#er-hint').textContent = mode === '3d' ? 'Drag to spin · click a part' : 'Click a part';
        if (mode === '3d') open3d(view); else close3d();
    }

    function bind(view) {
        // Delegate on the freshly rendered wrapper (the view element itself persists across routes)
        view.querySelector('.wrap').addEventListener('click', ev => {
            const t = ev.target.closest('[data-term]');
            if (t && view.contains(t)) {
                define(view, t.dataset.term);
                if (t.classList.contains('term') && !t.closest('.er-console')) {
                    view.querySelector('.er-stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }
        });
        view.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(view, b.dataset.view)));
        const btn = view.querySelector('#er-play');
        btn.addEventListener('click', () => { if (anim) { stop(); btn.textContent = 'Run'; } else play(view); });
        view.querySelector('#er-year').addEventListener('input', ev => { stop(); btn.textContent = 'Run'; idx = +ev.target.value; paint(view); });

        const rerun = (btns, el) => {
            btns.forEach(x => x.classList.toggle('on', x === el));
            ghost = run;
            run = simulate(state);
            idx = 0;
            play(view);
        };
        const g = view.querySelectorAll('[data-growth]'), s = view.querySelectorAll('[data-size]'), r = view.querySelectorAll('[data-rising]');
        g.forEach(b => b.addEventListener('click', () => { state.growth = +b.dataset.growth; rerun(g, b); }));
        s.forEach(b => b.addEventListener('click', () => { state.size = +b.dataset.size; rerun(s, b); }));
        r.forEach(b => b.addEventListener('click', () => { state.rising = b.dataset.rising === '1'; rerun(r, b); }));
    }

    // ---------- Entry point ----------

    function render(view, parts, helpers) {
        H = helpers;
        stop();
        close3d();
        if (parts[1] === 'oil-economy') renderOil(view);
        else renderHall(view);
    }

    return { render, CONTAINER, simulate };
})();
