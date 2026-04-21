from supabase import create_client, Client
from .config import settings

class MockSupabase:
    """模拟 Supabase 客户端，用于在没有配置时使用"""
    def table(self, table_name):
        return MockTable()

class MockTable:
    """模拟 Supabase 表，用于在没有配置时使用"""
    def insert(self, data):
        return MockResponse()
    
    def select(self, *args):
        return self
    
    def eq(self, *args):
        return self
    
    def order(self, *args):
        return self
    
    def limit(self, *args):
        return self

class MockResponse:
    """模拟 Supabase 响应，用于在没有配置时使用"""
    def execute(self):
        # 返回一个模拟的响应对象，包含空数据
        class MockData:
            def __init__(self):
                self.data = []
        return MockData()

def get_supabase_client() -> Client:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        # 返回模拟对象，以便在没有配置时也能工作
        return MockSupabase()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

supabase: Client = get_supabase_client()
