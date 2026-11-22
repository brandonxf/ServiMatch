import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { ReactNode } from 'react';

export const focusRing =
  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-blue-600';

export const inputClass =
  `min-h-12 w-full border-2 border-ink bg-white px-4 py-3 text-base font-medium text-ink placeholder:text-ink/50 aria-[invalid=true]:border-red-700 aria-[invalid=true]:bg-red-50 ${focusRing}`;

export const labelClass = 'mb-1.5 block font-mono text-xs font-bold uppercase tracking-[0.14em]';

export const submitClass =
  `flex min-h-14 w-full items-center justify-center gap-2 border-2 border-ink bg-ink px-6 py-4 font-display text-base font-bold uppercase tracking-wide text-signal shadow-brutal-sm transition-[transform,box-shadow] duration-100 hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-brutal-sm motion-reduce:transition-none ${focusRing} focus-visible:outline-offset-4`;

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-2 inline-block border-2 border-red-700 bg-red-50 px-2 py-1 text-sm font-semibold text-red-800">
      {message}
    </p>
  );
}

interface AuthShellProps {
  title: string;
  subtitle: string;
  points: string[];
  children: ReactNode;
  footer: ReactNode;
}

/** Two-column brutalist auth layout: brand panel + form panel. */
export function AuthShell({ title, subtitle, points, children, footer }: AuthShellProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-paper text-ink">
      <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
        {/* Brand panel */}
        <aside className="flex flex-col justify-between border-b-2 border-ink bg-signal px-6 py-6 sm:px-10 lg:border-b-0 lg:border-r-2 lg:py-10">
          <div className="flex items-center justify-between">
            <Link href="/" className={`font-display text-2xl font-bold uppercase tracking-tight ${focusRing}`}>
              Servi<span className="ml-1 bg-ink px-1.5 text-signal">Match</span>
            </Link>
            <Link
              href="/"
              className={`inline-flex min-h-11 items-center gap-2 border-2 border-ink bg-white px-3 font-display text-sm font-bold uppercase transition-colors hover:bg-ink hover:text-signal ${focusRing}`}
            >
              <ArrowLeft size={16} aria-hidden="true" /> Inicio
            </Link>
          </div>

          <div className="hidden py-12 lg:block">
            <h2 className="font-display text-[clamp(2.5rem,1rem+4vw,4.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-balance">
              {title}
            </h2>
            <ul className="mt-8 space-y-3">
              {points.map((p) => (
                <li key={p} className="flex items-center gap-3 text-lg font-semibold">
                  <CheckCircle2 size={22} aria-hidden="true" className="shrink-0" /> {p}
                </li>
              ))}
            </ul>
          </div>

          <p className="hidden font-mono text-xs font-bold uppercase tracking-[0.18em] lg:block">
            Profesionales verificados · Colombia
          </p>
        </aside>

        {/* Form panel */}
        <main className="flex items-center justify-center px-4 py-10 sm:px-8">
          <div className="w-full max-w-md">
            <h1 className="font-display text-4xl font-bold uppercase leading-none tracking-tight">{subtitle}</h1>
            <div className="mt-8 border-2 border-ink bg-paper p-6 shadow-brutal sm:p-8">{children}</div>
            <p className="mt-8 text-center font-semibold">{footer}</p>
          </div>
        </main>
      </div>
    </div>
  );
}
