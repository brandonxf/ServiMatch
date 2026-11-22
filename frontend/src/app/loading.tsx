import { Spinner } from '@/components/ui/Spinner';
export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <Spinner size={40} />
      <p className="font-mono text-xs font-bold uppercase tracking-[0.18em]">Cargando…</p>
    </div>
  );
}
