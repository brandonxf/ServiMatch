import { create } from 'zustand';
import type { Notification } from '@/types';

interface NotifState {
  notifications: Notification[];
  unreadCount: number;
  add: (n: Notification) => void;
  setAll: (ns: Notification[], count: number) => void;
  markRead: (id: string) => void;
}

export const useNotifStore = create<NotifState>((set) => ({
  notifications: [],
  unreadCount: 0,
  add: (n) => set((s) => ({ notifications: [n, ...s.notifications], unreadCount: s.unreadCount + 1 })),
  setAll: (ns, count) => set({ notifications: ns, unreadCount: count }),
  markRead: (id) => set((s) => ({
    notifications: s.notifications.map((n) => n.id === id ? { ...n, isRead: true } : n),
    unreadCount: Math.max(0, s.unreadCount - 1),
  })),
}));
