from google import genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
print(f"API Key present: {bool(api_key)}")

if api_key:
    client = genai.Client(api_key=api_key)
    model_name = "gemini-2.0-flash"
    print(f"Testing model: {model_name}")
    try:
        response = client.models.generate_content(
            model=model_name,
            contents="Hello"
        )
        print("Success with output:", response.text[:50])
    except Exception as e:
        print(f"Error: {e}")
else:
    print("API Key not found.")
