from __future__ import annotations

from app.db.database import get_connection


def log_qa(question: str, answer: str, sources_json: str) -> int:
    with get_connection() as connection:
        cursor = connection.execute(
            """
            INSERT INTO qa_logs (question, answer, sources)
            VALUES (?, ?, ?)
            """,
            (question, answer, sources_json),
        )
        return int(cursor.lastrowid)
