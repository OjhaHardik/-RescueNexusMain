import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.dirname(BASE_DIR)

DATABASE_PATH = os.path.join(PROJECT_ROOT, "data", "rescue.db")

DATABASE_URL = "postgresql://postgres:root@localhost:5432/rescuenexus"

engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
