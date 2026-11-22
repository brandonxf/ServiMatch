'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { chatApi } from '@/lib/api/chat';
import { requestsApi } from '@/lib/api/requests';
import type { Message, Request } from '@/types';
import { useAuthStore } from '@/lib/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { timeAgo, statusLabel } from '@/lib/utils';
import Link from 'next/link';

export default function ChatPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { user } = useAuthStore();
  const router = useRouter();
  const [request, setRequest] = useState<Request | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }

    // Carga inicial
    Promise.all([
      requestsApi.getById(requestId),
      chatApi.getMessages(requestId),
    ]).then(([req, msgs]) => {
      setRequest(req.data);
      setMessages(msgs.data as any);
    }).finally(() => setLoading(false));

    // El backend corre en serverless (sin WebSockets persistentes):
    // se consulta periódicamente mientras la pestaña está visible.
    const poll = setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      chatApi.getMessages(requestId).then(({ data }) => setMessages(data as any)).catch(() => {});
    }, 4000);

    return () => clearInterval(poll);
  }, [requestId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      const { data } = await chatApi.send(requestId, content);
      setMessages(prev => prev.some(m => m.id === data.id) ? prev : [...prev, data]);
    } catch {
      setText(content);
    } finally { setSending(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-full min-h-[50vh]"><Spinner size={36} /></div>;

  const otherUser = request?.client?.id === user?.id ? request?.worker?.user : request?.client;
  const st = statusLabel[request?.status ?? ''];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header del chat */}
      <div className="bg-white border-b border-ink px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link href="/chat" aria-label="Volver a mensajes" className="md:hidden btn-ghost p-1.5 -ml-1.5">
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar src={otherUser?.avatarUrl} name={otherUser?.fullName ?? '?'} size={38} />
          <div className="min-w-0">
            <p className="font-display font-bold text-ink truncate">{otherUser?.fullName}</p>
            <p className="text-xs text-ink/60 truncate">{request?.title}</p>
          </div>
        </div>
        {st && <span className={`badge flex-shrink-0 ${st.color}`}>{st.label}</span>}
      </div>

      {/* Mensajes */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-paper"
      >
        {messages.length === 0 && !loading && (
          <div className="text-center py-10 text-ink/60 text-sm">
            <p>No hay mensajes aún.</p>
            <p className="mt-1">¡Inicia la conversación!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.sender.id === user?.id;
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
              {!isMe && <Avatar src={msg.sender.avatarUrl} name={msg.sender.fullName} size={28} className="flex-shrink-0 mt-1" />}
              <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-ink text-signal font-medium shadow-brutal-sm'
                    : 'bg-white text-ink border border-ink shadow-brutal-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-ink/60 px-1">{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-ink px-4 py-3 flex-shrink-0 pb-6 md:pb-3">
        <div className="flex items-center gap-2 w-full">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            aria-label="Mensaje" placeholder="Escribe un mensaje..."
            className="input flex-1 py-2.5"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            aria-label="Enviar mensaje" className="btn-primary w-11 h-11 p-0 flex-shrink-0"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
