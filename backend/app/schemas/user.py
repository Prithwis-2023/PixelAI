from pydantic import BaseModel
from datetime import datetime

class UserBase(BaseModel):
    user_login_id: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: str
    user_hash_id: str
    github_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True