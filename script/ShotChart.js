/**
 * Class for drawing short chart
 * @constructor
 */
function ShotChart () {
    var self = this;

    /**
     *
     * @param height
     */
    self.init = function (height)
    {
        // creat SVG elements
        d3.select('#shotChart').selectAll('*').remove(); // clean up everything
        self.svg = d3.select('#shotChart').append('svg');
        self.svg.append('image');
        self.grpPlot = self.svg.append('g').attr('id','shotPlot');

        // calculate svg default size & get the correct width of the window
        var div   = document.getElementById('shotChart');  // shortcuts
        var style = window.getComputedStyle(div, null);       // shortcuts
        // setup lengths
        self.width  = parseInt(style.getPropertyValue("width"), 10); // compute the divide window width
        self.height = height;                                        // maximum window height
        // define plot margin (it gives the minimal margin)
        self.margin = {
            left:   0.1 * self.width,
            right:  0.1 * self.width,
            top:    0.1 * self.height,
            bottom: 0.1 * self.height
        };
        self.hSpan = self.width  - self.margin.left - self.margin.right;  // the area that rect will be plotted
        self.vSpan = self.height - self.margin.top  - self.margin.bottom; // the area that rect will be plotted
        // setup SVG size
        self.svg
            .attr('width',  self.width)
            .attr('height', self.height);
    };

    /**
     * update function
     * @param playerid
     * @param player
     * @param yearFrom
     * @param yearTo
     */
    self.update = function (playerid, player, yearFrom, yearTo)
    {

        // plot court
        var imgOX = 250, imgOY = 47.5,
            imgH = 471,  imgW = 501,
            imgX = self.width/2-imgW/2,
            imgY = self.margin.top;
        self.svg.select('image')
            .attr('x',imgX).attr('y',imgY)
            .attr('width',imgW).attr('height',imgH)
            .attr('xlink:href', 'data/halfcourt.png')
            .style('opacity', 0.8);

        // to remember variables for resizing
        self.playerid = playerid;
        self.player = player;
        self.yearFrom = yearFrom;
        self.yearTo = yearTo;
        // RegularSeason
        var SeasonType = 'RegularSeason';
        var rowpoint = [];
        for (var y = yearFrom; y <= yearTo; ++y) {
            if (player.season[SeasonType].hasOwnProperty(y)) {
                player.season[SeasonType][y].shotchart.Details.row.forEach(function (d) {
                    if (+d[13] < imgH-imgOY) {
                        var point = [+d[12], +d[13]];
                        point.data = d;
                        rowpoint.push(point);
                    }
                })
            }
        }

        var radius = d3.scaleSqrt()
            .domain([0, 100])
            .range([0, 8]);

        var hexbin = d3.hexbin()
            .size([imgW, imgH])
            .radius(8);

        // console.log(rowpoint);
        self.grpPlot
            .attr('transform', 'translate(' + (imgX + imgOX) + ',' + (imgY+imgOY) + ')')
            .attr("clip-path", "url(#clip)")
            .selectAll(".hexagon")
            .data(hexbin(rowpoint))
            .enter().append("path")
            .attr("class", "hexagon")
            .attr("d", function(d) { return hexbin.hexagon(radius(Math.min(d.length, 100))); })
            .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
            .style('fill',function(d) {});

    }
}
