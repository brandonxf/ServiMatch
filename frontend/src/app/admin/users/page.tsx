'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/lib/store/auth.store';
import api from '@/lib/api/client';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDate } from '@/lib/utils';

interface AdminUser {
  id: string; fullName: string; email: string; phone?: string | null;
  role: string; isActive: boolean; isVerified: boolean; isWorker: boolean;
  createdAt: string; avatarUrl?: string | null;
}

const ROLES = [
  { label: 'Todos', value: '' },
  { label: 'Clientes', value: 'CLIENT' },
  { label: 'Trabajadores', value: 'WORKER' },
  { label: 'Admins', value: 'ADMIN' },
];
const LIMIT = 20;

export default function AdminUsersPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/users', { params: { page, limit: LIMIT, role: role || undefined } });
      setUsers(data.data ?? []);
      setTotal(data.meta?.total ?? 0);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    if (user && user.role !== 'ADMIN') { router.push('/dashboard'); return; }
    load();
  }, [page, role, user?.role]);

  const toggle = async (u: AdminUser) => {
    try {
      await api.patch(`/admin/users/${u.id}/${u.isActive ? 'suspend' : 'activate'}`);
      toast.success(u.isActive ? 'Usuario suspendido' : 'Usuario activado');
      setUsers(prev => prev.map(x => x.id === u.id ? { ...x, isActive: !x.isActive } : x));
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'No se pudo actualizar');
    }
  };

  const pages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link href="/admin" className="inline-flex items-center gap-1 text-sm text-ink/70 mb-4">
        <ArrowLeft size={14} /> Volver al panel
      </Link>
      <h1 className="text-2xl font-bold text-ink mb-4">Usuarios ({total})</h1>

      <div className="flex gap-2 flex-wrap mb-4">
        {ROLES.map(r => (
          <button key={r.value} onClick={() => { setPage(1); setRole(r.value); }}
            className={role === r.value ? 'btn-primary text-sm py-1.5 px-3' : 'btn-secondary text-sm py-1.5 px-3'}>
            {r.label}
          </button>
        ))}
      </div>

      {loading ? <div className="flex justify-center py-16"><Spinner /></div>
        : users.length === 0 ? <EmptyState icon={<Users size={32} />} title="Sin usuarios" description="No hay usuarios para este filtro." />
        : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="card p-3 flex items-center gap-3">
                <Avatar src={u.avatarUrl} name={u.fullName} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink truncate">{u.fullName}</p>
                  <p className="text-xs text-ink/70 truncate">{u.email} · {u.role} · {formatDate(u.createdAt)}</p>
                </div>
                {!u.isActive && <span className="badge bg-red-600 text-white">Suspendido</span>}
                {u.role !== 'ADMIN' && u.id !== user?.id && (
                  <button onClick={() => toggle(u)} className="btn-secondary text-xs py-1.5 px-3">
                    {u.isActive ? 'Suspender' : 'Activar'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      {pages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Anterior</button>
          <span className="text-sm">{page} / {pages}</span>
          <button disabled={page >= pages} onClick={() => setPage(p => p + 1)} className="btn-secondary text-sm py-1.5 px-3 disabled:opacity-40">Siguiente</button>
        </div>
      )}
    </div>
  );
}
