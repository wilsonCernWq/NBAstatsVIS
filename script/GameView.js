/**
 * Class to display game details
 * @constructor
 * HTML LOCATION:
 * <svg>
 *   <g id="meshGrid"></g>
 *   <g id="meshAxis"></g>
 * </svg>
 */
function GameView ()
{
    var self = this;

	/**
	 * Setup margin
	 */
	self.setMargin = function () {
	    self.margin = { // define plot margin (it gives the minimal margin)
		    left:   0.2 * self.svgW,
		    right: 0.25 * self.svgW,
		    top:    0.3 * self.svgH,
		    bottom: 0.3 * self.svgH
	    };
    };

    /**
     * Initialization
     */
    self.init = function (maxHeight)
    {
    	// [0]
        // creat SVG elements
	    self.hidden = false;
	    self.div = d3.select('#divGameView');
        self.div.selectAll('*').remove(); // clean up everything
        self.svg = self.div.append('svg');
        self.grpGrid  = self.svg.append('g').attr('id','groupMeshGrid-MeshView');
        self.grpYAxis = self.svg.append('g').attr('id','groupMeshYAxis-MeshView');
        self.grpXAxis = self.svg.append('g').attr('id','groupMeshXAxis-MeshView');
	    self.grpLineR = self.svg.append('g').attr('id','groupLineR-MeshView');
	    self.grpLineB = self.svg.append('g').attr('id','groupLineB-MeshView');
	    // [1]
        // calculate svg default size & get the correct width of the window
        var div = document.getElementById('divGameView');  // shortcuts
        var sty = window.getComputedStyle(div, null);      // shortcuts
        // setup lengths
        self.svgW = parseInt(sty.getPropertyValue("width"), 10); // compute the divide window width
        self.svgH = maxHeight;                                      // maximum window height
	    self.setMargin();
        self.hSpan = self.svgW - self.margin.left - self.margin.right;  // the area that rect will be plotted
        self.vSpan = self.svgH - self.margin.top  - self.margin.bottom; // the area that rect will be plotted
	    // setting up
        self.svg.attr('width',self.svgW).attr('height', self.svgH);  // setup SVG size
	    // [2]
        // histogram parameters
        self.nbin = 48;
        self.step = 100 / self.nbin;
        // get the index in the histogram
        self.histValue2Id = function (x) { return Math.max(Math.round(date2value(x) / self.step), 0); };
        self.histId2Value = function (i) { return value2date(i * self.step); };
    };

    /**
     * self is a function to draw/update view
     */
    self.update = function ()
    {
    	// get information
	    var player   = globData.currPlayerData;
	    var playerid = +player.info.PERSON_ID;
	    var yearFrom = globData.currSelectedYearRange[0] ? globData.currSelectedYearRange[0] : player.info.FROM_YEAR;
	    var yearTo   = globData.currSelectedYearRange[1] ? globData.currSelectedYearRange[1] : Math.min(player.info.TO_YEAR,2015);
	    var attribute = globData.currSelectedAttribute[0] ? globData.currSelectedAttribute[0] : 'PTS';
	    var attrTitle = globData.currSelectedAttribute[1] ? globData.currSelectedAttribute[1] : 'Scores';
        // SETUP DATA
	    var ratio = self.svgW / 1520;
        // shortcut variable names
        // var debug = self.debug;
        var rSeason = player.season.RegularSeason;
        var pSeason = player.season.PostSeason;
        var attrID  = player.season.headerGame.indexOf(attribute);
        // console.log(attrID);
        // counters
        var j = 0; //< index of years
        var i;     //< index of days/entries
        // organize game list object into array (kind of histogram)
        // it will produce a array for every day (period of 3-5 days)
        var gamesHistTotal = []; //< array of total dates
        var yearsList  = [];
        var gamesList  = {}; var gamesListRes = 300;
        for (var y = yearFrom; y <= yearTo; ++y) {
            // initialize all variables
            var gOneYear, // array data in new format
                gRowData, // short reference for game list in original format
                gid;      // game index
            if (y in rSeason) {    // if the player played in self year
                yearsList.push({key:y, list:[]}); // register self year
                // initialize the game list for self year
                gOneYear = [];
                // somehow fast initialize the array doesn't work
                // --> JS uses pass by reference by default maybe
                for (i = 0; i < self.nbin; ++i) {
                    gOneYear.push({
                        'sumOfValues': 0,
                        'gameList': [],
                        'year': y,
                        'xpos': i, //< horizontal
                        'ypos': j  //< vertical
                    });
	                yearsList[yearsList.length-1].ypos = j;
                }
                // game list for regular season
                gRowData = rSeason[y].GameList;
                for (gid in gRowData) { // scan over all games
	                // register some info
	                gRowData[gid].type = 'RegularSeason'; //console.log(date2value(gRowData[gid][2]))
	                gRowData[gid].time = Math.round(date2value(gRowData[gid][2]) / self.step * gamesListRes);
	                // throw hist
                    i = self.histValue2Id(gRowData[gid][2]);
                    gOneYear[i].sumOfValues += gRowData[gid][attrID];
                    gOneYear[i].gameList.push(gRowData[gid]);
                    // save game for future use
	                yearsList[yearsList.length-1].list.push(gRowData[gid]);
	                if (gamesList.hasOwnProperty(gRowData[gid].time)) {
		                gamesList[gRowData[gid].time].push(gRowData[gid]);
	                } else {
		                gamesList[gRowData[gid].time] = [gRowData[gid]];
	                }
                }
                // check is the player has played the playoffs
                if (pSeason.hasOwnProperty(y)) {
                    gRowData = pSeason[y].GameList;
                    for (gid in gRowData) { // scan over all games
	                    // register some info
	                    gRowData[gid].type = 'PostSeason';
	                    gRowData[gid].time = Math.round(date2value(gRowData[gid][2]) / self.step * gamesListRes);
	                    // throw hist
                        i = self.histValue2Id(gRowData[gid][2]);
                        gOneYear[i].sumOfValues += gRowData[gid][attrID];
                        gOneYear[i].gameList.push(gRowData[gid]);
	                    // save game for future use
	                    yearsList[yearsList.length-1].list.push(gRowData[gid]);
	                    if (gamesList.hasOwnProperty(gRowData[gid].time)) {
		                    gamesList[gRowData[gid].time].push(gRowData[gid]);
	                    } else {
		                    gamesList[gRowData[gid].time] = [gRowData[gid]];
	                    }
                    }
                }
                // increment counter and extent the total array
                gamesHistTotal = gamesHistTotal.concat(gOneYear);
                j++;
            }
        }
	    //
        // get the size/shape of the array
        var numOfCol = 1 + d3.max(gamesHistTotal, function (entry) { return entry.xpos; });
        var numOfRow = 1 + d3.max(gamesHistTotal, function (entry) { return entry.ypos; });
	    //
        // build bars --> essentially squares
	    // var boxSize = Math.min(self.hSpan / numOfCol, self.vSpan / numOfRow);
	    var boxSize = self.hSpan / numOfCol;
        var padSize = boxSize * 0.1;
        var barSize = boxSize - padSize;
        var divHeight = numOfRow * boxSize + self.margin.top + self.margin.bottom;
	    // DEFINE OBJECTS
        // scales
	    var attrLookup = {
		    // [attribute, min, max, value]
		    "REB": [0.00, 8.60, '#784a92'],
		    "AST": [0.00, 5.31, '#54af54'],
		    "STL": [0.00, 1.06, '#6272a4'],
		    "BLK": [0.00, 1.33, '#457570'],
		    "TOV": [2.76, 0.00, '#804F6E'],
		    "PTS": [0.00, 22.0, '#db7a69']
	    };
        var xScale = d3.scaleLinear() // position scales (shifted scale for axis display)
            .domain([0, numOfCol]).range([0, numOfCol * boxSize]);
        var yScale = d3.scaleLinear() // position scales
            .domain([-0.5, numOfRow - 0.5]).range([0, numOfRow * boxSize]);
        var cScale = d3.scaleLinear() // color scale TODO NEED TO BE MODIFIED FOR OTHER ATTRIBUTES
            .domain([attrLookup[attribute][0], attrLookup[attribute][1] * 2])
	        .range([
	        	'#E6E6E6',
		        '#1b5cff'
	        ]);
        // TOOLTIP
	    var myTip = d3.tip()
		    .attr('class', 'd3-tip-gameMesh')
		    .offset([-10, 0])
		    .html(function(d) {
			    return "" +
				    "<span>Average " + attrTitle + ":</span> " +
				    "<span>" + (d.sumOfValues/d.gameList.length).toFixed(2) + "</span><br/><br/>" +
				    "<span>No. of games:</span> " +
				    "<span>" + d.gameList.length + "</span><br/>";
		    });
	    self.grpGrid.call(myTip);

        // DRAWING
        // align squares based on margins
        var xoff = self.margin.left + padSize;
        var yoff = self.margin.top  + padSize;
        // draw squares
        d3SelectAll(self.grpGrid, 'rect', gamesHistTotal)
            .on('mouseover', function (d) {
            	if (d.gameList.length > 0) {
            		// console.log(d);
		            self.grpLineB.selectAll('.highlight-MeshView').remove();
		            d3SelectAll(self.grpLineB, 'circle', d.gameList)
			            .classed('highlight-MeshView', true)
			            .attr('cx', function (dd) { return xoff + boxSize * 0.5 + xScale(dd.time / gamesListRes); })
			            .attr('cy', function (dd) { return yoff + numOfRow * boxSize + LBscale(gamesList[dd.time].average); })
			            .attr('r', 5 * ratio);
		            self.grpLineR.selectAll('rect')
			            .filter(function (dd) { return dd.key == d.year; })
			            .classed('highlight-MeshView', true);
		            myTip.show(d);
	            }
            })
	        .on('mouseout', function () {
		        self.grpLineB.selectAll('.highlight-MeshView').remove();
		        self.grpLineR.selectAll('.highlight-MeshView').classed('highlight-MeshView', false);
	        	myTip.hide();
	        })
            .attr('x', function (d) { return xoff + xScale(d.xpos); })
            .attr('y', function (d) { return yoff + yScale(d.ypos - 0.5); })
            .attr('width',  barSize)
            .attr('height', barSize)
	        .attr('class', function (d) {
	        	var rSeason = true;
	        	d.gameList.forEach(function (_) { rSeason = rSeason && (_.type == 'RegularSeason'); });
	        	return rSeason ? 'game-rSeacon' : 'game-pSeacon';
	        })
	        .style('fill', function (d) {
                return d.gameList.length == 0 ? cScale(d.sumOfValues) : cScale(d.sumOfValues / d.gameList.length);
            });
        // draw axis
        // 1) Y axis
        var yearAxis = d3.axisLeft()
            .scale(yScale)
            .ticks(numOfRow)
            .tickFormat(function(i) { return yearsList[i].key; })
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
        // adjust Axis front
	    var fontSize = 12 * ratio,
		    fontXOff = 30 * ratio,
		    fontYOff =  0 * ratio;
	    self.grpXAxis.selectAll('text').attr('transform', 'rotate(-45) translate(' + fontXOff + ',' + fontYOff + ')');
	    self.svg.selectAll('text').attr('font-size', fontSize);
	    // -----------------------------------------------------------------------------
	    // draw profiles
	    // console.log('attrID', attrID);
	    //
	    // --- right plot (bar chart)
	    var lineRMax = 0;
	    yearsList.forEach(function (d) {
		    d.average = d3.mean(d.list, function (_) { return _[attrID]; });
		    lineRMax = Math.max(lineRMax, d.average);
	    });
	    var LRscale = d3.scaleLinear().domain([0,lineRMax]).range([0,0.1 * self.svgW]);
	    // console.log(yearsList);
	    d3SelectAll(self.grpLineR, 'rect', yearsList)
		    .attr('x', padSize + self.svgW - self.margin.right)
		    .attr('y', function (d) { return yoff + yScale(d.ypos - 0.5); })
		    .attr('width',  function (d) { return LRscale(d.average); })
		    .attr('height', barSize)
		    .style('fill', function (d) { return cScale(d.average); });
	    //
	    // --- bottom plot (bar chart)
	    self.grpLineB.selectAll('*').remove();
	    var gradient = self.grpLineB.append("defs")
		    .append("linearGradient")
		    .attr("id", "gradient-GameMesh")
		    .attr("x1", "50%")
		    .attr("y1", "0%")
		    .attr("x2", "50%")
		    .attr("y2", "100%")
		    .attr("spreadMethod", "pad");
	    gradient.append("stop")
		    .attr("offset", "0%")
		    .attr("stop-color", "#f2f2f2")
		    .attr("stop-opacity", 1);
	    gradient.append("stop")
		    .attr("offset", "100%")
		    .attr("stop-color", "#1b5cff")
		    .attr("stop-opacity", 1);
	    // process data
	    var lineBMax = 0;
	    var gamesListArr = obj2array(gamesList);
	    gamesListArr.forEach(function (d) {
	    	d.average = d3.mean(d[1], function (_) { return _[attrID]; });
		    gamesList[d[0]].average = d.average;
		    lineBMax = Math.max(lineBMax, d.average);
	    });
	    gamesListArr = gamesListArr.sort(function (a,b) { return d3.ascending(+a[0], +b[0]); });
	    // console.log(gamesListArr);
	    // plot
	    var LBscale = d3.scaleLinear().domain([0,lineBMax]).range([0,0.15 * self.svgH]);
	    var lineB = d3.area()
		    .x(function(d) { return xoff + boxSize * 0.5 + xScale(+d[0]/gamesListRes); })
		    .y0(yoff + numOfRow * boxSize)
		    .y1(function(d) { return yoff + numOfRow * boxSize + LBscale(d.average); });
	    self.grpLineB.append("path")
		    .datum(gamesListArr)
		    .attr("class", "game-area")
		    .attr("d", lineB)
		    .style('fill', "url(#gradient-GameMesh)");
	    // self.grpLineB.append("path").classed('highlight', true);
	    // ---------------------------------------------
        // adjust div height
	    self.svg.attr('height', divHeight);
    };

    /**
     * self is a function to resize image
     */
    self.resize = function ()
    {
    	// recalculate divide size
	    var div = document.getElementById('divGameView');  // shortcuts
	    var sty = window.getComputedStyle(div, null);      // shortcuts
	    self.svgW = parseInt(sty.getPropertyValue("width"), 10); // compute the divide window width
	    self.setMargin();
	    self.hSpan = self.svgW - self.margin.left - self.margin.right;  // the area that rect will be plotted
	    self.vSpan = self.svgH - self.margin.top  - self.margin.bottom; // the area that rect will be plotted
	    // setting things up && update
	    self.svg.attr('width', self.svgW);
        self.update();
    };

	/**
	 * Hide this view entirely
	 */
	self.hide  = function () {
		self.hidden = true;
		self.div.selectAll('*').remove();
		d3.selectAll('.d3-tip-gameMesh').remove();
	};

	/**
	 * show this view
	 */
	self.show = function () {
		self.hidden = false;
		self.init(self.svgH);
		self.update();
	};

}