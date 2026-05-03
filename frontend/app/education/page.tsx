"use client";

import { useT } from "@/lib/i18n";
import GlassCard from "@/components/glass-card";

export default function EducationPage() {
  const { t } = useT();
  const d = t.education;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[22px] font-bold m-0">{d.title}</h2>

      {d.items.map((e, i) => (
        <GlassCard key={i}>
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <div className="text-base font-semibold">{e.school}</div>
              <div className="text-[13px] opacity-50 mt-0.5">{e.degree}</div>
            </div>
            {e.period && (
              <span className="text-xs opacity-40 font-en">{e.period}</span>
            )}
          </div>
          <p className="m-0 text-sm opacity-60 leading-[1.7]">{e.desc}</p>
        </GlassCard>
      ))}
    </div>
  );
}
