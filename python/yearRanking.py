import requests

# link to all player info
for y in range(1946, 2016):
    year = str(y)
    year += '-' + str(y+1)[-2:]
    url = 'http://stats.nba.com/stats/leagueleaders?LeagueID=00&PerMode=PerGame&StatCategory=PTS&Season=' + \
          year + '&SeasonType=Regular+Season&Scope=RS'

    # request data
    response = requests.get(url, headers={'User-Agent': 'Chrome/39.0.2171.95'})

    # parse data
    f = open(str(year) + '-ranking.json', 'w')
    f.write(response.content)
    f.close()
