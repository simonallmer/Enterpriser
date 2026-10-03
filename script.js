// Enterpriser — standalone app. Renders into #enterpriser, hash-routed:
//   #/            Articles (welcome)
//   #/index       Enterpriser Index
//   #/index/<uid> Index entry
// Style rules: style-doctrine.md. Data rules: schema.md.

(function () {
    const root = document.getElementById('enterpriser');
    if (!root) return;

    const NOW = new Date().getFullYear();
    const MIN_AGE = 5;
    const PAGE = 100;
    const ACC_ORDER = ['green', 'blue', 'yellow', 'red'];
    const ACC_LABEL = {
        green: 'Confirmed: official source, or two sources agree',
        blue: 'Single source',
        yellow: 'Calculated estimate',
        red: 'Unverified: tradition or legend'
    };
    const STATUS_LABEL = { alive: 'Alive', absorbed: 'Absorbed', defunct: 'Defunct' };

    // ---------- Data ----------

    const curated = Object.values(ENTERPRISER_INDEX).map(e => ({ ...e, curated: true }));
    const sp500 = typeof ENTERPRISER_SP500 !== 'undefined' ? Object.values(ENTERPRISER_SP500) : [];
    const ALL = {};
    [...curated, ...sp500].forEach(e => { ALL[e.uid] = e; });

    const entries = Object.values(ALL).filter(e => {
        const ok = NOW - e.founded.year >= MIN_AGE;
        if (!ok) console.warn(`[Enterpriser Index] ${e.uid} excluded: younger than ${MIN_AGE} years.`);
        return ok;
    });

    const ageOf = e => (e.ended ? e.ended.year : NOW) - e.founded.year;
    const lineageAgeOf = e => (e.ended ? e.ended.year : NOW) - (e.lineage || e.founded.year);
    const byAge = [...entries].sort((a, b) => ageOf(b) - ageOf(a));
    const weakest = levels => levels.filter(Boolean)
        .reduce((w, a) => ACC_ORDER.indexOf(a) > ACC_ORDER.indexOf(w) ? a : w, 'green');
    const headcount = e => (e.metrics && e.metrics.headcount) || {};

    // Lifetime average: only when both founding-era and current figures exist. Always yellow.
    const lifetimeAvg = e => {
        const h = headcount(e);
        if (!h.founding || !h.current) return null;
        return Math.round((h.founding.v + h.current.v) / 2);
    };

    const statements = e => {
        const out = [];
        Object.values(e.metrics || {}).forEach(g => Object.values(g).forEach(s => out.push(s)));
        return out;
    };
    const entryAccuracy = e => weakest([e.founded.acc, headcount(e).current && headcount(e).current.acc]);
    const dataYear = e => {
        const years = statements(e).map(s => s.year);
        return years.length ? Math.max(...years) : null;
    };
    const mentionsOf = uid => ENTERPRISER_ARTICLES.filter(a => (a.mentions || []).includes(uid));

    // ---------- Helpers ----------

    const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const fmt = n => n.toLocaleString('en-US');
    const yearLabel = y => y < 1000 ? `${y} CE` : String(y);
    const dot = acc => `<span class="dot ${acc}" title="${esc(ACC_LABEL[acc])}"></span>`;
    const domain = url => { try { return new URL(url).hostname.replace(/^www\./, ''); } catch (e) { return url; } };
    const bulb = (on, cls = '') => `<svg viewBox="0 0 10 10" class="${cls}" aria-hidden="true"><circle cx="5" cy="5" r="4.3" class="${on ? 'bulb-on glow' : 'bulb-off'}"/></svg>`;

    // One lamp per century; the last lamp is dimmed by the fraction of the century reached.
    const centuries = age => {
        const full = Math.floor(age / 100);
        const rest = (age % 100) / 100;
        let out = '';
        for (let i = 0; i < full; i++) out += bulb(true);
        if (rest > 0.05) out += `<svg viewBox="0 0 10 10" aria-hidden="true"><circle cx="5" cy="5" r="4.3" class="bulb-off"/><circle cx="5" cy="5" r="4.3" class="bulb-on" opacity="${rest.toFixed(2)}"/></svg>`;
        return out;
    };

    // ---------- Theme: lights on / lights off ----------

    const isDark = () => {
        const t = document.documentElement.dataset.theme;
        if (t) return t === 'dark';
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    };

    const lampIcon = on => `
        <svg viewBox="0 0 32 32" aria-hidden="true">
            ${on ? `<g stroke="#DDA22C" stroke-width="1.6" stroke-linecap="round">
                <line x1="16" y1="1.5" x2="16" y2="4"/><line x1="5.5" y1="5.5" x2="7.3" y2="7.3"/><line x1="26.5" y1="5.5" x2="24.7" y2="7.3"/>
                <line x1="1.5" y1="14" x2="4" y2="14"/><line x1="30.5" y1="14" x2="28" y2="14"/></g>` : ''}
            <path d="M16 6.5a7.5 7.5 0 0 0-4.6 13.4c.9.7 1.4 1.7 1.4 2.8V24h6.4v-1.3c0-1.1.5-2.1 1.4-2.8A7.5 7.5 0 0 0 16 6.5z"
                fill="${on ? 'url(#ent-bulb-on)' : 'url(#ent-bulb-off)'}" stroke="currentColor" stroke-width="1.2" ${on ? 'class="glow"' : ''}/>
            <rect x="12.6" y="24.6" width="6.8" height="1.8" rx=".6" fill="currentColor"/>
            <rect x="13.2" y="27.2" width="5.6" height="1.6" rx=".6" fill="currentColor"/>
        </svg>`;

    function setTheme(dark) {
        document.documentElement.dataset.theme = dark ? 'dark' : 'light';
        try { localStorage.setItem('enterpriser-theme', dark ? 'dark' : 'light'); } catch (e) { }
        paintLamp();
    }

    function paintLamp() {
        const btn = root.querySelector('.lamp');
        if (!btn) return;
        const dark = isDark();
        btn.innerHTML = lampIcon(!dark);
        btn.setAttribute('aria-label', dark ? 'Lights on (light mode)' : 'Lights off (dark mode)');
        btn.title = dark ? 'Lights on' : 'Lights off';
    }

    // ---------- Shell ----------

    // Logo: a vacuum tube with a glowing filament (Univac 120 reference)
    const logo = `<svg viewBox="0 0 32 40" aria-hidden="true">
        <path d="M8 31 V12 a8 8 0 0 1 16 0 V31 Z" fill="var(--midnight)" stroke="currentColor" stroke-width="1.6"/>
        <path d="M11.5 29 V13 a4.5 4.5 0 0 1 9 0 V29" fill="none" stroke="var(--steel)" stroke-width="1.2" opacity=".8"/>
        <path d="M13.5 26 V18 l2.5 -3 l2.5 3 V26" fill="none" stroke="url(#ent-bulb-on)" stroke-width="2" stroke-linejoin="round" class="glow"/>
        <ellipse cx="13" cy="9.5" rx="1.6" ry="3" fill="#FFFFFF" opacity=".35"/>
        <rect x="6.5" y="31" width="19" height="3.5" rx="1" fill="currentColor"/>
        <g stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="11" y1="34.5" x2="11" y2="39"/><line x1="16" y1="34.5" x2="16" y2="39"/><line x1="21" y1="34.5" x2="21" y2="39"/></g>
    </svg>`;

    root.innerHTML = `
        <svg width="0" height="0" style="position:absolute" aria-hidden="true">
            <defs>
                <radialGradient id="ent-bulb-on" cx="38%" cy="35%" r="70%">
                    <stop offset="0" stop-color="#FFFDF0"/><stop offset=".45" stop-color="#F7E58A"/><stop offset="1" stop-color="#DDA22C"/>
                </radialGradient>
                <radialGradient id="ent-bulb-off" cx="38%" cy="35%" r="70%">
                    <stop offset="0" stop-color="#8E9A9E"/><stop offset=".5" stop-color="#4D5A5E"/><stop offset="1" stop-color="#26302F"/>
                </radialGradient>
            </defs>
        </svg>
        <header class="masthead">
            <div class="wrap">
                <a class="brand" href="#/" aria-label="Enterpriser home">
                    ${logo}
                    <span class="brand-name">Enterpriser</span>
                </a>
                <nav class="nav">
                    <a href="#/" data-nav="articles">Articles</a>
                    <a href="#/index" data-nav="index">Index</a>
                </nav>
                <button class="lamp" type="button"></button>
                <a href="https://simonallmer.com" class="back-link" target="_top">Back to SA</a>
            </div>
        </header>
        <main id="ent-view"></main>
        <footer class="footer">
            <div class="wrap">
                <span class="small">Allmer Journals · Simon Allmer Entertainment</span>
                <span class="sig">Enterpriser</span>
                <span class="small">For those who build</span>
            </div>
        </footer>`;

    const view = root.querySelector('#ent-view');
    root.querySelector('.lamp').addEventListener('click', () => setTheme(!isDark()));
    paintLamp();

    // ---------- Articles ----------

    // 5×7 dot-matrix glyphs for the lamp marquee
    const GLYPHS = {
        B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
        U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
        I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
        L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
        D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110']
    };

    function marquee(word) {
        const cols = word.length * 6 + 1, rows = 9, cell = 20;
        let lit = 0, out = '';
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                const letter = Math.floor((c - 1) / 6), x = (c - 1) % 6, y = r - 1;
                const on = c > 0 && x < 5 && y >= 0 && y < 7 && GLYPHS[word[letter]][y][x] === '1';
                const cx = c * cell + cell / 2, cy = r * cell + cell / 2;
                out += `<circle class="b bulb-off" cx="${cx}" cy="${cy}" r="7.2"/>`;
                if (on) {
                    lit++;
                    out += `<circle class="b bulb-on glow lit" cx="${cx}" cy="${cy}" r="7.2" style="animation-delay:${(300 + c * 55 + (r % 3) * 20)}ms"/>`;
                }
            }
        }
        return { svg: `<svg class="marquee" viewBox="0 0 ${cols * cell} ${rows * cell}" role="img" aria-label="${word} spelled in lamps">${out}</svg>`, lit };
    }

    const NUMERALS = [
        ['7', 8, 18, 64, '#DDA22C'], ['Σ', 84, 12, 40, '#EFE6CF'], ['2', 18, 70, 30, '#EFE6CF'], ['9', 30, 16, 26, '#B5392A'],
        ['λ', 90, 74, 34, '#A7B3B8'], ['5', 72, 10, 58, '#F7E58A'], ['+', 79, 14, 40, '#B5392A'], ['4', 6, 80, 46, '#B5392A'],
        ['÷', 60, 82, 34, '#6FB3E3'], ['8', 46, 8, 30, '#EFE6CF'], ['%', 92, 40, 28, '#DDA22C'], ['3', 3, 44, 38, '#DDA22C']
    ];

    const PICTO = {
        hand: `<svg viewBox="0 0 96 72" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="6" y="58" width="30" height="8" rx="2"/><circle cx="21" cy="54" r="4"/><path d="M21 54 L40 26"/><circle cx="40" cy="26" r="4"/>
                <path d="M40 26 L66 20"/><path d="M66 20 l10 -8 M66 20 l12 4"/><circle cx="84" cy="44" r="7" fill="currentColor" opacity=".25"/></svg>`,
        gear: `<svg viewBox="0 0 96 72" fill="none" stroke="currentColor" stroke-linecap="round" aria-hidden="true">
                <circle cx="34" cy="36" r="19" stroke-width="9" stroke-dasharray="6 4.6"/><circle cx="34" cy="36" r="7" stroke-width="3"/>
                <circle cx="70" cy="24" r="11" stroke-width="7" stroke-dasharray="4.4 3.6"/><circle cx="70" cy="24" r="3.5" stroke-width="3"/>
                <path d="M4 66 H92" stroke-width="3"/></svg>`,
        plan: `<svg viewBox="0 0 96 72" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">
                <rect x="8" y="8" width="80" height="56" rx="2" stroke-width="3"/>
                <path d="M8 24 H88 M8 40 H88 M28 8 V64 M48 8 V64 M68 8 V64" opacity=".3"/>
                <path d="M16 56 C30 56 30 30 48 30 S70 16 80 16" stroke-width="3.4"/><circle cx="80" cy="16" r="4" fill="currentColor"/></svg>`,
        lamp: `<svg viewBox="0 0 96 72" aria-hidden="true">
                <g stroke="currentColor" stroke-width="3" stroke-linecap="round"><line x1="48" y1="2" x2="48" y2="8"/><line x1="28" y1="10" x2="32" y2="14"/><line x1="68" y1="10" x2="64" y2="14"/></g>
                <path d="M48 16a16 16 0 0 0-9.6 28.8c1.8 1.4 2.8 3.4 2.8 5.6V54h13.6v-3.6c0-2.2 1-4.2 2.8-5.6A16 16 0 0 0 48 16z" fill="url(#ent-bulb-on)" stroke="currentColor" stroke-width="3" class="glow"/>
                <rect x="40.5" y="57" width="15" height="4" rx="1.5" fill="currentColor"/><rect x="42" y="63" width="12" height="4" rx="1.5" fill="currentColor"/></svg>`
    };

    function renderArticles() {
        const m = marquee('BUILD');
        const countries = new Set(entries.map(e => e.hq.country)).size;
        const oldest = byAge[0];
        view.innerHTML = `
            <div class="wrap">
                <section class="panel hero-panel">
                    ${NUMERALS.map(([ch, x, y, size, color], i) =>
                        `<span class="numeral" style="left:${x}%;top:${y}%;font-size:calc(${size}px * var(--num-scale, 1));color:${color};animation-delay:-${i * 0.8}s" aria-hidden="true">${ch}</span>`).join('')}
                    <div class="stage">
                        ${m.svg}
                        <div class="stage-caption">FIG. 1 — ${m.lit} LAMPS. THE LIGHT GOES ON.</div>
                    </div>
                </section>

                <h1 class="ad-headline">Welcome to <span class="hl"><u>Enterpriser</u></span></h1>

                <div class="ad-copy">
                    <div>
                        <p class="lead">Machines are getting hands. What will you build with them?</p>
                        <p>Enterpriser is a journal for people who make things. Not valuations. Not IPOs. Not who got rich. We write about what gets built, how it gets built, and why some of it lasts for centuries.</p>
                    </div>
                    <div>
                        <p>When a robot can carve, weld and assemble, the old questions fade. How to run a meeting matters less. What to make, and how well, matters more.</p>
                        <p>So we go where things are made: the workshop, the factory floor, the drawing board. Short sentences. Clear steps. Real plans.</p>
                    </div>
                    <div>
                        <p>The first articles arrive soon. Until then, the <a href="#/index">Enterpriser Index</a> is open: ${fmt(entries.length)} businesses worldwide, ranked by how long they have lasted. Find it any time in the menu above.</p>
                        <p class="definition"><b>en·ter·pris·er</b> (n.) One who undertakes a business or venture. From Old French <i>entreprendre</i>, “to undertake.”</p>
                    </div>
                </div>

                <div class="section-head">
                    <span class="label">The building</span>
                    <h2>Four floors of Enterpriser</h2>
                    <p>Every article lives on one floor.</p>
                </div>

                <div class="building">
                    ${[
                        [4, 'Machines', 'What can you craft with the hands of a machine? Robots, tools and the new workshop.', 'var(--blue)', 'hand'],
                        [3, 'The Factory Floor', 'How things really get made. We ask the mechanics first, then the designers.', 'var(--red)', 'gear'],
                        [2, 'Concrete Plans', 'Bold, specific proposals. A tube system for a new district. Steps included.', 'var(--teal)', 'plan'],
                        [1, 'Lessons from Enterprisers', 'People who built something tell what worked, and what broke. Bankruptcy included.', 'var(--mustard)', 'lamp']
                    ].map(([n, title, text, color, icon]) => `
                        <div class="floor" style="--floor:${color}">
                            <div class="num"><b>${n}</b>Floor</div>
                            <div><h3>${title}</h3><p>${text}</p></div>
                            <span style="color:${color}">${PICTO[icon]}</span>
                        </div>`).join('')}
                </div>

                <p class="not-here">Not on any floor: <s>rich lists</s><span class="ticks">///</span><s>IPO playbooks</s><span class="ticks">///</span><s>office politics</s></p>

                <section class="notice">
                    <div>
                        <span class="label">Now open</span>
                        <h2>The Enterpriser Index</h2>
                        <p>${fmt(entries.length)} businesses from ${countries} countries. The oldest, ${esc(oldest.label)}, has been building since ${yearLabel(oldest.founded.year)}. Ranked by how long they last, not by how much they earn.</p>
                    </div>
                    <a class="btn" href="#/index">Open the Index →</a>
                </section>
            </div>`;
    }

    // ---------- Index ----------

    const state = { q: '', status: 'alive', list: 'all', continent: 'all', sector: 'all', sort: 'age-desc', limit: PAGE };

    function filtered() {
        const q = state.q.trim().toLowerCase();
        const list = entries.filter(e => {
            if (state.status === 'alive' && e.status !== 'alive') return false;
            if (state.status === 'ended' && e.status === 'alive') return false;
            if (state.list === 'sp500' && !(e.lists || []).includes('sp500')) return false;
            if (state.list === 'curated' && !e.curated) return false;
            if (state.continent !== 'all' && e.hq.continent !== state.continent) return false;
            if (state.sector !== 'all' && e.industry.sector !== state.sector) return false;
            if (!q) return true;
            const hay = [e.label, e.legal_name, ...(e.aliases || []), e.hq.country, e.hq.city, e.industry.label,
                e.industry.sector, e.ids && e.ids.ticker].join(' ').toLowerCase();
            return hay.includes(q);
        });
        const sorters = {
            'age-desc': (a, b) => ageOf(b) - ageOf(a) || a.label.localeCompare(b.label),
            'lineage-desc': (a, b) => lineageAgeOf(b) - lineageAgeOf(a) || a.label.localeCompare(b.label),
            'age-asc': (a, b) => ageOf(a) - ageOf(b) || a.label.localeCompare(b.label),
            'name': (a, b) => a.label.localeCompare(b.label)
        };
        return list.sort(sorters[state.sort]);
    }

    const digits = (n, width) => `<span class="digits">${String(n).padStart(width, '0').split('').map(d => `<span>${d}</span>`).join('')}</span>`;

    function renderIndex() {
        const continents = [...new Set(entries.map(e => e.hq.continent))].sort();
        const sectors = [...new Set(entries.map(e => e.industry.sector).filter(Boolean))].sort();
        const countries = new Set(entries.map(e => e.hq.country));
        const alive = entries.filter(e => e.status === 'alive');
        const opt = (v, label, cur) => `<option value="${esc(v)}" ${cur === v ? 'selected' : ''}>${esc(label)}</option>`;

        view.innerHTML = `
            <div class="wrap">
                <div class="index-head">
                    <span class="label">Database</span>
                    <h1>The <span class="hl">Enterpriser</span> Index</h1>
                    <p>Businesses worldwide, ranked first by whether they are still alive and how long they have lasted. Money comes second. Every fact shows its sources and how sure we are.</p>
                    <div class="counters">
                        <div class="counter"><span class="label">Entries</span>${digits(entries.length, 4)}</div>
                        <div class="counter"><span class="label">Alive</span>${digits(alive.length, 4)}</div>
                        <div class="counter"><span class="label">Countries</span>${digits(countries.size, 2)}</div>
                        <div class="counter"><span class="label">Oldest since</span>${digits(byAge[0].founded.year, 4)}</div>
                    </div>
                </div>

                <div class="console">
                    <input class="search" type="search" placeholder="Search name, ticker, country, industry…" value="${esc(state.q)}" aria-label="Search">
                    <div class="keys" role="group" aria-label="Status">
                        ${['alive', 'ended', 'all'].map(s => `<button type="button" class="key ${state.status === s ? 'on' : ''}" data-status="${s}" aria-pressed="${state.status === s}">${{ alive: 'Alive', ended: 'Ended', all: 'All' }[s]}</button>`).join('')}
                    </div>
                    <select data-k="list" aria-label="List">
                        ${opt('all', 'All lists', state.list)}${opt('sp500', 'S&P 500', state.list)}${opt('curated', 'Curated', state.list)}
                    </select>
                    <select data-k="continent" aria-label="Continent">
                        ${opt('all', 'All continents', state.continent)}${continents.map(c => opt(c, c, state.continent)).join('')}
                    </select>
                    <select data-k="sector" aria-label="Sector">
                        ${opt('all', 'All sectors', state.sector)}${sectors.map(s => opt(s, s, state.sector)).join('')}
                    </select>
                    <select data-k="sort" aria-label="Sort">
                        ${opt('age-desc', 'Longest-lasting', state.sort)}${opt('lineage-desc', 'Longest lineage', state.sort)}${opt('age-asc', 'Youngest', state.sort)}${opt('name', 'Name A–Z', state.sort)}
                    </select>
                </div>

                <div id="ent-list"></div>

                <div class="legend">
                    <span class="century">${bulb(true)} One lamp = one century</span>
                    ${ACC_ORDER.map(a => `<span>${dot(a)}${esc(ACC_LABEL[a])}</span>`).join('')}
                </div>
            </div>`;

        const reset = () => { state.limit = PAGE; renderList(); };
        view.querySelector('.search').addEventListener('input', ev => { state.q = ev.target.value; reset(); });
        view.querySelectorAll('.key').forEach(b => b.addEventListener('click', () => {
            state.status = b.dataset.status;
            view.querySelectorAll('.key').forEach(x => {
                x.classList.toggle('on', x === b);
                x.setAttribute('aria-pressed', x === b);
            });
            reset();
        }));
        view.querySelectorAll('select').forEach(s => s.addEventListener('change', () => { state[s.dataset.k] = s.value; reset(); }));

        renderList();
    }

    function renderList() {
        const list = filtered();
        const box = view.querySelector('#ent-list');
        if (!list.length) {
            box.innerHTML = `<p class="empty">No entries match. Try another filter.</p>`;
            return;
        }
        const shown = list.slice(0, state.limit);
        const lineageSort = state.sort === 'lineage-desc';

        box.innerHTML = `
            <div class="result-count"><span>Showing ${fmt(shown.length)} of ${fmt(list.length)}</span><span>Sorted: ${esc(view.querySelector('[data-k="sort"]').selectedOptions[0].text)}</span></div>
            <table class="table">
                <thead><tr>
                    <th>No.</th><th>Enterprise</th><th>Country</th><th>Founded</th><th>Age</th><th>Status</th><th>Data</th>
                </tr></thead>
                <tbody>
                    ${shown.map((e, i) => {
                        const age = lineageSort ? lineageAgeOf(e) : ageOf(e);
                        const ticker = e.ids && e.ids.ticker ? ` · ${e.ids.ticker.split(' ')[0]}` : '';
                        return `
                        <tr data-uid="${esc(e.uid)}" tabindex="0">
                            <td class="rank">${String(i + 1).padStart(3, '0')}</td>
                            <td class="col-name"><div class="name">${esc(e.label)}</div><div class="sub">${esc(e.industry.label)}${esc(ticker)}</div></td>
                            <td class="col-country sub">${esc(e.hq.country)}</td>
                            <td class="col-founded num-col">${yearLabel(lineageSort && e.lineage ? e.lineage : e.founded.year)}</td>
                            <td class="col-age"><span class="num-col">${fmt(age)} yrs</span><div class="centuries">${centuries(age)}</div></td>
                            <td class="col-status"><span class="status ${e.status}">${STATUS_LABEL[e.status]}</span></td>
                            <td class="col-data sub">${dot(entryAccuracy(e))}${Object.keys(e.sources).length} src${dataYear(e) ? ` · ${dataYear(e)}` : ''}${e.website ? ` · <a class="site-link" href="${esc(e.website)}" target="_blank" rel="noopener">${esc(domain(e.website))}</a>` : ''}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
            ${list.length > shown.length ? `<div class="more"><button class="btn" type="button">Print ${Math.min(PAGE, list.length - shown.length)} more</button></div>` : ''}`;

        box.querySelectorAll('tbody tr').forEach(tr => {
            const go = () => { location.hash = `#/index/${tr.dataset.uid}`; };
            tr.addEventListener('click', ev => { if (!ev.target.closest('a')) go(); });
            tr.addEventListener('keydown', ev => { if (ev.key === 'Enter') go(); });
        });
        const more = box.querySelector('.more button');
        if (more) more.addEventListener('click', () => { state.limit += PAGE; renderList(); });
    }

    // ---------- Entry ----------

    function metricRow(label, s, unit) {
        if (!s) return '';
        const value = unit ? `${fmt(s.v)} ${esc(unit)}` : fmt(s.v);
        const meta = [s.year, s.src ? `${s.src.length} src` : null, s.note].filter(Boolean).join(' · ');
        return `
            <div class="metric">
                <span class="k">${label}</span>
                <span class="val">${dot(s.acc)}${value}<span class="meta">${esc(meta)}</span></span>
            </div>`;
    }

    function lifeEvents(e) {
        if (e.events && e.events.length) return e.events;
        const ev = [];
        if (e.lineage) ev.push({ year: e.lineage, type: 'lineage', text: 'Earliest predecessor business.' });
        ev.push({ year: e.founded.year, type: 'founded', text: e.founded.note || 'Founded.' });
        if (e.sp500_added && /^\d{4}/.test(e.sp500_added)) ev.push({ year: +e.sp500_added.slice(0, 4), type: 'listed', text: 'Added to the S&P 500.' });
        return ev.sort((a, b) => a.year - b.year);
    }

    function renderEntry(uid) {
        const e = ALL[uid];
        if (!e) {
            view.innerHTML = `<div class="wrap"><a class="crumb" href="#/index">← Enterpriser Index</a><p class="empty">Entry not found.</p></div>`;
            return;
        }
        const h = headcount(e);
        const avg = lifetimeAvg(e);
        const rev = e.metrics && e.metrics.revenue && e.metrics.revenue.current;
        const articles = mentionsOf(uid);
        const rank = byAge.findIndex(x => x.uid === uid) + 1;
        const hasMetrics = h.founding || h.current || rev;
        const summary = e.summary || `${e.industry.label} company headquartered in ${e.hq.city}.${(e.lists || []).includes('sp500') ? ' Listed in the S&P 500.' : ''}`;
        const foundedNote = e.founded.place ? `${e.founded.place}, ${e.founded.country}` : (e.lineage ? `Lineage since ${e.lineage}` : '');

        view.innerHTML = `
            <div class="wrap">
                <a class="crumb" href="#/index">← Enterpriser Index</a>

                <div class="card">
                    <div class="holes" aria-hidden="true">${'<i></i>'.repeat(18)}</div>
                    <span class="label">${esc(e.uid)}</span>
                    <h1>${esc(e.label)}</h1>
                    <p class="summary">${esc(summary)}</p>
                    <span class="status ${e.status}">${STATUS_LABEL[e.status]}</span>
                </div>

                <div class="plate">
                    <div class="fact"><div class="label">Founded</div><div class="v">${dot(e.founded.acc)}${yearLabel(e.founded.year)}</div><div class="note">${esc(foundedNote) || '&nbsp;'}</div></div>
                    <div class="fact"><div class="label">${e.ended ? 'Lasted' : 'Age'}</div><div class="v">${fmt(ageOf(e))} years</div><div class="note">${e.ended ? `Ended ${e.ended.year}` : `No. ${rank} of ${fmt(entries.length)} by longevity`}</div></div>
                    <div class="fact"><div class="label">Headquarters</div><div class="v">${esc(e.hq.city)}</div><div class="note">${esc(e.hq.country)}</div></div>
                    <div class="fact"><div class="label">Industry</div><div class="v">${esc(e.industry.label)}</div><div class="note">${esc(e.industry.sector || '')}${e.industry.isic ? ` · ISIC ${esc(e.industry.isic)}` : ''}</div></div>
                    ${e.ownership ? `<div class="fact"><div class="label">Ownership</div><div class="v" style="text-transform:capitalize">${esc(e.ownership)}</div><div class="note">${e.parent ? `Part of ${esc(e.parent.label)}` : '&nbsp;'}</div></div>` : ''}
                    <div class="fact"><div class="label">Website</div><div class="v">${e.website ? `<a href="${esc(e.website)}" target="_blank" rel="noopener">${esc(domain(e.website))} ↗</a>` : '—'}</div><div class="note">${e.website ? '&nbsp;' : (e.status === 'alive' ? 'Not found yet' : 'No longer online')}</div></div>
                </div>

                <div class="entry-grid">
                    <div>
                        <section class="block">
                            <h2>Life</h2>
                            <ul class="timeline">
                                ${lifeEvents(e).map(ev => `<li>${bulb(true)}<span class="yr">${ev.year}</span><span><span class="type">${esc(ev.type)}</span>${esc(ev.text)}</span></li>`).join('')}
                                ${e.status === 'alive'
                                    ? `<li>${bulb(true)}<span class="yr">${NOW}</span><span><span class="type">today</span>Still operating.</span></li>`
                                    : `<li>${bulb(false)}<span class="yr">${e.ended.year}</span><span><span class="type">lights out</span>${e.status === 'absorbed' ? 'Absorbed into another business.' : 'Ceased operating.'}</span></li>`}
                            </ul>
                            ${e.events && e.founded.note ? `<p class="sub" style="margin-top:10px">${dot(e.founded.acc)}${esc(e.founded.note)}</p>` : ''}
                        </section>

                        <section class="block">
                            <h2>How it's made</h2>
                            ${e.production ? `<p>${esc(e.production)}</p>` : `<div class="placeholder">Not yet documented. A factory-floor story waiting to be written.</div>`}
                        </section>

                        <section class="block">
                            <h2>In Enterpriser</h2>
                            ${articles.length
                                ? `<ul class="sources">${articles.map(a => `<li><a href="${esc(a.url)}">${esc(a.title)}</a> <span class="sub">${esc(a.date)}</span></li>`).join('')}</ul>`
                                : `<div class="placeholder">No articles mention ${esc(e.label)} yet. When they do, they are listed here with an AI summary of what our writers think.</div>`}
                            ${e.opinion ? `<p style="margin-top:14px">${esc(e.opinion.text)}</p>` : ''}
                        </section>
                    </div>

                    <div>
                        <section class="block">
                            <h2>Numbers</h2>
                            ${hasMetrics ? `
                                ${metricRow('Headcount, founding era', h.founding)}
                                ${metricRow('Headcount, current', h.current)}
                                ${avg ? metricRow('Headcount, lifetime avg. (est.)', { v: avg, acc: 'yellow', note: '(founding + current) ÷ 2' }) : ''}
                                ${rev ? metricRow('Revenue', rev, rev.unit) : ''}
                            ` : `<div class="placeholder">No figures collected yet. Longevity comes first in this Index.</div>`}
                        </section>

                        ${e.founders && e.founders.length ? `<section class="block"><h2>Founders</h2><div class="chips">${e.founders.map(f => `<span class="chip">${esc(f.name)}</span>`).join('')}</div></section>` : ''}
                        ${e.products && e.products.length ? `<section class="block"><h2>Products</h2><div class="chips">${e.products.map(p => `<span class="chip">${esc(p)}</span>`).join('')}</div></section>` : ''}

                        <section class="block">
                            <h2>Sources (${Object.keys(e.sources).length})</h2>
                            <ol class="sources">
                                ${Object.values(e.sources).map(s => `<li><a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a></li>`).join('')}
                            </ol>
                            ${Object.keys(e.ids || {}).length ? `<p class="sub type" style="margin-top:10px">${Object.entries(e.ids).map(([k, v]) => `${esc(k)}: ${esc(v)}`).join(' · ')}</p>` : ''}
                        </section>
                    </div>
                </div>
            </div>`;
    }

    // ---------- Router ----------

    function route() {
        const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
        const section = parts[0] === 'index' ? 'index' : 'articles';
        root.querySelectorAll('[data-nav]').forEach(a => a.classList.toggle('active', a.dataset.nav === section));

        if (section === 'index' && parts[1]) renderEntry(decodeURIComponent(parts[1]));
        else if (section === 'index') renderIndex();
        else renderArticles();

        window.scrollTo(0, 0);
    }

    window.addEventListener('hashchange', route);
    route();
})();
