// Telegram WebApp helpers
export type TgUser = {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
};

export function tg() {
  if (typeof window === "undefined") return null;
  return (window as any).Telegram?.WebApp;
}

export function initTelegram() {
  const w = tg();
  if (!w) return;
  try {
    w.ready();
    w.expand();
    // Use stable theme colors or fallback
    w.setHeaderColor?.("#0b0f17");
    w.setBackgroundColor?.("#0b0f17");
    w.enableClosingConfirmation?.();
  } catch (e) {
    console.warn("TWA Init failed:", e);
  }
}

export function getTgUser(): TgUser | null {
  return tg()?.initDataUnsafe?.user ?? null;
}

export function getTgChatId(): number | null {
  const w = tg();
  if (!w) return null;
  const u = w.initDataUnsafe;
  return u?.chat?.id ?? u?.user?.id ?? null;
}

export function haptic(type: "light" | "medium" | "heavy" | "success" | "error" | "warning" = "light") {
  const hf = tg()?.HapticFeedback;
  if (!hf) return;
  if (["success", "error", "warning"].includes(type)) hf.notificationOccurred?.(type);
  else hf.impactOccurred?.(type);
}

export function sendToBot(payload: unknown) {
  const w = tg();
  if (!w) {
    console.log("WebApp data (Dev mode):", payload);
    return;
  }
  w.sendData(JSON.stringify(payload));
}

export function closeApp() {
  tg()?.close();
}
