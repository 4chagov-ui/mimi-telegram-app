import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TelegramUser } from '@/lib/telegram';

type UserState = {
  user: TelegramUser | null;
  setUser: (user: TelegramUser | null) => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: 'mimi-user' }
  )
);
