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
    { href: '/search', icon: <Wrench size={20} />, label: 'Buscar servicios', desc: 'Encuentra profesionales cerca', color: 'bg-signal/40 text-blue-700' },
    { href: '/dashboard/requests', icon: <Briefcase size={20} />, label: 'Mis solicitudes', desc: `${active.length} activas`, color: 'bg-purple-300 text-ink' },
    { href: '/chat', icon: <MessageSquare size={20} />, label: 'Mensajes', desc: 'Ver conversaciones', color: 'bg-green-300 text-ink' },
    { href: '/notifications', icon: <Bell size={20} />, label: 'Notificaciones', desc: 'Ver todas', color: 'bg-signal text-ink' },
    ...(user.isWorker ? [{ href: '/dashboard/worker', icon: <Star size={20} />, label: 'Mi perfil profesional', desc: 'Gestionar servicios', color: 'bg-orange-300 text-ink' }] : []),
    { href: '/dashboard/settings', icon: <Settings size={20} />, label: 'Configuración', desc: 'Editar perfil', color: 'bg-ink/10 text-ink/70' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Avatar src={user.avatarUrl} name={user.fullName} size={56} />
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink">Hola, {user.fullName.split(' ')[0]}</h1>
          <p className="text-ink/70 text-sm mt-0.5">{user.email}</p>
          <div className="flex gap-2 mt-1">
            <Badge variant="blue">{user.role === 'WORKER' ? 'Trabajador' : 'Cliente'}</Badge>
            {user.isVerified && <Badge variant="green">Verificado</Badge>}
          </div>
        </div>
      </div>

      {/* Stats rápidas */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Solicitudes activas', value: active.length, color: 'text-blue-700' },
          { label: 'Trabajos completados', value: completed.length, color: 'text-ink' },
          { label: 'Total solicitudes', value: requests.length, color: 'text-ink' },
        ].map(s => (
          <div key={s.label} className="card p-4 text-center">
            <p className={`font-display text-4xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-ink/70 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Accesos rápidos */}
      <div className="grid sm:grid-cols-2 gap-3 mb-8">
        {quickLinks.map(l => (
          <Link key={l.href} href={l.href} className="card p-4 flex items-center gap-3 transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none motion-reduce:transition-none">
            <div className={`w-11 h-11 border-2 border-ink flex items-center justify-center flex-shrink-0 ${l.color}`}>{l.icon}</div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-ink text-sm">{l.label}</p>
              <p className="text-xs text-ink/60">{l.desc}</p>
            </div>
            <ChevronRight size={16} className="text-ink/60 flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Solicitudes recientes */}
      {loading ? <div className="flex justify-center py-8"><Spinner /></div> : requests.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-ink">Solicitudes recientes</h2>
            <Link href="/dashboard/requests" className="text-sm text-blue-700 font-bold underline underline-offset-4">Ver todas</Link>
          </div>
          <div className="space-y-3">
            {requests.slice(0, 3).map(r => {
              const st = statusLabel[r.status] ?? { label: r.status, color: 'bg-ink/10 text-ink' };
              return (
                <Link key={r.id} href={`/dashboard/requests`}>
                  <div className="card p-4 flex items-center gap-3 hover:shadow-md transition-all">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-ink text-sm truncate">{r.title}</p>
                      <p className="text-xs text-ink/60 mt-0.5">{formatDate(r.createdAt)} · {r.category?.name}</p>
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
