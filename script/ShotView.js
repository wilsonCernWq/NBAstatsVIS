/**
 * Class for drawing short chart
 * @constructor
 */
function ShotView() {
    var self = this;


	/**
	 * Setup margin
	 */
	self.setMargin = function () {
		// define plot margin (it gives the minimal margin)
		self.margin = {
			left:   0.1 * self.svgW,
			right:  0.1 * self.svgW,
			top:    0.1 * self.svgH,
			bottom: 0.1 * self.svgH
		};
	};

    /**
     *
     * @param height
     */
    self.init = function (maxHeight)
    {
        // creat SVG elements
	    self.hidden = false;
	    self.div = d3.select('#shotChart');
        self.div.selectAll('*').remove(); // clean up everything
        self.svg = self.div.append('svg');
        self.svg.append('image');
	    self.grpPlot = self.svg.append('g').attr('id','shotPlot');
	    // left bar plot
	    self.grpFGAL = self.svg.append('g').attr('id','shotFGAL'); // left bar // FG Attempted
	    self.grpFGML = self.svg.append('g').attr('id','shotFGML'); // left bar // FG Made
	    // top bar plot
	    self.grpFGAT = self.svg.append('g').attr('id','shotFGAT'); // top bar // FG Attempted
	    self.grpFGMT = self.svg.append('g').attr('id','shotFGMT'); // top bar // FG Made
	    self.grpLegend = self.svg.append('g').attr('id','shotLegend'); // top bar // FG Made
        // calculate svg default size & get the correct width of the window
        var div   = document.getElementById('shotChart');  // shortcuts
        var style = window.getComputedStyle(div, null);       // shortcuts
        // setup lengths
        self.svgW  = parseInt(style.getPropertyValue("width"), 10); // compute the divide window width
        self.svgH = maxHeight;                                        // maximum window height
	    self.setMargin();
        self.hSpan = self.svgW  - self.margin.left - self.margin.right;  // the area that rect will be plotted
        self.vSpan = self.svgH - self.margin.top  - self.margin.bottom; // the area that rect will be plotted
        // setup SVG size
        self.svg
            .attr('width',  self.svgW)
            .attr('height', self.svgH);
        self.svg.append('text').attr('id','title-ShotView');
    };

    /**
     * update function
     */
    self.update = function ()
    {
    	// default arguments
	    var player   = globData.currPlayerData;
	    var yearFrom = globData.currSelectedYearRange[0] ?
		    globData.currSelectedYearRange[0] : player.info.FROM_YEAR;
	    var yearTo   = globData.currSelectedYearRange[1] ?
		    globData.currSelectedYearRange[1] : Math.min(player.info.TO_YEAR,2015);
	    var attrTitle = 'Shotting Frequency';
	    // window ratio
	    var ratio = self.svgW / 1520;
        // plot court
	    var barXheight = 200 * ratio,
		    barYheight = 300 * ratio;
        var imgOX = 250 * ratio,
	        imgOY = 47.5* ratio,
            imgH = 470* ratio,
	        imgW = 500* ratio,
            imgX = self.svgW/2-imgW/2,
            imgY = self.margin.top + barXheight * ratio;
        self.svg.select('image')
            .attr('x',imgX).attr('y',imgY)
            .attr('width',imgW).attr('height',imgH)
            .attr('xlink:href', 'data/halfCourt.png')
            .style('opacity', 0.8);
        // process dataset
        // to remember variables for resizing
        var SeasonType = 'RegularSeason';
        var rowpoint = [];
        for (var y = yearFrom; y <= yearTo; ++y) {
            if (player.season[SeasonType].hasOwnProperty(y)) {
                if (player.season[SeasonType][y].hasOwnProperty('shotchart')) {
                    player.season[SeasonType][y].shotchart.Details.row.forEach(function (d) {
                        if ((+d[13] * ratio) < imgH - imgOY) {
                            var point = [+d[12] * ratio, +d[13] * ratio]; // !!!! rescale data point ! ...
                            point.data = d;                               // d3.hexgon can be improved !!!!
                            rowpoint.push(point);
                        }
                    })
                }
            }
        }
        var histXData = d3.histogram()
	        .value(function (d) { return d[0]; })
	        .domain([-imgOX, imgW-imgOX])
	        .thresholds(40)(rowpoint);
	    var histYData = d3.histogram()
		    .value(function (d) { return d[1]; })
		    .domain([-imgOY, imgH-imgOY])
		    .thresholds(40)(rowpoint);
	    var maxX = Math.max(1, d3.max(histXData, function (d) { return d.length; })),
		    maxY = Math.max(1, d3.max(histYData, function (d) { return d.length; }));
	    // console.log(histXData, histYData);
	    var mytip = d3.tip()
		    .attr('class', 'tip-ShotView')
		    .offset([-10, 0])
		    .html(function(d) {
		    	var FGA = d.length;
		    	var FGM = d3.sum(d, function (dd) { return +dd.data[15]; });
			    return "<strong>Number of Shoots: </strong><span style='color:#ff692d'>" + d.length + "</span>" +
				    "<br/><strong>Field Goal Percentage: </strong><span style='color:#ff692d'>" + (100*FGM/FGA).toFixed(1) + "%</span>";
		    });
	    self.grpPlot.call(mytip);
	    // console.log([imgW, imgH]);
	    var hexRadius = 8 * ratio;
        var maxSize = rowpoint.length/400;
        var radius = d3.scaleSqrt().domain([0, maxSize]).range([0, hexRadius]);
        var hexbin = d3.hexbin().size([imgW, imgH]).radius(hexRadius);
	    var FGPCTscale = d3.scaleQuantile().domain([0.3,0.4,0.5,0.6,0.7,0.8])
		    .range([
			    '#3288bd',
			    '#99d594',
			    '#e6f598',
			    '#fee08b',
			    '#fc8d59',
			    '#d53e4f'
		    ]);
	    self.svg.select('#title-ShotView')
		    .attr('x', self.svgW/2)
		    .attr('y', 40 * ratio)
		    .attr('font-size', 20 * ratio)
		    .text(attrTitle);
        self.grpPlot
	        .attr('transform', 'translate(' + (imgX + imgOX) + ',' + (imgY+imgOY) + ')')
	        .attr("clip-path", "url(#clip)");
	    self.grpPlot.selectAll(".hexagon").remove();
        self.grpPlot.selectAll(".hexagon").data(hexbin(rowpoint))
		    .enter().append("path")
            .attr("class", "hexagon")
            .attr("d", function(d) { return hexbin.hexagon(radius(Math.min(d.length, maxSize))); })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .style('fill', function(d) {
            	var totalFGPCT = d3.mean(d, function (dd) { return +dd.data[15] });
            	return FGPCTscale(totalFGPCT);
            })
	        .on('mouseover', function (d) {
	        	mytip.show(d);
		        d3.select(this).classed('highlight', true);
	        })
	        .on('mouseout',  function (d) {
	        	mytip.hide();
		        d3.select(this).classed('highlight', false);
	        });
        // legend
	    self.grpLegend.selectAll('*').remove();
	    var groupBarLegend = self.grpLegend.append('g');
	    var groupHexLegend = self.grpLegend.append('g');
	    // --- color
	    if (rowpoint.length > 0) {
		    var legendW = 30 * ratio,
			    legendH = 10 * ratio;
		    d3SelectAll(groupBarLegend, 'rect', FGPCTscale.range())
			    .attr('x', function (d, i) {
				    return self.svgW / 2 + (i - 3) * legendW;
			    })
			    .attr('y', imgY + imgH + 20 * ratio)
			    .attr('width', legendW - 1)
			    .attr('height', legendH)
			    .style('fill', function (d) {
				    return d;
			    });
		    d3SelectAll(groupBarLegend, 'text', FGPCTscale.domain())
			    .attr('x', function (d, i) {
				    return self.svgW / 2 + (i - 2.5) * legendW;
			    })
			    .attr('y', imgY + imgH + 45 * ratio)
			    .text(function (d) {
				    return (d * 100) + '%';
			    })
			    .classed('legend-ShotView', true)
			    .style('font-size', 12 * ratio);
		    groupBarLegend.append('rect')
			    .attr('x', imgX + imgW - 40 * ratio)
			    .attr('y', imgY + imgH - 80 * ratio)
			    .attr('width', 20 * ratio)
			    .attr('height', 20 * ratio)
			    .style('fill', '#fc8d62');
		    groupBarLegend.append('rect')
			    .attr('x', imgX + imgW - 40 * ratio)
			    .attr('y', imgY + imgH - 50 * ratio)
			    .attr('width', 20 * ratio)
			    .attr('height', 20 * ratio)
			    .style('fill', '#66c2a5');
		    groupBarLegend.append('text')
			    .classed('legend-ShotView', true)
			    .attr('x', imgX + imgW - 45 * ratio)
			    .attr('y', imgY + imgH - 65 * ratio)
			    .text('Field Goal Made')
			    .style('text-anchor', 'end')
			    .style('font-size', 12 * ratio);
		    groupBarLegend.append('text')
			    .classed('legend-ShotView', true)
			    .attr('x', imgX + imgW - 45 * ratio)
			    .attr('y', imgY + imgH - 35 * ratio)
			    .text('Field Goal Attempted')
			    .style('text-anchor', 'end')
			    .style('font-size', 12 * ratio);
		    // hexgon
		    var hexRange = [maxSize / 6, 2 * maxSize / 6, 3 * maxSize / 6, 4 * maxSize / 6, 5 * maxSize / 6, 6 * maxSize / 6];
		    groupHexLegend.attr("clip-path", "url(#clip)");
		    groupHexLegend.selectAll(".hexagon").remove();
		    groupHexLegend.selectAll(".hexagon")
			    .data(hexRange)
			    .enter().append("path")
			    .attr("class", "hexagon")
			    .attr("d", function (d) {
				    return hexbin.hexagon(radius(d));
			    })
			    .attr("transform", function (d, i) {
				    var dx = self.svgW / 2 + (i - 2.5) * legendW,
					    dy = imgY + imgH + 70 * ratio;
				    return "translate(" + dx + "," + dy + ")";
			    });
		    d3SelectAll(groupHexLegend, 'text', hexRange)
			    .attr('x', function (d, i) {
				    return self.svgW / 2 + (i - 2.5) * legendW;
			    })
			    .attr('y', imgY + imgH + 90 * ratio)
			    .text(function (d) {
				    return d.toFixed(0);
			    })
			    .classed('legend-ShotView', true)
			    .style('font-size', 12 * ratio);
	    }
        // draw summaries
	    var fgmPad = 2 * ratio,
		    fgaPad = 1 * ratio;
	    var highlightText = groupHexLegend.append('text')
		    .classed('barHighlight-ShotView', true);
	    // left FGA
	    d3SelectAll(self.grpFGAL, 'rect', histYData)
		    .attr('x', self.svgW/2+imgW/2)
		    .attr('y', function (d) { return d.x0 + imgY + imgOY + fgaPad/2; })
		    .attr('width', function (d) { return d.length / maxY * barYheight * ratio; })
		    .attr('height', function (d) { return d.x1 - d.x0 - fgaPad; })
		    .style('fill', '#66c2a5')
		    .on('mouseover', function (d) {
			    d3.select(this).classed('highlight', true);
			    var FGPCT = d3.mean(d, function (dd) { return +dd.data[15]; });
			    if (!FGPCT) { FGPCT = 0; }
			    highlightText
				    .style('display', null)
				    .attr('x', self.svgW/2+imgW/2 + d.length / maxY * barYheight * ratio + 5 * ratio)
				    .attr('y', d.x0 + imgY + imgOY + 8 * ratio)
				    .text('FGA = ' + d.length + ' (FG% = ' + (FGPCT * 100).toFixed(1) + '%)')
				    .style('font-size', 10 * ratio).style('text-anchor', 'start');
		    })
		    .on('mouseout', function () {
			    d3.select(this).classed('highlight', false);
		    	highlightText.style('display', 'none');
		    });
	    // left FGM
	    d3SelectAll(self.grpFGML, 'rect', histYData)
		    .attr('x', self.svgW/2+imgW/2)
		    .attr('y', function (d) { return d.x0 + imgY + imgOY + fgmPad/2; })
		    .attr('width', function (d) {
		    	var FGM = d3.sum(d, function (dd) { return +dd.data[15]; });
		    	if (!FGM) { FGM = 0; }
		    	return FGM / maxY * barYheight * ratio;
		    })
		    .attr('height', function (d) { return Math.max(0, d.x1 - d.x0 - fgmPad); })
		    .style('fill', '#fc8d62')
		    .attr('pointer-events', 'none');
	    // top FGA
	    d3SelectAll(self.grpFGAT, 'rect', histXData)
		    .attr('x', function (d) { return imgX + imgOX + d.x0 + fgaPad/2; })
		    .attr('y', function (d) { return imgY - d.length / maxX * barXheight * ratio; })
		    .attr('width', function (d) { return d.x1 - d.x0 - fgaPad; })
		    .attr('height', function (d) { return d.length / maxX * barXheight * ratio; })
		    .style('fill', '#66c2a5')
		    .on('mouseover', function (d) {
			    d3.select(this).classed('highlight', true);
			    var FGPCT = d3.mean(d, function (dd) { return +dd.data[15]; });
			    if (!FGPCT) { FGPCT = 0; }
			    highlightText
				    .style('display', null)
				    .attr('x', imgX + imgOX + d.x0)
				    .attr('y', imgY - d.length / maxX * barXheight * ratio - 8 * ratio)
				    .text('FGA = ' + d.length + ' (FG% = ' + (FGPCT * 100).toFixed(1) + '%)')
				    .style('font-size', 10 * ratio)
				    .style('text-anchor', 'middle');
		    })
		    .on('mouseout', function () {
			    d3.select(this).classed('highlight', false);
		    	highlightText.style('display', 'none');
		    });
	    // top FGM
	    d3SelectAll(self.grpFGMT, 'rect', histXData)
		    .attr('x', function (d) { return imgX + imgOX + d.x0 + fgmPad/2; })
		    .attr('y', function (d) {
			    var FGM = d3.sum(d, function (dd) { return +dd.data[15]; });
			    if (!FGM) { FGM = 0; }
			    return imgY - FGM / maxX * barXheight * ratio;
		    })
		    .attr('width', function (d) { return Math.max(0, d.x1 - d.x0 - fgmPad); })
		    .attr('height', function (d) {
			    var FGM = d3.sum(d, function (dd) { return +dd.data[15]; });
			    if (!FGM) { FGM = 0; }
			    return FGM / maxX * barXheight * ratio;
		    })
		    .style('fill', '#fc8d62')
		    .attr('pointer-events', 'none');
        // adjust svg size
        self.svg.attr('height', 900 * ratio);
    };

	/**
	 * resizing function
	 */
    self.resize = function ()
    {
	    var div   = document.getElementById('shotChart');  // shortcuts
	    var style = window.getComputedStyle(div, null);       // shortcuts
	    self.svgW  = parseInt(style.getPropertyValue("width"), 10); // compute the divide window width
	    self.setMargin();
	    self.hSpan = self.svgW  - self.margin.left - self.margin.right;  // the area that rect will be plotted
	    self.vSpan = self.svgH - self.margin.top  - self.margin.bottom; // the area that rect will be plotted
	    self.svg.attr('width',  self.svgW);
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
