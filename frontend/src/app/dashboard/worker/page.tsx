'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, Briefcase, ToggleLeft, ToggleRight, Plus, Trash2, Edit2 } from 'lucide-react';
import { workersApi } from '@/lib/api/workers';
import type { WorkerProfile, ServiceCategory } from '@/types';
import { useAuthStore } from '@/lib/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice, priceUnitLabel } from '@/lib/utils';
import { toast } from 'sonner';

export default function WorkerDashboardPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ categoryId: '', customPrice: '', description: '' });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    Promise.all([
      workersApi.getMyProfile(),
      workersApi.getCategories(),
    ]).then(([p, c]) => {
      setProfile(p.data);
      setCategories((c.data as any) ?? []);
    }).catch(() => router.push('/dashboard/worker/setup')).finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    if (!profile) return;
    setToggling(true);
    try {
      const { data } = await workersApi.setAvailability(!profile.isAvailable);
      setProfile(p => p ? { ...p, isAvailable: (data as any).isAvailable } : p);
      toast.success((data as any).isAvailable ? 'Ahora estás disponible' : 'Marcado como no disponible');
    } catch { toast.error('Error al actualizar disponibilidad'); }
    finally { setToggling(false); }
  };

  const addService = async () => {
    if (!newService.categoryId) { toast.error('Selecciona una categoría'); return; }
    try {
      await workersApi.addService({
        categoryId: newService.categoryId,
        customPrice: newService.customPrice ? Number(newService.customPrice) : undefined,
        description: newService.description || undefined,
      });
      toast.success('Servicio agregado');
      setShowAddService(false);
      setNewService({ categoryId: '', customPrice: '', description: '' });
      const { data } = await workersApi.getMyProfile();
      setProfile(data);
    } catch (err: any) { toast.error(err.response?.data?.message ?? 'Error al agregar servicio'); }
  };

  const removeService = async (serviceId: string) => {
    if (!confirm('¿Eliminar este servicio?')) return;
    try {
      await workersApi.removeService(serviceId);
      setProfile(p => p ? { ...p, workerServices: p.workerServices?.filter(s => s.id !== serviceId) } : p);
      toast.success('Servicio eliminado');
    } catch { toast.error('Error al eliminar'); }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Spinner size={36} /></div>;

  if (!profile) return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <h2 className="text-xl font-bold text-ink mb-2">No tienes perfil de trabajador</h2>
      <p className="text-ink/70 mb-6">Crea tu perfil profesional para empezar a recibir clientes.</p>
      <Link href="/dashboard/worker/setup" className="btn-primary inline-flex px-6 py-3">Crear perfil</Link>
    </div>
  );

  const name = user?.fullName ?? 'Trabajador';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-ink">Mi perfil profesional</h1>
        <Link href="/dashboard/worker/setup" className="btn-secondary text-sm py-2 px-4">
          <Edit2 size={14} /> Editar perfil
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Stats */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-3 mb-4">
              <Avatar src={user?.avatarUrl} name={name} size={52} />
              <div>
                <h2 className="font-bold text-ink">{name}</h2>
                {profile.city && <p className="text-xs text-ink/70 flex items-center gap-1"><MapPin size={11} />{profile.city}</p>}
              </div>
            </div>

            {/* Toggle disponibilidad */}
            <button onClick={toggleAvailability} disabled={toggling}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all ${
                profile.isAvailable ? 'border-ink bg-green-300' : 'border-ink bg-paper'
              }`}>
              <span className={`text-sm font-semibold ${profile.isAvailable ? 'text-ink' : 'text-ink/70'}`}>
                {profile.isAvailable ? '✓ Disponible ahora' : 'No disponible'}
              </span>
              {toggling ? <Spinner size={16} /> : profile.isAvailable
                ? <ToggleRight size={24} className="text-ink" />
                : <ToggleLeft size={24} className="text-ink/60" />}
            </button>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-ink text-center">
              <div>
                <p className="font-bold text-ink">{Number(profile.averageRating).toFixed(1)}</p>
                <StarRating rating={Number(profile.averageRating)} size={10} />
              </div>
              <div>
                <p className="font-bold text-ink">{profile.reviewCount}</p>
                <p className="text-xs text-ink/60">Reseñas</p>
              </div>
              <div>
                <p className="font-bold text-ink">{profile.jobsCompleted}</p>
                <p className="text-xs text-ink/60">Trabajos</p>
              </div>
            </div>

            {profile.basePrice && (
              <div className="mt-4 pt-4 border-t border-ink">
                <p className="text-sm text-ink/70 mb-1">Precio base</p>
                <p className="text-xl font-bold text-blue-700">{formatPrice(profile.basePrice)}
                  <span className="text-sm font-normal text-ink/60"> {priceUnitLabel(profile.priceUnit)}</span>
                </p>
              </div>
            )}
          </div>

          {profile.bio && (
            <div className="card p-4">
              <h3 className="font-bold text-ink text-sm mb-2">Descripción</h3>
              <p className="text-sm text-ink/70 leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>

        {/* Servicios */}
        <div className="md:col-span-2 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink">Servicios que ofrezco</h3>
              <button onClick={() => setShowAddService(true)} className="btn-primary text-xs py-1.5 px-3">
                <Plus size={13} /> Agregar
              </button>
            </div>

            {!profile.workerServices?.length ? (
              <p className="text-sm text-ink/60 text-center py-4">Sin servicios aún. Agrega los servicios que ofreces.</p>
            ) : (
              <div className="space-y-3">
                {profile.workerServices.map(s => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-ink last:border-0">
                    <div>
                      <p className="font-semibold text-ink text-sm">{s.category.name}</p>
                      {s.description && <p className="text-xs text-ink/60">{s.description}</p>}
                    </div>
                    <div className="flex items-center gap-3">
                      {s.customPrice && <span className="text-sm font-bold text-blue-700">{formatPrice(s.customPrice)}</span>}
                      <button onClick={() => removeService(s.id)} className="p-1.5 text-red-400 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Zona de cobertura */}
          <div className="card p-5">
            <h3 className="font-bold text-ink mb-3">Zona de cobertura</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-ink/70 text-xs mb-1">Radio</p>
                <p className="font-semibold text-ink">{profile.coverageRadiusKm} km</p>
              </div>
              <div>
                <p className="text-ink/70 text-xs mb-1">Ciudad</p>
                <p className="font-semibold text-ink">{profile.city ?? 'No definida'}</p>
              </div>
              {profile.yearsExperience && (
                <div>
                  <p className="text-ink/70 text-xs mb-1">Experiencia</p>
                  <p className="font-semibold text-ink">{profile.yearsExperience} años</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal agregar servicio */}
      {showAddService && (
        <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-sm">
            <h3 className="font-bold text-ink mb-4">Agregar servicio</h3>
            <div className="space-y-3">
              <div>
                <label className="label">Tipo de servicio *</label>
                <select value={newService.categoryId} onChange={e => setNewService(s => ({ ...s, categoryId: e.target.value }))} className="input">
                  <option value="">Seleccionar...</option>
                  {categories.filter(c => !profile.workerServices?.find(ws => ws.category.id === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Precio (COP) <span className="text-ink/60 font-normal">opcional</span></label>
                <input value={newService.customPrice} onChange={e => setNewService(s => ({ ...s, customPrice: e.target.value }))} type="number" placeholder="Ej: 80000" className="input" />
              </div>
              <div>
                <label className="label">Descripción <span className="text-ink/60 font-normal">opcional</span></label>
                <input value={newService.description} onChange={e => setNewService(s => ({ ...s, description: e.target.value }))} placeholder="Ej: Instalaciones residenciales" className="input" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowAddService(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={addService} className="btn-primary flex-1">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
