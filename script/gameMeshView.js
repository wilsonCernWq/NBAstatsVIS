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
    this.svg = d3.select(this.svgId);
    this.svg
        .attr('width', this.svgWidth)
        .attr('height', this.svgHeight)
};

/**
 * This is a function to draw/update view
 */
GameMeshView.prototype.update = function(id, player, yearFrom, yearTo){

    // function to convert mm/dd to number between 0 - 10
    var date2value = function (date) {
        var m = (+date.slice(0,2) - 1) / 11;
        var d = (+date.slice(3,5) - 1) / 30;
        return m * 9 + d;
    };

    // construct data
    var playerSeason = player['season']['RegularSeason'];
    var yearList = [];
    for (var year = yearFrom; year <= yearTo; ++year) {
        if (year in playerSeason) {
            var gameList = [];
            for (var gameid in playerSeason[year]['GameList']) {
                if (playerSeason[year]['GameList'].hasOwnProperty(gameid)) {
                    gameList.push({
                        'game': playerSeason[year]['GameList'][gameid],
                        'year': year
                    });
                }
            }
            yearList.push(gameList);
        }
    }
    console.log(yearList);

    // build bars

};

/**
 * This is a function to resize image
 */
GameMeshView.prototype.resize = function(width, heigh){

};

/**
 * Helper function
 */
GameMeshView.prototype.helper = function () {

};


