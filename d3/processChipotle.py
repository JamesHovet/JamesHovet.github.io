import json
import re

tsv = open("chipotle.tsv", mode='r')

rawData = [line.strip().split('\t') for line in tsv][1:]

#order_id	quantity	item_name	choice_description	item_price

def findType(name):
    if re.search("Bowl", name):
        return "Bowl"
    elif re.search("Burrito", name):
        return "Burrito"
    elif re.search("Chips", name):
        return "Chips"
    elif re.search("Salad", name):
        return "Salad"
    elif re.search("Tacos", name):
        return "Tacos"
    elif re.search("Drink|Nectar|Izze|Water|Canned", name):
        return "Drink"
    else:
        return "Other"


def getContents(description,name):
    description = re.sub("\[|\]", "", description)

    out = description.strip().split(',')

    protein = re.search("Steak|Chicken|Carnitas|Barbacoa|Veggie", name)

    if protein != None:
        out.append(protein.group(0))

    return [item.strip() for item in out]

data = []

for line in rawData:
    print(line)
    order_id = line[0]
    item_name = line[2]
    choice_description = line[3]

    item = {}

    item["type"] = findType(item_name)
    item["contents"] = getContents(choice_description, item_name)
    item["order_id"] = order_id
    # item["name"] = item_name


    data.append(item)

jsonOutput = json.dumps(data)

jsonOutput = re.sub(r" \(Medium\)", "", jsonOutput)
jsonOutput = re.sub(r" \(Hot\)", "", jsonOutput)
jsonOutput = re.sub(r" \(Mild\)", "", jsonOutput)
jsonOutput = re.sub(r" \(Hot\)", "", jsonOutput)
jsonOutput = re.sub(r"(White )|(Brown )|(Cilantro-Lime )", "", jsonOutput)
jsonOutput = re.sub(r"Adobo-Marinated and Grilled ", "", jsonOutput)
jsonOutput = re.sub(r"Braised ", "", jsonOutput)
jsonOutput = re.sub(r"Veggies", "Vegetables", jsonOutput)
jsonOutput = re.sub(r"Veggie", "Fajita Vegetables", jsonOutput)
jsonOutput = re.sub(r"Fresh Tomato Salsa", "Fresh Tomato", jsonOutput)
jsonOutput = re.sub(r"Fresh Tomato", "Fresh Tomato Salsa", jsonOutput)
jsonOutput = re.sub(r"\-", " ", jsonOutput)
# jsonOutput = re.sub(r" Salsa", "", jsonOutput)
jsonOutput = re.sub(r"Corn", " ", jsonOutput)
jsonOutput = re.sub(r"Roasted Chili  ", "Tomatillo Red Chili", jsonOutput)

print(jsonOutput)

jsonFile = open("chipotleJson.json", mode='w')
jsonFile.write(jsonOutput)
jsonFile.close()
