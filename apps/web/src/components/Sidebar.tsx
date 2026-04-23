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
  { icon: LayoutDashboard, label: 'Resumen', href: '/' },
  { icon: Calendar,        label: 'Agenda',    href: '/agenda' },
  { icon: Music,           label: 'Serenatas', href: '/serenatas' },
  { icon: CreditCard,      label: 'Caja',     href: '/pagos' },
  { icon: Users,           label: 'Clientes',  href: '/clientes' },
  { icon: FileText,        label: 'Reportes',  href: '/reportes' },
];

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (pathname === '/login') return null;
  // Si no está montado (SSR), no renderizamos partes que dependan del cliente para evitar error 500
  if (!mounted) return null;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const NavLinks = ({ onClose }: { onClose?: () => void }) => (
    <nav className="flex-1 px-4 py-4">
      <ul className="space-y-1">
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
                    : 'text-white/40 hover:text-white'
                }`}
              >
                <item.icon size={18} className={isActive ? 'text-[var(--accent-gold)]' : 'opacity-40'} />
                <span className="font-bold text-sm tracking-tight">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  return (
    <>
      {/* SIDEBAR DESKTOP */}
      <div className="sidebar-desktop hidden xl:flex">
        <div className="p-8 pb-4">
          <h1 className="hero-title text-lg font-bold gold-gradient-text">EL MARIACHI</h1>
          <p className="text-[10px] text-white/20 uppercase tracking-[0.4em]">Aventurero</p>
        </div>
        <NavLinks />
        <div className="p-6 border-t border-white/5">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 w-full text-rose-500 hover:text-rose-400 text-xs font-bold uppercase transition-all">
            <LogOut size={16} /> Salir
          </button>
        </div>
      </div>

      {/* HEADER MÓVIL */}
      <div className="mobile-header xl:hidden">
        <h1 className="hero-title text-sm font-bold gold-gradient-text tracking-widest">MARIACHI AVENTURERO</h1>
        <button onClick={() => setMobileOpen(true)} className="p-2 text-white/60">
          <Menu size={24} />
        </button>
      </div>

      {/* DRAWER MÓVIL */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] animate-in fade-in transition-all" onClick={() => setMobileOpen(false)}>
          <div className="w-[280px] h-full bg-[#0a0a0a] border-r border-white/10" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h1 className="hero-title text-base font-bold gold-gradient-text">MENÚ</h1>
              <button onClick={() => setMobileOpen(false)} className="text-white/20"><X size={24} /></button>
            </div>
            <NavLinks onClose={() => setMobileOpen(false)} />
            <div className="p-6 border-t border-white/10">
              <button onClick={handleLogout} className="text-rose-500 font-bold uppercase text-xs flex items-center gap-2">
                <LogOut size={16} /> Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM NAV MÓVIL */}
      <nav className="bottom-nav xl:hidden">
        {menuItems.slice(0, 5).map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex-1 flex flex-col items-center justify-center gap-1 ${isActive ? 'text-[var(--accent-gold)]' : 'text-white/20'}`}>
              <item.icon size={20} />
              <span className="text-[9px] font-bold uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
};

export default Sidebar;
