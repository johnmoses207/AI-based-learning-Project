import json
from services.gemini_sdk_client import get_gemini_model

async def llm_generate(prompt: str) -> dict:
    """
    Gemini JSON-only generator for MCP agents using unified client with Multi-Model Fallback
    """
    import asyncio
    import logging

    # Configure logger for this module
    logger = logging.getLogger("uvicorn.error")
    
    # List of models to try in order of preference
    # Updated based on available models and user preferences
    models_to_try = [
        "gemini-2.5-flash",                     # Newest/Fastest
        "gemini-2.0-flash",                     # Standard 2.0
        "gemini-2.0-flash-lite-preview-02-05", # Fast Preview
        "gemini-2.0-flash-exp",                 # Experimental
        "gemini-2.5-pro",                       # High Quality Fallback
    ]
    
    max_retries_per_model = 3
    base_delay = 5 # Start with smaller delay, increase exponentially
    
    last_error = None
    errors_log = []

    for model_name in models_to_try:
        model = get_gemini_model(model_name=model_name)
        # Only log info for the first model attempt or if switching models
        if model_name == models_to_try[0] or len(errors_log) > 0:
            logger.info(f"🔄 LLM: Trying model {model_name}...")

        for attempt in range(max_retries_per_model):
            try:
                response = await model.generate_content_async(prompt)
                text = response.text.strip()
                
                # 🧹 Remove markdown fences safely
                if text.startswith("```"):
                    text = text.replace("```json", "").replace("```", "").strip()

                # ✅ Parse JSON strictly
                return json.loads(text)

            except Exception as e:
                last_error = str(e)
                # Helper to check for specific error types
                error_l = last_error.lower()
                is_quota = "429" in last_error or "quota" in error_l or "resource exhausted" in error_l or "overloaded" in error_l
                is_not_found = "404" in last_error and "not found" in error_l

                logger.warning(f"⚠️ Error with {model_name} (Attempt {attempt+1}/{max_retries_per_model}): {last_error[:200]}...")
                
                # If 404 (Model not found), break inner loop and try next model immediately
                if is_not_found:
                    logger.error(f"❌ Model {model_name} not found. Switching...")
                    errors_log.append(f"{model_name}: 404 Not Found")
                    break # Break retry loop, go to next model
                
                # If Quota/Rate Limit
                if is_quota:
                     if attempt < max_retries_per_model - 1:
                         # Exponential backoff: 5, 10, 20...
                         sleep_time = base_delay * (2 ** attempt)
                         logger.warning(f"⏳ Quota Hit. Sleeping {sleep_time}s...")
                         await asyncio.sleep(sleep_time)
                         continue
                     else:
                         # If run out of retries for this model, log and move to next model
                         errors_log.append(f"{model_name}: Quota Exceeded")
                
                else:
                    # Log other errors
                    errors_log.append(f"{model_name} (Att {attempt+1}): {last_error[:50]}...")
    
    # If all models failed
    logger.error(f"❌ LLM System Error: All models failed. Errors: {errors_log}")
    return {
        "decision": f"LLM System Error: All models failed. Errors: {'; '.join(errors_log)}",
        "confidence": 0,
        "error": last_error
    }
