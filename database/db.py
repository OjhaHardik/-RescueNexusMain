from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import NullPool

from config import DATABASE_URL, IS_VERCEL

if IS_VERCEL:
    # Serverless functions are short-lived; don't hold pooled connections
    engine = create_engine(DATABASE_URL, echo=False, poolclass=NullPool)
else:
    engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)

SessionLocal = sessionmaker(bind=engine)

Base = declarative_base()
