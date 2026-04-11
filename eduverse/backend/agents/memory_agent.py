from sqlalchemy.orm import Session
from database.models import UserMemory, AgentState
from database.db import SessionLocal
import json

def store_memory(user_id: int, event_type: str, data: dict):
    """
    Stores a significant event in the user's long-term memory.
    """
    db: Session = SessionLocal()
    try:
        memory = UserMemory(
            user_id=user_id,
            event_type=event_type,
            context=data
        )
        db.add(memory)
        db.commit()
        db.refresh(memory)
        return {"status": "success", "id": memory.id}
    except Exception as e:
        print(f"Error storing memory: {e}")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()

def get_user_context(user_id: int, limit: int = 5) -> str:
    """
    Retrieves recent context for the generic Mentor Agent.
    Returns a formatted string of recent events and agent states.
    """
    db: Session = SessionLocal()
    try:
        # 1. Recent Memories
        memories = db.query(UserMemory).filter(UserMemory.user_id == user_id).order_by(UserMemory.created_at.desc()).limit(limit).all()
        
        context_str = "Recent Learning History:\n"
        if memories:
            for mem in memories:
                data_str = json.dumps(mem.context)
                context_str += f"- [{mem.created_at.strftime('%Y-%m-%d')}] {mem.event_type.upper()}: {data_str}\n"
        else:
            context_str += "No recent learning history.\n"

        # 2. Agent States (Confidence)
        context_str += "\nCurrent Agent States (Confidence/Progress):\n"
        agent_states = db.query(AgentState).filter(AgentState.user_id == user_id).all()
        if agent_states:
            for state in agent_states:
                conf = "Unknown"
                if state.state_data and "confidence" in state.state_data:
                    conf = state.state_data["confidence"]
                
                context_str += f"- {state.agent_name}: Status={state.status}, Confidence={conf}\n"
        else:
            context_str += "No active agents.\n"
            
        return context_str
    except Exception as e:
        return f"Error retrieving context: {str(e)}"
    finally:
        db.close()
