from fastapi import HTTPException
from openai import APITimeoutError, OpenAI

from app.config import settings


def chat_completion(system_prompt: str, user_message: str) -> str:
    client = OpenAI(
        api_key=settings.llm_api_key,
        base_url=settings.llm_base_url,
        timeout=30,
    )

    try:
        response = client.chat.completions.create(
            model=settings.llm_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=1024,
        )
    except APITimeoutError as exc:
        raise HTTPException(status_code=504) from exc

    return response.choices[0].message.content or ""
