import React from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Music,
  ArrowUpRight,
  Clock
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, description }: any) => (
  <div className="glass-card flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-white/5 rounded-lg">
        <Icon size={24} className="text-[var(--accent-gold)]" />
      </div>
      <span className="text-xs text-green-400 flex items-center gap-1 font-medium">
        +12% <ArrowUpRight size={12} />
      </span>
    </div>
    <div>
      <h3 className="text-white/50 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
    <p className="text-[10px] text-white/30 uppercase tracking-widest">{description}</p>
  </div>
);

export default function DashboardPage() {
  const stats = [
    { title: 'Serenatas Hoy', value: '4', icon: Music, description: 'Eventos programados' },
    { title: 'Ingresos Mes', value: '$1.250.000', icon: DollarSign, description: 'Total recaudado' },
    { title: 'Pendientes', value: '2', icon: Clock, description: 'Por cobrar' },
    { title: 'Clientes', value: '128', icon: Users, description: 'Cartera histórica' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-white">Bienvenido, Mariachi</h1>
        <p className="text-white/50">Aquí tienes el resumen de hoy, 21 de abril.</p>
      </header>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Secciones Inferiores */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Próximas Serenatas */}
        <div className="lg:col-span-2 glass-card space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Próximas Serenatas</h2>
            <button className="text-[var(--accent-gold)] text-sm hover:underline">Ver todas</button>
          </div>
          
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--accent-gold)]/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[var(--accent-gold)]/10 rounded-full flex items-center justify-center text-[var(--accent-gold)] font-bold">
                    {item}
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Juan Perez - Cumpleaños</h4>
                    <p className="text-xs text-white/40">Puente Alto, 20:30 hrs</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 text-[10px] rounded-full uppercase font-bold tracking-wider">
                    Confirmada
                  </span>
                  <p className="text-sm font-bold text-white mt-1">$65.000</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notificaciones / Notas Rápidas */}
        <div className="glass-card bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]/20">
          <h2 className="text-lg font-semibold text-[var(--accent-gold)] mb-4 flex items-center gap-2">
            <Clock size={18} /> Pendientes Críticos
          </h2>
          <div className="space-y-4">
            <div className="p-3 bg-red-500/10 border-l-2 border-red-500 rounded-r-lg">
              <p className="text-xs text-white uppercase font-bold">Recordatorio</p>
              <p className="text-sm text-white/70">Llamar a Maria para confirmar dirección en Buin.</p>
            </div>
            <div className="p-3 bg-blue-500/10 border-l-2 border-blue-500 rounded-r-lg">
              <p className="text-xs text-white uppercase font-bold">Pago</p>
              <p className="text-sm text-white/70">Pedro envió comprobante de transferencia.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
