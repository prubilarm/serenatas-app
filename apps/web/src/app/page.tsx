'use client';

import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  DollarSign, 
  Music,
  ArrowUpRight,
  Clock,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
  <div className="glass-card flex flex-col gap-2">
    <div className="flex justify-between items-start">
      <div className="p-2 bg-white/5 rounded-lg">
        <Icon size={24} className="text-[var(--accent-gold)]" />
      </div>
      {trend && (
        <span className="text-xs text-green-400 flex items-center gap-1 font-medium">
          {trend} <ArrowUpRight size={12} />
        </span>
      )}
    </div>
    <div>
      <h3 className="text-white/50 text-sm font-medium">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
    <p className="text-[10px] text-white/30 uppercase tracking-widest">{description}</p>
  </div>
);

export default function DashboardPage() {
  const [serenatas, setSerenatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { title: 'Serenatas Hoy', value: '0', icon: Music, description: 'Eventos programados' },
    { title: 'Ingresos Mes', value: '$0', icon: DollarSign, description: 'Total recaudado' },
    { title: 'Pendientes', value: '0', icon: Clock, description: 'Por cobrar' },
    { title: 'Clientes', value: '0', icon: Users, description: 'Cartera histórica' },
  ]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // En producción usaremos una variable de entorno, por ahora fallback a localhost
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${apiUrl}/serenatas`);
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setSerenatas(data.slice(0, 5)); // Mostrar las últimas 5
          
          // Cálculo básico de stats para la demo
          const hoy = new Date().toISOString().split('T')[0];
          const hoyCount = data.filter((s: any) => s.fecha === hoy).length;
          
          setStats([
            { title: 'Serenatas Hoy', value: hoyCount.toString(), icon: Music, description: 'Eventos programados' },
            { title: 'Ingresos Mes', value: `$${data.reduce((acc: number, s: any) => acc + (s.precio_total || 0), 0).toLocaleString()}`, icon: DollarSign, description: 'Total recaudado' },
            { title: 'Pendientes', value: data.filter((s: any) => s.estado === 'cotizada').length.toString(), icon: Clock, description: 'Por cobrar' },
            { title: 'Clientes', value: '...', icon: Users, description: 'Cartera histórica' },
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
    <div className="max-w-6xl mx-auto space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-white">Bienvenido, Mariachi</h1>
        <p className="text-white/50">Aquí tienes el resumen de hoy, {format(new Date(), "dd 'de' MMMM", { locale: es })}.</p>
      </header>

      {/* Grid de Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
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
          
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} />
            </div>
          ) : (
            <div className="space-y-4">
              {serenatas.length > 0 ? (
                serenatas.map((serenata) => (
                  <div key={serenata.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-[var(--accent-gold)]/30 transition-all cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-[var(--accent-gold)]/10 rounded-full flex items-center justify-center text-[var(--accent-gold)] font-bold">
                        {serenata.hora.slice(0, 5)}
                      </div>
                      <div>
                        <h4 className="text-white font-medium">{serenata.nombre_festejada} - {serenata.motivo}</h4>
                        <p className="text-xs text-white/40">{serenata.direccion}, {serenata.comuna}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full uppercase font-bold tracking-wider text-[10px] ${
                        serenata.estado === 'confirmada' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
                      }`}>
                        {serenata.estado}
                      </span>
                      <p className="text-sm font-bold text-white mt-1">${(serenata.precio_total || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-white/30">No hay serenatas programadas.</div>
              )}
            </div>
          )}
        </div>

        {/* Notificaciones / Notas Rápidas */}
        <div className="glass-card bg-[var(--accent-gold)]/5 border-[var(--accent-gold)]/20">
          <h2 className="text-lg font-semibold text-[var(--accent-gold)] mb-4 flex items-center gap-2">
            <Clock size={18} /> Recordatorios
          </h2>
          <div className="space-y-4">
            <div className="p-3 bg-white/5 border-l-2 border-[var(--accent-gold)] rounded-r-lg">
              <p className="text-xs text-white/50 uppercase font-bold">Base de Datos</p>
              <p className="text-sm text-white/70">Asegúrate de ejecutar el script SQL en Supabase para ver datos reales.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

