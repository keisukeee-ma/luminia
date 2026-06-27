const KEY = "brain_user_id";

/** デバイスに紐付いたユーザーUUIDを取得する。なければ生成して保存する。 */
export function getUserId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

/** 別端末のIDを自デバイスに上書き保存する（引き継ぎ時に使用）。 */
export function setUserId(id: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, id);
  }
}
