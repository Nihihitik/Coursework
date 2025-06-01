from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship

from .base import Base

class Seller(Base):
    __tablename__ = "sellers"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    contact_info = Column(String)

    cars = relationship("Car", back_populates="seller", cascade="all, delete")