/**
 * run functions while loading and resizing
 */
window.onload   = myOnload;
window.onresize = myResize;

/**
 * global variables
 */
var isMac = navigator.platform.toUpperCase().indexOf('MAC')>=0;
var globFunc = {
    infoView: {},
    rankView: {},
    gameView: {},
    shotView: {},
    menuView: {},
    compareView: {}
};
var globData = {
    globTeamList: {},
    globPlayerList: {},
	singleSelectMode: false,
	compareMode: false,
	comparePlayerName: {},
	comparePlayerData: {},
	currSelectedYearRange: [null,null],
	currSelectedAttribute: [null,null],
	currPlayerData: {},
	currPlayerName: 'kobe_bryant',
	currPlayerCompare: '',
	currPlayerFilter: {
		Team: null,
		Hint: null,
		Position: null,
		AllStar:  'yes',
		YearFrom: 2006,
		YearTo:   2015
	},
	dataComment: {
		"REB": [
			"Rebounds",
			" (scale from 0 to 8.6) ",
			"The total number of rebounds, including both<br/>offensive and defensive rebounds",
			0.00, 8.60,
			'#a980e3'
		],
		"AST": [
			"Asistants",
			" (scale from 0 to 5.3) ",
			"Passes that lead directly to a made basket by a player or a team",
			0.00, 5.31,
			'#1f78b4'
		],
		"STL": [
			"Steals",
			" (scale from 0 to 1.1) ",
			"The number of steals by a player",
			0.00, 1.06,
			'#8ba66b'
		],
		"BLK": [
			"Blocks",
			" (scale from 0 to 1.3) ",
			"The number of shot attempts that are blocked by a player",
			0.00, 1.33,
			'#2fa07f'
		],
		"TOV": [
			"Turnovers",
			" (scale from 0 to 2.8) ",
			"The number of turnovers -- possessions that are lost to the opposing team -- by a player or a team",
			0.00, 2.76,
			'#fbb41f'
		],
		"PTS": [
			"Scores"," (scale from 0 to 25) ",
			"The number of points made by a player",
			0.00, 22.0, '#e34748'
		]
	}
};
var debugMuteAll = true;

// UI callbacks
function myQueryTeam(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for Team!', value); }
	globData.currPlayerFilter.Team = +value;
	globFunc.menuView.update();
}

function myQueryPosition(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for Position!', value); }
	globData.currPlayerFilter.Position = value;
	globFunc.menuView.update();
}

function myQueryYearFrom(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for Year From!', value); }
	globData.currPlayerFilter.YearFrom = +value;
	globFunc.menuView.update();
}

function myQueryYearTo(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for Year To!', value); }
	globData.currPlayerFilter.YearTo = +value;
	globFunc.menuView.update();
}

function myQueryAllStar(select) {
	var value = select.options[select.selectedIndex].value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query for All Star or Not!', value); }
	globData.currPlayerFilter.AllStar = value;
	globFunc.menuView.update();
}

function myQueryAutoHintSubmit(src) {
	var value = src.value;
	value = value == 'all' ? null : value;
	if (!debugMuteAll) { console.log('set query hint as', value); }
	globData.currPlayerFilter.Hint = value;
	globFunc.menuView.update();
	return false;
}

function myClearForm(src) { src.value=""; return false; }

/**
 * Function to change player
 * Linked to click button
 */
function myChangePlayer(src) {
	// if (!debugMuteAll) { console.log('asked for changing player!'); }
	if (!globData.compareMode) {
		if (globFunc.menuView.hidden) {
			globFunc.menuView.show();
			globFunc.menuView.resize();
		} else {
			globFunc.menuView.hide();
		}
		//
		if (src.innerHTML == 'Change Player') {
			globData.singleSelectMode = true;
			src.innerHTML = 'Close Selection';
		} else {
			globData.singleSelectMode = false;
			src.innerHTML = 'Change Player';
		}
	}
}

function myComparePlayer(src) {
	// if (!debugMuteAll) { console.log('asked for changing player!'); }
	if (!globData.singleSelectMode) {
		if (!globData.compareMode) {
			globData.compareMode = true;
			globFunc.gameView.hide();
			globFunc.rankView.hide();
			globFunc.shotView.hide();
			src.innerHTML = 'Single Player';
			// select player
			if (globFunc.menuView.hidden) {
				globFunc.menuView.show();
			}
		} else {
			globData.compareMode = false;
			globFunc.compareView.hide();
			globFunc.infoView.update();
			globFunc.gameView.show();
			globFunc.rankView.show();
			globFunc.shotView.show();
			src.innerHTML = 'Compare';
			// close selection
			if (!globFunc.menuView.hidden) {
				globFunc.menuView.hide();
			}
		}
	}
}

