// Enterpriser — Articles. Loads after data.js and fills its ENTERPRISER_ARTICLES list.
// Each article: id (route #/articles/<id>), title, dek, author, date, url, mentions (Index uids), html body.
// Links inside a body point into the journal: #/machines/<exhibit>, #/index.
// Draft source of "The Universal Merchant": the Claude Doc of the same name.

ENTERPRISER_ARTICLES.push(
    {
        id: 'universal-merchant',
        title: 'The Universal Merchant',
        dek: 'From the merchants of Ragusa to the enterprisers of Pittsburgh: the long line of people who connect strangers, and build things that outlast them.',
        author: 'Simon Allmer',
        date: '2026-10-19',
        url: '#/articles/universal-merchant',
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
