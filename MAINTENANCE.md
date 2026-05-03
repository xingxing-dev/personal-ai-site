# Maintenance Guide

This document is the long-term handoff and maintenance guide for the Personal AI Site. The public-facing overview lives in `README.md` and `README_CN.md`; this file focuses on how to keep the project healthy after launch.

## Current Production State

Repository:

- GitHub: https://github.com/xingxing-dev/personal-ai-site
- Visibility: public
- Default branch: `main`

Production services:

- Frontend: Vercel
- Frontend URL: https://personal-ai-site-nu.vercel.app
- AI Chat URL: https://personal-ai-site-nu.vercel.app/ask
- Backend: Render
- Backend URL: https://personal-ai-backend-itq1.onrender.com
- Backend health check: https://personal-ai-backend-itq1.onrender.com/api/health

Domain status:

- `olivia.dpdns.org` is not currently used for production.
- The Vercel default domain is the current public display URL.
- Custom domain binding can be revisited later through Vercel Settings > Domains and Cloudflare DNS.

Local note:

- `backend/chroma_db` may change during local queries or ingestion. Do not commit those runtime changes unless the knowledge base was intentionally rebuilt and verified.

## System Overview

The project has two runtime services:

```text
Vercel Frontend
  |
  | NEXT_PUBLIC_API_BASE_URL
  v
Render FastAPI Backend
  |
  | profile-related questions
  v
Hybrid Retriever
  |
  | markdown data + ChromaDB
  v
DeepSeek v4 Pro
```

Frontend responsibilities:

- Render the personal website pages.
- Provide the AI Chat UI.
- Maintain recent conversation history client-side.
- Send `question` and `history` to `POST /api/chat`.
- Render source cards from backend metadata.

Backend responsibilities:

- Route free-chat vs profile/RAG questions.
- Retrieve relevant profile context.
- Build the LLM prompt.
- Inject current server time.
- Call DeepSeek through the OpenAI-compatible SDK.
- Log Q&A records to SQLite.

## Important Files

Frontend:

- `frontend/app`: Next.js App Router pages.
- `frontend/components/chat-box.tsx`: AI Chat UI and history handling.
- `frontend/components/source-card.tsx`: reference source display.
- `frontend/lib/api.ts`: frontend API client.
- `frontend/content/zh.json` and `frontend/content/en.json`: bilingual site content.

Backend:

- `backend/app/main.py`: FastAPI app, CORS, `/api/health`, `/api/chat`, intent routing.
- `backend/app/rag/retriever.py`: hybrid lexical + vector retrieval.
- `backend/app/rag/prompt.py`: system prompt, history formatting, current time injection.
- `backend/app/rag/vector_store.py`: ChromaDB wrapper.
- `backend/app/schemas.py`: request/response schemas and input limits.
- `backend/app/llm/client.py`: DeepSeek chat completion client.
- `backend/data`: markdown knowledge base.
- `backend/scripts/ingest.py`: rebuild or update ChromaDB.

Deployment:

- `render.yaml`: Render backend blueprint.
- `docker-compose.yml`: future VPS deployment.
- `nginx.conf`: future VPS reverse proxy.
- `DEPLOY.md`: deployment playbook.

## Routine Maintenance

### Update Public Website Content

For static frontend pages:

1. Edit `frontend/content/zh.json`.
2. Edit `frontend/content/en.json`.
3. Run frontend checks:

```bash
cd frontend
npm run lint
npm run build
```

4. Commit and push.
5. Vercel should auto-deploy from GitHub.

### Update AI Knowledge Base

For AI Chat answers about personal facts:

1. Edit markdown files in `backend/data`.
2. Rebuild ChromaDB locally:

```bash
cd backend
python scripts/ingest.py --reset
```

3. Verify retrieval and health:

```bash
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
curl http://localhost:8000/api/health
```

4. Test representative questions:

```bash
curl -s -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"他做过哪些项目？"}'
```

5. Commit `backend/data` and the updated `backend/chroma_db` files only if the rebuilt index is intended for deployment.
6. Push to GitHub and confirm Render redeploys successfully.

If only local queries changed `backend/chroma_db`, ignore those changes.

### Update AI Prompt Behavior

Prompt behavior lives mostly in:

- `backend/app/rag/prompt.py`
- `backend/app/main.py`
- `backend/app/rag/retriever.py`

After prompt or routing changes:

```bash
cd backend
python -m compileall app scripts
```

Then manually test:

- `hi` should be free chat with `sources: []`.
- `他做过哪些项目？` should use RAG sources.
- `第二个项目具体讲讲` should work with history.
- `你知道今天几号吗？` should use current time context.

### Update Dependencies

Frontend:

```bash
cd frontend
npm outdated
npm update
npm run lint
npm run build
```

Backend:

