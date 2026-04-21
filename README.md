# 知命 (ZhiMing) - AI 驱动的传统文化与现代命理交互平台

<div align="center">
  <img src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" alt="ZhiMing Banner" width="100%">
  <br>
  <p><b>融合千年易经智慧与前沿大模型技术，打造新一代 AI 命理咨询助理。</b></p>
</div>

## 🌟 项目简介

“知命”是一个旨在将中国传统文化（易经、干支命理、梅花易数）与现代 AI 技术相结合的全栈 Web 应用。通过深度优化的 Prompt 工程，本项目实现了高度拟人化、专业化的命理分析，解决了传统命理应用“解释死板”、“交互门槛高”的痛点。

作为 **AI 产品经理** 的实践项目，本项目重点展示了如何将 LLM（Gemini 1.5 Flash）集成到具体的垂直业务场景中，并解决了 prompt 稳定性、多轮对话上下文管理及数据持久化等产品挑战。

## 🚀 核心功能

- **AI 运势直达**：支持自然语言提问（如：下周事业运势如何？），AI 结合易经逻辑给出深度解读。
- **互动式易经起卦**：模拟真实摇卦流程，结合 AI 实时解析卦象、变卦及动爻，提供个性化建议。
- **全能运势日历**：结合干支历法，每日智能推送吉凶宜忌。
- **个人运势中心**：记录每一份 AI 测算历史，利用 Supabase 实现跨设备同步与用户资产管理。
- **会员与激励体系**：设计了优惠券与会员分层逻辑，模拟商业化闭环。

## 🛠️ 技术架构

- **前端**：React 18 + TypeScript + Vite + Lucide Icons (极简主义美学设计)
- **后端**：FastAPI (Python) - 高性能异步 API 框架
- **AI 引擎**：Google Gemini 1.5 Flash (具备极高的语义理解与响应速度)
- **数据库/鉴权**：Supabase (PostgreSQL) - 实现安全的用户认证与高效的数据存储
- **部署**：Vercel (前端) + Vercel Functions (后端)

## 🧠 AI 产品思考与 Prompt 优化

在本项目中，我针对 AI 回复进行了多次迭代优化（Prompt Engineering）：
1. **角色定义（Role Prompting）**：明确 AI 身份为“兼顾传统易理与现代心理学”的命理大师，避免回复过于迷信或空洞。
2. **逻辑约束**：要求 AI 在解析时遵循“象、数、理”的分析框架，确保回复的专业性。
3. **安全边界**：设定了针对敏感话题（如健康风险提示、极端情况）的回复策略，体现 AI 产品的合规性思考。

## 📦 快速开始

### 环境准备
- Node.js (v18+)
- Python (3.9+)
- Supabase 项目账号
- Gemini API Key

### 安装与运行
1. **克隆并安装依赖**:
   ```bash
   npm install
   pip install -r requirements.txt
   ```
2. **环境变量配置**:
   在根目录创建 `.env` 文件，参考 `.env.example` 填入您的 `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` 等。
3. **启动应用**:
   - 后端: `python -m uvicorn backend.main:app --reload`
   - 前端: `npm run dev`

---

**作品说明**：本项目主要用于 AI 产品经理岗位能力展示。如有任何疑问或合作意向，请联系 [jana_jia@yqn.com](mailto:jana_jia@yqn.com)。

