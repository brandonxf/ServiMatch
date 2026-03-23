'use client';
import { useEffect } from 'react';
import { Bell, Check } from 'lucide-react';
import { notificationsApi } from '@/lib/api/notifications';
import { useNotifStore } from '@/lib/store/notifications.store';
import { EmptyState } from '@/components/ui/EmptyState';
import { timeAgo } from '@/lib/utils';

const TYPE_ICONS: Record<string, string> = {
  NEW_REQUEST: '📋', REQUEST_ACCEPTED: '✅', REQUEST_REJECTED: '❌',
  REQUEST_COMPLETED: '🎉', NEW_MESSAGE: '💬', REVIEW_RECEIVED: '⭐',
};

export default function NotificationsPage() {
  const { notifications, setAll, markRead } = useNotifStore();

  useEffect(() => {
    notificationsApi.getAll().then(({ data }) => setAll(data.data, data.unreadCount));
  }, []);

  const handleMarkRead = async (id: string) => {
    await notificationsApi.markRead(id);
    markRead(id);
  };

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead();
    setAll(notifications.map(n => ({ ...n, isRead: true })), 0);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center">
            <Bell size={20} />
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900">Notificaciones</h1>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="btn-ghost text-sm py-1.5 px-3">
            <Check size={14} /> Marcar todas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="Sin notificaciones" description="Aquí aparecerán tus notificaciones de solicitudes, mensajes y reseñas." />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`card p-4 flex items-start gap-3 cursor-pointer transition-all hover:shadow-md ${!n.isRead ? 'border-blue-200 bg-blue-50/50' : ''}`}>
              <span className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? '🔔'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${!n.isRead ? 'text-gray-900' : 'text-gray-700'}`}>{n.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{n.body}</p>
                <p className="text-xs text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
              </div>
              {!n.isRead && <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
