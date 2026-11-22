'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import {
  Search, Star, Shield, ShieldCheck, Zap, Wrench,
  Droplets, Paintbrush, BadgeCheck, Clock,
  CheckCircle2, MapPin, ArrowRight, ArrowUpRight, Hammer,
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
  { name: 'Carpintería', slug: 'carpinteria', icon: Hammer },
  { name: 'Cerrajería', slug: 'cerrajeria', icon: Shield },
];

const stats = [
  { id: '1', value: '500+', label: 'Profesionales verificados' },
  { id: '2', value: '2,300+', label: 'Solicitudes completadas' },
  { id: '3', value: '4.8/5', label: 'Calificación promedio' },
  { id: '4', value: '<15 min', label: 'Tiempo de respuesta' },
];

const steps = [
  { id: '01', title: 'Busca y compara', desc: 'Describe lo que necesitas y revisa perfiles verificados cerca de ti, con tarifas y disponibilidad claras.' },
  { id: '02', title: 'Contacta directo', desc: 'Chatea con el profesional, resuelve dudas y acuerda los detalles antes de contratar.' },
  { id: '03', title: 'Contrata y califica', desc: 'Sigue tu solicitud en tiempo real y deja tu calificación al finalizar el trabajo.' },
];

const features = [
  { id: '1', title: 'Identidad verificada', desc: 'Validamos cédula y experiencia de cada profesional antes de publicar su perfil.', icon: ShieldCheck },
  { id: '2', title: 'Cerca de ti', desc: 'Encuentra profesionales disponibles según tu ubicación, en tiempo real.', icon: MapPin },
  { id: '3', title: 'Respuesta rápida', desc: 'La mayoría de los profesionales responde en minutos.', icon: Clock },
  { id: '4', title: 'Calificaciones reales', desc: 'Reseñas verificadas de clientes que ya contrataron el servicio.', icon: Star },
];

const testimonials = [
  { id: '1', name: 'María Fernández', role: 'Cliente · Bogotá', initials: 'MF', quote: 'Encontré un electricista verificado en menos de 10 minutos. Todo el proceso se sintió seguro, desde el chat hasta el pago.' },
  { id: '2', name: 'Jorge Ramírez', role: 'Cliente · Medellín', initials: 'JR', quote: 'Me gustó ver las calificaciones reales de otros clientes antes de contratar. El plomero llegó puntual y con buena actitud.' },
  { id: '3', name: 'Carlos Mendoza', role: 'Profesional · Plomero', initials: 'CM', quote: 'Desde que publiqué mi perfil verificado recibo solicitudes constantes. La plataforma me da visibilidad y confianza.' },
];

// ── STYLE TOKENS ─────────────────────────────

const focusRing =
  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-blue-600';

const btnBase =
  `inline-flex min-h-12 items-center justify-center gap-2 border-2 border-ink px-6 py-3 font-display text-sm font-bold uppercase tracking-wide shadow-brutal-sm transition-[transform,box-shadow] duration-100 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none motion-reduce:transition-none ${focusRing}`;

const eyebrow = 'font-mono text-xs font-bold uppercase tracking-[0.18em]';

