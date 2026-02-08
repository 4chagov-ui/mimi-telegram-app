'use client';

import { useEffect } from 'react';
import { getTelegramUser, setupTelegramWebApp } from '@/lib/telegram';
import { useUserStore } from '@/store/user-store';

export function Providers({ children }: { children: React.ReactNode }) {
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    setupTelegramWebApp();
    const user = getTelegramUser();
    if (user) setUser(user);
  }, [setUser]);

  return <>{children}</>;
}
