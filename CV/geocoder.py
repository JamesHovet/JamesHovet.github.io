import requests
import json

API_KEY = "AIzaSyAEzJWmWAvKCwhkaBXAzCnDFPBXmo2Jc1g"

addrList = ["697 West End Ave, New York City, NY, 10025, United States", "1600 Pennsylvania Ave, Washington DC, United States", "86 Douglas Road Needham, MA 02492","1600+Amphitheatre+Parkway,+Mountain+View,+CA", "98 West End Ave New York City NY 10025 United States"]

output = {
    "type" : "FeatureCollection",
    "features" : []
    }


# addr = "697 West End Ave, New York City, NY, 10025, United States"

for addr in addrList:

    addr = addr.replace(" ", "+")

    URL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addr + "&key=" + API_KEY


    r = requests.get(URL)

    resultJson = r.json()

    lat = resultJson["results"][0]["geometry"]["location"]["lat"]
    lng = resultJson["results"][0]["geometry"]["location"]["lng"]

    isUSA = "USA" in resultJson["results"][0]["formatted_address"]

    if isUSA:
        components = resultJson["results"][0]["address_components"]

        state = None

        for component in components:
            if "administrative_area_level_1" in component["types"]:
                state = component["short_name"]
                break


    tmp = {"type" : "Feature",
            "geometry" : {
                "type" : "Point",
                "coordinates" : [lng,lat]
            },
            "properties" : {
                "isUSA" : isUSA,
                "state" : state
            }
        }

    output["features"].append(tmp)


outputFile = open("./testGeoJson.geojson", mode='w')
outputFile.write(json.dumps(output))
outputFile.close()

"""
{
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [103.0, 0.0]
        },
        "properties": {
            "prop0": "value0"
        }
    }, {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [102.0, 0.5]
        },
        "properties": {
            "prop0": "value0"
        }
    },{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [101.0, 1.0]
        },
        "properties": {
            "prop0": "value0"
        }
    }]
}
"""
