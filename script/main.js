/**
 * run functions while loading and resizing
 * @type {main}
 */
window.onload = main;
window.onresize = resize;

/**
 * global variables
 */
var infoView, seasonAxis, generalView, ranking, gameMeshView;

/**
 * main function
 */
function main() {

    /**
     * Function to query the player
     * @param info
     * @param string
     * @returns {*}
     */
    var searchPlayer = function (info, string) {
        var id = 0;
        info['rowSet'].forEach(function(d, i) { if (d[4] == string) id = i; });
        return info['rowSet'][id];
    };


    var debug = true;

    if (debug)  console.log('This is where the program starts');

    d3.json('data/playerindex.json', function (errorPlayerIndex, Info) {
        if (errorPlayerIndex) throw errorPlayerIndex;

        // -- TODO Data Query
        var playerInfo = searchPlayer(Info, 'kobe_bryant');

        // -- TODO Complete All Views
        d3.json('data/player/' + playerInfo[4] + '.json', function (errorPlayer, player) {
            if (errorPlayer) throw errorPlayer;
            if (debug) console.log(playerInfo[4], player);

            // --- Info View
            infoView = new InfoView();
            infoView.init();
            infoView.update(player);

            //generalView = new GeneralView('#generalView', 400, 230);
            //generalView.init();
            //generalView.update(playerInfo[0], player);

            // -- Ranking View
            //ranking = new Ranking('rankView', 300);
            //ranking.init();
            //ranking.update(playerInfo[0], player, player['info']['FROM_YEAR'], player['info']['TO_YEAR'], 'PTS');

            // -- Game Mesh View
            //gameMeshView = new GameMeshView('gameMeshView', 1000, 10000);
            //gameMeshView.init();
            //gameMeshView.update(playerInfo[0], player, player['info']['FROM_YEAR'], player['info']['TO_YEAR']);

        })

    })

}

/**
 * resizing function
 */
function resize() {
    //gameMeshView.resize();
}