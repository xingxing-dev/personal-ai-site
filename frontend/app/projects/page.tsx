"use client";

import { useT } from "@/lib/i18n";
import ProjectCard from "@/components/project-card";

export default function ProjectsPage() {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[22px] font-bold m-0">{t.projects.title}</h2>
      {t.projects.items.map((p, i) => (
        <ProjectCard key={i} {...p} />
      ))}
    </div>
  );
}
