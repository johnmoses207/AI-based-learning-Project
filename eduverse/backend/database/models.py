from sqlalchemy import Column, Integer, String, JSON, ForeignKey, DateTime, Text, Float, Boolean
from sqlalchemy.orm import relationship
from database.db import Base
import datetime

class Student(Base):
    __tablename__ = "students"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String, nullable=True)
    google_id = Column(String, nullable=True)
    avatar = Column(String, nullable=True)
    skill = Column(String)
    goal = Column(String)
    hours = Column(Integer)
    style = Column(String)
    role = Column(String, default="student")
    backup_email = Column(String, nullable=True)
    notifications_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Resource(Base):
    __tablename__ = "resources"
    
    id = Column(Integer, primary_key=True)
    title = Column(String)
    type = Column(String) # 'video', 'article', 'quiz'
    link = Column(String)
    category = Column(String) # 'AI', 'Web Dev', etc.
    description = Column(String, nullable=True)

class AgentConfig(Base):
    __tablename__ = "agent_configs"
    
    id = Column(Integer, primary_key=True)
    agent_name = Column(String, unique=True, index=True)
    system_prompt = Column(Text)
    temperature = Column(Float, default=0.7)
    tools = Column(JSON, nullable=True)

class AgentState(Base):
    __tablename__ = "agent_states"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    agent_name = Column(String)
    state_data = Column(JSON, nullable=True) # General store for agent output
    chat_history = Column(JSON, nullable=True)
    status = Column(String, default="IDLE") # IDLE, WORKING, COMPLETED, WAITING
    updated_at = Column(DateTime, default=datetime.datetime.utcnow)

class Roadmap(Base):
    __tablename__ = "roadmaps"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    title = Column(String)
    steps = Column(JSON) # List of steps/modules
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class UserMemory(Base):
    __tablename__ = "user_memories"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    event_type = Column(String) # 'assessment', 'achievement', 'interaction'
    context = Column(JSON) # e.g. {"topic": "Python", "score": "8/10", "feedback": "..."}
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class LabQuestion(Base):
    __tablename__ = "lab_questions"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("students.id")) # Personalized questions
    module_name = Column(String, index=True)          # e.g. "Python Basics"
    topic = Column(String, index=True)                # e.g. "Variables"
    question_type = Column(String)                    # "quiz" or "code"
    difficulty = Column(String)                       # "Beginner", "Intermediate"
    content = Column(JSON)                            # The full JSON for the challenge
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(Integer, primary_key=True)
    title = Column(String, unique=True)
    description = Column(String)
    icon = Column(String) # URL or icon name
    criteria = Column(JSON) # e.g. {"type": "course_completion", "count": 1}
    xp_reward = Column(Integer)

class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    achievement_id = Column(Integer, ForeignKey("achievements.id"))
    unlocked_at = Column(DateTime, default=datetime.datetime.utcnow)

class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    topic = Column(String)
    questions = Column(JSON) # The 100 questions (secure storage)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    is_active = Column(Boolean, default=True)

class ExamSubmission(Base):
    __tablename__ = "exam_submissions"
    
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    exam_id = Column(Integer, ForeignKey("exams.id"))
    answers = Column(JSON) # User's selected answers
    score = Column(Float) # 0-100
    is_passed = Column(Boolean) 
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    integrity_hash = Column(String) # For immutability verification

class Certificate(Base):
    __tablename__ = "certificates"
    
    id = Column(Integer, primary_key=True)
    unique_id = Column(String, unique=True, index=True)
    user_id = Column(Integer, ForeignKey("students.id"))
    course_name = Column(String)
    issue_date = Column(DateTime, default=datetime.datetime.utcnow)
    score = Column(String, nullable=True) # e.g. "95%"
    pdf_path = Column(String, nullable=True) # Path to generated PDF file
    verification_hash = Column(String) # For validating authenticity
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
