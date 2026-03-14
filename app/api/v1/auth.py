# app/api/v1/auth.py
from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.api import dependencies
from app.core import security
from app.core.config import settings
from app.models.user import User
from app.schemas.token import Token
from app.services.user_service import UserService

router = APIRouter()

@router.post("/login/access-token", response_model=Token)
def login_access_token(
    db: Session = Depends(dependencies.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    # 1. Authenticate user using the Service layer
    user = UserService.authenticate_user(db, form_data)
    
    # 2. Generate Token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    return {
        "access_token": security.create_access_token(
            data={"username": user.user_login_id}, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }
