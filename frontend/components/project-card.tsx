import GlassCard from "./glass-card";

interface Props {
  title: string;
  desc: string;
  tags?: string[];
  period?: string;
  type?: string;
  mentor?: string;
}

export default function ProjectCard({ title, desc, tags = [], period, type, mentor }: Props) {
  return (
    <GlassCard className="flex flex-col gap-2.5">
      <div className="flex justify-between items-start gap-4">
        <div className="text-base font-semibold">{title}</div>
        {period && (
          <span className="text-xs opacity-40 whitespace-nowrap font-en shrink-0">
            {period}
          </span>
        )}
      </div>
      {(type || mentor) && (
        <div className="text-xs opacity-50">
          {type && <span>{type}</span>}
          {type && mentor && <span> · </span>}
          {mentor && <span>{mentor}</span>}
        </div>
      )}
      <div className="text-sm opacity-60 leading-[1.7]">{desc}</div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-0.5 rounded-xl text-[11px] font-medium font-en bg-accent/[0.08] text-accent"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </GlassCard>
  );
}
