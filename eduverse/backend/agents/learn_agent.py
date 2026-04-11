from core.llm import llm_generate
from agents.mcp_base import mcp_response
import re

async def learn_agent(topic: str, style: str = "General"):
    prompt = f"""
    You are a Learning Assistant. Teach "{topic}" using a {style} style.

    RETURN ONLY VALID JSON matching this exact structure:
    {{
      "decision": "Teaching {topic}",
      "confidence": 95,
      "data": {{
        "topic": "{topic}",
        "markdown_content": "A detailed point-wise explanation of {topic} in Markdown format (use **bold** for key terms).",
        "flashcards": [
            {{ "front": "Key concept 1", "back": "Explanation 1" }},
            {{ "front": "Key concept 2", "back": "Explanation 2" }}
        ],
        "mermaid_diagram": "graph TD; A[Concept] --> B[Detail];",
        "video_recommendations": [
            {{ "title": "Learn {topic}", "url": "https://www.youtube.com/results?search_query={topic.replace(' ', '+')}" }}
        ]
      }}
    }}

    IMPORTANT RULES:
    1. "mermaid_diagram" must be a RAW STRING. Do NOT include ```mermaid``` or backticks.
    2. Ensure JSON is valid. Escape quotes inside strings.
    """
    
    try:
        result = await llm_generate(prompt)
        
        # Post-processing to clean mermaid syntax if LLM ignored instructions
        data = result.get("data", result)
        if "mermaid_diagram" in data:
            raw_mermaid = data["mermaid_diagram"]
            # Remove markdown fences if present
            raw_mermaid = re.sub(r"^```mermaid\s*", "", raw_mermaid)
            raw_mermaid = re.sub(r"```$", "", raw_mermaid)
            data["mermaid_diagram"] = raw_mermaid.strip()

        return mcp_response(
            agent="Learning Agent",
            status="Completed",
            decision=result.get("decision", f"Teached {topic}"),
            confidence=result.get("confidence", 90),
            data=data
        )
    except Exception as e:
        return mcp_response(
            agent="Learning Agent",
            status="Failed",
            decision="Error teaching topic",
            confidence=0,
            data={"error": str(e)}
        )
