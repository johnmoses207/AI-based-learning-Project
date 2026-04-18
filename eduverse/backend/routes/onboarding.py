from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database.db import SessionLocal, engine, Base, get_db
from schemas.student import StudentCreate
from services.onboarding_service import onboard_student

router = APIRouter()

# Create DB tables once
Base.metadata.create_all(bind=engine)

from fastapi.security import OAuth2PasswordBearer
from core.security import decode_access_token
from database.models import Student

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    payload = decode_access_token(token)
    if not payload:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Invalid token")
    email = payload.get("sub")
    user = db.query(Student).filter(Student.email == email).first()
    if not user:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/onboarding")
async def onboarding(
    data: StudentCreate,
    db: Session = Depends(get_db),
    current_user: Student = Depends(get_current_user)
):
    student, agents = await onboard_student(db, data, current_user)
    return {
        "student_id": student.id,
        "agents_output": agents
    }
