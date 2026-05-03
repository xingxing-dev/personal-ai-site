"use client";

import { useState, useEffect } from "react";
import WindowTitleBar from "./window-title-bar";
import Sidebar from "./sidebar";
import FloatingAiButton from "./floating-ai-button";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div
      className={`desktop-bg w-full h-full flex items-center justify-center text-fg ${
        isMobile ? "p-0" : "p-5"
      }`}
    >
      {/* macOS Window */}
      <div
        className={`window-frame flex flex-col overflow-hidden ${
          isMobile
            ? "w-full h-full rounded-none border-none shadow-none"
            : "w-full max-w-[1200px] h-[calc(100%-40px)] max-h-[820px] rounded-3xl"
        }`}
      >
        <WindowTitleBar
          isMobile={isMobile}
          onMenuToggle={() => setSidebarOpen((o) => !o)}
        />

        <div className="flex-1 flex overflow-hidden relative">
          <Sidebar
            isMobile={isMobile}
            open={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main content */}
          <main
            className={`flex-1 overflow-y-auto overflow-x-hidden ${
              isMobile ? "p-5" : "p-8"
            }`}
          >
            <div className="max-w-[720px]">{children}</div>
          </main>
        </div>
      </div>

      <FloatingAiButton />
    </div>
  );
}
