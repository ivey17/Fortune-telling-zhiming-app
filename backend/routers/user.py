from fastapi import APIRouter, Depends
from core.security import get_current_user, CurrentUser
from core.database import supabase

router = APIRouter()

@router.get("/profile")
async def get_profile(user: CurrentUser = Depends(get_current_user)):
    try:
        res = supabase.table("app_users").select("id, phone, nickname, membership_level, created_at").eq("id", user.id).execute()
        if res.data and len(res.data) > 0:
            return res.data[0]
        else:
            return {
                "id": user.id,
                "nickname": "知命行者",
                "membership_level": "none"
            }
    except Exception as e:
        print(f"Error fetching profile: {e}")
        return {
            "id": user.id,
            "nickname": "知命行者",
            "membership_level": "none"
        }

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
