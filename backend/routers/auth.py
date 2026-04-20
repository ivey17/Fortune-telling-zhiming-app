import uuid
from datetime import datetime
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from core.database import supabase
from core.security import get_password_hash, verify_password, create_access_token

router = APIRouter()

class AuthRequest(BaseModel):
    phone: str
    password: str

class AuthResponse(BaseModel):
    access_token: str
    user_id: str

@router.post("/register", response_model=AuthResponse)
async def register(req: AuthRequest):
    # Check if phone already exists
    res = supabase.table("app_users").select("id").eq("phone", req.phone).execute()
    if res.data and len(res.data) > 0:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    user_id = str(uuid.uuid4())
    hashed_password = get_password_hash(req.password)

    new_user = {
        "id": user_id,
        "phone": req.phone,
        "password_hash": hashed_password,
        "nickname": f"知命行者_{req.phone[-4:]}",
        "membership_level": "none",
        "created_at": datetime.utcnow().isoformat()
    }

    try:
        supabase.table("app_users").insert(new_user).execute()
    except Exception as e:
        print(f"Error registering user: {e}")
        raise HTTPException(status_code=500, detail="Registration failed due to database error")

    token = create_access_token(data={"sub": user_id, "phone": req.phone})
    return AuthResponse(access_token=token, user_id=user_id)

@router.post("/login", response_model=AuthResponse)
async def login(req: AuthRequest):
    res = supabase.table("app_users").select("*").eq("phone", req.phone).execute()
    if not res.data or len(res.data) == 0:
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    user = res.data[0]
    if not verify_password(req.password, user.get("password_hash")):
        raise HTTPException(status_code=401, detail="Invalid phone number or password")

    user_id = user.get("id")
    token = create_access_token(data={"sub": user_id, "phone": req.phone})
    return AuthResponse(access_token=token, user_id=user_id)
