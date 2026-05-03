"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { useT } from "@/lib/i18n";
import { askQuestion } from "@/lib/api";
import SourceCard from "./source-card";
import type { ChatMessage } from "@/types";

export default function ChatBox() {
  const { t } = useT();
  const d = t.ask;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const sendMessage = async (text?: string) => {
    const q = (text || input).trim();
    if (!q || loading) return;
    setInput("");
    setError("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await askQuestion(q);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.answer, sources: res.sources },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : d.errorOffline);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[22px] font-bold m-0">{d.title}</h2>

      {/* Suggested questions */}
      <div className="glass-card !p-4">
        <div className="text-[13px] opacity-45 mb-2.5">{d.suggestLabel}</div>
        <div className="flex flex-wrap gap-2">
          {d.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="px-3.5 py-1.5 rounded-2xl border border-amber-900/[0.12] dark:border-white/[0.08] bg-amber-900/[0.04] dark:bg-white/[0.04] text-[13px] cursor-pointer text-inherit transition-colors hover:bg-accent/10"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-3.5 max-h-[420px] overflow-y-auto pr-1"
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex flex-col gap-1.5 ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 text-sm leading-[1.7] ${
                msg.role === "user"
                  ? "bg-accent text-white rounded-2xl rounded-br-sm"
                  : "bg-amber-900/[0.06] dark:bg-white/[0.06] rounded-2xl rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
            {msg.sources && msg.sources.length > 0 && (
              <div className="max-w-[85%] flex flex-col gap-1.5 mt-1">
                <div className="text-[11px] opacity-40 font-semibold">
                  {d.sourcesLabel}
                </div>
                {msg.sources.map((s, j) => (
                  <SourceCard key={j} source={s} />
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="bg-amber-900/[0.06] dark:bg-white/[0.06] px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm self-start">
            <span className="typing-dots">{d.thinking}</span>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="px-3.5 py-2 rounded-[10px] bg-red-500/10 text-red-600 dark:text-red-400 text-[13px]">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2.5 p-1.5 bg-amber-900/[0.04] dark:bg-white/[0.04] rounded-[14px] border border-amber-900/10 dark:border-white/[0.08]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder={d.placeholder}
          className="flex-1 px-3.5 py-2.5 border-none bg-transparent text-sm outline-none text-inherit"
        />
        <button
          onClick={() => sendMessage()}
          disabled={loading || !input.trim()}
          className="px-4 py-2 rounded-[10px] border-none cursor-pointer bg-accent text-white text-sm font-semibold opacity-100 disabled:opacity-40 transition-opacity"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
