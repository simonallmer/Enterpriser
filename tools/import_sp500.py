#!/usr/bin/env python3
"""Import S&P 500 constituents into the Enterpriser Index.

Sources:
  1. Wikipedia "List of S&P 500 companies" (ticker, name, GICS, HQ, founded, CIK)
  2. Wikidata, matched by SEC CIK (P5531): QID, official website (P856), inception (P571)

Writes ../data-sp500.js. Re-run any time to refresh:
    python3 tools/import_sp500.py
"""
import html
import json
import re
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data-sp500.js"
UA = "EnterpriserIndexImporter/0.1"
WIKI_URL = "https://en.wikipedia.org/wiki/List_of_S%26P_500_companies"
MIN_AGE = 5
TODAY = date.today()

# Official sites for companies whose Wikidata item has none (checked by hand)
MANUAL_SITES = {
    "PODD": "https://www.insulet.com",
    "LITE": "https://www.lumentum.com",
    "NCLH": "https://www.nclhltd.com",
    "PCG": "https://www.pgecorp.com",
    "WSM": "https://www.williams-sonomainc.com",
}

# Tickers already hand-curated in data.js (skip to avoid duplicates)
CURATED = {"AAPL"}

US_STATES = {
    "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida",
    "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine",
    "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska",
    "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio",
    "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas",
    "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming", "D.C.",
}
CONTINENT = {
    "United States": "North America", "Canada": "North America", "Bermuda": "North America",
    "Ireland": "Europe", "United Kingdom": "Europe", "Switzerland": "Europe", "Netherlands": "Europe",
}


def get(url, accept=None, data=None, retries=3):
    headers = {"User-Agent": UA, **({"Accept": accept} if accept else {})}
    for attempt in range(retries):
        req = urllib.request.Request(url, data=data, headers=headers)
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read().decode("utf-8")
        except urllib.error.HTTPError as e:
            if e.code != 429 or attempt == retries - 1:
                raise
            print("Rate-limited, waiting 65 s…")
            time.sleep(65)


def text(cell):
    return re.sub(r"\[\d+\]", "", html.unescape(re.sub(r"<[^>]+>", "", cell))).strip()


def parse_wikipedia():
    page = get(WIKI_URL)
    table = page[page.find('id="constituents"'):]
    table = table[:table.find("</table>")]
    rows = re.findall(r"<tr.*?</tr>", table, re.S)
    out = []
    for r in rows[1:]:
        raw = re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r, re.S)
        c = [text(x) for x in raw]
        if len(c) < 8:
            continue
        m = re.search(r'href="(?:https://en.wikipedia.org)?(?:/wiki/|\./)([^"#]+)"', raw[1])
        article = urllib.parse.unquote(m.group(1)).replace("_", " ") if m else None
        out.append(dict(ticker=c[0], name=c[1], sector=c[2], sub=c[3], hq=c[4], added=c[5], cik=c[6], founded_raw=c[7],
                        article=article))
    return out


def wikidata(keys, by="cik"):
    """Return {key: {qid, sites:{(rank, is_english, url)}, inception:{years}}}.
    by="cik" matches SEC CIK (P5531); by="article" matches the English Wikipedia article title."""
    result = {}
    keys = list(keys)
    for i in range(0, len(keys), 600):  # one request: the endpoint may limit to 1 req/min
        if by == "cik":
            values = " ".join(f'"{c}"' for c in keys[i:i + 600])
            match = f"VALUES ?cik {{ {values} }} ?item wdt:P5531 ?cik ."
        else:
            values = " ".join(json.dumps(f"https://en.wikipedia.org/wiki/{urllib.parse.quote(a.replace(' ', '_'), safe='')}")
                              for a in keys[i:i + 600])
            match = (f"VALUES ?url {{ {values} }} BIND(IRI(?url) AS ?article) "
                     "?article schema:about ?item . BIND(STR(?url) AS ?cik)")
        q = f"""
        SELECT ?item ?cik ?site ?rank ?lang ?inception WHERE {{
          {match}
          OPTIONAL {{ ?item p:P856 ?st . ?st ps:P856 ?site ; wikibase:rank ?rank .
                     OPTIONAL {{ ?st pq:P407 ?lang }} }}
          OPTIONAL {{ ?item wdt:P571 ?inception }}
        }}"""
        body = urllib.parse.urlencode({"query": q}).encode()
        data = json.loads(get("https://query.wikidata.org/sparql", "application/sparql-results+json", body))
        for b in data["results"]["bindings"]:
            cik = b["cik"]["value"]
            if by == "article":
                cik = urllib.parse.unquote(cik.rsplit("/wiki/", 1)[1]).replace("_", " ")
            d = result.setdefault(cik, {"qid": b["item"]["value"].rsplit("/", 1)[1], "sites": set(), "inception": set()})
            if "site" in b:
                rank = b["rank"]["value"].rsplit("#", 1)[1]
                eng = b.get("lang", {}).get("value", "").endswith("/Q1860")
                d["sites"].add((rank, eng, b["site"]["value"]))
            if "inception" in b:
                m = re.match(r"-?(\d{4})", b["inception"]["value"])
                if m:
                    d["inception"].add(int(m.group(1)))
    return result


