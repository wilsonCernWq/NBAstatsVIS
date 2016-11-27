/**
 * run functions while loading and resizing
 * @type {main}
 */
window.onload = main;
window.onresize = resize;

/**
 * global variables
 */
var infoView, ranking, gameMeshView, shotChart;
var teamList;

/**
 * helper functions
 */
function d3SelectAll(base, obj, mydata, removeAll) {
    var select;
    if (!removeAll) {
        select = base.selectAll(obj).data(mydata);
        select.exit().remove();
        select = select.enter().append(obj).merge(select);
        return select;
    } else {
        base.selectAll(obj).remove();
        select = base.selectAll(obj).data(mydata);
        select = select.enter().append(obj).merge(select);
        return select;
    }
}

/**
 * main function
 */
function main()
{
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

    // debug flag
    var debug = true;

    // load team list
    d3.csv('data/teamhistory.csv', function (errorHistory, teamListLocal) {
        if (errorHistory) throw errorHistory;
        // construct team info lookup list
        // teamList = teamListLocal;
        teamList = { lookup:{}, current:{}, history:{} };
        teamListLocal.forEach(function (d) {
            var teamid = +d.TEAM_ID;
            teamList.lookup[d.TEAM_ABBREVIATION] = teamid;
            if (d.SUMMARY == 'Y') {
                teamList.current[teamid] = d;
            } else {
                if (!teamList.history.hasOwnProperty(d.TEAM_ID)) {
                    teamList.history[teamid] = [d];
                } else {
                    teamList.history[teamid].push(d);
                }
            }
        });
        // load player list
        d3.json('data/playerindex.json', function (errorPlayerIndex, playerListLocal) {
            if (errorPlayerIndex) throw errorPlayerIndex;
            //
            // -- TODO Data Query
            var playerInfo = searchPlayer(playerListLocal, 'kobe_bryant');
            //
            // -- TODO Complete All Views
            d3.json('data/player/' + playerInfo[4] + '.json', function (errorPlayer, player)
            {
                if (errorPlayer) throw errorPlayer;
                if (debug) console.log(playerInfo[4], player);
                //
                // -- Info View
                infoView = new InfoView();
                infoView.init(400);
                infoView.update(player);
                //
                // -- Ranking View
                ranking = new Ranking();
                ranking.init(500);
                ranking.update(playerInfo[0], player, player.info.FROM_YEAR, player.info.TO_YEAR, 'PTS');
                //
                // -- Game Mesh View
                gameMeshView = new GameMeshView();
                gameMeshView.init(600);
                gameMeshView.update(playerInfo[0], player, player.info.FROM_YEAR, player.info.TO_YEAR, 'PTS');
                //
                // -- Shot Chart View
                shotChart = new ShotChart();
                shotChart.init(600);
                shotChart.update(playerInfo[0], player, player.info.FROM_YEAR, player.info.TO_YEAR);
            });
        });
    });

    // debug
    //*/ track mouse position
    document.onclick = handleMouseMove;
    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;
        event = event || window.event; // IE-ism
        // If pageX/Y aren't available and clientX/Y are,
        // calculate pageX/Y - logic taken from jQuery.
        // (This is to support old IE)
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;
            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                (doc && doc.clientTop || body && body.clientTop || 0 );
        }
        // Use event.pageX / event.pageY here
        console.log(event.pageX, event.pageY)
    }
    //*/

}

/**
 * resizing function
 */
function resize() {
    infoView.resize();
    gameMeshView.resize();
}

