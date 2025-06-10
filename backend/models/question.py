from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class QuestionBase(BaseModel):
    car_id: int
    question: str

class QuestionCreate(QuestionBase):
    pass

class QuestionInDB(QuestionBase):
    id: int
    buyer_id: int
    answer: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)

    class Config:
        from_attributes = True

class Question(QuestionBase):
    id: int
    buyer_id: int
    answer: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
