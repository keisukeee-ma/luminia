import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION } from "@/lib/site";

const noto = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-noto",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "脳年齢測定 — CHC理論で測る認知能力",
  description: SITE_DESCRIPTION,
  openGraph: {
    title: "脳年齢測定 — CHC理論で測る認知能力",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "脳年齢測定 — CHC理論で測る認知能力",
    description: SITE_DESCRIPTION,
  },
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
