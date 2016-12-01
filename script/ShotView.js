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
        d3.select('#shotChart').selectAll('*').remove(); // clean up everything
        self.svg = d3.select('#shotChart').append('svg');
        self.svg.append('image');
        self.grpPlot = self.svg.append('g').attr('id','shotPlot');

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
	    var yearFrom = globData.currSelectedYearRange[0] ? globData.currSelectedYearRange[0] : player.info.FROM_YEAR;
	    var yearTo   = globData.currSelectedYearRange[1] ? globData.currSelectedYearRange[1] : Math.min(player.info.TO_YEAR,2015);
	    var attrTitle = globData.currSelectedAttribute[1] ? globData.currSelectedAttribute[1] : 'Scores';
	    // window ratio
	    var ratio = self.svgW / 1520;
        // plot court
        var imgOX = 250 * ratio,
	        imgOY = 47.5* ratio,
            imgH = 470* ratio,
	        imgW = 500* ratio,
            imgX = self.svgW/2-imgW/2-5,
            imgY = self.margin.top;
        self.svg.select('image')
            .attr('x',imgX).attr('y',imgY)
            .attr('width',imgW).attr('height',imgH)
            .attr('xlink:href', 'data/halfCourt.png')
            .style('opacity', 0.8);
        // to remember variables for resizing
        var SeasonType = 'RegularSeason';
        var rowpoint = [];
        for (var y = yearFrom; y <= yearTo; ++y) {
            if (player.season[SeasonType].hasOwnProperty(y)) {
                if (player.season[SeasonType][y].hasOwnProperty('shotchart')) {
                    player.season[SeasonType][y].shotchart.Details.row.forEach(function (d) {
                        if (+d[13] < imgH - imgOY) {
                            var point = [+d[12] * ratio, +d[13] * ratio]; // !!!! rescale data point ! ...
                            point.data = d;                               // d3.hexgon can be improved !!!!
                            rowpoint.push(point);
                        }
                    })
                }
            }
        }
	    // console.log(rowpoint);
	    console.log([imgW, imgH]);
	    var hexRadius = 8 * ratio;
        var maxSize = rowpoint.length/400;
        var radius = d3.scaleSqrt().domain([0, maxSize]).range([0, hexRadius]);
        var hexbin = d3.hexbin().size([imgW, imgH]).radius(hexRadius);
	    var FGPCTscale = d3.scaleQuantile().domain([0.3,0.4,0.5,0.6,0.7])
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
		    .attr('y', 30)
		    .attr('font-size', 20 * ratio)
		    .text(attrTitle);

        self.grpPlot
	        .attr('transform', 'translate(' + (imgX + imgOX) + ',' + (imgY+imgOY) + ')')
	        .attr("clip-path", "url(#clip)");
        // console.log(hexbin(rowpoint));
	    self.grpPlot.selectAll(".hexagon").remove();
        self.grpPlot.selectAll(".hexagon").data(hexbin(rowpoint))
		    .enter().append("path")
            .attr("class", "hexagon")
            .attr("d", function(d) { return hexbin.hexagon(radius(Math.min(d.length, maxSize))); })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .style('fill', function(d) {
            	var totalFGPCT = d3.mean(d, function (dd) { return +dd.data[15] });
            	return FGPCTscale(totalFGPCT);
            });
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
