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
        this.grpAxis.append('path');
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
        http.open('HEAD', url, false);
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
            textXOffset  = 300;
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
        infodata.push('Birthday: ' + player.info.BIRTHDATE.slice(0,10));
        infodata.push('Position: ' + player.info.POSITION);
        infodata.push('Team: '     + player.info.TEAM);
        infodata.push('Height: '   + player.info.HEIGHT);
        infodata.push('Weight: '   + player.info.WEIGHT + ' lbs');
        infodata.push('Country: '  + player.info.COUNTRY);
        infodata.push('School: '   + player.info.SCHOOL);
        infodata.push('Seasons: '  + player.info.FROM_YEAR + ' - ' + player.info.TO_YEAR);

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
        var sYear = player.info.FROM_YEAR;
        var eYear = player.info.TO_YEAR;
        var numOfYears = eYear - sYear + 1;

        var halfStep = this.width / numOfYears / 2;

        var i;

        var seasonList = [];

        for (i = sYear; i <= eYear; ++i) {
            var entry = {
                year: i,
                team: null
            };
            if (player.season.RegularSeason.hasOwnProperty(i)) {
                entry.team = player.season.RegularSeason[i].team;
            }
            seasonList.push(entry);
        }


        group.attr('transform', 'translate(0,350)');

        var yScale = d3.scaleLinear()
            .domain([0, numOfYears - 1])
            .range([halfStep, this.width/2 - halfStep]);

        var axis = d3.axisBottom()
            .scale(yScale)
            .ticks(numOfYears)
            .tickFormat(function (i) { return sYear + i; });

        group.append('g').call(axis);

        

    };

}

