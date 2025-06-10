from sqlalchemy import Column, Integer, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True)
    car_id = Column(Integer, ForeignKey("cars.id"))
    buyer_id = Column(Integer, ForeignKey("buyers.id"))
    question = Column(Text, nullable=False)
    answer = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    car = relationship("Car", back_populates="questions")
    buyer = relationship("Buyer", back_populates="questions")
