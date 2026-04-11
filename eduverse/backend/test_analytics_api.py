import requests
import json

try:
    res = requests.get("http://localhost:8000/api/analytics/progress/1")
    print("\nStatus Code:", res.status_code)
    data = res.json()
    print("Recent Scores Count:", len(data.get("recent_scores", [])))
    print("Average Score:", data.get("average_score"))
    print("Structure Check:", list(data.keys()))
except Exception as e:
    print("Error:", e)
