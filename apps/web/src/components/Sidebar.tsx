"use client";

import React from 'react';
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
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();

  // No mostrar sidebar en la página de login
  if (pathname === '/login') return null;

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Calendar, label: 'Agenda', href: '/agenda' },
    { icon: Music, label: 'Serenatas', href: '/serenatas' },
    { icon: CreditCard, label: 'Pagos', href: '/pagos' },
    { icon: Users, label: 'Clientes', href: '/clientes' },
    { icon: FileText, label: 'Reportes', href: '/reportes' },
  ];

  const [user, setUser] = React.useState<any>(null);

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="w-72 h-screen bg-black/40 backdrop-blur-3xl border-r border-white/5 flex flex-col shrink-0 relative z-50">
      <div className="p-10">
        <h1 className="hero-title text-2xl font-bold gold-gradient-text tracking-[0.3em]">
          EL MARIACHI
        </h1>
        <p className="text-[11px] text-white/30 uppercase tracking-[0.4em] mt-1 font-medium">Aventurero</p>
      </div>

      <nav className="flex-1 px-6">
        <ul className="space-y-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link 
                  href={item.href}
                  className={`nav-item ${
                    isActive 
                    ? 'text-[var(--accent-gold)] bg-white/5 border-l-2 border-[var(--accent-gold)]' 
                    : 'text-white/40 hover:text-white'
                  }`}
                >
                  <item.icon size={18} className={`${isActive ? 'text-[var(--accent-gold)]' : 'opacity-50'} transition-all`} />
                  <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-6 border-t border-white/5 space-y-4">
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
  );
};

export default Sidebar;
