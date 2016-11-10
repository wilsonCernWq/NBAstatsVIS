(function main() {
    console.log('This is where the program starts');

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
            var w = window.innerWidth;
            var h = window.innerHeight;

            var gameMeshView = new GameMeshView('#gameMeshView', w, h);

            gameMeshView.init();
            gameMeshView.update(playerInfo[0], player, player['info']['FROM_YEAR'], player['info']['TO_YEAR']);

        })

    })

}) ();