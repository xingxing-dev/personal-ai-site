from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # LLM
    llm_api_key: str = ""
    llm_base_url: str = "https://api.deepseek.com"
    llm_model: str = "deepseek-chat"

    # RAG
    chroma_persist_dir: str = "./chroma_db"
    data_dir: str = "./data"
    top_k: int = 6
    similarity_threshold: float = 1.2

    # HTTP
    cors_origins: str = (
        "http://localhost:3000,"
        "https://olivia.dpdns.org"
    )
    cors_origin_regex: str = r"https://.*\.vercel\.app"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


settings = Settings()
