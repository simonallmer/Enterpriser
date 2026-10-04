// Engine Room — Learning Curve, Step 3: The Fishery.
// Capital (a fishing fleet) constrained by a renewable resource (fish that breed).
// Structure after Donella H. Meadows, "Thinking in Systems" (2008), ch. 2 and appendix (Figs 42–45).
// Curve shapes, the quota lever, numbers and wording are our own.

window.EngineRoomFishery = (function () {

    const GLOSSARY = {
        'stock': ['Stock', 'Something that piles up and can be counted at any moment: fish in the sea, boats in the harbour. Drawn as a tank.'],
        'flow': ['Flow', 'The rate at which a stock fills or drains, per year. Drawn as a pipe.'],
        'faucet': ['Faucet', 'The valve on a flow. Whatever controls the faucet controls how fast the stock changes.'],
        'cloud': ['Cloud', 'The edge of the model. Fish come from the wider ocean and go to market, but we stop counting there.'],
        'link': ['Information link', 'A thin arrow. One part tells another how far to open its faucet. Nothing physical moves along it.'],
        'reinforcing': ['Reinforcing loop (R)', 'A loop that feeds itself. More boats catch more fish, earn more, buy more boats.'],
        'balancing': ['Balancing loop (B)', 'A loop that pushes back. Fewer fish mean a smaller catch per boat, less profit, fewer new boats.'],
        'capital': ['Fleet (capital)', 'Boats, nets, engines, cold stores: the machines that do the fishing.'],
        'investment': ['Investment', 'Profit put back into new boats. Never more than the growth goal.'],
        'depreciation': ['Depreciation', 'Boats wear out. Each lasts about 20 years, so one twentieth of the fleet disappears every year.'],
        'lifetime': ['Capital lifetime', 'How long one boat lasts before it must be replaced. Here: 20 years.'],
        'growth-goal': ['Growth goal', 'How fast the fleet wants to grow each year.'],
        'profit': ['Profit', 'Income from selling the catch, minus the cost of running the fleet.'],
        'price': ['Price', 'Scarce fish sell dearer. As the catch per boat falls, the price rises, which keeps a shrinking fishery profitable for longer.'],
        'yield': ['Yield per unit capital', 'How many fish one boat brings in per year. It falls as fish get scarce.'],
        'technology': ['Fishing technology', 'Sonar and bigger nets keep the catch per boat high even when fish are scarce. Strong lever: it decides between a steady fishery, swings and collapse.'],
        'resource': ['Renewable resource', 'Fish in the sea. Unlike oil, this stock has an inflow: fish make more fish.'],
        'harvest': ['Harvest', 'Fish taken out per year: boats × catch per boat (or the quota, if lower).'],
        'regeneration': ['Regeneration', 'Fish born per year. The inflow that makes the resource renewable.'],
        'regeneration-rate': ['Regeneration rate', 'Breeding is slow when the sea is crowded and slow when fish are too few to find each other. It is fastest in between.'],
        'quota': ['Quota', 'A limit on the harvest per year. Not part of the book’s model: our addition, to show a lever that works.'],
        'flow-limited': ['Flow-limited', 'A renewable resource can be fished forever, but only as fast as it regrows. Take more, and it may stop being renewable.'],
        'threshold': ['Critical threshold', 'Below some number, fish can no longer rebuild their population. Past it, the renewable becomes nonrenewable.']
    };

    // ---------- Model ----------
    const R0 = 1000, K0 = 5, LIFETIME = 20, GROWTH = 0.10, YEARS = 150;
    const TECH = { nets: 2, sonar: 3, trawlers: 5 };   // yield efficiency exponent
    const TECH_LABEL = { nets: 'Nets', sonar: 'Sonar', trawlers: 'Factory trawlers' };

    function simulate({ tech, quota }) {
        const e = TECH[tech], dt = 0.05, every = 20;
        let R = R0, K = K0;
        const t = [], H = [], C = [], S = [], G = [], I = [], D = [];
        for (let step = 0; step <= YEARS / dt; step++) {
            const f = Math.max(0, R / R0);
            const regen = R * 2 * f * (1 - f);                 // fastest at middle density, zero when full or empty
            const y = f > 0 ? Math.pow(f, 1 / e) : 0;          // better technology keeps yield high at low density
            let harvest = Math.min(K * y, R / dt);
            if (quota) harvest = Math.min(harvest, quota);
            const price = 1.2 + 8.8 * Math.pow(1 - y, 3);      // scarcer fish sell dearer
            const profit = price * harvest - K;
            const investment = Math.max(0, Math.min(profit, GROWTH * K));
            const depreciation = K / LIFETIME;
            if (step % every === 0) { t.push(step * dt); H.push(harvest); C.push(K); S.push(R); G.push(regen); I.push(investment); D.push(depreciation); }
            K += (investment - depreciation) * dt;
            R += (regen - harvest) * dt;
        }
        const peak = arr => arr.reduce((b, v, i) => v > arr[b] ? i : b, 0);
        const ph = peak(H);
        const late = S.slice(Math.floor(S.length * 0.75));
        const swing = (Math.max(...late) - Math.min(...late)) / Math.max(1, Math.max(...late));
        const end = S.length - 1;
        const outcome = S[end] < 20 ? 'collapse' : swing > 0.08 ? 'swings' : 'settles';
        return { t, H, C, S, G, I, D, peakHarvest: { year: t[ph], value: H[ph] }, outcome, end };
    }

    // ---------- Drawing ----------
    let H_;
    const term = (key, text) => `<button type="button" class="term" data-term="${key}">${text}</button>`;
    const valve = (x, y, id, key) => `
        <g class="valve" data-term="${key}" transform="translate(${x} ${y})">
            <path d="M-12 -9 L12 9 L12 -9 L-12 9 Z" fill="var(--ink)"/>
            <g class="handle" id="${id}"><line x1="0" y1="0" x2="0" y2="-20" stroke="var(--ink)" stroke-width="3"/><line x1="-10" y1="-20" x2="10" y2="-20" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/></g>
            <circle r="3.5" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
        </g>`;
    const cloud = (x, y) => `<path data-term="cloud" class="cloud" transform="translate(${x} ${y})" d="M-26 8 a10 10 0 0 1 2-19 a13 13 0 0 1 24-5 a11 11 0 0 1 20 6 a9 9 0 0 1 4 18 Z"/>`;
    const conv = (x, y, label, key, anchor = 'middle', dx = 0, dy = -12) => `
        <g class="conv" data-term="${key}"><circle cx="${x}" cy="${y}" r="7"/><text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}">${label}</text></g>`;
    const link = (d, key = 'link') => `<path class="link" data-term="${key}" d="${d}" marker-end="url(#ef-arrow)"/>`;
    const waves = (x0, x1, y) => {
        let d = `M${x0} ${y}`;
        for (let x = x0; x < x1; x += 20) d += ` q5 -6 10 0 t10 0`;
        return d;
    };

    function diagram() {
        return `
        <svg class="er-diagram" viewBox="0 0 760 500" role="img" aria-label="Stock and flow diagram of a fishery: fleet capital with investment and depreciation, fish with regeneration and harvest, and their loops">
            <defs>
                <marker id="ef-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--ink-2)"/></marker>
                <marker id="ef-flowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="18" markerHeight="18" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--ink)"/></marker>
                <clipPath id="ef-cap-clip"><rect x="320" y="70" width="150" height="90"/></clipPath>
                <clipPath id="ef-sea-clip"><rect x="270" y="370" width="200" height="80"/></clipPath>
            </defs>

            <!-- the sea -->
            <rect x="0" y="315" width="760" height="185" fill="var(--blue)" opacity=".1"/>
            <path d="${waves(0, 760, 315)}" fill="none" stroke="var(--blue)" stroke-width="2" opacity=".6"/>
            <text x="12" y="306" class="er-small">HARBOUR</text><text x="12" y="334" class="er-small">SEA</text>

            <!-- fleet: investment → capital → depreciation -->
            ${cloud(70, 116)}
            <line class="pipe" x1="96" y1="115" x2="318" y2="115"/>
            <line class="liquid" id="ef-inv-pipe" data-term="investment" x1="96" y1="115" x2="312" y2="115" stroke="var(--green)" marker-end="url(#ef-flowhead)"/>
            ${valve(210, 115, 'ef-inv-handle', 'investment')}
            <text x="210" y="148" text-anchor="middle" class="er-label" data-term="investment">investment</text>
            <g data-term="capital" class="stock">
                <rect x="320" y="70" width="150" height="90" class="tank"/>
                <rect id="ef-cap-fill" x="320" y="160" width="150" height="0" fill="var(--red)" clip-path="url(#ef-cap-clip)"/>
                <rect x="320" y="70" width="150" height="90" class="tank-frame"/>
                <text x="395" y="62" text-anchor="middle" class="er-label">fleet (capital)</text>
                <text id="ef-cap-val" x="395" y="122" text-anchor="middle" class="er-value">5</text>
            </g>
            <line class="pipe" x1="470" y1="115" x2="676" y2="115"/>
            <line class="liquid" id="ef-dep-pipe" data-term="depreciation" x1="472" y1="115" x2="666" y2="115" stroke="var(--ink-3)" marker-end="url(#ef-flowhead)"/>
            ${valve(570, 115, 'ef-dep-handle', 'depreciation')}
            <text x="570" y="148" text-anchor="middle" class="er-label" data-term="depreciation">depreciation</text>
            ${cloud(700, 116)}

            <!-- fish: regeneration → sea → harvest -->
            ${cloud(70, 411)}
            <line class="pipe" x1="96" y1="410" x2="268" y2="410"/>
            <line class="liquid" id="ef-reg-pipe" data-term="regeneration" x1="96" y1="410" x2="262" y2="410" stroke="var(--teal)" marker-end="url(#ef-flowhead)"/>
            ${valve(180, 410, 'ef-reg-handle', 'regeneration')}
            <text x="180" y="443" text-anchor="middle" class="er-label" data-term="regeneration">regeneration</text>
            <g data-term="resource" class="stock">
                <rect x="270" y="370" width="200" height="80" class="tank"/>
                <rect id="ef-sea-fill" x="270" y="370" width="200" height="80" fill="var(--blue)" clip-path="url(#ef-sea-clip)"/>
                <rect x="270" y="370" width="200" height="80" class="tank-frame"/>
                <text x="370" y="468" text-anchor="middle" class="er-label">fish in the sea (renewable)</text>
                <text id="ef-sea-val" x="370" y="416" text-anchor="middle" class="er-value">1,000</text>
            </g>
            <line class="pipe" x1="470" y1="410" x2="646" y2="410"/>
            <line class="liquid" id="ef-har-pipe" data-term="harvest" x1="472" y1="410" x2="636" y2="410" stroke="var(--mustard)" marker-end="url(#ef-flowhead)"/>
            ${valve(560, 410, 'ef-har-handle', 'harvest')}
            <text x="560" y="443" text-anchor="middle" class="er-label" data-term="harvest">harvest</text>
            ${cloud(670, 411)}
            <text x="672" y="440" text-anchor="middle" class="er-small">MARKET</text>

            <!-- converters -->
            ${conv(395, 24, 'growth goal', 'growth-goal')}
            ${conv(640, 180, 'capital lifetime', 'lifetime', 'start', 12, 4)}
            ${conv(200, 232, 'profit', 'profit', 'end', -12, 4)}
            ${conv(90, 280, 'price', 'price', 'end', -12, 4)}
            ${conv(470, 300, 'yield per unit capital', 'yield', 'start', 12, 4)}
            ${conv(640, 270, 'fishing technology', 'technology', 'start', 12, 4)}
            ${conv(140, 340, 'regeneration rate', 'regeneration-rate', 'end', -12, 4)}
            ${conv(700, 350, 'quota', 'quota', 'start', 12, 4)}

            <!-- information links -->
            ${link('M389 30 Q330 60 222 104', 'growth-goal')}
            ${link('M193 225 Q190 180 207 132', 'profit')}
            ${link('M96 274 Q140 240 192 233', 'price')}
            ${link('M463 302 Q260 330 97 284', 'price')}
            ${link('M440 160 Q520 280 556 393', 'harvest')}
            ${link('M552 394 Q380 300 207 237', 'profit')}
            ${link('M440 372 Q450 330 466 307', 'yield')}
            ${link('M478 306 Q540 330 554 392', 'yield')}
            ${link('M633 272 Q560 280 478 298', 'technology')}
            ${link('M696 356 Q640 380 572 404', 'quota')}
            ${link('M300 372 Q240 330 147 340', 'regeneration-rate')}
            ${link('M146 347 Q160 370 176 393', 'regeneration-rate')}
            ${link('M460 92 Q520 70 564 102', 'depreciation')}
            ${link('M632 176 Q600 160 578 130', 'lifetime')}

            <!-- loops -->
            <g class="loop" data-term="reinforcing"><circle cx="262" cy="190" r="17" fill="var(--red)"/><text x="262" y="196" text-anchor="middle">R</text></g>
            <g class="loop" data-term="balancing"><circle cx="520" cy="196" r="17" fill="var(--blue)"/><text x="520" y="202" text-anchor="middle">B</text></g>
            <g class="loop" data-term="balancing"><circle cx="380" cy="262" r="17" fill="var(--blue)"/><text x="380" y="268" text-anchor="middle">B</text></g>
            <g class="loop" data-term="regeneration-rate"><circle cx="215" cy="372" r="17" fill="var(--teal)"/><text x="215" y="378" text-anchor="middle">B</text></g>
        </svg>`;
    }

    function niceMax(v) {
        const steps = [10, 20, 25, 50, 100, 200, 250, 400, 500, 1000, 2000];
        return steps.find(s => s >= v * 1.05) || Math.ceil(v / 1000) * 1000;
    }

    function chart(title, key, run, ghost, idx, color, fixedMax) {
        const W = 320, Hh = 150, x0 = 40, x1 = 310, y0 = 12, y1 = 118;
        const series = run[key], gseries = ghost ? ghost[key] : null;
        const max = fixedMax || niceMax(Math.max(...series, ...(gseries || [0])));
        const X = i => x0 + (run.t[i] / YEARS) * (x1 - x0);
        const Y = v => y1 - (v / max) * (y1 - y0);
        const path = (arr, upto) => arr.slice(0, upto + 1).map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
        const yr = run.t[idx];
        return `
            <figure class="er-chart">
                <figcaption><span class="label">${title}</span><span class="type er-chart-val" style="color:${color}">${H_.fmt(Math.round(series[idx]))}</span></figcaption>
                <svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${title} over ${YEARS} years">
                    ${[0, 0.5, 1].map(f => `<line x1="${x0}" x2="${x1}" y1="${Y(max * f)}" y2="${Y(max * f)}" class="grid"/><text x="${x0 - 6}" y="${Y(max * f) + 4}" text-anchor="end" class="tick">${H_.fmt(max * f)}</text>`).join('')}
                    ${[0, 50, 100, 150].map(y => `<text x="${x0 + y / YEARS * (x1 - x0)}" y="${y1 + 16}" text-anchor="middle" class="tick">${y}</text>`).join('')}
                    <text x="${x1}" y="${y1 + 30}" text-anchor="end" class="tick">years</text>
                    ${gseries ? `<path d="${path(gseries, gseries.length - 1)}" class="ghost"/>` : ''}
                    <path d="${path(series, idx)}" fill="none" stroke="${color}" stroke-width="2.6" stroke-linejoin="round"/>
                    <line x1="${x0 + yr / YEARS * (x1 - x0)}" x2="${x0 + yr / YEARS * (x1 - x0)}" y1="${y0}" y2="${y1}" class="cursor"/>
                </svg>
            </figure>`;
    }

    // ---------- Exhibit ----------
    const state = { tech: 'nets', quota: 0, view: '2d' };
    let run = null, ghost = null, idx = 0, anim = null, model3d = null;

    function render(view, helpers) {
        H_ = helpers;
        stop();
        run = simulate(state);
        idx = 0;
        view.innerHTML = `
            <div class="wrap">
                <a class="crumb" href="#/engine-room">← Engine Room</a>
                <div class="er-title">
                    <span class="label">Learning Curve · Step 3</span>
                    <h1>Can the fish <u>outlast</u> the fleet?</h1>
                    <p>The same company as the oil field, but the resource breeds. A fleet grows on its catch, the fish grow back. Choose the fishing technology, press <b>Run</b>, and watch which of three futures you get.</p>
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
                    <span class="er-control"><span class="er-ctl-label">${term('technology', 'Technology')}</span>
                        <span class="keys">${Object.keys(TECH).map(k => `<button type="button" class="key ${state.tech === k ? 'on' : ''}" data-tech="${k}">${TECH_LABEL[k]}</button>`).join('')}</span></span>
                    <span class="er-control"><span class="er-ctl-label">${term('quota', 'Quota')}</span>
                        <span class="keys">${[0, 250, 200].map(q => `<button type="button" class="key ${state.quota === q ? 'on' : ''}" data-quota="${q}">${q ? q + ' / yr' : 'None'}</button>`).join('')}</span></span>
                </div>

                <div class="er-charts" id="er-charts"></div>
                <div class="er-findings" id="er-findings"></div>

                <div class="er-lessons">
                    <h2>What the sea teaches</h2>
                    <ol>
                        <li>Fish make more fish. A ${term('resource', 'renewable resource')} can be harvested forever, but only as fast as it regrows. It is ${term('flow-limited', 'flow-limited')}; oil was stock-limited.</li>
                        <li>${term('regeneration-rate', 'Regrowth')} is fastest at a middle density. A full sea and an empty sea both breed slowly.</li>
                        <li>With plain nets, the catch overshoots a little, then settles. A steady harvest, every year, forever.</li>
                        <li>Add sonar. Each boat keeps catching as fish get scarce, so the fleet grows too far. The fishery swings. A strong lever, pulled the wrong way.</li>
                        <li>Factory trawlers still profit at very low fish numbers. The fish pass a ${term('threshold', 'critical threshold')}, and fish and fleet collapse together. The renewable became nonrenewable.</li>
                        <li>Now give the trawlers a ${term('quota', 'quota')} below what the sea can regrow. Same boats, same sonar, and the fishery runs forever.</li>
                        <li>The difference: a balancing loop fast and strong enough to stop the fleet before the fish reach the threshold.</li>
                    </ol>
                </div>

                <div class="er-next">
                    <a href="#/engine-room/oil-economy" class="er-prev">← Step 2: The Oil Economy</a>
                </div>
                <p class="er-credit">Model after Donella H. Meadows, <i>Thinking in Systems: A Primer</i> (2008), chapter 2, “Renewable Stock Constrained by a Renewable Stock.” Curve shapes, the quota, parameters and wording are our own simplification.</p>
            </div>`;

        bind(view);
        paint(view);
        if (state.view === '3d') open3d(view);
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { idx = run.t.length - 1; paint(view); } else play(view);
    }

    function paint(view) {
        const i = idx, last = run.t.length - 1;
        const capFill = view.querySelector('#ef-cap-fill');
        if (!capFill) return;
        const capMax = niceMax(Math.max(...run.C));
        const capH = Math.min(90, (run.C[i] / capMax) * 90);
        capFill.setAttribute('y', 160 - capH); capFill.setAttribute('height', capH);
        const seaH = Math.max(0, Math.min(80, (run.S[i] / R0) * 80));
        const seaFill = view.querySelector('#ef-sea-fill');
        seaFill.setAttribute('y', 450 - seaH); seaFill.setAttribute('height', seaH);
        view.querySelector('#ef-cap-val').textContent = H_.fmt(Math.round(run.C[i]));
        view.querySelector('#ef-sea-val').textContent = H_.fmt(Math.round(run.S[i]));
        const flowMax = Math.max(...run.H, ...run.G, ...run.I, 1);
        [['ef-inv', run.I[i]], ['ef-dep', run.D[i]], ['ef-reg', run.G[i]], ['ef-har', run.H[i]]].forEach(([id, v]) => {
            const f = Math.min(1, v / flowMax);
            view.querySelector(`#${id}-pipe`).setAttribute('stroke-width', (1 + f * 13).toFixed(1));
            view.querySelector(`#${id}-pipe`).style.opacity = v < 0.05 ? 0.15 : 1;
            view.querySelector(`#${id}-handle`).setAttribute('transform', `rotate(${(-90 + f * 90).toFixed(0)})`);
        });
        if (model3d) model3d.update({
            capital: run.C[i], capMax, fish: run.S[i], r0: R0,
            investment: run.I[i], depreciation: run.D[i], regeneration: run.G[i], harvest: run.H[i], flowMax
        });

        view.querySelector('#er-charts').innerHTML =
            chart('Harvest per year', 'H', run, ghost, i, 'var(--mustard)') +
            chart('Fleet', 'C', run, ghost, i, 'var(--red)') +
            chart('Fish in the sea', 'S', run, ghost, i, 'var(--blue)', R0);
        view.querySelector('#er-year').value = i;
        view.querySelector('#er-year-readout').textContent = `Year ${Math.round(run.t[i])}`;
        const OUT = { settles: 'Settles: a steady catch', swings: 'Swings around a steady catch', collapse: 'Collapse: fish and fleet gone' };
        view.querySelector('#er-findings').innerHTML = i === last ? `
            <div><span class="label">Outcome</span><b class="type">${OUT[run.outcome]}</b></div>
            <div><span class="label">Harvest peaks</span><b class="type">${H_.fmt(Math.round(run.peakHarvest.value))} · year ${Math.round(run.peakHarvest.year)}</b></div>
            <div><span class="label">Harvest in year ${YEARS}</span><b class="type">${H_.fmt(Math.round(run.H[last]))} / yr</b></div>
            <div><span class="label">Fish left in year ${YEARS}</span><b class="type">${H_.fmt(Math.round(run.S[last]))} of ${H_.fmt(R0)}</b></div>`
            : `<p class="sub">Findings appear when the run ends. ${ghost ? 'The dashed line is your previous run.' : ''}</p>`;
    }

    function stop() { if (anim) cancelAnimationFrame(anim); anim = null; }

    function play(view) {
        stop();
        const btn = view.querySelector('#er-play');
        const total = run.t.length - 1;
        if (idx >= total) idx = 0;
        const start = performance.now(), from = idx, ms = 12000 * (1 - from / total);
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
        view.querySelector('#er-def').innerHTML = `<span class="label">${H_.esc(g[0])}</span><p>${H_.esc(g[1])}</p>`;
        view.querySelectorAll('.er-diagram [data-term]').forEach(el => el.classList.toggle('hl', el.dataset.term === key));
        if (model3d) model3d.highlight(key);
    }

    function close3d() { if (model3d) { model3d.dispose(); model3d = null; } }

    async function open3d(view) {
        const box = view.querySelector('#er-3d');
        if (!box || model3d) return;
        if (!window.EngineRoomFishery3D) { box.innerHTML = '<p class="er-3d-msg">3D model unavailable.</p>'; return; }
        box.innerHTML = '<p class="er-3d-msg">Filling the sea…</p>';
        try {
            const m = await window.EngineRoomFishery3D.mount(box, { onPick: key => define(view, key) });
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
        const wrap = view.querySelector('.wrap');
        wrap.addEventListener('click', ev => {
            const t = ev.target.closest('[data-term]');
            if (t && wrap.contains(t)) {
                define(view, t.dataset.term);
                if (t.classList.contains('term') && !t.closest('.er-console')) view.querySelector('.er-stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
        view.querySelectorAll('[data-view]').forEach(b => b.addEventListener('click', () => setView(view, b.dataset.view)));
        const btn = view.querySelector('#er-play');
        btn.addEventListener('click', () => { if (anim) { stop(); btn.textContent = 'Run'; } else play(view); });
        view.querySelector('#er-year').addEventListener('input', ev => { stop(); btn.textContent = 'Run'; idx = +ev.target.value; paint(view); });
        const rerun = () => {
            view.querySelectorAll('[data-tech]').forEach(b => b.classList.toggle('on', b.dataset.tech === state.tech));
            view.querySelectorAll('[data-quota]').forEach(b => b.classList.toggle('on', +b.dataset.quota === state.quota));
            ghost = run; run = simulate(state); idx = 0; play(view);
        };
        view.querySelectorAll('[data-tech]').forEach(b => b.addEventListener('click', () => { state.tech = b.dataset.tech; rerun(); }));
        view.querySelectorAll('[data-quota]').forEach(b => b.addEventListener('click', () => { state.quota = +b.dataset.quota; rerun(); }));
    }

    function leave() { stop(); close3d(); }

    return { render, leave, simulate };
})();
