# app/db/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

# 1. create DB engine
engine = create_engine(
    settings.DATABASE_URL,
    # pooling
    pool_pre_ping=True, 
    pool_size=5,
    max_overflow=10
)

# 2. create database session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 3. create base class for ORM models
Base = declarative_base()