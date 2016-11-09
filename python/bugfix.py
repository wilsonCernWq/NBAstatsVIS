import json
import os

filenames = os.listdir('data')
os.chdir('data')
for fname in filenames:
    print fname
    f = open(fname, 'r+')
    player = json.loads(f.read())
    f.close()

    ext = player['season']['headerGame'].pop()
    player['season']['headerGame'].extend(ext)

    f = open(fname, 'w')
    f.write(json.dumps(player))
    f.close()





