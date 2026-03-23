import Link from 'next/link';
import { Search, Star, Shield, Zap, Wrench, Zap as Lightning, Droplets, Paintbrush } from 'lucide-react';

const categories = [
  { name: 'Plomería', slug: 'plomeria', icon: <Droplets size={24} />, color: 'bg-blue-100 text-blue-700' },
  { name: 'Electricidad', slug: 'electricidad', icon: <Lightning size={24} />, color: 'bg-yellow-100 text-yellow-700' },
  { name: 'Soldadura', slug: 'soldadura', icon: <Wrench size={24} />, color: 'bg-orange-100 text-orange-700' },
  { name: 'Pintura', slug: 'pintura', icon: <Paintbrush size={24} />, color: 'bg-purple-100 text-purple-700' },
];

const features = [
  { icon: <Search size={22} />, title: 'Búsqueda por ubicación', desc: 'Encuentra profesionales cerca de ti en segundos usando tu GPS.' },
  { icon: <Star size={22} />, title: 'Calificaciones reales', desc: 'Todos los trabajadores tienen reseñas verificadas de clientes anteriores.' },
  { icon: <Shield size={22} />, title: 'Trabajadores verificados', desc: 'Validamos identidad y certificaciones para tu tranquilidad.' },
  { icon: <Zap size={22} />, title: 'Contacto instantáneo', desc: 'Chat en tiempo real para coordinar detalles directamente.' },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap size={14} /> La plataforma de servicios más confiable
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
            Encuentra el profesional<br />
            <span className="text-blue-200">que necesitas hoy</span>
          </h1>
          <p className="text-lg text-blue-100 mb-10 max-w-2xl mx-auto">
            Conectamos clientes con plomeros, electricistas, soldadores y más. 
            Calificados, verificados y cerca de ti.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/search" className="bg-white text-blue-700 hover:bg-blue-50 font-bold px-8 py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg">
              <Search size={18} /> Buscar servicios
            </Link>
            <Link href="/auth/register?role=WORKER" className="bg-white/10 hover:bg-white/20 backdrop-blur text-white font-bold px-8 py-3.5 rounded-xl border border-white/30 transition-all flex items-center justify-center gap-2">
              <Wrench size={18} /> Soy trabajador
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-14 max-w-md mx-auto">
            {[['500+', 'Trabajadores'], ['2,000+', 'Servicios/mes'], ['4.8★', 'Calificación']].map(([val, label]) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-white">{val}</p>
                <p className="text-xs text-blue-200 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías populares */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h2 className="section-title text-center mb-2">Servicios más solicitados</h2>
        <p className="text-gray-500 text-center mb-8">Profesionales disponibles ahora mismo</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map(cat => (
            <Link key={cat.slug} href={`/search?category=${cat.slug}`}
              className="card p-5 flex flex-col items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer text-center">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color}`}>
                {cat.icon}
              </div>
              <span className="font-semibold text-gray-800 text-sm">{cat.name}</span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-6">
          <Link href="/search" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
            Ver todos los servicios →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="section-title text-center mb-2">¿Por qué elegir ServiMatch?</h2>
          <p className="text-gray-500 text-center mb-10">Diseñado para conectar de forma rápida y segura</p>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map(f => (
              <div key={f.title} className="card p-6 flex gap-4">
                <div className="w-11 h-11 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  {f.icon}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="section-title mb-3">¿Eres trabajador independiente?</h2>
          <p className="text-gray-500 mb-8">Regístrate gratis, crea tu perfil y empieza a recibir clientes hoy mismo.</p>
          <Link href="/auth/register?role=WORKER" className="btn-primary inline-flex px-8 py-3.5 text-base">
            <Wrench size={18} /> Crear mi perfil profesional
          </Link>
        </div>
      </section>
    </div>
  );
}
