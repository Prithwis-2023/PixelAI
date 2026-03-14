# app/services/user_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.models.user import User
from app.core import security
from app.core.config import settings

class UserService:
    @staticmethod
    def authenticate_user(db: Session, form_data: OAuth2PasswordRequestForm) -> User:
        """
        Check if user exists and verify password.
        Returns the User object if authentication is successful, otherwise raises HTTPException.
        """
        user = db.query(User).filter(User.user_login_id == form_data.username).first()
        
        if not user or not security.verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect login ID or password"
            )
            
        return user

    @staticmethod
    def create_user(db: Session, user_in) -> User:
        """
        Create a new user in the DB with hashed password and generated hash_id.
        Raises 400 if user_login_id already exists.
        """
        import uuid
        from app.services.github_service import GithubService
        
        # 1. Check if user already exists
        existing_user = db.query(User).filter(User.user_login_id == user_in.user_login_id).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="The user with this login ID already exists in the system."
            )
            
        # 2. Hash password & Generate Hash ID
        hashed_password = security.get_password_hash(user_in.password)
        new_hash_id = uuid.uuid4().hex
        
        # 3. Create DB model instance (without github_url first)
        db_user = User(
            user_login_id=user_in.user_login_id,
            password_hash=hashed_password,
            user_hash_id=new_hash_id
        )
        
        # 4. Allocate Github Repo URL via separate service
        allocated_url = GithubService.allocate_github_repo(db_user)
        db_user.github_url = allocated_url
        
        # 5. Save to DB
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
