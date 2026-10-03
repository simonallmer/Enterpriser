// Engine Room — Picture Statistics: One Square Metre.
// "What does a million buy?" Floor space for one million in the priciest housing markets, counted in tiles.
// Rule: count symbols, never scale them. One tile = 1 m² (or 10 ft²), grouped in tens.

window.EngineRoomSqm = (function () {

    // Prime residential values, USD per sq ft (Savills, as reported by Elite Traveler, 5 Feb 2026)
    const SOURCE = {
        title: 'Savills prime residential values, reported by Elite Traveler, 5 February 2026',
        url: 'https://elitetraveler.com/property/most-expensive-property-markets-in-the-world',
        acc: 'blue'
    };
    // ECB euro reference rate
    const FX = { usdPerEur: 1.1225, date: '2 October 2026', url: 'https://www.ecb.europa.eu/stats/policy_and_exchange_rates/euro_reference_exchange_rates/html/index.en.html', acc: 'green' };

    const CITIES = [
        { city: 'Monaco', country: 'Monaco', region: 'Europe', usdPerSqft: 5249.56 },
        { city: 'Hong Kong', country: 'China', region: 'Asia', usdPerSqft: 3720 },
        { city: 'New York', country: 'United States', region: 'Americas', usdPerSqft: 2610 },
        { city: 'Geneva', country: 'Switzerland', region: 'Europe', usdPerSqft: 2460 },
        { city: 'Tokyo', country: 'Japan', region: 'Asia', usdPerSqft: 2330 },
        { city: 'Sydney', country: 'Australia', region: 'Oceania', usdPerSqft: 1990 },
        { city: 'Shanghai', country: 'China', region: 'Asia', usdPerSqft: 1980 },
        { city: 'Seoul', country: 'South Korea', region: 'Asia', usdPerSqft: 1950 },
        { city: 'London', country: 'United Kingdom', region: 'Europe', usdPerSqft: 1900 },
        { city: 'Singapore', country: 'Singapore', region: 'Asia', usdPerSqft: 1810 }
    ];
    const REGION_COLOR = { Europe: 'var(--red)', Asia: 'var(--mustard)', Americas: 'var(--blue)', Oceania: 'var(--green)' };

    const SQFT_PER_SQM = 10.7639;
    const BUDGET = 1000000;
    const state = { unit: 'm2', currency: 'USD' };
    let H;

    // Floor area one million buys, in the chosen unit
    const area = c => {
        const usdBudget = state.currency === 'USD' ? BUDGET : BUDGET * FX.usdPerEur;
        const sqft = usdBudget / c.usdPerSqft;
        return state.unit === 'm2' ? sqft / SQFT_PER_SQM : sqft;
    };
    // Price per unit in the chosen currency
    const price = c => {
        const perUnitUsd = state.unit === 'm2' ? c.usdPerSqft * SQFT_PER_SQM : c.usdPerSqft;
        return state.currency === 'USD' ? perUnitUsd : perUnitUsd / FX.usdPerEur;
    };
    const tileSize = () => state.unit === 'm2' ? 1 : 10; // one tile = 1 m² or 10 ft²
    const unitLabel = () => state.unit === 'm2' ? 'm²' : 'ft²';
    const money = v => (state.currency === 'USD' ? '$' : '€') + H.fmt(Math.round(v));

    // Tiles in blocks of ten; a final partial tile is cut to its fraction
    function tiles(count, color, row) {
        const items = Array(Math.floor(count)).fill(1);
        const part = count - Math.floor(count);
        if (part > 0.05) items.push(part);
        let html = '', n = 0;
        for (let b = 0; b < items.length; b += 10) {
            html += '<span class="sqm-block">' + items.slice(b, b + 10).map(f =>
                `<i class="${f < 1 ? 'part' : ''}" style="--c:${color};--d:${row * 40 + (n++) * 12}ms${f < 1 ? `;--w:${Math.round(f * 100)}%` : ''}"></i>`).join('') + '</span>';
        }
        return html;
    }

    function render(view, helpers) {
        H = helpers;
        view.innerHTML = `
            <div class="wrap">
                <a class="crumb" href="#/engine-room">← Engine Room</a>
                <div class="er-title">
                    <span class="label">Picture Statistics · One Square Metre</span>
                    <h1>What does a <u>million</u> buy?</h1>
                    <p>Floor space for one million in the ten priciest housing markets. One tile is one piece of floor. Count the tiles.</p>
                </div>

                <div class="console sqm-console">
                    <span class="er-control"><span class="er-ctl-label">Tile</span>
                        <span class="keys">
                            <button type="button" class="key" data-unit="m2">1 m²</button>
                            <button type="button" class="key" data-unit="ft2">10 ft²</button>
                        </span></span>
                    <span class="er-control"><span class="er-ctl-label">Budget</span>
                        <span class="keys">
                            <button type="button" class="key" data-currency="USD">$1,000,000</button>
                            <button type="button" class="key" data-currency="EUR">€1,000,000</button>
                        </span></span>
                    <span class="sqm-key" id="sqm-key"></span>
                </div>

                <div class="sqm-chart" id="sqm-chart"></div>

                <div class="sqm-legend">
                    ${Object.entries(REGION_COLOR).map(([r, c]) => `<span><i style="--c:${c}"></i>${r}</span>`).join('')}
                </div>

                <div class="sqm-notes">
                    <p>${H.dot(SOURCE.acc)}<b>Prices:</b> prime homes, the top end of each market, not the average flat. <a href="${SOURCE.url}" target="_blank" rel="noopener">${H.esc(SOURCE.title)}</a>. Converted from US dollars per square foot.</p>
                    <p>${H.dot(FX.acc)}<b>Exchange rate:</b> 1 EUR = ${FX.usdPerEur} USD, <a href="${FX.url}" target="_blank" rel="noopener">European Central Bank reference rate</a>, ${FX.date}.</p>
                </div>

                <div class="er-next">
                    <a href="#/engine-room" class="er-prev">← Engine Room</a>
                </div>
            </div>`;

        view.querySelectorAll('[data-unit]').forEach(b => b.addEventListener('click', () => { state.unit = b.dataset.unit; paint(view); }));
        view.querySelectorAll('[data-currency]').forEach(b => b.addEventListener('click', () => { state.currency = b.dataset.currency; paint(view); }));
        paint(view);
    }

    function paint(view) {
        view.querySelectorAll('[data-unit]').forEach(b => b.classList.toggle('on', b.dataset.unit === state.unit));
        view.querySelectorAll('[data-currency]').forEach(b => b.classList.toggle('on', b.dataset.currency === state.currency));
        view.querySelector('#sqm-key').innerHTML = `<i class="sqm-tile-key"></i> = ${tileSize() === 1 ? '1 m²' : '10 ft²'} of floor`;

        view.querySelector('#sqm-chart').innerHTML = CITIES.map((c, row) => {
            const a = area(c);
            const count = a / tileSize();
            return `
                <div class="sqm-row">
                    <div class="sqm-city">
                        <span class="sqm-rank type">${String(row + 1).padStart(2, '0')}</span>
                        <span class="sqm-name">${H.esc(c.city)}</span>
                        <span class="sqm-price type">${money(price(c))} / ${unitLabel()}</span>
                    </div>
                    <div class="sqm-tiles" role="img" aria-label="${H.esc(c.city)}: ${a.toFixed(1)} ${unitLabel()} for one million">${tiles(count, REGION_COLOR[c.region], row)}</div>
                    <div class="sqm-area type">${H.fmt(Math.round(a))} ${unitLabel()}</div>
                </div>`;
        }).join('');
    }

    return { render };
})();
