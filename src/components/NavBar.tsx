"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LuminiaLogo from "@/components/LuminiaLogo";

export default function NavBar() {
  const pathname = usePathname();
  // 計測中はナビを隠す（集中・離脱対策）
  if (pathname.startsWith("/session")) return null;

  return (
    <header className="border-b border-border bg-paper">
      <nav className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LuminiaLogo size={22} />
          <span className="font-data text-base text-ink">Luminia</span>
        </Link>
        <div className="flex items-center gap-3 text-base">
          <Link href="/about" className="text-muted hover:text-ink">
            アプリについて
          </Link>
          <Link href="/dashboard" className="text-muted hover:text-ink">
            全国比較
          </Link>
          <Link href="/mypage" className="text-muted hover:text-ink">
            マイページ
          </Link>
          <Link
            href="/setup"
            className="bg-brass text-white px-3 py-1.5 rounded-md"
          >
            計測する
          </Link>
        </div>
      </nav>
    </header>
  );
}
