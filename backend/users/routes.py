from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from database.db import SessionLocal
from database.models import User

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
# GET ALL USERS
# -----------------------------------------

@router.get("/")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()


# -----------------------------------------
# CREATE USER (Admin)
# -----------------------------------------

@router.post("/")
def create_user(
    name: str = Form(...),
    phone: str = Form(...),
    alert_radius: float = Form(...),
    db: Session = Depends(get_db)
):

    existing = db.query(User).filter(User.phone == phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        name=name,
        phone=phone,
        alert_radius=alert_radius
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# -----------------------------------------
# DELETE USER
# -----------------------------------------

@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": "User deleted"}