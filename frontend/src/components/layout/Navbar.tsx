'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Bell, Wrench, LogOut, User, ChevronDown, MessageSquare, Menu, X } from 'lucide-react';
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
  }, [user]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navLinks = [
    { href: '/search', label: 'Buscar servicios' },
    ...(user?.isWorker ? [{ href: '/dashboard/worker', label: 'Mi perfil' }] : []),
    { href: '/dashboard/requests', label: 'Mis solicitudes' },
  ];

  return (
    <header className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wrench size={16} color="white" />
          </div>
          <span className="text-gray-900">Servi<span className="text-blue-600">Match</span></span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className={cn(
              'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
              pathname === l.href ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            )}>{l.label}</Link>
          ))}
        </nav>

        {/* Right */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/chat" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors hidden md:flex">
                <MessageSquare size={18} />
              </Link>
              <Link href="/notifications" className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors relative hidden md:flex">
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User dropdown */}
              <div className="relative hidden md:block">
                <button onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-100 transition-colors">
                  <Avatar src={user.avatarUrl} name={user.fullName} size={32} />
                  <span className="text-sm font-semibold text-gray-800 max-w-[100px] truncate">{user.fullName.split(' ')[0]}</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </button>
                {menuOpen && (
                  <>
                    <div onClick={() => setMenuOpen(false)} className="fixed inset-0 z-10" />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1 z-20 animate-in slide-in-from-top-2">
                      <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                        <User size={15} /> Mi cuenta
                      </Link>
                      {user.role === 'ADMIN' && (
                        <Link href="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
                          <Wrench size={15} /> Admin
                        </Link>
                      )}
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={() => { setMenuOpen(false); logout(); }}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                          <LogOut size={15} /> Cerrar sesión
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile menu button */}
              <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors md:hidden">
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/auth/login" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors hidden md:block">Ingresar</Link>
              <Link href="/auth/register?role=WORKER" className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Ser profesional
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-3 space-y-1">
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} className="block px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50">{l.label}</Link>
          ))}
          <Link href="/auth/register?role=WORKER" className="block px-3 py-2.5 text-sm font-medium text-orange-600 hover:bg-orange-50 rounded-xl">Ser profesional</Link>
          {user ? (
            <button onClick={logout} className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl w-full">
              <LogOut size={15} /> Cerrar sesión
            </button>
          ) : (
            <Link href="/auth/login" className="block px-3 py-2.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-xl">Ingresar</Link>
          )}
        </div>
      )}
    </header>
  );
}