// debug
//*/ click on screen to track mouse position
// if (!debugMuteAll) { document.onclick = DebugMouseMovePosition; }
function DebugMouseMovePosition(event) {
	var eventDoc, doc, body;
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

/**
 * main function
 */
function myOnload ()
{
    var self = this;

    // -------------------------------------------------------
    // load global class instance, one for each view
    // -------------------------------------------------------
	globFunc.menuView = new MenuView();
	globFunc.infoView = new InfoView();
    globFunc.rankView = new RankView();
    globFunc.gameView = new GameView();
    globFunc.shotView = new ShotView();
    globFunc.compareView = new CompareView();

    // -------------------------------------------------------
    // load team list
    // -------------------------------------------------------
    d3.csv('data/teamHistory.csv', function (errorTeamHistory, dataTeamHistory) {
        if (errorTeamHistory) throw errorTeamHistory;

        // --------------------
        // [0] ----------------
        // construct team info lookup list
        globData.globTeamList = {lookup: {}, current: {}, history: {}};
        dataTeamHistory.forEach(function (team) {
            var teamid = +team.TEAM_ID;
            globData.globTeamList.lookup[team.TEAM_ABBREVIATION] = teamid;
            if (team.SUMMARY == 'Y') {
                globData.globTeamList.current[teamid] = team;
            } else {
                if (!globData.globTeamList.history.hasOwnProperty(team.TEAM_ID)) {
                    globData.globTeamList.history[teamid] = [team];
                } else {
                    globData.globTeamList.history[teamid].push(team);
                }
            }
        });
        // DEBUG HERE
        if (!debugMuteAll) {
            console.log('globData.globTeamList', globData.globTeamList);
        }

        // --------------------
        // [1] ----------------
        // load player list
        d3.json('data/playerIndex.json', function (errorPlayerIndex, dataPlayerIndex) {
            if (errorPlayerIndex) throw errorPlayerIndex;
            // [1.0]
            // build query filter
            globData.globPlayerList = dataPlayerIndex;
            globFunc.menuView.init(400);
            globFunc.menuView.update();
	        globFunc.menuView.hide();
	        // initialize objects
	        globFunc.infoView.init(600);
	        globFunc.rankView.init(500);
	        globFunc.gameView.init(300);
	        globFunc.shotView.init(700);
	        globFunc.compareView.init();
	        globFunc.compareView.hide();
            // DEBUG HERE
	        // if (!debugMuteAll) {}
            // --------------------
            // [1.1]
            MainReload();
        });
    });
}

/**
 * Load the main project
 */
function MainReload(reloadData)
{
	/**
	 * Function to query the player
	 * @param info
	 * @param string
	 * @returns {*}
	 */
	// var searchPlayer = function (info, string) {
	//   var id = 0;
	// 	 info['rowSet'].forEach(function(d, i) { if (d[4] == string) id = i; });
	// 	 return info['rowSet'][id];
	// };
	// --------------------------------------
	// get current player info
	//var playerInfo = searchPlayer(globData.globPlayerList, globData.currPlayerName);
	// --------------------------------------
    // Complete All Views
	if (reloadData == null || reloadData) {
		d3.json('data/playerList/' + globData.currPlayerName + '.json', function (errorPlayer, player) {
			if (errorPlayer) throw errorPlayer;
			// DEBUG HERE
			if (!debugMuteAll) {
				console.log(globData.currPlayerName, player);
			}
			globData.currPlayerData = player;
			// [0]
			// -- Info View
			if (!globFunc.infoView.hidden) { globFunc.infoView.update(); }
			if (!globFunc.rankView.hidden) { globFunc.rankView.update(); }
			if (!globFunc.gameView.hidden) { globFunc.gameView.update(); }
			if (!globFunc.shotView.hidden) { globFunc.shotView.update(); }
		});
	} else {
		if (!globFunc.rankView.hidden) { globFunc.rankView.update(); }
		if (!globFunc.gameView.hidden) { globFunc.gameView.update(); }
		if (!globFunc.shotView.hidden) { globFunc.shotView.update(); }
		// comparsion
		if (globData.compareMode) {
			d3.json('data/playerList/' + globData.comparePlayerName + '.json', function (errorCompPlayer, playerComp) {
				if (errorCompPlayer) throw errorCompPlayer;
				globData.comparePlayerData = playerComp;
				globFunc.infoView.compare();
				globFunc.compareView.show();
				// globFunc.compareView.update();
			});
		}
	}
}

/**
 * resizing function
 */
function myResize() {
	if (!globFunc.menuView.hidden) { globFunc.menuView.resize(); }
	if (!globFunc.infoView.hidden) { globFunc.infoView.resize(); }
	if (!globFunc.rankView.hidden) { globFunc.rankView.resize(); }
	if (!globFunc.gameView.hidden) { globFunc.gameView.resize(); }
	if (!globFunc.shotView.hidden) { globFunc.shotView.resize(); }
	if (!globFunc.compareView.hidden && globData.compareMode) { globFunc.compareView.resize(); }
}

