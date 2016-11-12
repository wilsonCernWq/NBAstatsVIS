/**
 * Constructor
 * In this function you want to input all initial variables the class will need
 */
function GameMeshView(svgid, width, height){
    this.svgId = svgid;
    this.svgWidth  = width;
    this.svgHeight = height;
}

/**
 * Initialization
 */
GameMeshView.prototype.init = function(){
    this.svg = d3.select(this.svgId).select('svg');
    this.svg
        .attr('width', this.svgWidth)
        .attr('height', this.svgHeight)
};

/**
 * This is a function to draw/update view
 */
GameMeshView.prototype.update = function(id, player, yearFrom, yearTo){
    this.id = id;
    this.player = player;
    this.yearFrom = yearFrom;
    this.yearTo = yearTo;

    // function to convert mm/dd to number between 0 - 10
    var date2value = function (date) {
        var y =  date.slice(7,11);
        var m = +date.slice(0,2);
        var d = +date.slice(3,5);
        if (m > 9) {
            m -= 9;
        } else {
            m += 3;
        }
        m = (m-1) / 8;
        d = (d-1) / 30;
        return m * 9 + d;
    };

    // construct data
    var nbin = 140;
    var step = 10/nbin;

    var minBin = 999, maxBin = 0;
    var counter = 0;
    var mesh = [];

    var playerSeason = player['season']['RegularSeason'];
    for (var year = yearFrom; year <= yearTo; ++year) {
        if (year in playerSeason) {
            var edge = [];
            for (var b = 0; b < nbin; ++b) {
                edge.push({'height': 0, 'list':[], 'year': year, 'xpos': b, 'ypos': -1});
            }
            for (var gameid in playerSeason[year]['GameList']) {
                if (playerSeason[year]['GameList'].hasOwnProperty(gameid)) {
                    var x = date2value(playerSeason[year]['GameList'][gameid][3]);
                    var i = Math.max(Math.ceil(x/step-1),0);
                    edge[i].height += playerSeason[year]['GameList'][gameid][10];
                    edge[i].list.push(playerSeason[year]['GameList'][gameid]);
                    edge[i].ypos = counter;
                    minBin = Math.min(i, minBin);
                    maxBin = Math.max(i, maxBin);
                }
            }
            mesh = mesh.concat(edge);
            counter++;
        }
    }

    mesh = mesh.filter(function (d) {
        return (d.ypos != -1);
    });
    // console.log(mesh);

    // build bars
    var barW = this.svgWidth / (maxBin - minBin + 1) * 0.95;
    var barH = this.svgHeight / counter * 0.95;

    var xScale = d3.scaleLinear().domain([minBin, maxBin]).range([0, this.svgWidth]);
    var yScale = d3.scaleLinear().domain([0,counter]).range([0, this.svgHeight]);
    var cScale = d3.scaleLinear().domain([0,100]).range(['#ffffff', '#0008A2'])

    var svgR = this.svg.selectAll('rect').data(mesh);
    svgR.exit().remove();
    svgR = svgR.enter().append('rect').merge(svgR);
    svgR
        .attr('x', function (d) { return xScale(d.xpos); })
        .attr('y', function (d) { return yScale(d.ypos); })
        .attr('width', barW)
        .attr('height', barH)
        .style('fill', function (d) {
            return cScale(d['height']);
        })
        .on('mouseover', function(d) {
            // console.log(d)
        })

};

/**
 * This is a function to resize image
 */
GameMeshView.prototype.resize = function(width, height){
    this.svgWidth = width;
    this.svgHeight = height;
    this.svg.attr('width', this.svgWidth).attr('height', this.svgHeight);
    this.update(this.id, this.player, this.yearFrom, this.yearTo);
};

/**
 * Helper function
 */
GameMeshView.prototype.helper = function () {

};



