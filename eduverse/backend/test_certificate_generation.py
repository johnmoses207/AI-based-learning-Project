import sys
import os

# Add backend to sys path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database.db import SessionLocal, Base, engine
from database.models import Student, Certificate
from agents.certificate_agent import CertificateGenerator
import uuid
import datetime

def test_generation():
    print("Testing Certificate Generation...")
    
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # Get or Create a test user
    user = db.query(Student).first()
    if not user:
        print("Creating placeholder user...")
        user = Student(email="test@example.com", hashed_password="pw", role="student")
        db.add(user)
        db.commit()
        db.refresh(user)
    
    # Generate Data
    unique_id = str(uuid.uuid4()).split('-')[0].upper()
    course_name = "Advanced AI Engineering"
    score = "98%"
    student_name = "Test Student"
    
    gen = CertificateGenerator()
    path = gen.generate(student_name, course_name, score, unique_id)
    
    print(f"Generated PDF at: {path}")
    
    if os.path.exists(path):
        print("SUCCESS: File exists.")
        print(f"File size: {os.path.getsize(path)} bytes")
    else:
        print("FAILURE: File not found.")
        
    db.close()

if __name__ == "__main__":
    test_generation()
