import requests
import json

# link to all player info
url = 'http://stats.nba.com/stats/commonallplayers?LeagueID=00&Season=2016-17&IsOnlyCurrentSeason=0'

# request data
response = requests.get(url, headers={'User-Agent': 'Chrome/39.0.2171.95'})

# parse data
rawData = json.loads(response.content)

# retrieve data contents
data = rawData['resultSets'][0]
data.pop('name')

# change data format
data['headers'] = ['playerID', 'Name', 'FromYear', 'ToYear', 'Code', 'Historical']
for i in range(0, len(data['rowSet'])):

    # remove data
    for _ in range(0, 6):
        data['rowSet'][i].pop()
    data['rowSet'][i].pop(3)
    data['rowSet'][i].pop(1)

    # change data style
    names = data['rowSet'][i][1].split(',')
    data['rowSet'][i][2] = int(data['rowSet'][i][2]) # from year
    data['rowSet'][i][3] = int(data['rowSet'][i][3]) # to year

    # check player historical check player code
    if data['rowSet'][i][4] is None:
        data['rowSet'][i].append(True)
        data['rowSet'][i][4] = data['rowSet'][i][1].replace(' ', '_').replace('.', '').lower()
    else:
        if data['rowSet'][i][4].find('HISTADD_')==0:
            data['rowSet'][i][4] = data['rowSet'][i][4][8:].lower()
            data['rowSet'][i].append(True)
        else:
            data['rowSet'][i][4] = data['rowSet'][i][4].lower()
            data['rowSet'][i].append(False)

# write into JSON file
string = json.dumps(data)
f = open('playerID.json', 'w+')
f.write(string)
f.close()



