import React from 'react';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Music, 
  Users, 
  Calendar, 
  CreditCard, 
  FileText,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: Calendar, label: 'Agenda', href: '/agenda' },
    { icon: Music, label: 'Serenatas', href: '/serenatas' },
    { icon: CreditCard, label: 'Pagos', href: '/pagos' },
    { icon: Users, label: 'Clientes', href: '/clientes' },
    { icon: FileText, label: 'Reportes', href: '/reportes' },
  ];

  return (
    <div className="w-64 h-screen bg-[#0A0A0A] border-r border-white/10 flex flex-col">
      <div className="p-8">
        <h1 className="text-xl font-bold text-[var(--accent-gold)] tracking-widest uppercase">
          El Mariachi
        </h1>
        <p className="text-[10px] text-white/50 uppercase tracking-[0.2em]">Aventurero</p>
      </div>

      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.href}>
              <Link 
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:text-[var(--accent-gold)] hover:bg-white/5 transition-all group"
              >
                <item.icon size={20} className="group-hover:scale-110 transition-transform" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="p-4 border-t border-white/10">
        <button className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-all">
          <Settings size={20} />
          <span>Configuración</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
