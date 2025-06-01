from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from .base import Base

class Store(Base):
    __tablename__ = "stores"

    id = Column(Integer, primary_key=True)
    name = Column(String)
    address = Column(String)

    cars = relationship("Car", back_populates="store", cascade="all, delete")