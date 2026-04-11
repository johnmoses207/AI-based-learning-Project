from pydantic import BaseModel

class StudentCreate(BaseModel):
    skill: str
    goal: str
    hours: int
    style: str
