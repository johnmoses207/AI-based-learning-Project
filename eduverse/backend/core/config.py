import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = "sqlite:///./eduverse.db"
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
