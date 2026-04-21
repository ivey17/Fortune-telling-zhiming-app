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
        print(f"Initializing OpenAI client with API key: {settings.AI_API_KEY[:10]}...")
        print(f"Base URL: {settings.AI_BASE_URL}")
        print(f"Model: {settings.AI_MODEL}")
        openai_client = OpenAI(
            api_key=settings.AI_API_KEY,
            base_url=settings.AI_BASE_URL
        )
        print("OpenAI client initialized successfully")
    except Exception as e:
        print(f"OpenAI client init failed: {e}")
from typing import Any

class AIQuery(BaseModel):
    query: str
    context: Any = None
    title: Optional[str] = None
    save_history: bool = True
    history_id: Optional[str] = None # 用于指定追加到哪个记录

class SaveDivinationRequest(BaseModel):
    lines: list[int]
    interpretation: str
    title: Optional[str] = "起卦测算"

async def call_ai_stream(prompt: str, system_instruction: str = "") -> AsyncGenerator[str, None]:
    """通用 AI 流式调用函数"""
    
    print(f"=== call_ai_stream called ===")
    print(f"Prompt: {prompt[:50]}...")
    print(f"System instruction: {system_instruction[:50]}...")
    print(f"GEMINI_API_KEY configured: {bool(settings.GEMINI_API_KEY)}")
    print(f"AI_API_KEY configured: {bool(settings.AI_API_KEY)}")
    print(f"AI_BASE_URL: {settings.AI_BASE_URL}")
    print(f"AI_MODEL: {settings.AI_MODEL}")
    
    # 检查 API 密钥是否配置
    if not settings.GEMINI_API_KEY and not settings.AI_API_KEY:
        # 模拟模式：返回预设内容
        print("=== No API key configured, using mock mode ===")
        if "今日灵启" in system_instruction or "灵启" in prompt:
            yield "今日阳光明媚，万物复苏。宜保持积极心态，抓住机会，勇往直前。在工作中，你可能会遇到一些挑战，但只要保持专注和耐心，就能克服困难。感情方面，与家人朋友多沟通，增进感情。财运方面，适合稳健投资，不宜冒险。"
        elif "命盘" in system_instruction or "命理" in prompt:
            yield "你是一个性格开朗、积极向上的人，做事认真负责，有较强的责任感和使命感。你注重家庭和朋友，善于与人沟通和合作。在事业方面，你有较强的进取心和竞争力，适合从事需要创意和挑战的工作。财运方面，你理财能力较强，善于规划和管理财务。感情方面，你重视感情，对待爱情专一，适合寻找志同道合的伴侣。"
        else:
            yield "欢迎咨询，我是知命AI助手。由于系统尚未配置API密钥，我目前只能提供有限的回答。请联系管理员配置API密钥以获得更准确的命理分析。"
        return
    
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
                max_tokens=1200,
                stream=True
            )
            for chunk in response:
                content = chunk.choices[0].delta.content
                if content:
                    yield content
            return # 成功后退出
        except Exception as e:
            print(f"OpenAI 接口调用失败: {str(e)}")
            yield "（星象波动）天机暂时模糊，请稍后再试。"
            return
    
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
                    # 简单过滤可能出现的 HTML 报错
                    if chunk.text.strip().startswith("<!DOCTYPE") or chunk.text.strip().startswith("<html"):
                        yield "（星象波动）天机暂时模糊，请稍后再试。"
                        return
                    yield chunk.text
            return
        except Exception as e:
            print(f"Gemini 接口调用失败: {str(e)}")
            yield "（星象波动）天机暂时模糊，请稍后再试。"
            return
            
    # 模拟模式：当 API 调用失败时
    if "今日灵启" in system_instruction or "灵启" in prompt:
        yield "今日阳光明媚，万物复苏。宜保持积极心态，抓住机会，勇往直前。在工作中，你可能会遇到一些挑战，但只要保持专注和耐心，就能克服困难。感情方面，与家人朋友多沟通，增进感情。财运方面，适合稳健投资，不宜冒险。"
    elif "命盘" in system_instruction or "命理" in prompt:
        yield "你是一个性格开朗、积极向上的人，做事认真负责，有较强的责任感和使命感。你注重家庭和朋友，善于与人沟通和合作。在事业方面，你有较强的进取心和竞争力，适合从事需要创意和挑战的工作。财运方面，你理财能力较强，善于规划和管理财务。感情方面，你重视感情，对待爱情专一，适合寻找志同道合的伴侣。"
    else:
        yield "欢迎咨询，我是知命AI助手。由于系统暂时无法连接到AI服务，我目前只能提供有限的回答。请稍后再试，或联系管理员检查API配置。"



