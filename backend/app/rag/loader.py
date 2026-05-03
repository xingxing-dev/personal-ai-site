from pathlib import Path


def _parse_scalar(value: str) -> str:
    value = value.strip()
    if len(value) >= 2 and value[0] == value[-1] and value[0] in {"'", '"'}:
        quote = value[0]
        value = value[1:-1]
        if quote == '"':
            value = value.replace(r"\"", '"').replace(r"\\", "\\")
        else:
            value = value.replace("''", "'")
    return value


def _parse_frontmatter(text: str) -> tuple[dict[str, str], str]:
    lines = text.splitlines(keepends=True)
    if not lines or lines[0].strip() != "---":
        return {}, text

    end_index = None
    for index, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            end_index = index
            break

    if end_index is None:
        return {}, text

    metadata: dict[str, str] = {}
    for line in lines[1:end_index]:
        stripped = line.strip()
        if not stripped or stripped.startswith("#") or ":" not in stripped:
            continue
        key, value = stripped.split(":", 1)
        key = key.strip()
        if key in {"title", "category", "updated"}:
            metadata[key] = _parse_scalar(value)

    body = "".join(lines[end_index + 1 :]).lstrip("\n")
    return metadata, body


def load_documents(data_dir: str) -> list[dict]:
    documents: list[dict] = []
    for path in sorted(Path(data_dir).glob("*.md")):
        if not path.is_file():
            continue

        metadata, content = _parse_frontmatter(path.read_text(encoding="utf-8"))
        documents.append(
            {
                "source": path.name,
                "title": metadata.get("title", path.stem),
                "category": metadata.get("category", ""),
                "content": content,
            }
        )

    return documents
