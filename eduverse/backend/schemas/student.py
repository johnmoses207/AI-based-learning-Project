from pydantic import BaseModel

class StudentCreate(BaseModel):
    skill: str
    goal: str
    hours: int
    style: str
    backup_email: str | None = None
    notifications_enabled: bool = True
