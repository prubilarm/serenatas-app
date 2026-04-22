"use client";

import React, { useState, useEffect } from 'react';
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
  const [user, setUser] = useState<any>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const checkSize = () => setIsDesktop(window.innerWidth >= 1024);
    checkSize();
    window.addEventListener('resize', checkSize);
    return () => window.removeEventListener('resize', checkSize);
  }, []);

  if (pathname === '/login') return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

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
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? 'text-[var(--accent-gold)] bg-white/5 border-l-2 border-[var(--accent-gold)]'
                    : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-[var(--accent-gold)]' : 'opacity-50'} />
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
      {/* SIDEBAR DESKTOP - Solo si JS detecta ancho >= 1024 */}
      {isDesktop && (
        <div className="sidebar-desktop">
          <div className="p-8 pb-6">
            <h1 className="hero-title text-xl font-bold gold-gradient-text tracking-[0.3em]">EL MARIACHI</h1>
            <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mt-1 font-medium">Aventurero</p>
          </div>
          <NavLinks />
          <div className="p-5 border-t border-white/5 space-y-3">
            {user && (
              <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Personal</p>
                <p className="text-xs text-white/70 truncate font-medium mt-1">{user.email}</p>
              </div>
            )}
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-500/40 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20">
              <LogOut size={18} />
              <span className="font-bold text-xs uppercase tracking-widest">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* HEADER MÓVIL */}
      {!isDesktop && (
        <div className="mobile-header">
          <h1 className="hero-title text-sm font-bold gold-gradient-text tracking-[0.2em]">MARIACHI AVENTURERO</h1>
          <button onClick={() => setMobileOpen(true)} className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Menu size={22} />
          </button>
        </div>
      )}

      {/* ESPACIADOR MÓVIL */}
      {!isDesktop && <div className="mobile-header-spacer" />}

      {/* DRAWER MÓVIL */}
      {mobileOpen && <div className="mobile-drawer-overlay" onClick={() => setMobileOpen(false)} />}
      <div className={`mobile-drawer ${mobileOpen ? 'open' : ''}`}>
        <div className="flex items-center justify-between p-6 border-b border-white/8">
          <div>
            <h1 className="hero-title text-base font-bold gold-gradient-text tracking-[0.25em]">EL MARIACHI</h1>
            <p className="text-[9px] text-white/30 uppercase tracking-[0.3em] mt-0.5">Aventurero</p>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl text-white/30 hover:text-white hover:bg-white/10 transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <NavLinks onClose={() => setMobileOpen(false)} />
        </div>
        <div className="p-5 border-t border-white/8 space-y-3">
          {user && (
            <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[9px] text-white/20 uppercase tracking-[0.2em] font-bold">Sesión activa</p>
              <p className="text-xs text-white/70 truncate font-medium mt-1">{user.email}</p>
            </div>
          )}
          <button onClick={() => { setMobileOpen(false); handleLogout(); }} className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-rose-500/50 hover:text-rose-500 hover:bg-rose-500/10 transition-all border border-transparent hover:border-rose-500/20">
            <LogOut size={18} />
            <span className="font-bold text-xs uppercase tracking-widest">Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* BOTTOM NAV MÓVIL */}
      {!isDesktop && (
        <nav className="bottom-nav">
          {menuItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 transition-all ${isActive ? 'text-[var(--accent-gold)]' : 'text-white/30'}`}>
                <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
                <span className={`text-[9px] font-bold uppercase tracking-wide ${isActive ? 'text-[var(--accent-gold)]' : 'text-white/25'}`}>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
};

export default Sidebar;
