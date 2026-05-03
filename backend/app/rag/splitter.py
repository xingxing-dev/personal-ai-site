from collections.abc import Iterable


def _iter_heading_sections(content: str) -> Iterable[tuple[str | None, str]]:
    current_heading: str | None = None
    current_lines: list[str] = []

    for line in content.splitlines():
        if line.startswith("## "):
            if current_heading is not None or current_lines:
                yield current_heading, "\n".join(current_lines).strip()
            current_heading = line[3:].strip()
            current_lines = [line]
        else:
            current_lines.append(line)

    if current_heading is not None or current_lines:
        yield current_heading, "\n".join(current_lines).strip()


def _split_large_section(content: str, target_size: int = 500) -> list[str]:
    if len(content) <= target_size:
        return [content]

    chunks: list[str] = []
    current = ""
    for block in content.split("\n\n"):
        block = block.strip()
        if not block:
            continue
        if current and len(current) + len(block) + 2 > target_size:
            chunks.append(current)
            current = block
        else:
            current = f"{current}\n\n{block}" if current else block

    if current:
        chunks.append(current)

    return chunks or [content]


def split_documents(docs: list[dict]) -> list[dict]:
    chunks: list[dict] = []

    for doc in docs:
        source = str(doc.get("source", ""))
        doc_title = str(doc.get("title", ""))
        category = str(doc.get("category", ""))
        content = str(doc.get("content", ""))

        for heading, section in _iter_heading_sections(content):
            if not section:
                continue
            title = heading or doc_title
            for section_chunk in _split_large_section(section):
                if not section_chunk:
                    continue
                chunk_id = f"{source}:{len(chunks)}"
                chunks.append(
                    {
                        "chunk_id": chunk_id,
                        "source": source,
                        "title": title,
                        "category": category,
                        "content": section_chunk,
                    }
                )

    return chunks
