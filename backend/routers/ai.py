from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from google import genai
from openai import OpenAI
from core.config import settings
from core.security import get_current_user
from core.database import supabase
import json
from datetime import datetime
from typing import Optional, AsyncGenerator

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
    title: Optional[str] = None

class SaveDivinationRequest(BaseModel):
    lines: list[int]
    interpretation: str
    title: Optional[str] = "起卦测算"

async def call_ai_stream(prompt: str, system_instruction: str = "") -> AsyncGenerator[str, None]:
    """通用 AI 流式调用函数"""
    
    # 尝试使用 OpenAI 兼容接口
    if openai_client:
        try:
            response = openai_client.chat.completions.create(
                model=settings.AI_MODEL,
                messages=[
                    {"role": "system", "content": system_instruction},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6,
                max_tokens=600,
                stream=True
            )
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            return # 成功后退出
        except Exception as e:
            print(f"OpenAI Stream Failed: {e}")
    
    # 尝试使用 Gemini
    if gemini_client:
        try:
            full_prompt = f"{system_instruction}\n\n用户提问：{prompt}"
            response = gemini_client.models.generate_content(
                model='gemini-1.5-flash',
                contents=full_prompt,
                config={'stream': True}
            )
            for chunk in response:
                if chunk.text:
                    yield chunk.text
            return
        except Exception as e:
            print(f"Gemini Stream Failed: {e}")
            
    yield "（系统消息）大师正在闭关，请稍后再试。"

async def call_ai(prompt: str, system_instruction: str = ""):
    """通用非流式调用，用于需要立即获取结果的场景"""
    full_content = ""
    async for chunk in call_ai_stream(prompt, system_instruction):
        full_content += chunk
    return full_content

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
    
    async def generate():
        full_answer = ""
        async for chunk in call_ai_stream(req.query, system_instruction):
            full_answer += chunk
            yield chunk
            
        history_data = {
            "user_id": user.id,
            "title": req.title or req.query[:20],
            "type": "fortune",
            "messages": json.dumps([
                {"role": "user", "content": req.query},
                {"role": "ai", "content": full_answer}
            ]),
            "created_at": datetime.now().isoformat()
        }
        supabase.table("divination_chat_history").insert(history_data).execute()

    return StreamingResponse(generate(), media_type="text/plain")

# --- 大师 2：周易解卦师 (解卦咨询) ---
@router.post("/divination")
async def ask_divination(req: AIQuery, user=Depends(get_current_user)):
    # 提取卦象上下文
    hex_context = ""
    if req.context:
        if "lines" in req.context:
            lines = req.context["lines"]
            line_desc = ", ".join([["老阴", "少阳", "少阴", "老阳"][l-6] for l in lines])
            hex_context += f"\n当前起卦结果数字序列：{lines}。对应的六爻性质：{line_desc}。"
        if "interpretation" in req.context:
            hex_context += f"\n卦象基础解析：\n{req.context['interpretation']}"

    system_instruction = f"""
# Role
你是一位精通《周易》的【深度解卦专家】。

# Context
{hex_context}

# Rules
- **深度结合**：必须以上方的卦象结果和基础解析为核心依据，针对用户的具体问题进行深度拆解。
- **语言风格**：睿智、专业且直白，将易经智慧转化为通俗易懂的建议。
- **排版要求**：使用清晰的 Markdown 标题。标题单独占一行，下方空一行。
- **要求**：采用自然连贯的段落，不要分段过多，字数 200 字左右。

# Output Format
### ☯️ 卦象断语
(空一行)
[简述本卦核心象义及针对提问的吉凶定位]

### 🔍 深度解析
(空一行)
[结合卦象、动爻及用户提问进行详细解答]

### 💡 易理建议
(空一行)
[给出具体的行动指引或心态调整建议]
"""
    
    async def generate():
        full_answer = ""
        async for chunk in call_ai_stream(req.query, system_instruction):
            full_answer += chunk
            yield chunk
            
        # 流式结束后，保存到历史记录
        messages = [
            {"role": "user", "content": req.query},
            {"role": "ai", "content": full_answer}
        ]
        
        if req.context and "interpretation" in req.context:
            messages.insert(0, {"role": "ai", "content": f"【卦象结果】\n{req.context['interpretation']}"})

        history_data = {
            "user_id": user.id,
            "title": req.title or req.query[:20],
            "type": "divination",
            "messages": json.dumps(messages),
            "created_at": datetime.now().isoformat()
        }
        supabase.table("divination_chat_history").insert(history_data).execute()

    return StreamingResponse(generate(), media_type="text/plain")

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
