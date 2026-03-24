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
    <header className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/60 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 font-bold text-xl tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-slate-900">Servi</span><span className="text-blue-600">Match</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex flex-1 items-center justify-between ml-10">
          <nav className="flex items-center gap-8">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className={cn(
                'text-sm font-medium transition-all duration-200 relative group',
                pathname === l.href ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'
              )}>
                {l.label}
                 <span className={cn(
                  "absolute -bottom-1 left-0 w-full h-[2px] rounded-full bg-blue-600 transition-all duration-300",
                  pathname === l.href ? "opacity-100" : "opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100"
                )} />
              </Link>
            ))}
          </nav>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5 ml-auto">
          {user ? (
            <>
              <Link href="/chat" className="text-slate-500 hover:text-slate-900 transition-colors hidden md:flex">
                <MessageSquare size={20} />
              </Link>
              <Link href="/notifications" className="text-slate-500 hover:text-slate-900 transition-colors relative hidden md:flex">
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative hidden md:block" onMouseLeave={() => setMenuOpen(false)}>
                <button onClick={() => setMenuOpen(!menuOpen)} onMouseEnter={() => setMenuOpen(true)}
                  className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full hover:bg-slate-50 transition-colors focus:outline-none">
                  <Avatar src={user.avatarUrl} name={user.fullName} size={32} />
                  <ChevronDown size={16} className="text-slate-400" />
                </button>
                {menuOpen && (
                  <>
                    <div onClick={() => setMenuOpen(false)} className="fixed inset-0 z-10" />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-20">
                      <div className="px-4 py-3 border-b border-gray-100 mb-1">
                        <p className="text-sm font-medium text-slate-900 truncate">{user.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                        <User size={16} className="text-slate-400" /> Mi cuenta
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                          <Shield size={16} className="text-slate-400" /> Panel Admin
                        </Link>
                      )}
                      <button onClick={() => { setMenuOpen(false); logout(); }}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left transition-colors mt-1 border-t border-gray-100">
                        <LogOut size={16} className="text-red-500" /> Cerrar sesión
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 -mr-2 text-slate-600 hover:bg-slate-100 rounded-md transition-colors md:hidden">
                {mobileOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors hidden md:block">
                Ingresar
              </Link>
              <Link href="/auth/register?role=WORKER" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-orange-500/20 transform hover:-translate-y-0.5 transition-all duration-200 active:scale-95">
                Ser profesional
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-lg">
          <div className="px-4 py-4 space-y-1">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} onClick={() => setMobileOpen(false)} className={cn(
                "block px-3 py-2.5 rounded-xl text-base font-medium transition-colors",
                pathname === l.href ? "bg-blue-50 text-blue-600" : "text-slate-700 hover:bg-slate-50"
              )}>{l.label}</Link>
            ))}
            <div className="h-px bg-gray-100 my-4" />
            {user ? (
              <>
                 <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">
                    <User size={18} className="text-slate-400" /> Mi cuenta
                 </Link>
                 {user.role === 'ADMIN' && (
                    <Link href="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-base font-medium text-slate-700 hover:bg-slate-50">
                      <Shield size={18} className="text-slate-400" /> Panel Admin
                    </Link>
                 )}
                <button onClick={() => { setMobileOpen(false); logout(); }} className="flex items-center gap-3 px-3 py-2.5 text-base font-medium text-red-600 hover:bg-red-50 rounded-xl w-full mt-2">
                  <LogOut size={18} /> Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/auth/login" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 rounded-lg">Ingresar</Link>
                <Link href="/auth/register?role=WORKER" onClick={() => setMobileOpen(false)} className="block px-4 py-3 text-base font-medium text-white bg-orange-500 hover:bg-orange-600 shadow-md rounded-lg text-center">Ser profesional</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
