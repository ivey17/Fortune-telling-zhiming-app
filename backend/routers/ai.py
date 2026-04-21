from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from google import genai
from openai import OpenAI
from core.config import settings
from core.security import get_current_user
from core.database import supabase
import json
from datetime import datetime
from typing import Optional

router = APIRouter()

# --- AI 客户端初始化 ---

# Gemini 客户端
gemini_client = None
if settings.GEMINI_API_KEY:
    try:
        gemini_client = genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception as e:
        print(f"Gemini init failed: {e}")

# 通用 OpenAI 兼容客户端 (如 DeepSeek, OpenAI, Moonshot 等)
openai_client = None
if settings.AI_API_KEY:
    try:
        openai_client = OpenAI(
            api_key=settings.AI_API_KEY,
            base_url=settings.AI_BASE_URL
        )
    except Exception as e:
        print(f"OpenAI client init failed: {e}")

class AIQuery(BaseModel):
    query: str
    context: dict = None

class SaveDivinationRequest(BaseModel):
    lines: list[int]
    interpretation: str
    title: Optional[str] = "起卦测算"

async def call_ai(prompt: str, system_instruction: str = ""):
    """通用 AI 调用函数，优先使用 OpenAI 兼容接口，备选 Gemini"""
    
    # 尝试使用 OpenAI 兼容接口 (如 DeepSeek)
    if openai_client:
        try:
            response = openai_client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=600
            )
            return response.choices[0].message.content
        except Exception as e:
            print(f"OpenAI Call Failed: {e}")
    
    # 尝试使用 Gemini
    if gemini_client:
        try:
            full_prompt = f"{system_instruction}\n\n用户提问：{prompt}"
            response = gemini_client.models.generate_content(
                model='gemini-1.5-flash',
                contents=full_prompt,
            )
            return response.text
        except Exception as e:
            print(f"Gemini Call Failed: {e}")
            
    return None

# --- 大师 1：玄空命理师 (运势咨询) ---
@router.post("/fortune")
async def ask_fortune(req: AIQuery, user=Depends(get_current_user)):
    system_instruction = """
# Role
你是一位精通玄空风水与子平八字的【玄空命理师】。

# Rules
- **排版要求**：标题（如 ### 🌟 星象概说）必须单独占据一行，标题下方必须空一行。段落之间必须使用双换行符（空一行）。
- **语言风格**：专业且通俗。玄学术语（如“五行生克”）必须用现代生活化的语言解释。
- **效率**：言简意赅，直击要点，不要铺垫废话，直接输出结论。
- **禁忌**：严禁预测生死、博彩。

# Output Format
### 🌟 星象概说
(这里必须先换行)
[简述当前能量场]

### 🏮 详尽解析
(这里必须先换行)
[针对提问进行深度拆解，每段说明一个重点，段间空一行]

### 🕯️ 趋吉建议
(这里必须先换行)
- [建议1：具体做法]
- [建议2：避忌或开运方案]

# Constraint
字数控制在 150-200 字之间。
"""
    
    answer = await call_ai(req.query, system_instruction)
    
    if not answer:
        answer = "（系统消息）大师正在闭关，星象显示今日暂不宜多言，请稍后再试。"
    
    # 保存历史
    try:
        history_data = {
            "user_id": user.id,
            "title": req.query[:20],
            "type": "AI 运势查询",
            "messages": json.dumps([
                {"role": "user", "content": req.query},
                {"role": "ai", "content": answer}
            ]),
            "created_at": datetime.now().isoformat()
        }
        supabase.table("fortune_chat_history").insert(history_data).execute()
    except: pass

    return {"content": answer}

# --- 大师 2：周易解卦师 (解卦咨询) ---
@router.post("/divination")
async def ask_divination(req: AIQuery, user=Depends(get_current_user)):
    # 提取卦象上下文
    hex_context = ""
    if req.context and "lines" in req.context:
        lines = req.context["lines"]
        line_desc = ", ".join([["老阴", "少阳", "少阴", "老阳"][l-6] for l in lines])
        hex_context = f"\n当前起卦结果（初爻至上爻）：{line_desc}。"

    system_instruction = f"""
# Role
你是一位专注于《周易》卦辞解析的【周易解卦师】。

# Context
{hex_context}

# Rules
- **深度结合**：必须以卦象结果为核心依据进行解析。
- **语言风格**：睿智且直白，将易经智慧转化为通俗易懂的建议。
- **排版要求**：标题（如 ### ☯️ 卦象断语）必须单独占据一行，标题下方必须空一行。段落之间必须使用双换行符（空一行）。
- **效率**：直接进入主题，减少背景铺垫。

# Output Format
### ☯️ 卦象断语
(这里必须先换行)
[简述本卦核心象义及吉凶定位]

### 🔍 所求解析
(这里必须先换行)
[针对用户具体提问，结合动爻进行分段拆解，段间空一行]

### 💡 易理启示
(这里必须先换行)
[给出的行动指引或心态调整建议]

# Constraint
字数控制在 200 字左右。
"""
    
    answer = await call_ai(req.query, system_instruction)
    
    if not answer:
        answer = "（系统消息）卦象模糊，乾坤未定，请重新整理思绪后再试。"
        
    # 保存历史
    try:
        history_data = {
            "user_id": user.id,
            "title": req.query[:20],
            "type": "AI 起卦追问",
            "messages": json.dumps([
                {"role": "user", "content": req.query},
                {"role": "ai", "content": answer}
            ]),
            "created_at": datetime.now().isoformat()
        }
        supabase.table("divination_chat_history").insert(history_data).execute()
    except: pass

    return {"content": answer}

@router.post("/save-divination")
async def save_divination(req: SaveDivinationRequest, user=Depends(get_current_user)):
    try:
        history_data = {
            "user_id": user.id,
            "title": req.title,
            "type": "divination",
            "messages": json.dumps([
                {"role": "ai", "content": req.interpretation}
            ]),
            "created_at": datetime.now().isoformat()
        }
        supabase.table("divination_chat_history").insert(history_data).execute()
        return {"message": "Saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
