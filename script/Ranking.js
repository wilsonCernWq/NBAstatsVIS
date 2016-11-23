/**
 * Constructor
 * In self function you want to input all initial variables the class will need
 */
function Ranking () {
    var self = this;

    /**
     * Initialization
     */
    self.init = function (height)
    {
        // setup div size
        var div = document.getElementById('rankView');
        var style = window.getComputedStyle(div,null);
        self.width  = parseInt(style.getPropertyValue("width"),10);
        self.height = height;
        // define plot margin (it gives the minimal margin)
        self.margin = {
            left:   0.1 * self.width,
            right:  0.1 * self.width,
            top:    0.0 * self.height,
            bottom: 0.1 * self.height
        };
        // setup SVG
        self.svg = d3.select('#rankView').select("svg");
        self.svg
            .attr("width",  self.width)
            .attr("height", self.height);
        self.grpAxis = self.svg.select('#rankAxis');
        self.grpBars = self.svg.select('#rankBars');
        self.grpLink = self.svg.select('#rankLink');
    };

    /**
     * self is a function to draw/update view
     */
    self.update = function (id, player, yearFrom, yearTo, attribute)
    {
        var svg = self.svg;
        var windowW = self.width  - self.margin.left - self.margin.right;
        var windowH = self.height - self.margin.top  - self.margin.bottom;
        // load multiple files
        var queue = d3.queue();
        for (var year = yearFrom; year <= Math.min(yearTo,2015); ++year) {
            var stryear = year.toString() + '-' + (year+1).toString().slice(2,4);
            queue.defer(d3.json, 'data/rank/' + stryear + '-ranking.json')
        }
        // draw ranking parallel coordinate
        queue.awaitAll(function(error, files) {
            if (error) throw error;

            // search for the attribute index inside the array
            // -- we input attribute by attribute name, and then search for the attribute index
            var attrID = files[0].resultSet.headers.indexOf(attribute);
            // count the maximum values
            var maxPlayer = d3.max(files, function (d) {
                return d.resultSet.rowSet.length;
            });
            var maxValue  = d3.max(files, function (data) {
                return d3.max(data.resultSet.rowSet, function (d) { return d[attrID]; });
            });

            // parameters for drawing
            var colW = windowW / files.length; // calculate column width
            var barW = 40,                   // bar width
                barHiglight = 10,
                barH = windowH / maxPlayer; // bar height

            // define value scale
            var scale = d3.scaleLinear().domain([0, maxValue]).range([0, barW]);

            //
            files.forEach(function (d, i) { d.index = i; });

            //
            d3SelectAll(self.grpBars,'g',files)
                .attr('id', function (d) { return 'season-' + d.parameters.Season; })
                .attr('transform', 'translate(' + self.margin.left + ',' + self.margin.top + ')');

            for (var k = 0; k < files.length; ++k) {
                var data = files[k];
                console.log(data);

                var header = data.resultSet.headers;
                var rowset = data.resultSet.rowSet;

                var entries = rowset.sort(function (a, b) {
                    if (a[attrID] < b[attrID]) {
                        return 1;
                    } else if (a[attrID] > b[attrID]) {
                        return -1;
                    } else if (a[attrID] == b[attrID]) {
                        return  0;
                    } else {
                        return undefined;
                    }
                });

                var currGrp = self.grpBars.select('#season-' + data.parameters.Season);
                d3SelectAll(currGrp, 'rect', entries)
                    .on('mouseover', function (d) { console.log(d); })
                    .attr("width", function (d,i) { return d[0] == id ? barHiglight: barW; })
                    .attr("height", barH)
                    .attr("x", colW * data.index + colW * 0.5)
                    .attr("y", function (d, i) { return i * barH - 2; })
                    .style("fill", function (d, i) { return d[0] == id ?  "red" : "steelblue"; })
                    .style('stroke-width',0);
            }
        });
    };
}
