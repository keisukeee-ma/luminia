import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 個人結果・計測中・マイページはクロール不要
      disallow: ["/results", "/session", "/mypage"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
