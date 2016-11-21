// extend date function
Date.daysBetween = function( date1, date2 )
{
    //Get one day in milliseconds
    var one_day=1000*60*60*24;

    // Convert both dates to milliseconds
    var date1_ms = date1.getTime();
    var date2_ms = date2.getTime();

    // Calculate the difference in milliseconds
    var difference_ms = date2_ms - date1_ms;

    // Convert back to days and return
    return Math.round(difference_ms/one_day);
};

/**
 * Class for Game Mesh
 */
// function to convert mm/dd/yyyy to number between 0 - 100 (max 238 per season)
function date2value (date)
{
    var y = +date.slice(6,10); // get year in number
    var m = +date.slice(0,2);  // ... month ...
    var d = +date.slice(3,5);  // ... date  ...
    var sDate, //< starting date
        cDate; //< current date
    cDate = new Date(y, m-1, d);
    // shift year to previous year
    // since NBA season spans from Oct/25 in self year to Jun/17 in the next year
    if (m > 9) {
        sDate = new Date(y  , 9, 25);
    } else {
        sDate = new Date(y-1, 9, 25);
    }
    return Date.daysBetween(sDate, cDate) / 2.4; // map [0,100] to [0,240]
}
/// function to convert number 0-100 to mm/dd/xxxx (xxxx = 2000 or 2001)
function value2date (value)
{
    var oneDay=1000*60*60*24; // one day in MS
    var sDate = new Date(2000, 9, 25); //< an predefined starting date
    sDate.setTime(sDate.getTime() + oneDay * value * 2.4);
    return sDate.toDateString().slice(4,10);
}

/**
 * Class to display game details
 * HTML LOCATION:
 * <svg>
 *   <g id="meshGrid"></g>
 *   <g id="meshAxis"></g>
 * </svg>
 */
