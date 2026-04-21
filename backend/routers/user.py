from fastapi import APIRouter, Depends
from core.security import get_current_user, CurrentUser
from core.database import supabase

from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class ProfileUpdateRequest(BaseModel):
    nickname: Optional[str] = None
    birth_date: Optional[str] = None
    gender: Optional[str] = None
    avatar_url: Optional[str] = None

@router.get("/profile")
async def get_profile(user: CurrentUser = Depends(get_current_user)):
    try:
        # Use select("*") to be robust against missing columns like avatar_url
        res = supabase.table("app_users").select("*").eq("id", user.id).execute()
        
        if res.data and len(res.data) > 0:
            profile = res.data[0]
            # Ensure avatar_url exists in the returned dict even if missing in DB
            if "avatar_url" not in profile:
                profile["avatar_url"] = None
            return profile
        else:
            # User not found in app_users, return default
            return {
                "id": user.id,
                "nickname": "知命行者",
                "membership_level": "none",
                "birth_date": None,
                "gender": "male",
                "avatar_url": None
            }
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return {
            "id": user.id,
            "nickname": "知命错误",
            "membership_level": "none",
            "birth_date": None,
            "gender": "male",
            "avatar_url": None
        }

@router.post("/profile")
async def update_profile(req: ProfileUpdateRequest, user: CurrentUser = Depends(get_current_user)):
    try:
        update_data = {}
        if req.nickname is not None:
            update_data["nickname"] = req.nickname
        if req.birth_date is not None:
            update_data["birth_date"] = req.birth_date
        if req.gender is not None:
            update_data["gender"] = req.gender
        if req.avatar_url is not None:
            update_data["avatar_url"] = req.avatar_url
            
        if not update_data:
            return {"message": "No data to update"}
            
        try:
            supabase.table("app_users").update(update_data).eq("id", user.id).execute()
        except Exception as e:
            if "avatar_url" in str(e) and "avatar_url" in update_data:
                # Retry without avatar_url if the column is missing
                del update_data["avatar_url"]
                if update_data:
                    supabase.table("app_users").update(update_data).eq("id", user.id).execute()
            else:
                raise e
                
        return {"message": "Profile updated successfully"}
    except Exception as e:
        print(f"Error updating profile: {e}")
        return {"error": str(e)}

@router.get("/history")
async def get_history(user: CurrentUser = Depends(get_current_user)):
    try:
        fortune_res = supabase.table("fortune_chat_history").select("*").eq("user_id", user.id).execute()
        divination_res = supabase.table("divination_chat_history").select("*").eq("user_id", user.id).execute()
        
        combined_history = (fortune_res.data or []) + (divination_res.data or [])
        
        # Sort by created_at descending
        combined_history.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return combined_history
    except Exception as e:
        print(f"Error fetching history: {e}")
        return []

@router.get("/coupons")
async def get_coupons(user: CurrentUser = Depends(get_current_user)):
    try:
        res = supabase.table("user_coupons").select("*").eq("user_id", user.id).execute()
        return res.data or []
    except Exception as e:
        print(f"Error fetching coupons: {e}")
        return []
