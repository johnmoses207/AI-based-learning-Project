from fastapi import APIRouter, Depends
from pydantic import BaseModel
from agents.profiling_agent import profiling_agent
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import AgentState
import datetime
import json

router = APIRouter()

class ProfilingRequest(BaseModel):
    skill: str
    goal: str
    hours: int
    style: str
    user_id: int

@router.post("")
async def run_profiling(request: ProfilingRequest, db: Session = Depends(get_db)):
    data = request.dict()
    # Call the agent
    result = await profiling_agent(data)
    
    # Save State
    if request.user_id:
        existing = db.query(AgentState).filter_by(user_id=request.user_id, agent_name="Profiling Agent").first()
        if not existing:
            existing = AgentState(user_id=request.user_id, agent_name="Profiling Agent")
            db.add(existing)
        
        existing.status = result.get("status", "COMPLETED")
        existing.state_data = result
        existing.updated_at = datetime.datetime.utcnow()
        db.commit()

    return result
