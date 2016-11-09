import json
import os


def mkdir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)


def quickpop(farray, n, fi):
    for idx in range(0, n):
        farray.pop(fi)


# open file
f = open('playerID-pre.json', 'r')
data = f.read()
f.close()

# JSON parser
data = json.loads(data)

# load player
mkdir('playerInfo')

# make all paths
os.chdir('playerInfo')

# data structure
index = 0

for entry in data['rowSet']:

    player = {}
    index += 1
    print (entry[4] + ' ' + str(index))

    # 1) info
    f = open(entry[4] + '/info.json', 'r')
    info = json.loads(f.read())
    f.close()
    # --- compress
    player['info'] = {}
    player['info']['PERSON_ID'] = info['resultSets'][0]['rowSet'][0][0]
    player['info']['FIRST_NAME'] = info['resultSets'][0]['rowSet'][0][1]
    player['info']['LAST_NAME'] = info['resultSets'][0]['rowSet'][0][2]
    player['info']['BIRTHDATE'] = info['resultSets'][0]['rowSet'][0][6]
    player['info']['SCHOOL'] = info['resultSets'][0]['rowSet'][0][7]
    player['info']['COUNTRY'] = info['resultSets'][0]['rowSet'][0][8]
    player['info']['HEIGHT'] = info['resultSets'][0]['rowSet'][0][10]
    player['info']['WEIGHT'] = info['resultSets'][0]['rowSet'][0][11]
    player['info']['SEASON_EXP'] = info['resultSets'][0]['rowSet'][0][12]
    player['info']['JERSEY'] = info['resultSets'][0]['rowSet'][0][13]
    player['info']['POSITION'] = info['resultSets'][0]['rowSet'][0][14]
    player['info']['ROSTERSTATUS'] = info['resultSets'][0]['rowSet'][0][15]
    player['info']['TEAM'] = info['resultSets'][0]['rowSet'][0][18]
    player['info']['FROM_YEAR'] = info['resultSets'][0]['rowSet'][0][22]
    player['info']['TO_YEAR'] = info['resultSets'][0]['rowSet'][0][23]
    player['info']['DLEAGUE'] = info['resultSets'][0]['rowSet'][0][24]
    if info['resultSets'][1]['rowSet']:
        player['info']['ALL_STAR'] = info['resultSets'][1]['rowSet'][0][-1]
    else:
        player['info']['ALL_STAR'] = 0

    # 2) careersummary
    f = open(entry[4] + '/careersummary.json', 'r')
    info = json.loads(f.read())
    f.close()
    # -- compress
    player['career'] = {}
    player['career']['headerRow'] = ["GP", "GS", "MIN", "FGM", "FGA", "FG_PCT", "FG3M", "FG3A", "FG3_PCT", "FTM", "FTA",
                                     "FT_PCT", "OREB", "DREB", "REB", "AST", "STL", "BLK", "TOV", "PF", "PTS"]
    player['career']['headerCol'] = ['PerGame', 'Totals']
    player['career']['RegularSeason'] = []
    player['career']['PostSeason'] = []
    player['season'] = {}
    player['season']['headerRowTotals'] = ["PLAYER_AGE", "GP", "GS", "MIN", "FGM", "FGA", "FG_PCT", "FG3M", "FG3A",
                                           "FG3_PCT", "FTM", "FTA", "FT_PCT", "OREB", "DREB", "REB", "AST", "STL",
                                           "BLK", "TOV", "PF", "PTS"]
    player['season']['headerRowRank'] = ["RANK_PG_MIN", "RANK_PG_FGM", "RANK_PG_FGA",
                                         "RANK_FG_PCT", "RANK_PG_FG3M", "RANK_PG_FG3A", "RANK_FG3_PCT",
                                         "RANK_PG_FTM", "RANK_PG_FTA", "RANK_FT_PCT", "RANK_PG_OREB",
                                         "RANK_PG_DREB", "RANK_PG_REB", "RANK_PG_AST", "RANK_PG_STL",
                                         "RANK_PG_BLK", "RANK_PG_TOV", "RANK_PG_PTS", "RANK_PG_EFF"]
    player['season']['headerCol'] = ['PerGame', 'Totals']
    player['season']['RegularSeason'] = {}
    player['season']['PostSeason'] = {}
    #
    for k in range(0, 2):
        for result in info[k]['resultSets']:
            # ------------------------------
            if result['name'] == 'CareerTotalsRegularSeason':
                if result['rowSet']:
                    quickpop(result['rowSet'][0], 3, 0)
                    player['career']['RegularSeason'].append(result['rowSet'][0])
                else:
                    player['career']['RegularSeason'].append([])
            elif result['name'] == 'CareerTotalsPostSeason':
                if result['rowSet']:
                    quickpop(result['rowSet'][0], 3, 0)
                    player['career']['PostSeason'].append(result['rowSet'][0])
                else:
                    player['career']['PostSeason'].append([])
            # ------------------------------
            elif result['name'] == 'SeasonTotalsRegularSeason':
                for row in result['rowSet']:
                    team = row.pop(4)
                    row.pop(3)
                    row.pop(2)
                    row.pop(0)
                    yearid = row.pop(0)
                    yearid = int(yearid[:4])
                    if yearid in player['season']['RegularSeason'].keys():
                        player['season']['RegularSeason'][yearid]['totals'].append(row)
                    else:
                        player['season']['RegularSeason'][yearid] = {'totals': [], 'rank': []}
                        player['season']['RegularSeason'][yearid]['totals'] = [row]
                    player['season']['RegularSeason'][yearid]['team'] = team
                    player['season']['RegularSeason'][yearid]['GameList'] = {}
            elif result['name'] == 'SeasonTotalsPostSeason':
                for row in result['rowSet']:
                    team = row.pop(4)
                    row.pop(3)
                    row.pop(2)
                    row.pop(0)
                    yearid = row.pop(0)
                    yearid = int(yearid[:4])
                    if yearid in player['season']['PostSeason'].keys():
                        player['season']['PostSeason'][yearid]['totals'].append(row)
                    else:
                        player['season']['PostSeason'][yearid] = {'totals': [], 'rank': []}
                        player['season']['PostSeason'][yearid]['totals'] = [row]
                    player['season']['PostSeason'][yearid]['team'] = team
                    player['season']['PostSeason'][yearid]['GameList'] = {}
            # ------------------------------
            elif result['name'] == 'SeasonRankingsRegularSeason':
                for row in result['rowSet']:
                    row.pop(7)
                    row.pop(6)
                    row.pop(5)
                    row.pop(4)
                    row.pop(3)
                    row.pop(2)
                    row.pop(0)
                    yearid = row.pop(0)
                    yearid = int(yearid[:4])
                    if yearid in player['season']['RegularSeason'].keys():
                        player['season']['RegularSeason'][yearid]['rank'].append(row)
                    else:
                        player['season']['RegularSeason'][yearid] = {'totals': [], 'rank': []}
                        player['season']['RegularSeason'][yearid]['rank'] = [row]
            elif result['name'] == 'SeasonRankingsPostSeason':
                for row in result['rowSet']:
                    row.pop(7)
                    row.pop(6)
                    row.pop(5)
                    row.pop(4)
                    row.pop(3)
                    row.pop(2)
                    row.pop(0)
                    yearid = row.pop(0)
                    yearid = int(yearid[:4])
                    if yearid in player['season']['PostSeason'].keys():
                        player['season']['PostSeason'][yearid]['rank'].append(row)
                    else:
                        player['season']['PostSeason'][yearid] = {'totals': [], 'rank': []}
                        player['season']['PostSeason'][yearid]['rank'] = [row]

    # 3) playerprofile
    f = open(entry[4] + '/playerprofile.json', 'r')
    info = json.loads(f.read())
    f.close()
    # -- compress
    graphtip = ['TOV', 'PTS', 'FGM', 'FGA', 'FG3M', 'FG3A', 'PF', 'BLK', 'STL', 'AST', 'REB']
    graphdir = {'TOV': 9, 'PTS': 10, 'FGM': 11, 'FGA': 12, 'FG3M': 13,
                'FG3A': 14, 'PF': 15, 'BLK': 16, 'STL': 17, 'AST': 18, 'REB': 19}
    graphext = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    for i in range(0, len(graphtip) * 2):
        gamelist = info[i]['resultSets'][5]
        if len(gamelist['headers']) > 4:
            for g in range(0, len(gamelist['rowSet'])):
                game = gamelist['rowSet'][g]
                # games before october should belong to previous season year
                if int(game[3][:2]) < 10:
                    yid = int(game[3][-4:]) - 1
                else:
                    yid = int(game[3][-4:])
                # get season type
                if i % 2 == 0:
                    season = 'RegularSeason'
                else:
                    season = 'PostSeason'
                # get game data
                gameid = int(game[2])
                typeid = graphdir[graphtip[int(i/2)]]
                if yid in player['season'][season].keys():
                    if gameid in player['season'][season][yid]['GameList'].keys():
                        player['season'][season][yid]['GameList'][gameid][typeid] = game[-1]
                    else:
                        player['season'][season][yid]['GameList'][gameid] = game[:-1]
                        player['season'][season][yid]['GameList'][gameid].extend(graphext)
                        player['season'][season][yid]['GameList'][gameid][typeid] = game[-1]
    player['season']['headerGame'] = info[0]['resultSets'][5]['headers']
    player['season']['headerGame'].extend(graphtip[1:])

    # 4) shotchart
    f = open(entry[4] + '/shotchart.json', 'r')
    info = json.loads(f.read())
    f.close()

    for i in range(0, len(info)):
        yearid = int(info[i]['parameters']['Season'][:4])
        # get season type
        if info[i]['parameters']['SeasonType'] == 'Regular Season':
            season = 'RegularSeason'
        else:
            season = 'PostSeason'
        # filter context measure
        if info[i]['parameters']['ContextMeasure'] == 'FGA':
            play = info[i]['resultSets'][0]
            lavg = info[i]['resultSets'][1]
            if yearid in player['season'][season].keys():
                player['season'][season][yearid]['shotchart'] = {}
                # play by play
                playHeader = play['headers'][1:]
                playHeader.pop(5)
                playHeader.pop(4)
                playHeader.pop(3)
                playHeader.pop(2)
                playResult = play['rowSet']
                for p in playResult:
                    p.pop(0)
                    p.pop(5)
                    p.pop(4)
                    p.pop(3)
                    p.pop(2)
                player['season'][season][yearid]['shotchart']['Details'] = {'header': playHeader, 'row': playResult}
                # league averages
                lavgHeader = lavg['headers'][1:]
                lavgResult = lavg['rowSet']
                for p in lavgResult:
                    p.pop(0)
                player['season'][season][yearid]['shotchart']['Averages'] = {'header': lavgHeader, 'row': lavgResult}

    # 5) save data
    fstr = json.dumps(player)
    f = open(entry[4] + '.json', 'w')
    f.write(fstr)
    f.close()

os.chdir('../')
