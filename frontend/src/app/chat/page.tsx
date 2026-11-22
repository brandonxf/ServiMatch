import { MessageSquare } from 'lucide-react';

export default function ChatRootPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-paper text-ink/70">
      <MessageSquare size={48} aria-hidden="true" className="mb-4" />
      <h2 className="font-display text-2xl font-bold uppercase tracking-tight text-ink">Tus mensajes</h2>
      <p className="text-sm mt-1">Selecciona una conversación en el panel lateral para comenzar.</p>
    </div>
  );
}
