from functools import lru_cache
from pathlib import Path

from app.config import settings
from app.rag.loader import load_documents
from app.rag.splitter import split_documents
from app.rag.vector_store import VectorStore


BACKEND_ROOT = Path(__file__).resolve().parents[2]

INTENT_HINTS = {
    "project": (
        "项目",
        "作品",
        "做过",
        "经历",
        "guitestbench",
        "gui agent",
        "视频取证",
        "risc-v",
        "rtos",
        "benchmark",
    ),
    "skill": (
        "技术",
        "技能",
        "技术栈",
        "掌握",
        "会什么",
        "python",
        "rust",
        "pytorch",
        "fastapi",
        "react",
        "mcp",
        "llm-as-judge",
    ),
    "research": (
        "研究",
        "方向",
        "论文",
        "科研",
        "llm training",
        "agent",
        "post-training",
        "强化学习",
    ),
    "education": ("教育", "学校", "专业", "本科", "大学", "bjtu", "北京交通大学"),
    "award": ("获奖", "奖项", "奖学金", "荣誉", "挑战杯", "award"),
    "contact": ("联系", "邮箱", "微信", "电话", "github", "contact", "email"),
    "profile": ("宋星星", "xingxing", "是谁", "介绍", "什么样的人", "爱好", "旅行", "运动"),
    "internship": ("实习", "internship"),
}

COMMON_KEYWORDS = {
    "项目",
    "作品",
    "做过",
    "经历",
    "技术",
    "技能",
    "技术栈",
    "掌握",
    "研究",
    "方向",
    "论文",
    "科研",
    "介绍",
}


def retrieve(
    question: str,
    top_k: int | None = None,
    threshold: float | None = None,
) -> list[dict]:
    top_k = top_k if top_k is not None else settings.top_k
    threshold = (
        threshold if threshold is not None else settings.similarity_threshold
    )

    if not question or not question.strip() or top_k <= 0:
        return []

    chunks = []
    try:
        vector_store = VectorStore(settings.chroma_persist_dir)
        matches = vector_store.query(question, top_k=top_k)
    except Exception:
        matches = []

    chunks.extend(_lexical_matches(question, limit=max(top_k, 8)))
    chunks.extend(_vector_matches(matches, threshold))
    return _dedupe_chunks(chunks)[:top_k]


def _vector_matches(matches: list[dict], threshold: float) -> list[dict]:
    chunks = []
    for match in matches:
        distance = match.get("distance")
        try:
            distance_value = float(distance)
        except (TypeError, ValueError):
            continue

        if distance_value >= threshold:
            continue

        metadata = match.get("metadata")
        if not isinstance(metadata, dict):
            metadata = {
                key: value
                for key, value in match.items()
                if key not in {"content", "text", "metadata", "distance", "score"}
            }

        chunks.append(
            {
                "text": match.get("text") or match.get("content", ""),
                "metadata": metadata,
                "distance": distance_value,
            }
        )

    return chunks


def _lexical_matches(question: str, limit: int) -> list[dict]:
    normalized = question.lower()
    intents = {
        intent
        for intent, hints in INTENT_HINTS.items()
        if any(hint in normalized for hint in hints)
    }
    if not intents:
        return []

    keywords = {
        hint
        for hints in INTENT_HINTS.values()
        for hint in hints
        if len(hint.strip()) > 1 and hint in normalized
    }

    scored_chunks: list[tuple[int, dict]] = []
    for chunk in _knowledge_chunks(settings.data_dir):
        source = str(chunk.get("source") or "")
        title = str(chunk.get("title") or "")
        category = str(chunk.get("category") or "").lower()
        content = str(chunk.get("content") or "")
        haystack = f"{title}\n{content}".lower()

        score = 0
        if category in intents:
            score += 12
        if category == "faq" and any(keyword in title.lower() for keyword in keywords):
            score += 8
        if "project" in intents and category == "project":
            score += 10
        if "skill" in intents and category == "skill":
            score += 10

        for keyword in keywords:
            if keyword in title.lower():
                score += 4
            if keyword not in COMMON_KEYWORDS and keyword in haystack:
                score += 2

        if score <= 0:
            continue

        scored_chunks.append(
            (
                score,
                {
                    "text": content,
                    "metadata": {
                        "source": source,
                        "title": title,
                        "category": category,
                    },
                },
            )
        )

    scored_chunks.sort(key=lambda item: item[0], reverse=True)
    return [chunk for _, chunk in scored_chunks[:limit]]


def _dedupe_chunks(chunks: list[dict]) -> list[dict]:
    seen = set()
    unique_chunks = []
    for chunk in chunks:
        metadata = chunk.get("metadata") if isinstance(chunk.get("metadata"), dict) else {}
        key = (
            metadata.get("source"),
            metadata.get("title"),
            str(chunk.get("text") or chunk.get("content") or "")[:120],
        )
        if key in seen:
            continue
        seen.add(key)
        unique_chunks.append(chunk)
    return unique_chunks


@lru_cache(maxsize=4)
def _knowledge_chunks(data_dir: str) -> tuple[dict, ...]:
    path = Path(data_dir)
    if not path.is_absolute():
        path = BACKEND_ROOT / path
    return tuple(split_documents(load_documents(str(path))))
