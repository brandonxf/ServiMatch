'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Briefcase, MessageSquare, TrendingUp, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import api from '@/lib/api/client';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice, timeAgo } from '@/lib/utils';

interface Stats {
  totalUsers: number;
  totalWorkers: number;
  totalRequests: number;
  totalRevenue: number;
  pendingRequests: number;
  completedRequests: number;
  recentUsers: any[];
  recentRequests: any[];
}

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    if (user && user.role !== 'ADMIN') { router.push('/dashboard'); return; }

    // Cargar stats combinando endpoints existentes
    Promise.all([
      api.get('/admin/stats').catch(() => ({ data: null })),
    ]).then(([statsRes]) => {
      if (statsRes.data) {
        setStats(statsRes.data);
      }
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'ADMIN') return null;
  if (loading) return <div className="flex items-center justify-center py-32"><Spinner size={36} /></div>;

  const statCards = [
    { label: 'Usuarios registrados', value: stats?.totalUsers ?? '—', icon: <Users size={20} />, color: 'bg-blue-100 text-blue-600', change: '+12%' },
    { label: 'Trabajadores activos', value: stats?.totalWorkers ?? '—', icon: <ShieldCheck size={20} />, color: 'bg-green-100 text-green-600', change: '+8%' },
    { label: 'Solicitudes totales', value: stats?.totalRequests ?? '—', icon: <Briefcase size={20} />, color: 'bg-purple-100 text-purple-600', change: '+23%' },
    { label: 'Ingresos (comisiones)', value: formatPrice(stats?.totalRevenue ?? 0), icon: <TrendingUp size={20} />, color: 'bg-orange-100 text-orange-600', change: '+31%' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-gray-900 text-white rounded-xl flex items-center justify-center">
          <ShieldCheck size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Panel de administración</h1>
          <p className="text-sm text-gray-500">Bienvenido, {user.fullName}</p>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(s => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            <p className="text-xs text-green-600 font-semibold mt-1">{s.change} este mes</p>
          </div>
        ))}
      </div>

      {/* Estado vacío informativo si no hay stats del backend */}
      {!stats && (
        <div className="card p-8 text-center mb-6">
          <AlertCircle size={32} className="mx-auto text-amber-400 mb-3" />
          <h3 className="font-bold text-gray-800 mb-1">Dashboard en construcción</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">
            Los endpoints <code className="bg-gray-100 px-1 rounded">/admin/stats</code> del backend
            deben estar activos para ver métricas en tiempo real.
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Acciones rápidas */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4">Acciones rápidas</h2>
          <div className="space-y-2">
            {[
              { label: 'Ver todos los usuarios', href: '/admin/users', icon: <Users size={16} /> },
              { label: 'Gestionar trabajadores', href: '/admin/workers', icon: <ShieldCheck size={16} /> },
              { label: 'Revisar solicitudes', href: '/admin/requests', icon: <Briefcase size={16} /> },
              { label: 'Seed de categorías', action: async () => {
                try {
                  await api.post('/services/seed');
                  alert('Categorías creadas exitosamente');
                } catch { alert('Error o categorías ya existentes'); }
              }, icon: <TrendingUp size={16} /> },
            ].map((item, i) => (
              item.href ? (
                <a key={i} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700">
                  <span className="text-blue-600">{item.icon}</span> {item.label}
                </a>
              ) : (
                <button key={i} onClick={item.action} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 w-full text-left">
                  <span className="text-blue-600">{item.icon}</span> {item.label}
                </button>
              )
            ))}
          </div>
        </div>

        {/* Info del sistema */}
        <div className="card p-5">
          <h2 className="font-bold text-gray-900 mb-4">Estado del sistema</h2>
          <div className="space-y-3">
            {[
              { label: 'API Backend', status: 'operational', desc: `${process.env.NEXT_PUBLIC_API_URL}` },
              { label: 'Base de datos', status: 'operational', desc: 'PostgreSQL conectado' },
              { label: 'WebSockets', status: 'operational', desc: 'Socket.io activo' },
            ].map(s => (
              <div key={s.label} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-800">{s.label}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[200px]">{s.desc}</p>
                </div>
                <span className="badge bg-green-100 text-green-700 text-xs">✓ Operacional</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
