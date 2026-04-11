from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import AgentState, LabQuestion
from agents.lab_agent import lab_agent
import time

router = APIRouter()

@router.post("/seed/{user_id}")
def seed_content(user_id: int, db: Session = Depends(get_db)):
    """
    Generates ~3 questions per module for the user's roadmap.
    This is a heavy operation, effectively "Building the Course".
    """
    
    # 1. Fetch Roadmap
    curriculum = db.query(AgentState).filter_by(user_id=user_id, agent_name="Curriculum Agent").first()
    if not curriculum or not curriculum.state_data:
        raise HTTPException(status_code=404, detail="Roadmap not found. Run Curriculum Agent first.")
    
    data = curriculum.state_data.get("data", {})
    modules = data.get("modules", [])
    
    if not modules:
        raise HTTPException(status_code=400, detail="Roadmap has no modules.")
    
    generated_count = 0
    
    for module in modules:
        module_title = module.get("title", "General")
        topics = module.get("topics", [])
        
        # Limit to first 3 topics per module to check latency
        for topic in topics[:3]:
            # Check if exists
            exists = db.query(LabQuestion).filter_by(user_id=user_id, topic=topic).first()
            if exists:
                continue
                
            # Generate Hybrid Content
            # Simple heuristic: 1st topic = Quiz, others = Code? 
            # Or just alternate. Let's make the FIRST topic always a QUIZ (Warmup)
            # and the rest CODE.
            
            try:
                if topic == topics[0]: 
                    # GENERATE QUIZ
                    quiz_data = lab_agent.generate_quiz(topic, "Beginner")
                    q = LabQuestion(
                        user_id=user_id,
                        module_name=module_title,
                        topic=topic,
                        question_type="quiz",
                        difficulty="Beginner",
                        content=quiz_data
                    )
                    db.add(q)
                else:
                    # GENERATE CODE
                    code_data = lab_agent.generate_challenge(topic, "Beginner")
                    q = LabQuestion(
                        user_id=user_id,
                        module_name=module_title,
                        topic=topic,
                        question_type="code",
                        difficulty="Beginner",
                        content=code_data
                    )
                    db.add(q)
                
                generated_count += 1
                db.commit() # Commit incremental to save progress
                time.sleep(1) # Rate limit protection
                
            except Exception as e:
                print(f"Failed to generate for {topic}: {e}")
                continue
                
    return {"status": "success", "message": f"Generated {generated_count} questions."}
