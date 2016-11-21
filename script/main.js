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
var teamInfo = {
    ATL: ['Atlanta Hawks','#E03A3E'],
    BOS: ['Boston Celtics','#008348'],
    BKN: ['Brooklyn Nets','#000000'],
    CHA: ['Charlotte Hornets','#1D1160'],
    CHI: ['Chicago Bulls','#CE1141'],
    CLE: ['Cleveland Cavaliers','#860038'],
    DAL: ['Dallas Mavericks','#007DC5'],
    DEN: ['Denver Nuggets','#4FA8FF'],
    DET: ['Detroit Pistons','#006BB6'],
    GSW: ['Golden State Warriors','#006BB6'],
    HOU: ['Houston Rockets','#CE1141'],
    IND: ['Indiana Pacers', '#00275D'],
    LAC: ['Los Angeles Clippers','#ED174C'],
    LAL: ['Los Angeles Lakers','#552582'],
    MEM: ['Memphis Grizzlies','#23375B'],
    MIA: ['Miami Heat','#98002E'],
    MIL: ['Milwaukee Bucks','#00471B'],
    MIN: ['Minnesota Timberwolves','#005083'],
    NOP: ['New Orleans Pelicans','#002B5C'],
    NYK: ['New York Knicks','#F58426'],
    OKC: ['Oklahoma City Thunder','#007DC3'],
    ORL: ['Orlando Magic','#007DC5'],
    PHI: ['Philadelphia 76ers','#006BB6'],
    PHX: ['Phoenix Suns','#E56020'],
    POR: ['Portland Trail Blazers','#F0163A'],
    SAC: ['Sacramento Kings','#724C9F'],
    SAS: ['San Antonio Spurs','#B6BFBF'],
    TOT: ['Toronto Raptors','#CE1141'],
    UTA: ['Utah Jazz','#002B5C'],
    WAS: ['Washington Wizards','#F5002F']
};

/**
 * helper functions
 */
function d3SelectAll(base, obj, mydata) {
    var select = base.selectAll(obj).data(mydata);
    select.exit().remove();
    select = select.enter().append(obj).merge(select);
    return select;
}

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

    // if (debug)  console.log('This is where the program starts');

    d3.json('data/playerindex.json', function (errorPlayerIndex, Info) {
        if (errorPlayerIndex) throw errorPlayerIndex;

        // -- TODO Data Query
        var playerInfo = searchPlayer(Info, 'aaron_brooks');

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