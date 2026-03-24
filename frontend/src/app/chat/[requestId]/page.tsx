'use client';
import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
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
  const [isTyping, setIsTyping] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const typingRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }

    // Cargar datos
    Promise.all([
      requestsApi.getById(requestId),
      chatApi.getMessages(requestId),
    ]).then(([req, msgs]) => {
      setRequest(req.data);
      setMessages(msgs.data as any);
    }).finally(() => setLoading(false));

    // Conectar socket
    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '') || 'http://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('join_room', { requestId });
    });

    socket.on('new_message', (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    socket.on('user_typing', () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 2000);
    });

    return () => { socket.disconnect(); };
  }, [requestId]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    const content = text.trim();
    setText('');
    try {
      socketRef.current?.emit('send_message', { requestId, content });
      // Fallback REST si el socket falla
    } catch {
      await chatApi.send(requestId, content);
    } finally { setSending(false); }
  };

  const handleTyping = () => {
    socketRef.current?.emit('typing', { requestId });
    clearTimeout(typingRef.current);
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Spinner size={36} /></div>;

  const otherUser = request?.client?.id === user?.id ? request?.worker?.user : request?.client;
  const st = statusLabel[request?.status ?? ''];

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header del chat */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 flex-shrink-0">
        <Link href="/chat" className="md:hidden btn-ghost p-1.5 -ml-1.5">
          <ArrowLeft size={18} />
        </Link>
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Avatar src={otherUser?.avatarUrl} name={otherUser?.fullName ?? '?'} size={38} />
          <div className="min-w-0">
            <p className="font-bold text-gray-900 text-sm truncate">{otherUser?.fullName}</p>
            <p className="text-xs text-gray-400 truncate">{request?.title}</p>
          </div>
        </div>
        {st && <span className={`badge flex-shrink-0 ${st.color}`}>{st.label}</span>}
      </div>

      {/* Mensajes */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50"
      >
        {messages.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-400 text-sm">
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
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm shadow-sm'
                }`}>
                  {msg.content}
                </div>
                <span className="text-xs text-gray-400 px-1">{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        {isTyping && (
          <div className="flex gap-2 items-end">
            <Avatar src={otherUser?.avatarUrl} name={otherUser?.fullName ?? '?'} size={28} />
            <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-3">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0 pb-6 md:pb-3">
        <div className="flex items-center gap-2 w-full">
          <input
            value={text}
            onChange={e => { setText(e.target.value); handleTyping(); }}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder="Escribe un mensaje..."
            className="input flex-1 py-2.5"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="btn-primary w-10 h-10 p-0 rounded-xl flex-shrink-0"
          >
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
      </div>
    </div>
  );
}
