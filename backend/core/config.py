import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load .env file from project root
base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
env_path = os.path.join(base_dir, '.env')
load_dotenv(env_path)
print(f"Loaded .env file from: {env_path}")

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
