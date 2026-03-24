'use client';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MessageSquare } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import type { Conversation } from '@/types';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { timeAgo, statusLabel } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/auth.store';

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  
  const isRoot = pathname === '/chat'; // Si estamos en /chat, mostramos la lista (útil para móvil)

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    chatApi.getConversations().then(({ data }) => setConvs(data as any)).finally(() => setLoading(false));
  }, [router]);

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full bg-white overflow-hidden max-w-7xl mx-auto border-x border-gray-100 shadow-sm">
      {/* Sidebar - Lista de chats */}
      <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-gray-200 flex flex-col bg-gray-50 flex-shrink-0 transition-transform ${!isRoot ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-gray-200 bg-white">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare size={20} className="text-blue-600" /> Mensajes
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size={24} /></div>
          ) : convs.length === 0 ? (
            <div className="text-center py-10 text-gray-500 text-sm">No tienes conversaciones aún.</div>
          ) : (
            convs.map(c => {
              const st = statusLabel[c.status];
              const isActive = pathname === `/chat/${c.requestId}`;
              return (
                <Link key={c.requestId} href={`/chat/${c.requestId}`} className="block">
                  <div className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${isActive ? 'bg-blue-50 border border-blue-100' : 'hover:bg-white border border-transparent'}`}>
                    <Avatar src={c.otherUser.avatarUrl} name={c.otherUser.fullName} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold text-sm truncate ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>{c.otherUser.fullName}</p>
                        <p className="text-[10px] text-gray-400 flex-shrink-0">{timeAgo(c.updatedAt)}</p>
                      </div>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{c.title}</p>
                      {c.lastMessage && (
                        <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-blue-700/70' : 'text-gray-400'}`}>{c.lastMessage.content}</p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Main Content - Área de chat activo */}
      <div className={`flex-1 flex flex-col min-w-0 bg-white ${isRoot ? 'hidden md:flex' : 'flex'}`}>
        {children}
      </div>
    </div>
  );
}
