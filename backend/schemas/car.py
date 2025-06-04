from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey
from sqlalchemy.orm import relationship

from .base import Base, TRANSMISSION_TYPES, CONDITION_TYPES

class Car(Base):
    __tablename__ = "cars"

    id = Column(Integer, primary_key=True)
    brand = Column(String)
    model = Column(String)
    year = Column(Integer)
    power = Column(Integer)
    transmission = Column(String)     # АКП / МКП
    condition = Column(String)        # new / used
    mileage = Column(Float)
    features = Column(Text)
    price = Column(Float)
    status = Column(String, default="active")

    seller_id = Column(Integer, ForeignKey("sellers.id"))
    store_id = Column(Integer, ForeignKey("stores.id"))

    seller = relationship("Seller", back_populates="cars")
    store = relationship("Store", back_populates="cars")

    favorites = relationship("Favorite", back_populates="car", cascade="all, delete")
    deals = relationship("Deal", back_populates="car", cascade="all, delete")