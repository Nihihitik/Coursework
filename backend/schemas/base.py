from sqlalchemy import create_engine, Column, Integer, String, Float, Text, DateTime, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

Base = declarative_base()

# Определение констант для Enum полей
TRANSMISSION_TYPES = ["АКП", "МКП"]
CONDITION_TYPES = ["new", "used"]
DEAL_STATUSES = ["pending", "approved", "rejected", "completed"]