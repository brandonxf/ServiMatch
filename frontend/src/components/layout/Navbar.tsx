'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Shield, LogOut, User, ChevronDown, MessageSquare, Menu, X } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth.store';
import { useNotifStore } from '@/lib/store/notifications.store';
import { notificationsApi } from '@/lib/api/notifications';
import { Avatar } from '../ui/Avatar';
import { cn } from '@/lib/utils';

const focusRing =
  'focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-blue-600';

const iconBtn = `relative inline-flex size-11 items-center justify-center border-2 border-transparent text-ink transition-colors hover:border-ink hover:bg-signal ${focusRing}`;

const menuItem = `flex min-h-11 w-full items-center gap-3 px-4 py-2 text-left text-sm font-semibold transition-colors hover:bg-signal ${focusRing} focus-visible:-outline-offset-4`;

const mobileItem = `flex min-h-14 w-full items-center gap-3 border-b-2 border-ink px-4 text-left font-display text-lg font-bold uppercase hover:bg-signal ${focusRing} focus-visible:-outline-offset-4`;

export function Navbar() {
  const { user, logout } = useAuthStore();
  const { unreadCount, setAll } = useNotifStore();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (user) {
      notificationsApi.getAll().then(({ data }) => setAll(data.data, data.unreadCount)).catch(() => {});
    }
  }, [user, setAll]);

  useEffect(() => { setMobileOpen(false); setMenuOpen(false); }, [pathname]);

  if (pathname?.startsWith('/auth')) return null;

  const navLinks = [
    { href: '/search', label: 'Buscar servicios' },
    ...(user?.isWorker ? [{ href: '/dashboard/worker', label: 'Mi perfil' }] : []),
    { href: '/dashboard/requests', label: 'Mis solicitudes' },
  ];

  return (
    <header className="fixed top-0 z-50 w-full border-b-2 border-ink bg-paper">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link href="/" className={`flex items-center font-display text-2xl font-bold uppercase tracking-tight ${focusRing}`}>
          Servi<span className="ml-1 bg-signal px-1.5">Match</span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Principal" className="ml-10 hidden flex-1 items-center gap-8 md:flex">
          {navLinks.map(l => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={pathname === l.href ? 'page' : undefined}
              className={cn(
                'group relative inline-flex min-h-11 items-center font-display text-sm font-bold uppercase tracking-wide',
                focusRing
              )}
            >
              {l.label}
              <span
                aria-hidden="true"
                className={cn(
                  'absolute inset-x-0 bottom-1.5 h-1 origin-left bg-signal transition-transform motion-reduce:transition-none',
                  pathname === l.href ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                )}
              />
            </Link>
          ))}
        </nav>

        {/* Right */}
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <>
              <Link href="/chat" aria-label="Mensajes" className={cn(iconBtn, 'hidden md:inline-flex')}>
                <MessageSquare size={20} aria-hidden="true" />
              </Link>
              <Link
                href="/notifications"
                aria-label={unreadCount > 0 ? `Notificaciones, ${unreadCount} sin leer` : 'Notificaciones'}
                className={cn(iconBtn, 'hidden md:inline-flex')}
              >
                <Bell size={20} aria-hidden="true" />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center border-2 border-ink bg-signal font-mono text-[10px] font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative hidden md:block" onMouseLeave={() => setMenuOpen(false)}>
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  onMouseEnter={() => setMenuOpen(true)}
                  aria-expanded={menuOpen}
                  aria-haspopup="menu"
                  aria-label="Menú de usuario"
                  className={`flex min-h-11 items-center gap-2 border-2 border-ink bg-white pl-1 pr-2 transition-colors hover:bg-signal ${focusRing}`}
                >
                  <Avatar src={user.avatarUrl} name={user.fullName} size={32} />
                  <ChevronDown size={16} aria-hidden="true" className={cn('transition-transform', menuOpen && 'rotate-180')} />
                </button>
                {menuOpen && (
                  <>
                    <div onClick={() => setMenuOpen(false)} className="fixed inset-0 z-10" aria-hidden="true" />
                    <div role="menu" className="absolute right-0 z-20 w-60 border-2 border-ink bg-white shadow-brutal">
                      <div className="border-b-2 border-ink bg-signal px-4 py-3">
                        <p className="truncate font-display text-sm font-bold">{user.fullName}</p>
                        <p className="truncate font-mono text-xs">{user.email}</p>
                      </div>
                      <Link role="menuitem" href="/dashboard" onClick={() => setMenuOpen(false)} className={menuItem}>
                        <User size={16} aria-hidden="true" /> Mi cuenta
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link role="menuitem" href="/admin" onClick={() => setMenuOpen(false)} className={menuItem}>
                          <Shield size={16} aria-hidden="true" /> Panel Admin
                        </Link>
                      )}
                      <button
                        role="menuitem"
                        onClick={() => { setMenuOpen(false); logout(); }}
                        className={cn(menuItem, 'border-t-2 border-ink text-red-700')}
                      >
                        <LogOut size={16} aria-hidden="true" /> Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                className={`hidden min-h-11 items-center px-3 font-display text-sm font-bold uppercase tracking-wide hover:bg-signal md:inline-flex ${focusRing}`}
              >
                Ingresar
              </Link>
              <Link
                href="/auth/register?role=WORKER"
                className={`inline-flex min-h-11 items-center border-2 border-ink bg-signal px-4 font-display text-sm font-bold uppercase tracking-wide shadow-brutal-sm transition-[transform,box-shadow] duration-100 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none motion-reduce:transition-none ${focusRing}`}
              >
                Ser profesional
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Cerrar menú' : 'Abrir menú'}
            className={cn(iconBtn, 'md:hidden', mobileOpen && 'border-ink bg-signal')}
          >
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="absolute left-0 top-16 max-h-[calc(100dvh-4rem)] w-full overflow-y-auto border-b-2 border-ink bg-paper md:hidden">
          <nav aria-label="Móvil" className="flex flex-col">
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                aria-current={pathname === l.href ? 'page' : undefined}
                className={cn(mobileItem, pathname === l.href && 'bg-signal')}
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link href="/chat" onClick={() => setMobileOpen(false)} className={mobileItem}>
                  <MessageSquare size={18} aria-hidden="true" /> Mensajes
                </Link>
                <Link href="/notifications" onClick={() => setMobileOpen(false)} className={mobileItem}>
                  <Bell size={18} aria-hidden="true" /> Notificaciones{unreadCount > 0 && ` (${unreadCount})`}
                </Link>
                <Link href="/dashboard" onClick={() => setMobileOpen(false)} className={mobileItem}>
                  <User size={18} aria-hidden="true" /> Mi cuenta
                </Link>
                {user.role === 'ADMIN' && (
                  <Link href="/admin" onClick={() => setMobileOpen(false)} className={mobileItem}>
                    <Shield size={18} aria-hidden="true" /> Panel Admin
                  </Link>
                )}
                <button onClick={() => { setMobileOpen(false); logout(); }} className={cn(mobileItem, 'border-b-0 text-red-700')}>
                  <LogOut size={18} aria-hidden="true" /> Cerrar sesión
                </button>
              </>
            ) : (
              <Link href="/auth/login" onClick={() => setMobileOpen(false)} className={cn(mobileItem, 'border-b-0')}>
                Ingresar
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
