'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  Search, Star, Shield, ShieldCheck, Zap, Wrench,
  Droplets, Paintbrush, BadgeCheck, Clock,
  CheckCircle2, MapPin, ArrowRight
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

const stats = [
  { id: '1', value: '500+', label: 'Profesionales verificados' },
  { id: '2', value: '2,300+', label: 'Solicitudes completadas' },
  { id: '3', value: '4.8/5', label: 'Calificación promedio' },
  { id: '4', value: '< 15 min', label: 'Tiempo de respuesta' },
];

const steps = [
  { id: '1', title: 'Busca y compara', desc: 'Describe lo que necesitas y revisa perfiles verificados cerca de ti, con tarifas y disponibilidad claras.' },
  { id: '2', title: 'Contacta con confianza', desc: 'Chatea directamente con el profesional, resuelve dudas y acuerda los detalles antes de contratar.' },
  { id: '3', title: 'Contrata y califica', desc: 'Da seguimiento a tu solicitud en tiempo real y deja una calificación al finalizar el trabajo.' },
];

const features = [
  { id: '1', title: 'Identidad verificada', desc: 'Validamos cédula y experiencia de cada profesional antes de publicar su perfil.', icon: ShieldCheck },
  { id: '2', title: 'Cerca de ti', desc: 'Encuentra profesionales disponibles según tu ubicación, en tiempo real.', icon: MapPin },
  { id: '3', title: 'Respuesta rápida', desc: 'La mayoría de los profesionales responde en minutos.', icon: Clock },
  { id: '4', title: 'Calificaciones reales', desc: 'Reseñas verificadas de clientes que ya contrataron el servicio.', icon: Star },
];

const testimonials = [
  { id: '1', name: 'María Fernández', role: 'Cliente · Bogotá', initials: 'MF', rating: 5, quote: 'Encontré un electricista verificado en menos de 10 minutos. Todo el proceso se sintió seguro, desde el chat hasta el pago.' },
  { id: '2', name: 'Jorge Ramírez', role: 'Cliente · Medellín', initials: 'JR', rating: 5, quote: 'Me gustó poder ver las calificaciones reales de otros clientes antes de contratar. El plomero llegó puntual y con buena actitud.' },
  { id: '3', name: 'Carlos Mendoza', role: 'Profesional · Plomero', initials: 'CM', rating: 5, quote: 'Desde que publiqué mi perfil verificado he recibido solicitudes constantes. La plataforma me da visibilidad y confianza frente a los clientes.' },
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
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }}
        />

        {/* Subtle brand glow */}
        <div className="absolute top-[-15%] right-[-5%] w-[700px] h-[700px] bg-blue-600 opacity-20 blur-[160px] rounded-full pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-4 w-full grid md:grid-cols-[55%_45%] gap-10 items-center">

          {/* LEFT */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] rounded-full px-4 py-1.5 mb-6">
              <ShieldCheck size={14} className="text-blue-400" />
              <span className="text-xs font-medium text-white/70">Profesionales verificados por ServiMatch</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
              Encuentra el profesional<br />
              <span className="text-white/70">que necesitas, con confianza</span>
            </h1>

            <p className="text-white/50 text-base mb-8 max-w-md">
              Conectamos clientes con profesionales con identidad verificada, calificaciones reales y respuesta rápida.
            </p>

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
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition active:scale-95"
              >
                Buscar
              </button>
            </div>

            {/* TRUST ROW */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-6">
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <ShieldCheck size={14} className="text-blue-400" /> Identidad verificada
              </div>
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <Star size={14} className="text-yellow-400 fill-yellow-400" /> 4.8/5 calificación promedio
              </div>
              <div className="flex items-center gap-1.5 text-white/50 text-xs">
                <Clock size={14} className="text-blue-400" /> Respuesta en minutos
              </div>
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

      {/* ───────────────── STATS ───────────────── */}
      <section className="bg-white border-b border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s) => (
            <div key={s.id} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-[#0f172a]">{s.value}</p>
              <p className="text-xs md:text-sm text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
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
              className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-blue-600 hover:shadow-lg transition"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <cat.icon size={18} className="text-blue-600" />
              </div>
              <span className="text-xs text-[#0f172a]">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────────── CÓMO FUNCIONA ───────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3 text-[#0f172a]">Así de simple</h2>
            <p className="text-gray-500">Tres pasos, sin fricción, con respaldo en cada uno</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((s) => (
              <div key={s.id} className="text-center md:text-left">
                <div className="w-10 h-10 bg-[#0f172a] text-white rounded-full flex items-center justify-center font-bold mb-4 mx-auto md:mx-0">
                  {s.id}
                </div>
                <h3 className="font-semibold text-[#0f172a] mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CONFIANZA ───────────────── */}
      <section className="py-24 bg-[#0f172a]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3">
              Profesionales verificados, resultados confiables
            </h2>
            <p className="text-white/50">
              Cada perfil pasa por un proceso de validación antes de estar disponible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.id} className="bg-white/[0.04] border border-white/[0.08] rounded-2xl p-6 hover:border-blue-400/40 transition">
                <div className="w-10 h-10 bg-blue-600/15 rounded-lg flex items-center justify-center mb-4">
                  <f.icon size={18} className="text-blue-400" />
                </div>
                <p className="text-sm font-semibold mb-2 text-white">{f.title}</p>
                <p className="text-sm text-white/50 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── TESTIMONIOS ───────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-3 text-[#0f172a]">Lo que dicen quienes ya confiaron en ServiMatch</h2>
            <p className="text-gray-500">Clientes y profesionales que usan la plataforma a diario</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.id} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6 flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                  <div className="w-9 h-9 bg-[#0f172a] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#0f172a]">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────── CTA ───────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-[#0f172a] rounded-3xl p-10 md:p-12 grid md:grid-cols-[1fr_auto] gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4 text-white">
                ¿Eres trabajador independiente?
              </h2>

              <p className="text-white/60 mb-6 max-w-md">
                Crea tu perfil verificado, publica tus servicios y empieza a recibir clientes con confianza.
              </p>

              <ul className="space-y-2">
                {['Sin costo de publicación', 'Pagos protegidos', 'Soporte permanente'].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                    <CheckCircle2 size={15} className="text-blue-400 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <Link
              href="/auth/register?role=WORKER"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition inline-flex items-center justify-center gap-2 whitespace-nowrap"
            >
              Crear perfil <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
