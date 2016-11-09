import urllib
import os
import json


def mkdir(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)


# open file
f = open('playerID-full.json', 'r')
data = f.read()
f.close()

# JSON parser
data = json.loads(data)

# load player
mkdir('playerIcon')

# make all paths
os.chdir('playerIcon')
for entry in data['rowSet']:
    playerid = entry[0]
    print(str(playerid) + ' ' + entry[4])
    urllib.urlretrieve('http://stats.nba.com/media/players/230x185/' + str(playerid) + '.png', str(playerid) + '.png')
