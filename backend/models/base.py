from enum import Enum
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserRole(str, Enum):
    BUYER = "buyer"
    SELLER = "seller"
    ADMIN = "admin"

class Transmission(str, Enum):
    AUTOMATIC = "АКП"
    MANUAL = "МКП"

class Condition(str, Enum):
    NEW = "new"
    USED = "used"

class DealStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"