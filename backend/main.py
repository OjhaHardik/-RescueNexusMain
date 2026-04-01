# =========================================
# MAIN APPLICATION FILE
# -----------------------------------------
# Handles:
# - API setup
# - CORS
# - Static file serving
# - Incident CRUD
# - User validation during submission
# =========================================

import math
import os
from typing import List

from PIL import Image
from fastapi import FastAPI, Depends, HTTPException, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from backend.services.mail import send_email
from backend.schemas import IncidentResponse
from backend.users.routes import router as users_router
from backend.auth.routes import router as auth_router
from database.db import engine, SessionLocal, Base
from database.models import Incident, User

from backend.services.sms import send_sms

from pydantic import BaseModel

from modules.severity import calculate_severity

# =========================================
# BROADCAST REQUEST MODEL
# =========================================
class BroadcastRequest(BaseModel):
    message: str

# =========================================
# APP INITIALIZATION
# =========================================

app = FastAPI()
app.include_router(auth_router)
app.include_router(users_router)


# =========================================
# CORS CONFIGURATION
# =========================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:5500",
        "http://localhost:5500"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================================
# STATIC FILE SERVING (UPLOADS)
# =========================================

app.mount("/uploads", StaticFiles(directory="backend/uploads"), name="uploads")


# =========================================
# CREATE TABLES (IF NOT EXIST)
# =========================================

Base.metadata.create_all(bind=engine)


# =========================================
# DATABASE SESSION DEPENDENCY
# =========================================

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# =========================================
# ROOT CHECK
# =========================================

@app.get("/")
def root():
    return {"message": "RescueNexus API Running"}


# =========================================
# CREATE INCIDENT (WITH USER VALIDATION)
# =========================================


@app.post("/incidents/", response_model=IncidentResponse)

def create_incident(
    incident_type: str = Form(...),
    description: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),

    user_id: int = Form(...),  # 🔥 required logged-in user
    image: UploadFile = File(None),
    db: Session = Depends(get_db)
):

    # -----------------------------------------
    # VALIDATE USER EXISTS
    # -----------------------------------------
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="Invalid user")

    image_path = None

    # -----------------------------------------
    # HANDLE IMAGE UPLOAD (IF PROVIDED)
    # -----------------------------------------
    if image:
        upload_folder = "backend/uploads"
        os.makedirs(upload_folder, exist_ok=True)

        file_location = os.path.join(upload_folder, image.filename)

        # Open and compress image
        img = Image.open(image.file)

        # Resize large images
        max_size = (800, 800)
        img.thumbnail(max_size)

        img.save(file_location, optimize=True, quality=70)

        image_path = f"/uploads/{image.filename}"

    # -----------------------------------------
    # AUTO CALCULATE SEVERITY
    # -----------------------------------------
    auto_severity = calculate_severity(description, incident_type)

    incident_type = incident_type

    # -----------------------------------------
    # CREATE INCIDENT RECORD
    # -----------------------------------------
    db_incident = Incident(
        type=incident_type,
        description=description,
        latitude=latitude,
        longitude=longitude,
        severity=auto_severity,
        image_path=image_path,
        user_id=user_id
    )

    db.add(db_incident)
    db.commit()
    db.refresh(db_incident)

    return db_incident


# =========================================
# GET ALL INCIDENTS
# =========================================

@app.get("/incidents/", response_model=List[IncidentResponse])
def get_incidents(db: Session = Depends(get_db)):
    return db.query(Incident).all()


# =========================================
# UPDATE INCIDENT STATUS
# =========================================

@app.put("/incidents/{incident_id}")
def update_incident(
    incident_id: int,
    status: str,
    assigned_team: str,
    db: Session = Depends(get_db)
):
    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    incident.status = status
    incident.assigned_team = assigned_team

    db.commit()
    db.refresh(incident)

    return incident


# =========================================
# DELETE INCIDENT (ONLY IF RESOLVED)
# =========================================

@app.delete("/incidents/{incident_id}")
def delete_incident(incident_id: int, db: Session = Depends(get_db)):

    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    if incident.status != "Resolved":
        raise HTTPException(
            status_code=400,
            detail="Only resolved incidents can be deleted"
        )

    # Delete image file if exists
    if incident.image_path:
        file_path = "backend" + incident.image_path
        if os.path.exists(file_path):
            os.remove(file_path)

    db.delete(incident)
    db.commit()

    return {"message": "Incident deleted"}

# =========================================
# CALCULATE DISTANCE Haversine formula
# =========================================
def calculate_distance(lat1, lon1, lat2, lon2):
    R = 6371
    d_lat = math.radians(lat2 - lat1)
    d_lon = math.radians(lon2 - lon1)

    a = (
        math.sin(d_lat/2)**2 +
        math.cos(math.radians(lat1)) *
        math.cos(math.radians(lat2)) *
        math.sin(d_lon/2)**2
    )

    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1-a))
    return R * c

# =========================================
# BROADCAST ALERT
# =========================================

@app.post("/broadcast/{incident_id}")
def broadcast_alert(
    incident_id: int,
    radius: float,
    method: str = "all",   # 👈 ADD THIS
    db: Session = Depends(get_db)
):

    incident = db.query(Incident).filter(Incident.id == incident_id).first()

    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    users = db.query(User).all()
    notified_users = []

    # -----------------------------------------
    # AUTO GENERATE MESSAGE
    # -----------------------------------------

    maps_link = f"https://maps.google.com/?q={incident.latitude},{incident.longitude}"

    message = (
        f"RescueNexus Emergency Alert\n\n"
        f"Incident: {incident.type}\n"
        f"Severity: {incident.severity}\n\n"
        f"Location:\n{maps_link}\n\n"
        f"Stay alert and avoid the area."
    )

    for user in users:

        if user.home_latitude is None or user.home_longitude is None:
            continue

        distance = calculate_distance(
            incident.latitude,
            incident.longitude,
            user.home_latitude,
            user.home_longitude
        )

        if distance <= radius:

            sent = False  # 👈 track if THIS user got any alert

            if method in ["sms", "all"]:
                send_sms(user.phone, message)
                sent = True

            if method in ["email", "all"] and user.email:
                send_email(user.email, message)
                sent = True

            if sent:
                notified_users.append(user.phone)

    return {
        "incident_id": incident.id,
        "alerts_sent": len(notified_users)
    }