from typing import Any

import chromadb


COLLECTION_NAME = "personal_kb"


class VectorStore:
    def __init__(self, persist_dir: str):
        self.client = chromadb.PersistentClient(path=persist_dir)
        # Use ChromaDB's default embedding function (all-MiniLM-L6-v2, runs locally)
        self.collection = self.client.get_or_create_collection(name=COLLECTION_NAME)

    def add_chunks(self, chunks: list[dict]):
        batch_size = 100
        for start in range(0, len(chunks), batch_size):
            batch = chunks[start : start + batch_size]
            contents = [chunk["content"] for chunk in batch]

            self.collection.upsert(
                ids=[chunk["chunk_id"] for chunk in batch],
                documents=contents,
                metadatas=[
                    {
                        "source": chunk.get("source", ""),
                        "title": chunk.get("title", ""),
                        "category": chunk.get("category", ""),
                    }
                    for chunk in batch
                ],
            )

    def query(self, text: str, top_k: int = 5) -> list[dict]:
        results = self.collection.query(
            query_texts=[text],
            n_results=top_k,
            include=["documents", "metadatas", "distances"],
        )

        ids = self._first_result_list(results.get("ids"))
        documents = self._first_result_list(results.get("documents"))
        metadatas = self._first_result_list(results.get("metadatas"))
        distances = self._first_result_list(results.get("distances"))

        matches = []
        for index, chunk_id in enumerate(ids):
            metadata = metadatas[index] if index < len(metadatas) and metadatas[index] else {}
            item = {
                "chunk_id": chunk_id,
                "content": documents[index] if index < len(documents) else "",
                **metadata,
            }
            if index < len(distances):
                item["distance"] = distances[index]
            matches.append(item)

        return matches

    def count(self) -> int:
        return self.collection.count()

    def reset(self) -> None:
        try:
            self.client.delete_collection(name=COLLECTION_NAME)
        except ValueError:
            pass
        self.collection = self.client.get_or_create_collection(name=COLLECTION_NAME)

    @staticmethod
    def _first_result_list(value: Any) -> list:
        if not value:
            return []
        return value[0] if isinstance(value[0], list) else value
