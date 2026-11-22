import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-[clamp(6rem,3rem+15vw,12rem)] font-bold leading-none text-signal [-webkit-text-stroke:3px_#0a0a0a]" aria-hidden="true">
        404
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight">Página no encontrada</h1>
      <p className="mt-3 max-w-sm text-ink/70">La página que buscas no existe o fue movida.</p>
      <Link href="/" className="btn-primary mt-8 inline-flex px-8">Volver al inicio</Link>
    </div>
  );
}
