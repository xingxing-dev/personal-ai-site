"use client";

import { useT } from "@/lib/i18n";
import GlassCard from "@/components/glass-card";
import { FileText } from "lucide-react";

export default function ResumePage() {
  const { t } = useT();
  const d = t.resume;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[22px] font-bold m-0">{d.title}</h2>

      <GlassCard>
        <div className="text-center py-8">
          <div className="w-16 h-20 mx-auto mb-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/20 border-2 border-accent/15 flex items-center justify-center">
            <FileText className="w-7 h-7 text-accent" />
          </div>
          <div className="text-base font-semibold mb-1">{d.filename}</div>
          <div className="text-[13px] opacity-40 mb-5">{d.updated}</div>
          <button className="px-7 py-2.5 rounded-[10px] border-none cursor-pointer bg-accent text-white text-sm font-semibold">
            {d.download}
          </button>
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="m-0 mb-3 text-[15px] font-semibold">{d.previewTitle}</h3>
        <div className="opacity-45 text-sm leading-[1.8] italic">
          {d.previewNote}
        </div>
      </GlassCard>
    </div>
  );
}
