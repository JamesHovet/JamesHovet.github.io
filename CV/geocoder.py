import requests

API_KEY = "AIzaSyAEzJWmWAvKCwhkaBXAzCnDFPBXmo2Jc1g"

addr = "697 West End Ave, New York City, NY, 10025, United States"

addr = addr.replace(" ", "+")

URL = "https://maps.googleapis.com/maps/api/geocode/json?address=" + addr + "&key=" + API_KEY


r = requests.get(URL)

json = r.json()
