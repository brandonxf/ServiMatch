import Link from 'next/link';
import { SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
        <SearchX size={36} className="text-blue-400" />
      </div>
      <h1 className="text-5xl font-extrabold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-bold text-gray-700 mb-3">Página no encontrada</h2>
      <p className="text-gray-500 max-w-sm mb-8">
        La página que buscas no existe o fue movida.
      </p>
      <Link href="/" className="btn-primary inline-flex px-8 py-3">
        Volver al inicio
      </Link>
    </div>
  );
}
