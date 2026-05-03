"use client";

import { useT } from "@/lib/i18n";
import GlassCard from "@/components/glass-card";
import { Mail, ExternalLink, MessageCircle, Phone } from "lucide-react";

const iconMap: Record<string, React.ElementType> = {
  mail: Mail,
  github: ExternalLink,
  "message-circle": MessageCircle,
  phone: Phone,
};

export default function ContactPage() {
  const { t } = useT();

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[22px] font-bold m-0">{t.contact.title}</h2>

      {t.contact.items.map((c, i) => {
        const Icon = iconMap[c.icon] || Mail;
        return (
          <GlassCard key={i} className="flex items-center gap-3.5 !py-4 !px-5">
            <Icon size={22} className="text-accent shrink-0" />
            <div>
              <div className="text-xs opacity-40 mb-0.5">{c.label}</div>
              <div className="text-[15px] font-medium font-en">{c.value}</div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
