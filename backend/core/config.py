import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_KEY", "")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    # Generic AI Configuration (OpenAI Compatible)
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_BASE_URL: str = os.getenv("AI_BASE_URL", "https://api.deepseek.com/v1") # 默认使用 DeepSeek
    AI_MODEL: str = os.getenv("AI_MODEL", "deepseek-chat")
    
    JWT_SECRET: str = os.getenv("JWT_SECRET", "super-secret-zhiming-key-123")
    JWT_ALGORITHM: str = "HS256"

settings = Settings()
