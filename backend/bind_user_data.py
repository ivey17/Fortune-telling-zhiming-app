import json
import datetime
from core.database import supabase

def bind_data():
    phone = "13709727209"
    # 1. 查找用户
    res = supabase.table("app_users").select("id").eq("phone", phone).execute()
    if not res.data:
        print(f"错误：未找到手机号为 {phone} 的用户！")
        return
    
    user_id = res.data[0]["id"]
    print(f"为用户 {phone} (ID: {user_id}) 绑定历史数据...")

    # 2. 准备运势历史数据
    fortune_data = [
        {
            "user_id": user_id,
            "title": "关于今日财运的深度解析",
            "type": "AI 运势查询",
            "messages": json.dumps([
                {"role": "user", "content": "我想知道今天在投资方面有什么建议？"},
                {"role": "ai", "content": "今日卦象为‘火地晋’，象征如日中天，财运呈上升趋势。但在投资上不可贪功冒进，宜选择稳健型项目。午后财气最旺，适合做决策。"}
            ]),
            "created_at": datetime.datetime.utcnow().isoformat()
        }
    ]

    # 3. 准备起卦历史数据
    divination_data = [
        {
            "user_id": user_id,
            "title": "事业变动起卦咨询",
            "type": "AI 起卦追问",
            "messages": json.dumps([
                {"role": "user", "content": "我卜得地水师卦，想问现在的职位变动是否有利？"},
                {"role": "ai", "content": "师卦主征战、劳苦。说明目前的变动伴随着较大的压力和竞争。变爻显示‘师出以律’，意味着只要你秉持公正、守规矩，最终能获得众人的拥护。目前来看，过程虽难，但结果利于长远发展。"}
            ]),
            "created_at": datetime.datetime.utcnow().isoformat()
        }
    ]

    try:
        # 先清除该用户已有的测试数据避免重复（可选）
        # supabase.table("fortune_chat_history").delete().eq("user_id", user_id).execute()
        # supabase.table("divination_chat_history").delete().eq("user_id", user_id).execute()

        supabase.table("fortune_chat_history").insert(fortune_data).execute()
        print("成功绑定运势历史数据。")
        
        supabase.table("divination_chat_history").insert(divination_data).execute()
        print("成功绑定起卦历史数据。")

    except Exception as e:
        print(f"绑定数据时发生错误: {e}")

if __name__ == "__main__":
    bind_data()
