/**
 * Constructor
 * In self function you want to input all initial variables the class will need
 */
function RankView () {
    var self = this;

    /**
     * Initialization
     */
    self.init = function (height)
    {
        // setup div size
        var div = document.getElementById('rankView');
        var style = window.getComputedStyle(div, null); // console.log(style);
        self.width = parseInt(style.getPropertyValue("width"), 10);
        self.height = height;
        self.box = { top: div.offsetTop, left: div.offsetLeft };
        // define plot margin (it gives the minimal margin)
        self.margin = {
            left:   0.02 * self.width,
            right:  0.02 * self.width,
            top:     0.1 * self.height,
            bottom:  0.1 * self.height
        };
        // setup SVG
        self.svg = d3.select('#rankView').select("svg");
        self.svg
            .attr("width", self.width)
            .attr("height", self.height);
        self.grpAxis = self.svg.select('#rankAxis');
        self.grpBars = self.svg.select('#rankBars');
        self.grpLink = self.svg.select('#rankLink');
        // create tooltip for this view
        self.tooltip = d3.select('#rankView')
            .append('div')
            .classed('rank-tooltip', true)
            .attr('id', 'ranking')
            .style("display", "none");
    };

    /**
     * self is a function to draw/update view
     */
    self.update = function (playerid, player, yearFrom, yearTo, attribute) {
        // window plotting size
        var windowW = self.width - self.margin.left - self.margin.right;
        var windowH = self.height - self.margin.top - self.margin.bottom;

        // load multiple files
        var queue = d3.queue();
        for (var year = yearFrom; year <= Math.min(yearTo, 2015); ++year) {
            var stryear = year.toString() + '-' + (year + 1).toString().slice(2, 4);
            queue.defer(d3.json, 'data/rank/' + stryear + '-ranking.json')
        }

        // draw ranking parallel coordinate
        queue.awaitAll(function (error, files) {
            if (error) throw error;

            //----------------------------------------------------------------------------------------------
            // search for the attribute index inside the array
            // -- we input attribute by attribute name, and then search for the attribute index
            var attrID = files[0].resultSet.headers.indexOf(attribute);
            // console.log(files[0].resultSet.headers);
            // restruct data
            var filesMetaInfo = [];
            files.forEach(function (single, i) {
                // 1) sort data
                var entries = single.resultSet.rowSet.sort(function (a, b) {
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
                // 2) get meta information
                var playerRank = -1;
                entries.forEach(function (s, i) {
                    if (s[0] == playerid) {
                        playerRank = i;
                    }
                });
                filesMetaInfo.push({
                    year: single.parameters.Season,
                    rank: playerRank,
                    rowset: entries
                });
            });
            // console.log(filesMetaInfo);

            //----------------------------------------------------------------------------------------------
            // parameters for drawing
            // count the maximum values
            var maxPlayer = d3.max(files, function (d) {
                return d.resultSet.rowSet.length;
            });
            var maxValue = d3.max(files, function (data) {
                return d3.max(data.resultSet.rowSet, function (d) {
                    return d[attrID];
                });
            });
            var maxRadius = 6,
                minRadius = 0;
            // displaying parameters
            var barMargin = 20, // calculate column width
                barW = windowW / files.length - barMargin, // bar width
                barH = windowH / maxPlayer;                // bar height
            // text parameter
            var textMargin = 8,
                textFont   = 10;
            // tooltip texts
            var zoomlen = 3,
                zoomH = 100, // should be the same as CSS !!!
                zoomW = 120, // should be the same as CSS !!!
                zoomFontMT = 11, // text down shifting
                zoomFontML = 3;  // left margin
            // define value scale
            var xScale = d3.scaleLinear().domain([0, maxValue]).range([0, barW]);
            var rScale = d3.scaleSqrt().domain([0, maxValue]).range([minRadius, maxRadius]);
            //----------------------------------------------------------------------------------------------
            // define use objects before drawing
            // tooltip functions
            var mouseover = function () {
                self.tooltip
                    .style('display', 'inline')
                    .html('<svg id="rankView-tooltip-svg" width="120" height="100"></svg>');
            };
            var mouseout = function () {
                self.tooltip.style('display', 'none');
            };
            var mousemove = function () {
                // calculate indices
                var Xindex = Math.floor((d3.event.pageX - self.box.left - self.margin.left) / (barW + barMargin));
                var Yindex = Math.round((d3.event.pageY - self.box.top  - self.margin.top ) / barH);
                //console.log(d3.event.pageY);
                // shift tooltip immediately
                self.tooltip
                    .style('left', (Xindex * (barW + barMargin) + self.box.left - self.margin.left) + 'px')
                    .style('top', (d3.event.pageY - 12) + 'px');
                // retrieve data
                var maxIndex = filesMetaInfo[Xindex].rowset.length - 1;
                var Is = Yindex - zoomlen,
                    Ie = Yindex + zoomlen;
                if (Is < 0) { Is = 0; Ie = Math.min(Is + 2 * zoomlen + 1, maxIndex); }
                if (Ie > maxIndex) { Ie = maxIndex; Is = Math.max(Ie - 2 * zoomlen - 1, 0); }
                var zoomdata = filesMetaInfo[Xindex].rowset.slice(Is,Ie+1);
                //console.log(zoomdata);
                // modified svg
                var plot = d3.select('#rankView-tooltip-svg');
                d3SelectAll(plot, 'rect', zoomdata)
                    .attr('x', 0)
                    .attr('y', function(d,i) { return i * zoomH / (zoomlen*2+1); })
                    .attr('width', zoomW)
                    .attr('height', zoomH / (zoomlen*2+1))
                    .classed('rank-tooltip-rect-frame', true);
                d3SelectAll(plot, 'text', zoomdata)
                    .attr('x', zoomFontML)
                    .attr('y', function(d,i) {
                        return i * zoomH / (zoomlen*2+1) + zoomFontMT; // down shift texts
                    })
                    .text(function (d,i) { return (i+Is+1) + ': ' + d[2] + '  ' + d[attrID]; })
            };
            // draw area chart
            var area = d3.area()
                .x(function (d, i) { return i * barH; }).y0(0) .y1(function (d) { return xScale(d[attrID]); });

            //----------------------------------------------------------------------------------------------
            // creat groups for every year the player played
            var groups = d3SelectAll(self.grpBars, 'g', filesMetaInfo, true)
                .attr('id', function (d) { return 'season-' + d.year; })
                .attr('transform', function (d, i) {
                    var left = self.margin.left + (barW + barMargin) * (i + 0.5) - barW / 2;
                    var top = self.margin.top;
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
                .on('mouseout', mouseout);
            // draw bar & circle to high-light player
            groups.filter(function (d) { return d.rank != -1; })
                .append('circle')
                .classed('rank-circle', true)
                .attr('cx', function (d) { return barH * d.rank; })
                .attr('cy', function (d) { return xScale(d.rowset[d.rank][attrID]); })
                .attr('r', function (d) { return rScale(d.rowset[d.rank][attrID]); })
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);
            groups.filter(function (d) { return d.rank != -1; })
                .append('rect')
                .classed('rank-highlight-bar', true)
                .attr('x', function (d) { return barH * (d.rank - 0.5); })
                .attr('y', 0)
                .attr('width', function (d) {
                    return barH;
                })
                .attr('height', function (d) {
                    return xScale(d.rowset[d.rank][attrID]) - rScale(d.rowset[d.rank][attrID]);
                })
                .on('mouseover', mouseover)
                .on('mousemove', mousemove)
                .on('mouseout', mouseout);

            // plot year axis
            var texts = d3SelectAll(self.grpAxis, 'g', filesMetaInfo, true)
                .attr('transform', function (d, i) {
                    var left = self.margin.left + (barW + barMargin) * (i + 0.5) - barW / 2;
                    var top = self.margin.top;
                    return 'translate(' + left + ',' + top + ')'
                })
                .attr('id', function (d) { return 'axis-' + d.year; });
            texts.append('text')
                .classed('rank-year-text', true)
                .attr('x', barW/2) // center the bar
                .attr('y', -textMargin)
                .text(function (d) { return d.year; })
                .style('font-size', textFont);
            texts.append('text')
                .classed('rank-player-text', true)
                .attr('x', barW/2) // center the bar
                .attr('y', function (d) { return barH * d.rowset.length + textFont * 0.6 + textMargin; })
                .text(function (d) { return d.rowset.length; })
                .style('font-size', textFont);

        });
    };
}
