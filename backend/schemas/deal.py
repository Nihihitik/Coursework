from sqlalchemy import Column, Integer, Float, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base, DEAL_STATUSES

class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    price = Column(Float)
    deal_date = Column(DateTime, default=datetime.utcnow)
    status = Column(Enum("pending", "approved", "rejected", "completed", name="deal_status"), default="pending")

    buyer = relationship("Buyer", back_populates="deals")
    car = relationship("Car", back_populates="deals")