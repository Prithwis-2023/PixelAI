from sqlalchemy import Column, String, DateTime
from sqlalchemy.sql import func
import uuid

from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_login_id = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    user_hash_id = Column(String, unique=True, index=True, nullable=False)
    github_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
