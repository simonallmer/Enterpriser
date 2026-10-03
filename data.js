// Enterpriser Index — hand-curated entries v0.2
// Schema: see schema.md. Accuracy: green | blue | yellow | red.
// NOTE: seed figures are drafts and must be checked against their sources before publishing.

const ENTERPRISER_INDEX = {
    "ent-0001-kongo-gumi": {
        uid: "ent-0001-kongo-gumi",
        label: "Kongō Gumi",
        legal_name: "Kongō Gumi Co., Ltd.",
        aliases: ["金剛組"],
        ids: { wikidata: "Q72634" },
        website: "https://www.kongogumi.co.jp/",
        summary: "Temple builders since 578. Survived 1,400 years on one craft. Rescued by a buyer in 2006 and still builds under its own name.",
        founded: { year: 578, place: "Osaka", country: "Japan", acc: "blue", src: ["s1"], note: "Founded to build Shitennō-ji temple." },
        status: "alive",
        ended: null,
        events: [
            { year: 578, type: "founded", text: "Shigemitsu Kongō, a craftsman from Baekje, is brought to Japan to build Shitennō-ji." },
            { year: 2006, type: "acquired", text: "Becomes a subsidiary of Takamatsu Construction Group after debt problems. Keeps its name and craft." }
        ],
        founders: [{ name: "Shigemitsu Kongō" }],
        hq: { city: "Osaka", country: "Japan", continent: "Asia" },
        industry: { label: "Construction", isic: "F41", sector: "Industrials" },
        ownership: "subsidiary",
        parent: { label: "Takamatsu Construction Group", uid: null },
        products: ["Buddhist temples", "Shrines", "Restoration of historic buildings"],
        production: "Traditional joinery by in-house carpenter teams (kumi). Know-how passed down through apprenticeship.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Kongō Gumi", url: "https://en.wikipedia.org/wiki/Kong%C5%8D_Gumi" }
        }
    },

    "ent-0002-keiunkan": {
        uid: "ent-0002-keiunkan",
        label: "Nishiyama Onsen Keiunkan",
        legal_name: "Nishiyama Onsen Keiunkan",
        aliases: ["西山温泉 慶雲館"],
        ids: { wikidata: "Q7040843" },
        website: "https://keiunkan.co.jp/en/",
        summary: "A hot-spring inn in the mountains of Yamanashi. Run by the same family line for over 50 generations.",
        founded: { year: 705, place: "Hayakawa, Yamanashi", country: "Japan", acc: "blue", src: ["s1"] },
        status: "alive",
        ended: null,
        events: [
            { year: 705, type: "founded", text: "Founded by Fujiwara Mahito at a hot spring in the Akaishi Mountains." },
            { year: 2011, type: "milestone", text: "Recognised by Guinness World Records as the oldest hotel in the world." }
        ],
        founders: [{ name: "Fujiwara Mahito" }],
        hq: { city: "Hayakawa", country: "Japan", continent: "Asia" },
        industry: { label: "Accommodation", isic: "I55", sector: "Consumer Discretionary" },
        ownership: "family",
        parent: null,
        products: ["Ryokan lodging", "Hot-spring baths"],
        production: "One site, one spring. Value comes from place and continuity, not scale.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Nishiyama Onsen Keiunkan", url: "https://en.wikipedia.org/wiki/Nishiyama_Onsen_Keiunkan" }
        }
    },

    "ent-0003-hoshi-ryokan": {
        uid: "ent-0003-hoshi-ryokan",
        label: "Hōshi Ryokan",
        legal_name: "Hōshi",
        aliases: ["法師"],
        ids: { wikidata: "Q1192164" },
        website: "https://www.ho-shi.co.jp/en/",
        summary: "A ryokan at Awazu Onsen, run by the Hōshi family for over 40 generations.",
        founded: { year: 718, place: "Komatsu, Ishikawa", country: "Japan", acc: "red", src: ["s1"], note: "Founding date rests on family tradition." },
        status: "alive",
        ended: null,
        events: [
            { year: 718, type: "founded", text: "Garyo Hōshi opens an inn at the Awazu hot spring." }
        ],
        founders: [{ name: "Garyo Hōshi" }],
        hq: { city: "Komatsu", country: "Japan", continent: "Asia" },
        industry: { label: "Accommodation", isic: "I55", sector: "Consumer Discretionary" },
        ownership: "family",
        parent: null,
        products: ["Ryokan lodging", "Hot-spring baths"],
        production: "Family succession. Each generation takes over the house and its name.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Hōshi Ryokan", url: "https://en.wikipedia.org/wiki/H%C5%8Dshi_Ryokan" }
        }
    },

    "ent-0004-st-peter": {
        uid: "ent-0004-st-peter",
        label: "St. Peter Stiftskulinarium",
        legal_name: "St. Peter Stiftskulinarium",
        aliases: ["Stiftskeller St. Peter"],
        ids: { wikidata: "Q877651" },
        website: "https://www.stpeter.at/",
        summary: "A restaurant inside St. Peter's Abbey, Salzburg. First documented in 803. Often called the oldest restaurant in Central Europe.",
        founded: { year: 803, place: "Salzburg", country: "Austria", acc: "blue", src: ["s1"], note: "Year of first documentary mention." },
        status: "alive",
        ended: null,
        events: [
            { year: 803, type: "founded", text: "First mentioned in a document as the abbey's cellar inn." },
            { year: 2017, type: "renamed", text: "Renamed from Stiftskeller St. Peter to St. Peter Stiftskulinarium under new management." }
        ],
        founders: [{ name: "St. Peter's Abbey" }],
        hq: { city: "Salzburg", country: "Austria", continent: "Europe" },
        industry: { label: "Food & beverage service", isic: "I56", sector: "Consumer Discretionary" },
        ownership: "religious",
        parent: { label: "St. Peter's Abbey (Erzabtei St. Peter)", uid: null },
        products: ["Restaurant", "Events", "Mozart Dinner Concert"],
        production: "Owner (the abbey) leases operation to restaurateurs. The building and the name carry the continuity.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — St. Peter Stiftskulinarium", url: "https://en.wikipedia.org/wiki/St._Peter_Stiftskulinarium" }
        }
    },

    "ent-0005-stora-enso": {
        uid: "ent-0005-stora-enso",
        label: "Stora Enso",
        legal_name: "Stora Enso Oyj",
        aliases: ["Stora Kopparberg"],
        ids: { wikidata: "Q747265", ticker: "STERV (Nasdaq Helsinki)" },
        website: "https://www.storaenso.com/",
        summary: "Started as a copper mine in Falun. Moved into forests, paper, then packaging. Merged in 1998 and kept going.",
        founded: { year: 1288, place: "Falun", country: "Sweden", acc: "green", src: ["s1", "s2"], note: "Earliest surviving share letter of Stora Kopparberg." },
        status: "alive",
        ended: null,
        events: [
            { year: 1288, type: "founded", text: "Oldest known share document of the Stora Kopparberg copper mine." },
            { year: 1998, type: "merged", text: "Stora merges with Finland's Enso Oyj to form Stora Enso." }
        ],
        founders: [{ name: "Stora Kopparberg mining community" }],
        hq: { city: "Helsinki", country: "Finland", continent: "Europe" },
        industry: { label: "Forestry, pulp & packaging", isic: "C17", sector: "Materials" },
        ownership: "public",
        parent: null,
        products: ["Packaging materials", "Pulp", "Wood products", "Paper"],
        production: "Owns and manages forests. Turns wood fibre into board, pulp and building materials.",
        metrics: {
            headcount: { current: { v: 20000, year: 2023, src: ["s2"], acc: "blue", note: "Approximate" } },
            revenue: { current: { v: 9.4, unit: "EUR bn", year: 2023, src: ["s2"], acc: "blue" } }
        },
        sources: {
            s1: { title: "Wikipedia — Stora Enso", url: "https://en.wikipedia.org/wiki/Stora_Enso" },
            s2: { title: "Stora Enso Annual Report 2023", url: "https://www.storaenso.com/en/investors" }
        }
    },

    "ent-0006-beretta": {
        uid: "ent-0006-beretta",
        label: "Beretta",
        legal_name: "Fabbrica d'Armi Pietro Beretta S.p.A.",
        aliases: [],
        ids: { wikidata: "Q324782" },
        website: "https://www.beretta.com/en/",
        summary: "Gunmakers in the same valley since 1526. Family-owned for its whole history.",
        founded: { year: 1526, place: "Gardone Val Trompia", country: "Italy", acc: "green", src: ["s1"], note: "First documented sale: 185 arquebus barrels to the Republic of Venice." },
        status: "alive",
        ended: null,
        events: [
            { year: 1526, type: "founded", text: "Bartolomeo Beretta sells 185 arquebus barrels to the Venetian Arsenal." }
        ],
        founders: [{ name: "Bartolomeo Beretta" }],
        hq: { city: "Gardone Val Trompia", country: "Italy", continent: "Europe" },
        industry: { label: "Firearms manufacturing", isic: "C25", sector: "Industrials" },
        ownership: "family",
        parent: { label: "Beretta Holding", uid: null },
        products: ["Shotguns", "Pistols", "Rifles"],
        production: "Precision metalworking. Local supplier network in the Trompia valley.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Beretta", url: "https://en.wikipedia.org/wiki/Beretta" }
        }
    },

    "ent-0007-zildjian": {
        uid: "ent-0007-zildjian",
        label: "Zildjian",
        legal_name: "Avedis Zildjian Company",
        aliases: [],
        ids: { wikidata: "Q202988" },
        website: "https://zildjian.com/",
        summary: "Cymbals from a secret alloy, invented in Constantinople in 1623. Moved to the US in 1929. Still family-run.",
        founded: { year: 1623, place: "Constantinople (Istanbul)", country: "Türkiye", acc: "blue", src: ["s1"] },
        status: "alive",
        ended: null,
        events: [
            { year: 1623, type: "founded", text: "Avedis Zildjian I, an alchemist, discovers a bronze alloy for cymbals." },
            { year: 1929, type: "relocated", text: "Production moves to Quincy, Massachusetts, USA." }
        ],
        founders: [{ name: "Avedis Zildjian I" }],
        hq: { city: "Norwell, Massachusetts", country: "United States", continent: "North America" },
        industry: { label: "Musical instruments", isic: "C32", sector: "Consumer Discretionary" },
        ownership: "family",
        parent: null,
        products: ["Cymbals", "Drumsticks"],
        production: "Alloy formula kept as a family secret. Casting, rolling and hammering by hand and machine.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Zildjian", url: "https://en.wikipedia.org/wiki/Zildjian" }
        }
    },

    "ent-0008-riedel": {
        uid: "ent-0008-riedel",
        label: "Riedel",
        legal_name: "Riedel Glas",
        aliases: [],
        ids: {},
        website: "https://www.riedel.com/",
        summary: "Glassmakers for 11 generations. Lost everything in Bohemia after 1945, restarted in Tyrol.",
        founded: { year: 1756, place: "Bohemia", country: "Czechia", acc: "blue", src: ["s1"] },
        status: "alive",
        ended: null,
        events: [
            { year: 1756, type: "founded", text: "Johann Christoph Riedel starts glassmaking in Bohemia." },
            { year: 1956, type: "relocated", text: "After expulsion from Bohemia, the family restarts in Kufstein, Austria." },
            { year: 2004, type: "milestone", text: "Acquires German glassmaker Nachtmann." }
        ],
        founders: [{ name: "Johann Christoph Riedel" }],
        hq: { city: "Kufstein", country: "Austria", continent: "Europe" },
        industry: { label: "Glassware", isic: "C23", sector: "Consumer Discretionary" },
        ownership: "family",
        parent: null,
        products: ["Wine glasses", "Decanters"],
        production: "Mouth-blown and machine-made glass. Signature idea: glass shape designed per grape variety.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Riedel (glass manufacturer)", url: "https://en.wikipedia.org/wiki/Riedel_(glass_manufacturer)" }
        }
    },

    "ent-0009-old-mutual": {
        uid: "ent-0009-old-mutual",
        label: "Old Mutual",
        legal_name: "Old Mutual Limited",
        aliases: ["Mutual Life Assurance Society of the Cape of Good Hope"],
        ids: { wikidata: "Q289704" },
        website: "https://www.oldmutual.com/",
        summary: "Founded in Cape Town as a mutual life insurer in 1845. Grew into one of Africa's largest financial groups.",
        founded: { year: 1845, place: "Cape Town", country: "South Africa", acc: "blue", src: ["s1"] },
        status: "alive",
        ended: null,
        events: [
            { year: 1845, type: "founded", text: "Founded as the Mutual Life Assurance Society of the Cape of Good Hope." }
        ],
        founders: [{ name: "John Fairbairn" }],
        hq: { city: "Johannesburg", country: "South Africa", continent: "Africa" },
        industry: { label: "Insurance & financial services", isic: "K65", sector: "Financials" },
        ownership: "public",
        parent: null,
        products: ["Life insurance", "Savings", "Banking"],
        production: "Immaterial product: trust over decades. Distribution through local agents.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Old Mutual", url: "https://en.wikipedia.org/wiki/Old_Mutual" }
        }
    },

    "ent-0010-tata": {
        uid: "ent-0010-tata",
        label: "Tata Group",
        legal_name: "Tata Sons Private Limited",
        aliases: [],
        ids: { wikidata: "Q331715" },
        website: "https://www.tata.com/",
        summary: "A trading firm from 1868 turned into steel, cars, software and salt. Majority-owned by charitable trusts.",
        founded: { year: 1868, place: "Bombay (Mumbai)", country: "India", acc: "green", src: ["s1"] },
        status: "alive",
        ended: null,
        events: [
            { year: 1868, type: "founded", text: "Jamsetji Tata starts a trading company in Bombay." }
        ],
        founders: [{ name: "Jamsetji Tata" }],
        hq: { city: "Mumbai", country: "India", continent: "Asia" },
        industry: { label: "Conglomerate", isic: "K64", sector: "Industrials" },
        ownership: "holding",
        parent: null,
        products: ["Steel", "Automobiles", "IT services", "Hotels", "Consumer goods"],
        production: "Holding company. Each operating company runs its own production.",
        metrics: {
            headcount: { current: { v: 1000000, year: 2024, src: ["s2"], acc: "blue", note: "Over 1 million, group-wide" } },
            revenue: { current: { v: 165, unit: "USD bn", year: 2024, src: ["s2"], acc: "blue", note: "Group revenue FY2023–24" } }
        },
        sources: {
            s1: { title: "Wikipedia — Tata Group", url: "https://en.wikipedia.org/wiki/Tata_Group" },
            s2: { title: "Tata Group — About us", url: "https://www.tata.com/about-us" }
        }
    },

    "ent-0011-nintendo": {
        uid: "ent-0011-nintendo",
        label: "Nintendo",
        legal_name: "Nintendo Co., Ltd.",
        aliases: ["Nintendo Koppai"],
        ids: { wikidata: "Q8093", ticker: "7974 (TYO)" },
        website: "https://www.nintendo.com/",
        summary: "Started with hand-made playing cards in Kyoto. Became a video game company without leaving its home town.",
        founded: { year: 1889, place: "Kyoto", country: "Japan", acc: "green", src: ["s1", "s2"] },
        status: "alive",
        ended: null,
        events: [
            { year: 1889, type: "founded", text: "Fusajiro Yamauchi founds Nintendo Koppai to make hanafuda cards." },
            { year: 1963, type: "renamed", text: "Renamed Nintendo Co., Ltd." },
            { year: 1983, type: "milestone", text: "Launches the Family Computer (Famicom)." }
        ],
        founders: [{ name: "Fusajiro Yamauchi" }],
        hq: { city: "Kyoto", country: "Japan", continent: "Asia" },
        industry: { label: "Video games & toys", isic: "J58", sector: "Communication Services" },
        ownership: "public",
        parent: null,
        products: ["Game consoles", "Video games", "Playing cards"],
        production: "Designs hardware and software in-house. Hardware manufacturing is contracted out.",
        metrics: {
            headcount: { current: { v: 7700, year: 2024, src: ["s2"], acc: "blue", note: "Approximate, consolidated" } },
            revenue: { current: { v: 1672, unit: "JPY bn", year: 2024, src: ["s2"], acc: "green", note: "Fiscal year ended March 2024" } }
        },
        sources: {
            s1: { title: "Wikipedia — Nintendo", url: "https://en.wikipedia.org/wiki/Nintendo" },
            s2: { title: "Nintendo IR — Annual Report 2024", url: "https://www.nintendo.co.jp/ir/en/" }
        }
    },

    "ent-0012-toyota": {
        uid: "ent-0012-toyota",
        label: "Toyota",
        legal_name: "Toyota Motor Corporation",
        aliases: [],
        ids: { wikidata: "Q53268", ticker: "7203 (TYO)" },
        website: "https://global.toyota/",
        summary: "Grew out of a loom maker. Invented a production system the world copied.",
        founded: { year: 1937, place: "Koromo (Toyota City), Aichi", country: "Japan", acc: "green", src: ["s1", "s2"] },
        status: "alive",
        ended: null,
        events: [
            { year: 1926, type: "milestone", text: "Sakichi Toyoda founds Toyoda Automatic Loom Works, the parent of the car business." },
            { year: 1937, type: "founded", text: "Kiichiro Toyoda spins off Toyota Motor Co., Ltd." },
            { year: 1982, type: "merged", text: "Toyota Motor Co. and Toyota Motor Sales merge into Toyota Motor Corporation." }
        ],
        founders: [{ name: "Kiichiro Toyoda" }],
        hq: { city: "Toyota City", country: "Japan", continent: "Asia" },
        industry: { label: "Automotive", isic: "C29", sector: "Consumer Discretionary" },
        ownership: "public",
        parent: null,
        products: ["Cars", "Trucks", "Hybrid drivetrains"],
        production: "Toyota Production System: just-in-time, jidoka (stop on defect), continuous improvement on the line.",
        metrics: {
            headcount: { current: { v: 380000, year: 2024, src: ["s2"], acc: "blue", note: "Approximate, consolidated" } },
            revenue: { current: { v: 45.1, unit: "JPY tn", year: 2024, src: ["s2"], acc: "green", note: "Fiscal year ended March 2024" } }
        },
        sources: {
            s1: { title: "Wikipedia — Toyota", url: "https://en.wikipedia.org/wiki/Toyota" },
            s2: { title: "Toyota IR — Integrated Report 2024", url: "https://global.toyota/en/ir/" }
        }
    },

    "ent-0013-natura": {
        uid: "ent-0013-natura",
        label: "Natura",
        legal_name: "Natura &Co Holding S.A.",
        aliases: ["Natura Cosméticos"],
        ids: {},
        website: "https://www.naturaeco.com/",
        summary: "Brazilian cosmetics sold door to door by consultants. Built on ingredients from the Amazon.",
        founded: { year: 1969, place: "São Paulo", country: "Brazil", acc: "blue", src: ["s1"] },
        status: "alive",
        ended: null,
        events: [
            { year: 1969, type: "founded", text: "Antônio Luiz Seabra opens a small lab and shop in São Paulo." }
        ],
        founders: [{ name: "Antônio Luiz Seabra" }],
        hq: { city: "São Paulo", country: "Brazil", continent: "South America" },
        industry: { label: "Cosmetics", isic: "C20", sector: "Consumer Staples" },
        ownership: "public",
        parent: null,
        products: ["Cosmetics", "Fragrances", "Personal care"],
        production: "Sources plant ingredients from Amazon communities. Sells through a network of independent consultants.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Natura &Co", url: "https://en.wikipedia.org/wiki/Natura_%26Co" }
        }
    },

    "ent-0014-apple": {
        uid: "ent-0014-apple",
        label: "Apple",
        legal_name: "Apple Inc.",
        aliases: ["Apple Computer, Inc."],
        ids: { wikidata: "Q312", ticker: "AAPL (Nasdaq)" },
        website: "https://www.apple.com/",
        summary: "Three founders, one garage, 1976. Designs products in California and has them built by partners.",
        founded: { year: 1976, place: "Los Altos, California", country: "United States", acc: "green", src: ["s1", "s2"] },
        status: "alive",
        ended: null,
        events: [
            { year: 1976, type: "founded", text: "Steve Jobs, Steve Wozniak and Ronald Wayne found Apple Computer Company." },
            { year: 1977, type: "milestone", text: "Incorporated as Apple Computer, Inc." },
            { year: 2007, type: "renamed", text: "Renamed Apple Inc." }
        ],
        founders: [{ name: "Steve Jobs" }, { name: "Steve Wozniak" }, { name: "Ronald Wayne" }],
        hq: { city: "Cupertino, California", country: "United States", continent: "North America" },
        industry: { label: "Consumer electronics", isic: "C26", sector: "Information Technology" },
        ownership: "public",
        lists: ["sp500"],
        parent: null,
        products: ["iPhone", "Mac", "iPad", "Services"],
        production: "Designs in-house, including its own chips. Final assembly is outsourced to contract manufacturers.",
        metrics: {
            headcount: {
                founding: { v: 3, year: 1976, src: ["s1"], acc: "blue", note: "The three founders" },
                current: { v: 164000, year: 2024, src: ["s2"], acc: "green" }
            },
            revenue: { current: { v: 391.0, unit: "USD bn", year: 2024, src: ["s2"], acc: "green", note: "Fiscal year 2024" } }
        },
        sources: {
            s1: { title: "Wikipedia — Apple Inc.", url: "https://en.wikipedia.org/wiki/Apple_Inc." },
            s2: { title: "Apple Form 10-K, fiscal 2024", url: "https://investor.apple.com/sec-filings/" }
        }
    },

    "ent-0015-compaq": {
        uid: "ent-0015-compaq",
        label: "Compaq",
        legal_name: "Compaq Computer Corporation",
        aliases: [],
        ids: { wikidata: "Q324603" },
        website: null,
        summary: "Built the first successful IBM PC clone. Biggest PC maker of the 1990s. Absorbed by HP in 2002.",
        founded: { year: 1982, place: "Houston, Texas", country: "United States", acc: "green", src: ["s1"] },
        status: "absorbed",
        ended: { year: 2002, acc: "green", src: ["s1"] },
        events: [
            { year: 1982, type: "founded", text: "Three former Texas Instruments managers found the company." },
            { year: 2002, type: "ended", text: "Merged into Hewlett-Packard. The name survives only as a licensed brand." }
        ],
        founders: [{ name: "Rod Canion" }, { name: "Jim Harris" }, { name: "Bill Murto" }],
        hq: { city: "Houston, Texas", country: "United States", continent: "North America" },
        industry: { label: "Computers", isic: "C26", sector: "Information Technology" },
        ownership: "public",
        parent: { label: "Hewlett-Packard", uid: null },
        products: ["Portable computers", "Desktop PCs", "Servers"],
        production: "Reverse-engineered the IBM PC BIOS through a clean-room process.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Compaq", url: "https://en.wikipedia.org/wiki/Compaq" }
        }
    },

    "ent-0016-enron": {
        uid: "ent-0016-enron",
        label: "Enron",
        legal_name: "Enron Corporation",
        aliases: [],
        ids: { wikidata: "Q327646" },
        website: null,
        summary: "An energy trader that hid debt with accounting tricks. Bankrupt 16 years after its founding.",
        founded: { year: 1985, place: "Omaha, Nebraska", country: "United States", acc: "green", src: ["s1"], note: "Merger of Houston Natural Gas and InterNorth." },
        status: "defunct",
        ended: { year: 2001, acc: "green", src: ["s1"] },
        events: [
            { year: 1985, type: "founded", text: "Formed by the merger of Houston Natural Gas and InterNorth." },
            { year: 2001, type: "ended", text: "Files for bankruptcy after an accounting fraud is exposed." }
        ],
        founders: [{ name: "Kenneth Lay" }],
        hq: { city: "Houston, Texas", country: "United States", continent: "North America" },
        industry: { label: "Energy trading", isic: "D35", sector: "Utilities" },
        ownership: "public",
        parent: null,
        products: ["Natural gas", "Electricity", "Energy trading"],
        production: "Moved from pipelines to trading contracts. Profits booked through off-balance-sheet entities.",
        metrics: {},
        sources: {
            s1: { title: "Wikipedia — Enron", url: "https://en.wikipedia.org/wiki/Enron" }
        }
    }
};

// Articles that mention Index entries. Empty until the first issue.
const ENTERPRISER_ARTICLES = [
    // { id: "art-0001", title: "…", date: "2026-11-01", url: "#/articles/art-0001", mentions: ["ent-0012-toyota"] }
];
