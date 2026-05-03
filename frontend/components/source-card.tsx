import type { Source } from "@/types";

export default function SourceCard({ source }: { source: Source }) {
  return (
    <div className="p-2.5 px-3.5 rounded-[10px] bg-amber-900/[0.04] dark:bg-white/[0.04] border border-amber-900/[0.08] dark:border-white/[0.06] text-[13px]">
      <div className="font-semibold mb-0.5">{source.title}</div>
      <div className="opacity-45 text-[11px] font-en">
        {source.source} · {source.category}
      </div>
      <div className="opacity-55 mt-1 leading-relaxed">{source.content}</div>
    </div>
  );
}
