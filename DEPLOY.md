# 快速部署

长期维护、排障和升级路线见 [MAINTENANCE.md](./MAINTENANCE.md)。

## 推荐免费方案：Vercel + Render + Cloudflare

适合没有服务器、想先用免费额度上线个人站。

整体结构：

```text
olivia.dpdns.org -> Vercel 前端 -> Render 后端 /api/chat
```

### 1. 推送代码到 GitHub

Render 和 Vercel 都建议从 GitHub 仓库自动部署。先把当前项目推到一个 GitHub repo。

### 2. 部署后端到 Render

1. 打开 Render Dashboard。
2. New > Blueprint。
3. 选择这个 GitHub 仓库。
4. Render 会读取根目录的 `render.yaml`，创建 `personal-ai-backend`。
5. 在环境变量里填 `LLM_API_KEY`。
6. 部署完成后，记下后端地址，例如：

```text
https://personal-ai-backend.onrender.com
```

检查：

```text
https://personal-ai-backend.onrender.com/api/health
```

应该返回：

```json
{"status":"ok","indexed_chunks":32}
```

### 3. 部署前端到 Vercel

1. 打开 Vercel。
2. Add New Project。
3. 选择这个 GitHub 仓库。
4. Root Directory 选择 `frontend`。
5. Build Command 使用默认 `npm run build`。
6. 添加环境变量：

```text
NEXT_PUBLIC_API_BASE_URL=https://personal-ai-backend.onrender.com
```

把地址替换成你自己的 Render 后端地址。

部署完成后，Vercel 会给一个地址，例如：

```text
https://personal-ai-site.vercel.app
```

### 4. 绑定 olivia.dpdns.org

在 Vercel 项目里：

1. Settings > Domains。
2. 添加 `olivia.dpdns.org`。
3. 按 Vercel 提示，在 Cloudflare DNS 里加 CNAME 记录。

通常类似：

```text
Type: CNAME
Name: olivia
Target: cname.vercel-dns.com
Proxy: DNS only 或按 Vercel 提示
```

绑定完成后，把前端环境变量里的 API 地址保持为 Render 后端地址即可。

## 本机生产预览

适合在电脑上先验证生产构建，不等于公网部署。

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

适合后续升级到 VPS。当前仓库已准备好 `docker-compose.yml`、`nginx.conf`、前后端 Dockerfile。服务器安装 Docker 后，在项目根目录执行：

```bash
docker compose up -d --build
```

访问服务器 80 端口即可打开网站，前端会通过同源 `/api/chat` 和 `/api/health` 调用后端。

## 输入长度配置

- 前端输入框已改成多行 textarea，支持粘贴长文本。
- 后端 `question` 上限为 8000 字符。
- 每条历史消息上限为 4000 字符，最多携带 12 条，前端默认发送最近 8 条。
- Nginx 请求体上限为 `4m`。

如果以后要支持更长文章级输入，可以继续调大 `backend/app/schemas.py` 里的 `max_length`，同时调大 Nginx `client_max_body_size`。
