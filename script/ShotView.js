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
			top:    isMac ? 0.15 * self.svgH : 0.1 * self.svgH,
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
	    // right bar plot
	    self.grpRight = self.svg.append('g').attr('id','shotRight');
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
	    var attrTitle = 'Shooting Frequency';
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
				    "<br/><strong>Field Goals Percentage: </strong><span style='color:#ff692d'>" + (100*FGM/FGA).toFixed(1) + "%</span>";
		    });
	    self.grpPlot.call(mytip);
	    // console.log([imgW, imgH]);
	    var hexRadius = 8 * ratio;
        var maxSize = rowpoint.length/400;
        var radius = d3.scaleSqrt().domain([0, maxSize]).range([0, hexRadius]);
        var hexbin = d3.hexbin().size([imgW, imgH]).radius(hexRadius);
	    var FGPCTscale = d3.scaleQuantile().domain([0.35,0.40,0.45,0.5,0.55,0.60,0.65])
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
	    // draw hexgon
	    self.svg.selectAll('defs').remove();
	    self.svg.append('defs').append("clipPath").attr("id", "clip")
		    .append("rect").attr("class", "mesh")
		    .attr('x', -imgOX)
		    .attr('y', -imgOY)
		    .attr("width", imgW)
		    .attr("height", imgH);
        self.grpPlot
	        .attr('transform', 'translate(' + (imgX + imgOX) + ',' + (imgY+imgOY) + ')')
	        .selectAll(".hexagon").remove();
        self.grpPlot
	        .attr("clip-path", "url(#clip)")
	        .selectAll(".hexagon").data(hexbin(rowpoint))
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
				    return self.svgW / 2 + (i - 3) * legendW;
			    })
			    .attr('y', imgY + imgH + 45 * ratio)
			    .text(function (d) {
				    return (d * 100).toFixed(0) + '%';
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
			    .text('Field Goals Made')
			    .style('text-anchor', 'end')
			    .style('font-size', 12 * ratio);
		    groupBarLegend.append('text')
			    .classed('legend-ShotView', true)
			    .attr('x', imgX + imgW - 45 * ratio)
			    .attr('y', imgY + imgH - 35 * ratio)
			    .text('Field Goals Attempted')
			    .style('text-anchor', 'end')
			    .style('font-size', 12 * ratio);
		    // hexgon
		    var hexRange = [maxSize / 6, 2 * maxSize / 6, 3 * maxSize / 6, 4 * maxSize / 6, 5 * maxSize / 6, 6 * maxSize / 6];
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
		    .attr('y', function (d) { return d.x0 + imgY + imgOY + fgaPad/2 - (d.x1-d.x0)/2; })
		    .attr('width', function (d) { return d.length / maxY * barYheight; })
		    .attr('height', function (d) { return d.x1 - d.x0 - fgaPad; })
		    .style('fill', '#66c2a5')
		    .on('mouseover', function (d) {
			    d3.select(this).classed('highlight', true);
			    var FGPCT = d3.mean(d, function (dd) { return +dd.data[15]; });
			    if (!FGPCT) { FGPCT = 0; }
			    highlightText
				    .style('display', null)
				    .attr('x', self.svgW/2+imgW/2 + d.length / maxY * barYheight + 5 * ratio)
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
		    .attr('y', function (d) { return d.x0 + imgY + imgOY + fgmPad/2 - (d.x1-d.x0)/2; })
		    .attr('width', function (d) {
		    	var FGM = d3.sum(d, function (dd) { return +dd.data[15]; });
		    	if (!FGM) { FGM = 0; }
		    	return FGM / maxY * barYheight;
		    })
		    .attr('height', function (d) { return Math.max(0, d.x1 - d.x0 - fgmPad); })
		    .style('fill', '#fc8d62')
		    .attr('pointer-events', 'none');
	    // top FGA
	    d3SelectAll(self.grpFGAT, 'rect', histXData)
		    .attr('x', function (d) { return imgX + imgOX + d.x0 + fgaPad/2 - (d.x1-d.x0)/2; })
		    .attr('y', function (d) { return imgY - d.length / maxX * barXheight; })
		    .attr('width', function (d) { return d.x1 - d.x0 - fgaPad; })
		    .attr('height', function (d) { return d.length / maxX * barXheight; })
		    .style('fill', '#66c2a5')
		    .on('mouseover', function (d) {
			    d3.select(this).classed('highlight', true);
			    var FGPCT = d3.mean(d, function (dd) { return +dd.data[15]; });
			    if (!FGPCT) { FGPCT = 0; }
			    highlightText
				    .style('display', null)
				    .attr('x', imgX + imgOX + d.x0)
				    .attr('y', imgY - d.length / maxX * barXheight - 8 * ratio)
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
		    .attr('x', function (d) { return imgX + imgOX + d.x0 + fgmPad/2 - (d.x1-d.x0)/2; })
		    .attr('y', function (d) {
			    var FGM = d3.sum(d, function (dd) { return +dd.data[15]; });
			    if (!FGM) { FGM = 0; }
			    return imgY - FGM / maxX * barXheight;
		    })
		    .attr('width', function (d) { return Math.max(0, d.x1 - d.x0 - fgmPad); })
		    .attr('height', function (d) {
			    var FGM = d3.sum(d, function (dd) { return +dd.data[15]; });
			    if (!FGM) { FGM = 0; }
			    return FGM / maxX * barXheight;
		    })
		    .style('fill', '#fc8d62')
		    .attr('pointer-events', 'none');
	    // circular chart
	    // -- get hist data alone radius
	    var histRData = d3.histogram()
		    .value(function (d) { return d.data[11]; })
		    .domain([0, 29]) // 29 ft maximum for a half court
		    .thresholds(40)(rowpoint);
	    var maxR = d3.max(histRData, function (d) { return d.length; });
	    var barRheight = 200 * ratio;
	    var barRxoff = self.svgW/2-imgW/2-(isMac?40:30)*ratio,
		    barRyoff = imgY + imgOY;
	    var barRxscale = d3.scaleLinear().domain([0,29]).range([0,29*imgH/43.03]).nice(),
		    barRyscale = d3.scaleLinear().domain([maxR,0]).range([0,barRheight]).nice();
	    // put everything else here
	    self.grpRight.selectAll('g').remove();
	    var barRelse = self.grpRight.append('g');
	    barRelse.append('text').attr('id','shotBarRValue')
		    .style('display','none')
		    .style('font-size', 11 * ratio);
	    barRelse.append('circle').attr('id','shotBarRCircle')
		    .style('display','none')
		    .style('opacity',0.8)
		    .attr('transform', 'translate(' + (imgX + imgOX-barRxoff) + ',' + (imgY+imgOY-barRyoff) + ')')
		    .attr("clip-path", "url(#clip)");
	    barRelse
		    .append('text')
		    .attr('x',-imgH+135*ratio).attr('y',5*ratio)
		    .attr('transform','rotate(-90)')
		    .style('font-family',"'Titillium Web', sans-serif")
		    .style('font-size', 12 * ratio)
		    .text('ft');
	    // draw bars
	    self.grpRight.attr('transform','translate(' + barRxoff + ',' + barRyoff + ') scale(1,1)');
	    d3SelectAll(self.grpRight,'rect',histRData)
		    .attr('x', function (d) { return -barRyscale(maxR-d.length); })
		    .attr('y', function (d) { return barRxscale(d.x0) + fgaPad/2; })
		    .attr('width', function (d) { return barRyscale(maxR-d.length); })
		    .attr('height', function (d) { return barRxscale(d.x1 - d.x0) - fgaPad; })
		    .style('fill', '#66c2a5')
		    .on('mouseover', function (d) {
		    	// console.log((d.x0+d.x1)/2);
		    	barRelse.select('#shotBarRCircle')
				    .style('display',null)
				    .attr('cx',0)
				    .attr('cy',0)
				    .attr('r',barRxscale((d.x0+d.x1)/2))
				    .style('stroke','grey')
				    .style('stroke-width',5)
				    .style('fill','none');
		    	var FGPCT = d3.mean(d, function (dd) { return +dd.data[15]; }) * 100;
			    barRelse.select('#shotBarRValue')
				    .style('display',null)
				    .attr('x', -barRyscale(maxR-d.length) - 8 * ratio)
				    .attr('y', barRxscale(d.x0) + fgaPad/2 + 8 * ratio)
				    .text(d.length + ' Field Goals Attempted @ ' + d.x0 + '-' + d.x1 + ' ft (Made ' + FGPCT.toFixed(0) + '%)');
		    })
		    .on('mouseout', function (d) {
			    barRelse.select('#shotBarRValue').style('display','none');
		    	barRelse.select('#shotBarRCircle').style('display','none');
		    });
	    // -- axes
	    self.grpRight.append('g').call(d3.axisRight(barRxscale));
	    self.grpRight.append('g')
		    .attr('transform','translate('+(-barRheight)+',0)')
		    .call(d3.axisTop(barRyscale).ticks(5));
		if (isMac) {
			self.grpRight.selectAll('text').style('font-size', 8);
		}
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
