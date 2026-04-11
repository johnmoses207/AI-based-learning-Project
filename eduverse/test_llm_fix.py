import asyncio
import sys
import os

# Add backend to path to allow imports
sys.path.append(os.path.join(os.getcwd(), 'backend'))

from core.llm import llm_generate

async def test():
    print("Testing LLM generation...")
    try:
        # Simple JSON prompt since llm_generate expects JSON output
        result = await llm_generate("Return a simple JSON object with a greeting key says 'Hello Gemini 2.5'")
        print("Success!")
        print(result)
    except Exception as e:
        print(f"FAILED: {e}")

if __name__ == "__main__":
    asyncio.run(test())
