import json

f = open("CSV_Export.csv", mode='r')

plants = {}

for l in f:
    plant, pollinator = tuple(l.strip().split(','))

    if plant not in plants:
        plants[plant] = {}

    if pollinator not in plants[plant]:
        plants[plant][pollinator] = 1
    else:
        plants[plant][pollinator] += 1

print(json.dumps(plants))
