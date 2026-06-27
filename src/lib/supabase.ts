import { createClient } from "@supabase/supabase-js";

// ビルド時に環境変数が未設定でもクラッシュしないようプレースホルダーを使う。
// 実際の API 呼び出しは本番環境変数が設定されている場合のみ成功する。
// PowerShell パイプ経由で設定した場合に末尾改行が混入することがあるため trim する。
const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co").trim();
const key = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder").trim();

export const supabase = createClient(url, key);
