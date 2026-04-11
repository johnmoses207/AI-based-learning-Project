from core.llm import llm_generate
from agents.mcp_base import mcp_response
from agents.memory_agent import store_memory

async def evaluation_agent(action: str, topic: str = None, submission: dict = None, user_id: int = 1):
    """
    Handles both 'generate_quiz' and 'evaluate_submission'.
    """

    if action == "generate_quiz" and topic:
        prompt = f"""
        You are an Evaluation Agent. Create a short quiz (3 questions) for the topic: "{topic}".
        
        RETURN ONLY VALID JSON:
        {{
          "decision": "Quiz Generated",
          "confidence": 95,
          "data": {{
            "topic": "{topic}",
            "quiz": [
                {{
                    "id": 1,
                    "question": "Question text?",
                    "options": ["A", "B", "C", "D"],
                    "correct_answer": "Correct Option Text"
                }}
            ]
          }}
        }}
        """
        try:
            result = await llm_generate(prompt)
            data = result.get("data", result)
            return mcp_response(
                agent="Evaluation Agent", 
                status="Completed", 
                decision="Quiz Ready", 
                confidence=95, 
                data=data
            )
        except Exception as e:
            return mcp_response(agent="Evaluation Agent", status="Failed", decision="Error", confidence=0, data={"error": str(e)})

    elif action == "evaluate_submission" and submission:
        # Fallback grading logic in case LLM fails
        correct_count = 0
        total = len(submission.get("answers", []))
        for ans in submission.get("answers", []):
             if ans.get("selected") == ans.get("correct"):
                 correct_count += 1
        
        calculated_score = f"{correct_count}/{total}"
        calculated_percentage = int((correct_count / total) * 100) if total > 0 else 0

        prompt = f"""
        You are a Teacher. Grade this submission.
        
        Calculated Score: {calculated_score} ({calculated_percentage}%)

        Submission: {submission}

        RETURN ONLY VALID JSON:
        {{
          "decision": "Grading Complete",
          "confidence": 98,
          "data": {{
             "score": "{calculated_score}",
             "percentage": {calculated_percentage},
             "feedback": "Brief helpful feedback on performance."
          }}
        }}
        """
        try:
            result = await llm_generate(prompt)
            data = result.get("data", result)
            
            # Ensure critical keys exist
            if "score" not in data: data["score"] = calculated_score
            if "percentage" not in data: data["percentage"] = calculated_percentage
            if "feedback" not in data: data["feedback"] = "Grading completed."

            # [MEMORY INTEGRATION] Store the result
            store_memory(
                user_id=user_id,
                event_type="assessment",
                data={
                    "topic": submission.get("topic", "Unknown"),
                    "score": data["score"],
                    "percentage": data["percentage"],
                    "feedback": data["feedback"]
                }
            )

            return mcp_response(
                agent="Evaluation Agent", 
                status="Completed", 
                decision="Graded", 
                confidence=98, 
                data=data
            )
        except Exception as e:
            # Return Calculated Score if LLM fails
            
            # [MEMORY INTEGRATION] Store fallback result
            store_memory(
                user_id=user_id,
                event_type="assessment",
                data={
                    "topic": submission.get("topic", "Unknown"),
                    "score": calculated_score,
                    "percentage": calculated_percentage,
                    "feedback": "Auto-graded (Fallback)"
                }
            )

            return mcp_response(
                agent="Evaluation Agent", 
                status="Completed (Fallback)", 
                decision="Graded Manually", 
                confidence=100, 
                data={
                    "score": calculated_score,
                    "percentage": calculated_percentage,
                    "feedback": f"Auto-graded: {correct_count} out of {total} correct. (LLM Feedback unavailable)"
                }
            )

    return mcp_response(agent="Evaluation Agent", status="Failed", decision="Invalid Action", confidence=0, data={})
