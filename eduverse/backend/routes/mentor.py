from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from agents.mentor_agent import mentor_agent

class MentorRequest(BaseModel):
    user_id: int
    message: str

router = APIRouter()

@router.post("")
async def chat_with_mentor(request: MentorRequest):
    try:
        response = await mentor_agent(request.user_id, request.message)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
