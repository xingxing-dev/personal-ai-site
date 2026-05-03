"use client";

import { useT } from "@/lib/i18n";
import GlassCard from "@/components/glass-card";
import SkillBadge from "@/components/skill-badge";

export default function SkillsPage() {
  const { t } = useT();
  const d = t.skills;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[22px] font-bold m-0">{d.title}</h2>

      {d.categories.map((c) => (
        <GlassCard key={c.name}>
          <h3 className="m-0 mb-3 text-[15px] font-semibold">{c.name}</h3>
          <div className="flex flex-wrap gap-2">
            {c.skills.map((s) => (
              <SkillBadge key={s.name} name={s.name} level={s.level} />
            ))}
          </div>
        </GlassCard>
      ))}

      {/* Legend */}
      <GlassCard className="!p-4">
        <div className="flex gap-4 text-xs opacity-45 items-center">
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" /> {d.legend.expert}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7B9E6B]" /> {d.legend.proficient}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C49A3B]" /> {d.legend.familiar}
          </span>
        </div>
      </GlassCard>
    </div>
  );
}
