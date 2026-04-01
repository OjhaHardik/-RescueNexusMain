from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database.db import SessionLocal
from database.models import User

router = APIRouter()

# -------------------------------
# REQUEST MODELS
# -------------------------------


class LoginRequest(BaseModel):
    phone: str
    password: str


# -------------------------------
# REGISTER USER
# -------------------------------

class RegisterRequest(BaseModel):
    name: str
    phone: str
    email: str
    password: str
    home_latitude: float
    home_longitude: float

@router.post("/register")
def register(data: RegisterRequest):

    session = SessionLocal()

    existing = session.query(User).filter(User.phone == data.phone).first()
    if existing:
        session.close()
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        name=data.name,
        phone=data.phone,
        email=data.email,
        password=data.password,
        home_latitude=data.home_latitude,
        home_longitude=data.home_longitude
    )

    session.add(user)
    session.commit()
    session.close()

    return {"message": "User registered successfully"}

# -------------------------------
# LOGIN USER
# -------------------------------

@router.post("/login")
def login(data: LoginRequest):

    session = SessionLocal()

    user = session.query(User).filter(User.phone == data.phone).first()

    if not user or user.password != data.password:
        session.close()
        raise HTTPException(status_code=401, detail="Invalid credentials")

    session.close()

    return {
        "message": "Login successful",
        "user_id": user.id,
        "name": user.name
    }