async def call_ai(prompt: str, system_instruction: str = ""):
    """通用非流式调用，用于需要立即获取结果的场景"""
    full_content = ""
    async for chunk in call_ai_stream(prompt, system_instruction):
        full_content += chunk
    return full_content

# --- 大师 1：玄空命理师 (运势咨询) ---
@router.post("/fortune")
async def ask_fortune(req: AIQuery, user=Depends(get_current_user)):
    # 特殊处理：今日灵启与命盘简评指令隐藏在后端，不在前端暴露，也不存入历史记录
    is_spirit_diary = req.query.startswith("__GENERATE_SPIRIT_DIARY__")
    is_bazi_analysis = req.query.startswith("__GENERATE_BAZI_ANALYSIS__")
    actual_query = req.query
    should_save = req.save_history and not (is_spirit_diary or is_bazi_analysis)

    if is_spirit_diary:
        try:
            parts = req.query.split(":")
            gan_zhi = parts[1] if len(parts) > 1 else "未知"
            ri_zhu = parts[2] if len(parts) > 2 else "未知"
            actual_query = f"请作为生活洞察者，根据今日干支[{gan_zhi}]为日主[{ri_zhu}]写一段今日灵启。要求：1.采用自然连贯的段落，严禁使用 ### 或列表符号。2.字数在80字左右，用语亲切、现代、有启发感。3.重点描述今日的心境建议或行动契机，不要有说教感。"
        except:
            actual_query = "请为我生成一段今日灵启。"
    elif is_bazi_analysis:
        try:
            parts = req.query.split(":")
            ri_zhu = parts[1] if len(parts) > 1 else "未知"
            actual_query = f"请作为资深命理顾问，为日主[{ri_zhu}]提供一份专业的人格简评。要求：1.采用自然连贯的段落，严禁使用 ### 或列表符号分段。2.字数在100字左右，用语通俗、精准、沉稳。3.重点点出性格底色与发展建议，不要有大师语气的废话。"
        except:
            actual_query = "请为我生成一段命理人格简评。"

    # 系统指令定义
    general_instruction = """
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

    spirit_diary_instruction = """
