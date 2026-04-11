from core.llm import llm_generate
from agents.mcp_base import mcp_response
from agents.memory_agent import get_user_context

async def mentor_agent(user_id: int, message: str):
    """
    Mentor Agent: Uses long-term memory to provide personalized guidance.
    """
    
    # 1. Retrieve Context
    context = get_user_context(user_id)
    
    # 2. Build Prompt
    prompt = f"""
    You are a wise and encouraging Academic Mentor. 
    You have access to the student's recent learning history below.
    
    User ID: {user_id}
    
    {context}
    
    Student Message: "{message}"
    
    Your Goal:
    - Answer the student's question.
    - Reference their past achievements or struggles if relevant (Data in Context).
    - Be concise, motivating, and personalized.
    
    RETURN ONLY VALID JSON:
    {{
      "decision": "Responded to Student",
      "confidence": 100,
      "data": {{
        "message": "Your personalized response here."
      }}
    }}
    """
    
    # 3. Generate Response
    try:
        result = await llm_generate(prompt)
        data = result.get("data", result)
        
        return mcp_response(
            agent="Mentor Agent", 
            status="Completed", 
            decision="Replied", 
            confidence=100, 
            data=data
        )
    except Exception as e:
        return mcp_response(agent="Mentor Agent", status="Failed", decision="Error", confidence=0, data={"error": str(e)})
