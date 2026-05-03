"use client";

import { useT } from "@/lib/i18n";
import GlassCard from "@/components/glass-card";

export default function AwardsPage() {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[22px] font-bold m-0">{t.awards.title}</h2>

      {t.awards.items.map((a, i) => (
        <GlassCard key={i} className="flex justify-between items-center">
          <div>
            <div className="text-[15px] font-semibold">{a.title}</div>
            <div className="text-[13px] opacity-50 mt-0.5">{a.award}</div>
          </div>
          {a.year && (
            <span className="text-[13px] opacity-40 font-en">{a.year}</span>
          )}
        </GlassCard>
      ))}
    </div>
  );
}
