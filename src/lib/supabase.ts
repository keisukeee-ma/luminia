import { createClient } from "@supabase/supabase-js";

// ビルド時に環境変数が未設定でもクラッシュしないようプレースホルダーを使う。
// 実際の API 呼び出しは本番環境変数が設定されている場合のみ成功する。
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co";
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder";

export const supabase = createClient(url, key);
