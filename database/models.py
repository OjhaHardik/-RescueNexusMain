from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database.db import Base


# =========================================
# INCIDENT MODEL
# =========================================
class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Info
    type = Column(String, nullable=False)
    description = Column(String, nullable=False)

    # Location
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)

    # Severity + Workflow
    severity = Column(String, nullable=False)
    status = Column(String, default="Pending")
    assigned_team = Column(String, default="Not Assigned")

    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow)

    # Optional image
    image_path = Column(String, nullable=True)

    # 🔥 Proper foreign key
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationship (optional but good)
    user = relationship("User", back_populates="incidents")


# =========================================
# USER MODEL
# =========================================
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)
    phone = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True, nullable=True)
    password = Column(String, nullable=True)

    home_latitude = Column(Float, nullable=False)
    home_longitude = Column(Float, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    incidents = relationship("Incident", back_populates="user")


# =========================================
# REPORT RECORD MODEL (PERMANENT LOG)
# =========================================
class ReportRecord(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    original_incident_id = Column(Integer, index=True)

    # Core Data
    type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    
    # State tracking at time of archiving / updating
    status = Column(String, default="Pending")
    assigned_team = Column(String, default="Not Assigned")
    
    # Metadata
    timestamp = Column(DateTime, default=datetime.utcnow)
    image_path = Column(String, nullable=True)
    user_id = Column(Integer, nullable=True)