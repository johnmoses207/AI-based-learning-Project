from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import UserMemory, AgentState
from pydantic import BaseModel
from typing import List, Dict
import datetime

router = APIRouter()

@router.get("/confidence/{user_id}")
def get_confidence_analytics(user_id: int, db: Session = Depends(get_db)):
    states = db.query(AgentState).filter(AgentState.user_id == user_id).all()
    results = []
    for s in states:
        conf = 0
        if s.state_data and "confidence" in s.state_data:
            try:
                conf = int(s.state_data["confidence"])
            except:
                conf = 0
        results.append({"agent": s.agent_name, "confidence": conf})
    return results

@router.get("/progress/{user_id}")
# ... rest of the file ...
def get_progress_analytics(user_id: int, db: Session = Depends(get_db)):
    try:
        # Fetch all assessment memories
        memories = db.query(UserMemory).filter(
            UserMemory.user_id == user_id,
            UserMemory.event_type == "assessment"
        ).order_by(UserMemory.created_at.asc()).all()

        if not memories:
            return {
                "recent_scores": [],
                "average_score": 0,
                "total_assessments": 0,
                "topics_completed": 0
            }

        recent_scores = []
        total_percentage = 0
        topics = set()

        for mem in memories:
            data = mem.context
            if not data: continue
            
            percentage = data.get("percentage", 0)
            topic = data.get("topic", "Unknown")
            
            recent_scores.append({
                "date": mem.created_at.strftime("%b %d"),
                "topic": topic,
                "score": percentage
            })
            
            total_percentage += percentage
            topics.add(topic)

        average = int(total_percentage / len(memories)) if memories else 0

        return {
            "recent_scores": recent_scores, # detailed list for charts
            "average_score": average,
            "total_assessments": len(memories),
            "topics_completed": len(topics)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/roadmap/{user_id}")
def get_roadmap_progress(user_id: int, db: Session = Depends(get_db)):
    # 1. Fetch Curriculum
    state = db.query(AgentState).filter_by(user_id=user_id, agent_name="Curriculum Agent").first()
    if not state or not state.state_data:
        return {"modules": [], "overall_progress": 0}

    try:
        data = state.state_data.get("data", {})
        modules = data.get("modules", [])
        
        # 2. Fetch Completed Labs
        memories = db.query(UserMemory).filter_by(user_id=user_id, event_type="lab_completion").all()
        # Create normalized set of completed topics
        completed_topics = set()
        for m in memories:
            if m.context and "topic" in m.context:
                completed_topics.add(m.context["topic"].lower().strip())
        
        # 3. Calculate Progress
        roadmap_data = []
        total_topics_count = 0
        total_completed_count = 0
        
        for module in modules:
            mod_title = module.get("title", "Unknown Module")
            mod_topics = module.get("topics", [])
            
            completed_in_mod = 0
            next_topic = None
            
            for t in mod_topics:
                t_norm = t.lower().strip()
                # Check for partial match or exact match
                # e.g. "React Components" vs "Components"
                is_done = False
                for c in completed_topics:
                    if t_norm in c or c in t_norm:
                        is_done = True
                        break
                
                if is_done:
                    completed_in_mod += 1
                    total_completed_count += 1
                elif next_topic is None:
                    next_topic = t # Found the first uncompleted topic
            
            total = len(mod_topics)
            percent = int((completed_in_mod / total) * 100) if total > 0 else 0
            total_topics_count += total
            
            roadmap_data.append({
                "title": mod_title,
                "total": total,
                "completed": completed_in_mod,
                "percentage": percent,
                "next_topic": next_topic,
                "status": "completed" if percent == 100 else "in-progress" if percent > 0 else "locked"
            })
            
        overall = int((total_completed_count / total_topics_count) * 100) if total_topics_count > 0 else 0
        
        return {
            "modules": roadmap_data,
            "overall_progress": overall,
            "current_module_index": next(
                (i for i, m in enumerate(roadmap_data) if m["percentage"] < 100), 
                len(roadmap_data) - 1
            )
        }

    except Exception as e:
        print(f"Roadmap Analytics Error: {e}")
        return {"modules": [], "error": str(e)}

@router.get("/streak/{user_id}")
def get_user_streak(user_id: int, db: Session = Depends(get_db)):
    try:
        # 1. Fetch Activity Dates
        memories = db.query(UserMemory.created_at).filter(
            UserMemory.user_id == user_id,
            UserMemory.event_type.in_(["lab_completion", "lesson_complete"]) 
        ).all()
        
        if not memories:
            return {"streak": 0, "active_today": False}
            
        # 2. Process Dates
        dates = sorted(list(set([m[0].date() for m in memories])), reverse=True)
        
        if not dates:
            return {"streak": 0, "active_today": False}
            
        today = datetime.datetime.utcnow().date()
        yesterday = today - datetime.timedelta(days=1)
        
        streak = 0
        active_today = False
        
        # Check if active today
        if dates[0] == today:
            active_today = True
            streak = 1
            current_check = yesterday
        elif dates[0] == yesterday:
            streak = 1
            current_check = yesterday - datetime.timedelta(days=1)
        else:
            # Streak broken
            return {"streak": 0, "active_today": False}
            
        # Count backwards
        for d in dates:
            if d == today: continue # Already counted
            
            if d == current_check:
                streak += 1
                current_check -= datetime.timedelta(days=1)
            elif d < current_check:
                break # Gap found
                
        return {"streak": streak, "active_today": active_today}
        
    except Exception as e:
        print(f"Streak Error: {e}")
        return {"streak": 0, "error": str(e)}
