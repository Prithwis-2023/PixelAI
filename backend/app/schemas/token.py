from pydantic import BaseModel

#define token schema and datastructure frome token

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None