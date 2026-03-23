'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, MapPin, Wrench, User, DollarSign } from 'lucide-react';
import { workersApi } from '@/lib/api/workers';
import type { ServiceCategory } from '@/types';
import { useAuthStore } from '@/lib/store/auth.store';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';

const STEPS = ['Sobre ti', 'Servicios', 'Zona y precio', 'Confirmar'];

export default function WorkerSetupPage() {
  const { user, fetchMe } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: '',
    yearsExperience: '',
    selectedCategories: [] as string[],
    city: '',
    coverageRadiusKm: '10',
    basePrice: '',
    priceUnit: 'HOUR' as 'HOUR' | 'SERVICE' | 'DAY',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) { router.push('/auth/login'); return; }
    workersApi.getCategories().then(({ data }) => setCategories(data as any)).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(({ coords }) => {
        setForm(f => ({ ...f, latitude: String(coords.latitude), longitude: String(coords.longitude) }));
      }, () => {});
    }
  }, []);

  const toggleCategory = (id: string) => {
    setForm(f => ({
      ...f,
      selectedCategories: f.selectedCategories.includes(id)
        ? f.selectedCategories.filter(c => c !== id)
        : [...f.selectedCategories, id],
    }));
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      // 1. Crear perfil base
      await workersApi.createProfile({
        bio: form.bio,
        yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
        city: form.city,
        coverageRadiusKm: Number(form.coverageRadiusKm),
        basePrice: form.basePrice ? Number(form.basePrice) : undefined,
        priceUnit: form.priceUnit,
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined,
      });
      // 2. Agregar servicios seleccionados
      for (const catId of form.selectedCategories) {
        await workersApi.addService({ categoryId: catId });
      }
      await fetchMe();
      toast.success('¡Perfil creado! Ya apareces en las búsquedas.');
      router.push('/dashboard/worker');
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? 'Error al crear perfil');
    } finally { setSaving(false); }
  };

  const canNext = [
    form.bio.length > 10,
    form.selectedCategories.length > 0,
    form.city.length > 2,
    true,
  ][step];

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
          <Wrench size={22} color="white" />
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900">Configura tu perfil profesional</h1>
        <p className="text-gray-500 text-sm mt-1">Solo toma 2 minutos</p>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              i < step ? 'bg-green-500 text-white' : i === step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
            }`}>
              {i < step ? <Check size={13} /> : i + 1}
            </div>
            <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-blue-600' : 'text-gray-400'}`}>{s}</span>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 ${i < step ? 'bg-green-400' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="card p-6">
        {/* Step 0: Sobre ti */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <User size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Cuéntanos sobre ti</h2>
            </div>
            <div>
              <label className="label">Descripción profesional *</label>
              <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                placeholder="Ej: Plomero con 8 años de experiencia en reparaciones residenciales y comerciales..." className="input" rows={4} />
              <p className="text-xs text-gray-400 mt-1">{form.bio.length}/500 caracteres</p>
            </div>
            <div>
              <label className="label">Años de experiencia</label>
              <input value={form.yearsExperience} onChange={e => setForm(f => ({ ...f, yearsExperience: e.target.value }))}
                type="number" min="0" max="50" placeholder="Ej: 8" className="input" />
            </div>
          </div>
        )}

        {/* Step 1: Servicios */}
        {step === 1 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Wrench size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">¿Qué servicios ofreces? *</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(c => (
                <button key={c.id} onClick={() => toggleCategory(c.id)} type="button"
                  className={`p-3 rounded-xl border-2 text-left transition-all text-sm font-medium ${
                    form.selectedCategories.includes(c.id)
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}>
                  {form.selectedCategories.includes(c.id) && <Check size={12} className="inline mr-1" />}
                  {c.name}
                </button>
              ))}
            </div>
            {form.selectedCategories.length === 0 && (
              <p className="text-xs text-red-500 mt-2">Selecciona al menos un servicio</p>
            )}
          </div>
        )}

        {/* Step 2: Zona y precio */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={18} className="text-blue-600" />
              <h2 className="font-bold text-gray-900">Zona de cobertura y precio</h2>
            </div>
            <div>
              <label className="label">Ciudad *</label>
              <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                placeholder="Ej: Bogotá" className="input" />
            </div>
            <div>
              <label className="label">Radio de cobertura</label>
              <select value={form.coverageRadiusKm} onChange={e => setForm(f => ({ ...f, coverageRadiusKm: e.target.value }))} className="input">
                {[5, 10, 15, 20, 30, 50].map(r => <option key={r} value={r}>{r} km desde tu ubicación</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Precio base (COP)</label>
                <input value={form.basePrice} onChange={e => setForm(f => ({ ...f, basePrice: e.target.value }))}
                  type="number" placeholder="Ej: 50000" className="input" />
              </div>
              <div>
                <label className="label">Por</label>
                <select value={form.priceUnit} onChange={e => setForm(f => ({ ...f, priceUnit: e.target.value as any }))} className="input">
                  <option value="HOUR">Hora</option>
                  <option value="SERVICE">Servicio</option>
                  <option value="DAY">Día</option>
                </select>
              </div>
            </div>
            {form.latitude && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <MapPin size={12} /> Ubicación GPS detectada automáticamente
              </p>
            )}
          </div>
        )}

        {/* Step 3: Confirmar */}
        {step === 3 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Check size={18} className="text-green-600" />
              <h2 className="font-bold text-gray-900">Resumen de tu perfil</h2>
            </div>
            <div className="space-y-3 text-sm">
              {[
                { label: 'Descripción', value: form.bio.slice(0, 80) + (form.bio.length > 80 ? '...' : '') },
                { label: 'Servicios', value: categories.filter(c => form.selectedCategories.includes(c.id)).map(c => c.name).join(', ') },
                { label: 'Ciudad', value: form.city },
                { label: 'Cobertura', value: `${form.coverageRadiusKm} km` },
                { label: 'Precio base', value: form.basePrice ? `$${Number(form.basePrice).toLocaleString('es-CO')} / ${form.priceUnit === 'HOUR' ? 'hora' : form.priceUnit === 'DAY' ? 'día' : 'servicio'}` : 'No definido' },
              ].map(item => (
                <div key={item.label} className="flex justify-between gap-4 py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-500 font-medium">{item.label}</span>
                  <span className="text-gray-800 text-right">{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-6">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)} className="btn-secondary flex-1">
            <ChevronLeft size={16} /> Anterior
          </button>
        )}
        {step < STEPS.length - 1 ? (
          <button onClick={() => setStep(s => s + 1)} disabled={!canNext} className="btn-primary flex-1">
            Siguiente <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving} className="btn-primary flex-1">
            {saving ? <><Spinner size={16} /> Creando perfil...</> : <><Check size={16} /> Crear perfil</>}
          </button>
        )}
      </div>
    </div>
  );
}
