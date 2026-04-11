import json
from core.llm import llm_generate

class AssessmentAgent:
    def __init__(self):
        self.name = "Assessment Agent"
        self.system_prompt = """You are an expert Examiner. 
            Your goal is to create a high-stakes, comprehensive certification exam.
            Ensure questions are difficult, fair, and cover the entire provided curriculum.
            Output STRICT JSON only. No markdown formatting."""

    async def query(self, prompt):
        full_prompt = f"{self.system_prompt}\n\n{prompt}"
        # llm_generate returns a dict
        return await llm_generate(full_prompt)

    async def generate_exam(self, module_name, roadmap_context, num_questions=100):
        """
        Generates an exam with 'num_questions' questions.
        """
        questions = []
        batch_size = 20
        
        # Calculate batches needed (ceil division)
        num_batches = (num_questions + batch_size - 1) // batch_size
        
        print(f"Generating {num_questions} questions in {num_batches} batches...")
        
        for i in range(num_batches):
            # Calculate questions for this batch (might be less for last batch)
            current_batch_size = min(batch_size, num_questions - len(questions))
            if current_batch_size <= 0: break

            prompt = f"""
            Create a batch of {current_batch_size} unique Multiple Choice Questions (MCQs) for the module: '{module_name}'.
            Context from Roadmap: {json.dumps(roadmap_context)}
            
            This is Batch {i+1} of {num_batches}. Ensure these questions are distinct from previous topics if possible.
            
            RETURN JSON OBJECT WITH THIS EXACT SCHEMA:
            {{
                "questions": [
                    {{
                        "id": "q1",
                        "text": "Question text...",
                        "options": ["A", "B", "C", "D"],
                        "correct_answer": "Option Text"
                    }}
                ]
            }}
            """
            
            try:
                data = await self.query(prompt)
                
                # Check for LLM error
                if "error" in data:
                    print(f"Batch {i} LLM Error: {data.get('error')}")
                    # Skip or retry? For now, skip
                    continue
                
                batch_qs = data.get("questions", [])
                
                # Re-index IDs to be unique across batches
                for idx, q in enumerate(batch_qs):
                    q['id'] = f"batch_{i}_{idx}"
                    questions.append(q)
                    
            except Exception as e:
                print(f"Error generating batch {i}: {e}")
                
        if not questions:
            raise Exception("Failed to generate any questions. Please try again.")
            
        return questions[:num_questions] # Trim if over-generated

assessment_agent = AssessmentAgent()
