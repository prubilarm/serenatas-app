"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, MapPin, Search, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Serenata {
  id: string;
  motivo: string;
  nombre_festejada: string;
  fecha: string;
  hora: string;
  comuna: string;
  estado: string;
}

export default function AgendaPage() {
  const [serenatas, setSerenatas] = useState<Serenata[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const fetchSerenatas = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/serenatas`);
      if (response.ok) {
        const data = await response.json();
        setSerenatas(data);
      }
    } catch (error) {
      console.error("Error fetching serenatas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSerenatas();
  }, []);

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedDateSerenatas = serenatas.filter(s => 
    isSameDay(parseISO(s.fecha), selectedDate)
  );

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

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
          <button onClick={prevMonth} className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
            <ChevronLeft size={20} />
          </button>
          <button onClick={goToToday} className="px-4 py-2 border border-white/10 rounded-lg text-white font-medium hover:bg-white/5">
            Hoy
          </button>
          <button onClick={nextMonth} className="p-2 border border-white/10 rounded-lg text-white/50 hover:text-white hover:bg-white/5">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Calendario lateral */}
        <div className="glass-card lg:col-span-1 h-fit">
          <h2 className="text-lg font-semibold text-white mb-4 capitalize">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h2>
          <div className="grid grid-cols-7 gap-2 text-center text-xs text-white/50 mb-2 font-medium">
            <div>Lu</div><div>Ma</div><div>Mi</div><div>Ju</div><div>Vi</div><div>Sa</div><div>Do</div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {days.map((day) => {
              const daySerenatas = serenatas.filter(s => isSameDay(parseISO(s.fecha), day));
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button 
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center mx-auto transition-all relative border ${
                    isSelected ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black font-bold shadow-lg shadow-[var(--accent-gold)]/20' : 
                    isToday ? 'border-[var(--accent-gold)]/50 text-[var(--accent-gold)] bg-[var(--accent-gold)]/5' :
                    'text-white/70 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  {daySerenatas.length > 0 && (
                    <div className="absolute -bottom-1 flex gap-0.5">
                      {daySerenatas.slice(0, 3).map((s, idx) => {
                        const isFin = s.estado === 'finalizada' || s.estado === 'realizada' || s.estado === 'completada';
                        return (
                          <div 
                            key={s.id} 
                            className={`w-1 h-1 rounded-full ${isFin ? 'bg-emerald-500' : 'bg-yellow-500'}`}
                          />
                        );
                      })}
                      {daySerenatas.length > 3 && <div className="w-1 h-1 rounded-full bg-white/50" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-[10px] font-black text-white/30 mb-4 uppercase tracking-[0.2em]">Resumen del Día</h3>
            {loading ? (
              <Loader2 className="animate-spin text-[var(--accent-gold)] mx-auto" size={20} />
            ) : selectedDateSerenatas.length > 0 ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">Total eventos:</span>
                  <span className="text-white font-bold">{selectedDateSerenatas.length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">Finalizadas:</span>
                  <span className="text-emerald-500 font-bold">{selectedDateSerenatas.filter(s => s.estado === 'finalizada' || s.estado === 'realizada' || s.estado === 'completada').length}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-white/50">Pendientes:</span>
                  <span className="text-yellow-500 font-bold">{selectedDateSerenatas.filter(s => s.estado !== 'finalizada' && s.estado !== 'realizada' && s.estado !== 'completada').length}</span>
                </div>
              </div>
            ) : (
              <p className="text-white/20 text-[10px] italic uppercase tracking-widest text-center">Día libre</p>
            )}
          </div>
        </div>

        {/* Lista de eventos del día */}
        <div className="glass-card lg:col-span-2">
          <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-bold text-white capitalize">
                {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
              </h2>
              <p className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-[0.3em] mt-1">
                {selectedDateSerenatas.length} {selectedDateSerenatas.length === 1 ? 'Serenata Programada' : 'Serenatas Programadas'}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={40} /></div>
          ) : selectedDateSerenatas.length === 0 ? (
            <div className="py-20 text-center text-white/10 italic bg-white/[0.02] rounded-3xl border border-dashed border-white/5 uppercase tracking-widest text-xs">
              No hay serenatas agendadas para este día.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateSerenatas.sort((a,b) => a.hora.localeCompare(b.hora)).map((serenata) => {
                const isFin = serenata.estado === 'finalizada' || serenata.estado === 'completada' || serenata.estado === 'realizada';
                return (
                  <div key={serenata.id} className="flex gap-6 p-6 rounded-3xl bg-white/[0.02] hover:bg-white/[0.05] transition-all border border-white/5 hover:border-[var(--accent-gold)]/30 group">
                    <div className="flex flex-col items-center justify-center bg-black/40 w-20 h-20 rounded-2xl border border-white/5 group-hover:border-[var(--accent-gold)]/50 transition-all">
                      <span className="text-[10px] uppercase font-black tracking-widest text-white/30">HORA</span>
                      <span className="text-xl font-black text-[var(--accent-gold)]">{serenata.hora.slice(0,5)}</span>
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-bold text-white group-hover:text-[var(--accent-gold)] transition-colors">
                            {serenata.nombre_festejada}
                          </h3>
                          <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-1">{serenata.motivo}</p>
                        </div>
                        <span className={`px-4 py-1.5 border text-[10px] rounded-full uppercase font-black tracking-widest ${isFin ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'}`}>
                          {serenata.estado || 'Confirmada'}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-xs text-white/30 mt-4 font-bold uppercase tracking-widest">
                        <span className="flex items-center gap-2"><MapPin size={14} className="text-[var(--accent-gold)]" /> {serenata.comuna}</span>
                        <span className="flex items-center gap-2"><Clock size={14} className="text-[var(--accent-gold)]" /> {serenata.hora} hrs</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
