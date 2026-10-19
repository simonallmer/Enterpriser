// Enterpriser — internal notepad. Press "s" twice within 2 seconds (outside a text field) to open or close.
// Shows the projects in development. Not linked anywhere, but it ships with the site:
// anyone reading the source can see it, so keep nothing secret here.
// The scratch pad at the bottom is saved in this browser only (localStorage).

(function () {
    const root = document.getElementById('enterpriser');
    if (!root) return;

    const SCRATCH_KEY = 'enterpriser-notepad-scratch';
    const WINDOW_MS = 2000;

    // ---------- Projects in development ----------

    const PROJECTS = [
        {
            title: 'Organization Design',
            kind: 'Article + Machine',
            status: 'Idea',
            lead: 'From hierarchy to the connected tensor organization. How the shape of a company decides how fast it can think.',
            notes: [
                '<b>Article:</b> the line of org shapes. The railroad hierarchy (Daniel McCallum drew one of the first org charts, for the New York and Erie Railroad, 1855), the functional and divisional company, the matrix (aerospace, 1960s), the network, and the tensor: every person and unit connected along several axes at once (craft × product × market × time).',
                '<b>Machine:</b> an org chart that morphs from tree → matrix → tensor. Count by eye: communication paths (n(n−1)/2), steps between any two people, span of control, how long a decision takes to travel. Same people, different shape.',
                'Open: define "tensor org" in one sentence a reader keeps. Which axes matter most? Where does accountability sit when a person lives on three axes?',
                'Pairs with the Seven Powers (Process Power) and Get Things Done (Vision, Purpose, Principles, Technical Insight per unit).'
            ]
        },
        {
            title: 'Best in Business',
            kind: 'Index',
            status: 'Concept',
            lead: 'One pick per category, judged by Enterpriser\'s writers in combination with the Index\'s objective metrics. LVMH is Best in Luxury, Kering is not, and the reason is more than revenue: taste, management, stewardship of its houses.',
            notes: [
                '<b>Revenue alone never decides.</b> A year of record box office built on a live-action remake shows no creative risk and no future value. So Disney is not Best in Entertainment right now, however large the number.',
                '<b>Fits the Index rules:</b> the data stays objective and score-free. Best in Business is an editorial award, explained in an article; the entry shows a badge that links to it. Open: does that sit right with "no expert scores"?',
                '<b>Review yearly.</b> A title can be lost. Every pick names the runner-up and what would change the verdict.'
            ],
            criteria: [
                ['Longevity', 'Index', 'Years alive and continuity. The Index\'s first metric, and the floor: at least 5 years old.'],
                ['Health', 'Index', 'Margins and steadiness over a decade, not size. Growth that compounds, not spikes.'],
                ['Taste', 'Writers', 'Quality and coherence of what it makes: product, design language, the details.'],
                ['Management', 'Writers', 'Stewardship, succession, capital allocation, how it treats its people and its brands.'],
                ['Creative risk', 'Writers', 'New originals over milking the catalogue. Bets that could fail.'],
                ['Future value', 'Writers', 'What it builds for the next 25 years: R&D, new categories, talent, institutions.']
            ],
            categories: [
                ['Luxury & Fashion', 'LVMH', 'Hermès (craft, family stewardship, scarcity) is the hard debate. Kering out on management and brand churn.'],
                ['Entertainment', 'Open', 'Not Disney while it remakes. Debate: Nintendo (new IP and hardware bets), A24 (originals), Studio Ghibli (taste over decades).'],
                ['Games', 'Open', 'Nintendo again? Or split from Entertainment to give studios their own category.'],
                ['Automobiles', 'Debate', 'Toyota (process power, long hybrid bet) vs Ferrari (taste, scarcity) vs Porsche.'],
                ['Consumer Electronics', 'Debate', 'Apple (taste, integration) vs Sony (range, creative tools).'],
                ['Semiconductors', 'Debate', 'TSMC (process power) vs ASML (cornered resource) vs Nvidia (future value).'],
                ['Software', 'Open', 'Hard to judge taste here. Criteria may need a "craft of the tool" reading.'],
                ['Industrial Machinery & Robots', 'Debate', 'Fanuc (the robot sculptor made real) vs Siemens.'],
                ['Logistics & Shipping', 'Candidate', 'Maersk (scale economies, already in the Seven Powers).'],
                ['Food & Drink', 'Open', 'Family makers with craft and longevity: Ferrero, Lindt, old breweries and wine houses.'],
                ['Retail', 'Debate', 'Costco (management, trust) vs Inditex (process power).'],
                ['Hospitality & Travel', 'Open', 'Service culture as taste: Four Seasons, the oldest inns in the Index.'],
                ['Design & Furniture', 'Candidate', 'Vitra (taste, the design archive as a resource).'],
                ['Health & Pharma', 'Debate', 'Roche vs Novo Nordisk. Future value weighs heaviest here.'],
                ['Finance', 'Debate', 'Berkshire Hathaway (stewardship, longevity) vs the oldest banks in the Index.'],
                ['Energy', 'Open', 'Who is building what comes after oil? Link to the Oil Economy machine.']
            ]
        }
    ];

    // ---------- Overlay ----------

    let el = null, lastS = 0;
    const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

    function readScratch() { try { return localStorage.getItem(SCRATCH_KEY) || ''; } catch (e) { return ''; } }
    function writeScratch(v) { try { localStorage.setItem(SCRATCH_KEY, v); } catch (e) { } }

    function html() {
        return `
        <div class="notepad-backdrop" data-close></div>
        <section class="notepad" tabindex="-1" role="dialog" aria-modal="true" aria-label="Internal notepad">
            <header class="notepad-head">
                <span class="label">Internal · press s s or Esc to close</span>
                <h2>In development</h2>
                <button type="button" class="key notepad-x" data-close aria-label="Close">Close</button>
            </header>
            ${PROJECTS.map(p => `
                <article class="notepad-project">
                    <div class="notepad-meta"><span class="notepad-kind">${esc(p.kind)}</span><span class="notepad-status">${esc(p.status)}</span></div>
                    <h3>${esc(p.title)}</h3>
                    <p class="notepad-lead">${esc(p.lead)}</p>
                    <ul>${p.notes.map(n => `<li>${n}</li>`).join('')}</ul>
                    ${p.criteria ? `
                        <h4>Criteria</h4>
                        <table class="notepad-table"><thead><tr><th>Criterion</th><th>Judged by</th><th>What it asks</th></tr></thead>
                        <tbody>${p.criteria.map(([c, by, q]) => `<tr><td>${esc(c)}</td><td>${esc(by)}</td><td>${esc(q)}</td></tr>`).join('')}</tbody></table>` : ''}
                    ${p.categories ? `
                        <h4>Categories (first pass)</h4>
                        <table class="notepad-table"><thead><tr><th>Category</th><th>Pick</th><th>Notes</th></tr></thead>
                        <tbody>${p.categories.map(([c, pick, n]) => `<tr><td>${esc(c)}</td><td>${esc(pick)}</td><td>${esc(n)}</td></tr>`).join('')}</tbody></table>` : ''}
                </article>`).join('')}
            <label class="notepad-scratch">
                <span class="label">Scratch pad · saved in this browser</span>
                <textarea rows="5" placeholder="Anything else…">${esc(readScratch())}</textarea>
            </label>
        </section>`;
    }

    function openPad() {
        el = document.createElement('div');
        el.className = 'notepad-layer';
        el.innerHTML = html();
        root.appendChild(el);
        el.addEventListener('click', ev => { if (ev.target.closest('[data-close]')) closePad(); });
        el.querySelector('textarea').addEventListener('input', ev => writeScratch(ev.target.value));
        el.querySelector('.notepad').focus();
        document.documentElement.classList.add('notepad-open');
    }

    function closePad() {
        if (!el) return;
        el.remove();
        el = null;
        document.documentElement.classList.remove('notepad-open');
    }

    const typing = t => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));

    document.addEventListener('keydown', ev => {
        if (ev.key === 'Escape' && el) { closePad(); return; }
        if (ev.metaKey || ev.ctrlKey || ev.altKey || ev.repeat || typing(ev.target)) return;
        if (ev.key !== 's' && ev.key !== 'S') { lastS = 0; return; }
        const now = Date.now();
        if (now - lastS < WINDOW_MS) {
            lastS = 0;
            if (el) closePad(); else openPad();
        } else {
            lastS = now;
        }
    });
})();
