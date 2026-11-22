'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const link =
  'inline-flex min-h-11 items-center font-semibold text-paper/80 underline-offset-4 transition-colors hover:text-signal hover:underline focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal';

const heading = 'mb-3 font-mono text-xs font-bold uppercase tracking-[0.18em] text-signal';

export function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/auth')) return null;

  return (
    <footer className="border-t-2 border-ink bg-ink text-paper">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.5fr_1fr_1fr] lg:px-8">
        <div>
          <Link
            href="/"
            className="inline-flex font-display text-3xl font-bold uppercase tracking-tight focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            Servi<span className="ml-1 bg-signal px-1.5 text-ink">Match</span>
          </Link>
          <p className="mt-4 max-w-xs leading-relaxed text-paper/70">
            Conectamos clientes con profesionales verificados, en tiempo real.
          </p>
        </div>

        <nav aria-label="Plataforma">
          <h2 className={heading}>Plataforma</h2>
          <ul>
            <li><Link href="/search" className={link}>Buscar servicios</Link></li>
            <li><Link href="/" className={link}>Inicio</Link></li>
            <li><Link href="/auth/register" className={link}>Registro</Link></li>
          </ul>
        </nav>

        <nav aria-label="Legal">
          <h2 className={heading}>Legal</h2>
          <ul>
            <li><Link href="#" className={link}>Privacidad</Link></li>
            <li><Link href="#" className={link}>Términos</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t-2 border-paper/20">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-2 px-4 py-5 font-mono text-xs font-bold uppercase tracking-wider text-paper/60 sm:px-6 md:flex-row md:items-center lg:px-8">
          <p>© {new Date().getFullYear()} ServiMatch. Todos los derechos reservados.</p>
          <p>Hecho con ♥ en Colombia</p>
        </div>
      </div>
    </footer>
  );
}
