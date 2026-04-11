from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import Resource, UserMemory, AgentState, Student
from agents.learn_agent import learn_agent
from services.gemini_sdk_client import generate_gemini_response
from pydantic import BaseModel
import datetime
import json

class LearnRequest(BaseModel):
    topic: str
    style: str = "General"

class ChallengeRequest(BaseModel):
    topic: str
    difficulty: str = "Beginner"

class CompleteRequest(BaseModel):
    user_id: int
    topic: str

router = APIRouter()

@router.post("/topic")
async def learn_topic(request: LearnRequest):
    return await learn_agent(request.topic, request.style)

@router.post("/challenge")
async def generate_challenge(request: ChallengeRequest):
    from core.llm import llm_generate
    
    prompt = f"""
    Create a Python coding challenge for the topic: {request.topic}.
    Difficulty: {request.difficulty}.
    
    Return ONLY a valid JSON object with the following structure:
    {{
        "title": "Challenge Title",
        "description": "Problem statement...",
        "starter_code": "def solution():\\n    pass",
        "test_cases": [
            {{"input": "...", "expected": "..."}}
        ],
        "hint": "A helpful hint"
    }}
    Do not add markdown formatting ```json ... ```. Just the raw JSON string.
    """
    
    try:
        data = await llm_generate(prompt)
        
        # Check for error
        if "error" in data:
             print(f"Challenge Gen LLM Error: {data.get('error')}")
             raise Exception(data.get("decision", "Unknown LLM Error"))

        return {"status": "success", "challenge": data}
    except Exception as e:
        print(f"ERROR GENERATING CHALLENGE: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to generate challenge: {str(e)}")

@router.post("/complete")
def complete_lesson(request: CompleteRequest, db: Session = Depends(get_db)):
    # 1. Log to UserMemory
    memory = UserMemory(
        user_id=request.user_id,
        event_type="lesson_complete",
        context={"topic": request.topic},
        created_at=datetime.datetime.utcnow()
    )
    db.add(memory)
    
    # 2. Update Mentor Agent State (Optional but good for immediate tracking)
    # We find the Mentor Agent state and append a note if it exists? 
    # Or simply let the Mentor Agent query UserMemory later.
    # Let's just log for now.
    
    db.commit()
    return {"message": "Lesson completion logged"}

@router.get("/resources")
def get_public_resources(category: str = None, db: Session = Depends(get_db)):
    query = db.query(Resource)
    if category:
        query = query.filter(Resource.category.ilike(f"%{category}%"))
    return query.all()
