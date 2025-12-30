from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional



class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    password: str = Field(..., min_length=6)


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    created_at: datetime

    class Config:
        from_attributes = True



class CodeAnalysisCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    code_content: str = Field(..., min_length=1, max_length=50000)
    language: str = Field(..., min_length=1, max_length=50)


class CodeAnalysisResponse(BaseModel):
    id: int
    title: str
    code_content: str
    language: str
    status: str
    result: Optional[str] = None
    created_at: datetime
    completed_at: Optional[datetime] = None
    owner_id: int

    class Config:
        from_attributes = True