import type { ChatHistoryMessage, ChatResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "";

export async function askQuestion(
  question: string,
  history: ChatHistoryMessage[] = [],
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, history }),
  });
  if (!res.ok) {
    const msg = await res.text().catch(() => "请求失败");
    throw new Error(msg);
  }
  return res.json();
}

export async function healthCheck(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE}/api/health`);
  return res.json();
}
