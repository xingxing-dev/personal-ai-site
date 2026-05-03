#!/usr/bin/env python3
from __future__ import annotations

import argparse
import sys
from pathlib import Path


BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.config import settings
from app.rag.loader import load_documents
from app.rag.splitter import split_documents
from app.rag.vector_store import VectorStore


def _resolve_backend_path(path_value: str) -> str:
    path = Path(path_value)
    if not path.is_absolute():
        path = BACKEND_ROOT / path
    return str(path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingest markdown data into ChromaDB.")
    parser.add_argument(
        "--data-dir",
        default=settings.data_dir,
        help="Directory containing markdown files. Defaults to app settings.",
    )
    parser.add_argument(
        "--persist-dir",
        default=settings.chroma_persist_dir,
        help="ChromaDB persistence directory. Defaults to app settings.",
    )
    parser.add_argument(
        "--reset",
        action="store_true",
        help="Delete and rebuild the ChromaDB collection before ingesting.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    data_dir = _resolve_backend_path(args.data_dir)
    persist_dir = _resolve_backend_path(args.persist_dir)

    print(f"Loading markdown documents from {data_dir}...")
    documents = load_documents(data_dir)
    print(f"Loaded {len(documents)} document(s).")

    print("Splitting documents into chunks...")
    chunks = split_documents(documents)
    print(f"Created {len(chunks)} chunk(s).")

    if not chunks:
        print("No chunks to ingest. Done.")
        return

    print(f"Opening ChromaDB at {persist_dir}...")
    vector_store = VectorStore(persist_dir)
    if args.reset:
        print("Resetting ChromaDB collection...")
        vector_store.reset()

    print("Ingesting chunks into ChromaDB...")
    vector_store.add_chunks(chunks)
    print(f"Done. Collection now contains {vector_store.count()} chunk(s).")


if __name__ == "__main__":
    main()
