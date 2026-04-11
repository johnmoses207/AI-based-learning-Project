from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import AgentConfig, AgentState, Student, Roadmap
from services.gemini_sdk_client import generate_agent_response
import json
import datetime

router = APIRouter(prefix="/api/agents", tags=["agents"])

@router.post("/chat")
def chat_with_agent(
    request: dict, # { "user_id": int, "agent_name": str, "message": str }
    db: Session = Depends(get_db)
):
    user_id = request.get("user_id")
    agent_name = request.get("agent_name")
    user_message = request.get("message")
    
    if not user_id or not agent_name:
        raise HTTPException(status_code=400, detail="Missing user_id or agent_name")

    # 1. Get Agent Config
    config = db.query(AgentConfig).filter_by(agent_name=agent_name).first()
    if not config:
        raise HTTPException(status_code=404, detail="Agent configuration not found")

    # 2. Get or Create Agent State
    state = db.query(AgentState).filter_by(user_id=user_id, agent_name=agent_name).first()
    if not state:
        state = AgentState(
            user_id=user_id,
            agent_name=agent_name,
            chat_history=[],
            status="WORKING"
        )
        db.add(state)
        db.commit()
        db.refresh(state)

    # 3. Prepare History for Gemini
    # Gemini expects: [{'role': 'user', 'parts': ['msg']}, {'role': 'model', 'parts': ['msg']}]
    history_for_gemini = []
    if state.chat_history:
        for msg in state.chat_history:
            role = "user" if msg['role'] == "user" else "model"
            history_for_gemini.append({"role": role, "parts": [msg['content']]})

    # 4. Generate Response
    # If this is the Curriculum Agent, we might need to inject the User's Profile into the prompt or context
    # For now, let's assume the user (or frontend) passes relevant context, OR we fetch it here.
    # AUTO-CONTEXT: If Curriculum Agent, fetch Profiling Agent's output.
    if agent_name == "Curriculum Agent" and not history_for_gemini:
        # Check for profiling data
        profiling_state = db.query(AgentState).filter_by(user_id=user_id, agent_name="Profiling Agent").first()
        if profiling_state and profiling_state.state_data:
             # System prompt injection or First User Message injection?
             # Let's inject it as a system note or first user message.
             user_message = f"Here is the student profile: {json.dumps(profiling_state.state_data)}. {user_message or 'Create a roadmap.'}"

    try:
        response_text = generate_agent_response(config, user_message, history=history_for_gemini)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini API Error: {str(e)}")

    # 5. Connect/Parse and Update State
    # Update local history
    new_history = state.chat_history or [] # ensure list
    new_history.append({"role": "user", "content": user_message})
    new_history.append({"role": "assistant", "content": response_text})
    
    state.chat_history = new_history
    state.updated_at = datetime.datetime.utcnow()
    
    # 6. Check for Completion / specialized logic (JSON detection)
    # If Profiling Agent returns JSON, we save it to state_data and mark complete.
    if agent_name == "Profiling Agent":
        try:
            # simple accumulation or regex search for JSON block
            # Assuming Gemini returns purely JSON or a block as requested.
            # We'll try to parse the whole text or look for ```json ... ```
            import re
            json_match = re.search(r"```json\s*(\{.*?\})\s*```", response_text, re.DOTALL)
            if json_match:
                profile_data = json.loads(json_match.group(1))
                state.state_data = profile_data
                state.status = "COMPLETED"
                
                # ALSO Update User Table fields for analytics
                student = db.query(Student).filter(Student.id == user_id).first()
                if student:
                    if "skill_level" in profile_data: student.skill = profile_data.get("skill_level")
                    if "learning_goal" in profile_data: student.goal = profile_data.get("learning_goal")
                    if "learning_style" in profile_data: student.style = profile_data.get("learning_style")
                    db.add(student)
            elif response_text.strip().startswith("{") and response_text.strip().endswith("}"):
                 profile_data = json.loads(response_text)
                 state.state_data = profile_data
                 state.status = "COMPLETED"
        except:
            pass # Not valid JSON yet, continue chatting
            
    elif agent_name == "Curriculum Agent":
         try:
            import re
            json_match = re.search(r"```json\s*(\{.*?\})\s*```", response_text, re.DOTALL)
            if json_match:
                roadmap_data = json.loads(json_match.group(1))
                state.state_data = roadmap_data
                state.status = "COMPLETED"
                
                # Save to Roadmaps table
                new_roadmap = Roadmap(
                    user_id=user_id,
                    title=roadmap_data.get("title", "My Learning Path"),
                    steps=roadmap_data.get("steps", [])
                )
                db.add(new_roadmap)
         except:
             pass

    db.commit()
    
    return {
        "response": response_text,
        "history": new_history,
        "status": state.status,
        "data": state.state_data
    }

@router.get("/status/{user_id}/{agent_name}")
def get_agent_status(user_id: int, agent_name: str, db: Session = Depends(get_db)):
    state = db.query(AgentState).filter_by(user_id=user_id, agent_name=agent_name).first()
    if not state:
        return {"status": "NOT_STARTED", "history": []}
    return {
        "status": state.status,
        "history": state.chat_history,
        "data": state.state_data
    }
