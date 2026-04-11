from sqlalchemy.orm import Session
from database.models import Student
from agents.orchestrator import orchestrator

async def onboard_student(db: Session, data):
    student = Student(**data.dict())
    db.add(student)
    db.commit()
    db.refresh(student)

    agent_output = await orchestrator(student)
    return student, agent_output
