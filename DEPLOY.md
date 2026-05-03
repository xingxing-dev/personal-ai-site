# 快速部署

## 最快方案：服务器直接跑

适合现在这台机器还没有 Docker，或者想先快速上线验证。

1. 准备后端环境：

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

然后在 `backend/.env` 里填入 `LLM_API_KEY`，确认 `LLM_MODEL=deepseek-v4-pro`。

2. 构建知识库并启动后端：

```bash
python scripts/ingest.py
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

3. 启动前端：

```bash
cd ../frontend
npm install
NEXT_PUBLIC_API_BASE_URL=http://你的域名或服务器IP:8000 npm run build
npm run start
```

4. 生产环境建议用 Nginx：

- `/api/` 反向代理到 `127.0.0.1:8000`
- `/` 反向代理到 `127.0.0.1:3000`
- 如果 chat 输入很长，把 `client_max_body_size` 设为 `4m` 或更高

## Docker 方案：服务器安装 Docker 后

当前仓库已准备好 `docker-compose.yml`、`nginx.conf`、前后端 Dockerfile。服务器安装 Docker 后，在项目根目录执行：

```bash
docker compose up -d --build
```

访问服务器 80 端口即可打开网站，前端会通过同源 `/api` 调用后端。

## 输入长度配置

- 前端输入框已改成多行 textarea，支持粘贴长文本。
- 后端 `question` 上限为 8000 字符。
- 每条历史消息上限为 4000 字符，最多携带 12 条，前端默认发送最近 8 条。
- Nginx 请求体上限为 `4m`。

如果以后要支持更长文章级输入，可以继续调大 `backend/app/schemas.py` 里的 `max_length`，同时调大 Nginx `client_max_body_size`。