你是一位生活洞察者与命理大师。
你的任务是生成一段“今日灵启”：
1. **必须是单一自然段**，严禁使用标题、严禁使用列表（如 - 或 • 或 1.）。
2. 用语优雅、现代、精炼。
3. 字数控制在 60-80 字。
4. 直接输出内容，不要有任何开场白。
"""

    system_instruction = spirit_diary_instruction if is_spirit_diary else general_instruction
    
    async def generate():
        today_str = datetime.now().strftime("%Y-%m-%d")
        
        # 对于“今日灵启”，先检查今日是否已经生成过并保存了
        if is_spirit_diary and user:
            existing_diary = supabase.table("divination_chat_history") \
                .select("*") \
                .eq("user_id", user.id) \
                .eq("type", "fortune") \
                .eq("title", "今日灵启") \
                .gte("created_at", today_str + "T00:00:00") \
                .lte("created_at", today_str + "T23:59:59") \
                .execute()
            
            if existing_diary.data and len(existing_diary.data) > 0:
                # 发现今日已生成的灵启，直接返回缓存内容，不消耗 AI Token
                record = existing_diary.data[0]
                try:
                    msgs = json.loads(record["messages"])
                    if msgs and len(msgs) > 0:
                        yield msgs[0]["content"] # 灵启通常是单条 AI 消息
                        return
                except:
                    pass

        full_answer = ""
        async for chunk in call_ai_stream(actual_query, system_instruction):
            full_answer += chunk
            yield chunk
            
        # 只有在需要保存时才记录历史
        if user and (should_save or is_spirit_diary):
            # 特殊逻辑：灵启也要保存，但作为特殊的“缓存”记录
            save_title = "今日灵启" if is_spirit_diary else (req.title or (today_str + " 运势咨询"))
            
            # 查找今日是否已有记录
            # 如果是灵启，查找灵启记录；如果是普通对话，查找普通对话记录
            existing = supabase.table("divination_chat_history") \
                .select("*") \
                .eq("user_id", user.id) \
                .eq("type", "fortune") \
                .eq("title", save_title if is_spirit_diary else save_title) \
                .gte("created_at", today_str + "T00:00:00") \
                .lte("created_at", today_str + "T23:59:59") \
                .order("created_at", desc=True) \
                .execute()
            
            new_msgs = [
                {"role": "user", "content": req.query},
                {"role": "ai", "content": full_answer}
            ] if not is_spirit_diary else [
                {"role": "ai", "content": full_answer} # 灵启只存结果
            ]

            if existing.data and len(existing.data) > 0:
                # 追加到现有记录（如果是普通对话）
                existing_record = existing.data[0]
                try:
                    old_msgs = json.loads(existing_record["messages"])
                except:
                    old_msgs = []
                combined_msgs = old_msgs + new_msgs
                
                update_data = {"messages": json.dumps(combined_msgs)}
                # 只有在非灵启情况下才可能更新标题
                if not is_spirit_diary and ("运势咨询" in existing_record["title"]) and req.title:
                    update_data["title"] = req.title

                supabase.table("divination_chat_history") \
                    .update(update_data) \
                    .eq("id", existing_record["id"]) \
                    .execute()
            else:
                # 创建新记录
                history_data = {
                    "user_id": user.id,
                    "title": save_title,
                    "type": "fortune",
                    "messages": json.dumps(new_msgs),
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
            
        # 只有在用户已登录且需要保存时才记录历史
        if user and req.save_history:
            new_msgs = [
                {"role": "user", "content": req.query},
                {"role": "ai", "content": full_answer}
            ]

            # 如果提供了 history_id，尝试追加到该记录
            if req.history_id:
                existing = supabase.table("divination_chat_history").select("messages").eq("id", req.history_id).execute()
                if existing.data:
                    old_msgs = json.loads(existing.data[0]["messages"])
                    combined_msgs = old_msgs + new_msgs
                    supabase.table("divination_chat_history").update({"messages": json.dumps(combined_msgs)}).eq("id", req.history_id).execute()
                    return

            # 如果没有 history_id 或没找到，创建新记录（回退逻辑）
            messages = new_msgs
            if req.context and "interpretation" in req.context:
                messages.insert(0, {"role": "ai", "content": f"【卦象结果】\n{req.context['interpretation']}"})

            history_data = {
                "user_id": user.id,
                "title": req.title or req.query[:20],
                "type": "divination",
                "messages": json.dumps(messages),
                "created_at": datetime.now().isoformat()
            }
            try:
                supabase.table("divination_chat_history").insert(history_data).execute()
            except Exception as e:
                print(f"Save history failed: {e}")

    return StreamingResponse(generate(), media_type="text/plain")

@router.post("/save-divination")
async def save_divination(req: SaveDivinationRequest, user=Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    
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
        res = supabase.table("divination_chat_history").insert(history_data).execute()
        if res.data and len(res.data) > 0:
            return {"id": res.data[0]["id"], "message": "Saved successfully"}
        return {"message": "Saved successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
