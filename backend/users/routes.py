from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import User, Incident

router = APIRouter(prefix="/users", tags=["Users"])


# -----------------------------------------
# DB SESSION
# -----------------------------------------

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# -----------------------------------------
# PUBLIC USER FIELDS (never expose password)
# -----------------------------------------

def serialize_user(user: User):
    return {
        "id": user.id,
        "name": user.name,
        "phone": user.phone,
        "email": user.email,
        "home_latitude": user.home_latitude,
        "home_longitude": user.home_longitude,
        "created_at": user.created_at,
    }


# -----------------------------------------
# GET ALL USERS
# -----------------------------------------

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return [serialize_user(u) for u in db.query(User).all()]


# -----------------------------------------
# CREATE USER (Admin)
# -----------------------------------------

@router.post("/")
def create_user(
    name: str = Form(...),
    phone: str = Form(...),
    home_latitude: float = Form(...),
    home_longitude: float = Form(...),
    email: str = Form(None),
    password: str = Form(None),
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(User.phone == phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        name=name,
        phone=phone,
        email=email,
        password=password,
        home_latitude=home_latitude,
        home_longitude=home_longitude
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return serialize_user(new_user)


# -----------------------------------------
# DELETE USER
# -----------------------------------------

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Keep the user's incidents, just detach them (avoids FK violation)
    db.query(Incident).filter(Incident.user_id == user_id).update({Incident.user_id: None})

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}
