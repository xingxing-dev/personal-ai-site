const levelColors: Record<string, string> = {
  expert: "bg-accent",
  proficient: "bg-[#7B9E6B]",
  familiar: "bg-[#C49A3B]",
};

export default function SkillBadge({
  name,
  level,
}: {
  name: string;
  level: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[13px] font-medium bg-amber-900/[0.06] dark:bg-white/[0.06] border border-amber-900/10 dark:border-white/[0.08]">
      <span
        className={`w-1.5 h-1.5 rounded-full ${levelColors[level] || "bg-accent"}`}
      />
      {name}
    </span>
  );
}
