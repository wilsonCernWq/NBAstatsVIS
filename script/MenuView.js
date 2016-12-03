/**
 * Drop down menu for selecting player
 * @constructor
 * @filter
 *    Team
 *    Position
 *    YearFrom
 *    YearTo
 *    AllStar
 *    Hint
 */
function MenuView () {

    var self = this;

	/**
	 * setMargin: Resize margin definition
	 */
	self.setMargin = function () {
		self.margin = {
			left:  0.02 * self.svgW,
			right: 0.02 * self.svgW,
			top:    0.1 * self.svgH,
			bottom: 0.1 * self.svgH
		};
	};

    /**
     * init: Initialize menu data ! ONLY CALL ONCE !
     */
    self.init = function () {

	    // * Initialize Class Fields
	    // --- other fields
	    self.hidden = true; // hide divide by default
	    // --- selections
	    self.div = d3.select('#divMenuView');
	    self.svg = d3.select('#svgMenuView');
	    self.grpRect = self.svg.select('#groupMenuViewRect');
	    self.grpText = self.svg.select('#groupMenuViewText');
	    // ---  filter elements
	    self.queryTeam     = self.div.select('#queryTeam');
	    self.queryPosition = self.div.select('#queryPosition');
	    self.queryYearFrom = self.div.select('#queryYearFrom');
	    self.queryYearTo   = self.div.select('#queryYearTo');
	    self.queryAllStar  = self.div.select('#queryAllStar');
	    self.queryHint     = self.div.select('#queryForm');

	    // * Compute Style
	    // --- calculate current style
	    self.div.style('display', null); //<- this is somehow important
        var div = document.getElementById('divMenuView');
        var sty = window.getComputedStyle(div, null);
	    var width = parseInt(sty.getPropertyValue("width"), 10);

	    // * Setup Element Attributes
	    // --- setup rescaling coefficient
	    self.ratio = width / 1500; // how to calculate this defines the rescaling behaviors
	    // --- get window width
	    self.svgW = self.ratio * 1500;
        self.svgH = self.ratio * 300;
	    self.setMargin();
	    self.svg // the main svg which spans the whole div
            .attr("width",  self.svgW)
            .attr("height", self.svgH);
	    self.div.style('height', self.svgH + 100 * self.ratio + 'px');

	    // * Drop Downs
	    //  (Team Filter) -- change it to array
	    var arrayTeamList = obj2array(globData.globTeamList.current);
	    //  (Team Filter) -- sort it alphabetically
	    arrayTeamList = arrayTeamList.sort(function (a,b) { return d3.ascending(a[1].TEAM_CITY, b[1].TEAM_CITY); });
	    //  (Team Filter) -- creat options
	    d3SelectAll(self.queryTeam, 'option', arrayTeamList, true)
		    .attr('value', function (d) { return d[0]; })
		    .text(function (d) { return d[1].TEAM_CITY + ' ' + d[1].TEAM_NAME; });
	    self.queryTeam // add default option (All) in front
		    .insert('option',':first-child')
		    .attr('value', 'all')
		    .attr('selected','selected')
		    .text('All');
	    // (Year Filters) --- setup properties
	    var arrayYearList = [];
	    for (var y = 2015; y > 1949; --y) { arrayYearList.push(y); } // reverse order
	    d3SelectAll(self.queryYearFrom, 'option', arrayYearList, true)
		    .attr('value', function (d) { return d; })
		    .text(function (d) { return d.toString(); });
	    d3SelectAll(self.queryYearTo, 'option', arrayYearList, true)
		    .attr('value', function (d) { return d; })
		    .text(function (d) { return d.toString(); });
	    // (Year Filters) --- add default option in front
	    self.queryYearFrom.selectAll('option')
		    .attr('selected', function () {
			    return (+globData.currPlayerFilter.YearFrom == this.value) ? 'selected' : null;
		    });
	    self.queryYearTo.selectAll('option')
		    .attr('selected', function () {
		    	return (+globData.currPlayerFilter.YearTo == this.value) ? 'selected' : null;
		    });
	    self.queryYearFrom.insert('option',':first-child')
		    .attr('value', 'all')
		    .text('All');
	    self.queryYearTo.insert('option',':first-child')
		    .attr('value', 'all')
		    .text('All');

	    // * Backup
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

    };

    /**
     * Call to update menu
     */
    self.update = function () {

    	// * Creat Short Cut Names
		var ratio = self.ratio;

	    // * Define Styleing Parameters
	    // --- number of columns will be displayed
	    var colNum = 10;
		// --- menu filter header
	    var headFontSize = (isMac ? 18 : 16) * ratio;
	    // --- menu results
	    var nameFontSize = 12 * ratio,
		    nameYOff = 10 * ratio,
		    nameXOff = 5 * ratio;
	    // --- background bar parameters
	    var barW = self.svgW / colNum, //< weight
	        barH = 14 * ratio,                //< height
		    barXOff = (self.svgW - colNum * barW) / 2,
	        barYOff = 6 * ratio;

	    // * Process Data
	    // --- Filter Player Based on Menu
	    var nameList = globData.globPlayerList.rowSet.filter(function (d) {
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
	    if (!debugMuteAll) {
		    console.log('filtered name list: ', nameList);
	    }

	    // * Menu Header
	    // --- update font size on mac
	    self.div.selectAll('span'  ).style('font-size', headFontSize + 'px');
	    self.div.selectAll('select').style('font-size', headFontSize + 'px');
	    self.div.selectAll('input' ).style('font-size', headFontSize + 'px');

	    // * Plot Player Results
	    // ---- plot background bars
	    // (under grpRect)
        d3SelectAll(self.grpRect, 'rect', nameList, true)
            .attr('x', function(d,i) { return barXOff + (i % colNum) * barW; })
            .attr('y', function(d,i) { return barYOff + Math.floor(i/colNum) * barH; })
            .attr('width',  barW).attr('height', barH)
	        .on('mouseover', function (d) {
		        self.svg.select('#result-' + d[4] + '-MenuView').classed('highlight', true);
		        d3.select(this).classed('highlight', true);
	        })
	        .on('mouseout',  function (d) {
	        	if (!d3.select(this).classed('always')) { // check if the highlight should be kept
			        self.svg.select('#result-' + d[4] + '-MenuView').classed('highlight', false);
			        d3.select(this).classed('highlight', false);
		        }
	        })
            .on('click', function (d) {
            	self.svg.selectAll('.highlight').classed('highlight', false);
            	self.svg.selectAll('.always').classed('always', false);
            	self.svg.select('#result-' + d[4] + '-MenuView')
		            .classed('highlight', true).classed('always', true);
	            d3.select(this)
		            .classed('highlight', true).classed('always', true);
	            // **** IMPORTANT **** Call Changing Player Here
            	if (!globData.compareMode) {
		            globData.currPlayerName = d[4];
		            globData.currSelectedYearRange = [null,null];
		            if (!debugMuteAll) { console.log('changed player to', globData.currPlayerName); }
		            MainReload();
            	} else {
		            globData.comparePlayerName = d[4];
		            MainReload(false);
	            }
            });
        // ---- plot player names
	    // (under grpText)
        d3SelectAll(self.grpText, 'text', nameList, true)
	        .attr('pointer-events', 'none')
	        .attr('x', function(d,i) { return nameXOff + barXOff + (i%colNum) * barW; })
	        .attr('y', function(d,i) { return nameYOff + barYOff + Math.floor(i/colNum) * barH; })
	        .attr('id', function (d) { return 'result-' + d[4] + '-MenuView'; })
	        .style('font-size', nameFontSize)
            .text(function (d) { return d[1]; });

    };

	/**
	 * resize call
	 */
	self.resize = function () {

		// * Compute Style
		// --- calculate current style
		self.div.style('display', null); //<- this is somehow important
		var div = document.getElementById('divMenuView');
		var sty = window.getComputedStyle(div, null);
		var width = parseInt(sty.getPropertyValue("width"), 10);

		// * Setup Element Attributes
		// --- setup rescaling coefficient
		self.ratio = width / 1500; // how to calculate this defines the rescaling behaviors
		// --- get window width
		self.svgW = self.ratio * 1500;
		self.svgH = self.ratio * 300;
		self.setMargin();
		self.svg // the main svg which spans the whole div
			.attr("width",  self.svgW)
			.attr("height", self.svgH);
		self.div.style('height', self.svgH + 100 * self.ratio + 'px');

		// * Update Window
	    if (self.hidden) {
	    	self.hide()
	    } else {
	    	self.update();
	    }

	};

	/**
	 * hide menu
	 */
	self.hide = function () {

		// --- setup flag
		self.hidden = true;
		// --- resume everything as it is initially
		self.grpRect.selectAll('rect').remove();
		self.grpText.selectAll('text').remove();
		// --- hide divide
		self.div.style('display', 'none');

	};

	/**
	 * dislay menu
	 */
	self.show = function () {

		// --- setup flag
		self.hidden = false;
		// --- show divide
		self.div.style('display', null);
		// --- update
		self.update();

	};

}
