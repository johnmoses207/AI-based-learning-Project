import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv('backend/.env')
api_key = os.getenv('GEMINI_API_KEY') or os.getenv("GOOGLE_API_KEY")

if not api_key:
    with open("backend/models_found.txt", "w", encoding="utf-8") as f:
        f.write("ERROR: No API Key found")
    exit(1)

genai.configure(api_key=api_key)

found_models = []
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            found_models.append(m.name)
except Exception as e:
    with open("backend/models_found.txt", "w", encoding="utf-8") as f:
        f.write(f"ERROR: {str(e)}")
    exit(1)

with open("backend/models_found.txt", "w", encoding="utf-8") as f:
    f.write("FOUND MODELS:\n")
    for m in found_models:
        f.write(f"{m}\n")
