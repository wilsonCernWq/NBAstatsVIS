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
	    // [0] assignments
	    self.hidden = true; // hide divide by default
	    // --- elements
	    self.div = d3.select('#divMenuView');
	    self.svg = d3.select('#svgMenuView');
	    self.grpRect = self.svg.select('#groupMenuViewRect');
	    self.grpText = self.svg.select('#groupMenuViewText');
	    // --- dropdown items
	    self.queryTeam     = self.div.select('#queryTeam');
	    self.queryPosition = self.div.select('#queryPosition');
	    self.queryYearFrom = self.div.select('#queryYearFrom');
	    self.queryYearTo   = self.div.select('#queryYearTo');
	    self.queryAllStar  = self.div.select('#queryAllStar');
	    self.queryHint     = self.div.select('#queryForm');
	    // [1] calculate current style
	    self.div.style('display', null);
        var div = document.getElementById('divMenuView');
        var sty = window.getComputedStyle(div, null);
	    // self.div.style('display', 'none');
	    // -_- ... why ... I cant understand why I dont need this line ...
	    // [2] set element attributes
        // --- load class fields
        self.svgW = parseInt(sty.getPropertyValue("width"), 10);
        self.svgH = maxHeight;
	    self.setMargin();
	    // [2] setup element attributes
	    self.svg // the main svg which spans the whole div
            .attr("width",  self.svgW)
            .attr("height", self.svgH);
	    // -- drop downs -- // Team Filter
	    // change it to array & sort it alphabetically
	    var arrayTeamList = obj2array(globData.globTeamList.current);
	    arrayTeamList = arrayTeamList.sort(function (a,b) {
		    return d3.ascending(a[1].TEAM_CITY, b[1].TEAM_CITY);
	    });
	    // creat options
	    d3SelectAll(self.queryTeam, 'option', arrayTeamList, true)
		    .attr('value', function (d) { return d[0]; })
		    .text(function (d) { return d[1].TEAM_CITY + ' ' + d[1].TEAM_NAME; });
	    self.queryTeam // add default option (All) in front
		    .insert('option',':first-child')
		    .attr('value', 'all')
		    .attr('selected','selected')
		    .text('All');
	    // -- drop downs -- // Year Filters
	    var arrayYearList = [];
	    for (var y = 2016; y > 1949; --y) { arrayYearList.push(y); } // reverse order
	    d3SelectAll(self.queryYearFrom, 'option', arrayYearList, true)
		    .attr('value', function (d) { return d; })
		    .text(function (d) { return d.toString(); });
	    d3SelectAll(self.queryYearTo, 'option', arrayYearList, true)
		    .attr('value', function (d) { return d; })
		    .text(function (d) { return d; });
	    // add default option (All) in front
	    self.queryYearFrom.insert('option',':first-child')
		    .attr('value', 'all')
		    .attr('selected','selected')
		    .text('All');
	    self.queryYearTo.insert('option',':first-child')
		    .attr('value', 'all')
		    .attr('selected','selected')
		    .text('All');
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
		var ratio = self.svgW / 1520;
		// update font size on mac
		if (isMac) {
			self.div.selectAll('span').style('font-size', (18 * ratio) + 'px');
			self.div.selectAll('select').style('font-size', (18 * ratio) + 'px');
			self.div.selectAll('input').style('font-size', (18 * ratio) + 'px');
		}
	    // -------------------------------
    	// [0] get rescaling ratio

	    // [1] assign parameter values
	    var displayNumber = 10;
	    var barW = self.svgW/displayNumber, //< weight
	        barH = 14 * ratio;              //< height
	    var barXOff = (self.svgW - displayNumber * barW) / 2,
	        barYOff = 6 * ratio;
        var fontsize = 12 * ratio,
	        fontYOff = 10 * ratio,
	        fontXOff = 5 * ratio;
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
	    // [1] plot players
	    // ---- rects
        d3SelectAll(self.grpRect, 'rect', filteredPlayerList)
            .attr('x', function(d,i) {
            	return barXOff + (i%displayNumber) * barW;
            })
            .attr('y', function(d,i) {
            	return barYOff + Math.floor(i/displayNumber) * barH;
            })
            .attr('width',  barW)
            .attr('height', barH)
	        .style('opacity', 0.0)
	        .on('mouseover', function () {
		        d3.select(this)
			        .style('opacity', 1.0)
			        .classed('highlight', true);
	        })
	        .on('mouseout',  function () {
	        	if (!d3.select(this).classed('always')) {
			        d3.select(this)
				        .style('opacity', 0.0)
				        .classed('highlight', false);
		        }
	        })
            .on('click', function (d) {
            	self.grpRect.selectAll('.highlight').style('opacity', 0.0).classed('highlight', false);
            	self.grpRect.selectAll('.always').classed('always', false);
	            d3.select(this)
		            .style('opacity', 1.0)
		            .classed('highlight', true)
		            .classed('always', true);
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
        // ---- texts
        d3SelectAll(self.grpText, 'text', filteredPlayerList)
	        .attr('pointer-events', 'none')
	        .attr('x', function(d,i) {
	        	return fontXOff + barXOff + (i%displayNumber) * barW;
	        })
	        .attr('y', function(d,i) {
	        	return fontYOff + barYOff + Math.floor(i/displayNumber) * barH;
	        })
	        //.attr('pointer-events', 'none')
	        .style('font-size', fontsize)
            .text(function (d) { return d[1]; });
        // [2] adjust height
        self.svg
	        .attr('height', barYOff + Math.ceil(filteredPlayerList.length/displayNumber) * barH);
    };

	/**
	 * resize call
	 */
	self.resize = function () {
		self.div.style('display', null);
	    var div = document.getElementById('divMenuView');
	    var sty = window.getComputedStyle(div, null);
	    self.svgW = parseInt(sty.getPropertyValue("width"), 10);
	    self.svg.attr('width', self.svgW);
		self.setMargin();
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
		self.hidden = true;
		self.grpRect.selectAll('rect').remove();
		self.grpText.selectAll('text').remove();
		self.div.style('display', 'none');
	};

	/**
	 * dislay menu
	 */
	self.show = function () {
		self.hidden = false;
		self.div.style('display', null);
		self.update();
	};

	/**
	 * Resize margin definition
	 */
	self.setMargin = function () {
		self.margin = { // define plot margin (it gives the minimal margin)
			left:  0.02 * self.svgW,
			right: 0.02 * self.svgW,
			top:    0.1 * self.svgH,
			bottom: 0.1 * self.svgH
		};
	};
}
