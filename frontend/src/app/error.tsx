'use client';
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <AlertCircle size={28} className="text-red-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Algo salió mal</h2>
      <p className="text-gray-500 mb-6 text-sm">{error.message}</p>
      <button onClick={reset} className="btn-primary px-6 py-2.5">Intentar de nuevo</button>
    </div>
  );
}
