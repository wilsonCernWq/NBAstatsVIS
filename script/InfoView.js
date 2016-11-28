/**
 * Class to display general information of a player
 * HTML LOCATION:
 * <svg>
 *   <g id="leftPlot" ></g>
 *   <g id="yearAxis"> </g>
 * </svg>
 */
function InfoView (){
    var self = this;

    /**
     * Initialization
     */
    self.init = function(height)
    {
        // calculate svg default size & get the correct width of the window
        var div   = document.getElementById('infoView');  // shortcuts
        var style = window.getComputedStyle(div, null);   // shortcuts
        // creat SVG elements
        self.div = d3.select('#infoView');
        self.div.selectAll('svg').remove(); // cleanup everything
        self.svg = self.div.append('svg');
        // creat groups
        // 1)
        self.grpInfo = self.svg.append('g').attr('id','leftPlot');
        self.grpInfo.append('image');
        // 2)
        self.grpAxis = self.svg.append('g').attr('id','yearAxis');
        self.grpAxis.append('g').attr('id','axisGroup');
        self.grpAxis.append('g').attr('id','barsGroup');
        self.grpAxis.append('g').attr('id','brushGroup');
        // 3)
        self.grpRadial = self.svg.append('g').attr('id','radialPlot');
        // save width and height
        self.width  = parseInt(style.getPropertyValue("width"), 10);
        self.height = height;
        self.svg
            .attr('width', self.width)
            .attr('height', self.height);
    };

    /**
     * self is a function to draw/update view
     */
    self.update = function(player)
    {
        self.player = player;
        self.OneInfo(self.grpInfo, player);
        self.SeasonAxis(self.grpAxis, player);
        self.RadialView(self.grpRadial, player)
    };

    /**
     * Function to resize
     */
    self.resize = function ()
    {
        // adjust svg size only
        var div   = document.getElementById('infoView');  // shortcuts
        var style = window.getComputedStyle(div, null);   // shortcuts
        self.width  = parseInt(style.getPropertyValue("width"), 10);
        self.height = 400;
        self.svg.attr('width', self.width).attr('height', self.height);
        self.update(self.player);
    };

    /**
     * function to check if the icon file exist
     * @param url path to the file
     * @returns {boolean} if the file exists
     */
    self.fileExists = function  (url)
    {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false); //< make sure async is true
        http.send();
        return http.status != 404;
    };

    /**
     * generate one view under a group tag
     * @param group
     * @param player
     * @constructor
     */
    self.OneInfo = function (group, player)
    {
        var id = player.info.PERSON_ID;
        var ratio = self.width / 1300; // rescaling ratio

        // parameters
        var headSize   = 50 * ratio,
            headHeight = 80 * ratio;
        var textSize   = 16 * ratio,
            textHeight = 26 * ratio;
        var textYOffset  = 10 * ratio,
            textXOffset  = 450 * ratio;
        var imageWidth   = 230 * ratio,
            imageHeight  = 185 * ratio,
            imageYOffset = 20 * ratio;

        // attach an image under the svg
        var img = group.select('image').attr('x',(textXOffset - imageWidth)/2).attr('y',imageYOffset)
            .attr('width',  imageWidth)
            .attr('height', imageHeight);
        var url = 'data/playerIcon/' + id + '.png';
        if (self.fileExists(url)) {
        // try {
            img.attr("xlink:href", url);
        // } catch(e) {
        } else {
            img.attr("xlink:href", 'data/playerIcon/NoFound.png');
        }

        // attach player information (construct data)
        var infodata = [];
        var teamID = teamList.lookup[player.info.TEAM];
        try {
            infodata.push('Team: ' + teamList.current[teamID].TEAM_CITY + ' ' + teamList.current[teamID].TEAM_NAME);
        } catch (e) {
            console.log(player.info.TEAM);
        }
        if (player.info.POSITION) { infodata.push('Position: ' + player.info.POSITION); }
        if (player.info.HEIGHT) { infodata.push('Height: ' + player.info.HEIGHT + ' ft'); }
        if (player.info.WEIGHT) { infodata.push('Weight: ' + player.info.WEIGHT + ' lbs'); }
        if (player.info.BIRTHDATE) { infodata.push('Birthday: ' + player.info.BIRTHDATE.slice(0,10)); }
        if (player.info.SEASON_EXP) { infodata.push('Experience: ' + player.info.SEASON_EXP + ' years'); }
        if (player.info.SCHOOL) { infodata.push('Prior School: ' + player.info.SCHOOL); }
        infodata.push('Seasons: ' + player.info.FROM_YEAR + ' - ' + player.info.TO_YEAR);

        // draw texts
        var tsize = infodata.length;
        group.selectAll('text').remove();
        group.selectAll('text').data(infodata).enter().append('text')
            .attr('x', textXOffset)
            .attr('y', function (d, i) { return textYOffset + (1 + i) * textHeight })
            .text(function (d) { return d; })
            .classed('info-text', true)
            .style('font-size', textSize);
        group.append('text') // attach header (player name)
            .attr('x', textXOffset/2)
            .attr('y', imageHeight + headHeight)
            .text(player.info.FIRST_NAME + ' ' + player.info.LAST_NAME)
            .classed('info-title', true)
            .style('font-size', headSize);
    };

    /**
     * generate the axis under a group tag
     * @param group
     * @param player
     * @constructor
     */
    self.SeasonAxis = function (group, player)
    {
        //
        // remember input values for reload/resize
        var sYear = player.info.FROM_YEAR;
        var eYear = player.info.TO_YEAR;
        var numOfYears = eYear - sYear + 1;
        //
        // rescaling ratio
        var ratio = self.width / 1300; // rescaling ratio
        // parameters
        var margin = {left: 10, right: 10}; // margin for the  axis
        var spanRatio = 0.43;   // the percentage that the axis will span
        var totalOffsetY = 265 * ratio, // this equals to the icon image height + name font height
            totalPadding = 30 * ratio;  // this is the margin for axis and info view
        var axisSize = 20 * ratio,  // the height of axis
            axisFont = 10 * ratio;  // font size of axis ticks
        var barsOffY   = 5 * ratio,   // padding between bar and axis
            barsSize   = 10 * ratio,  // rect size
            barsPad    = 0.9 * ratio, // padding between two neighboring bars
            barsStroke = 2 * ratio;   // bar stroke
        var logoOffY  = 18 * ratio, // padding between team logo and bars
            logoSize  = 45 * ratio; // size of logo image
        var brushPad = 10 * ratio;  // padding for brush
        // -- calculate total plotting area
        var plotOffY = totalOffsetY + totalPadding + logoOffY + logoSize;
        var plotWidth = self.width * spanRatio - margin.left - margin.right; // the width that will be plotted
        var plotHeight = logoOffY + logoSize + axisSize;
        //
        // prepare data structore for the plot
        var year, team = null, PlayerTeamList = [];
        for (year = sYear; year <= eYear; ++year) {
            if (player.season.RegularSeason.hasOwnProperty(year)) {
                if (team != player.season.RegularSeason[year].team) {
                    // remember current team
                    team = player.season.RegularSeason[year].team;
                    // create new data object
                    PlayerTeamList.push({ team: team, yearFrom: year, yearTo: year});
                } else {
                    PlayerTeamList[PlayerTeamList.length-1].yearTo = year; // update yearTo information
                }
            } else {
                team = null;
            }
        }
        //
        // DRAWING
        // console.log(teamList);
        // creat scale and axis
        var scale = d3.scaleLinear()
            .domain([sYear - 0.5, eYear + 0.5]) // the range is being shifted, for axis ticks
            .range([margin.left, plotWidth + margin.left]);
        var axis  = d3.axisBottom().scale(scale).ticks(numOfYears,'d').tickSizeOuter(0);
        // adjust group properties
        group
            .attr('transform', 'translate(0,' + plotOffY + ')') // shift group position
            .select('#axisGroup')
            .call(axis) // create axis (the axis will be created at level y = 0)
            .selectAll('text')
            .style('font-size', axisFont); // adjust axis font size based on window size
        // draw bars
        d3SelectAll(group.select('#barsGroup'), 'rect', PlayerTeamList)
            .attr('x', function (d) { return scale(d.yearFrom - 0.5) + barsPad; }) // shift things back
            .attr('y', -barsSize - barsOffY) // shift bar based on axis position
            .attr('width', function (d) { return scale(d.yearTo + 0.5) - scale(d.yearFrom - 0.5) - barsPad; })
            .attr('height', barsSize)
            .style('stroke-width', barsStroke) // give rect some strokes
            .style('stroke', 'black')          // stroke color based on team color 2
            .style('fill', function (d) {
                console.log(d, d.team);
                return teamList.current[teamList.lookup[d.team]].COLOR_1; // filling with team color 1
            });
        // draw team logo
        d3SelectAll(group.select('#barsGroup'), 'image', PlayerTeamList)
            .attr('x', function (d) { // --> (somehow the logo is aligned at the center) applied a shift
                return scale((d.yearFrom + d.yearTo)/2) - logoSize/2; // logo align center
            })
            .attr('y', -logoSize - logoOffY) // shift logo based on axis position
            .attr('width',  logoSize)
            .attr('height', logoSize)
            .attr("xlink:href", function (d) {
                var teamABBR = teamList.current[teamList.lookup[d.team]].TEAM_ABBREVIATION;
                return 'data/logo/' + teamABBR + '_logo.svg'; // load data
            });
        // draw brush
        // --> reference https://bl.ocks.org/mbostock/6232537
        var brush = d3.brushX()
            .extent([[margin.left, -logoSize-logoOffY-brushPad],[margin.left+plotWidth, axisSize+brushPad]])
            .on("end", function () {
                if (!d3.event.sourceEvent) return; // Only transition after input.
                if (!d3.event.selection) return; // Ignore empty selections
                // calculate correct year selection
                var value = d3.event.selection.map(scale.invert);
                value[0] = Math.round(value[0]-0.5);
                value[1] = Math.round(value[1]-0.5);
                // TODO call year selection function
                // here I simply print things out, in the future, functions should be linked to here
                console.log('selecting year: ',value);
                // adjust brush position so that it snaps on the correct year
                value[0] += 0.5;
                value[1] += 0.5;
                d3.select(this).transition().call(d3.event.target.move, value.map(scale));
            });
        group.select('#brushGroup').attr('class', 'brush brushInfoView').call(brush);
        group.select('#brushGroup').select('.selection').style('display','none'); // hide selection when resizing
        group.select('#brushGroup').select('.handle').style('display','none');    // hide selection when resizing
    };

    /**
     * Plot Radial View
     * @param group
     * @param player
     * @constructor
     */
    self.RadialView = function(group, player)
    {
        // predefined data range (different range for different data)
        var bgColor = '#D3D3D3';
        var dataSet = [
            // [attribute, min, max, value]
            ["REB", 0.00, 8.60, '#784a92'],
            ["AST", 0.00, 5.31, '#54af54'],
            ["STL", 0.00, 1.06, '#6272a4'],
            ["BLK", 0.00, 1.33, '#457570'],
            ["TOV", 2.76, 0.00, '#804F6E'],
            ["PTS", 0.00, 22.0, '#db7a69']
        ];
        // load data
        var data = player.career.RegularSeason.PerGame;
        var head = player.career.header;
        for (var k = 0; k < dataSet.length; ++k) {
            var attrID = head.indexOf(dataSet[k][0]);
            dataSet[k].push(data[attrID]);
        }
        // parameters
        var barH = 40,
            barWMax = 100,
            barWMin =  50;
        var attrTextFont = 14,
            attrTextYOff =  4,
            attrTextROff = -1;
        var attrTagFont = 14,
            attrTagYOff =  4,
            attrTagROff = -40;
        var attrPIEFont = 14,
            attrPIEYOff = 5;
        // draw background
        // console.log(dataSet);
        group.attr('transform', 'translate(' + (self.width*4/5) + ',' + (200) + ')');
        group.selectAll('*').remove();
        // creat groups
        group.selectAll('g').data(dataSet).enter().append('g')
            .attr('transform', function (d,i) {
                return 'rotate(' + (360 * i / dataSet.length) + ')';
            });
        group.selectAll('g').data(dataSet).append('rect')
            .attr('x', 0).attr('y', -barH/2)
            .attr('height', barH).attr('width', barWMax + barWMin)
            .style('fill', bgColor);
        group.selectAll('g').data(dataSet).append('circle')
            .attr('cx', barWMax + barWMin).attr('cy', 0).attr('r', barH/2)
            .style('fill', bgColor);
        // --- draw data
        // creat rects
        group.selectAll('g')
            .data(dataSet)
            .append('rect')
            .attr('x', 0)
            .attr('y', -barH/2)
            .attr('height', barH)
            .attr('width', function (d) {
                return Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1]))) * barWMax + barWMin;
            })
            .style('fill', function (d) {
                return d[3];
            });
        // creat circles
        group.selectAll('g')
            .data(dataSet)
            .append('circle')
            .attr('cx', function (d) {
                return Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1]))) * barWMax + barWMin;
            })
            .attr('cy', 0)
            .attr('r', barH/2)
            .style('fill', function (d) {
                return d[3];
            });
        // --- other component
        // central circle
        group.append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', 40)
            .style('fill', '#c3cdeb');
        // text for attribute index
        group.append('g').selectAll('text').data(dataSet).enter()
            .append('text')
            .classed('info-radial-attribute-text', true)
            .style('font-size', attrTextFont)
            .attr('x', function (d, i) {
                var r = Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1]))) * barWMax + barWMin;
                var t = 2 * Math.PI * i / dataSet.length;
                return (r - attrTextROff) * Math.cos(t);
            })
            .attr('y', function (d, i) {
                var r = Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1]))) * barWMax + barWMin;
                var t = 2 * Math.PI * i / dataSet.length;
                return (r - attrTextROff) * Math.sin(t) + attrTextYOff;
            })
            .text(function (d) {
                var r = Math.max(0, Math.min(1, (d[4] - d[1]) / (d[2] - d[1])));
                r = Math.round(10 * r)/10;
                return r.toFixed(1);
            });
        // text for attribute index
        group.append('g').selectAll('text').data(dataSet).enter()
            .append('text')
            .classed('info-radial-attribute-tag', true)
            .style('font-size', attrTagFont)
            .attr('x', function (d, i) {
                var r = barWMax + barWMin,
                    t = 2 * Math.PI * i / dataSet.length;
                return (r - attrTagROff) * Math.cos(t);
            })
            .attr('y', function (d, i) {
                var r = barWMax + barWMin,
                    t = 2 * Math.PI * i / dataSet.length;
                return (r - attrTagROff) * Math.sin(t) + attrTagYOff;
            })
            .text(function (d,i) { return dataSet[i][0]; });
        // draw central PIE text
        if (player.info.PIE) {
            group.append('text')
                .classed('info-radial-PIE',true)
                .attr('x', 0)
                .attr('y', attrPIEYOff)
                .text('PIE: ' + Math.round(player.info.PIE * 10000)/100)
                .style('font-size',attrPIEFont)
        }
    };
}