```bash
cd backend
pip list --outdated
pip install -r requirements.txt
python -m compileall app scripts
```

Be careful with:

- `fastapi`: ChromaDB can constrain compatible versions.
- `chromadb`: may change persistence format or embedding behavior.
- Python version on Render: currently pinned through `PYTHON_VERSION=3.12.10` in `render.yaml`.
- Next.js major versions: always run `npm run build` before pushing.

## Environment Variables

Render backend:

```text
LLM_API_KEY
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-v4-pro
CHROMA_PERSIST_DIR=./chroma_db
DATA_DIR=./data
TOP_K=6
SIMILARITY_THRESHOLD=1.2
CORS_ORIGINS=http://localhost:3000,https://olivia.dpdns.org
CORS_ORIGIN_REGEX=https://.*\.vercel\.app
PYTHON_VERSION=3.12.10
```

Vercel frontend:

```text
NEXT_PUBLIC_API_BASE_URL=https://personal-ai-backend-itq1.onrender.com
```

Never commit:

- `backend/.env`
- API keys
- local logs
- local virtual environments
- `node_modules`

## Troubleshooting

### Frontend Loads But Chat Fails

Check:

1. Vercel environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://personal-ai-backend-itq1.onrender.com
```

2. Redeploy Vercel after changing `NEXT_PUBLIC_API_BASE_URL`.
3. Render backend health:

```text
https://personal-ai-backend-itq1.onrender.com/api/health
```

4. Browser console for CORS errors.
5. Backend CORS settings in `backend/app/config.py`.

### Render Backend Sleeps

Render free services may cold start. A slow first request is expected. If the backend appears unavailable:

1. Open `/api/health`.
2. Wait for the service to wake.
3. Check Render logs.
4. If the app crashes during startup, inspect Python dependency errors.

### AI Says Personal Data Is Missing

Check:

1. Is the fact in `backend/data`?
2. Was ChromaDB rebuilt with `python scripts/ingest.py --reset`?
3. Does lexical matching include the relevant keywords in `backend/app/rag/retriever.py`?
4. Is `_should_use_profile_context` in `backend/app/main.py` routing the question to RAG?

### AI Invents Facts

Tighten the rules in `backend/app/rag/prompt.py`.

Recommended approach:

- Allow free style for tone.
- Keep personal facts grounded in `context chunks`.
- Explicitly forbid inventing projects, papers, internships, awards, contact info, rankings, or tools not in context.

### Long Input Fails

Current limits:

- `question`: 8000 characters.
- each history item: 4000 characters.
- history list: 12 messages.
- Nginx request body limit: `4m`.

Adjust:

- `backend/app/schemas.py`
- `nginx.conf`
- platform request limits if using Render/Vercel.

## Upgrade Roadmap

### Low-Risk Improvements

- Add project screenshots to README.
- Add Open Graph image for social sharing.
- Add streaming responses to AI Chat.
- Add better loading and error states on `/ask`.
- Add a small admin-only script to update knowledge base content.

### Medium-Risk Improvements

- Add web search for freshness-sensitive questions.
- Add GitHub README ingestion for project pages.
- Add vector re-ranking.
- Add analytics for common user questions.
- Add persistent conversation sessions.

### High-Risk / Agent Project Scope

- Tool calling.
- Browser/search agent.
- GitHub agent.
- File editing agent.
- Multi-step planning and execution.
- User authentication and private workspace memory.

Recommendation:

Keep this website focused on personal identity + RAG + free chat. Build heavy tool-calling features as a separate Agent project, then link it from this site once it is stable.

## Upgrade Path From Free Hosting

Current free stack:

```text
Vercel frontend + Render backend
```

Future VPS stack:

```text
Nginx -> frontend container + backend container
```

The repository is already prepared for VPS deployment:

```bash
docker compose up -d --build
```

Before upgrading:

1. Buy or rent a VPS.
2. Install Docker.
3. Copy `.env` values to the server.
4. Point DNS to the VPS.
5. Add HTTPS through Cloudflare or certbot.

## Pre-Commit Checklist

Before pushing:

```bash
cd backend
python -m compileall app scripts
```

```bash
cd frontend
npm run lint
npm run build
```

Also check:

```bash
git status --short
```

Do not accidentally commit:

- `.env`
- API keys
- unrelated ChromaDB runtime drift
- `.next`
- `node_modules`
- local logs

## Useful Links

- Website: https://personal-ai-site-nu.vercel.app
- AI Chat: https://personal-ai-site-nu.vercel.app/ask
- GitHub: https://github.com/xingxing-dev/personal-ai-site
- Backend health: https://personal-ai-backend-itq1.onrender.com/api/health
- Render Dashboard: https://dashboard.render.com
- Vercel Dashboard: https://vercel.com/dashboard
