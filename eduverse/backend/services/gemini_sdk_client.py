
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

_api_key = os.getenv("GEMINI_API_KEY")
_client = genai.Client(api_key=_api_key) if _api_key else None


class _ModelWrapper:
    """Thin wrapper so llm.py can call model.generate_content_async(prompt)."""

    def __init__(self, model_name: str):
        self.model_name = model_name

    async def generate_content_async(self, prompt: str):
        if _client is None:
            raise RuntimeError("GEMINI_API_KEY not set")
        response = await _client.aio.models.generate_content(
            model=self.model_name,
            contents=prompt,
        )
        return response


def get_gemini_model(model_name: str = "gemini-2.0-flash"):
    """Return a model wrapper compatible with llm.py's generate_content_async calls."""
    return _ModelWrapper(model_name=model_name)


def generate_agent_response(config, user_message: str, history=None) -> str:
    """Synchronous agent chat helper used by routes/agents.py."""
    import asyncio
    if _client is None:
        return "Error: GEMINI_API_KEY not set"
    system_prompt = getattr(config, "system_prompt", "") or ""
    full_prompt = f"{system_prompt}\n\nUser: {user_message}" if system_prompt else user_message
    try:
        response = asyncio.get_event_loop().run_until_complete(
            _client.aio.models.generate_content(
                model="gemini-2.0-flash",
                contents=full_prompt,
            )
        )
        return response.text
    except Exception as e:
        return f"Error: {e}"


def generate_gemini_response(prompt: str) -> str:
    """Simple synchronous response helper used by routes/learning.py."""
    import asyncio
    if _client is None:
        return "Error: GEMINI_API_KEY not set"
    try:
        response = asyncio.get_event_loop().run_until_complete(
            _client.aio.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
        )
        return response.text
    except Exception as e:
        return f"Error: {e}"
