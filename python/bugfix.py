import json
import csv
import os


# def read_all_star():
#     myallstar = {}
#     first = True
#     with open('../data/allstar.csv', 'rb') as csvfile:
#         csvreader = csv.reader(csvfile, delimiter=',', quotechar='|')
#         for row in csvreader:
#             if first:
#                 first = False
#                 continue
#             else:
#                 key = row[0].lower().replace(' ', '_')
#                 myallstar[key] = {}
#                 myallstar[key]['appearance'] = row[1]
#                 myallstar[key]['yearList'] = []
#                 lists = row[2].strip().split('and')
#                 for entry in lists:
#                     arr = entry.strip().split(' to ')
#                     # print arr, row
#                     if len(arr) == 2:
#                         myallstar[key]['yearList'].extend(range(int(arr[0]), int(arr[1])+1))
#                     else:
#                         # print arr[0]
#                         myallstar[key]['yearList'].append(int(arr[0]))
#     return myallstar

# preparation
# allstar = read_all_star()

# print allstar
filenames = os.listdir('../data/player')
# os.chdir('../data/player')
for fname in filenames:
    print fname
    f = open('../data/player/' + fname, 'r+')
    player = json.loads(f.read())
    f.close()

    # BUG 1
    # ext = player['season']['headerGame'].pop()
    # player['season']['headerGame'].extend(ext)
    #
    # BUG 2
    # if player['info']['ALL_STAR'] < 1:
    #     player['info']['PIE'] = player['info']['ALL_STAR']
    #     player['info']['ALL_STAR'] = None
    #
    #     name = player['info']['FIRST_NAME'].lower() + '_' + player['info']['LAST_NAME'].lower()
    #     # print allstar.keys()
    #     if str(name) in allstar.keys():
    #         player['info']['ALL_STAR'] = allstar[name]
    #     else:
    #         print fname
    #         player['info']['ALL_STAR'] = 0
    #
    # BUG 3
    # if 'PIE' not in player['info'].keys():
    #     player['info']['PIE'] = None
    #
    # BUG4
    # player['career']['headerRow'].pop(0)  # remove GP
    # player['career']['headerRow'].pop(0)  # remove GS
    # player['career']['header'] = player['career']['headerRow']
    # player['career'].pop('headerCol', None)
    # player['career'].pop('headerRow', None)
    # # -- regular season
    # temp = player['career']['RegularSeason']
    # if len(temp[0]) > 0:
    #     gp = temp[0].pop(0)
    #     gs = temp[0].pop(0)
    #     player['career']['RegularSeason'] = {
    #         'GP': gp,
    #         'GS': gs,
    #         'PerGame': temp[0]
    #     }
    # else:
    #     player['career']['RegularSeason'] = {}
    # # post season
    # temp = player['career']['PostSeason']
    # if len(temp[0]) > 0:
    #     gp = temp[0].pop(0)
    #     gs = temp[0].pop(0)
    #     player['career']['PostSeason'] = {
    #         'GP': gp,
    #         'GS': gs,
    #         'PerGame': temp[0]
    #     }
    # else:
    #     player['career']['PostSeason'] = {}
    # print player['career']['PostSeason']
    #
    # BUG 5
    # player['season'].pop('headerCol', None)
    # for keyname in ['RegularSeason', 'PostSeason']:
    #     # print keyname
    #     for k in player['season'][keyname].keys():
    #         # totals -> data
    #         temp = player['season'][keyname][k]['totals']
    #         if len(temp) > 0:
    #             player['season'][keyname][k]['data'] = temp[0]
    #         else:
    #             player['season'][keyname][k]['data'] = []
    #         # rank
    #         temp = player['season'][keyname][k]['rank']
    #         # print temp
    #         if len(temp) == 2:
    #             player['season'][keyname][k]['rank'] = {
    #                 'PerGame': temp[0],
    #                 'Totals': temp[1]
    #             }
    #         elif len(temp) == 1:
    #             player['season'][keyname][k]['rank'] = {
    #                 'PerGame': temp[0],
    #                 'Totals': []
    #             }
    #         else:
    #             player['season'][keyname][k]['rank'] = {}
    #         # clean old key name
    #         player['season'][keyname][k].pop('totals', None)
    #         # print player['season'][keyname][k]['data']
    #         # print player['season'][keyname][k]['rank']
    #         # input()
    #
    # BUG 6
    # player['season']['headerData'] = player['season']['headerRowTotals']
    # player['season']['headerRank'] = player['season']['headerRowRank']
    # player['season'].pop('headerRowTotals', None)
    # player['season'].pop('headerRowRank', None)
    #
    # player['season']['headerGame'].pop(6)
    # player['season']['headerGame'].pop(1)
    # for keyname in ['RegularSeason', 'PostSeason']:
    #     for k in player['season'][keyname].keys():
    #         if 'GameList' in player['season'][keyname][k].keys():
    #             for g in player['season'][keyname][k]['GameList'].keys():
    #                 player['season'][keyname][k]['GameList'][g].pop(6)
    #                 player['season'][keyname][k]['GameList'][g].pop(1)
    #                 # print player['season'][keyname][k]['GameList'][g]

    player['season']['headerGame'] = ["PLAYER_ID", "GAME_ID", "GAME_DATE", "TEAM_ABBREVIATION", "TEAM_NAME",
                                      "VS_TEAM_ABBREVIATION", "VS_TEAM_NAME", "TOV", "PTS", "FGM", "FGA", "FG3M",
                                      "FG3A", "PF", "BLK", "STL", "AST", "REB"]

    f = open('./player/' + fname, 'w')
    f.write(json.dumps(player, separators=(',', ':')))
    f.close()


