(function main() {
    console.log('This is where the program starts');

    var margin = 8;

    d3.json('data/playerindex.json', function (errorPlayerIndex, Info) {
        if (errorPlayerIndex) throw errorPlayerIndex;

        // -- TODO Data Query
        var id = 0;
        Info['rowSet'].forEach(function(d, i) { if (d[4] == 'kobe_bryant') id = i; });
        var playerInfo = Info['rowSet'][id];

        // -- Load Player Data
        d3.json('data/player/' + playerInfo[4] + '.json', function (errorPlayer, player) {
            if (errorPlayer) throw errorPlayer;

            console.log(player);

            var w = window.innerWidth - margin * 2;
            var h = 200;

            var infoView = new InfoView('#infoView');
            infoView.init();
            infoView.update(playerInfo[0], player);

            var gameMeshView = new GameMeshView('#gameMeshView', w, h);
            gameMeshView.init();
            gameMeshView.update(playerInfo[0], player, player['info']['FROM_YEAR'], player['info']['TO_YEAR']);

        })

    })

}) ();
