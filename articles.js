// Enterpriser — Articles. Loads after data.js and fills its ENTERPRISER_ARTICLES list.
// Each article: id (route #/articles/<id>), title, dek, author, date, url, mentions (Index uids), html body.
// Links inside a body point into the journal: #/machines/<exhibit>, #/index.
// Draft source of "A Noble Profession": the Claude Doc of the same name.

ENTERPRISER_ARTICLES.push(
    {
        id: 'a-noble-profession',
        title: 'A Noble Profession',
        dek: 'From the merchants of Ragusa to the enterprisers of Pittsburgh: the long line of people who connect strangers, and build things that outlast them.',
        author: 'Simon Allmer',
        date: '2026-10-19',
        url: '#/articles/a-noble-profession',
        mentions: [],
        html: `
            <h2>The most universal of men</h2>
            <p>In 1458, waiting out the plague in the hills above Naples, a merchant from Ragusa sat down to describe his calling. Benedetto Cotrugli called his manuscript <i>The Book of the Art of Trade</i>, and he set the bar high.</p>
            <blockquote>A merchant should be the most universal of men, and one that has the most to do, more than his fellows, with different types of men and social classes.</blockquote>
            <p>For Cotrugli, everything a man might know could help a merchant: cosmography and geography, philosophy and the stars, theology and law. A merchant had to read the sea, the season and the stranger across the table. He kept his accounts in double entry, a generation before the method reached print. The historian Niall Ferguson reads the book as a manifesto for a new society of networked polymaths.</p>
            <p>That is the figure this journal is written for. The merchant who knows a little of everything, and builds the roads by which everything else travels.</p>

            <h2>A long line of builders</h2>
            <p>Cotrugli stood in a line that was already old. Phoenician traders carried the alphabet along with their cargo. The Hanseatic towns bound the Baltic into one market with a shared law of the sea. Venice ran its galleys to a timetable and built ships on a moving line in the Arsenal, centuries before Detroit.</p>
            <p>The line kept growing. The Fuggers of Augsburg financed silver mines and the election of an emperor. The Dutch merchants of 1602 invented the tradable share, so that a baker could own part of a voyage to the Spice Islands. In London, men met over coffee at Lloyd's and learned to insure a ship they would never see.</p>
            <p>Each of them did the same quiet thing. They connected people who had never met, and made it safe for strangers to trust each other. Most of the institutions we live inside, the bank, the post, the newspaper, the exchange, began on a merchant's desk. Then steam arrived, and the merchant who once carried goods began to make them, and to lay the roads they travelled on.</p>

            <h2>The century of connection</h2>
            <p>After Waterloo, the great powers kept a broad peace for a hundred years. Into that long quiet stepped a new kind of merchant, one who built at the scale of a continent. English had an old name for such a person, taken from the French <i>entreprendre</i>, to undertake: the <b>enterpriser</b>. Their critics called them Robber Barons. History may remember them as the enterprisers who wired a nation together.</p>
            <p>Cornelius Vanderbilt began with a single ferry on New York harbour and ended with a railroad that ran to Chicago. In 1869 two lines met at Promontory Summit, and a journey across America shrank from months to a week. Andrew Carnegie took the Bessemer process and made steel cheap enough for bridges, rails and towers. John D. Rockefeller refined kerosene so cheaply that a farmhouse could read after dark.</p>
            <p>The connecting changed time itself. On 18 November 1883 the railroads put the country on four standard time zones, and a noon in Boston finally agreed with a noon in Philadelphia. Then many of the same men gave the fortune back as institutions: Carnegie paid for more than 2,500 public libraries, and Rockefeller founded a university and a foundation that helped end hookworm in the American South.</p>
            <p>They were demanding, ambitious, often hard. They were also Cotrugli's heirs. The enterpriser was the universal merchant grown to the size of a continent, one who read the map, the machine and the market at once, and left behind roads others still travel.</p>

            <h2>Machines that hold an idea</h2>
            <p>Every enterpriser learns by pattern. Seen once, a pattern turns up everywhere: in a harbour, a ledger, a forest, a career. Our <a href="#/machines">Machines</a> are those patterns, built so you can set them running and watch.</p>
            <p><a href="#/machines/oil-economy">The Oil Economy</a> is a field that can only be drawn down. Run it, and you feel the shape of every finite resource: the whale oil of Nantucket, the tin of Cornwall, the coal of Wales, the first fame of a new idea. Rich early years, a peak, and the long work of finding what comes next.</p>
            <p><a href="#/machines/fishery">The Fishery</a> is a stock that grows back, if the catch leaves it room. The same machine describes a forest, a pasture, the soil of a vineyard, or the goodwill of a loyal customer. <a href="#/machines/bicycle-shop">The Bicycle Shop</a> is a shelf kept full across a delay, and it is as true of a Venetian warehouse as of a modern factory.</p>
            <p>Each Machine is a symbol you can carry. Learn it once, and you will recognise it across five centuries of trade.</p>

            <h2>Take your place</h2>
            <p>The tools change with every age: a galley, a ledger, a railroad, a 3D printer guided by code. The calling stays. To undertake something, to connect people who have never met, and to build a thing well enough that it outlasts you.</p>
            <p>Enterpriser is written for those who answer that call. <a href="#/articles"><b>Articles</b></a> carry the craft, and each should still be worth reading in the decades to come. <a href="#/machines"><b>Machines</b></a> let you run the patterns that every builder meets. The <a href="#/index"><b>Index</b></a> keeps the record of businesses worldwide, ranked by how long they have lasted.</p>
            <p>The line that runs from the merchants of Ragusa to the enterprisers of Pittsburgh is still open. You are welcome in it.</p>
            <p class="definition"><b>en·ter·pris·er</b> (n.) One who undertakes a business or venture. From Old French <i>entreprendre</i>, “to undertake.”</p>`
    }
);

