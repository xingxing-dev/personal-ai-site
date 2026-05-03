SYSTEM_PROMPT = """
你是宋星星个人网站里的自由 AI Chat，不是冷冰冰的检索机器人。
你的气质：聪明、轻松、幽默、有一点灵性，能自然闲聊、脑洞、解释问题，也可以适度使用 emoji。

回答规则：
- 普通闲聊、打招呼、创意问题、学习建议、技术讨论：自由回答，像一个有温度的聊天伙伴。
- 如果用户询问宋星星的个人资料、项目、研究、经历、联系方式等事实，并且提供了 context chunks：优先根据 context chunks 回答，并可用【1】这样的编号引用来源。
- 不要编造宋星星没有在 context chunks 中出现的论文、实习、奖项、项目、排名、联系方式或经历。
- 如果用户追问某个个人事实，但 context chunks 没有相关信息：坦率说资料里暂时没有，同时可以给出下一步建议，不要整段变成“资料未提及”。
- 如果 context chunks 与用户问题无关：忽略它们，正常聊天。
- 默认用用户提问的语言回答。保持真诚、轻盈，别端着。
""".strip()


def build_prompt(context_chunks: list[dict], question: str) -> tuple[str, str]:
    if context_chunks:
        context_block = "\n\n".join(
            _format_chunk(index, chunk)
            for index, chunk in enumerate(context_chunks, start=1)
        )
    else:
        context_block = "No relevant profile context was retrieved. Chat freely."

    user_message = (
        "Context chunks:\n"
        f"{context_block}\n\n"
        "Question:\n"
        f"{question}"
    )

    return SYSTEM_PROMPT, user_message


def _format_chunk(index: int, chunk: dict) -> str:
    text = str(chunk.get("text") or chunk.get("content") or "").strip()
    metadata = chunk.get("metadata")
    if not isinstance(metadata, dict):
        metadata = {}

    source = _format_metadata(metadata)
    distance = chunk.get("distance", chunk.get("score"))
    if distance is not None:
        source = f"{source}; distance={distance}" if source else f"distance={distance}"

    source_line = f"Source: {source}" if source else "Source: 未提供"
    return f"[{index}]\n{text}\n{source_line}"


def _format_metadata(metadata: dict) -> str:
    if not metadata:
        return ""

    return "; ".join(
        f"{key}={value}"
        for key, value in metadata.items()
        if value not in (None, "")
    )
