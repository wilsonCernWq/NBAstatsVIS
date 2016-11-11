/**
 * Constructor
 * In this function you want to input all initial variables the class will need
 */
function Ranking (svgid, width, height) {
    this.svgId = svgid;
    this.svgWidth  = width;
    this.svgHeight = height;
}

/**
 * Initialization
 */
Ranking.prototype.init = function () {
    this.svg = d3.select(this.svgId).select("svg");
    this.svg
        .attr("width", this.svgWidth)
        .attr("height", this.svgHeight);
};

/**
 * This is a function to draw/update view
 */
Ranking.prototype.update = function (id, player, yearFrom, yearTo, attribute) {

    var svg = this.svg;
    var windowW = this.svgWidth;
    var windowH = this.svgHeight;

    var queue = d3.queue();
    for (var year = yearFrom; year <= yearTo; ++year) {
        var stryear = year.toString() + '-' + (year+1).toString().slice(2,4);
        queue.defer(d3.json, 'data/rank/' + stryear + '-ranking.json')
    }
    queue.awaitAll(function(error, files) {
        if (error) throw error;
        // console.log(files);

        var attrID = files[0]["resultSet"]["headers"].indexOf(attribute);
        var maxPlayer = d3.max(files, function (d) { return d["resultSet"]["rowSet"].length; });
        var maxValue  = d3.max(files, function (data) {
            return d3.max(data["resultSet"]["rowSet"], function (d) { return d[attrID]; });
        });

        var marginW = 10;
        var marginH = windowH / maxPlayer * 0.2;
        var barWidth = windowW / files.length - marginW;
        var barHeight = windowH / maxPlayer * 0.8;
        var barHighlight = 10;

        files.forEach(function (d, i) {
           d.index = i;
        });

        var svgG = svg.selectAll('g').data(files);
        svgG.exit().remove();
        svgG = svgG.enter().append('g').merge(svgG);
        svgG.attr('id', function (d) { return 'season-' + d['parameters']['Season']; });

        for (var k = 0; k < files.length; ++k) {
            var data = files[k];

            var header = data["resultSet"]["headers"];
            var rowset = data["resultSet"]["rowSet"];

            var entries = rowset.sort(function (a, b) {
                if (a[attrID] < b[attrID]) {
                    return 1;
                } else if (a[attrID] > b[attrID]) {
                    return -1;
                } else if (a[attrID] == b[attrID]) {
                    return 0;
                } else {
                    return undefined;
                }
            });
            // console.log(entries);

            var scale = d3.scaleLinear().domain([0, maxValue]).range([0, barWidth]);

            var rect = d3.select('#season-'  + data['parameters']['Season']).selectAll("rect").data(entries);
            rect.exit().remove();
            rect = rect.enter().append('rect').merge(rect);
            rect
                .attr("width", function (d) { return scale(d[attrID]); })
                .attr("height", function (d) {
                    if (d[0] == id) {
                        return barHighlight;
                    } else {
                        return barHeight;
                    }
                })
                .attr("x", (barWidth + marginW) * data.index)
                .attr("y", function (d, i) {
                    if (i <= id) {
                        return i * (barHeight + marginH);
                    } else {
                        return i * (barHeight + marginH) + barHighlight + marginH;
                    }
                })
                .attr("fill", function (d, i) {
                    if (id[i] == id) {
                        return "darkred"
                    } else {
                        return "steelblue";
                    }
                });
        }
    });
};
