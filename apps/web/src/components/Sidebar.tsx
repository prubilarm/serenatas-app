"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Music,
  Users,
  Calendar,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  X
} from 'lucide-react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Calendar,        label: 'Agenda',    href: '/agenda' },
  { icon: Music,           label: 'Serenatas', href: '/serenatas' },
  { icon: CreditCard,      label: 'Pagos',     href: '/pagos' },
  { icon: Users,           label: 'Clientes',  href: '/clientes' },
  { icon: FileText,        label: 'Reportes',  href: '/reportes' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  // ── Elementos del sidebar compartido ──────────────────────────────────────
  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex-1 px-4">
      <ul className="space-y-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onClose}
                className={`nav-item ${
                  isActive
                    ? 'text-[var(--accent-gold)] bg-white/5 border-l-2 border-[var(--accent-gold)]'
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <item.icon
                  size={18}
                  className={`${isActive ? 'text-[var(--accent-gold)]' : 'opacity-50'} transition-all`}
                />
                <span className="font-semibold text-sm tracking-wide">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════
          SIDEBAR DESKTOP — visible solo en md+
      ═══════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex w-64 h-screen bg-black/40 backdrop-blur-3xl border-r border-white/5 flex-col shrink-0 sticky top-0 z-50">
        {/* Logo */}
        <div className="p-8 pb-6">
          <h1 className="hero-title text-xl font-bold gold-gradient-text tracking-[0.3em]">
            EL MARIACHI
          </h1>
          <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mt-1 font-medium">
            Aventurero
          </p>
        </div>

        <NavLinks />

        {/* Footer usuario */}
        <div className="p-5 border-t border-white/5 space-y-3">
          {user && (
            <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Personal</p>
              <p className="text-xs text-white/70 truncate font-medium mt-1">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          HEADER MÓVIL — visible solo en mobile
      ═══════════════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-black/90 backdrop-blur-xl border-b border-white/8">
        <div>
          <h1 className="hero-title text-sm font-bold gold-gradient-text tracking-[0.2em]">
            MARIACHI AVENTURERO
          </h1>
        </div>
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all"
          aria-label="Abrir menú"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* Espacio para que el contenido no quede debajo del header fijo */}
      <div className="md:hidden h-[56px] shrink-0" />

      {/* ═══════════════════════════════════════════════════════════════
          DRAWER MÓVIL — panel lateral que aparece al presionar menú
      ═══════════════════════════════════════════════════════════════ */}
      {/* Overlay oscuro */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Panel del drawer */}
      <div
        className={`md:hidden fixed top-0 left-0 h-full w-72 bg-[#080808] border-r border-white/10 z-[70] flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header del drawer */}
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div>
            <h1 className="hero-title text-base font-bold gold-gradient-text tracking-[0.25em]">
              EL MARIACHI
            </h1>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] mt-0.5">Aventurero</p>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navegación del drawer */}
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks onClose={() => setMobileOpen(false)} />
        </div>

        {/* Footer del drawer */}
        <div className="p-5 border-t border-white/8 space-y-3">
          {user && (
            <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Sesión activa</p>
              <p className="text-xs text-white/70 truncate font-medium mt-1">{user.email}</p>
            </div>
          )}
          <button
            onClick={() => { setMobileOpen(false); handleLogout(); }}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20"
          >
            <LogOut size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          BOTTOM NAV MÓVIL — los 4 más usados fijos abajo
      ═══════════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-xl border-t border-white/8 flex">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${
                isActive ? 'text-[var(--accent-gold)]' : 'text-white/30'
              }`}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? 'text-[var(--accent-gold)]' : 'text-white/25'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
