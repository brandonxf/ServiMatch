'use client';
import Link from 'next/link';
import { Calendar, MapPin, MessageSquare } from 'lucide-react';
import type { Request } from '@/types';
import { statusLabel, formatPrice, formatDate } from '@/lib/utils';
import { Avatar } from '../ui/Avatar';

interface Props { request: Request; viewAs?: 'client' | 'worker'; onStatusChange?: (id: string, status: string) => void; }

export function RequestCard({ request, viewAs = 'client', onStatusChange }: Props) {
  const status = statusLabel[request.status] ?? { label: request.status, color: 'bg-gray-100 text-gray-700' };
  const otherParty = viewAs === 'client' ? request.worker?.user : request.client;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{request.title}</h3>
          <p className="text-sm text-gray-500 mt-0.5">{request.category?.name}</p>
        </div>
        <span className={`badge whitespace-nowrap ${status.color}`}>{status.label}</span>
      </div>

      {otherParty && (
        <div className="flex items-center gap-2 mb-3">
          <Avatar src={otherParty.avatarUrl} name={otherParty.fullName} size={28} />
          <span className="text-sm text-gray-600">{otherParty.fullName}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
        {request.address && (
          <span className="flex items-center gap-1"><MapPin size={11} />{request.address}</span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={11} />{formatDate(request.createdAt)}
        </span>
        {request.budget && <span className="font-semibold text-gray-700">{formatPrice(request.budget)}</span>}
      </div>

      <div className="flex gap-2 flex-wrap">
        <Link href={`/chat/${request.id}`} className="btn-ghost text-xs py-1.5 px-3">
          <MessageSquare size={13} /> Chat
        </Link>
        <Link href={`/dashboard/requests/${request.id}`} className="btn-secondary text-xs py-1.5 px-3">
          Ver detalle
        </Link>
        {viewAs === 'worker' && request.status === 'PENDING' && (
          <>
            <button onClick={() => onStatusChange?.(request.id, 'accept')} className="btn-primary text-xs py-1.5 px-3">Aceptar</button>
            <button onClick={() => onStatusChange?.(request.id, 'reject')} className="text-xs py-1.5 px-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors">Rechazar</button>
          </>
        )}
        {viewAs === 'worker' && request.status === 'ACCEPTED' && (
          <button onClick={() => onStatusChange?.(request.id, 'start')} className="btn-primary text-xs py-1.5 px-3">Iniciar trabajo</button>
        )}
        {viewAs === 'worker' && request.status === 'IN_PROGRESS' && (
          <button onClick={() => onStatusChange?.(request.id, 'complete')} className="btn-primary text-xs py-1.5 px-3">Marcar completado</button>
        )}
      </div>
    </div>
  );
}
