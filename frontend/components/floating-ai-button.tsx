"use client";

import { usePathname, useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function FloatingAiButton() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/ask") return null;

  return (
    <button
      onClick={() => router.push("/ask")}
      className="fixed bottom-5 right-5 md:bottom-10 md:right-10 w-[52px] h-[52px] rounded-2xl border-none cursor-pointer bg-gradient-to-br from-accent to-accent/80 shadow-[0_4px_20px_rgba(196,113,59,0.27)] flex items-center justify-center transition-transform hover:scale-[1.08] hover:shadow-[0_6px_28px_rgba(196,113,59,0.35)] z-20"
    >
      <MessageCircle className="w-[22px] h-[22px] text-white" />
    </button>
  );
}
