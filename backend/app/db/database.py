from __future__ import annotations

import sqlite3
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[2]
LOGS_DIR = BACKEND_ROOT / "logs"
DB_PATH = LOGS_DIR / "qa_log.db"


def get_connection() -> sqlite3.Connection:
    LOGS_DIR.mkdir(parents=True, exist_ok=True)
    return sqlite3.connect(DB_PATH)


def init_db() -> None:
    with get_connection() as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS qa_logs (
                id INTEGER PRIMARY KEY,
                question TEXT,
                answer TEXT,
                sources TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
            """
        )


init_db()
