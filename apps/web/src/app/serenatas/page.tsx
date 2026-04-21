import React from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  MapPin,
  Calendar as CalendarIcon
} from 'lucide-react';

export default function SerenatasPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestionar Serenatas</h1>
          <p className="text-white/50">Control total de tus presentaciones y eventos.</p>
        </div>
        <button className="btn-gold flex items-center gap-2">
          <Plus size={20} /> Nueva Serenata
        </button>
      </header>

      {/* Filtros y Búsqueda */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por cliente o festejada..." 
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--accent-gold)]"
          />
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white/70 flex items-center gap-2 hover:bg-white/10 transition-all">
          <Filter size={18} /> Filtros
        </button>
      </div>

      {/* Tabla de Serenatas */}
      <div className="glass-card !p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-white/5 text-white/40 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4 font-semibold">Evento / Cliente</th>
              <th className="px-6 py-4 font-semibold">Ubicación</th>
              <th className="px-6 py-4 font-semibold">Fecha / Hora</th>
              <th className="px-6 py-4 font-semibold">Estado</th>
              <th className="px-6 py-4 font-semibold text-right">Monto</th>
              <th className="px-6 py-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map((item) => (
              <tr key={item} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="font-medium text-white">Cumpleaños de Rosita</div>
                  <div className="text-xs text-white/40">Cliente: Carlos Muñoz</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <MapPin size={14} className="text-[var(--accent-gold)]" /> La Florida
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <CalendarIcon size={14} /> 24 Abr, 2024
                  </div>
                  <div className="text-[10px] uppercase font-bold text-white/40 ml-5">21:00 HRS</div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] rounded-full uppercase font-bold tracking-tighter">
                    Confirmada
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-white text-sm">
                  $70.000
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-white/20 hover:text-white transition-colors">
                    <MoreVertical size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