// ── COMPONENT ───────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (location.trim()) params.set('location', location.trim());
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-paper font-sans text-ink">
      {/* ───────────────── HERO ───────────────── */}
      <section
        aria-labelledby="hero-title"
        className="border-b-2 border-ink"
        style={{
          backgroundImage:
            'linear-gradient(#0a0a0a12 1px, transparent 1px), linear-gradient(90deg, #0a0a0a12 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.25fr_1fr] lg:px-8">
          <div>
            <p className={`${eyebrow} mb-6 inline-block border-2 border-ink bg-signal px-3 py-1.5`}>
              Profesionales verificados · Colombia
            </p>

            <h1
              id="hero-title"
              className="font-display text-[clamp(2.5rem,1rem+7vw,6rem)] font-bold uppercase leading-[0.95] tracking-tight text-balance"
            >
              El profesional que necesitas,{' '}
              <span className="inline-block bg-ink px-2 text-signal">sin adivinar.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink/80 text-pretty">
              Plomeros, electricistas, soldadores y más. Identidad verificada, calificaciones reales y respuesta en minutos.
            </p>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              role="search"
              aria-label="Buscar profesionales"
              className="mt-10 border-2 border-ink bg-white shadow-brutal"
            >
              <div className="grid sm:grid-cols-2">
                <div className="border-b-2 border-ink p-4 sm:border-b-0 sm:border-r-2">
                  <label htmlFor="q" className={`${eyebrow} mb-1 flex items-center gap-2`}>
                    <Search size={14} aria-hidden="true" /> ¿Qué necesitas?
                  </label>
                  <input
                    id="q"
                    type="text"
                    enterKeyHint="search"
                    placeholder="Ej: plomero, electricista…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={`min-h-11 w-full bg-transparent text-base font-medium placeholder:text-ink/50 ${focusRing}`}
                  />
                </div>
                <div className="p-4">
                  <label htmlFor="location" className={`${eyebrow} mb-1 flex items-center gap-2`}>
                    <MapPin size={14} aria-hidden="true" /> ¿Dónde?
                  </label>
                  <input
                    id="location"
                    type="text"
                    autoComplete="address-level2"
                    enterKeyHint="search"
                    placeholder="Ej: Bogotá, Medellín…"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className={`min-h-11 w-full bg-transparent text-base font-medium placeholder:text-ink/50 ${focusRing}`}
                  />
                </div>
              </div>
              <button
                type="submit"
                className={`flex min-h-14 w-full items-center justify-center gap-2 border-t-2 border-ink bg-blue-600 px-6 py-4 font-display text-base font-bold uppercase tracking-wide text-white transition-colors hover:bg-ink ${focusRing}`}
              >
                Buscar profesionales <ArrowRight size={18} aria-hidden="true" />
              </button>
            </form>

            {/* Quick categories */}
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className={`${eyebrow} mr-1`}>Populares:</span>
              {categories.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={`/search?category=${c.slug}`}
                  className={`inline-flex min-h-11 items-center border-2 border-ink bg-white px-3 text-sm font-semibold transition-colors hover:bg-signal ${focusRing}`}
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Sample profiles */}
          <div className="hidden lg:block" aria-label="Ejemplo de perfiles">
            <p className={`${eyebrow} mb-3 flex items-center justify-between`}>
              <span>Así se ven los perfiles</span>
              <span className="text-ink/60">Ejemplo</span>
            </p>
            <ul className="space-y-4">
              {workers.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center gap-4 border-2 border-ink bg-white p-4 shadow-brutal-sm"
                >
                  <div
                    aria-hidden="true"
                    className="flex size-12 shrink-0 items-center justify-center border-2 border-ink bg-signal font-display text-base font-bold"
                  >
                    {w.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1.5 font-display text-base font-bold">
                      <span className="truncate">{w.name}</span>
                      <BadgeCheck size={16} className="shrink-0 text-blue-600" aria-label="Verificado" />
                    </p>
                    <p className="text-sm text-ink/70">{w.trade}</p>
                    <p className="mt-1 font-mono text-[11px] font-bold uppercase tracking-wider text-ink/60">
                      Disponible hoy · ~10 min
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-base font-bold">{w.rate}<span className="text-xs font-medium text-ink/60">/hr</span></p>
                    <p className="flex items-center justify-end gap-1 text-sm font-semibold">
                      <Star size={12} className="fill-ink text-ink" aria-hidden="true" />
                      {w.rating}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ───────────────── STATS ───────────────── */}
      <section aria-label="ServiMatch en cifras" className="border-b-2 border-ink bg-signal">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <div
              key={s.id}
              className={`border-ink px-4 py-8 sm:px-6 lg:px-8 ${i % 2 === 0 ? 'border-r-2' : ''} ${i < 2 ? 'border-b-2 lg:border-b-0' : ''} ${i === 1 ? 'lg:border-r-2' : ''} ${i === 2 ? 'lg:border-r-2' : ''}`}
            >
              <dd className="font-display text-[clamp(2rem,1rem+3vw,3.5rem)] font-bold leading-none">{s.value}</dd>
              <dt className={`${eyebrow} mt-2`}>{s.label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* ───────────────── CATEGORIES ───────────────── */}
      <section aria-labelledby="cat-title" className="border-b-2 border-ink py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className={`${eyebrow} mb-3`}>01 / Servicios</p>
          <h2 id="cat-title" className="max-w-3xl font-display text-[clamp(2rem,1rem+4vw,3.75rem)] font-bold uppercase leading-none tracking-tight text-balance">
            ¿Qué necesitas arreglar hoy?
          </h2>

          <ul className="mt-12 grid grid-cols-2 border-l-2 border-t-2 border-ink md:grid-cols-3">
            {categories.map((cat, i) => (
              <li key={cat.slug} className="border-b-2 border-r-2 border-ink">
                <Link
                  href={`/search?category=${cat.slug}`}
                  className={`group flex h-full min-h-44 flex-col justify-between bg-white p-5 transition-colors hover:bg-ink hover:text-signal motion-reduce:transition-none ${focusRing} focus-visible:-outline-offset-4`}
                >
                  <div className="flex items-start justify-between">
                    <span className="font-mono text-xs font-bold">{String(i + 1).padStart(2, '0')}</span>
                    <ArrowUpRight size={22} aria-hidden="true" className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1 motion-reduce:transform-none" />
                  </div>
                  <div>
                    <cat.icon size={32} aria-hidden="true" strokeWidth={2.25} className="mb-3" />
                    <span className="font-display text-xl font-bold uppercase sm:text-2xl">{cat.name}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────── CÓMO FUNCIONA ───────────────── */}
      <section aria-labelledby="steps-title" className="border-b-2 border-ink bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className={`${eyebrow} mb-3`}>02 / Proceso</p>
          <h2 id="steps-title" className="max-w-3xl font-display text-[clamp(2rem,1rem+4vw,3.75rem)] font-bold uppercase leading-none tracking-tight text-balance">
            Tres pasos. Cero fricción.
          </h2>

          <ol className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((s) => (
              <li key={s.id} className="border-2 border-ink bg-paper p-6 shadow-brutal">
                <span className="font-display text-7xl font-bold leading-none text-signal [-webkit-text-stroke:2px_#0a0a0a]" aria-hidden="true">
                  {s.id}
                </span>
                <h3 className="mt-4 font-display text-2xl font-bold uppercase">{s.title}</h3>
                <p className="mt-3 leading-relaxed text-ink/80 text-pretty">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────────────── CONFIANZA ───────────────── */}
      <section aria-labelledby="trust-title" className="border-b-2 border-ink bg-ink py-20 text-paper">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className={`${eyebrow} mb-3 text-signal`}>03 / Confianza</p>
          <h2 id="trust-title" className="max-w-3xl font-display text-[clamp(2rem,1rem+4vw,3.75rem)] font-bold uppercase leading-none tracking-tight text-balance">
            Verificados. Medibles. Confiables.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-paper/75">
            Cada perfil pasa por un proceso de validación antes de estar disponible.
          </p>

          <ul className="mt-12 grid border-l-2 border-t-2 border-paper/60 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f) => (
              <li key={f.id} className="border-b-2 border-r-2 border-paper/60 p-6">
                <f.icon size={28} aria-hidden="true" className="mb-5 text-signal" />
                <h3 className="font-display text-xl font-bold uppercase">{f.title}</h3>
                <p className="mt-2 leading-relaxed text-paper/75">{f.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────── TESTIMONIOS ───────────────── */}
      <section aria-labelledby="reviews-title" className="border-b-2 border-ink py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className={`${eyebrow} mb-3`}>04 / Opiniones</p>
          <h2 id="reviews-title" className="max-w-3xl font-display text-[clamp(2rem,1rem+4vw,3.75rem)] font-bold uppercase leading-none tracking-tight text-balance">
            Lo dicen quienes ya lo usaron.
          </h2>

          <ul className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <li key={t.id}>
                <figure className="flex h-full flex-col border-2 border-ink bg-white p-6 shadow-brutal">
                  <p className="flex items-center gap-1" role="img" aria-label="5 de 5 estrellas">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={18} aria-hidden="true" className="fill-signal text-ink" strokeWidth={2} />
                    ))}
                  </p>
                  <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-pretty">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t-2 border-ink pt-4">
                    <span
                      aria-hidden="true"
                      className="flex size-10 items-center justify-center border-2 border-ink bg-signal font-display text-sm font-bold"
                    >
                      {t.initials}
                    </span>
                    <span>
                      <span className="block font-display font-bold">{t.name}</span>
                      <span className="block font-mono text-xs font-bold uppercase tracking-wider text-ink/65">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────────────── CTA ───────────────── */}
      <section aria-labelledby="cta-title" className="bg-signal py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.4fr_1fr] lg:items-center lg:px-8">
          <div>
            <p className={`${eyebrow} mb-3`}>¿Trabajas por tu cuenta?</p>
            <h2 id="cta-title" className="font-display text-[clamp(2.25rem,1rem+5vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-balance">
              Consigue clientes sin pagar por publicar.
            </h2>
            <ul className="mt-6 space-y-2">
              {['Sin costo de publicación', 'Pagos protegidos', 'Soporte permanente'].map((item) => (
                <li key={item} className="flex items-center gap-2 font-semibold">
                  <CheckCircle2 size={20} aria-hidden="true" className="shrink-0" /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/auth/register?role=WORKER" className={`${btnBase} bg-ink text-signal hover:bg-ink`}>
              Crear perfil profesional <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/search" className={`${btnBase} bg-white text-ink hover:bg-white`}>
              Quiero contratar
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
