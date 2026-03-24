'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Search, Star, Shield, Zap, Wrench,
  Droplets, Paintbrush, BadgeCheck,
  MapPin, ArrowRight
} from 'lucide-react';

// ── DATA ─────────────────────────────────────

const workers = [
  { id: '1', name: 'Carlos Mendoza', initials: 'CM', trade: 'Plomero · 8 años', rate: '$45k', rating: '4.9' },
  { id: '2', name: 'Andrés Torres', initials: 'AT', trade: 'Electricista certificado', rate: '$55k', rating: '4.8' },
  { id: '3', name: 'Luis Gómez', initials: 'LG', trade: 'Soldador TIG/MIG', rate: '$60k', rating: '5.0' },
];

const categories = [
  { name: 'Plomería', slug: 'plomeria', icon: Droplets },
  { name: 'Electricidad', slug: 'electricidad', icon: Zap },
  { name: 'Soldadura', slug: 'soldadura', icon: Wrench },
  { name: 'Pintura', slug: 'pintura', icon: Paintbrush },
  { name: 'Carpintería', slug: 'carpinteria', icon: Wrench },
  { name: 'Cerrajería', slug: 'cerrajeria', icon: Shield },
];

const features = [
  { id: '1', title: 'Cerca de ti', desc: 'Profesionales disponibles según tu ubicación en tiempo real.', stat: '< 2 km' },
  { id: '2', title: 'Verificados', desc: 'Identidad y experiencia validada antes de publicar.', stat: '100%' },
  { id: '3', title: 'Respuesta rápida', desc: 'La mayoría responde en minutos.', stat: '~15 min' },
  { id: '4', title: 'Calificaciones reales', desc: 'Opiniones verificadas de clientes.', stat: '4.8★' },
];

// ── COMPONENT ───────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (location) params.set('location', location);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-[#0f172a] text-white -mt-16">
      {/* ───────────────── HERO ───────────────── */}
      <section className="min-h-screen bg-[#0f172a] relative overflow-hidden flex items-center pt-16">
        {/* grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />

        {/* blue glow */}
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-blue-600 opacity-[0.08] blur-[120px] rounded-full" />

        <div className="relative max-w-6xl mx-auto px-4 w-full grid md:grid-cols-[55%_45%] gap-10 items-center">

          {/* LEFT */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-8">
              Encuentra el profesional<br />
              <span className="text-white/70">que necesitas hoy</span>
            </h1>

            {/* SEARCH */}
            <div className="flex flex-col sm:flex-row gap-2 bg-white/[0.05] border border-white/[0.1] rounded-2xl p-2">
              <div className="flex items-center gap-2 flex-1 px-4 py-3">
                <Search size={16} className="text-white/40" />
                <input
                  type="text"
                  placeholder="¿Qué servicio necesitas?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm placeholder-white/40"
                />
              </div>

              <div className="flex items-center gap-2 flex-1 px-4 py-3 border-t sm:border-t-0 sm:border-l border-white/10">
                <MapPin size={16} className="text-white/40" />
                <input
                  type="text"
                  placeholder="Tu ubicación"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="bg-transparent outline-none w-full text-sm placeholder-white/40"
                />
              </div>

              <button
                onClick={handleSearch}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6 py-3 rounded-xl transition active:scale-95"
              >
                Buscar
              </button>
            </div>
          </div>

          {/* RIGHT */}
          <div className="hidden md:flex flex-col gap-3">
            {workers.map((w, i) => (
              <div
                key={w.id}
                className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-4 flex items-center gap-4 hover:border-blue-400/40 transition-all"
                style={{ transform: `translateX(${i * 8}px)` }}
              >
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-sm font-semibold">
                  {w.initials}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{w.name}</p>
                    <BadgeCheck size={14} className="text-blue-400" />
                  </div>
                  <p className="text-white/40 text-xs">{w.trade}</p>
                  <p className="text-white/25 text-[11px] mt-1">
                    Disponible hoy · Responde en ~10 min
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-semibold">{w.rate}/hr</p>
                  <div className="flex items-center justify-end gap-1">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    <span className="text-xs text-white/50">{w.rating}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CATEGORIES ───────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center mb-12">
          <h2 className="text-3xl font-bold mb-3 text-[#0f172a]">Servicios disponibles</h2>
          <p className="text-gray-500">Profesionales listos para ayudarte</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-6 max-w-6xl mx-auto px-4">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/search?category=${cat.slug}`}
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-orange-500 hover:shadow-lg transition"
            >
              <div className="w-10 h-10 bg-[#0f172a]/5 rounded-lg flex items-center justify-center">
                <cat.icon size={18} className="text-[#0f172a]" />
              </div>
              <span className="text-xs text-[#0f172a]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────────── FEATURES ───────────────── */}
      <section className="py-24 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">
              Diseñado para funcionar en tiempo real
            </h2>
            <p className="text-white/50">
              Encuentra, compara y contrata sin fricción
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10 text-center">
            {features.map((f) => (
              <div key={f.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:border-blue-400/40 transition">
                <p className="text-3xl font-bold mb-1 text-white">{f.stat}</p>
                <p className="text-sm font-medium mb-3 text-blue-400">{f.title}</p>
                <p className="text-sm text-white/60 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA ───────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[#0f172a] rounded-3xl p-10 text-center">
            <h2 className="text-3xl font-bold mb-4 text-white">
              ¿Eres trabajador independiente?
            </h2>

            <p className="text-white/60 mb-8">
              Crea tu perfil, publica tus servicios y empieza a recibir clientes.
            </p>

            <Link
              href="/auth/register?role=WORKER"
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition inline-flex items-center gap-2"
            >
              Crear perfil <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
