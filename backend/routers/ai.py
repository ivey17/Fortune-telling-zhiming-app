from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google import genai
from core.config import settings
from core.security import get_current_user
from core.database import supabase
import json
from datetime import datetime

router = APIRouter()

client = None
if settings.GEMINI_API_KEY:
    client = genai.Client(api_key=settings.GEMINI_API_KEY)

class AIQuery(BaseModel):
    query: str
    context: dict = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []

@router.post("/fortune")
async def ask_fortune(req: AIQuery, user=Depends(get_current_user)):
    if not client:
        # Mock response if no API key
        return {"content": f"（Mock）针对您问的“{req.query}”，星象显示今日利于所问之事。", "tokensUsed": 42}
    
    prompt = f"用户提问：{req.query}。请用易经命理的口吻简短回答。"
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        answer = response.text
        
        # Save to history
        try:
            history_data = {
                "user_id": user.id,
                "title": req.query[:20] + "..." if len(req.query) > 20 else req.query,
                "type": "AI 运势查询",
                "messages": json.dumps([
                    {"role": "user", "content": req.query},
                    {"role": "ai", "content": answer}
                ]),
                "created_at": datetime.now().isoformat()
            }
            supabase.table("fortune_chat_history").insert(history_data).execute()
        except Exception as e:
            print(f"Failed to save history: {e}")

        return {"content": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/divination")
async def ask_divination(req: AIQuery, user=Depends(get_current_user)):
    if not client:
        return {"content": f"（Mock）关于“{req.query}”，本卦与变卦暗示事物正由阻滞转向顺遂。"}
    
    prompt = f"用户占卜提问：{req.query}。请以易经起卦解析的口吻简短回答。"
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        answer = response.text
        
        try:
            history_data = {
                "user_id": user.id,
                "title": req.query[:20] + "..." if len(req.query) > 20 else req.query,
                "type": "AI 起卦追问",
                "messages": json.dumps([
                    {"role": "user", "content": req.query},
                    {"role": "ai", "content": answer}
                ]),
                "created_at": datetime.now().isoformat()
            }
            supabase.table("divination_chat_history").insert(history_data).execute()
        except Exception as e:
            print(f"Failed to save history: {e}")

        return {"content": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
