'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MapPin, Star, Briefcase, Phone, MessageSquare, Calendar, CheckCircle, ArrowLeft } from 'lucide-react';
import { workersApi } from '@/lib/api/workers';
import { requestsApi } from '@/lib/api/requests';
import type { WorkerProfile, Review, ServiceCategory } from '@/types';
import { useAuthStore } from '@/lib/store/auth.store';
import { Avatar } from '@/components/ui/Avatar';
import { StarRating } from '@/components/ui/StarRating';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { formatPrice, priceUnitLabel } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function WorkerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const [worker, setWorker] = useState<WorkerProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', categoryId: '', address: '', budget: '' });

  useEffect(() => {
    Promise.all([
      workersApi.getById(id),
      workersApi.getReviews(id),
      workersApi.getCategories(),
    ]).then(([w, r, c]) => {
      setWorker(w.data);
      setReviews((r.data as any).data ?? []);
      setCategories((c.data as any) ?? []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleRequest = async () => {
    if (!user) { router.push('/auth/login'); return; }
    if (!form.title || !form.categoryId) { toast.error('Completa el título y el tipo de servicio'); return; }
    try {
      await requestsApi.create({
        workerId: id,
        categoryId: form.categoryId,
        title: form.title,
        description: form.description,
        address: form.address,
        budget: form.budget ? Number(form.budget) : undefined,
      });
      toast.success('¡Solicitud enviada! El trabajador te responderá pronto.');
      setShowRequestForm(false);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al enviar solicitud');
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Spinner size={36} /></div>;
  if (!worker) return <div className="text-center py-32 text-gray-500">Trabajador no encontrado</div>;

  const name = worker.user?.fullName ?? 'Trabajador';
  const services = worker.workerServices ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/search" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft size={15} /> Volver a resultados
      </Link>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="card p-5">
            <div className="text-center">
              <div className="relative inline-block mb-3">
                <Avatar src={worker.user?.avatarUrl} name={name} size={80} />
                {worker.isAvailable && (
                  <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                )}
              </div>
              <h1 className="font-extrabold text-gray-900 text-lg">{name}</h1>
              {worker.user?.isVerified && (
                <span className="text-xs text-blue-600 font-semibold flex items-center justify-center gap-1 mt-0.5">
                  <CheckCircle size={12} /> Verificado
                </span>
              )}
              {worker.city && (
                <p className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-1">
                  <MapPin size={12} /> {worker.city}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-100 text-center">
              <div>
                <p className="font-extrabold text-gray-900">{Number(worker.averageRating).toFixed(1)}</p>
                <p className="text-xs text-gray-400">Rating</p>
              </div>
              <div>
                <p className="font-extrabold text-gray-900">{worker.reviewCount}</p>
                <p className="text-xs text-gray-400">Reseñas</p>
              </div>
              <div>
                <p className="font-extrabold text-gray-900">{worker.jobsCompleted}</p>
                <p className="text-xs text-gray-400">Trabajos</p>
              </div>
            </div>

            {worker.basePrice && (
              <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                <p className="text-2xl font-extrabold text-blue-600">{formatPrice(worker.basePrice)}</p>
                <p className="text-xs text-gray-400">{priceUnitLabel(worker.priceUnit)}</p>
              </div>
            )}

            <div className="mt-4 space-y-2">
              <button onClick={() => { if (!user) { router.push('/auth/login'); return; } setShowRequestForm(true); }}
                className="btn-primary w-full">
                <Calendar size={16} /> Solicitar servicio
              </button>
              {worker.user?.phone && (
                <a href={`https://wa.me/${worker.user.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary w-full text-green-700 border-green-200 hover:bg-green-50">
                  <MessageSquare size={16} /> WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Servicios */}
          {services.length > 0 && (
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">Servicios</h3>
              <div className="space-y-2">
                {services.map(s => (
                  <div key={s.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{s.category.name}</span>
                    {s.customPrice && <span className="text-sm font-semibold text-blue-600">{formatPrice(s.customPrice)}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main */}
        <div className="md:col-span-2 space-y-6">
          {worker.bio && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-900 mb-2">Sobre mí</h2>
              <p className="text-gray-600 text-sm leading-relaxed">{worker.bio}</p>
              {worker.yearsExperience && (
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-1.5">
                  <Briefcase size={14} /> {worker.yearsExperience} años de experiencia
                </p>
              )}
            </div>
          )}

          {/* Reseñas */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-900 mb-4">Reseñas ({reviews.length})</h2>
            {reviews.length === 0 ? (
              <p className="text-gray-400 text-sm">Sin reseñas aún</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r: any) => (
                  <div key={r.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Avatar src={r.reviewer?.avatarUrl} name={r.reviewer?.fullName ?? 'Usuario'} size={28} />
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{r.reviewer?.fullName}</p>
                        <StarRating rating={r.rating} size={12} />
                      </div>
                    </div>
                    {r.comment && <p className="text-sm text-gray-600 mt-1">{r.comment}</p>}
                    {r.workerReply && (
                      <div className="mt-2 ml-4 pl-3 border-l-2 border-blue-200 text-xs text-gray-500">
                        <span className="font-semibold">Respuesta:</span> {r.workerReply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de solicitud */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="card p-6 w-full max-w-md">
            <h3 className="font-extrabold text-gray-900 text-lg mb-4">Solicitar servicio a {name.split(' ')[0]}</h3>
            <div className="space-y-3">
              <div>
                <label className="label">¿Qué necesitas? *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ej: Reparar tubería en cocina" className="input" />
              </div>
              <div>
                <label className="label">Tipo de servicio *</label>
                <select value={form.categoryId} onChange={e => setForm(f => ({ ...f, categoryId: e.target.value }))} className="input">
                  <option value="">Seleccionar...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Descripción</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe el problema con más detalle..." className="input" rows={3} />
              </div>
              <div>
                <label className="label">Dirección</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Dirección del trabajo" className="input" />
              </div>
              <div>
                <label className="label">Presupuesto (COP)</label>
                <input value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))} type="number" placeholder="Ej: 150000" className="input" />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowRequestForm(false)} className="btn-secondary flex-1">Cancelar</button>
              <button onClick={handleRequest} className="btn-primary flex-1">Enviar solicitud</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
