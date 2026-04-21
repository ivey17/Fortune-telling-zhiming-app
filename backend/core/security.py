import jwt
from datetime import datetime, timedelta
from fastapi import Depends, HTTPException, Header
from pydantic import BaseModel
from core.config import settings
from typing import Optional

import bcrypt

class CurrentUser(BaseModel):
    id: str
    phone: str

def verify_password(plain_password, hashed_password):
    try:
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
    except ValueError:
        return False

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=7)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(authorization: str = Header(None)) -> Optional[CurrentUser]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ")[1]
    
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        user_id: str = payload.get("sub")
        phone: str = payload.get("phone")
        if user_id is None:
            return None
        return CurrentUser(id=user_id, phone=phone)
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return None
