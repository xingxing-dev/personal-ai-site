# Personal AI Site

[English](./README.md) | [中文](./README_CN.md)

An AI-native personal website for Xingxing Song, built with a Next.js frontend, a FastAPI backend, ChromaDB-based retrieval, and DeepSeek chat completion.

The site is both a portfolio and a conversational interface. Visitors can browse profile pages, projects, skills, awards, education, and contact information, then ask an AI assistant about the person behind the site.

Live demo:

- Website: https://personal-ai-site-nu.vercel.app
- AI Chat: https://personal-ai-site-nu.vercel.app/ask
- Backend health check: https://personal-ai-backend-itq1.onrender.com/api/health

## Highlights

- Personal website with desktop-inspired UI, dark mode, bilingual content, and animated interactions.
- Free-form AI chat that can answer casual questions, creative prompts, and general technical questions.
- RAG mode for personal facts, projects, skills, research, education, awards, contact details, and FAQs.
- Hybrid retrieval strategy combining ChromaDB vector search and local lexical matching for more reliable Chinese queries.
- Multi-turn chat support with short-term conversation history.
- Source cards that show reference location without exposing full retrieved chunks.
- Current time context injection, so the assistant can answer date/time questions accurately.
- SQLite logging for Q&A records.
- Deployment-ready configs for Vercel, Render, Docker Compose, and Nginx.

## Tech Stack

Frontend:

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- lucide-react

Backend:

- FastAPI
- ChromaDB
- SQLite
- OpenAI Python SDK configured for DeepSeek-compatible chat completion
- Pydantic Settings

Deployment:

- Vercel for frontend
- Render for backend
- Docker Compose and Nginx for future VPS deployment

## Architecture

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
  |-- intent routing
  |-- conversation history
  |-- current time context
  |
  | profile questions
  v
Hybrid Retriever
  |
  |-- lexical match over markdown knowledge base
  |-- ChromaDB vector search
  v
Prompt Builder
  |
  v
DeepSeek LLM
  |
  v
Answer + source metadata
```

## Project Structure

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

## Local Development

### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Fill in `backend/.env`:

```bash
LLM_API_KEY=your_deepseek_api_key
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-pro
```

Build or refresh the knowledge base:

```bash
python scripts/ingest.py --reset
```

Start the backend:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Check:

```bash
curl http://localhost:8000/api/health
```

### Frontend

```bash
cd frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000 npm run dev
```

Open:

```text
http://localhost:3000
http://localhost:3000/ask
```

## Environment Variables

Backend:

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

Frontend:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

For Vercel production, set `NEXT_PUBLIC_API_BASE_URL` to the Render backend URL.

## Deployment

Current free deployment:

- Frontend: Vercel
- Backend: Render
- Repository: GitHub

The Render backend is configured by `render.yaml`. The Vercel project should use `frontend` as its root directory and set:

```bash
NEXT_PUBLIC_API_BASE_URL=https://your-render-backend.onrender.com
```

For VPS deployment, the repository also includes:

- `docker-compose.yml`
- `backend/Dockerfile`
- `frontend/Dockerfile`
- `nginx.conf`

See [DEPLOY.md](./DEPLOY.md) for detailed deployment notes.

## API

Health:

```http
GET /api/health
```

Response:

```json
{
  "status": "ok",
  "indexed_chunks": 32
}
```

Chat:

```http
POST /api/chat
Content-Type: application/json
```

Request:

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

Response:

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

## Knowledge Base

The knowledge base lives in `backend/data` as markdown files. Each file can contain frontmatter:

```markdown
---
title: "项目经历"
category: "project"
updated: "2026-05-03"
---
```

After editing the knowledge base, rebuild ChromaDB:

```bash
cd backend
python scripts/ingest.py --reset
```

## Roadmap

- Add project screenshots and richer media assets.
- Add streaming chat responses.
- Add optional web search for freshness-sensitive questions.
- Add GitHub project ingestion.
- Add an agent-style tool layer as a separate research playground.
- Add authentication for private admin edits.

## License

MIT License. See [LICENSE](./LICENSE).
