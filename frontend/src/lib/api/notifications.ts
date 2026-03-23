import api from './client';
import type { Notification } from '@/types';

export const notificationsApi = {
  getAll: (unread?: boolean) =>
    api.get<{ data: Notification[]; unreadCount: number }>('/notifications', { params: { unread } }),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};
