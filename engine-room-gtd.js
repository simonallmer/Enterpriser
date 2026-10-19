// Machines — Workbench: Getting Things Done.
// Bring whatever is on your mind; the machine walks each item down David Allen's workflow
// (Getting Things Done, 2001) until it lands in the right place. Projects get the four
// properties from the article "Getting Things Done": Vision, Purpose, Principles, Technical Insight.
// Standalone at #/machines/getting-things-done; embedded in the article via mount().
// Everything you type stays in this browser (localStorage), nowhere else.

window.EngineRoomGtd = (function () {

    const KEY = 'enterpriser-gtd-v1';
    const BINS = {
        trash: ['Trash', 'Not needed. Let it go.'],
        someday: ['Someday / Maybe', 'Not now, perhaps later. Look again at each weekly review.'],
        reference: ['Reference', 'No action, but worth keeping. File it where you can find it.'],
        projects: ['Projects', 'Anything that takes more than one step. Each needs a next action.'],
        done: ['Done', 'Finished. Under two minutes? Do it the moment you meet it.'],
        waiting: ['Waiting For', 'Handed to someone else. Note who, and check back.'],
        calendar: ['Calendar', 'Only what must happen on a given day.'],
        next: ['Next Actions', 'Everything else you will do as soon as you can.']
    };
    const EXAMPLES = [
        'The shop door squeaks',
        'Autumn catalogue',
        'Idea: an article on the history of the screw',
        'Insurance renewal letter arrived',
        'Paper samples from the printer',
        'Learn Japanese',
        'Reply to Anna about the logo'
    ];

    let H, S, root = null, cur = null, open = null;
    const uid = () => Math.random().toString(36).slice(2, 9);

    // ---------- Storage (per viewer, may be unavailable) ----------

    function load() {
        try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.inbox) return s; } catch (e) { }
        return { inbox: [], items: [], projects: [] };
    }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } }

    const count = bin => bin === 'projects' ? S.projects.length : S.items.filter(i => i.bin === bin).length;
    const openActions = p => S.items.filter(i => i.project === p.id && ['next', 'waiting', 'calendar'].includes(i.bin));

    // ---------- The drawing ----------

    // Node centres, after the classic workflow chart; our own layout and wording
    const NODES = {
        in: [380, 40, 120, 'IN', 'tray'],
        what: [380, 105, 200, 'What is it?', 'q'],
        act: [380, 170, 200, 'Is it actionable?', 'q'],
        trash: [640, 105, 150, 'Trash', 'bin'],
        someday: [640, 170, 150, 'Someday / Maybe', 'bin'],
        reference: [640, 235, 150, 'Reference', 'bin'],
        multi: [380, 250, 200, 'More than one step?', 'q'],
        projects: [120, 250, 150, 'Projects', 'bin'],
        next: [380, 330, 240, 'What’s the next action?', 'key'],
        two: [380, 400, 200, 'Under two minutes?', 'q'],
        done: [640, 400, 150, 'Do it · Done', 'bin'],
        mine: [380, 470, 200, 'Am I the one to do it?', 'q'],
        waiting: [640, 470, 150, 'Waiting For', 'bin'],
        day: [380, 540, 200, 'On a set day?', 'q'],
        calendar: [130, 540, 150, 'Calendar', 'bin'],
        nextlist: [380, 610, 150, 'Next Actions', 'bin']
    };
    const EDGES = [
        ['M380 58 V87'], ['M380 123 V152'],
        ['M480 170 H530 M530 105 V235 M530 105 H565 M530 170 H565 M530 235 H565', 'No', 500, 162],
        ['M380 188 V232', 'Yes', 392, 214],
        ['M280 250 H195', 'Yes', 238, 242],
        ['M380 268 V312', 'No', 392, 294],
        ['M120 268 V330 H260', 'plan', 128, 304, true],
        ['M380 348 V382'],
        ['M480 400 H565', 'Yes', 522, 392],
        ['M380 418 V452', 'No', 392, 438],
        ['M480 470 H565', 'No', 522, 462],
        ['M380 488 V522', 'Yes', 392, 508],
        ['M280 540 H205', 'Yes', 242, 532],
        ['M380 558 V592', 'No', 392, 578]
    ];
    // Which part of the drawing lights up at each step of the walk
    const LIT = { what: 'what', act: 'act', notact: 'act', multi: 'multi', project: 'projects', next: 'next', two: 'two', doit: 'done', mine: 'mine', who: 'waiting', day: 'day', date: 'calendar' };
    const binOf = { nextlist: 'next' };

    function drawing() {
        const lit = cur ? LIT[cur.step] : (S.inbox.length ? 'in' : null);
        return `<svg class="gtd-chart" viewBox="0 0 760 640" role="img" aria-label="Getting Things Done workflow: from the IN tray through What is it, Is it actionable and What's the next action, to Trash, Someday, Reference, Projects, Done, Waiting For, Calendar and Next Actions">
            <defs><marker id="gtd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 Z" fill="var(--ink-2)"/></marker></defs>
            ${EDGES.map(([d, label, lx, ly, dashed]) => `
                <path class="gtd-edge${dashed ? ' dashed' : ''}" d="${d}" marker-end="url(#gtd-arrow)"/>
                ${label ? `<text class="gtd-edge-label" x="${lx}" y="${ly}">${label}</text>` : ''}`).join('')}
            ${Object.entries(NODES).map(([id, [x, y, w, label, kind]]) => {
                const bin = binOf[id] || id;
                const n = kind === 'bin' ? count(bin) : kind === 'tray' ? S.inbox.length : null;
                const on = lit === id || (lit === 'next' && id === 'next');
                return `<g class="gtd-node ${kind}${on ? ' on' : ''}" ${kind === 'bin' ? `data-open="${bin}" tabindex="0" role="button" aria-label="${label}: ${n}"` : ''}>
                    <rect x="${x - w / 2}" y="${y - 18}" width="${w}" height="36" rx="${kind === 'q' ? 18 : 2}"/>
                    <text x="${x}" y="${y + 5}">${label}${n !== null ? ` · ${n}` : ''}</text>
                </g>`;
            }).join('')}
        </svg>`;
    }

    // ---------- The walk (one item at a time) ----------

    const keys = (...b) => `<span class="keys">${b.map(([act, label, on]) => `<button type="button" class="key${on ? ' on' : ''}" data-act="${act}">${label}</button>`).join('')}</span>`;
    const field = (name, label, hint, value = '') => `
        <label class="gtd-field"><span class="gtd-field-label">${label}</span>
            <span class="gtd-hint">${hint}</span>
            <textarea name="${name}" rows="2">${H.esc(value)}</textarea></label>`;

    function panel() {
        if (!cur) {
            return `<div class="gtd-step">
                <span class="label">IN tray · ${S.inbox.length}</span>
                <h3>${S.inbox.length ? 'Ready when you are.' : 'What’s on your mind?'}</h3>
                <p>${S.inbox.length ? `Next up: <b>${H.esc(S.inbox[0].text)}</b>` : 'Write down everything that has your attention, one thing at a time. Big or small, work or home.'}</p>
                ${S.inbox.length ? keys(['start', 'Process it →', true]) : ''}
            </div>`;
        }
        const t = `<p class="gtd-item">${H.esc(cur.text)}</p>`;
        const steps = {
            what: () => `<span class="label">What is it?</span>${t}
                <p>Say it plainly. Rewrite it until you know what it really is.</p>
                <textarea class="gtd-input" name="text" rows="2">${H.esc(cur.text)}</textarea>
                ${keys(['clarify', 'That’s it →', true])}`,
            act: () => `<span class="label">Is it actionable?</span>${t}
                <p>Is there something you can do about it?</p>
                ${keys(['act-yes', 'Yes', true], ['act-no', 'No'])}`,
            notact: () => `<span class="label">No action. Where does it go?</span>${t}
                ${keys(['bin-trash', 'Trash'], ['bin-someday', 'Someday / Maybe'], ['bin-reference', 'Reference'])}`,
            multi: () => `<span class="label">More than one step?</span>${t}
                <p>If it takes more than one action to finish, it is a project.</p>
                ${keys(['multi-yes', 'Yes, a project'], ['multi-no', 'No, one action', true])}`,
            project: () => `<span class="label">New project</span>${t}
                <p>Give it four properties. Short answers are fine; you can come back to them.</p>
                ${field('vision', 'Vision', 'The outcome. Picture it finished: what do you see?', cur.vision)}
                ${field('purpose', 'Purpose', 'Why are you doing it?', cur.purpose)}
                ${field('principles', 'Principles', '“I would give others totally free rein to do this as long as they…”', cur.principles)}
                ${field('insight', 'Technical Insight', 'The new quality that sets it apart from anything else out there.', cur.insight)}
                ${keys(['project-save', 'Save project →', true])}`,
            next: () => `<span class="label">What’s the next action?</span>${t}
                <p>The very next physical thing to do. A verb, a place, a person: “Call the printer about paper samples.”</p>
                <textarea class="gtd-input" name="action" rows="2">${H.esc(cur.action || (cur.project ? '' : cur.text))}</textarea>
                ${keys(['next-save', 'Next →', true])}`,
            two: () => `<span class="label">Under two minutes?</span><p class="gtd-item">${H.esc(cur.action)}</p>
                <p>If it takes less than two minutes, doing it now is faster than keeping track of it.</p>
                ${keys(['two-yes', 'Yes'], ['two-no', 'No', true])}`,
            doit: () => `<span class="label">Do it now</span><p class="gtd-item">${H.esc(cur.action)}</p>
                <p>Go on. Come back when it is done.</p>
                ${keys(['doit-done', 'Done ✓', true])}`,
            mine: () => `<span class="label">Am I the one to do it?</span><p class="gtd-item">${H.esc(cur.action)}</p>
                ${keys(['mine-yes', 'Yes, me', true], ['mine-no', 'No, delegate'])}`,
            who: () => `<span class="label">Delegate it</span><p class="gtd-item">${H.esc(cur.action)}</p>
                <p>Who will do it?</p>
                <input class="gtd-input" name="who" type="text" value="">
                ${keys(['who-save', 'Hand it over →', true])}`,
            day: () => `<span class="label">On a set day?</span><p class="gtd-item">${H.esc(cur.action)}</p>
                <p>Only if it must happen on that day. Everything else goes on the Next Actions list.</p>
                ${keys(['day-yes', 'Yes, a set day'], ['day-no', 'No, as soon as I can', true])}`,
            date: () => `<span class="label">Which day?</span><p class="gtd-item">${H.esc(cur.action)}</p>
                <input class="gtd-input" name="date" type="date">
                ${keys(['date-save', 'Put it in the calendar →', true])}`
        };
        return `<div class="gtd-step">${steps[cur.step]()}</div>`;
    }

    function lists() {
        if (!open) return '';
        const [title, text] = BINS[open];
        let body;
        if (open === 'projects') {
            body = S.projects.map(p => {
                const acts = openActions(p);
                return `<li class="gtd-project">
                    <div class="gtd-row"><b>${H.esc(p.title)}</b>
                        ${acts.length ? `<span class="gtd-ok">${H.bulb(true)} ${acts.length} open</span>` : `<span class="gtd-warn">${H.bulb(false)} No next action</span> ${keys(['addnext-' + p.id, 'Add one'])}`}</div>
                    <dl>${[['Vision', p.vision], ['Purpose', p.purpose], ['Principles', p.principles], ['Technical Insight', p.insight]].filter(x => x[1]).map(([k, v]) => `<dt>${k}</dt><dd>${H.esc(v)}</dd>`).join('')}</dl>
                    ${acts.length ? `<ul class="gtd-sub">${acts.map(a => `<li>${H.esc(a.text)} <span class="sub">${BINS[a.bin][0]}</span></li>`).join('')}</ul>` : ''}
                </li>`;
            }).join('');
        } else {
            const items = S.items.filter(i => i.bin === open);
            if (open === 'calendar') items.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
            body = items.map(i => {
                const p = i.project && S.projects.find(x => x.id === i.project);
                const meta = [i.date, i.who && 'with ' + i.who, p && p.title].filter(Boolean).map(H.esc).join(' · ');
                const acts = ['next', 'waiting', 'calendar'].includes(open) ? keys(['finish-' + i.id, 'Done ✓'])
                    : open === 'someday' ? keys(['revive-' + i.id, 'Back to IN'])
                    : keys(['drop-' + i.id, 'Remove']);
                return `<li><div class="gtd-row"><span>${H.esc(i.text)}${meta ? ` <span class="sub">${meta}</span>` : ''}</span>${acts}</div></li>`;
            }).join('');
        }
        return `<div class="gtd-list">
            <div class="gtd-row"><h3>${title}</h3>${keys(['close', 'Close'])}</div>
            <p class="sub">${text}</p>
            <ul>${body || '<li class="sub">Empty.</li>'}</ul>
        </div>`;
    }

    function paint() {
        if (!root) return;
        root.querySelector('.gtd-drawing').innerHTML = drawing();
        root.querySelector('.gtd-panel').innerHTML = panel();
        root.querySelector('.gtd-lists').innerHTML = lists();
        const f = root.querySelector('.gtd-panel textarea, .gtd-panel input');
        if (f && document.activeElement && root.contains(document.activeElement)) f.focus();
    }

    // ---------- Actions ----------

    const val = name => { const el = root.querySelector(`.gtd-panel [name="${name}"]`); return el ? el.value.trim() : ''; };

    function file(bin, extra = {}) {
        S.items.push({ id: uid(), text: cur.action || cur.text, bin, project: cur.project || null, ...extra });
        finish();
    }
    function finish() { cur = null; save(); paint(); }

    function act(a) {
        const [verb, arg] = a.split(/-(.+)/);
        if (a === 'start' && S.inbox.length) { cur = { ...S.inbox.shift(), step: 'what' }; save(); }
        else if (a === 'clarify') { cur.text = val('text') || cur.text; cur.step = 'act'; }
        else if (a === 'act-yes') cur.step = 'multi';
        else if (a === 'act-no') cur.step = 'notact';
        else if (verb === 'bin') return file(arg);
        else if (a === 'multi-yes') cur.step = 'project';
        else if (a === 'multi-no') cur.step = 'next';
        else if (a === 'project-save') {
            const p = { id: uid(), title: cur.text, vision: val('vision'), purpose: val('purpose'), principles: val('principles'), insight: val('insight') };
            S.projects.push(p);
            cur.project = p.id;
            cur.step = 'next';
        }
        else if (a === 'next-save') { const v = val('action'); if (!v) return; cur.action = v; cur.step = 'two'; }
        else if (a === 'two-yes') cur.step = 'doit';
        else if (a === 'two-no') cur.step = 'mine';
        else if (a === 'doit-done') return file('done');
        else if (a === 'mine-yes') cur.step = 'day';
        else if (a === 'mine-no') cur.step = 'who';
        else if (a === 'who-save') return file('waiting', { who: val('who') || 'someone' });
        else if (a === 'day-yes') cur.step = 'date';
        else if (a === 'day-no') return file('next');
        else if (a === 'date-save') { const d = val('date'); if (!d) return; return file('calendar', { date: d }); }
        else if (verb === 'finish') { const i = S.items.find(x => x.id === arg); if (i) i.bin = 'done'; save(); }
        else if (verb === 'revive') { const i = S.items.find(x => x.id === arg); if (i) { S.items = S.items.filter(x => x !== i); S.inbox.push({ id: i.id, text: i.text }); } save(); }
        else if (verb === 'drop') { S.items = S.items.filter(x => x.id !== arg); save(); }
        else if (verb === 'addnext') { const p = S.projects.find(x => x.id === arg); if (p) { cur = { id: uid(), text: p.title, project: p.id, step: 'next' }; open = null; } }
        else if (a === 'close') open = null;
        else if (a === 'examples') { EXAMPLES.forEach(text => S.inbox.push({ id: uid(), text })); save(); }
        else if (a === 'reset') { if (!confirm('Clear everything in this machine?')) return; S = { inbox: [], items: [], projects: [] }; cur = null; open = null; save(); }
        paint();
    }

    function capture(ev) {
        ev.preventDefault();
        const input = root.querySelector('.gtd-capture input');
        const text = input.value.trim();
        if (!text) return;
        S.inbox.push({ id: uid(), text });
        input.value = '';
        save();
        paint();
        input.focus();
    }

    // ---------- Mount (standalone page or inside an article) ----------

    function mount(el, helpers) {
        H = helpers;
        S = load();
        cur = null; open = null;
        root = el;
        el.innerHTML = `
            <div class="gtd">
                <form class="gtd-capture console">
                    <span class="label">Capture</span>
                    <input type="text" placeholder="Anything on your mind…" aria-label="Add to the IN tray" autocomplete="off">
                    <button type="submit" class="key on">Into the IN tray</button>
                </form>
                <div class="gtd-body">
                    <div class="gtd-drawing"></div>
                    <div class="gtd-side">
                        <div class="gtd-panel" aria-live="polite"></div>
                        <div class="gtd-tools">${keys(['examples', 'Load examples'], ['reset', 'Clear all'])}</div>
                        <p class="gtd-note">Click any tray to open it. What you write stays in this browser.</p>
                    </div>
                </div>
                <div class="gtd-lists"></div>
            </div>`;
        el.querySelector('.gtd-capture').addEventListener('submit', capture);
        el.querySelector('.gtd').addEventListener('click', ev => {
            const b = ev.target.closest('[data-act]');
            if (b) return act(b.dataset.act);
            const o = ev.target.closest('[data-open]');
            if (o) { open = o.dataset.open; paint(); el.querySelector('.gtd-lists').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }
        });
        el.querySelector('.gtd').addEventListener('keydown', ev => {
            const o = ev.target.closest('[data-open]');
            if (o && (ev.key === 'Enter' || ev.key === ' ')) { ev.preventDefault(); open = o.dataset.open; paint(); }
        });
        paint();
    }

    function render(view, helpers) {
        view.innerHTML = `
            <div class="wrap">
                <a class="crumb" href="#/machines">← Machines</a>
                <div class="er-title">
                    <span class="label">Workbench · Getting Things Done</span>
                    <h1>What’s the <u>next action</u>?</h1>
                    <p>Bring whatever is on your mind. The machine walks each item down the workflow until it lands where it belongs, and your head is free for the work itself.</p>
                </div>
                <div id="gtd-mount"></div>
                <div class="er-lessons">
                    <h2>What the machine teaches</h2>
                    <ol>
                        <li>Capture everything. A mind holding a list cannot also do the work.</li>
                        <li>Decide what each thing is before deciding what to do with it.</li>
                        <li>Under two minutes: do it now. Filing it would take longer.</li>
                        <li>Every project needs a next action, or it is only a wish. Open Projects and look for unlit lamps.</li>
                        <li>Review once a week: empty the IN tray, check Waiting For, look again at Someday / Maybe.</li>
                    </ol>
                </div>
                <div class="er-next">
                    <a href="#/articles/getting-things-done" class="btn">Read the article →</a>
                </div>
                <p class="er-credit">Workflow after David Allen, <i>Getting Things Done: The Art of Stress-Free Productivity</i> (2001; revised 2015). Drawing, wording and the four project properties are our own.</p>
            </div>`;
        mount(view.querySelector('#gtd-mount'), helpers);
    }

    function leave() { root = null; cur = null; }

    return { render, mount, leave };
})();
