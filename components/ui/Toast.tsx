'use client';

import { useEffect } from 'react';
import { showTelegramAlert } from '@/lib/telegram';

type ToastProps = {
  message: string;
  onClose: () => void;
  duration?: number;
};

export function Toast({ message, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [onClose, duration]);
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 rounded-lg bg-gray-900/90 px-4 py-3 text-center text-white shadow-lg">
      {message}
    </div>
  );
}

export function showToast(message: string, isTelegram?: boolean) {
  if (typeof window === 'undefined') return;
  if (isTelegram && window.Telegram?.WebApp?.showAlert) {
    window.Telegram.WebApp.showAlert(message);
  }
}
