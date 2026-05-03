"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n";
import {
  Home, User, GraduationCap, FolderOpen, Zap,
  Award, FileText, MessageCircle, Mail,
} from "lucide-react";

const navItems = [
  { href: "/", key: "home", Icon: Home },
  { href: "/about", key: "about", Icon: User },
  { href: "/education", key: "education", Icon: GraduationCap },
  { href: "/projects", key: "projects", Icon: FolderOpen },
  { href: "/skills", key: "skills", Icon: Zap },
  { href: "/awards", key: "awards", Icon: Award },
  { href: "/resume", key: "resume", Icon: FileText },
  { href: "/ask", key: "ask", Icon: MessageCircle },
  { href: "/contact", key: "contact", Icon: Mail },
] as const;

export default function Sidebar({
  isMobile,
  open,
  onClose,
}: {
  isMobile: boolean;
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { t } = useT();

  if (isMobile && !open) return null;

  return (
    <>
      {/* Backdrop for mobile */}
      {isMobile && open && (
        <div
          onClick={onClose}
          className="absolute inset-0 bg-black/30 z-10"
        />
      )}
      <nav
        className={`sidebar-bg flex flex-col gap-0.5 py-3 px-2.5 overflow-y-auto ${
          isMobile
            ? "absolute left-0 top-0 bottom-0 w-60 z-[11] shadow-[4px_0_20px_rgba(0,0,0,0.15)]"
            : "relative w-[200px] min-w-[200px]"
        }`}
      >
        <div className="px-2.5 pt-2 pb-3.5 text-[10px] font-bold uppercase tracking-[0.1em] opacity-30 font-en">
          {t.navHeader}
        </div>
        {navItems.map(({ href, key, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-sm no-underline transition-all ${
                active
                  ? "bg-accent/[0.08] dark:bg-white/[0.08] text-accent font-semibold"
                  : "text-fg hover:bg-amber-900/[0.04] dark:hover:bg-white/[0.04]"
              }`}
            >
              <Icon
                size={17}
                strokeWidth={1.5}
                className={active ? "text-accent" : "text-fg-muted"}
              />
              {t.nav[key as keyof typeof t.nav]}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
