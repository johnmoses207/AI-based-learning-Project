from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import SessionLocal, engine, Base
from schemas.student import StudentCreate
from services.onboarding_service import onboard_student

router = APIRouter()

# Create DB tables once
Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/onboarding")
async def onboarding(
    data: StudentCreate,
    db: Session = Depends(get_db)
):
    student, agents = await onboard_student(db, data)
    return {
        "student_id": student.id,
        "agents_output": agents
    }
