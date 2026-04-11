from core.llm import llm_generate
from agents.mcp_base import mcp_response

async def profiling_agent(data):
    prompt = f"""
    You are a Profiling Agent.

    RETURN ONLY VALID JSON:
    {{
      "decision": "one sentence learner profile",
      "confidence": number
    }}

    Skill: {data.get("skill", "Unknown")}
    Goal: {data.get("goal", "General Learning")}
    Hours: {data.get("hours", 1)}
    Style: {data.get("style", "Generarl")}
    """

    try:
        result = await llm_generate(prompt)
        
        # Validation
        if "decision" not in result or "confidence" not in result:
             # If keys missing (e.g. error from llm_generate), handle it
             decision = result.get("decision", "Profiling completed (fallback)")
             confidence = result.get("confidence", 50)
             if "error" in result:
                 decision = f"AI Error: {result['error']}"
        else:
             decision = result["decision"]
             confidence = result["confidence"]

        return mcp_response(
            agent="Profiling Agent",
            status="Completed",
            decision=decision,
            confidence=confidence
        )
    except Exception as e:
        print(f"Profiling Agent Critical Error: {e}")
        return mcp_response(
            agent="Profiling Agent",
            status="Failed",
            decision=f"System Error: Could not generate profile. Details: {str(e)}",
            confidence=0,
            data={"error": str(e)}
        )
