from app.config import settings
from app.rag.vector_store import VectorStore


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

    try:
        vector_store = VectorStore(settings.chroma_persist_dir)
        matches = vector_store.query(question, top_k=top_k)
    except Exception:
        return []

    if not matches:
        return []

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
