'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import type { Conversation } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { timeAgo, statusLabel } from '@/lib/utils';

export default function ConversationsPage() {
  const router = useRouter();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    chatApi.getConversations().then(({ data }) => setConvs(data as any)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
          <MessageSquare size={20} />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Mensajes</h1>
      </div>

      {loading ? <div className="flex justify-center py-20"><Spinner size={32} /></div>
        : convs.length === 0 ? (
          <EmptyState icon={<MessageSquare size={28} />} title="Sin conversaciones" description="Los chats se crean automáticamente cuando una solicitud es aceptada." />
        ) : (
          <div className="space-y-2">
            {convs.map(c => {
              const st = statusLabel[c.status];
              return (
                <Link key={c.requestId} href={`/chat/${c.requestId}`}>
                  <div className="card p-4 flex items-center gap-3 hover:shadow-md transition-all cursor-pointer">
                    <Avatar src={c.otherUser.avatarUrl} name={c.otherUser.fullName} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-bold text-gray-900 text-sm truncate">{c.otherUser.fullName}</p>
                        <p className="text-xs text-gray-400 flex-shrink-0">{timeAgo(c.updatedAt)}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{c.title}</p>
                      {c.lastMessage && (
                        <p className="text-xs text-gray-400 truncate">{c.lastMessage.content}</p>
                      )}
                    </div>
                    {st && <span className={`badge flex-shrink-0 ${st.color}`}>{st.label}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
    </div>
  );
}
