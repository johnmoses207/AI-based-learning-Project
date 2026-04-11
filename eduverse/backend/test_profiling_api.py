import requests
import json

url = "http://localhost:8000/api/profiling"
payload = {
    "skill": "Python",
    "goal": "Data Science",
    "hours": 5,
    "style": "Visual"
}

try:
    res = requests.post(url, json=payload)
    print("\nStatus Code:", res.status_code)
    try:
        data = res.json()
        print("Response:", json.dumps(data, indent=2))
    except:
        print("Raw Response:", res.text)
except Exception as e:
    print("Error:", e)
