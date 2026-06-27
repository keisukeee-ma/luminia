import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NavBar from "@/components/NavBar";

const noto = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto",
});

export const metadata: Metadata = {
  title: "脳年齢測定 — CHC",
  description: "CHC理論にもとづいて認知能力を測り、脳年齢の偏差値を出します。",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ja" className={`${noto.variable} h-full`}>
      <body className="font-body min-h-full flex flex-col antialiased">
        <NavBar />
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-border py-4 text-center text-xs text-muted">
          <Link href="/privacy" className="underline hover:text-ink">プライバシーポリシー</Link>
          <span className="mx-2">·</span>
          <span>© 2026 脳年齢測定</span>
        </footer>
      </body>
    </html>
  );
}
