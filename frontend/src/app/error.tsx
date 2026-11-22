'use client';
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <div aria-hidden="true" className="mb-6 flex size-20 items-center justify-center border-2 border-ink bg-red-600 text-white shadow-brutal">
        <AlertCircle size={36} />
      </div>
      <h2 className="font-display text-4xl font-bold uppercase tracking-tight">Algo salió mal</h2>
      <p role="alert" className="mt-3 max-w-md border-2 border-ink bg-white px-3 py-2 font-mono text-sm">{error.message}</p>
      <button onClick={reset} className="btn-primary mt-8 px-8">Intentar de nuevo</button>
    </div>
  );
}
