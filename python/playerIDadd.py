import json
import csv
import os

f = open('../data/playerindex.json', 'r+')
playerInfo = json.loads(f.read())
f.close()

# print allstar
filenames = os.listdir('../data/player')
for i in range(0, len(playerInfo['rowSet'])):
    single = playerInfo['rowSet'][i]
    print single[4]
    f = open('../data/player/' + single[4] + '.json', 'r+')
    player = json.loads(f.read())
    f.close()

    info = player['info']
    info.pop('DLEAGUE', None)
    info.pop('FIRST_NAME', None)
    info.pop('LAST_NAME', None)
    info.pop('FROM_YEAR', None)
    info.pop('TO_YEAR', None)
    info.pop('PERSON_ID', None)
    info.pop('PIE', None)
    info.pop('ROSTERSTATUS', None)
    info.pop('SCHOOL', None)
    info.pop('JERSEY', None)
    info.pop('COUNTRY', None)
    info.pop('BIRTHDATE', None)

    playerInfo['rowSet'][i].append(info)

    # print playerInfo['rowSet'][i]

f = open('playerID.json', 'w')
f.write(json.dumps(playerInfo, separators=(',', ':')))
f.close()



