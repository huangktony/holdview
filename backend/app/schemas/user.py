from pydantic import BaseModel, EmailStr, field_validator
from datetime import datetime

MIN_PASSWORD_LENGTH = 8

class UserCreate(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password_length(cls, value: str) -> str:
        if len(value) < MIN_PASSWORD_LENGTH:
            raise ValueError(f"Password must be at least {MIN_PASSWORD_LENGTH} characters")
        return value


class UserResponse(BaseModel):
    id: int
    email: EmailStr

    class Config:
        from_attributes = True