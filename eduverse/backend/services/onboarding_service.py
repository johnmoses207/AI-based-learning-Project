from sqlalchemy.orm import Session
from database.models import Student
from agents.orchestrator import orchestrator

from services.notification_service import send_welcome_notification

async def onboard_student(db: Session, data, student: Student):
    # Update existing student with onboarding data
    student.skill = data.skill
    student.goal = data.goal
    student.hours = data.hours
    student.style = data.style
    student.backup_email = data.backup_email
    student.notifications_enabled = data.notifications_enabled
    
    db.commit()
    db.refresh(student)

    # Send Welcome Notification
    send_welcome_notification(student.email, student.backup_email)

    agent_output = await orchestrator(student)
    return student, agent_output
