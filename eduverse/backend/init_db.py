from database.db import engine, Base
from database.models import Student, Resource, AgentConfig, AgentState, Roadmap, UserMemory, LabQuestion, Achievement, UserAchievement, Exam, ExamSubmission, Certificate

def init_db():
    print(f"Connecting to: {engine.url}")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables initialized successfully!")

if __name__ == "__main__":
    init_db()
