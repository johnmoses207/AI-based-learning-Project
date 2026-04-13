from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database.db import get_db
from database.models import Student
from core.security import get_password_hash, verify_password, create_access_token
import requests

router = APIRouter()

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class GoogleLogin(BaseModel):
    token: str

@router.post("/register")
def register(user: UserRegister, db: Session = Depends(get_db)):
    db_user = db.query(Student).filter(Student.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_pw = get_password_hash(user.password)
    new_user = Student(email=user.email, hashed_password=hashed_pw)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return {"message": "User created successfully"}

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(Student).filter(Student.email == user.email).first()
    if not db_user or not db_user.hashed_password or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "email": db_user.email, "role": db_user.role}}

@router.post("/google")
def google_login(payload: GoogleLogin, db: Session = Depends(get_db)):
    print(f"DEBUG: Google Auth request received. Token prefix: {payload.token[:10]}...")
    # Verify token with Google
    try:
        # If using access_token approach:
        logger_url = "https://www.googleapis.com/oauth2/v3/userinfo"
        response = requests.get(logger_url, headers={"Authorization": f"Bearer {payload.token}"})
        
        if response.status_code != 200:
             raise HTTPException(status_code=400, detail="Invalid Google Token")
        
        google_data = response.json()
        email = google_data.get("email")
        google_id = google_data.get("sub")
        avatar = google_data.get("picture")
        
        if not email:
            raise HTTPException(status_code=400, detail="Google account has no email")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google validation failed: {str(e)}")

    # Check if user exists
    db_user = db.query(Student).filter(Student.email == email).first()
    
    if not db_user:
        # Create new user
        # Note: Password is None for social users
        # Default role is student
        new_user = Student(
            email=email, 
            google_id=google_id, 
            avatar=avatar,
            hashed_password=None,
            role="student"
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        db_user = new_user
    else:
        # Update existing user info if needed (optional)
        if not db_user.google_id:
            db_user.google_id = google_id
        if not db_user.avatar:
            db_user.avatar = avatar
        db.commit()
        
    access_token = create_access_token(data={"sub": db_user.email, "role": db_user.role})
    return {"access_token": access_token, "token_type": "bearer", "user": {"id": db_user.id, "email": email, "avatar": avatar, "role": db_user.role}}
