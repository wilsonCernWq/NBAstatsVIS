(function main() {
    console.log('This is where the program starts');

    var margin = 8;

    d3.json('data/playerindex.json', function (errorPlayerIndex, Info) {
        if (errorPlayerIndex) throw errorPlayerIndex;

        // -- TODO Data Query
        var id = 0;
        Info['rowSet'].forEach(function(d, i) { if (d[4] == 'kobe_bryant') id = i; });
        var playerInfo = Info['rowSet'][id];

        // -- TODO Complete All Views
        d3.json('data/player/' + playerInfo[4] + '.json', function (errorPlayer, player) {
            if (errorPlayer) throw errorPlayer;
            console.log(player);

            var w = window.innerWidth - margin * 2;
            var h = window.innerHeight;

            // --- Info View
            var infoView = new InfoView('#infoView');
            infoView.init();
            infoView.update(playerInfo[0], player);

            var generalView = new GeneralView('#generalView', 400, 230);
            generalView.init();
            generalView.update(playerInfo[0], player);

            // -- Ranking View
            var ranking = new Ranking('#rankView', w, 300);
            ranking.init();
            ranking.update(playerInfo[0], player, player['info']['FROM_YEAR'], player['info']['TO_YEAR'], 'PTS');

            // -- Game Mesh View
            var gameMeshView = new GameMeshView('#gameMeshView', w, 200);
            gameMeshView.init();
            gameMeshView.update(playerInfo[0], player, player['info']['FROM_YEAR'], player['info']['TO_YEAR']);

        })

    })

}) ();
