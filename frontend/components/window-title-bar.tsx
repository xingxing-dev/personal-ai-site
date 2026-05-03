"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { useT } from "@/lib/i18n";
import { useTheme } from "./theme-provider";

const routeToKey: Record<string, string> = {
  "/": "home",
  "/about": "about",
  "/education": "education",
  "/projects": "projects",
  "/skills": "skills",
  "/awards": "awards",
  "/resume": "resume",
  "/ask": "ask",
  "/contact": "contact",
};

export default function WindowTitleBar({
  isMobile,
  onMenuToggle,
}: {
  isMobile: boolean;
  onMenuToggle: () => void;
}) {
  const pathname = usePathname();
  const { lang, setLang, t } = useT();
  const { theme, toggleTheme } = useTheme();

  const key = routeToKey[pathname] || "home";
  const currentLabel = t.nav[key as keyof typeof t.nav] || "";

  return (
    <div
      className={`title-bar h-[52px] min-h-[52px] flex items-center px-4 gap-3 select-none ${
        isMobile ? "" : "rounded-t-3xl"
      }`}
    >
      {/* Traffic lights (desktop only) */}
      {!isMobile && (
        <div className="flex gap-2 mr-2">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
          <div className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-[#DEA123]" />
          <div className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1DAD2B]" />
        </div>
      )}

      {/* Mobile menu button */}
      {isMobile && (
        <button
          onClick={onMenuToggle}
          className="bg-transparent border-none cursor-pointer p-1 text-fg"
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      )}

      {/* Title */}
      <div className="flex-1 text-center text-[13px] font-semibold opacity-45 tracking-wide">
        {currentLabel} — {t.titleBar}
      </div>

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-theme bg-amber-900/[0.06] dark:bg-white/[0.05] text-fg font-en tracking-wide"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      {/* Language toggle */}
      <button
        onClick={() => setLang(lang === "zh" ? "en" : "zh")}
        className="px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer border border-theme bg-amber-900/[0.06] dark:bg-white/[0.05] text-fg font-en tracking-wide"
      >
        {lang === "zh" ? "EN" : "中"}
      </button>
    </div>
  );
}
