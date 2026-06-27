import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "脳年齢測定 — CHC理論で測る認知能力";

const TITLE = "脳年齢測定";
const SUBTITLE = "CHC理論で測る認知能力";
const TAGLINE = "同年代と比べた偏差値と脳年齢の目安がわかる";
const DOMAIN = "brain-three-gamma.vercel.app";

/**
 * Google Fonts から必要な文字だけのサブセット（TTF）を取得する。
 * satori は woff2 非対応・日本語グリフ非内蔵のため、
 * format('truetype') の URL を抜き出して ArrayBuffer で渡す。
 */
async function loadJaFont(text: string): Promise<ArrayBuffer> {
  const url = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@700&text=${encodeURIComponent(
    text
  )}`;
  const css = await (await fetch(url)).text();
  const match = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/);
  if (!match) throw new Error("font subset URL not found");
  const res = await fetch(match[1]);
  if (!res.ok) throw new Error("font download failed");
  return res.arrayBuffer();
}

export default async function Image() {
  const fontData = await loadJaFont(TITLE + SUBTITLE + TAGLINE + DOMAIN);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#EDEADE",
          fontFamily: "Noto",
          padding: 80,
        }}
      >
        <div style={{ display: "flex", fontSize: 130, color: "#1C2B38", letterSpacing: 4 }}>
          {TITLE}
        </div>
        <div style={{ display: "flex", width: 220, height: 10, background: "#A8843C", marginTop: 28, marginBottom: 36, borderRadius: 5 }} />
        <div style={{ display: "flex", fontSize: 46, color: "#1C2B38" }}>{SUBTITLE}</div>
        <div style={{ display: "flex", fontSize: 30, color: "#4A5A6A", marginTop: 24 }}>
          {TAGLINE}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#A8843C", marginTop: 56 }}>
          {DOMAIN}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto", data: fontData, weight: 700, style: "normal" }],
    }
  );
}
