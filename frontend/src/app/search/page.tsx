'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, MapPin, SlidersHorizontal, Loader2 } from 'lucide-react';
import { workersApi } from '@/lib/api/workers';
import type { WorkerProfile, ServiceCategory } from '@/types';
import { WorkerCard } from '@/components/cards/WorkerCard';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

function SearchContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [workers, setWorkers] = useState<WorkerProfile[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState(false);

  const [filters, setFilters] = useState({
    category: params.get('category') ?? '',
    radius: 10,
    minRating: 0,
    maxPrice: 0,
  });

  // Obtener ubicación del usuario
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => setUserLocation({ lat: coords.latitude, lng: coords.longitude }),
        () => {
          setLocationError(true);
          // Default: Bogotá
          setUserLocation({ lat: 4.710989, lng: -74.072092 });
        },
        { timeout: 5000 },
      );
    } else {
      setUserLocation({ lat: 4.710989, lng: -74.072092 });
    }
  }, []);

  useEffect(() => {
    workersApi.getCategories().then(({ data }) => setCategories(data as any)).catch(() => {});
  }, []);

  const search = useCallback(async () => {
    if (!userLocation) return;
    setLoading(true);
    try {
      const { data } = await workersApi.search({
        lat: userLocation.lat,
        lng: userLocation.lng,
        radius: filters.radius,
        category: filters.category || undefined,
        minRating: filters.minRating || undefined,
        maxPrice: filters.maxPrice || undefined,
      });
      setWorkers(data.data);
      setTotal(data.meta.total);
    } catch {
      setWorkers([]);
    } finally {
      setLoading(false);
    }
  }, [userLocation, filters]);

  useEffect(() => { if (userLocation) search(); }, [userLocation, search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-1">Buscar profesionales</h1>
        {locationError
          ? <p className="text-sm text-amber-600 flex items-center gap-1"><MapPin size={14} />Usando ubicación de Bogotá (activa GPS para resultados exactos)</p>
          : <p className="text-sm text-gray-500 flex items-center gap-1"><MapPin size={14} />Resultados cerca de tu ubicación</p>
        }
      </div>

      {/* Filtros */}
      <div className="card p-4 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="label text-xs">Tipo de servicio</label>
            <select
              value={filters.category}
              onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
              className="input text-sm py-2"
            >
              <option value="">Todos los servicios</option>
              {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
            </select>
          </div>
          <div className="w-32">
            <label className="label text-xs">Radio (km)</label>
            <select
              value={filters.radius}
              onChange={e => setFilters(f => ({ ...f, radius: Number(e.target.value) }))}
              className="input text-sm py-2"
            >
              {[5, 10, 20, 30, 50].map(r => <option key={r} value={r}>{r} km</option>)}
            </select>
          </div>
          <div className="w-36">
            <label className="label text-xs">Rating mínimo</label>
            <select
              value={filters.minRating}
              onChange={e => setFilters(f => ({ ...f, minRating: Number(e.target.value) }))}
              className="input text-sm py-2"
            >
              <option value={0}>Cualquiera</option>
              {[3, 3.5, 4, 4.5].map(r => <option key={r} value={r}>★ {r}+</option>)}
            </select>
          </div>
          <button onClick={search} disabled={loading} className="btn-primary py-2 px-4 text-sm">
            {loading ? <Spinner size={16} /> : <Search size={16} />}
            Buscar
          </button>
        </div>
      </div>

      {/* Resultados */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Spinner size={32} className="mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Buscando profesionales...</p>
          </div>
        </div>
      ) : workers.length === 0 ? (
        <EmptyState
          icon={<Search size={28} />}
          title="No hay resultados"
          description="Intenta aumentar el radio de búsqueda o cambiar el tipo de servicio."
        />
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">
            <span className="font-semibold text-gray-800">{total}</span> profesionales encontrados
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workers.map(w => <WorkerCard key={w.id} worker={w} />)}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return <Suspense><SearchContent /></Suspense>;
}
