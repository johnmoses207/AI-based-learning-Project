from core.llm import llm_generate
import json

class LabAgent:
    def __init__(self):
        pass

    async def generate_challenge(self, topic: str, difficulty: str = "Beginner"):
        prompt = f"""
        You are a Lab Agent operating inside a Multi-Agent Control Plane (MCP).

        MODEL: gemini-2.0-flash  
        MODE: deterministic, structured, production-safe  

        STRICT RULES:
        1. DO NOT explain anything
        2. DO NOT include markdown
        3. DO NOT include commentary
        4. OUTPUT MUST BE VALID JSON ONLY
        5. FOLLOW THE EXACT SCHEMA
        6. Assume this output will be auto-graded

        --------------------------------------------------
        TASK CONTEXT:
        Topic: {topic}
        Learner Level: {difficulty}
        Roadmap Position: Week 1
        --------------------------------------------------

        OBJECTIVE:
        Generate a practical coding lab that tests applied understanding.

        REQUIREMENTS:
        - One clear problem statement
        - Input/output specification
        - Constraints
        - 3 test cases
        - Evaluation rubric
        - Expected solution outline (high-level, not full code)
        - Difficulty score (1–10)

        RETURN JSON IN THIS EXACT FORMAT:

        {{
          "agent": "Lab Agent",
          "status": "Active",
          "lab": {{
            "title": "Title",
            "problem_statement": "Description...",
            "input_spec": "...",
            "output_spec": "...",
            "constraints": ["..."],
            "test_cases": [
              {{ "input": "...", "output": "..." }}
            ],
            "evaluation_rubric": [
              {{ "criteria": "...", "weight": 10 }}
            ],
            "solution_outline": "...",
            "starter_code": "def solution():\\n    pass" 
          }},
          "difficulty": 5,
          "confidence": 100
        }}
        """
        
        try:
            data = await llm_generate(prompt)
            
            # Check for error in llm_generate response
            if "error" in data:
                print(f"Lab Agent LLM Error: {data.get('error')}")
                raise Exception(data.get("decision", "Unknown LLM Error"))

            # Adapt new format to frontend expectations if necessary, 
            # or just return 'lab' part if frontend expects specific keys.
            # Frontend expects: title, description, starter_code, test_cases, hint
            # The new prompt returns 'lab' object. I will map it to keep frontend working.
            lab_data = data.get("lab", {})
            return {
                "title": lab_data.get("title", "Untitled Challenge"),
                "description": lab_data.get("problem_statement", "No description provided."),
                "starter_code": lab_data.get("starter_code", "def solution():\n    pass"),
                "test_cases": lab_data.get("test_cases", []),
                "hint": lab_data.get("solution_outline", "No hint provided"),
                "xp_reward": 50 + (data.get("difficulty", 1) * 10)
            }
        except Exception as e:
            print(f"Lab Agent Error: {e}")
            raise e

    async def generate_quiz(self, topic: str, difficulty: str = "Beginner"):
        prompt = f"""
        You are a Lab Agent. Create a multiple-choice quiz question for:
        Topic: {topic}
        Difficulty: {difficulty}

        RETURN JSON ONLY:
        {{
            "type": "quiz",
            "question": "The question text",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": "Option A",
            "explanation": "Why it is correct",
            "xp_reward": 50
        }}
        """
        try:
            data = await llm_generate(prompt)
             # Check for error
            if "error" in data:
                 raise Exception(data.get("decision", "Unknown LLM Error"))
            
            return data
        except Exception as e:
            print(f"Lab Quiz Error: {e}")
            raise e

lab_agent = LabAgent()