function GameMeshView () {
    var self = this;

    /**
     * Debug Flag
     * @type {boolean}
     */
    self.debug  = true;

    /**
     * Initialization
     */
    self.init = function (height)
    {
        // calculate svg default size & get the correct width of the window
        var div   = document.getElementById('gameMeshView');  // shortcuts
        var style = window.getComputedStyle(div, null);       // shortcuts
        // setup lengths
        self.width  = parseInt(style.getPropertyValue("width"), 10); // compute the divide window width
        self.height = height;                                        // maximum window height
        // define plot margin (it gives the minimal margin)
        self.margin = {
            left:   0.1 * self.width,
            right:  0.1 * self.width,
            top:    0.1 * self.height,
            bottom: 0.1 * self.height
        };
        self.hSpan = self.width  - self.margin.left - self.margin.right;  // the area that rect will be plotted
        self.vSpan = self.height - self.margin.top  - self.margin.bottom; // the area that rect will be plotted

        // setup SVG properties
        d3.select('#gameMeshView').selectAll('svg').remove(); // clean up everything
        self.svg = d3.select('#gameMeshView').append('svg');
        self.svg.attr('width',  self.width).attr('height', self.height);
        self.grpGrid = self.svg.append('g').attr('id','meshGrid');
        self.grpYAxis = self.svg.append('g').attr('id','meshYAxis');
        self.grpXAxis = self.svg.append('g').attr('id','meshXAxis');

        // histogram parameters
        self.nbin = 48;
        self.step = 100 / self.nbin;
        // get the index in the histogram
        self.histValue2Id = function (x) {
            return Math.max(Math.ceil(date2value(x) / self.step - 1), 0);
        };
        self.histId2Value = function (i) {
            return value2date(i * self.step);
        };
    };

    /**
     * self is a function to draw/update view
     * @param playerid
     * @param player
     * @param yearFrom
     * @param yearTo
     */
    self.update = function (playerid, player, yearFrom, yearTo)
    {
        // to remember variables for resizing
        self.playerid = playerid;
        self.player = player;
        self.yearFrom = yearFrom;
        self.yearTo = yearTo;

        // TODO SETUP DATA
        // shortcut variable names
        var debug = self.debug;
        var rSeason = player.season.RegularSeason;
        var pSeason = player.season.PostSeason;

        // counters
        var j = 0; //< index of years
        var i;     //< index of days/entries

        // organize game list object into array (kind of histogram)
        // it will produce a array for every day (period of 3-5 days)
        var gamesTotal = []; //< array of total dates
        var yearsList  = [];
        for (var year = yearFrom; year <= yearTo; ++year) {
            // initialize all variables
            var gamesInEachYear, // array data in new format
                games,           // short reference for game list in original format
                gameid;          // game index
            if (year in rSeason) {   // if the player played in self year
                yearsList.push(year); // register self year
                // initialize the game list for self year
                gamesInEachYear = [];
                // somehow fast initialize the array doesn't work
                // --> JS uses pass by reference by default maybe
                for (i = 0; i < self.nbin; ++i) {
                    gamesInEachYear.push({
                        'sumOfValues': 0,
                        'gameList': [],
                        'year': year,
                        'xpos': i, //< horizontal
                        'ypos': j  //< vertical
                    });
                }
                // game list for regular season
                games = rSeason[year].GameList;
                for (gameid in games) { // scan over all games
                    i = self.histValue2Id(games[gameid][3]);
                    gamesInEachYear[i].sumOfValues += games[gameid][10];
                    gamesInEachYear[i].gameList.push(games[gameid]);
                }
                // check is the player has played the playoffs
                if (pSeason.hasOwnProperty(year)) {
                    games = pSeason[year].GameList;
                    for (gameid in games) { // scan over all games
                        i = self.histValue2Id(games[gameid][3]);
                        gamesInEachYear[i].sumOfValues += games[gameid][10];
                        gamesInEachYear[i].gameList.push(games[gameid]);
                    }
                }
                // increment counter and extent the total array
                gamesTotal = gamesTotal.concat(gamesInEachYear);
                j++;
            }
        }

        // get the size/shape of the array
        var numOfCol = 1 + d3.max(gamesTotal, function (entry) { return entry.xpos; });
        var numOfRow = 1 + d3.max(gamesTotal, function (entry) { return entry.ypos; });

        // build bars --> essentially squares
        var boxSize = Math.min(self.hSpan / numOfCol, self.vSpan / numOfRow);
        var padSize = boxSize * 0.1;
        var barSize = boxSize - padSize;

        // adjust svg size based on the
        //self.setSize(null, numOfRow * boxSize);

        // scales
        var xScale = d3.scaleLinear() // position scales (shifted scale for axis display)
            .domain([0, numOfCol]).range([0, numOfCol * boxSize]);
        var yScale = d3.scaleLinear() // position scales
            .domain([-0.5, numOfRow - 0.5]).range([0, numOfRow * boxSize]);
        var cScale = d3.scaleLinear() // color scale
            .domain([0, 50]).range(['#E6E6E6', '#FF0A00']);

        // TODO DRAWING
        // align squares based on margins
        var xoff = self.margin.left + padSize;
        var yoff = self.margin.top  + padSize;
        // draw squares
        d3SelectAll(self.grpGrid, 'rect', gamesTotal)
            .on('mouseover', function (d) { /* if (debug) console.log(d); */ })
            .attr('x', function (d) { return xoff + xScale(d.xpos); })
            .attr('y', function (d) { return yoff + yScale(d.ypos - 0.5); })
            .attr('width',  barSize)
            .attr('height', barSize)
            .style('fill', function (d) {
                return d.gameList.length == 0 ? cScale(d.sumOfValues) : cScale(d.sumOfValues / d.gameList.length);
            });
        // draw axis
        // 1) Y axis
        var yearAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(numOfRow)
            .tickFormat(function(i) { return yearsList[i]; })
            .tickSizeOuter(0);
        // 2) X axis
        var dateAxis = d3.axisTop()
            .scale(xScale)
            .ticks(self.nbin / 2) // 2 days per tick
            .tickFormat(function(i) { return self.histId2Value(i); })
            .tickSizeOuter(0);
        self.grpYAxis
            .attr('transform','translate(' + self.margin.left + ',' + self.margin.top + ')')
            .call(yearAxis);
        self.grpXAxis
            .attr('transform','translate(' + self.margin.left + ',' + self.margin.top + ')')
            .call(dateAxis);

    };

    /**
     * self is a function to resize image
     */
    self.resize = function () {
        self.init(1000);
        self.update(self.playerid, self.player, self.yearFrom, self.yearTo);
    };
}