import requests

# link to all player info
for y in range(1946, 2016):
    year = str(y)
    year += '-' + str(y+1)[-2:]
    url = 'http://stats.nba.com/stats/leaguedashplayerstats?GameScope=&PlayerExperience=&PlayerPosition=&' \
          'StarterBench=&MeasureType=Scoring&PerMode=Totals&PlusMinus=Y&PaceAdjust=Y&Rank=Y&Season=' + year + \
          '&SeasonType=Regular+Season&Outcome=&Location=&Month=0&SeasonSegment=&DateFrom=&DateTo&OpponentTeamID=0&' \
          'VsConference=&VsDivision=&GameSegment=&Period=0&LastNGames=0'

    # request data
    response = requests.get(url, headers={'User-Agent': 'Chrome/39.0.2171.95'})

    # parse data
    f = open(str(year) + '-ranking.json', 'w')
    f.write(response.content)
    f.close()
