from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import UserAchievement, Achievement, UserMemory
from agents.lab_agent import lab_agent
from pydantic import BaseModel
import datetime

router = APIRouter()

class ChallengeRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"
    user_id: int = None

class SubmitRequest(BaseModel):
    user_id: int
    challenge_id: str = None # Optional key if we store challenges later
    topic: str
    code: str
    language: str = "python"
    passed: bool # trusting frontend for now

from database.models import AgentState, LabQuestion

@router.post("/challenge")
async def get_challenge(request: ChallengeRequest, db: Session = Depends(get_db)):
    topic = request.topic
    
    # Personalization Logic
    # Personalization Logic (Roadmap Priority)
    if request.user_id:
        # 0. Check Persistent Question Bank (PRIORITY)
        # Find any uncompleted question for this user matching the requested topic (or next in module)
        persistent_q = db.query(LabQuestion).filter(
            LabQuestion.user_id == request.user_id,
            LabQuestion.topic == topic,
            LabQuestion.is_completed == False
        ).first()

        if persistent_q:
            return {"status": "success", "challenge": {**persistent_q.content, "type": persistent_q.question_type, "id": persistent_q.id}}

        # 1. Try Curriculum Agent (Strict Roadmap)
        curriculum_state = db.query(AgentState).filter_by(user_id=request.user_id, agent_name="Curriculum Agent").first()
        if curriculum_state and curriculum_state.state_data:
            try:
                # Structure: { data: { modules: [ { topics: [] } ] } }
                data = curriculum_state.state_data.get("data", {})
                modules = data.get("modules", [])
                if modules:
                    first_module = modules[0]
                    topics = first_module.get("topics", [])
                    if topics and topic == "Recommended":
                        # Try to find next UNCOMPLETED persistent question in this module
                        for t in topics:
                            pq = db.query(LabQuestion).filter_by(user_id=request.user_id, topic=t, is_completed=False).first()
                            if pq:
                                return {"status": "success", "challenge": {**pq.content, "type": pq.question_type, "id": pq.id}}
                        
                        topic = topics[0] # Fallback to first if no specific Q found
            except Exception as e:
                print(f"Error parsing curriculum state: {e}")

        # 2. Fallback to Profiling Agent
        if topic == "Recommended":
            profile_state = db.query(AgentState).filter_by(user_id=request.user_id, agent_name="Profiling Agent").first()
            if profile_state and profile_state.state_data:
                 topic = profile_state.state_data.get("goal") or profile_state.state_data.get("skill") or "General Python"
            else:
                topic = "General Python"
    
    # Hybrid Logic: Quiz vs Code
    BASIC_TOPICS = ["python basics", "introduction", "syntax", "variables", "data types"]
    is_basic = any(t in topic.lower() for t in BASIC_TOPICS) or "basic" in topic.lower()

    try:
        if is_basic:
            data = await lab_agent.generate_quiz(topic, request.difficulty)
            data["type"] = "quiz"
            return {"status": "success", "challenge": data}
        else:
            data = await lab_agent.generate_challenge(topic, request.difficulty)
            data["type"] = "code"
            return {"status": "success", "challenge": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/run")
def run_code(request: SubmitRequest, db: Session = Depends(get_db)):
    """
    Executes code and returns output without recording completion.
    """
    from services.code_executor import execute_code
    
    result = execute_code(request.code, request.language)
    return result

@router.post("/submit")
def submit_solution(request: SubmitRequest, db: Session = Depends(get_db)):
    # ... existing submit logic ...
    if not request.passed:
        return {"message": "Keep trying!"}
    
    # 1. Log Completion
    memory = UserMemory(
        user_id=request.user_id,
        event_type="lab_completion",
        context={"topic": request.topic, "code_length": len(request.code) if request.code else 0},
        created_at=datetime.datetime.utcnow()
    )
    db.add(memory)
    
    # 1.5 Mark Persistent Question Completed
    if request.challenge_id:
        pq = db.query(LabQuestion).filter_by(id=request.challenge_id).first()
        if pq:
            pq.is_completed = True
            db.add(pq)

    # 2. Check & Unlock Achievements
    unlocked = []
    
    # Helper to unlock
    def try_unlock(title):
        ach = db.query(Achievement).filter_by(title=title).first()
        if ach:
            exists = db.query(UserAchievement).filter_by(user_id=request.user_id, achievement_id=ach.id).first()
            if not exists:
                new_unlock = UserAchievement(user_id=request.user_id, achievement_id=ach.id)
                db.add(new_unlock)
                unlocked.append(ach.title)

    # Logic
    try_unlock("First Step") # Unlock on first success
    
    topic_lower = request.topic.lower()
    
    if "python" in topic_lower:
        try_unlock("Code Warrior")
    
    # Dynamic Mapping based on Topic Keywords
    if "web" in topic_lower or "html" in topic_lower or "api" in topic_lower:
        try_unlock("Web Wizard") 
    
    if "data" in topic_lower or "pandas" in topic_lower:
        try_unlock("Data Miner")

    if "ai" in topic_lower or "learning" in topic_lower or "neural" in topic_lower:
        try_unlock("AI Architect")
    
    # Check Milestone Badges (Count Persistent Questions)
    completed_count = db.query(LabQuestion).filter_by(user_id=request.user_id, is_completed=True).count()
    
    if completed_count >= 10:
        try_unlock("Problem Solver I")
    if completed_count >= 20:
        try_unlock("Problem Solver II")
    if completed_count >= 30:
        try_unlock("Problem Solver III")

    # Check Module Master & Course Champion
    # Only if this was a persistent question
    if request.challenge_id:
        current_q = db.query(LabQuestion).filter_by(id=request.challenge_id).first()
        if current_q and current_q.module_name:
            # Module Stats
            mod_total = db.query(LabQuestion).filter_by(user_id=request.user_id, module_name=current_q.module_name).count()
            mod_done = db.query(LabQuestion).filter_by(user_id=request.user_id, module_name=current_q.module_name, is_completed=True).count()
            
            if mod_total > 0 and mod_done == mod_total:
                try_unlock("Module Master")

            # Course Stats
            course_total = db.query(LabQuestion).filter_by(user_id=request.user_id).count()
            course_done = db.query(LabQuestion).filter_by(user_id=request.user_id, is_completed=True).count()
            
            if course_total > 0 and course_done == course_total:
                try_unlock("Course Champion")
        
    db.commit()
    
    return {
        "status": "success", 
        "message": "Solution recorded", 
        "unlocked_achievements": unlocked 
    }
