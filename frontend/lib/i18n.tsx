"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import zh from "@/content/zh.json";
import en from "@/content/en.json";

export type Lang = "zh" | "en";
export type SiteContent = typeof zh;

const contentMap: Record<Lang, SiteContent> = { zh, en };

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: SiteContent;
}

const I18nContext = createContext<I18nContextValue>({
  lang: "zh",
  setLang: () => {},
  t: zh,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("zh");
  return (
    <I18nContext.Provider value={{ lang, setLang, t: contentMap[lang] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useT() {
  return useContext(I18nContext);
}
