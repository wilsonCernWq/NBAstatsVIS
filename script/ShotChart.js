/**
 * 2D Histogram
 * @param xmin
 * @param xmax
 * @param nx
 * @param ymin
 * @param ymax
 * @param ny
 * @constructor
 */
function Hist2d (xmin, xmax, nx, ymin, ymax, ny)
{
    var self = this;

    // save data
    self.xmin = xmin;
    self.xmax = xmax;
    self.ymin = ymin;
    self.ymax = ymax;
    self.nx = nx;
    self.ny = ny;
    self.dx = (xmax - xmin) / (nx-1);
    self.dy = (ymax - ymin) / (ny-1);
    self.maxValue = 0;

    // initialization
    self.array = [];
    self.xedge = [];
    self.yedge = [];
    var x, y;
    for (x = self.xmin; x <= self.xmax; x += self.dx) { self.xedge.push(x); }
    for (y = self.ymin; y <= self.ymax; y += self.dy) { self.yedge.push(y); }
    for (x = self.xmin; x <= self.xmax; x += self.dx) {
        for (y = self.ymin; y <= self.ymax; y += self.dy) {
            self.array.push([x + self.dx/2, y + self.dy/2, 0]);
        }
    }

    // throw histogram value
    self.throw = function (x,y) {
        var i = d3.bisectRight(self.xedge,x)-1, // Math.floor((x-self.xmin)/self.dx),
            j = d3.bisectRight(self.yedge,y)-1; // Math.floor((y-self.ymin)/self.dy);
        if (i < self.nx && j < self.ny) {
            var id = i * self.ny + j;
            self.array[id][2] += 1;
            self.maxValue = self.array[id][2] > self.maxValue ? self.array[id][2] : self.maxValue;
        }
    };

}

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
        // to remember variables for resizing
        self.playerid = playerid;
        self.player = player;
        self.yearFrom = yearFrom;
        self.yearTo = yearTo;
        // RegularSeason
        var SeasonType = 'RegularSeason';
        var rowdata = [];
        for (var y in player.season[SeasonType]) {
            var testdata = player.season[SeasonType][2008].shotchart.Details;
            rowdata = rowdata.concat(testdata.row);
        }
        // console.log(rowdata);
        var dataXMin = d3.min(rowdata, function (d) { return d[12]; }),
            dataXMax = d3.max(rowdata, function (d) { return d[12]; }),
            dataYMin = d3.min(rowdata, function (d) { return d[13]; }),
            dataYMax = d3.max(rowdata, function (d) { return d[13]; });
        console.log('range', 'X:', dataXMax, dataXMin, 'Y:', dataYMax, dataYMin);

        // define gradient color
        var radialGradient = self.svg.append("defs")
            .append("radialGradient")
            .attr("id", "radial-gradient");
        radialGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "red");
        radialGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#ffffff");

        // plot court
        var imgOX = 250.0,
            imgOY =  47.5,
            imgH = 501,
            imgW = 471,
            imgX = self.width/2-imgW/2,
            imgY = self.margin.top;
        self.svg.select('image')
            .attr('x',imgX)
            .attr('y',imgY)
            .attr('width',imgW)
            .attr('height',imgH)
            .attr('xlink:href', 'data/halfcourt.png')
            .style('opacity', 0.8);

        // build histogram
        var barWMin = 4, barWMax = 7;
        var myhist = new Hist2d(-imgOX,imgOX,60,-imgOY,imgW-imgOY,58);
        for (var i = 0; i < rowdata.length; ++i) {
            myhist.throw(+rowdata[i][12], +rowdata[i][13]);
        }
        console.log(myhist);

        // draw rectangles
        var cScale = d3.scaleLinear()
            .domain([0, myhist.maxValue * 0.01, myhist.maxValue])
            .range(['#FFFFFF', '#FF0000', '#FF0000']);
        var wScale = d3.scaleLinear()
            .domain([0, myhist.maxValue * 0.01, myhist.maxValue])
            .range([barWMin, barWMax, barWMax]);
        d3SelectAll(self.grpPlot, 'rect', myhist.array)
            .attr('x', function (d) { return d[1] + imgOY + imgX - wScale(d[2])/2; })
            .attr('y', function (d) { return d[0] + imgOX + imgY - wScale(d[2])/2; })
            .attr('width', function (d) { return wScale(d[2]); })
            .attr('height', function (d) { return wScale(d[2]); })
            .style('fill', function (d) { return cScale(d[2]); })
            .style('opacity', function (d) { return d[2] == 0 ? 0 : 1; });

    }
}
