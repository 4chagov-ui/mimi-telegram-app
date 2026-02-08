export type TelegramUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
};

const FALLBACK_USER: TelegramUser = {
  id: 0,
  first_name: 'Тестовый',
  last_name: 'Пользователь',
  username: 'test_user',
};

export function getTelegramUser(): TelegramUser | null {
  if (typeof window === 'undefined') return null;
  const tg = window.Telegram?.WebApp;
  if (!tg) return FALLBACK_USER;
  const user = tg.initDataUnsafe?.user;
  if (!user) return FALLBACK_USER;
  return {
    id: user.id,
    first_name: user.first_name ?? '',
    last_name: user.last_name,
    username: user.username,
  };
}

export function isInsideTelegram(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(window.Telegram?.WebApp?.initData);
}

export function setupTelegramWebApp(): void {
  if (typeof window === 'undefined') return;
  const tg = window.Telegram?.WebApp;
  if (tg) {
    tg.ready();
    tg.expand();
  }
}

export function showTelegramAlert(message: string): void {
  if (typeof window === 'undefined') return;
  if (window.Telegram?.WebApp?.showAlert) {
    window.Telegram.WebApp.showAlert(message);
  } else {
    window.alert(message);
  }
}
