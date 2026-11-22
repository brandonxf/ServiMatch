import Link from 'next/link';
import { useState } from 'react';
import { Calendar, MapPin, MessageSquare, Star } from 'lucide-react';
import type { Request } from '@/types';
import { statusLabel, formatPrice, formatDate } from '@/lib/utils';
import { Avatar } from '../ui/Avatar';
import { ReviewModal } from '../modals/ReviewModal';

interface Props { request: Request; viewAs?: 'client' | 'worker'; onStatusChange?: (id: string, status: string) => void; }

export function RequestCard({ request, viewAs = 'client', onStatusChange }: Props) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const status = statusLabel[request.status] ?? { label: request.status, color: 'bg-ink/10 text-ink' };
  const otherParty = viewAs === 'client' ? request.worker?.user : request.client;

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-ink truncate">{request.title}</h3>
          <p className="text-sm text-ink/70 mt-0.5">{request.category?.name}</p>
        </div>
        <span className={`badge whitespace-nowrap ${status.color}`}>{status.label}</span>
      </div>

      {otherParty && (
        <div className="flex items-center gap-2 mb-3">
          <Avatar src={otherParty.avatarUrl} name={otherParty.fullName} size={28} />
          <span className="text-sm text-ink/70">{otherParty.fullName}</span>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 text-xs text-ink/70 mb-3">
        {request.address && (
          <span className="flex items-center gap-1"><MapPin size={11} />{request.address}</span>
        )}
        <span className="flex items-center gap-1">
          <Calendar size={11} />{formatDate(request.createdAt)}
        </span>
        {request.budget && <span className="font-semibold text-ink">{formatPrice(request.budget)}</span>}
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
            <button onClick={() => onStatusChange?.(request.id, 'reject')} className="text-xs py-1.5 px-3 text-red-700 hover:bg-red-100 rounded-lg transition-colors">Rechazar</button>
          </>
        )}
        {viewAs === 'worker' && request.status === 'ACCEPTED' && (
          <button onClick={() => onStatusChange?.(request.id, 'start')} className="btn-primary text-xs py-1.5 px-3">Iniciar trabajo</button>
        )}
        {viewAs === 'worker' && request.status === 'IN_PROGRESS' && (
          <button onClick={() => onStatusChange?.(request.id, 'complete')} className="btn-primary text-xs py-1.5 px-3">Marcar completado</button>
        )}
        {viewAs === 'client' && request.status === 'COMPLETED' && !request.review && (
          <button onClick={() => setShowReviewModal(true)} className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3 bg-yellow-500 hover:bg-yellow-600 border-ink">
            <Star size={13} aria-hidden="true" className="fill-ink" /> Calificar trabajador
          </button>
        )}
        {viewAs === 'client' && request.status === 'COMPLETED' && request.review && (
          <span className="flex items-center gap-1 text-xs font-semibold text-ink bg-signal px-3 py-1.5 rounded-lg border border-ink">
            <Star size={13} className="fill-signal text-ink" /> Calificado
          </span>
        )}
      </div>

      {showReviewModal && viewAs === 'client' && (
        <ReviewModal
          requestId={request.id}
          workerName={request.worker?.user?.fullName ?? 'Trabajador'}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            setShowReviewModal(false);
            if (onStatusChange) {
              // Hacky way to reload the list without adding a generic onReload prop
              // We can just call onStatusChange with a dummy status to trigger load()
              onStatusChange(request.id, 'reload_reviews');
            }
          }}
        />
      )}
    </div>
  );
}
