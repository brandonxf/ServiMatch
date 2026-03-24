import Link from 'next/link';
import { Wrench } from 'lucide-react';

export function Footer() {
  return (
    <footer className="py-12 bg-[#0f172a] text-white">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-10">

        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Wrench size={16} color="white" />
            </div>
            <span className="font-bold text-lg">ServiMatch</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed">
            Conectando clientes con profesionales en tiempo real.
          </p>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Plataforma</h4>
          <ul className="text-sm text-white/50 space-y-2">
            <li><Link href="/search" className="hover:text-blue-400 transition-colors">Buscar servicios</Link></li>
            <li><Link href="/" className="hover:text-blue-400 transition-colors">Inicio</Link></li>
            <li><Link href="/auth/register" className="hover:text-blue-400 transition-colors">Registro</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold mb-3">Legal</h4>
          <ul className="text-sm text-white/50 space-y-2">
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Privacidad</Link></li>
            <li><Link href="#" className="hover:text-blue-400 transition-colors">Términos</Link></li>
          </ul>
        </div>

      </div>
      <div className="max-w-6xl mx-auto px-4 mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-white/40">© {new Date().getFullYear()} ServiMatch. Todos los derechos reservados.</p>
        <p className="text-sm text-white/40">Hecho con ♥ en Colombia</p>
      </div>
    </footer>
  );
}
