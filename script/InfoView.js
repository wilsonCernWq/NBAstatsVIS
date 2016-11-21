/**
 * Class to display general information of a player
 * HTML LOCATION:
 *   <div id="infoView"> --> <svg> --> <g id="leftPlot">
 */
function InfoView (){

    /**
     * Initialization
     */
    this.init = function()
    {
        // calculate svg default size & get the correct width of the window
        var div   = document.getElementById('infoView');  // shortcuts
        var style = window.getComputedStyle(div, null);   // shortcuts
        // save width and height
        this.width  = parseInt(style.getPropertyValue("width"), 10);
        this.height = 400;
        // setup class fields
        this.div = d3.select('#infoView');
        this.svg = d3.select('#infoView').select('svg')
            .attr('width', this.width)
            .attr('height', this.height);
        // assign groups
        this.grpInfo = d3.select('#leftPlot');
        this.grpInfo.append('image');
        this.grpAxis = d3.select('#yearAxis');
        this.grpAxis.append('g').attr('id','axisGroup');
        this.grpAxis.append('g').attr('id','barsGroup');
    };

    /**
     * This is a function to draw/update view
     */
    this.update = function(player) {
        this.OneView(this.grpInfo, player);
        this.SeasonAxis(this.grpAxis, player);
    };

    /**
     * Function to resize
     */
    this.resize = function () {

    };

    // function to check if the icon file exist
    this.fileExists = function  (url)
    {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, true);
        http.send();
        return http.status != 404;
    };

    // generate one view under a group tag
    this.OneView = function (group, player) {
        var id = player.info.PERSON_ID;
        var textSize = 18,
            headSize = 50;
        var textHeight = 32,
            headHeight = 80;
        var textYOffset  = 10,
            textXOffset  = 350;
        var imageWidth   = 230,
            imageHeight  = 185,
            imageYOffset = 20;

        // attach an image under the svg
        var img = group.select('image').attr('x',(textXOffset - imageWidth)/2).attr('y',imageYOffset)
            .attr('width',  imageWidth)
            .attr('height', imageHeight);
        var url = 'data/playerIcon/' + id + '.png';
        if (this.fileExists(url)) {
            img.attr("xlink:href", url);
        } else {
            img.attr("xlink:href", 'data/playerIcon/NoFound.png');
        }

        // attach player information (construct data)
        var infodata = [];
        infodata.push('Team: ' + teamInfo[player.info.TEAM][0]);
        infodata.push('Position: ' + player.info.POSITION);
        infodata.push('Height: ' + player.info.HEIGHT + ' ft');
        infodata.push('Weight: ' + player.info.WEIGHT + ' lbs');
        infodata.push('Birthday: ' + player.info.BIRTHDATE.slice(0,10));
        infodata.push('Experience: ' + player.info.SEASON_EXP + ' years');
        infodata.push('Prior School: ' + player.info.SCHOOL);
        infodata.push('Seasons: ' + player.info.FROM_YEAR + ' - ' + player.info.TO_YEAR);

        // draw texts
        var tsize = infodata.length;
        group.selectAll('text').remove();
        group.selectAll('text').data(infodata).enter().append('text')
            .attr('x', textXOffset)
            .attr('y', function (d, i) { return textYOffset + textHeight + i * textHeight })
            .text(function (d) { return d; })
            .style('font-size', textSize)
            .style('font-family', 'Verdana');
        group.append('text') // attach header (player name)
            .attr('x', textXOffset/2)
            .attr('y', imageHeight + headHeight)
            .text(player.info.FIRST_NAME + ' ' + player.info.LAST_NAME)
            .style('font-size', headSize)
            .style('font-family', 'Fantasy')
            .style('text-anchor', 'middle');
    };

    /**
     *
     * @param group
     * @param player
     * @constructor
     */
    this.SeasonAxis = function (group, player) {
        var margin = {left: 10, right: 10};
        var span = 0.5;

        var sYear = player.info.FROM_YEAR;
        var eYear = player.info.TO_YEAR;
        var numOfYears = eYear - sYear + 1;

        var fullRange = (this.width * span - margin.left - margin.right);
        var pad = 1;

        // --------------
        var year, team = null, teamList = [];

        for (year = sYear; year <= eYear; ++year) {
            if (player.season.RegularSeason.hasOwnProperty(year)) {
                if (team != player.season.RegularSeason[year].team) {
                    team = player.season.RegularSeason[year].team;
                    teamList.push({
                        team: team,
                        yearFrom: year,
                        yearTo: year
                    });
                } else {
                    teamList[teamList.length-1].yearTo = year;
                }
            }
        }

        group.attr('transform', 'translate(0,350)');


        var yScale = d3.scaleLinear()
            .domain([sYear - 0.5, eYear + 0.5])
            .range([margin.left, fullRange + margin.left]);

        var axis = d3.axisBottom().scale(yScale).ticks(numOfYears,'d').tickSizeOuter(0);

        group.select('#axisGroup').call(axis);

        // draw bars
        // console.log(teamList);
        d3SelectAll(group.select('#barsGroup'), 'rect', teamList)
            .attr('x', function (d) { return yScale(d.yearFrom-0.5) + pad; })
            .attr('y', -14)
            .attr('width', function (d) { return yScale(d.yearTo + 0.5) - yScale(d.yearFrom - 0.5) - pad; })
            .attr('height', 10)
            .style('stroke-width', 2)
            .style('stroke', 'black')
            .style('fill', function (d) { return teamInfo[d.team][1]; });

        d3SelectAll(group.select('#barsGroup'), 'image', teamList)
            .attr('x', function (d) { return yScale(d.yearFrom - 0.5); })
            .attr('y', -65)
            .attr('width',  50)
            .attr('height', 50)
            .attr("xlink:href", function (d) { return 'data/logo/' + d.team + '_logo.svg'; } );

        var brush = d3.brushX()
            .extent([[margin.left,-70],[margin.left + fullRange,30]])
            .on("end", function () {
                var selected = [];
                if (!d3.event.sourceEvent) return; // Only transition after input.
                if (!d3.event.selection) return; // Ignore empty selections
                {
                    var value = d3.event.selection.map(yScale.invert);
                    value[0] = Math.round(value[0]-0.5);
                    value[1] = Math.round(value[1]-0.5);
                    console.log('selectiong year: ',value);
                    value[0] += 0.5;
                    value[1] += 0.5;
                    d3.select(this).transition().call(d3.event.target.move, value.map(yScale));
                }

            });
        //
        group.select('#barsGroup').append('g').attr("class", "brush brushInfoView").call(brush);

    };

}

