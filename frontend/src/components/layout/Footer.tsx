import Link from 'next/link';
import { Wrench } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid sm:grid-cols-3 gap-8 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                <Wrench size={14} color="white" />
              </div>
              <span className="font-bold text-gray-900">ServiMatch</span>
            </div>
            <p className="text-xs text-gray-500 leading-relaxed">
              Conectamos clientes con los mejores profesionales independientes de servicios.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm mb-3">Plataforma</p>
            <div className="space-y-2">
              {[['/', 'Inicio'], ['/search', 'Buscar servicios'], ['/auth/register', 'Registrarse'], ['/auth/login', 'Ingresar']].map(([href, label]) => (
                <Link key={href} href={href} className="block text-xs text-gray-500 hover:text-blue-600 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm mb-3">Trabajadores</p>
            <div className="space-y-2">
              {[['/auth/register?role=WORKER', 'Crear perfil gratis'], ['/dashboard/worker', 'Gestionar servicios'], ['/dashboard/requests', 'Mis solicitudes']].map(([href, label]) => (
                <Link key={href} href={href} className="block text-xs text-gray-500 hover:text-blue-600 transition-colors">{label}</Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} ServiMatch. Todos los derechos reservados.</p>
          <p className="text-xs text-gray-400">Hecho con ♥ en Colombia</p>
        </div>
      </div>
    </footer>
  );
}
