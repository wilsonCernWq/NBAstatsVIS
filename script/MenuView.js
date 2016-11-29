/**
 * Drop down menu for selecting player
 * @constructor
 *    Team
 *    Position
 *    YearFrom
 *    YearTo
 *    AllStar
 *    Hint
 * HTML LOCATION: divMenuView
 */
function MenuView () {
    var self = this;

    /**
     * Initialize menu data ONLY CALL ONCE !
     * @param maxHeight
     */
    self.init = function (maxHeight)
    {
    	// [0] assign class field
	    self.hidden = true;
	    // --- elements
	    self.div = d3.select('#divMenuView');
	    self.svg = d3.select('#svgMenuView');
	    self.subdiv = self.div.select(".scroll");
	    self.grpRect = self.svg.select('#groupMenuViewRect');
	    self.grpText = self.svg.select('#groupMenuViewText');
	    // --- dropdown items
	    self.queryTeam = self.div.select('#queryTeam-MenuView');
	    self.queryPosition = self.div.select('#queryPosition-MenuView');
	    self.queryYearFrom = self.div.select('#queryYearFrom-MenuView');
	    self.queryYearTo = self.div.select('#queryYearTo-MenuView');
	    self.queryAllStar = self.div.select('#queryAllStar-MenuView');
	    self.queryHint = self.div.select('#queryForm-MenuView');
	    // [1] calculate current division size
	    self.div.style('display', null);
        var div = document.getElementById('divMenuView');
        var sty = window.getComputedStyle(div, null); // console.log(style);
	    // self.div.style('display', 'none'); // -_- ... why ... I cant understand why I dont need this line ...
        // --- load class fields
        self.svgW = parseInt(sty.getPropertyValue("width"), 10) - 20;
        self.svgH = maxHeight;
	    self.margin = { // define plot margin (it gives the minimal margin)
		    left:  0.02 * self.svgW,
		    right: 0.02 * self.svgW,
		    top:    0.1 * self.svgH,
		    bottom: 0.1 * self.svgH
	    };
	    // [2] setup element attributes
	    // -- svg --
	    self.svg // the main svg which spans the whole div
            .attr("width",  self.svgW)
            .attr("height", self.svgH);
	    // -- drop downs --
	    // ----- team -----
	    var arrayTeamList = obj2array(globData.globTeamList.current); // change it to array & sort it alphabetically
	    arrayTeamList = arrayTeamList.sort(function (a,b) { return d3.ascending(a[1].TEAM_CITY, b[1].TEAM_CITY); });
	    d3SelectAll(self.queryTeam, 'option', arrayTeamList, true)
		    .attr('value', function (d) { return d[0]; })
		    .text(function (d) { return d[1].TEAM_CITY + ' ' + d[1].TEAM_NAME; });
	    self.queryTeam.append('option').attr('value', 'all').attr('selected','selected').text('All');
	    // ----- year -----
	    var arrayYearList = [];
	    for (var y = 2016; y > 1949; --y) { arrayYearList.push(y); }
	    d3SelectAll(self.queryYearFrom, 'option', arrayYearList, true)
		    .attr('value', function (d) { return d; }).text(function (d) { return d.toString(); });
	    d3SelectAll(self.queryYearTo, 'option', arrayYearList, true)
		    .attr('value', function (d) { return d; }).text(function (d) { return d; });
	    self.queryYearFrom.append('option').attr('value', 'all').attr('selected','selected').text('All');
	    self.queryYearTo.append('option').attr('value', 'all').attr('selected','selected').text('All');
	    // BACKUP
	    // ----------------------------------------------
	    // scripts for searching different position values
	    // var obj_tmp = {};
	    // globData.globPlayerList.rowSet.forEach(function (d) {
	    // 	if (!obj_tmp.hasOwnProperty(d[6].POSITION)){
	    // 		obj_tmp[d[6].POSITION] = [];
	    // 		console.log(d[6].POSITION);
	    //    }
	    // });
	    // ----------------------------------------------
	    // How to hide a divide
	    //self.div.style('display', 'none');
    };

    /**
     * Call to update menu
     */
    self.update = function ()
    {
        var barW = 200, //< weight
	        barH = 25,  //< height
	        barP = 1;   //< padding
        var displayNumber = Math.floor(self.svgW/barW);
	    var barXOff = self.svgW/2 - displayNumber * barW / 2,
	        barYOff = 5;
        var fontsize = 16,
	        fontYOff = 18,
	        fontXOff = 5;
        // -------------------------------
        // [0] filter player list
        // filter player
        var filteredPlayerList = globData.globPlayerList.rowSet.filter(function (d) {
        	// console.log(d);
        	var filter = globData.currPlayerFilter;
            if (filter.YearFrom) { if (d[3] < filter.YearFrom) { return false;} }
            if (filter.YearTo  ) { if (d[2] > filter.YearTo  ) { return false;} }
	        if (filter.Team) {
            	if (globData.globTeamList.lookup[d[6].TEAM] == +filter.Team) { return false; }
	        }
	        if (filter.AllStar) {
		        if (d[6].ALL_STAR == 0 && filter.AllStar == 'yes') { return false; }
		        if (d[6].ALL_STAR != 0 && filter.AllStar == 'no' ) { return false; }
	        }
	        if (filter.Position) {
            	if (d[6].POSITION.search(filter.Position) < 0) { return false; }
	        }
	        if (filter.Hint) {
            	if (d[1].toLowerCase().search(filter.Hint.toLowerCase()) < 0) { return false; }
	        }
            return true;
        }).sort(function (a, b) { return d3.ascending(a[1], b[1]); });
        // only display first few elements
	    // filteredPlayerList = filteredPlayerList.slice(0,displayNumber);
	    // if (!debugMuteAll) {
	    // 	console.log('filtered player list', filteredPlayerList);
	    // }
	    // -------------------------------
	    // [1] plot players
        d3SelectAll(self.grpRect, 'rect', filteredPlayerList)
            .attr('x', function(d,i) { return barXOff + (i % displayNumber) * (barW + barP); })
            .attr('y', function(d,i) { return barYOff + Math.floor(i / displayNumber) * (barH + barP); })
            .attr('width',  barW)
            .attr('height', barH)
            .style('fill', '#ffcf3f')
	        .style('opacity', 0)
	        .on('mouseover', function () { d3.select(this).style('opacity', 1); })
	        .on('mouseout',  function () { d3.select(this).style('opacity', 0); })
            .on('click', function (d) {
                globData.currPlayerName = d[4];
	            if (!debugMuteAll) { console.log('changed player to', globData.currPlayerName); }
                MainReload();
            });
        d3SelectAll(self.grpText, 'text', filteredPlayerList)
	        .attr('x', function(d,i) { return fontXOff + barXOff + (i % displayNumber) * (barW + barP); })
	        .attr('y', function(d,i) { return fontYOff + barYOff + Math.floor(i / displayNumber) * (barH + barP); })
	        .attr('pointer-events', 'none')
	        .style('font-size', fontsize)
	        .classed('query-result-text', true)
            .text(function (d) { return d[1]; });
        // adjust height
        self.svg.attr('height', barYOff + Math.ceil(filteredPlayerList.length/displayNumber) * (barH + barP));
    };

	/**
	 * resize call
	 */
	self.resize = function () {
	    // calculate new division size
		self.div.style('display', null);
	    var div = document.getElementById('divMenuView');
	    var sty = window.getComputedStyle(div, null); // console.log(style);
	    self.svgW = parseInt(sty.getPropertyValue("width"), 10) * 0.95;
	    // update margin
	    self.margin = { // define plot margin (it gives the minimal margin)
		    left:  0.02 * self.svgW,
		    right: 0.02 * self.svgW,
		    top:    0.1 * self.svgH,
		    bottom: 0.1 * self.svgH
	    };
	    self.svg.attr('width', self.svgW);
	    if (self.hidden) { self.hide() }
	    else { self.update(); }
	};

	/**
	 * hide menu
	 */
	self.hide = function () {
    	self.div.style('display', 'none');
    	self.hidden = true;
		self.grpRect.selectAll('rect').remove();
		self.grpText.selectAll('text').remove();
	};

	/**
	 * dislay menu
	 */
	self.show = function () {
		self.div.style('display', null);
		self.hidden = false;
		self.update();
	}
}