ENTERPRISER_ARTICLES.push(
    {
        id: 'seven-powers',
        title: 'The Seven Powers',
        dek: 'Why some businesses last: Hamilton Helmer\'s seven sources of enduring advantage, each with one example.',
        author: 'Simon Allmer',
        date: '2026-10-19',
        url: '#/articles/seven-powers',
        mentions: ['ent-sp-amzn', 'ent-0012-toyota'],
        html: `
            <p>Some businesses outlast their founders, their products and their century. The strategist Hamilton Helmer spent decades asking why. His answer, set out in <i>7 Powers: The Foundations of Business Strategy</i>, is that a lasting business holds at least one of seven powers.</p>
            <p>Each power has two halves. A benefit, which lets the business make something better or cheaper. And a barrier, which keeps rivals from simply copying it. A benefit alone is soon imitated, and a barrier alone guards nothing worth having. Together they let a good thing last, which is the same question the <a href="#/index">Index</a> asks of every company.</p>
            <p>Here are the seven, each in Helmer's own definition, with one example.</p>

            <h2>1. Scale Economies</h2>
            <figure><img src="images/seven-powers/1-scale-economies.jpg" alt="Container cranes over a Maersk ship. 1. Scale Economies." width="1200" height="1200" loading="lazy"></figure>
            <p class="power-def">A business in which per unit cost declines as production volume increases.</p>
            <p class="power-ex">Example: Maersk</p>
            <p>Many costs of a voyage, the crew, the port call, the route, barely change with the size of the ship. In 2013 Maersk launched its Triple-E class, among the largest container ships afloat, and spread each voyage across more boxes than smaller rivals could carry. Its own terminals extend the same advantage on land.</p>

            <h2>2. Network Economies</h2>
            <figure><img src="images/seven-powers/2-network-economies.jpg" alt="Lit office windows at night. 2. Network Economies." width="1200" height="1200" loading="lazy"></figure>
            <p class="power-def">A business in which the value realized by a customer increases as the installed base increases.</p>
            <p class="power-ex">Example: Slack</p>
            <p>Slack is worth little to a team of one. Each colleague who joins a workspace makes it more useful to everyone already there, and Slack Connect extends the pull to partners in other companies. It is a reinforcing loop, the same kind that grows capital in <a href="#/machines/oil-economy">The Oil Economy</a>. Once a whole company talks in Slack, a rival must win over everyone at once.</p>

            <h2>3. Counter-Positioning</h2>
            <figure><img src="images/seven-powers/3-counter-positioning.jpg" alt="Aisles of books in an Amazon warehouse. 3. Counter-Positioning." width="1200" height="1200" loading="lazy"></figure>
            <p class="power-def">A newcomer adopts a new, superior business model which the incumbent does not mimic due to anticipated damage to their existing business.</p>
            <p class="power-ex">Example: Amazon</p>
            <p>Amazon began in 1995 as a bookshop without shops. With no stores to stock, it could offer millions of titles at lower prices. Barnes &amp; Noble and Borders could see the model, but going fully online meant undercutting the stores that earned their living. Borders even handed its website to Amazon for seven years.</p>

            <h2>4. Switching Costs</h2>
            <figure><img src="images/seven-powers/4-switching-costs.jpg" alt="Coloured coffee capsules around a bowl of beans. 4. Switching Costs." width="1200" height="1200" loading="lazy"></figure>
            <p class="power-def">The value loss expected by a customer that would be incurred from switching to an alternate supplier for additional purchases.</p>
            <p class="power-ex">Example: Nespresso</p>
            <p>A Nespresso machine brews only capsules made to fit it, and for years, while Nestlé's patents held, that meant Nespresso's own. A customer who wants to change must buy a new machine and give up a taste they know. So most keep buying the capsules.</p>

            <h2>5. Branding</h2>
            <figure><img src="images/seven-powers/5-branding.jpg" alt="A De Beers store interior. 5. Branding." width="1200" height="1200" loading="lazy"></figure>
            <p class="power-def">The durable attribution of higher value to an objectively identical offering that arises from historical information about the seller.</p>
            <p class="power-ex">Example: De Beers</p>
            <p>Stone for stone, a diamond from De Beers is the same carbon as any other. Since 1947 the line “A Diamond Is Forever” has taught generations that a diamond stands for a promise. The De Beers name, built since 1888, carries that history into every sale.</p>

            <h2>6. Cornered Resource</h2>
            <figure><img src="images/seven-powers/6-cornered-resource.jpg" alt="A Formula One car racing through Monaco. 6. Cornered Resource." width="1200" height="1200" loading="lazy"></figure>
            <p class="power-def">Preferential access at attractive terms to a coveted asset that can independently enhance value.</p>
            <p class="power-ex">Example: Formula One</p>
            <p>Formula One holds the commercial rights to the FIA Formula One World Championship under an agreement that runs for a hundred years, from 2011 to 2110. Anyone who wants the pinnacle of motor racing, its teams, its circuits from Monaco to Monza and its worldwide audience, must deal with Formula One.</p>

            <h2>7. Process Power</h2>
            <figure><img src="images/seven-powers/7-process-power.jpg" alt="Robots welding car bodies on a Toyota line. 7. Process Power." width="1200" height="1200" loading="lazy"></figure>
            <p class="power-def">Embedded company organization and activity sets which enable lower costs and/or superior product, and which can be matched only by an extended commitment.</p>
            <p class="power-ex">Example: Toyota</p>
            <p>Toyota's lean manufacturing system (kaizen, kanban, andon cords and just-in-time production) gave it a sustained cost and quality advantage. Its processes were refined over decades and are incredibly hard to replicate effectively.</p>

            <h2>The Seven Powers</h2>
            <ol class="power-list">
                <li>Scale Economies</li>
                <li>Network Economies</li>
                <li>Counter-Positioning</li>
                <li>Switching Costs</li>
                <li>Branding</li>
                <li>Cornered Resource</li>
                <li>Process Power</li>
            </ol>

            <h2>Which do you hold?</h2>
            <p>The oldest businesses in the <a href="#/index">Index</a> rarely rely on one power alone. A name built over generations, a process no rival has the patience to copy. Ask of your own work which of the seven it holds today, and which it could build.</p>
            <p class="definition">Source: Hamilton Helmer, <i>7 Powers: The Foundations of Business Strategy</i> (2016).</p>`
    }
);

