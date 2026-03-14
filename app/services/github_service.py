# app/services/github_service.py
from app.models.user import User

class GithubService:
    @staticmethod
    def allocate_github_repo(user: User) -> str:
        """
        temporary code
        """
        #example
        new_repo_url = f"https://github.com/PixelAI/{user.user_login_id}-workspace"
        
        return new_repo_url
