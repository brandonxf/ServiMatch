import { MessageSquare } from 'lucide-react';

export default function ChatRootPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center bg-gray-50/50 text-gray-400">
      <MessageSquare size={48} className="mb-4 opacity-20" />
      <h2 className="text-lg font-medium text-gray-600">Tus mensajes</h2>
      <p className="text-sm mt-1">Selecciona una conversación en el panel lateral para comenzar.</p>
    </div>
  );
}
