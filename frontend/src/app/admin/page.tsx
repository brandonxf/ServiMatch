'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Briefcase, TrendingUp, ShieldCheck,
  Clock, CheckCircle, XCircle, AlertCircle,
  Star, ArrowUpRight, ArrowDownRight, Minus,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import api from '@/lib/api/client';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { StarRating } from '@/components/ui/StarRating';
import { formatPrice, timeAgo, statusLabel } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  totalWorkers: number;
  totalRequests: number;
  completedRequests: number;
  pendingRequests: number;
  activeRequests: number;
  totalRevenue: number;
  totalVolume: number;
  newUsersThisMonth: number;
  requestsThisMonth: number;
  usersGrowth: number;
  requestsGrowth: number;
  requestsByStatus: { status: string; count: number }[];
  topCategories: { name: string; count: number }[];
  recentRequests: any[];
  recentUsers: any[];
  topWorkers: any[];
}

function GrowthBadge({ value }: { value: number }) {
  if (value > 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
      <ArrowUpRight size={11} /> +{value}%
    </span>
  );
  if (value < 0) return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
      <ArrowDownRight size={11} /> {value}%
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
      <Minus size={11} /> 0%
    </span>
  );
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-400',
  ACCEPTED: 'bg-blue-400',
  IN_PROGRESS: 'bg-purple-400',
  COMPLETED: 'bg-green-400',
  REJECTED: 'bg-red-300',
  CANCELLED: 'bg-gray-300',
};

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    if (user && user.role !== 'ADMIN') { router.push('/dashboard'); return; }

    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(err => setError(err.response?.data?.message ?? 'Error al cargar estadísticas'))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner size={36} className="mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Cargando dashboard...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <XCircle size={28} className="text-red-500" />
      </div>
      <h2 className="font-bold text-gray-900 text-lg mb-2">Error al cargar el dashboard</h2>
      <p className="text-gray-500 text-sm mb-4">{error}</p>
      <button onClick={() => window.location.reload()} className="btn-primary inline-flex px-6 py-2.5">
        Reintentar
      </button>
    </div>
  );

  if (!stats) return null;

  const totalForBar = stats.requestsByStatus.reduce((s, r) => s + r.count, 0) || 1;

  const kpis = [
    {
      label: 'Usuarios registrados',
      value: stats.totalUsers.toLocaleString('es-CO'),
      sub: `${stats.newUsersThisMonth} nuevos este mes`,
      growth: stats.usersGrowth,
      icon: <Users size={20} />,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      label: 'Trabajadores activos',
      value: stats.totalWorkers.toLocaleString('es-CO'),
      sub: 'perfiles activos',
      growth: null,
      icon: <ShieldCheck size={20} />,
      color: 'bg-green-100 text-green-600',
    },
    {
      label: 'Solicitudes totales',
      value: stats.totalRequests.toLocaleString('es-CO'),
      sub: `${stats.requestsThisMonth} este mes`,
      growth: stats.requestsGrowth,
      icon: <Briefcase size={20} />,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      label: 'Ingresos (comisiones)',
      value: formatPrice(stats.totalRevenue),
      sub: `Volumen: ${formatPrice(stats.totalVolume)}`,
      growth: null,
      icon: <TrendingUp size={20} />,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div>
          <p className="text-sm text-gray-500 font-medium mb-1">Panel de administración</p>
          <h1 className="text-2xl font-extrabold text-gray-900">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/users" className="btn-secondary text-sm py-2 px-4">
            <Users size={15} /> Usuarios
          </Link>
          <button
            onClick={async () => {
              try { await api.post('/services/seed'); alert('Categorías creadas ✓'); }
              catch { alert('Las categorías ya existen o hubo un error'); }
            }}
            className="btn-secondary text-sm py-2 px-4"
          >
            Seed datos
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(k => (
          <div key={k.label} className="card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${k.color}`}>
                {k.icon}
              </div>
              {k.growth !== null && <GrowthBadge value={k.growth} />}
            </div>
            <p className="text-2xl font-extrabold text-gray-900 leading-none">{k.value}</p>
            <p className="text-xs text-gray-500 mt-1.5">{k.sub}</p>
            <p className="text-xs text-gray-400 font-medium mt-0.5">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Fila 2: Estado de solicitudes + Top categorías */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">

        {/* Estado de solicitudes */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Briefcase size={16} className="text-purple-600" /> Solicitudes por estado
          </h2>
          <div className="space-y-3">
            {stats.requestsByStatus
              .sort((a, b) => b.count - a.count)
              .map(r => {
                const pct = Math.round((r.count / totalForBar) * 100);
                const st = statusLabel[r.status];
                return (
                  <div key={r.status}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-2.5 h-2.5 rounded-full ${STATUS_COLORS[r.status] ?? 'bg-gray-300'}`} />
                        <span className="text-sm text-gray-700 font-medium">{st?.label ?? r.status}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">{r.count}</span>
                        <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${STATUS_COLORS[r.status] ?? 'bg-gray-300'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Mini stats */}
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100">
            {[
              { label: 'Pendientes', value: stats.pendingRequests, icon: <Clock size={14} className="text-yellow-500" /> },
              { label: 'En curso', value: stats.activeRequests, icon: <AlertCircle size={14} className="text-blue-500" /> },
              { label: 'Completadas', value: stats.completedRequests, icon: <CheckCircle size={14} className="text-green-500" /> },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className="flex justify-center mb-1">{s.icon}</div>
                <p className="text-lg font-extrabold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top categorías */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-orange-600" /> Categorías más solicitadas
          </h2>
          {stats.topCategories.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-6">Sin datos aún</p>
          ) : (
            <div className="space-y-3">
              {stats.topCategories.map((c, i) => {
                const maxCount = stats.topCategories[0]?.count || 1;
                const pct = Math.round((c.count / maxCount) * 100);
                const colors = ['bg-blue-500', 'bg-purple-500', 'bg-orange-500', 'bg-green-500', 'bg-pink-500'];
                return (
                  <div key={c.name} className="flex items-center gap-3">
                    <span className="w-5 text-xs font-bold text-gray-400 text-center">#{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-semibold text-gray-800">{c.name}</span>
                        <span className="text-sm font-bold text-gray-600">{c.count}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i % colors.length]}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Top workers */}
          <div className="mt-5 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5">
              <Star size={14} className="text-yellow-400 fill-yellow-400" /> Top trabajadores
            </h3>
            {stats.topWorkers.length === 0 ? (
              <p className="text-gray-400 text-xs">Sin datos aún</p>
            ) : (
              <div className="space-y-2">
                {stats.topWorkers.map(w => (
                  <div key={w.id} className="flex items-center gap-2.5">
                    <Avatar src={w.avatarUrl} name={w.fullName} size={32} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{w.fullName}</p>
                      <p className="text-xs text-gray-400">{w.service} · {w.jobsCompleted} trabajos</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Star size={11} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-bold text-gray-700">{w.averageRating.toFixed(1)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fila 3: Solicitudes recientes + Usuarios recientes */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Solicitudes recientes */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm">Solicitudes recientes</h2>
            <Link href="/dashboard/requests" className="text-xs text-blue-600 font-semibold hover:underline">Ver todas</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentRequests.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Sin solicitudes aún</p>
            ) : stats.recentRequests.map((r: any) => {
              const st = statusLabel[r.status] ?? { label: r.status, color: 'bg-gray-100 text-gray-700' };
              return (
                <div key={r.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                  <Avatar src={r.client?.avatarUrl} name={r.client?.fullName ?? '?'} size={32} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{r.title}</p>
                    <p className="text-xs text-gray-400">
                      {r.client?.fullName} → {r.worker?.user?.fullName} · {timeAgo(r.createdAt)}
                    </p>
                  </div>
                  <span className={`badge whitespace-nowrap flex-shrink-0 ${st.color}`}>{st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Usuarios recientes */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-gray-900 text-sm">Usuarios recientes</h2>
            <span className="badge badge-blue">{stats.newUsersThisMonth} este mes</span>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.recentUsers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Sin usuarios aún</p>
            ) : stats.recentUsers.map((u: any) => (
              <div key={u.id} className="px-5 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                <Avatar src={u.avatarUrl} name={u.fullName} size={32} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{u.fullName}</p>
                  <p className="text-xs text-gray-400 truncate">{u.email} · {timeAgo(u.createdAt)}</p>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Badge variant={u.role === 'WORKER' ? 'green' : u.role === 'ADMIN' ? 'purple' : 'blue'}>
                    {u.role === 'WORKER' ? 'Worker' : u.role === 'ADMIN' ? 'Admin' : 'Cliente'}
                  </Badge>
                  {u.isVerified && (
                    <CheckCircle size={13} className="text-green-500" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
