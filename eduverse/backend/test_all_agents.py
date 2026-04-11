import requests
import json
import asyncio

BASE_URL = "http://localhost:8000/api"

def test_endpoint(name, url, payload):
    print(f"\n--- Testing {name} ---")
    print(f"URL: {url}")
    try:
        res = requests.post(url, json=payload)
        print(f"Status: {res.status_code}")
        if res.status_code == 200:
            data = res.json()
            # print(f"Response Preview: {str(data)[:200]}...")
            print("Success!")
        else:
            print(f"Failed: {res.text}")
    except Exception as e:
        print(f"Error: {e}")

# 1. Curriculum
test_endpoint(
    "Curriculum Agent", 
    f"{BASE_URL}/curriculum", 
    {"skill": "Python", "goal": "Web Dev", "hours": 2, "style": "Project-based"}
)

# 2. Learning
test_endpoint(
    "Learning Agent", 
    f"{BASE_URL}/learn/topic", 
    {"topic": "FastAPI", "style": "Concise"}
)

# 3. Assessment (Quiz)
test_endpoint(
    "Assessment Agent (Quiz)", 
    f"{BASE_URL}/assessment/quiz", 
    {"topic": "Python Basics"}
)

# 4. Mentor
test_endpoint(
    "Mentor Agent", 
    f"{BASE_URL}/mentor", 
    {"user_id": 1, "message": "How do I start Python?"}
)
