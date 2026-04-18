from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from database.db import get_db
from database.models import Student
from core.security import get_password_hash, verify_password, create_access_token
from core.limiter import limiter
from services.notification_service import send_login_alert
import datetime

router = APIRouter()

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/register")
@limiter.limit("5/minute")
def register(request: Request, user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(Student).filter(Student.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    new_user = Student(
        email=user.email, 
        hashed_password=hashed_pw,
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@router.post("/login")
@limiter.limit("10/minute")
def login(request: Request, user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(Student).filter(Student.email == user.email).first()
    if not db_user or not db_user.hashed_password or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    
    # Send security alert for successful login
    ip_address = request.client.host
    send_login_alert(db_user.email, ip_address)
    
    return {
        "access_token": access_token, 
        "token_type": "bearer", 
        "user": {
            "id": db_user.id, 
            "email": db_user.email, 
            "role": db_user.role
        }
    }

@router.post("/logout")
def logout():
    """
    Client-side handles JWT logout by removing the token.
    This endpoint is provided for consistency and future extension (e.g. token blacklisting).
    """
    return {"message": "Logged out successfully"}

