from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship

from .base import Base, TRANSMISSION_TYPES, CONDITION_TYPES

class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String)
    contact_info = Column(String)

    preferred_brand = Column(String)
    preferred_model = Column(String)
    min_year = Column(Integer)
    max_year = Column(Integer)
    min_power = Column(Integer)
    max_power = Column(Integer)
    preferred_transmission = Column(String)  # АКП / МКП
    preferred_condition = Column(String)     # new / used
    max_price = Column(Float)

    favorites = relationship("Favorite", back_populates="buyer", cascade="all, delete")
    deals = relationship("Deal", back_populates="buyer", cascade="all, delete")
    questions = relationship("Question", back_populates="buyer", cascade="all, delete")
