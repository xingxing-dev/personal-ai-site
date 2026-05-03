import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { I18nProvider } from "@/lib/i18n";
import AppShell from "@/components/app-shell";

export const metadata: Metadata = {
  title: "Xingxing Song — Personal AI Site",
  description:
    "宋星星的个人网站，北京交通大学 AI 专业，专注 LLM & Agent 研究。支持 AI 问答。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full" suppressHydrationWarning>
      <body className="h-full font-serif antialiased">
        <ThemeProvider>
          <I18nProvider>
            <AppShell>{children}</AppShell>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
