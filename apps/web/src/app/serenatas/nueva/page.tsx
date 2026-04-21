import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Save } from 'lucide-react';

export default function NuevaSerenataPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <Link href="/serenatas" className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all">
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">Nueva Serenata</h1>
          <p className="text-white/50">Crea un nuevo evento en el Mariachi Aventurero.</p>
        </div>
      </header>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="md:col-span-2 glass-card space-y-6">
          <h2 className="text-lg font-semibold text-[var(--accent-gold)] border-b border-white/10 pb-2">Datos del Cliente y Festejada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Nombre del Cliente</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Teléfono</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Nombre de la Festejada</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Motivo (Cumpleaños, Aniversario, etc.)</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white" />
            </div>
          </div>
        </div>

        <div className="glass-card space-y-6">
          <h2 className="text-lg font-semibold text-[var(--accent-gold)] border-b border-white/10 pb-2">Ubicación y Horario</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Dirección Exacta</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Comuna</label>
              <input type="text" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-white/70">Fecha</label>
                <input type="date" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white rounded-scheme-dark" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-white/70">Hora</label>
                <input type="time" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card space-y-6">
          <h2 className="text-lg font-semibold text-[var(--accent-gold)] border-b border-white/10 pb-2">Servicio y Pago</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm text-white/70">Tipo de Serenata</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white">
                <option value="express">Express (4 canciones aprox)</option>
                <option value="full">Full (Completa)</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Precio Total (CLP)</label>
              <input type="number" className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white" placeholder="70000" />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-white/70">Mensaje Especial / Notas</label>
              <textarea className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-white h-20"></textarea>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 flex justify-end gap-4">
          <Link href="/serenatas" className="px-8 py-3 rounded-lg border border-white/10 text-white hover:bg-white/5 transition-all">
            Cancelar
          </Link>
          <button type="submit" className="btn-gold px-12 py-3 flex items-center gap-2">
            <Save size={20} /> Guardar Serenata
          </button>
        </div>
      </form>
    </div>
  );
}
