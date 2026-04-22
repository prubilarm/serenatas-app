'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Music,
  ArrowUpRight,
  Clock,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StatCard = ({ title, value, icon: Icon, description, trend, color }: any) => (
  <div className="glass-card group hover:translate-y-[-4px] !p-4 md:!p-6">
    <div className="flex justify-between items-start mb-3">
      <div className={`p-2 md:p-3 rounded-xl md:rounded-2xl ${color || 'bg-[var(--accent-gold)]/10 text-[var(--accent-gold)]'}`}>
        <Icon size={18} className="md:hidden" />
        <Icon size={24} className="hidden md:block" />
      </div>
      {trend && (
        <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full flex items-center gap-1 font-bold uppercase tracking-tighter">
          {trend} <ArrowUpRight size={9} />
        </span>
      )}
    </div>
    <div>
      <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.15em] mb-1">{title}</p>
      <p className="text-2xl md:text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
    <div className="hidden md:block mt-4 pt-4 border-t border-white/5">
      <p className="text-[10px] text-white/20 font-medium italic">{description}</p>
    </div>
  </div>
);

export default function DashboardPage() {
  const [serenatas, setSerenatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Serenatas Hoy', value: '0', icon: Music, description: 'Presentaciones programadas para hoy', color: 'bg-blue-500/10 text-blue-400' },
    { title: 'Ingresos Mes', value: '$0', icon: DollarSign, description: 'Recaudación total del mes en curso', color: 'bg-emerald-500/10 text-emerald-400', trend: '12%' },
    { title: 'Pendientes', value: '0', icon: Clock, description: 'Eventos por confirmar o cobrar', color: 'bg-amber-500/10 text-amber-400' },
    { title: 'Clientes', value: '0', icon: Users, description: 'Base total de clientes registrados', color: 'bg-purple-500/10 text-purple-400' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const [resS, resC] = await Promise.all([
          fetch(`${apiUrl}/serenatas`),
          fetch(`${apiUrl}/clientes`)
        ]);
        
        const dataS = await resS.json();
        const dataC = await resC.json();
        
        if (Array.isArray(dataS)) {
          setSerenatas(dataS.slice(0, 5));
          const hoy = new Date().toISOString().split('T')[0];
          const hoyCount = dataS.filter((s: any) => s.fecha === hoy).length;
          
          setStats([
            { title: 'Serenatas Hoy', value: hoyCount.toString(), icon: Music, description: 'Presentaciones programadas para hoy', color: 'bg-blue-500/10 text-blue-400' },
            { title: 'Ingresos Mes', value: `$${dataS.reduce((acc: number, s: any) => acc + (s.precio_total || 0), 0).toLocaleString()}`, icon: DollarSign, description: 'Recaudación total del mes en curso', color: 'bg-emerald-500/10 text-emerald-400', trend: '12%' },
            { title: 'Pendientes', value: dataS.filter((s: any) => s.estado === 'cotizada').length.toString(), icon: Clock, description: 'Eventos por confirmar o cobrar', color: 'bg-amber-500/10 text-amber-400' },
            { title: 'Clientes', value: dataC.length.toString(), icon: Users, description: 'Base total de clientes registrados', color: 'bg-purple-500/10 text-purple-400' },
          ]);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 md:space-y-12 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="hero-title text-2xl md:text-4xl font-bold gold-gradient-text tracking-tighter">
            PANEL DE CONTROL
          </h1>
          <p className="text-white/40 mt-2 font-medium tracking-wide text-sm">
            Resumen operativo para hoy, <span className="text-white/70">{format(new Date(), "EEEE dd 'de' MMMM", { locale: es })}</span>
          </p>
        </div>
        <div className="hidden md:flex gap-4">
          <button className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/60 text-sm font-bold hover:bg-white/10 transition-all uppercase tracking-widest">
            Soporte
          </button>
          <button className="btn-gold uppercase text-xs tracking-[0.2em]">
            Nueva Orden
          </button>
        </div>
      </header>

      {/* Grid de Stats: controlado por media query en globals.css */}
      <div className="stats-grid">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Secciones Inferiores: controlado por media query en globals.css */}
      <div className="bottom-section-grid">
        {/* Próximas Serenatas */}
        <div className="lg:col-span-2 glass-card !p-0 overflow-hidden">
          <div className="p-8 pb-4 flex justify-between items-center border-b border-white/5">
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-3">
              <Calendar className="text-[var(--accent-gold)]" size={20} />
              Próximas Serenatas
            </h2>
            <button className="text-[var(--accent-gold)] font-bold text-[10px] uppercase tracking-widest hover:brightness-125 transition-all flex items-center gap-1">
              Ver todas <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="p-4">
            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="animate-spin text-[var(--accent-gold)]" size={40} />
              </div>
            ) : (
              <div className="space-y-2">
                {serenatas.length > 0 ? (
                  serenatas.map((serenata) => (
                    <div key={serenata.id} className="flex items-center justify-between p-5 bg-white/[0.02] hover:bg-white/[0.05] rounded-2xl border border-white/5 hover:border-[var(--accent-gold)]/20 transition-all cursor-pointer group">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-white/10 to-transparent rounded-2xl flex flex-col items-center justify-center border border-white/10 group-hover:border-[var(--accent-gold)]/50 transition-all">
                          <span className="text-xs font-bold text-[var(--accent-gold)]">{serenata.hora.slice(0, 5)}</span>
                          <span className="text-[9px] text-white/30 uppercase font-black">HRS</span>
                        </div>
                        <div>
                          <h4 className="text-white font-bold group-hover:text-[var(--accent-gold)] transition-colors">{serenata.nombre_festejada}</h4>
                          <p className="text-[11px] text-white/40 font-medium flex items-center gap-1 mt-1 uppercase tracking-wider">
                            <Clock size={10} /> {serenata.motivo} • {serenata.comuna}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full uppercase font-black tracking-tighter text-[9px] border ${
                          serenata.estado === 'confirmada' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                          {serenata.estado}
                        </span>
                        <p className="text-lg font-black text-white mt-2">${(serenata.precio_total || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 text-white/20 font-medium italic">No hay serenatas programadas para el periodo actual.</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notificaciones / Notas Rápidas */}
        <div className="glass-card bg-gradient-to-br from-[var(--accent-gold)]/10 to-transparent border-[var(--accent-gold)]/30 flex flex-col">
          <h2 className="text-lg font-bold text-[var(--accent-gold)] mb-6 flex items-center gap-2 uppercase tracking-widest">
            <Clock size={18} /> Recordatorios
          </h2>
          <div className="space-y-4 flex-1">
            <div className="p-5 bg-black/40 rounded-2xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black text-[var(--accent-gold)] uppercase tracking-[0.2em]">Prioridad Alta</span>
                <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse"></span>
              </div>
              <p className="text-sm text-white/80 font-medium leading-relaxed">
                Revisar pagos pendientes de la semana anterior antes del viernes.
              </p>
            </div>
            
            <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Agenda</p>
              <p className="text-sm text-white/60 font-medium mt-1">
                Ensayo general programado para el martes a las 18:00.
              </p>
            </div>
          </div>
          
          <div className="mt-8">
            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/40 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white hover:bg-white/10 transition-all">
              Nueva Nota +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

