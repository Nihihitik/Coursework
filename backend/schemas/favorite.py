from sqlalchemy import Column, Integer, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

from .base import Base

class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"))
    car_id = Column(Integer, ForeignKey("cars.id"))
    added_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("Buyer", back_populates="favorites")
    car = relationship("Car", back_populates="favorites")