def best_site(sites):
    if not sites:
        return None
    if any(r == "DeprecatedRank" for r, _, _ in sites):
        sites = {s for s in sites if s[0] != "DeprecatedRank"} or sites

    def key(s):
        rank, eng, url = s
        return (rank != "PreferredRank", not eng, len(url))
    return re.sub(r"(?<!:)/{2,}$", "/", sorted(sites, key=key)[0][2])


def place(hq):
    parts = [p.strip() for p in hq.split(",")]
    last = parts[-1]
    if last in US_STATES or last.lower() == "none":
        country = "United States"
    else:
        country = last
    city = ", ".join(parts[:-1]) if len(parts) > 1 else (parts[0] if last.lower() != "none" else "Remote")
    if last in US_STATES:
        city = hq
    return {"city": city, "country": country, "continent": CONTINENT.get(country, "Unknown")}


def main():
    rows = parse_wikipedia()
    seen, rows_unique = set(), []
    for r in rows:  # share classes (GOOGL/GOOG…) share one CIK
        if r["cik"] in seen or r["ticker"] in CURATED:
            continue
        seen.add(r["cik"])
        rows_unique.append(r)

    wd = wikidata([r["cik"] for r in rows_unique])
    # Fallback: items without a CIK (or without a website) are matched via their Wikipedia article
    missing = [r for r in rows_unique if r["article"] and not wd.get(r["cik"], {}).get("sites")]
    if missing:
        by_article = wikidata([r["article"] for r in missing], by="article")
        print(f"Fallback by article: {len(missing)} queried, {len(by_article)} matched")
        for r in missing:
            if r["article"] in by_article:
                wd[r["cik"]] = by_article[r["article"]]
    entries, excluded = {}, []

    for r in rows_unique:
        years = [int(y) for y in re.findall(r"\b(1[0-9]{3}|20[0-9]{2})\b", r["founded_raw"])]
        if not years:
            excluded.append((r["ticker"], "no founding year"))
            continue
        founded = years[0]
        lineage = min(years) if min(years) < founded else None
        if TODAY.year - founded < MIN_AGE:
            excluded.append((r["ticker"], f"founded {founded} (< {MIN_AGE} yrs)"))
            continue

        w = wd.get(r["cik"], {})
        agrees = founded in w.get("inception", set())
        sources = {"wp": {"title": "Wikipedia — List of S&P 500 companies", "url": WIKI_URL}}
        src = ["wp"]
        if w.get("qid"):
            sources["wd"] = {"title": f"Wikidata — {w['qid']}", "url": f"https://www.wikidata.org/wiki/{w['qid']}"}
            if agrees:
                src.append("wd")

        uid = "ent-sp-" + re.sub(r"[^a-z0-9]+", "-", r["ticker"].lower())
        entries[uid] = {
            "uid": uid,
            "label": re.sub(r"\s*\(Class [A-Z]\)$", "", r["name"]),
            "ids": {k: v for k, v in {"ticker": r["ticker"], "cik": r["cik"], "wikidata": w.get("qid")}.items() if v},
            "website": MANUAL_SITES.get(r["ticker"]) or best_site(w.get("sites")),
            "founded": {
                "year": founded,
                "acc": "green" if agrees else "blue",
                "src": src,
                "note": f"Source lists founding as “{r['founded_raw']}”." if r["founded_raw"] != str(founded) else None,
            },
            "lineage": lineage,
            "status": "alive",
            "ended": None,
            "hq": place(r["hq"]),
            "industry": {"label": r["sub"], "sector": r["sector"]},
            "lists": ["sp500"],
            "sp500_added": r["added"],
            "sources": sources,
        }

    header = (
        "// Enterpriser Index — S&P 500 constituents (generated by tools/import_sp500.py — do not edit by hand)\n"
        f"// Generated {TODAY.isoformat()} from Wikipedia + Wikidata. {len(entries)} entries, "
        f"{len(excluded)} excluded.\n"
        "// Excluded: " + "; ".join(f"{t} ({why})" for t, why in excluded) + "\n\n"
    )
    OUT.write_text(header + "const ENTERPRISER_SP500 = " + json.dumps(entries, ensure_ascii=False, indent=1) + ";\n")
    print(f"Wrote {OUT.name}: {len(entries)} entries")
    print("Excluded:", excluded)
    missing_site = [e["label"] for e in entries.values() if not e["website"]]
    print(f"No website ({len(missing_site)}):", missing_site)
    unknown = [e["label"] for e in entries.values() if e["hq"]["continent"] == "Unknown"]
    print("Unknown continent:", unknown)


if __name__ == "__main__":
    main()
