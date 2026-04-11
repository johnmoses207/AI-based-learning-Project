
print("Starting import debug...")
try:
    import os
    print("Imported os")
    from google import genai
    print("Imported google.genai")
    from dotenv import load_dotenv
    print("Imported dotenv")
    import time
    print("Imported time")
    
    print("Testing gemini_client import directly...")
    import services.gemini_client
    print("Imported services.gemini_client success!")
    
    print("Testing app import...")
    import app
    print("Imported app success!")
except Exception as e:
    import traceback
    traceback.print_exc()
