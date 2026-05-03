# Personal AI Site ✨

[English](./README.md) | [中文](./README_CN.md)

这是一个 AI Native 的个人网站项目，为宋星星构建。项目由 Next.js 前端、FastAPI 后端、ChromaDB 检索库和 DeepSeek 大模型调用组成。

它既是一个个人作品集，也是一个可对话的 AI 入口。访客可以浏览个人介绍、项目经历、技能栈、获奖、教育背景和联系方式，也可以直接向 AI Chat 提问，了解网站主人。

在线体验：

- 🌐 网站首页：https://personal-ai-site-nu.vercel.app
- 💬 AI Chat：https://personal-ai-site-nu.vercel.app/ask
- 🩺 后端健康检查：https://personal-ai-backend-itq1.onrender.com/api/health

## ✨ 项目亮点

- 🖥️ 桌面窗口风格的个人网站界面，支持深色模式、中英双语和动效交互。
- 💬 自由 AI Chat：支持闲聊、创意问题、学习建议和普通技术讨论。
- 📚 个人资料 RAG：针对项目、技术栈、研究方向、教育背景、获奖、联系方式和 FAQ 等个人事实进行检索增强回答。
- 🔎 混合检索策略：结合 ChromaDB 向量检索和本地关键词检索，提升中文问题命中率。
- 🧠 多轮对话：前端会携带最近对话历史，后端可理解“他”“第二个项目”“刚才那个”等指代。
- 🗂️ 来源展示：展示参考资料位置，但不把完整 chunk 内容直接暴露在页面上。
- 🕒 当前时间上下文：后端会把当前时间注入 prompt，支持回答日期、时间、星期几等问题。
- 📝 SQLite 问答日志：记录用户问题和模型回答，便于后续分析。
- 🚀 已准备 Vercel、Render、Docker Compose 和 Nginx 部署配置。

## 🧰 技术栈

前端：

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react

后端：

- FastAPI
- ChromaDB
- SQLite
- OpenAI Python SDK，兼容 DeepSeek Chat Completion 接口
- Pydantic Settings

部署：

- Vercel 部署前端
- Render 部署后端
- Docker Compose + Nginx 用于后续 VPS 部署

## 🏗️ 架构

```text
Browser
  |
  |  Next.js UI
  v
Frontend /ask
  |
  | POST /api/chat
  v
FastAPI Backend
  |
  |-- 意图路由
  |-- 多轮历史
  |-- 当前时间上下文
  |
  | 个人资料问题
  v
Hybrid Retriever
  |
  |-- Markdown 知识库关键词检索
  |-- ChromaDB 向量检索
  v
Prompt Builder
  |
  v
DeepSeek LLM
  |
  v
Answer + source metadata
```

## 📁 目录结构

```text
.
├── backend
│   ├── app
│   │   ├── db
│   │   ├── llm
│   │   ├── rag
│   │   ├── config.py
│   │   ├── main.py
│   │   └── schemas.py
│   ├── data
│   ├── scripts
│   ├── chroma_db
│   ├── Dockerfile
│   └── requirements.txt
├── frontend
│   ├── app
│   ├── components
│   ├── content
│   ├── lib
│   ├── types
│   └── package.json
├── docker-compose.yml
├── nginx.conf
├── render.yaml
└── DEPLOY.md
```

## 🛠️ 本地开发

### 后端

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

填写 `backend/.env`：

```bash
LLM_API_KEY=your_deepseek_api_key
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-pro
```

构建或刷新知识库：

```bash
python scripts/ingest.py --reset
```

启动后端：

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

检查健康状态：

```bash
curl http://localhost:8000/api/health
```

### 前端

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev
```

打开：

```text
http://localhost:3000
http://localhost:3000/ask
```

## 🔐 环境变量

后端：

```bash
LLM_API_KEY=your_deepseek_api_key
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-pro
CHROMA_PERSIST_DIR=./chroma_db
DATA_DIR=./data
TOP_K=6
SIMILARITY_THRESHOLD=1.2
CORS_ORIGINS=http://localhost:3000,https://olivia.dpdns.org
CORS_ORIGIN_REGEX=https://.*\.vercel\.app
```

前端：

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Vercel 生产环境中，`NEXT_PUBLIC_API_BASE_URL` 应填写 Render 后端地址。

## 🚀 部署

当前免费部署方案：

- 前端：Vercel
- 后端：Render
- 仓库：GitHub

Render 后端由 `render.yaml` 配置。Vercel 项目需要将 Root Directory 设置为 `frontend`，并配置：

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-render-backend.onrender.com
```

后续 VPS 部署可使用：

- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `nginx.conf`

详细部署说明见 [DEPLOY.md](./DEPLOY.md)，长期维护说明见 [MAINTENANCE.md](./MAINTENANCE.md)。

## 🔌 API

健康检查：

```http
GET /api/health
```

响应：

```json
{
  "status": "ok",
  "indexed_chunks": 32
}
```

聊天接口：

```http
POST /api/chat
Content-Type: application/json
```

请求：

```json
{
  "question": "他做过哪些项目？",
  "history": [
    {
      "role": "user",
      "content": "宋星星是谁？"
    }
  ]
}
```

响应：

```json
{
  "answer": "...",
  "sources": [
    {
      "source": "projects.md",
      "title": "GUITestBench：面向移动应用缺陷发现的 GUI Agent 评测基准",
      "category": "project",
      "content": ""
    }
  ]
}
```

## 📚 知识库

知识库位于 `backend/data`，使用 Markdown 文件维护。每个文件可以带 frontmatter：

```markdown
---
title: "项目经历"
category: "project"
updated: "2026-05-03"
---
```

修改知识库后，需要重建 ChromaDB：

```bash
cd backend
python scripts/ingest.py --reset
```

## 🗺️ 路线图

- 🖼️ 添加项目截图和更丰富的媒体素材。
- 🌊 支持流式聊天响应。
- 🌍 为时效性问题增加可选 Web Search。
- 🧩 增加 GitHub 项目自动摄取。
- 🛠️ 将工具调用和 Agent 能力作为独立研究模块扩展。
- 🔐 增加私有后台编辑能力。

## 📄 开源协议

本项目采用 MIT License，详见 [LICENSE](./LICENSE)。
