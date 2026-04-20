# 知命 App - Vercel 部署文档

由于本项目是一个前后端分离的全栈项目（前端 React/Vite，后端 Python FastAPI），将其完全部署到 Vercel 需要利用 Vercel 的 **Python Serverless Functions** 特性。

以下是完整的部署配置指南。

## 1. 代码调整与配置修改

为了让 Vercel 能够正确识别和运行 Python 后端，我们需要对当前代码结构进行少量调整。

### 第一步：创建 `vercel.json`
在项目**根目录**创建一个 `vercel.json` 文件，用于配置构建和路由规则：

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/vite"
    },
    {
      "src": "api/index.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.py"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

### 第二步：创建 Vercel 后端入口
Vercel 默认从 `api` 目录读取 Serverless Functions。我们需要在项目根目录创建一个 `api` 文件夹，并在其中新建 `index.py` 文件：

```python
# api/index.py
import os
import sys

# 将 backend 目录添加到系统路径，以便 Vercel 能够找到包
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "backend"))

from backend.main import app
```
这样 Vercel 就能通过 `api/index.py` 找到并运行你写在 `backend/main.py` 里的 FastAPI 实例了。

### 第三步：复制依赖文件
Vercel 在构建 Python 环境时，会在项目**根目录**查找 `requirements.txt`。
请将 `backend/requirements.txt` 复制一份到**项目根目录**。

*（如果你希望我直接帮你把这三个文件修改好并提交到 GitHub，可以告诉我！）*

---

## 2. 部署到 Vercel

1. 登录 [Vercel 官网](https://vercel.com/)，点击 **Add New -> Project**。
2. 授权关联你的 GitHub 账号，并在列表中找到你刚刚推送的 `Fortune-telling-zhiming-app` 仓库，点击 **Import**。
3. 在配置页面：
   - **Framework Preset**: 会自动识别为 `Vite`。
   - **Root Directory**: 保持默认（`./`）。
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. **Environment Variables（环境变量配置）**：
   **非常重要！** 你必须在这里添加和本地 `.env` 一样的环境变量，否则后端启动会崩溃报错：
   - `SUPABASE_URL` : 你的 Supabase 项目 URL
   - `SUPABASE_KEY` : 你的 Supabase anon key
   - `GEMINI_API_KEY` : 你的大模型 API Key
   - `JWT_SECRET` : `super-secret-zhiming-key-123`
5. 填好后，点击 **Deploy**，等待 Vercel 自动构建前端并部署 Python 环境。

---

## 3. 部署后的检查与排错

- 部署完成后，Vercel 会为你生成一个外网域名（例如 `https://fortune-telling-zhiming-app.vercel.app`）。
- 直接访问该域名即可使用您的应用。
- 如果在访问或登录时发生 500 报错，你可以前往 Vercel 项目控制台，点击顶部的 **Logs** 标签页，查看 Python 后端的运行日志，通常是由于环境变量遗漏或者 requirements.txt 缺失引起的。
