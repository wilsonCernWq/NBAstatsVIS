// extend date function
Date.daysBetween = function( date1, date2 )
{
    //Get 1 day in milliseconds
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
// function to convert mm/dd/yyyy to number between 0 - 10 (max 238 per season)
function date2value (date)
{
    var y = +date.slice(6,10); // get year in number
    var m = +date.slice(0,2);  // ... month ...
    var d = +date.slice(3,5);  // ... date  ...
    var sDate, //< starting date
        cDate; //< current date
    cDate = new Date(y, m-1, d);
    // shift year to previous year
    // since NBA season spans from Oct/25 in this year to Jun/17 in the next year
    if (m > 9) {
        sDate = new Date(y  , 9, 25);
    } else {
        sDate = new Date(y-1, 9, 25);
    }
    return Date.daysBetween(sDate, cDate) / 2.38;
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
    /**
     * Debug Flag
     * @type {boolean}
     */
    this.debug  = true;

    /**
     * Initialization
     */
    this.init = function (height)
    {
        // calculate svg default size & get the correct width of the window
        var div   = document.getElementById('gameMeshView');  // shortcuts
        var style = window.getComputedStyle(div, null);       // shortcuts
        // setup lengths
        this.width  = parseInt(style.getPropertyValue("width"), 10); // compute the divide window width
        this.height = height;                                        // maximum window height
        // define plot margin (it gives the minimal margin)
        this.margin = {
            left:   0.1 * this.width,
            right:  0.1 * this.width,
            top:    0.1 * this.height,
            bottom: 0.1 * this.height
        };
        this.hSpan = this.width  - this.margin.left - this.margin.right;  // the area that rect will be plotted
        this.vSpan = this.height - this.margin.top  - this.margin.bottom;// the area that rect will be plotted

        // setup SVG properties
        d3.select('#gameMeshView').selectAll('svg').remove(); // clean up everything
        this.svg = d3.select('#gameMeshView').append('svg');
        this.svg.attr('width',  this.width).attr('height', this.height);
        this.grpGrid = this.svg.append('g').attr('id','meshGrid');
        this.grpAxis = this.svg.append('g').attr('id','meshAxis');

        // histogram parameters
        this.nbin = 48;
        this.step = 100 / this.nbin;
        // get the index in the histogram
        this.histid = function (x) {
            return Math.max(Math.ceil(date2value(x) / this.step - 1), 0);
        };
    };

    /**
     * This is a function to draw/update view
     * @param playerid
     * @param player
     * @param yearFrom
     * @param yearTo
     */
    this.update = function (playerid, player, yearFrom, yearTo)
    {
        // to remember variables for resizing
        this.playerid = playerid;
        this.player = player;
        this.yearFrom = yearFrom;
        this.yearTo = yearTo;

        // TODO SETUP DATA
        // shortcut variable names
        var debug = this.debug;
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
            if (year in rSeason) {   // if the player played in this year
                yearsList.push(year); // register this year
                // initialize the game list for this year
                gamesInEachYear = [];
                // somehow fast initialize the array doesn't work
                // --> JS uses pass by reference by default maybe
                for (i = 0; i < this.nbin; ++i) {
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
                    i = this.histid(games[gameid][3]);
                    gamesInEachYear[i].sumOfValues += games[gameid][10];
                    gamesInEachYear[i].gameList.push(games[gameid]);
                }
                // check is the player has played the playoffs
                if (pSeason.hasOwnProperty(year)) {
                    games = pSeason[year].GameList;
                    for (gameid in games) { // scan over all games
                        i = this.histid(games[gameid][3]);
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
        var boxSize = Math.min(this.hSpan / numOfCol, this.vSpan / numOfRow);
        var padSize = boxSize * 0.1;
        var barSize = boxSize - padSize;

        // adjust svg size based on the
        //this.setSize(null, numOfRow * boxSize);

        // scales
        var xScale = d3.scaleLinear() // position scales
            .domain([0, numOfCol]).range([0, numOfCol * boxSize]);
        var yScale = d3.scaleLinear() // position scales
            .domain([0, numOfRow]).range([0, numOfRow * boxSize]);
        var cScale = d3.scaleLinear() // color scale
            .domain([0, 50]).range(['#E6E6E6', '#FF0A00']);

        // TODO DRAWING
        // align squares based on margins
        var xoff = this.margin.left + padSize;
        var yoff = this.margin.top  + padSize;
        // draw squares
        d3SelectAll(this.grpGrid, 'rect', gamesTotal)
            .on('mouseover', function (d) { if (debug) console.log(d); })
            .attr('x', function (d) { return xoff + xScale(d.xpos); })
            .attr('y', function (d) { return yoff + yScale(d.ypos); })
            .attr('width',  barSize)
            .attr('height', barSize)
            .style('fill', function (d) {
                return d.gameList.length == 0 ? cScale(d.sumOfValues) : cScale(d.sumOfValues / d.gameList.length);
            });
        // axis
        var yearAxis = d3.axisLeft()
            .scale(d3.scaleLinear().domain([-0.5, numOfRow - 0.5]).range([0, numOfRow * boxSize]))
            .ticks(numOfRow)
            .tickFormat(function(i) { return yearsList[i]; });
        this.grpAxis
            .attr('transform','translate(' + this.margin.left + ',' + this.margin.top + ')')
            .call(yearAxis);

    };

    /**
     * This is a function to resize image
     */
    this.resize = function () {
        this.init(1000);
        this.update(this.playerid, this.player, this.yearFrom, this.yearTo);
    };
}