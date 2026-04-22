"use client";

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Download, Loader2 } from 'lucide-react';

export default function ReportesPage() {
  const [stats, setStats] = useState({
    totalIngresos: 0,
    totalSerenatas: 0,
    totalClientes: 0,
    tasaCierre: 100, // Por ahora estático
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const [resPagos, resSerenatas, resClientes] = await Promise.all([
        fetch(`${apiUrl}/pagos`),
        fetch(`${apiUrl}/serenatas`),
        fetch(`${apiUrl}/clientes`)
      ]);
      
      const pagos = resPagos.ok ? await resPagos.json() : [];
      const serenatas = resSerenatas.ok ? await resSerenatas.json() : [];
      const clientes = resClientes.ok ? await resClientes.json() : [];

      const totalIngresos = pagos.reduce((acc: number, p: any) => acc + p.monto, 0);
      
      setStats({
        totalIngresos,
        totalSerenatas: serenatas.length,
        totalClientes: clientes.length,
        tasaCierre: 92, // Mocked for now
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleExportPDF = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
    window.open(`${apiUrl}/reportes/pdf`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-gold)] to-yellow-200 bg-clip-text text-transparent">
            Reportes y Estadísticas
          </h1>
          <p className="text-white/50 mt-2">Visión general del rendimiento del Mariachi Aventurero.</p>
        </div>
        
        <button 
          onClick={handleExportPDF}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 flex items-center gap-2 hover:bg-white/10 transition-all"
        >
          <Download size={18} />
          Exportar PDF
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)]">
                <DollarSign size={20} />
              </div>
              <span className="flex items-center text-xs text-emerald-400 font-medium">
                <TrendingUp size={12} className="mr-1" /> +100%
              </span>
            </div>
            <div>
              <h3 className="text-white/50 text-sm font-medium">Ingresos Totales</h3>
              <p className="text-2xl font-bold text-white mt-1">${stats.totalIngresos.toLocaleString()}</p>
            </div>
          </div>

          <div className="glass-card flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Calendar size={20} />
              </div>
              <span className="flex items-center text-xs text-emerald-400 font-medium">
                <TrendingUp size={12} className="mr-1" /> +{stats.totalSerenatas}
              </span>
            </div>
            <div>
              <h3 className="text-white/50 text-sm font-medium">Serenatas Realizadas</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalSerenatas}</p>
            </div>
          </div>

          <div className="glass-card flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Users size={20} />
              </div>
              <span className="flex items-center text-xs text-emerald-400 font-medium">
                <TrendingUp size={12} className="mr-1" /> +{stats.totalClientes}
              </span>
            </div>
            <div>
              <h3 className="text-white/50 text-sm font-medium">Nuevos Clientes</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalClientes}</p>
            </div>
          </div>

          <div className="glass-card flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                <BarChart3 size={20} />
              </div>
              <span className="flex items-center text-xs text-emerald-400 font-medium">
                <TrendingUp size={12} className="mr-1" /> Estabilidad
              </span>
            </div>
            <div>
              <h3 className="text-white/50 text-sm font-medium">Tasa de Cierre</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.tasaCierre}%</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card min-h-[300px] flex flex-col items-center justify-center border border-dashed border-white/20">
          <BarChart3 size={48} className="text-white/20 mb-4" />
          <p className="text-white/40">Gráfico de ingresos mensuales (Próximamente)</p>
        </div>
        <div className="glass-card min-h-[300px] flex flex-col items-center justify-center border border-dashed border-white/20">
          <Users size={48} className="text-white/20 mb-4" />
          <p className="text-white/40">Gráfico de retención de clientes (Próximamente)</p>
        </div>
      </div>
    </div>
  );
}
