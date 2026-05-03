"use client";

import { useT } from "@/lib/i18n";
import GlassCard from "@/components/glass-card";
import SkillBadge from "@/components/skill-badge";

export default function AboutPage() {
  const { t } = useT();
  const d = t.about;

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[22px] font-bold m-0">{d.title}</h2>

      <GlassCard>
        <div className="leading-[1.9] text-[15px] opacity-70">
          {d.paragraphs.map((p, i) => (
            <p key={i} className={i < d.paragraphs.length - 1 ? "mb-3" : ""}>
              {p}
            </p>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="m-0 mb-3 text-[15px] font-semibold">{d.interestsTitle}</h3>
        <div className="flex flex-wrap gap-2">
          {d.interests.map((i) => (
            <SkillBadge key={i} name={i} level="expert" />
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="m-0 mb-3 text-[15px] font-semibold">{d.hobbiesTitle}</h3>
        <div className="flex flex-wrap gap-2">
          {d.hobbies.map((h) => (
            <SkillBadge key={h} name={h} level="proficient" />
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
