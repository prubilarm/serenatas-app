"use client";

import React from 'react';
import { BarChart3, TrendingUp, Users, Calendar, DollarSign, Download } from 'lucide-react';

export default function ReportesPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-gold)] to-yellow-200 bg-clip-text text-transparent">
            Reportes y Estadísticas
          </h1>
          <p className="text-white/50 mt-2">Visión general del rendimiento del Mariachi Aventurero.</p>
        </div>
        
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 flex items-center gap-2 hover:bg-white/10 transition-all">
          <Download size={18} />
          Exportar PDF
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)]">
              <DollarSign size={20} />
            </div>
            <span className="flex items-center text-xs text-emerald-400 font-medium">
              <TrendingUp size={12} className="mr-1" /> +12%
            </span>
          </div>
          <div>
            <h3 className="text-white/50 text-sm font-medium">Ingresos Totales</h3>
            <p className="text-2xl font-bold text-white mt-1">$450,000</p>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Calendar size={20} />
            </div>
            <span className="flex items-center text-xs text-emerald-400 font-medium">
              <TrendingUp size={12} className="mr-1" /> +5
            </span>
          </div>
          <div>
            <h3 className="text-white/50 text-sm font-medium">Serenatas Realizadas</h3>
            <p className="text-2xl font-bold text-white mt-1">48</p>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users size={20} />
            </div>
            <span className="flex items-center text-xs text-emerald-400 font-medium">
              <TrendingUp size={12} className="mr-1" /> +18%
            </span>
          </div>
          <div>
            <h3 className="text-white/50 text-sm font-medium">Nuevos Clientes</h3>
            <p className="text-2xl font-bold text-white mt-1">24</p>
          </div>
        </div>

        <div className="glass-card flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
              <BarChart3 size={20} />
            </div>
            <span className="flex items-center text-xs text-emerald-400 font-medium">
              <TrendingUp size={12} className="mr-1" /> +2%
            </span>
          </div>
          <div>
            <h3 className="text-white/50 text-sm font-medium">Tasa de Cierre</h3>
            <p className="text-2xl font-bold text-white mt-1">85%</p>
          </div>
        </div>
      </div>

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
