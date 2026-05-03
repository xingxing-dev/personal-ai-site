"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useT } from "@/lib/i18n";
import GlassCard from "@/components/glass-card";
import StatCard from "@/components/stat-card";
import Typewriter from "@/components/typewriter";
import { MessageCircle, ChevronRight } from "lucide-react";

export default function HomePage() {
  const { t } = useT();
  const h = t.home;
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <div className="flex flex-col gap-7">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="pt-4 pb-2"
      >
        <div className="text-sm opacity-45 mb-2 tracking-wide">{h.greeting}</div>
        <h1 className="text-[42px] font-bold m-0 tracking-tight leading-[1.1]">
          {h.name}
        </h1>
        <div className="text-[28px] font-light mt-2 text-accent tracking-tight min-h-[1.3em]">
          <Typewriter words={h.heroWords} />
        </div>
        <p className="mt-3 opacity-50 text-[15px]">
          {h.tagline} · {h.sub}
        </p>
      </motion.div>

      {/* Intro */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        <GlassCard>
          <p className="m-0 leading-[1.9] text-[15px] opacity-70">{h.intro}</p>
        </GlassCard>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3.5">
        {h.stats.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={mounted ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{
              duration: 0.6,
              delay: 0.4 + i * 0.15,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <StatCard label={s.label} value={s.value} />
          </motion.div>
        ))}
      </div>

      {/* AI Chat CTA */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={() => router.push("/ask")}
        className="cursor-pointer bg-gradient-to-br from-accent/[0.05] to-accent/[0.02] dark:from-accent/[0.12] dark:to-accent/[0.04] border border-accent/10 dark:border-accent/15 rounded-[18px] py-7 px-6 flex items-center gap-5 transition-all hover:-translate-y-0.5 hover:shadow-lg"
      >
        <div className="w-[52px] h-[52px] rounded-[14px] shrink-0 bg-gradient-to-br from-accent to-accent/70 flex items-center justify-center">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold mb-1">{h.aiCta}</div>
          <div className="text-[13px] opacity-50 leading-relaxed">{h.aiCtaSub}</div>
        </div>
        <ChevronRight size={20} className="text-accent opacity-60 shrink-0" />
      </motion.div>

      {/* Decorative line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
    </div>
  );
}
