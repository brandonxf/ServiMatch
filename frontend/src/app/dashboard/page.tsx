'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Briefcase, MessageSquare, Bell, Settings, ChevronRight, Star, Wrench } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { requestsApi } from '@/lib/api/requests';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { statusLabel, formatDate } from '@/lib/utils';
import type { Request } from '@/types';

export default function DashboardPage() {
  const { user, fetchMe } = useAuthStore();
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { fetchMe().then(() => {}); return; }
    requestsApi.getAll().then(({ data }) => setRequests((data as any).data ?? [])).finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) router.push('/auth/login');
  }, []);

  if (!user) return <div className="flex items-center justify-center py-32"><Spinner size={36} /></div>;

  const active = requests.filter(r => ['PENDING','ACCEPTED','IN_PROGRESS'].includes(r.status));
  const completed = requests.filter(r => r.status === 'COMPLETED');

  const quickLinks = [
    { href: '/search', icon: <Wrench size={20} />, label: 'Buscar servicios', desc: 'Encuentra profesionales cerca', color: 'bg-blue-100 text-blue-600' },
    { href: '/dashboard/requests', icon: <Briefcase size={20} />, label: 'Mis solicitudes', desc: `${active.length} activas`, color: 'bg-purple-100 text-purple-600' },
    { href: '/chat', icon: <MessageSquare size={20} />, label: 'Mensajes', desc: 'Ver conversaciones', color: 'bg-green-100 text-green-600' },
    { href: '/notifications', icon: <Bell size={20} />, label: 'Notificaciones', desc: 'Ver todas', color: 'bg-yellow-100 text-yellow-600' },
    ...(user.isWorker ? [{ href: '/dashboard/worker', icon: <Star size={20} />, label: 'Mi perfil profesional', desc: 'Gestionar servicios', color: 'bg-orange-100 text-orange-600' }] : []),
    { href: '/dashboard/settings', icon: <Settings size={20} />, label: 'Configuración', desc: 'Editar perfil', color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar src={user.avatarUrl} name={user.fullName} size={56} />
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Hola, {user.fullName.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 text-sm mt-0.5">{user.email}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="blue">{user.role === 'WORKER' ? 'Trabajador' : 'Cliente'}</Badge>
            {user.isVerified && <Badge variant="green">Verificado</Badge>}
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Solicitudes activas', value: active.length, color: 'text-blue-600' },
          { label: 'Trabajos completados', value: completed.length, color: 'text-green-600' },
          { label: 'Total solicitudes', value: requests.length, color: 'text-gray-700' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href} className="card p-4 flex items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${l.color}`}>{l.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 text-sm">{l.label}</p>
              <p className="text-xs text-gray-400">{l.desc}</p>
            </div>
            <ChevronRight size={16} className="text-gray-300 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Solicitudes recientes */}
      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : requests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Solicitudes recientes</h2>
            <Link href="/dashboard/requests" className="text-sm text-blue-600 font-medium hover:underline">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {requests.slice(0, 3).map(r => {
              const st = statusLabel[r.status] ?? { label: r.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <Link key={r.id} href={`/dashboard/requests`}>
                  <div className="card p-4 flex items-center gap-3 hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{r.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{formatDate(r.createdAt)} · {r.category?.name}</p>
                    </div>
                    <span className={`badge whitespace-nowrap ${st.color}`}>{st.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
