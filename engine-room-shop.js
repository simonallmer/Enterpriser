// Engine Room — Learning Curve, Step 1: The Bicycle Shop.
// A thermostat in business clothes: one stock (bikes on the floor), two competing balancing loops
// (sales drain it, reorders refill it), then delays. Structure after Donella H. Meadows,
// "Thinking in Systems" (2008), ch. 2 (thermostat; business inventory). Example, numbers and wording are our own.

window.EngineRoomShop = (function () {

    const GLOSSARY = {
        'stock': ['Stock', 'Something that piles up and can be counted at any moment. Here: bikes on the shop floor. Drawn as a tank.'],
        'flow': ['Flow', 'The rate at which a stock fills or drains, per day. Drawn as a pipe.'],
        'faucet': ['Faucet', 'The valve on a flow. Whatever sets the faucet controls how fast the stock changes.'],
        'cloud': ['Cloud', 'The edge of the model. Bikes come from a factory and leave with customers, but we stop counting there.'],
        'link': ['Information link', 'A thin arrow. Information, not bikes: one part tells another how far to open its faucet.'],
        'balancing': ['Balancing loop (B)', 'A loop that pushes a stock toward a goal. Two of them compete here: sales pull the stock down, reorders pull it back up.'],
        'thermostat': ['The thermostat', 'A heater keeps a room warm while heat leaks outside. The shop is the same machine: reorders are the heater, sales are the leak.'],
        'inventory': ['Bikes in the shop', 'The stock. It rises when deliveries beat sales and falls when sales beat deliveries. Nothing else moves it.'],
        'deliveries': ['Deliveries', 'Bikes arriving from the factory. They are the orders of some days ago.'],
        'sales': ['Sales', 'Bikes leaving with customers. You can only sell what is on the floor.'],
        'demand': ['Customer demand', 'How many bikes customers want per day. On day 25 it jumps and stays up.'],
        'perceived-sales': ['Perceived sales', 'What the owner believes daily sales are. She averages the last days to ignore random blips.'],
        'desired': ['Goal: days of cover', 'The owner wants enough bikes for 10 days of sales. When perceived sales rise, the goal rises too.'],
        'gap': ['Gap', 'Goal minus bikes on the floor. The bigger the gap, the more she orders.'],
        'orders': ['Orders', 'Bikes ordered per day: close part of the gap, and (if she remembers) replace what she expects to sell.'],
        'expected': ['Order for expected sales', 'Replace the bikes you expect to sell while you wait. Forget it, and the shop never reaches its goal: the leak wins a little.'],
        'delay': ['Delay', 'Time between cause and effect. Delays in a balancing loop make a system swing past its goal.'],
        'perception-delay': ['Perception delay', 'Days of sales the owner averages before believing a change is real.'],
        'reaction-time': ['Reaction time', 'Days she takes to close a gap. 3 days means she orders a third of the gap each day.'],
        'delivery-delay': ['Delivery delay', 'Days from order to delivery. The one delay the owner cannot control.'],
        'oscillation': ['Oscillation', 'Swinging above and below the goal. Not a mistake by the owner: the result of acting on old information.']
    };

    let H;
    const term = (key, text) => `<button type="button" class="term" data-term="${key}">${text}</button>`;

    // ---------- Model ----------
    const BASE = 20, COVER = 10, DAYS = 100, JUMP_DAY = 25, STAGES = 6;

    function simulate({ expected, perception, reaction, delivery, jump }) {
        const dt = 0.125, every = 8;
        let inv = BASE * COVER, perceived = BASE;
        const stages = Array(STAGES).fill(BASE * delivery / STAGES);
        const out = { t: [], inv: [], sales: [], perceived: [], orders: [], deliveries: [], goal: [], demand: [] };
        for (let k = 0; k <= DAYS / dt; k++) {
            const t = k * dt;
            const demand = BASE * (t >= JUMP_DAY ? 1 + jump : 1);
            const sales = Math.min(demand, inv / dt);
            perceived = perception > 0 ? perceived + (sales - perceived) / perception * dt : sales;
            const goal = COVER * perceived;
            const orders = Math.max(0, (expected ? perceived : 0) + (goal - inv) / reaction);
            let deliveries;
            if (delivery > 0) {
                const tau = delivery / STAGES, flows = stages.map(s => s / tau);
                deliveries = flows[STAGES - 1];
                stages[0] += (orders - flows[0]) * dt;
                for (let i = 1; i < STAGES; i++) stages[i] += (flows[i - 1] - flows[i]) * dt;
            } else deliveries = orders;
            if (k % every === 0) {
                out.t.push(t); out.inv.push(inv); out.sales.push(sales); out.perceived.push(perceived);
                out.orders.push(orders); out.deliveries.push(deliveries); out.goal.push(goal); out.demand.push(demand);
            }
            inv += (deliveries - sales) * dt;
        }
        const after = out.t.map((t, i) => i).filter(i => out.t[i] >= JUMP_DAY);
        const lo = after.reduce((a, i) => out.inv[i] < out.inv[a] ? i : a, after[0]);
        const hi = after.reduce((a, i) => out.inv[i] > out.inv[a] ? i : a, after[0]);
        const last = out.inv.length - 1, finalGoal = out.goal[last];
        let calm = null;
        for (let i = last; i >= 0; i--) {
            if (Math.abs(out.inv[i] - finalGoal) > finalGoal * 0.05) { calm = i === last ? null : out.t[i + 1]; break; }
        }
        out.findings = { low: [out.inv[lo], out.t[lo]], high: [out.inv[hi], out.t[hi]], endGap: out.inv[last] - finalGoal, calm };
        return out;
    }

    // ---------- Drawing (same notation as the oil economy) ----------
    const valve = (x, y, id, key) => `
        <g class="valve" data-term="${key}" transform="translate(${x} ${y})">
            <path d="M-12 -9 L12 9 L12 -9 L-12 9 Z" fill="var(--ink)"/>
            <g class="handle" id="${id}"><line x1="0" y1="0" x2="0" y2="-20" stroke="var(--ink)" stroke-width="3"/><line x1="-10" y1="-20" x2="10" y2="-20" stroke="var(--ink)" stroke-width="4" stroke-linecap="round"/></g>
            <circle r="3.5" fill="var(--paper)" stroke="var(--ink)" stroke-width="1.5"/>
        </g>`;
    const cloud = (x, y) => `<path data-term="cloud" class="cloud" transform="translate(${x} ${y})" d="M-26 8 a10 10 0 0 1 2-19 a13 13 0 0 1 24-5 a11 11 0 0 1 20 6 a9 9 0 0 1 4 18 Z"/>`;
    const conv = (x, y, label, key, anchor = 'middle', dx = 0, dy = -12) => `
        <g class="conv" data-term="${key}"><circle cx="${x}" cy="${y}" r="7"/><text x="${x + dx}" y="${y + dy}" text-anchor="${anchor}">${label}</text></g>`;
    const link = (d, key = 'link') => `<path class="link" data-term="${key}" d="${d}" marker-end="url(#es-arrow)"/>`;
    // Delay mark: two short strokes across a link (Meadows' notation)
    const delayMark = (x, y, angle, key, text, tx, ty) => `
        <g class="delay" data-term="${key}">
            <g transform="translate(${x} ${y}) rotate(${angle})"><line x1="-3" y1="-8" x2="-3" y2="8"/><line x1="3" y1="-8" x2="3" y2="8"/></g>
            <text x="${tx}" y="${ty}" class="er-small">${text}</text>
        </g>`;

    function diagram() {
        return `
        <svg class="er-diagram" viewBox="0 0 760 450" role="img" aria-label="Stock and flow diagram of a bicycle shop: deliveries fill the stock of bikes, sales drain it, orders close the gap to a goal, with delays">
            <defs>
                <marker id="es-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10 Z" fill="var(--ink-2)"/></marker>
                <marker id="es-flowhead" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="18" markerHeight="18" markerUnits="userSpaceOnUse" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--ink)"/></marker>
                <clipPath id="es-tank-clip"><rect x="320" y="110" width="150" height="120"/></clipPath>
            </defs>

            <!-- deliveries: factory → faucet → shop -->
            ${cloud(70, 171)}
            <text x="62" y="200" text-anchor="middle" class="er-small">FACTORY</text>
            <line class="pipe" x1="96" y1="170" x2="318" y2="170"/>
            <line class="liquid" id="es-del-pipe" data-term="deliveries" x1="96" y1="170" x2="312" y2="170" stroke="var(--blue)" marker-end="url(#es-flowhead)"/>
            ${valve(205, 170, 'es-del-handle', 'deliveries')}
            <text x="205" y="203" text-anchor="middle" class="er-label" data-term="deliveries">deliveries</text>

            <!-- stock -->
            <g data-term="inventory" class="stock">
                <rect x="320" y="110" width="150" height="120" class="tank"/>
                <rect id="es-fill" x="320" y="230" width="150" height="0" fill="var(--teal)" clip-path="url(#es-tank-clip)"/>
                <rect x="320" y="110" width="150" height="120" class="tank-frame"/>
                <text x="395" y="100" text-anchor="middle" class="er-label">bikes in the shop</text>
                <text id="es-val" x="395" y="178" text-anchor="middle" class="er-value">200</text>
            </g>
            <g data-term="desired"><line id="es-goal" x1="314" x2="476" y1="150" y2="150" stroke="var(--red)" stroke-width="2.5" stroke-dasharray="6 4"/>
                <text id="es-goal-label" x="480" y="154" class="er-small" fill="var(--red)">GOAL</text></g>

            <!-- sales: shop → faucet → customers -->
            <line class="pipe" x1="470" y1="170" x2="676" y2="170"/>
            <line class="liquid" id="es-sal-pipe" data-term="sales" x1="472" y1="170" x2="666" y2="170" stroke="var(--mustard)" marker-end="url(#es-flowhead)"/>
            ${valve(575, 170, 'es-sal-handle', 'sales')}
            <text x="575" y="203" text-anchor="middle" class="er-label" data-term="sales">sales</text>
            ${cloud(700, 171)}
            <text x="704" y="200" text-anchor="middle" class="er-small">CUSTOMERS</text>

            <!-- converters -->
            ${conv(660, 300, 'customer demand', 'demand', 'middle', 0, 24)}
            ${conv(520, 330, 'perceived sales', 'perceived-sales', 'middle', 0, 24)}
            ${conv(395, 300, 'goal: 10 days of cover', 'desired', 'middle', 0, 24)}
            ${conv(300, 270, 'gap', 'gap', 'end', -12, 4)}
            ${conv(170, 300, 'orders', 'orders', 'middle', 0, 24)}
            ${conv(80, 380, 'reaction time', 'reaction-time', 'start', 12, 4)}

            <!-- information links -->
            ${link('M654 294 Q620 230 584 186', 'demand')}
            ${link('M575 182 Q570 270 527 323', 'perceived-sales')}
            ${delayMark(560, 262, 70, 'perception-delay', 'PERCEPTION DELAY', 584, 262)}
            ${link('M513 330 Q450 330 403 303', 'perceived-sales')}
            ${link('M388 296 Q340 290 307 274', 'desired')}
            ${link('M350 232 Q330 250 305 263', 'inventory')}
            ${link('M294 276 Q240 300 178 300', 'gap')}
            ${link('M520 338 Q360 420 176 307', 'expected')}
            ${link('M86 374 Q120 330 164 305', 'reaction-time')}
            ${link('M166 292 Q160 240 200 186', 'orders')}
            ${delayMark(171, 245, 0, 'delivery-delay', 'DELIVERY DELAY', 84, 250)}

            <!-- loops -->
            <g class="loop" data-term="balancing"><circle cx="255" cy="232" r="17" fill="var(--blue)"/><text x="255" y="238" text-anchor="middle">B</text></g>
            <g class="loop" data-term="balancing"><circle cx="545" cy="232" r="17" fill="var(--blue)"/><text x="545" y="238" text-anchor="middle">B</text></g>
            <text x="395" y="438" text-anchor="middle" class="er-small" data-term="thermostat">THE SAME MACHINE AS A THERMOSTAT · CLICK TO SEE WHY</text>
        </svg>`;
    }

    // ---------- Charts ----------
    function niceMax(v) {
        const steps = [10, 20, 25, 30, 40, 50, 60, 80, 100, 150, 200, 250, 300, 400, 500, 600, 800, 1000];
        return steps.find(s => s >= v * 1.05) || Math.ceil(v / 100) * 100;
    }

    function chart(title, lines, idx, max, ghost) {
        const W = 320, Hh = 150, x0 = 40, x1 = 310, y0 = 12, y1 = 118;
        const X = i => x0 + (i / DAYS) * (x1 - x0);
        const Y = v => y1 - (Math.min(v, max) / max) * (y1 - y0);
        const path = (arr, upto) => arr.slice(0, upto + 1).map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(v).toFixed(1)}`).join(' ');
        return `
            <figure class="er-chart">
                <figcaption><span class="label">${title}</span><span class="er-legend">${lines.map(l => `<i style="--c:${l.color}" class="${l.dash ? 'dash' : ''}"></i>${l.name}`).join(' ')}</span></figcaption>
                <svg viewBox="0 0 ${W} ${Hh}" role="img" aria-label="${title} over ${DAYS} days">
                    ${[0, 0.5, 1].map(f => `<line x1="${x0}" x2="${x1}" y1="${Y(max * f)}" y2="${Y(max * f)}" class="grid"/><text x="${x0 - 6}" y="${Y(max * f) + 4}" text-anchor="end" class="tick">${H.fmt(max * f)}</text>`).join('')}
                    ${[0, 25, 50, 75, 100].map(d => `<text x="${X(d)}" y="${y1 + 16}" text-anchor="middle" class="tick">${d}</text>`).join('')}
                    <text x="${x1}" y="${y1 + 30}" text-anchor="end" class="tick">days</text>
                    <line x1="${X(JUMP_DAY)}" x2="${X(JUMP_DAY)}" y1="${y0}" y2="${y1}" class="grid" stroke-dasharray="2 3"/>
                    ${ghost ? `<path d="${path(ghost, ghost.length - 1)}" class="ghost"/>` : ''}
                    ${lines.map(l => `<path d="${path(l.data, idx)}" fill="none" stroke="${l.color}" stroke-width="${l.dash ? 1.8 : 2.6}" ${l.dash ? 'stroke-dasharray="5 4"' : ''} stroke-linejoin="round"/>`).join('')}
                    <line x1="${X(idx)}" x2="${X(idx)}" y1="${y0}" y2="${y1}" class="cursor"/>
                </svg>
            </figure>`;
    }

    // ---------- Exhibit ----------
    const PRESETS = {
        thermostat: { expected: false, perception: 0, reaction: 3, delivery: 0 },
        higher: { expected: true, perception: 0, reaction: 3, delivery: 0 },
        real: { expected: true, perception: 5, reaction: 3, delivery: 5 },
        faster: { expected: true, perception: 5, reaction: 2, delivery: 5 },
        slower: { expected: true, perception: 5, reaction: 6, delivery: 5 }
    };
    const state = { ...PRESETS.thermostat, jump: 0.1 };
    let run = null, ghost = null, idx = 0, anim = null;

    const keyRow = (label, termKey, field, options, fmt) => `
        <span class="er-control"><span class="er-ctl-label">${term(termKey, label)}</span>
            <span class="keys">${options.map(v => `<button type="button" class="key ${state[field] === v ? 'on' : ''}" data-field="${field}" data-value="${v}">${fmt(v)}</button>`).join('')}</span></span>`;

    function render(view, helpers) {
        H = helpers;
        stop();
        run = simulate(state);
        idx = 0;
        view.innerHTML = `
            <div class="wrap">
                <a class="crumb" href="#/engine-room">← Engine Room</a>
                <div class="er-title">
                    <span class="label">Learning Curve · Step 1</span>
                    <h1>Why is the shelf never <u>full</u>?</h1>
                    <p>A bicycle shop wants enough bikes on the floor for 10 days of sales. Customers buy, the owner reorders. It is the same machine as a ${term('thermostat', 'thermostat')}. Press <b>Run</b>, then follow the steps below.</p>
                </div>

                <div class="er-viewbar"><span class="label">Drawing</span><span class="er-hint">Click a part</span></div>
                <div class="er-stage">
                    ${diagram()}
                    <div class="er-def" id="er-def" aria-live="polite">
                        <span class="label">Click any part of the machine</span>
                        <p>Tanks, pipes, faucets, clouds, delays and loops all explain themselves.</p>
                    </div>
                </div>

                <div class="console er-console">
                    <button type="button" class="key on er-play" id="er-play">Run</button>
                    <input type="range" id="er-year" min="0" max="${DAYS}" value="0" aria-label="Day">
                    <span class="type er-year-readout" id="er-year-readout">Day 0</span>
                    ${keyRow('Order for expected sales', 'expected', 'expected', [false, true], v => v ? 'Yes' : 'No')}
                    ${keyRow('Perception delay', 'perception-delay', 'perception', [0, 2, 5], v => v ? v + ' d' : 'None')}
                    ${keyRow('Reaction time', 'reaction-time', 'reaction', [2, 3, 6], v => v + ' d')}
                    ${keyRow('Delivery delay', 'delivery-delay', 'delivery', [0, 5, 10], v => v ? v + ' d' : 'None')}
                    ${keyRow('Demand jump', 'demand', 'jump', [0.1, 0.25], v => '+' + Math.round(v * 100) + '%')}
                </div>

                <div class="er-charts" id="er-charts"></div>
                <div class="er-findings" id="er-findings"></div>

                <div class="er-lessons">
                    <h2>Five steps through the machine</h2>
                    <ol>
                        <li><b>The leak.</b> No delays, no ordering for expected sales. The shelf settles well below its goal, because ${term('sales', 'sales')} drain bikes while the owner is closing the ${term('gap', 'gap')}. <button type="button" class="key er-try" data-preset="thermostat">Try</button></li>
                        <li><b>Set it a little higher.</b> Also replace what you expect to sell. Now the shelf reaches its goal. Every thermostat-like system needs this: count the drain. <button type="button" class="key er-try" data-preset="higher">Try</button></li>
                        <li><b>The real world.</b> Add a 5-day ${term('perception-delay', 'perception delay')} and a 5-day ${term('delivery-delay', 'delivery delay')}. One jump in demand, and the stock ${term('oscillation', 'swings')}. <button type="button" class="key er-try" data-preset="real">Try</button></li>
                        <li><b>React faster.</b> Close gaps in 2 days instead of 3. It feels responsible. It makes the swings worse. <button type="button" class="key er-try" data-preset="faster">Try</button></li>
                        <li><b>React slower.</b> Take 6 days. The swings calm down. With ${term('delay', 'delays')} you can't avoid, patience is the lever. <button type="button" class="key er-try" data-preset="slower">Try</button></li>
                    </ol>
                </div>

                <div class="er-next">
                    <a href="#/engine-room/oil-economy" class="btn">Step 2: The Oil Economy →</a>
                </div>
                <p class="er-credit">Structure after Donella H. Meadows, <i>Thinking in Systems: A Primer</i> (2008), chapter 2: the thermostat and business inventory. The bicycle shop, numbers and wording are our own.</p>
            </div>`;
        bind(view);
        paint(view);
        const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduce) { idx = DAYS; paint(view); } else play(view);
    }

    function paint(view) {
        const i = idx;
        const fill = view.querySelector('#es-fill');
        if (!fill) return;
        const tankMax = niceMax(Math.max(400, ...run.inv, ...run.goal));
        const h = v => Math.min(120, (v / tankMax) * 120);
        fill.setAttribute('y', 230 - h(run.inv[i])); fill.setAttribute('height', h(run.inv[i]));
        const gy = 230 - h(run.goal[i]);
        view.querySelector('#es-goal').setAttribute('y1', gy); view.querySelector('#es-goal').setAttribute('y2', gy);
        view.querySelector('#es-goal-label').setAttribute('y', gy + 4);
        view.querySelector('#es-val').textContent = H.fmt(Math.round(run.inv[i]));
        const flowMax = Math.max(...run.deliveries, ...run.sales, 1);
        [['es-del', run.deliveries[i]], ['es-sal', run.sales[i]]].forEach(([id, v]) => {
            const f = Math.min(1, v / flowMax);
            view.querySelector(`#${id}-pipe`).setAttribute('stroke-width', (1 + f * 13).toFixed(1));
            view.querySelector(`#${id}-handle`).setAttribute('transform', `rotate(${(-90 + f * 90).toFixed(0)})`);
        });

        const invMax = niceMax(Math.max(...run.inv, ...run.goal, ...(ghost ? ghost.inv : [0])));
        const flowChartMax = niceMax(Math.max(...run.orders, ...run.deliveries, ...run.sales));
        view.querySelector('#er-charts').innerHTML =
            chart('Bikes in the shop', [{ name: 'bikes', data: run.inv, color: 'var(--teal)' }, { name: 'goal', data: run.goal, color: 'var(--red)', dash: true }], i, invMax, ghost && ghost.inv) +
            chart('Sales per day', [{ name: 'sales', data: run.sales, color: 'var(--mustard)' }, { name: 'perceived', data: run.perceived, color: 'var(--ink)', dash: true }], i, niceMax(Math.max(...run.sales) * 1.2)) +
            chart('Orders & deliveries', [{ name: 'orders', data: run.orders, color: 'var(--green)', dash: true }, { name: 'deliveries', data: run.deliveries, color: 'var(--blue)' }], i, flowChartMax);

        view.querySelector('#er-year').value = i;
        view.querySelector('#er-year-readout').textContent = `Day ${i}`;
        const f = run.findings;
        view.querySelector('#er-findings').innerHTML = i === DAYS ? `
            <div><span class="label">Lowest after the jump</span><b class="type">${H.fmt(Math.round(f.low[0]))} bikes · day ${Math.round(f.low[1])}</b></div>
            <div><span class="label">Highest after the jump</span><b class="type">${H.fmt(Math.round(f.high[0]))} bikes · day ${Math.round(f.high[1])}</b></div>
            <div><span class="label">Gap to goal at day ${DAYS}</span><b class="type">${Math.round(f.endGap) === 0 ? 'On goal' : (f.endGap > 0 ? '+' : '−') + H.fmt(Math.abs(Math.round(f.endGap))) + ' bikes'}</b></div>
            <div><span class="label">Calm (within 5% of goal)</span><b class="type">${f.calm != null ? 'From day ' + Math.round(f.calm) : 'Not yet'}</b></div>`
            : `<p class="sub">Findings appear when the run ends. ${ghost ? 'The grey dashed line is your previous run.' : ''}</p>`;
    }

    function stop() { if (anim) cancelAnimationFrame(anim); anim = null; }

    function play(view) {
        stop();
        const btn = view.querySelector('#er-play');
        if (idx >= DAYS) idx = 0;
        const start = performance.now(), from = idx, ms = 9000 * (1 - from / DAYS);
        btn.textContent = 'Pause';
        const tick = now => {
            if (!document.body.contains(btn)) return stop();
            idx = Math.min(DAYS, Math.round(from + (DAYS - from) * Math.min(1, (now - start) / ms)));
            paint(view);
            if (idx < DAYS) anim = requestAnimationFrame(tick);
            else { anim = null; btn.textContent = 'Run again'; }
        };
        anim = requestAnimationFrame(tick);
    }

    function define(view, key) {
        const g = GLOSSARY[key];
        if (!g) return;
        view.querySelector('#er-def').innerHTML = `<span class="label">${H.esc(g[0])}</span><p>${H.esc(g[1])}</p>`;
        view.querySelectorAll('.er-diagram [data-term]').forEach(el => el.classList.toggle('hl', el.dataset.term === key));
    }

    function syncKeys(view) {
        view.querySelectorAll('[data-field]').forEach(b => {
            const v = b.dataset.value;
            const val = v === 'true' ? true : v === 'false' ? false : +v;
            b.classList.toggle('on', state[b.dataset.field] === val);
        });
    }

    function rerun(view) {
        syncKeys(view);
        ghost = run;
        run = simulate(state);
        idx = 0;
        play(view);
    }

    function bind(view) {
        const wrap = view.querySelector('.wrap');
        wrap.addEventListener('click', ev => {
            const t = ev.target.closest('[data-term]');
            if (t && wrap.contains(t)) {
                define(view, t.dataset.term);
                if (t.classList.contains('term') && !t.closest('.er-console')) view.querySelector('.er-stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            const preset = ev.target.closest('[data-preset]');
            if (preset) {
                Object.assign(state, PRESETS[preset.dataset.preset]);
                view.querySelector('.er-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
                rerun(view);
            }
        });
        view.querySelectorAll('[data-field]').forEach(b => b.addEventListener('click', () => {
            const v = b.dataset.value;
            state[b.dataset.field] = v === 'true' ? true : v === 'false' ? false : +v;
            rerun(view);
        }));
        const btn = view.querySelector('#er-play');
        btn.addEventListener('click', () => { if (anim) { stop(); btn.textContent = 'Run'; } else play(view); });
        view.querySelector('#er-year').addEventListener('input', ev => { stop(); btn.textContent = 'Run'; idx = +ev.target.value; paint(view); });
    }

    return { render, stop };
})();
