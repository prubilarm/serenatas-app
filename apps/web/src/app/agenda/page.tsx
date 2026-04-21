"use client";

import React from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AgendaPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-gold)] to-yellow-200 bg-clip-text text-transparent">
            Agenda del Mariachi
          </h1>
          <p className="text-white/50 mt-2">Visualiza tus compromisos, serenatas y ensayos por venir.</p>
        </div>
        
        <div className="flex gap-2">
          <button className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
            <ChevronLeft size={20} />
          </button>
          <button className="px-4 py-2 border border-white/10 rounded-lg text-white font-medium hover:bg-white/5">
            Hoy
          </button>
          <button className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendario lateral */}
        <div className="glass-card lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-white mb-4">Abril 2024</h2>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-white/50 mb-2 font-medium">
            <div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div><div>Do</div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {/* Fechas dummy */}
            {Array.from({ length: 30 }).map((_, i) => {
              const day = i + 1;
              const hasEvent = [15, 20, 24, 28].includes(day);
              const isToday = day === 20;

              return (
                <button 
                  key={day}
                  className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto transition-all ${
                    isToday ? 'bg-[var(--accent-gold)] text-black font-bold' : 
                    hasEvent ? 'text-[var(--accent-gold)] hover:bg-white/10' : 
                    'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">Próximo Evento</h3>
            <div className="bg-white/5 rounded-lg p-4 border border-white/5">
              <div className="flex items-center gap-2 text-[var(--accent-gold)] mb-1">
                <Clock size={16} /> <span className="text-sm font-bold">20:30 hrs</span>
              </div>
              <p className="font-medium text-white">Aniversario Familia Pérez</p>
              <div className="flex items-baseline gap-2 text-white/50 text-xs mt-2">
                <MapPin size={12} /> Zona Sur, Local 4
              </div>
            </div>
          </div>
        </div>

        {/* Lista de eventos del día */}
        <div className="glass-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white">Sábado, 20 de Abril</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <input 
                type="text" 
                placeholder="Buscar evento..." 
                className="w-full bg-black/50 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
              <div className="flex flex-col items-center justify-center bg-white/5 w-16 h-16 rounded-lg text-[var(--accent-gold)] font-bold">
                <span className="text-[10px] uppercase tracking-widest text-white/50">20:30</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-white group-hover:text-[var(--accent-gold)] transition-colors">
                    Aniversario Familia Pérez
                  </h3>
                  <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] rounded-full uppercase font-bold tracking-tighter">
                    Confirmado
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/50 mt-2">
                  <span className="flex items-center gap-1"><MapPin size={14} /> Zona Sur, Local 4</span>
                  <span className="flex items-center gap-1"><CalendarIcon size={14} /> Duración: 2 Horas</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
              <div className="flex flex-col items-center justify-center bg-white/5 w-16 h-16 rounded-lg text-white/70 font-bold opacity-50">
                <span className="text-[10px] uppercase tracking-widest text-white/50">23:00</span>
              </div>
              <div className="flex-1 opacity-60">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-medium text-white group-hover:text-white/80 transition-colors">
                    Cumpleaños Sorpresa
                  </h3>
                  <span className="px-2 py-1 bg-white/5 text-white/40 text-[10px] rounded-full uppercase font-bold tracking-tighter">
                    Borrador
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-white/50 mt-2">
                  <span className="flex items-center gap-1"><MapPin size={14} /> Centro Histórico</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
