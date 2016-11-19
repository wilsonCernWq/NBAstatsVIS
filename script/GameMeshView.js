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
 * Constructor
 * In this function you want to input all initial variables the class will need
 */
function GameMeshView (divId) {
    this.debug  = true;
    this.divId  = divId;
    this.marginPER = {left: 0.1, right: 0.6, top: 0, bottom: 0};
    // statistical attributes
    this.nbin = 48;
    this.step = 100 / this.nbin;

    this.histid = function (x) {
        return Math.max(Math.ceil(date2value(x) / this.step - 1), 0);
    };

    /**
     * Initialization
     */
    this.init = function () {
        // calculate svg default size & get the correct width of the window
        var div   = document.getElementById(this.divId);  // shortcuts
        var style = window.getComputedStyle(div, null); // shortcuts
        // setup svg attributes
        this.svgWidth  = parseInt(style.getPropertyValue("width"), 10);
        this.svgHeight = 1000;
        this.svg = d3.select('#' + this.divId).select('svg');
        this.setSize();
    };

    /**
     * Reset SVG size
     * @param contentX
     * @param contentY
     */
    this.setSize = function (contentX, contentY) {
        if (contentX) {
            this.svgWidth = contentX / (1 - this.marginPER.left - this.marginPER.right);
        }
        if (contentY) {
            this.svgHeight = contentY / (1 - this.marginPER.top - this.marginPER.bottom);
        }
        this.margin = {
            left:   this.marginPER.left   * this.svgWidth,
            right:  this.marginPER.right  * this.svgWidth,
            top:    this.marginPER.top    * this.svgHeight,
            bottom: this.marginPER.bottom * this.svgHeight
        };
        this.svg
            .attr('width', this.svgWidth)
            .attr('height', this.svgHeight)
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
        for (var year = yearFrom; year <= yearTo; ++year) {
            // initialize all variables
            var gamesInEachYear, // array data in new format
                games,           // short reference for game list in original format
                gameid;          // game index
            if (year in rSeason) { // if the player played in this year
                // initialize the game list for this year
                gamesInEachYear = [];
                // somehow fast initialize the array doesn't work
                // --> JS uses pass by reference by default maybe
                for (i = 0; i < this.nbin; ++i) {
                    gamesInEachYear.push({
                        'sumOfValues': 0,
                        'gameList': [],
                        'year': year,
                        'xpos': j, //< horizontal
                        'ypos': i  //< vertical
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
        var boxSize = (this.svgWidth - this.margin.left - this.margin.right) / numOfCol;
        var padSize = boxSize * 0.1;
        var barSize = boxSize - padSize;

        // adjust svg size based on the
        this.setSize(null, numOfRow * boxSize);

        // scales
        var xScale = d3.scaleLinear() // position scales
            .domain([0, numOfCol]).range([0, this.svgWidth - this.margin.left - this.margin.right]);
        var yScale = d3.scaleLinear() // position scales
            .domain([0, numOfRow]).range([0, numOfRow * boxSize]);
        var cScale = d3.scaleLinear() // color scale
            .domain([0, 50]).range(['#E6E6E6', '#FF0A00']);

        // TODO DRAWING
        // align squares based on margins
        var xoff = this.margin.left + padSize;
        var yoff = this.margin.top  + padSize;
        // draw squares
        var svgR = this.svg.selectAll('rect').data(gamesTotal);
        svgR.exit().remove();
        svgR = svgR.enter().append('rect').merge(svgR);
        svgR
            .on('mouseover', function (d) { if (debug) console.log(d); })
            .attr('x', function (d) { return xoff + xScale(d.xpos); })
            .attr('y', function (d) { return yoff + yScale(d.ypos); })
            .attr('width',  barSize)
            .attr('height', barSize)
            .style('fill', function (d) {
                return d.gameList.length == 0 ? cScale(d.sumOfValues) : cScale(d.sumOfValues / d.gameList.length);
            });
        // axis
        //var yearAxis = d3.axisBottom().

    };

    /**
     * This is a function to resize image
     */
    this.resize = function () {
        this.init();
        this.update(this.playerid, this.player, this.yearFrom, this.yearTo);
    };
}




