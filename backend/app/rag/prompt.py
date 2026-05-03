from datetime import datetime
from zoneinfo import ZoneInfo


SYSTEM_PROMPT = """
你是宋星星个人网站里的自由 AI Chat，不是冷冰冰的检索机器人。
你的气质：聪明、轻松、幽默、有一点灵性，能自然闲聊、脑洞、解释问题，也可以适度使用 emoji。

回答规则：
- 普通闲聊、打招呼、创意问题、学习建议、技术讨论：自由回答，像一个有温度的聊天伙伴，允许幽默、比喻和 emoji。
- 如果用户询问今天日期、现在时间、星期几等基础时间问题：根据 user message 中的 Current time 回答，不要说自己没有实时感知时间。
- 如果用户询问宋星星的个人资料、项目、研究、经历、联系方式等事实，并且提供了 context chunks：优先根据 context chunks 回答，并可用【1】这样的编号引用来源。表达可以活泼，但事实必须稳。
- 不要编造宋星星没有在 context chunks 中出现的论文、实习、奖项、项目、排名、联系方式或经历。
- 列举技术栈、工具、论文、项目名时，只写 context chunks 明确出现的名称；不要为了幽默额外补充没有出现的具体技术词。
- 如果用户追问某个个人事实，但 context chunks 没有相关信息：坦率说资料里暂时没有，同时可以给出下一步建议，不要整段变成“资料未提及”。
- 如果 context chunks 与用户问题无关：忽略它们，正常聊天。
- 参考历史对话理解“他”“第二个”“刚才那个项目”等指代，但不要被历史带偏事实。
- 默认用用户提问的语言回答。保持真诚、轻盈，别端着。
""".strip()


def build_prompt(
    context_chunks: list[dict],
    question: str,
    history: list[dict] | None = None,
) -> tuple[str, str]:
    if context_chunks:
        context_block = "\n\n".join(
            _format_chunk(index, chunk)
            for index, chunk in enumerate(context_chunks, start=1)
        )
    else:
        context_block = "No relevant profile context was retrieved. Chat freely."

    history_block = _format_history(history or [])
    user_message = (
        "Current time:\n"
        f"{_format_current_time()}\n\n"
        "Conversation history:\n"
        f"{history_block}\n\n"
        "Context chunks:\n"
        f"{context_block}\n\n"
        "Question:\n"
        f"{question}"
    )

    return SYSTEM_PROMPT, user_message


def _format_current_time() -> str:
    now = datetime.now(ZoneInfo("Asia/Shanghai"))
    return now.strftime("%Y-%m-%d %A %H:%M:%S %Z; timezone=Asia/Shanghai")


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


def _format_history(history: list[dict], max_turns: int = 8) -> str:
    if not history:
        return "No prior conversation."

    lines = []
    for message in history[-max_turns:]:
        role = str(message.get("role") or "user")
        if role not in {"user", "assistant"}:
            role = "user"
        content = str(message.get("content") or "").strip()
        if not content:
            continue
        lines.append(f"{role}: {content[:1000]}")

    return "\n".join(lines) or "No prior conversation."


def _format_metadata(metadata: dict) -> str:
    if not metadata:
        return ""

    return "; ".join(
        f"{key}={value}"
        for key, value in metadata.items()
        if value not in (None, "")
    )
