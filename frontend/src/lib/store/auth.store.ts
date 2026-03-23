import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/types';
import { authApi } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user, token) => {
        if (typeof window !== 'undefined') localStorage.setItem('access_token', token);
        set({ user, token });
      },

      logout: async () => {
        try { await authApi.logout(); } catch {}
        if (typeof window !== 'undefined') localStorage.removeItem('access_token');
        set({ user: null, token: null });
        window.location.href = '/auth/login';
      },

      fetchMe: async () => {
        set({ isLoading: true });
        try {
          const { data } = await authApi.me();
          set({ user: data });
        } catch {
          set({ user: null, token: null });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'servimatch-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
    },
  ),
);