ENTERPRISER_ARTICLES.push(
    {
        id: 'get-things-done',
        title: 'Get Things Done',
        dek: 'A clear head is a builder\'s first tool. David Allen\'s workflow, four properties every project should define, and a machine to try it on your own list.',
        author: 'Simon Allmer',
        date: '2026-10-20',
        url: '#/articles/get-things-done',
        mentions: [],
        html: `
            <p>Every builder carries more than they can hold. Orders, ideas, promises, a door that squeaks. In <i>Getting Things Done</i>, first published in 2001, David Allen argued that the mind is for having ideas, not for holding them. Get everything out of your head, decide what each thing is, and keep it where you will see it at the right moment.</p>
            <p>His method has five steps: capture, clarify, organize, reflect, engage. The machine below runs the middle of it. Write down whatever is on your mind, then walk each item down the workflow until it lands where it belongs.</p>

            <div class="article-machine" data-machine="get-things-done"></div>
            <p class="power-ex"><a href="#/machines/get-things-done">Open the machine on its own page →</a></p>

            <h2>The two questions</h2>
            <p>Everything turns on two questions. <b>Is it actionable?</b> If not, it goes in the trash, on a Someday / Maybe list, or into reference. If it is, <b>what's the next action?</b> Not “the catalogue,” but “call the printer about paper samples.” A next action is something you could do right now, with your hands.</p>
            <p>Then three rules sort the actions. Under two minutes, do it now, since filing it takes longer. If someone else should do it, delegate it and note it under Waiting For. If it must happen on a given day, it goes in the calendar. Everything else goes on the Next Actions list.</p>

            <h2>Four properties of every project</h2>
            <p>Anything that takes more than one step is a project, whether it is a company, a division, a series or a single product. Before its first action, each should have four properties defined.</p>
            <p class="power-ex">Vision</p>
            <p>Also known as the outcome. It gives a clear picture of the finished thing, and a clear picture leads to intuitive, creative solutions for the way to get there.</p>
            <p class="power-ex">Purpose</p>
            <p>Asking the why question gives people focus and strengthens collaboration. When the purpose is shared, people stop asking for permission and start helping.</p>
            <p class="power-ex">Principles</p>
            <p>The boundaries of good behaviour. Allen offers a test: complete the sentence “I would give others totally free rein to do this as long as they…” Whatever finishes the sentence is a principle. A second question helps too: what behaviour might undermine what I'm doing, and how can I prevent it?</p>
            <p class="power-ex">Technical Insight</p>
            <p>The new quality that sets the work apart from anything else out there. A vision says where you are going; the insight says why only you can get there this way.</p>
            <p>The machine asks for all four whenever an item turns out to be a project. Open the Projects tray and look for an unlit lamp: a project with no next action is only a wish.</p>

            <h2>The weekly review</h2>
            <p>The system works only if you trust it, and you trust it only if you look at it. Once a week, empty the IN tray, read every list, check what you are waiting for, and look again at Someday / Maybe. Allen calls the result a mind like water: calm, and ready for whatever lands in it.</p>
            <p class="definition">Source: David Allen, <i>Getting Things Done: The Art of Stress-Free Productivity</i> (2001; revised 2015).</p>`
    }
);
