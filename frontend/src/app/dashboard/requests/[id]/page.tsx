'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { requestsApi } from '@/lib/api/requests';
import type { Request } from '@/types';
import { useAuthStore } from '@/lib/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { statusLabel, formatPrice, formatDate } from '@/lib/utils';

export default function RequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await requestsApi.getById(id);
      setRequest(data);
    } catch {
      toast.error('No se pudo cargar la solicitud');
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    load();
  }, [id]);

  const act = async (fn: () => Promise<any>) => {
    try { await fn(); toast.success('Estado actualizado'); load(); }
    catch (err: any) { toast.error(err.response?.data?.message ?? 'No se pudo actualizar'); }
  };

  if (loading) return <div className="flex justify-center py-24"><Spinner /></div>;
  if (!request) return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <p className="mb-4">Solicitud no encontrada.</p>
      <Link href="/dashboard/requests" className="btn-secondary">Volver a mis solicitudes</Link>
    </div>
  );

  const status = statusLabel[request.status] ?? { label: request.status, color: 'bg-ink/10 text-ink' };
  const isWorker = !!user && request.worker?.user?.id === user.id;
  const other = isWorker ? request.client : request.worker?.user;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link href="/dashboard/requests" className="inline-flex items-center gap-1 text-sm text-ink/70 mb-4">
        <ArrowLeft size={14} /> Mis solicitudes
      </Link>
      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-ink">{request.title}</h1>
            <p className="text-sm text-ink/70">{request.category?.name}</p>
          </div>
          <span className={`badge whitespace-nowrap ${status.color}`}>{status.label}</span>
        </div>

        {other && (
          <div className="flex items-center gap-2">
            <Avatar src={other.avatarUrl} name={other.fullName} size={32} />
            <span className="text-sm">{isWorker ? 'Cliente' : 'Trabajador'}: <b>{other.fullName}</b></span>
          </div>
        )}

        {request.description && <p className="text-sm whitespace-pre-wrap">{request.description}</p>}

        <div className="flex flex-wrap gap-4 text-sm text-ink/70">
          {request.address && <span className="flex items-center gap-1"><MapPin size={13} />{request.address}</span>}
          <span className="flex items-center gap-1"><Calendar size={13} />Creada: {formatDate(request.createdAt)}</span>
          {request.scheduledAt && <span className="flex items-center gap-1"><Calendar size={13} />Agendada: {formatDate(request.scheduledAt)}</span>}
          {request.completedAt && <span>Completada: {formatDate(request.completedAt)}</span>}
        </div>

        <div className="text-sm">
          <p>Presupuesto: <b>{formatPrice(request.budget)}</b></p>
          {request.finalPrice ? <p>Precio final: <b>{formatPrice(request.finalPrice)}</b></p> : null}
        </div>

        {request.review && (
          <div className="border-2 border-ink p-3 text-sm">
            <p className="font-bold">Reseña: {request.review.rating}/5</p>
            {request.review.comment && <p>{request.review.comment}</p>}
          </div>
        )}

        <div className="flex gap-2 flex-wrap pt-2">
          <Link href={`/chat/${request.id}`} className="btn-ghost text-sm py-1.5 px-3"><MessageSquare size={14} /> Chat</Link>
          {isWorker && request.status === 'PENDING' && (<>
            <button onClick={() => act(() => requestsApi.accept(id))} className="btn-primary text-sm py-1.5 px-3">Aceptar</button>
            <button onClick={() => act(() => requestsApi.reject(id))} className="text-sm py-1.5 px-3 text-red-700">Rechazar</button>
          </>)}
          {isWorker && request.status === 'ACCEPTED' && <button onClick={() => act(() => requestsApi.start(id))} className="btn-primary text-sm py-1.5 px-3">Iniciar trabajo</button>}
          {isWorker && request.status === 'IN_PROGRESS' && <button onClick={() => act(() => requestsApi.complete(id))} className="btn-primary text-sm py-1.5 px-3">Marcar completado</button>}
          {!isWorker && ['PENDING', 'ACCEPTED'].includes(request.status) && (
            <button onClick={() => act(() => requestsApi.cancel(id))} className="text-sm py-1.5 px-3 text-red-700">Cancelar solicitud</button>
          )}
        </div>
      </div>
    </div>
  );
}
