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
    allow_origins=[
        origin.strip()
        for origin in config.settings.cors_origins.split(",")
        if origin.strip()
    ],
    allow_origin_regex=config.settings.cors_origin_regex or None,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health", response_model=HealthResponse)
def health() -> HealthResponse:
    vector_store = VectorStore(config.settings.chroma_persist_dir)
    return HealthResponse(status="ok", indexed_chunks=vector_store.count())


@app.post("/api/chat", response_model=ChatResponse)
def chat(request: ChatRequest) -> ChatResponse:
    try:
        should_use_context = _should_use_profile_context(
            request.question,
            history=[message.model_dump() for message in request.history],
        )
        chunks = (
            _prioritize_chunks(
                request.question,
                retrieve(
                    _build_retrieval_query(request),
                    top_k=max(config.settings.top_k, 6),
                ),
            )
            if should_use_context
            else []
        )
        system_prompt, user_message = build_prompt(
            chunks,
            request.question,
            history=[message.model_dump() for message in request.history],
        )
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
        content="",
    )


def _build_retrieval_query(request: ChatRequest) -> str:
    recent_user_turns = [
        message.content.strip()
        for message in request.history[-6:]
        if message.role == "user" and message.content.strip()
    ]
    query = "\n".join([*recent_user_turns, request.question.strip()])
    return query[-1200:]


def _should_use_profile_context(
    question: str,
    history: list[dict] | None = None,
) -> bool:
    current = question.strip().lower()
    if not current:
        return False

    history_text = " ".join(
        str(message.get("content", "")) for message in (history or [])[-6:]
    ).lower()
    combined = f"{history_text} {current}"

    strong_keywords = (
        "宋星星",
        "xingxing",
        "简历",
        "项目",
        "研究",
        "技能",
        "技术",
        "技术栈",
        "掌握",
        "会什么",
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
        "his ",
        "him",
    )
    pronoun_keywords = ("他", "他的", "本人", "个人", "you", "your")

    if any(keyword in current for keyword in strong_keywords):
        return True
    return any(keyword in current for keyword in pronoun_keywords) and any(
        keyword in combined for keyword in strong_keywords
    )


def _prioritize_chunks(question: str, chunks: list[dict]) -> list[dict]:
    if not chunks:
        return []

    normalized = question.lower()
    category_hints = {
        "project": ("项目", "project", "guitestbench", "risc-v", "rtos", "视频取证"),
        "skill": ("技术", "技能", "tech", "skill", "stack"),
        "research": ("研究", "方向", "论文", "paper", "research"),
        "education": ("教育", "学校", "bjtu", "北京交通大学", "education"),
        "award": ("获奖", "奖", "award"),
        "contact": ("联系", "邮箱", "微信", "电话", "contact", "email", "github"),
    }

    preferred_categories = {
        category
        for category, hints in category_hints.items()
        if any(hint in normalized for hint in hints)
    }
    if not preferred_categories:
        return chunks

    preferred = []
    for chunk in chunks:
        metadata = (
            chunk.get("metadata") if isinstance(chunk.get("metadata"), dict) else {}
        )
        category = str(metadata.get("category") or "").lower()
        title = str(metadata.get("title") or "").lower()
        text = str(chunk.get("text") or chunk.get("content") or "").lower()
        if category in preferred_categories or any(
            hint in title or hint in text
            for category in preferred_categories
            for hint in category_hints[category]
        ):
            preferred.append(chunk)

    limit = max(config.settings.top_k, 6)
    if not preferred:
        return chunks[:limit]

    return preferred[:limit]
