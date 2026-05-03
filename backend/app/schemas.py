from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=500)


class SourceItem(BaseModel):
    source: str
    title: str
    category: str
    content: str


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceItem]


class HealthResponse(BaseModel):
    status: str
    indexed_chunks: int
