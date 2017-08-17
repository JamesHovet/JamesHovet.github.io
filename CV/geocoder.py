import requests
import json

API_KEY = "AIzaSyAEzJWmWAvKCwhkaBXAzCnDFPBXmo2Jc1g"

addrList = ["697 West End Ave, New York City, NY, 10025, United States", "1600 Pennsylvania Ave, Washington DC, United States"]

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


    tmp = {"type" : "Feature",
            "geometry" : {
                "type" : "Point",
                "coordinates" : [lng,lat]
            },
            "properties" : {
                "isUSA" : isUSA
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
