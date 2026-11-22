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
    <div className="flex h-[calc(100dvh-4rem)] w-full bg-white overflow-hidden max-w-7xl mx-auto border-x border-ink shadow-sm">
      {/* Sidebar - Lista de chats */}
      <div className={`w-full md:w-[350px] lg:w-[400px] border-r border-ink flex flex-col bg-paper flex-shrink-0 transition-transform ${!isRoot ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-ink bg-white">
          <h1 className="font-display text-xl font-bold uppercase tracking-tight text-ink flex items-center gap-2">
            <MessageSquare size={20} aria-hidden="true" /> Mensajes
          </h1>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {loading ? (
            <div className="flex justify-center py-10"><Spinner size={24} /></div>
          ) : convs.length === 0 ? (
            <div className="text-center py-10 text-ink/70 text-sm">No tienes conversaciones aún.</div>
          ) : (
            convs.map(c => {
              const st = statusLabel[c.status];
              const isActive = pathname === `/chat/${c.requestId}`;
              return (
                <Link key={c.requestId} href={`/chat/${c.requestId}`} aria-current={isActive ? 'page' : undefined} className="block focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-blue-600">
                  <div className={`p-3 rounded-xl flex items-center gap-3 transition-all cursor-pointer ${isActive ? 'bg-signal border border-ink shadow-brutal-sm' : 'hover:bg-white border border-transparent hover:border-ink'}`}>
                    <Avatar src={c.otherUser.avatarUrl} name={c.otherUser.fullName} size={44} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`font-semibold text-sm truncate ${'text-ink'}`}>{c.otherUser.fullName}</p>
                        <p className="text-[10px] text-ink/60 flex-shrink-0">{timeAgo(c.updatedAt)}</p>
                      </div>
                      <p className="text-xs text-ink/70 truncate mt-0.5">{c.title}</p>
                      {c.lastMessage && (
                        <p className={`text-xs truncate mt-0.5 ${isActive ? 'text-ink/80' : 'text-ink/60'}`}>{c.lastMessage.content}</p>
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
