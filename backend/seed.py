import json
import datetime
import uuid
from core.database import supabase

def seed_data():
    # 1. 获取一个用户
    res = supabase.table("app_users").select("id").limit(1).execute()
    if not res.data:
        print("错误：数据库中没有任何用户，请先在前端注册一个账号！")
        return
    
    user_id = res.data[0]["id"]
    print(f"为用户 {user_id} 生成测试数据...")

    # 1.5. 生成优惠券测试数据
    coupons_data = [
        {
            "user_id": user_id,
            "title": "全场免费使用一个月",
            "discount_text": "免",
            "tag": "特惠早鸟",
            "valid_until": (datetime.datetime.utcnow() + datetime.timedelta(days=30)).isoformat(),
            "is_used": False
        },
        {
            "user_id": user_id,
            "title": "年度铂金会员立减优惠",
            "discount_text": "¥ 20",
            "tag": "新人专属",
            "valid_until": (datetime.datetime.utcnow() + datetime.timedelta(days=7)).isoformat(),
            "is_used": False
        }
    ]

    # 2. 生成运势历史数据
    fortune_data = [
        {
            "user_id": user_id,
            "title": "今日运势深度追问",
            "type": "AI 运势查询",
            "messages": json.dumps([
                {"role": "user", "content": "我今天在南方谈生意会有收获吗？"},
                {"role": "ai", "content": "今日丁火生戊土，离位（南方）火气过旺，虽主事成，但也伴随口舌纷争。建议洽谈时间选在未时（13:00-15:00），以土泄火气，过程会更为圆满。"}
            ]),
            "created_at": (datetime.datetime.utcnow() - datetime.timedelta(days=1)).isoformat()
        },
        {
            "user_id": user_id,
            "title": "关于近期财运的迷茫",
            "type": "AI 运势查询",
            "messages": json.dumps([
                {"role": "user", "content": "最近觉得偏财运很差，有什么破解之法？"},
                {"role": "ai", "content": "观您近月流年，金水相战，确实不宜有投机取巧之念。破解之法在于'稳'字，可于东方木气生旺之地散心，或佩戴木质饰品以通关化煞。"}
            ]),
            "created_at": (datetime.datetime.utcnow() - datetime.timedelta(days=2)).isoformat()
        }
    ]

    # 3. 生成起卦历史数据
    divination_data = [
        {
            "user_id": user_id,
            "title": "关于换岗的事宜请教",
            "type": "AI 起卦追问",
            "messages": json.dumps([
                {"role": "user", "content": "这卦如果是变卦，是否意味着我该坚持？"},
                {"role": "ai", "content": "您所卜得的是“雷水解”变“地水师”。解卦主散，师卦主忧。变爻在即，说明目前的困局已经开始松动，但新的挑战（师卦）需要您具备更强的领导力和纪律性。坚持并非盲动，而是要有策略地防御。"}
            ]),
            "created_at": (datetime.datetime.utcnow() - datetime.timedelta(days=3)).isoformat()
        },
        {
            "user_id": user_id,
            "title": "感情发展测算",
            "type": "AI 起卦追问",
            "messages": json.dumps([
                {"role": "user", "content": "水火既济卦，是不是说明我们能修成正果？"},
                {"role": "ai", "content": "既济卦象表事物已达成某种圆满，但易经云：'初吉终乱'。这意味着你们的感情目前已处在很好的状态，但更需要用心维护，切莫因现状安稳而产生懈怠之心，否则容易生变。"}
            ]),
            "created_at": (datetime.datetime.utcnow() - datetime.timedelta(days=4)).isoformat()
        }
    ]

    try:
        supabase.table("fortune_chat_history").insert(fortune_data).execute()
        print("成功插入 2 条运势测试数据。")
        
        supabase.table("divination_chat_history").insert(divination_data).execute()
        print("成功插入 2 条起卦测试数据。")

        # 为了避免重复插入优惠券导致过多，先删除旧的测试数据
        supabase.table("user_coupons").delete().eq("user_id", user_id).execute()
        supabase.table("user_coupons").insert(coupons_data).execute()
        print("成功插入 2 张优惠券测试数据。")
    except Exception as e:
        print(f"插入数据时发生错误: {e}")

if __name__ == "__main__":
    seed_data()
