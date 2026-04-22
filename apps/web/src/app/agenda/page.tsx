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
              const hasEvent = serenatas.some(s => isSameDay(parseISO(s.fecha), day));
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());

              return (
                <button 
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`w-8 h-8 rounded-full flex flex-col items-center justify-center mx-auto transition-all relative ${
                    isSelected ? 'bg-[var(--accent-gold)] text-black font-bold' : 
                    isToday ? 'border border-[var(--accent-gold)] text-[var(--accent-gold)]' :
                    'text-white/70 hover:bg-white/10'
                  }`}
                >
                  {format(day, 'd')}
                  {hasEvent && !isSelected && (
                    <span className="absolute bottom-1 w-1 h-1 bg-[var(--accent-gold)] rounded-full"></span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="text-sm font-medium text-white/50 mb-4 uppercase tracking-wider">Próxima Serenata</h3>
            {loading ? (
              <Loader2 className="animate-spin text-[var(--accent-gold)] mx-auto" size={20} />
            ) : serenatas.length > 0 ? (
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <div className="flex items-center gap-2 text-[var(--accent-gold)] mb-1">
                  <Clock size={16} /> <span className="text-sm font-bold">{serenatas[0].hora} hrs</span>
                </div>
                <p className="font-medium text-white">{serenatas[0].motivo} a {serenatas[0].nombre_festejada}</p>
                <div className="flex items-baseline gap-2 text-white/50 text-xs mt-2">
                  <MapPin size={12} /> {serenatas[0].comuna}
                </div>
              </div>
            ) : (
              <p className="text-white/30 text-sm italic">No hay eventos próximos.</p>
            )}
          </div>
        </div>

        {/* Lista de eventos del día */}
        <div className="glass-card lg:col-span-2">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
            <h2 className="text-xl font-semibold text-white capitalize">
              {format(selectedDate, "EEEE, d 'de' MMMM", { locale: es })}
            </h2>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={40} /></div>
          ) : selectedDateSerenatas.length === 0 ? (
            <div className="py-20 text-center text-white/30 italic">
              No hay serenatas agendadas para este día.
            </div>
          ) : (
            <div className="space-y-4">
              {selectedDateSerenatas.map((serenata) => (
                <div key={serenata.id} className="flex gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 group">
                  <div className="flex flex-col items-center justify-center bg-white/5 w-16 h-16 rounded-lg text-[var(--accent-gold)] font-bold">
                    <span className="text-[10px] uppercase tracking-widest text-white/50">{serenata.hora}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-white group-hover:text-[var(--accent-gold)] transition-colors">
                        {serenata.motivo} a {serenata.nombre_festejada}
                      </h3>
                      <span className={`px-2 py-1 bg-white/5 border border-white/10 text-[10px] rounded-full uppercase font-bold tracking-tighter ${serenata.estado === 'completada' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                        {serenata.estado || 'Confirmada'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-white/50 mt-2">
                      <span className="flex items-center gap-1"><MapPin size={14} /> {serenata.comuna}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
