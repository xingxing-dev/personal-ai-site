import app.config as config
from app.llm.client import chat_completion
from app.rag.prompt import build_prompt
from app.rag.retriever import retrieve
from app.rag.vector_store import VectorStore
from app.schemas import ChatRequest, ChatResponse, HealthResponse, SourceItem
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()
app.state.config = config.settings

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://olivia.dpdns.org"],
    allow_methods=["GET", "POST"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    vector_store = VectorStore(config.settings.chroma_persist_dir)
    return HealthResponse(status="ok", indexed_chunks=vector_store.count())


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        chunks = retrieve(request.question) if _should_use_profile_context(request.question) else []
        system_prompt, user_message = build_prompt(chunks, request.question)
        answer = chat_completion(system_prompt, user_message)
        sources = [_source_from_chunk(chunk) for chunk in chunks]

        return ChatResponse(answer=answer, sources=sources)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Unexpected chat error") from exc


def _source_from_chunk(chunk: dict) -> SourceItem:
    metadata = chunk.get("metadata")
    if not isinstance(metadata, dict):
        metadata = {}

    return SourceItem(
        source=str(metadata.get("source") or ""),
        title=str(metadata.get("title") or ""),
        category=str(metadata.get("category") or ""),
        content=str(chunk.get("text") or chunk.get("content") or ""),
    )


def _should_use_profile_context(question: str) -> bool:
    normalized = question.strip().lower()
    if not normalized:
        return False

    profile_keywords = (
        "宋星星",
        "xingxing",
        "本人",
        "个人",
        "简历",
        "项目",
        "研究",
        "技能",
        "教育",
        "学校",
        "北京交通大学",
        "获奖",
        "联系方式",
        "邮箱",
        "微信",
        "电话",
        "实习",
        "论文",
        "经历",
        "他",
        "他的",
        "作者",
        "站长",
        "resume",
        "project",
        "research",
        "skill",
        "education",
        "award",
        "contact",
        "internship",
        "paper",
        "who is",
        "what kind of person",
        "about him",
    )
    return any(keyword in normalized for keyword in profile_keywords)
