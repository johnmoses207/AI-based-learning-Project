from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database.db import get_db
from database.models import Certificate, Student
from agents.certificate_agent import CertificateGenerator
from pydantic import BaseModel
import uuid
import datetime
import os

router = APIRouter()

class CertificateRequest(BaseModel):
    user_email: str
    course_name: str
    score: str # e.g. "95%"

@router.post("/generate")
def generate_certificate(request: CertificateRequest, db: Session = Depends(get_db)):
    # verify user exists
    user = db.query(Student).filter(Student.email == request.user_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if certificate already exists for this course/user?? 
    # For now, allow multiple or just proceed. 
    # Let's generate a unique ID
    unique_id = str(uuid.uuid4()).split('-')[0].upper() + "-" + datetime.datetime.now().strftime("%Y%m%d")
    
    # Generate PDF
    generator = CertificateGenerator()
    student_name = user.email.split('@')[0] # Fallback if name not in DB, assuming email based names for now or update Student model later?
    # Wait, Student model has no name field? It has id, email, hashed_password, google_id, avatar, skill, goal, hours, style, role.
    # I should use email user part or "Student" for now if name is missing. 
    # Or maybe I should check if there is a profile? 
    # Using email prefix as a temporary name placeholder.
    if hasattr(user, 'name') and user.name:
         student_name = user.name
    
    # Actually, looking at `Student` model, there is no `name` column.
    # It has `email`. I will Capitalize the first part of email.
    if not student_name or student_name == user.email:
         student_name = user.email.split('@')[0].capitalize()

    pdf_path = generator.generate(student_name, request.course_name, request.score, unique_id)
    
    # Create DB Record
    # Generate a verification hash (simple one for now)
    verification_hash = str(hash(f"{unique_id}:{student_name}:{request.course_name}"))
    
    cert = Certificate(
        unique_id=unique_id,
        user_id=user.id,
        course_name=request.course_name,
        score=request.score,
        pdf_path=pdf_path,
        verification_hash=verification_hash
    )
    db.add(cert)
    db.commit()
    db.refresh(cert)
    
    # Return URL
    # Assuming static files mounted at /static
    filename = os.path.basename(pdf_path)
    file_url = f"/static/certificates/{filename}"
    
    return {
        "certificate_id": unique_id,
        "download_url": file_url,
        "message": "Certificate generated successfully"
    }

@router.get("/{unique_id}")
def get_certificate(unique_id: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.unique_id == unique_id).first()
    if not cert:
        raise HTTPException(status_code=404, detail="Certificate not found")
        
    filename = os.path.basename(cert.pdf_path) if cert.pdf_path else f"{unique_id}.pdf"
    file_url = f"/static/certificates/{filename}"
    
    return {
        "unique_id": cert.unique_id,
        "course_name": cert.course_name,
        "issue_date": cert.issue_date,
        "download_url": file_url
    }

@router.get("/verify/{unique_id}")
def verify_certificate(unique_id: str, db: Session = Depends(get_db)):
    cert = db.query(Certificate).filter(Certificate.unique_id == unique_id).first()
    if not cert:
        return {"valid": False, "message": "Certificate ID not found"}
        
    user = db.query(Student).filter(Student.id == cert.user_id).first()
    student_name = user.email if user else "Unknown"
    

    return {
        "valid": True,
        "certificate_id": unique_id,
        "student": student_name,
        "course": cert.course_name,
        "issue_date": cert.issue_date,
        "verified": True
    }

@router.get("/user/{user_id}")
def get_user_certificates(user_id: int, db: Session = Depends(get_db)):
    certs = db.query(Certificate).filter(Certificate.user_id == user_id).all()
    
    results = []
    for cert in certs:
        filename = os.path.basename(cert.pdf_path) if cert.pdf_path else f"{cert.unique_id}.pdf"
        file_url = f"/static/certificates/{filename}"
        results.append({
             "unique_id": cert.unique_id,
             "course_name": cert.course_name,
             "score": cert.score,
             "issue_date": cert.issue_date,
             "download_url": file_url,
             "verification_hash": cert.verification_hash
        })
    return results
