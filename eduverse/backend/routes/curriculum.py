from fastapi import APIRouter, Depends
from pydantic import BaseModel
from agents.curriculum_agent import curriculum_agent
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import AgentState
import datetime
import json

router = APIRouter()

class CurriculumRequest(BaseModel):
    skill: str
    goal: str
    hours: int
    style: str
    user_id: int

@router.post("")
async def generate_curriculum(request: CurriculumRequest, db: Session = Depends(get_db)):
    result = await curriculum_agent(request.dict())
    
    # Save State
    if request.user_id:
        existing = db.query(AgentState).filter_by(user_id=request.user_id, agent_name="Curriculum Agent").first()
        if not existing:
            existing = AgentState(user_id=request.user_id, agent_name="Curriculum Agent")
            db.add(existing)
        
        existing.status = result.get("status", "COMPLETED")
        existing.state_data = result
        existing.updated_at = datetime.datetime.utcnow()
        db.commit()

    return result
