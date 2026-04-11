from core.llm import llm_generate
from agents.mcp_base import mcp_response

async def curriculum_agent(profile_data):
    """
    Generates a learning roadmap based on student profile.
    """
    prompt = f"""
    You are a Curriculum Architect.
    
    Student Profile:
    - Skill Level: {profile_data.get('skill', 'Beginner')}
    - Goal: {profile_data.get('goal', 'General')}
    - Time Check: {profile_data.get('hours', 1)} hours/day
    - Style: {profile_data.get('style', 'General')}

    Create a Roadmap with 4-6 specific Modules.
    RETURN ONLY VALID JSON:
    {{
      "decision": "Generated a {profile_data.get('goal')} roadmap",
      "confidence": 92,
      "data": {{
        "title": "Roadmap for {profile_data.get('goal')}",
        "modules": [
          {{
            "title": "Module Title",
            "description": "Short description",
            "duration": "1 week",
            "topics": ["Topic 1", "Topic 2"]
          }}
        ]
      }}
    }}
    """

    try:
        result = await llm_generate(prompt)
        # Handle cases where LLM might return flat structure or nested
        # We expect "data" key based on prompt, but let's be robust
        decision = result.get("decision", "Roadmap Generated")
        confidence = result.get("confidence", 85)
        roadmap_data = result.get("data", result)
        
        return mcp_response(
            agent="Curriculum Agent",
            status="Completed",
            decision=decision,
            confidence=confidence,
            data=roadmap_data
        )

    except Exception as e:
        print(f"Curriculum Error: {e}")
        return mcp_response(
            agent="Curriculum Agent",
            status="Failed",
            decision="Error generating roadmap",
            confidence=0,
            data={"error": str(e)}
        )
