from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import Achievement, UserAchievement, Student
from pydantic import BaseModel
from typing import List, Optional
import datetime

router = APIRouter()

class AchievementSchema(BaseModel):
    id: int
    title: str
    description: str
    icon: str
    xp_reward: int
    unlocked: bool = False
    unlocked_at: Optional[datetime.datetime] = None
    progress: int = 0 # 0-100
    progress_label: str = "" # e.g. "5/10"

from database.models import LabQuestion

@router.get("/list/{user_id}", response_model=List[AchievementSchema])
def get_user_achievements(user_id: int, db: Session = Depends(get_db)):
    # 1. Get all achievements
    all_achievements = db.query(Achievement).all()
    
    # 2. Get unlocked achievements for user
    user_unlocks = db.query(UserAchievement).filter(UserAchievement.user_id == user_id).all()
    unlocked_ids = {ua.achievement_id: ua.unlocked_at for ua in user_unlocks}
    
    # Pre-fetch stats for efficient progress calculation
    completed_lab_count = db.query(LabQuestion).filter_by(user_id=user_id, is_completed=True).count()
    total_lab_count = db.query(LabQuestion).filter_by(user_id=user_id).count()
    
    # 3. Merge
    results = []
    for ach in all_achievements:
        is_unlocked = ach.id in unlocked_ids
        progress = 100 if is_unlocked else 0
        label = "Completed" if is_unlocked else "Locked"
        
        # Dynamic Progress Logic for Locked Items
        if not is_unlocked:
            if ach.title == "Problem Solver I":
                # Goal: 10
                progress = min(100, int((completed_lab_count / 10) * 100))
                label = f"{completed_lab_count}/10"
            elif ach.title == "Problem Solver II":
                # Goal: 20
                progress = min(100, int((completed_lab_count / 20) * 100))
                label = f"{completed_lab_count}/20"
            elif ach.title == "Problem Solver III":
                 # Goal: 30
                progress = min(100, int((completed_lab_count / 30) * 100))
                label = f"{completed_lab_count}/30"
            elif ach.title == "Course Champion":
                if total_lab_count > 0:
                    progress = min(100, int((completed_lab_count / total_lab_count) * 100))
                    label = f"{completed_lab_count}/{total_lab_count}"
                else:
                    label = "No Course"
            elif ach.title == "First Step":
                # Check for any lesson completion (using UserMemory as proxy)
                # For now just 0
                pass

        results.append({
            "id": ach.id,
            "title": ach.title,
            "description": ach.description,
            "icon": ach.icon,
            "xp_reward": ach.xp_reward,
            "unlocked": is_unlocked,
            "unlocked_at": unlocked_ids.get(ach.id),
            "progress": progress,
            "progress_label": label
        })
        
    return results

@router.post("/seed")
def seed_achievements(db: Session = Depends(get_db)):
    defaults = [
        {"title": "First Step", "description": "Complete your first lesson", "icon": "🚀", "xp_reward": 100},
        {"title": "Fast Learner", "description": "Complete 5 lessons in a day", "icon": "⚡", "xp_reward": 500},
        {"title": "Quiz Master", "description": "Score 100% on a quiz", "icon": "🧠", "xp_reward": 300},
        {"title": "Code Warrior", "description": "Write your first Python script", "icon": "🐍", "xp_reward": 200},
        {"title": "Consistent", "description": "Log in for 7 days in a row", "icon": "📅", "xp_reward": 400},
        # Lab Achievements
        {"title": "Web Wizard", "description": "Complete a Web Development challenge", "icon": "🌐", "xp_reward": 300},
        {"title": "Data Miner", "description": "Complete a Data Science challenge", "icon": "📊", "xp_reward": 300},
        {"title": "AI Architect", "description": "Complete an AI/ML challenge", "icon": "🤖", "xp_reward": 500},
        # New Badges
        {"title": "Module Master", "description": "Complete all questions in a module", "icon": "🎓", "xp_reward": 1000},
        {"title": "Course Champion", "description": "Complete 100% of your generated course", "icon": "🏆", "xp_reward": 5000},
    ]
    
    added = 0
    for d in defaults:
        exists = db.query(Achievement).filter_by(title=d["title"]).first()
        if not exists:
            new_ach = Achievement(
                title=d["title"],
                description=d["description"],
                icon=d["icon"],
                xp_reward=d["xp_reward"],
                criteria={}
            )
            db.add(new_ach)
            added += 1
            
    db.commit()
    return {"message": f"Seeded {added} achievements"}

@router.post("/unlock/{user_id}/{achievement_id}")
def unlock_achievement(user_id: int, achievement_id: int, db: Session = Depends(get_db)):
    # Check if already unlocked
    exists = db.query(UserAchievement).filter_by(user_id=user_id, achievement_id=achievement_id).first()
    if exists:
        return {"message": "Already unlocked"}
        
    new_unlock = UserAchievement(user_id=user_id, achievement_id=achievement_id)
    db.add(new_unlock)
    db.commit()
    return {"message": "Achievement unlocked!"}
