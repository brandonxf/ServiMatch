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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div aria-hidden="true" className="w-11 h-11 bg-signal border-2 border-ink flex items-center justify-center">
            <Bell size={20} />
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">Notificaciones</h1>
        </div>
        {notifications.some(n => !n.isRead) && (
          <button onClick={handleMarkAllRead} className="btn-secondary text-xs">
            <Check size={14} aria-hidden="true" /> Marcar todas
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="Sin notificaciones" description="Aquí aparecerán tus notificaciones de solicitudes, mensajes y reseñas." />
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <button
              type="button"
              key={n.id}
              onClick={() => !n.isRead && handleMarkRead(n.id)}
              className={`card w-full p-4 flex items-start gap-3 text-left transition-[transform,box-shadow] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none motion-reduce:transition-none ${!n.isRead ? 'bg-signal' : ''}`}>
              <span aria-hidden="true" className="text-xl flex-shrink-0 mt-0.5">{TYPE_ICONS[n.type] ?? '🔔'}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-display font-bold">{n.title}</span>
                <span className="block text-sm mt-0.5">{n.body}</span>
                <span className="block font-mono text-xs font-bold uppercase tracking-wider text-ink/60 mt-1">{timeAgo(n.createdAt)}</span>
              </span>
              {!n.isRead && <span className="badge bg-ink text-signal flex-shrink-0">Nueva</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
