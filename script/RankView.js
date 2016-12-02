/**
 * In self function you want to input all initial variables the class will need
 * @constructor
 */
function RankView ()
{
    var self = this;

	/**
	 * update margin
	 */
	self.setMargin = function () {
	    self.margin = {
		    left:   0.02 * self.svgW,
		    right:  0.02 * self.svgW,
		    top:    0.15 * self.svgH,
		    bottom: 0.1 * self.svgH
	    };
    };

	/**
	 * Initialization
	 * @param maxHeight
	 */
	self.init = function (maxHeight)
    {
	    self.hidden = false;
        self.div = d3.select('#divRankView');
        self.div.selectAll('*').remove();
	    // [1]
        // setup SVG
        self.svg = self.div.append("svg").attr('id','svgRankView');
	    self.grpCurrAxis = self.svg.append('g').attr('id','groupRankAxis-RankView');
	    self.grpBars = self.svg.append('g').attr('id','groupRankBars-RankView');
	    self.grpLink = self.svg.append('g').attr('id','groupRankLink-RankView');
	    self.tooltip = self.div.append('div').attr('id', 'tooltip-RankView');
        // [2]
	    // setup div size
        var div = document.getElementById('divRankView');
        var sty = window.getComputedStyle(div, null); // console.log(style);
        self.svgW = parseInt(sty.getPropertyValue("width"), 10);
        self.svgH = maxHeight;
	    self.setMargin();
        // [3]
	    // setup elements
	    self.svg // setuo SVG attributes
		    .attr("width",  self.svgW)
		    .attr("height", self.svgH);
	    self.svg.append('text').attr('id', 'titleRankView-RankView');
        self.tooltip // create tooltip for this view
            .classed('rank-tooltip', true)
	        .style("display", "none");
    };

	/**
	 * self is a function to draw/update view
	 */
    self.update = function ()
    {
	    // default variables
	    var player   = globData.currPlayerData;
	    var playerid = +player.info.PERSON_ID;
	    var yearFrom = globData.currSelectedYearRange[0] ? globData.currSelectedYearRange[0] : player.info.FROM_YEAR;
	    var yearTo   = globData.currSelectedYearRange[1] ? globData.currSelectedYearRange[1] : player.info.TO_YEAR;
	    var attribute = globData.currSelectedAttribute[0] ? globData.currSelectedAttribute[0] : 'PTS';
	    var attrTitle = globData.currSelectedAttribute[1] ? globData.currSelectedAttribute[1] : 'Scores';
	    // ratio
    	var ratio = self.svgW / 1520;
	    //----------------------------------------------------------
    	// [0]
        // window plotting size
        var windowW = self.svgW - self.margin.left - self.margin.right;
        var windowH = self.svgH - self.margin.top  - self.margin.bottom;
        //----------------------------------------------------------
	    // plot title
	    self.svg.select('#titleRankView-RankView')
		    .attr('x', self.svgW/2)
		    .attr('y', (isMac?50:30) * ratio)
		    .attr('font-size', (isMac?30:20) * ratio)
		    .text(attrTitle + ' Ranking');
	    //----------------------------------------------------------
	    // [1]
        // load multiple files
        var queue = d3.queue();
        for (var year = yearFrom; year <= Math.min(yearTo, 2015); ++year) {
            var stryear = year.toString() + '-' + (year + 1).toString().slice(2, 4);
            queue.defer(d3.json, 'data/rankList/' + stryear + '-ranking.json')
        }
	    //----------------------------------------------------------
	    // [2]
        // draw ranking parallel coordinate
        queue.awaitAll(function (error, files) {
            if (error) throw error;
	        //----------------------------------------------------------
            // [2.0]
            // search for the attribute index inside the array
            // -- we input attribute by attribute name, and then search for the attribute index
            var attrID = files[0].resultSet.headers.indexOf(attribute);
            // console.log(files[0].resultSet.headers);
            // restruct data
            var filesMetaInfo = [];
            files.forEach(function (single, i) {
                // 1) sort data
                var entries = single.resultSet.rowSet
	                .sort(function (a, b) { return d3.descending(a[attrID], b[attrID]); });
                // 2) get meta information
                var playerRank = -1; // default value, means no ranking
                entries.forEach(function (s, i) { if (s[0] == playerid) { playerRank = i; } });
                filesMetaInfo.push({
                    year: single.parameters.Season,
                    rank: playerRank,
                    rowset: entries
                });
            });
            // console.log(filesMetaInfo);
	        //----------------------------------------------------------
	        // [2.1]
            // parameters for drawing
            // count the maximum values
            var maxPlayer = d3.max(files, function (d) { return d.resultSet.rowSet.length; });
            var maxValue = d3.max(files, function (data) {
                return d3.max(data.resultSet.rowSet, function (d) { return d[attrID]; });
            });
            var maxRadius = 10 * ratio,
	            minRadius = 0 * ratio;
            // displaying parameters
            var barMargin = 20 * ratio, // calculate column width
                barW = Math.min(50, windowW / files.length - barMargin), // bar width
                barH = windowH / maxPlayer;                              // bar height
            // text parameter
            var textMargin = 12 * ratio,
	            textFont   = (isMac?16:10) * ratio;
	        var barHHighLight = 2 * ratio;
	        // calculate bar offset
	        var lOff = self.margin.left + windowW/2 - (barW+barMargin)*files.length/2;
	        var tOff = self.margin.top;
            // define value scale
            var xScale = d3.scaleLinear().domain([0, maxValue]).range([0, barW]);
            var rScale = d3.scaleSqrt().domain([0, maxValue]).range([minRadius, maxRadius]);
	        //----------------------------------------------------------
            // tooltip functions & overall style
	        // THOSE ARE ABSOLUTE VALUES (tooltip doesn't need to be rescaled)
	        var zoomlen = 3, // number of entries will be displayed
		        zoomH = 185, // tooltip box height
		        zoomW = 300, // tooltip box width
		        zoomP = 6,   // tooltip padding
		        zoomMarginTop = -80, // tooltip top shift
		        // -----------------
		        zoomFontSizeMax = 14,
		        zoomFontSizeStp = 1.5,
		        zoomFontSizeMin = 9;
	        if (isMac) { zoomH = 220; }
            var mouseover = function () {
                self.tooltip
	                .style('display', 'inline')
	                .style('margin-top', zoomMarginTop + 'px')
	                .style('padding', zoomP + 'px')
	                .style('width', zoomW + 'px')
	                .style('height', zoomH + 'px');
            };
            var mouseout  = function () { self.tooltip.style('display', 'none'); };
            var mousemove = function ()
            {
	            // ------------------------
	            // get offset // calculate indices
	            var div = document.getElementById('divRankView');
                var Xindex = Math.floor(Math.max(0,(d3.event.pageX-div.offsetLeft-lOff) / (barW+barMargin)));
                var Yindex = Math.floor(Math.max(0,(d3.event.pageY-div.offsetTop -tOff) / barH));
                // console.log(Xindex,Yindex);
	            // ------------------------
                // shift tooltip immediately
	            var lCoor, tCoor = d3.event.pageY - 2 * zoomP;
	            var textAnchor;
	            if (Xindex < (isMac ? 6 : 4)) {
		            lCoor = (Xindex + 1) * (barW + barMargin) + div.offsetLeft + lOff - zoomP;
		            textAnchor = 'left';
	            } else {
		            lCoor = Xindex * (barW + barMargin) + div.offsetLeft + lOff - zoomW - zoomP;
		            textAnchor = 'right';
	            }
                self.tooltip
	                .style('left', lCoor + 'px')
	                .style('top',  tCoor + 'px')
	                .style('text-align', textAnchor)
	                .style('align', 'center');
	            // ------------------------
                // retrieve data
                var maxIndex = filesMetaInfo[Xindex].rowset.length - 1;
                var Is = Yindex - zoomlen,
                    Ie = Yindex + zoomlen;
                if (Is < 0) { Is = 0; Ie = Math.min(Is + 2 * zoomlen, maxIndex); }
                if (Ie > maxIndex) { Ie = maxIndex; Is = Math.max(Ie - 2 * zoomlen, 0); }
                var zoomdata = filesMetaInfo[Xindex].rowset.slice(Is,Ie+1);
	            // ------------------------
                // modified html
                d3SelectAll(self.tooltip, 'span', zoomdata)
                    .html(function (d,i) {
                    	var mark = d[0] == playerid ? "   &#9733   " : "";
                    	if (textAnchor == 'right') {
		                    return mark + d[2] + ' (' + d[attrID] + ') ' + ' #' + (i+Is+1) + "<br/>";
	                    } else {
		                    return '#' + (i+Is+1) + ' (' + d[attrID] + ') ' + d[2] + mark + "<br/>";
	                    }
                    })
	                .style('font-size', function (d,i) { // scale font size based on distance
		                var distance = Math.abs((i+Is)-Yindex);
	                	return Math.max(zoomFontSizeMin, zoomFontSizeMax - zoomFontSizeStp * distance) + 'pt';

	                })
	                .style('font-weight', function (d,i) { return i + Is == Yindex ? 'bold': null; });
            };
	        //----------------------------------------------------------
	        // define area object
            // draw area chart
            var area = d3.area()
                .x(function (d, i) { return i * barH; }).y0(0)
	            .y1(function (d) { return xScale(d[attrID]); });
	        //----------------------------------------------------------
            // [3]
            // creat groups for every year the player played
            var groups = d3SelectAll(self.grpBars, 'g', filesMetaInfo, true)
                .attr('id', function (d) { return 'season-' + d.year; })
                .attr('transform', function (d, i) {
	                var left = lOff + (barW + barMargin) * (i + 0.5) - barW / 2;
                    var top  = tOff;
                    return 'rotate(90) scale(1,-1) translate(' + top + ',' + left + ')'
                });
            // define plotting for each column
            groups.append('rect')
                .classed('rank-bar', true)
                .attr('x', 0) // center the bar
                .attr('y', 0)
                .attr('height', barW)
                .attr('width', function (d) { return barH * d.rowset.length; })
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);
            // draw area chart
            groups.append('path').datum(function (d) { return d.rowset; })
                .classed('rank-area', true)
                .attr('d', area)
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout)
	            .style('fill', globData.dataComment[attribute][5]);
            // draw bar & circle to high-light player
            groups.filter(function (d) { return d.rank != -1; })
                .append('circle')
                .classed('rank-circle', true)
                .attr('cx', function (d) { return barH * d.rank; })
                .attr('cy', function (d) { return xScale(d.rowset[d.rank][attrID]); })
                .attr('r', function (d)  { return rScale(d.rowset[d.rank][attrID]); })
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);
            groups.filter(function (d) { return d.rank != -1; })
                .append('rect')
                .classed('rank-highlight-bar', true)
                .attr('x', function (d) { return barH * d.rank - 0.5 * barHHighLight; })
                .attr('y', 0)
                .attr('width', function (d) { return barHHighLight; }) //this is height actually
                .attr('height', function (d) {
                    return Math.max(0,xScale(d.rowset[d.rank][attrID]) - rScale(d.rowset[d.rank][attrID]));
                })
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);
	        // [4]
            // plot year axis
            var texts = d3SelectAll(self.grpCurrAxis, 'g', filesMetaInfo, true)
                .attr('transform', function (d, i) {
	                var left = lOff + (barW + barMargin) * (i + 0.5) - barW / 2;
                    var top  = tOff;
                    return 'translate(' + left + ',' + top + ')'
                })
                .attr('id', function (d) { return 'axis-' + d.year; });
            texts.append('text')
                .attr('x', barW/2) // center the bar
                .attr('y', -textMargin)
                .style('font-size', textFont)
	            .classed('rank-year-text', true)
	            .text(function (d) { return d.year; });
            texts.append('text')
                .attr('x', barW/2) // center the bar
                .attr('y', function (d) { return barH * d.rowset.length + textFont * 0.6 + textMargin; })
                .style('font-size', textFont)
	            .classed('rank-player-text', true)
	            .text(function (d) { return d.rowset.length; });
        });
        //self.svg.attr('height', 600 * ratio);
    };

	self.resize = function ()
	{
		// recompute div size
		var div = document.getElementById('divRankView');
		var sty = window.getComputedStyle(div, null);
		self.svgW = parseInt(sty.getPropertyValue("width"), 10);
		self.setMargin();
		self.svg.attr("width",  self.svgW);
		// call update
		self.update();
	};

	/**
	 * Hide this view entirely
	 */
	self.hide  = function () {
		self.hidden = true;
		self.div.selectAll('*').remove();
		self.div.style('display','none');
	};

	/**
	 * show this view
	 */
	self.show = function () {
		self.hidden = false;
		self.div.style('display',null);
		self.init(self.svgH);
		self.update();
	};
}
