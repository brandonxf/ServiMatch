'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Filter } from 'lucide-react';
import { requestsApi } from '@/lib/api/requests';
import type { Request, RequestStatus } from '@/types';
import { useAuthStore } from '@/lib/store/auth.store';
import { RequestCard } from '@/components/cards/RequestCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';

const TABS: { label: string; value: string }[] = [
  { label: 'Todas', value: '' },
  { label: 'Pendientes', value: 'PENDING' },
  { label: 'Activas', value: 'ACCEPTED' },
  { label: 'En progreso', value: 'IN_PROGRESS' },
  { label: 'Completadas', value: 'COMPLETED' },
];

export default function RequestsPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    load();
  }, [tab]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await requestsApi.getAll(tab || undefined);
      setRequests((data as any).data ?? []);
    } catch {
      toast.error('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, action: string) => {
    if (action === 'reload_reviews') {
      load();
      return;
    }
    try {
      const map: Record<string, () => Promise<any>> = {
        accept: () => requestsApi.accept(id),
        reject: () => requestsApi.reject(id),
        start: () => requestsApi.start(id),
        complete: () => requestsApi.complete(id),
        cancel: () => requestsApi.cancel(id),
      };
      await map[action]?.();
      toast.success('Estado actualizado');
      load();
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al actualizar');
    }
  };

  const isWorker = user?.role === 'WORKER' || user?.isWorker;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
          <Briefcase size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mis solicitudes</h1>
          <p className="text-sm text-gray-500">
            {isWorker ? 'Solicitudes recibidas de clientes' : 'Servicios que has solicitado'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 scrollbar-hide">
        {TABS.map(t => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              tab === t.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Spinner size={32} /></div>
      ) : requests.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={28} />}
          title="Sin solicitudes"
          description={isWorker ? 'Aún no has recibido solicitudes de clientes.' : 'Aún no has solicitado ningún servicio.'}
          action={!isWorker ? (
            <a href="/search" className="btn-primary inline-flex px-6 py-2.5">Buscar servicios</a>
          ) : undefined}
        />
      ) : (
        <div className="space-y-4">
          {requests.map(r => (
            <RequestCard
              key={r.id}
              request={r}
              viewAs={isWorker ? 'worker' : 'client'}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
