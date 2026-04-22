"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  MapPin,
  Calendar as CalendarIcon,
  Loader2,
  Music,
  CheckCircle,
  X,
  FileText,
  Phone,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const LISTADO_CANCIONES = [
  "Mil puñados de oro", "Jalisco no te rajes", "Un millón de primaveras",
  "La venia bendita", "No me se rajar", "El rey", "Celos", "Mujeres divinas",
  "Me bebí tu recuerdo", "Matalas", "Caballo prieto azabache", "El aventurero",
  "El Adiós a la vida", "Volver Volver", "Borracho te recuerdo", "Cielito lindo",
  "Las mañanitas", "Si te vas no hay lío", "Que chulada de mujer", "Acá entre nos",
  "Que de raro tiene", "Por tu maldito amor", "A quien vas a amar más que a mi",
  "La ley del monte", "El ayudante", "Si nos dejan", "Le canto a la mujer",
  "Yo te extrañaré", "Nadie es eterno en el mundo", "Si no te hubieras ido",
  "Madrecita querida", "Mi amigo el tordillo", "Es la mujer"
].sort();

interface Serenata {
  id: string;
  nombre_cliente?: string;
  telefono?: string;
  nombre_festejada: string;
  motivo: string;
  fecha: string;
  hora: string;
  direccion: string;
  comuna: string;
  tipo: string;
  precio_total: number;
  estado: string;
  canciones?: string[];
}

export default function SerenatasPage() {
  const [serenatas, setSerenatas] = useState<Serenata[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [songSearch, setSongSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

  // Form values
  const [formData, setFormData] = useState({
    nombre_cliente: '',
    telefono: '',
    nombre_festejada: '',
    motivo: '',
    fecha: '',
    hora: '',
    direccion: '',
    comuna: '',
    tipo: 'express',
    precio_total: 25000,
    estado: 'pendiente' as any,
    canciones: [] as string[]
  });

  const songsGrouped = useMemo(() => {
    const groups: Record<string, string[]> = {};
    LISTADO_CANCIONES.forEach(song => {
      const firstLetter = song[0].toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(song);
    });
    return groups;
  }, []);

  const letters = useMemo(() => Object.keys(songsGrouped).sort(), [songsGrouped]);

  const filteredSongs = useMemo(() => {
    if (!songSearch) return null;
    return LISTADO_CANCIONES.filter(s => 
      s.toLowerCase().includes(songSearch.toLowerCase())
    );
  }, [songSearch]);

  useEffect(() => {
    if (!editingId) {
      setFormData(prev => ({ 
        ...prev, 
        precio_total: prev.tipo === 'express' ? 25000 : 40000 
      }));
    }
  }, [formData.tipo, editingId]);

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const res = await fetch(`${apiUrl}/serenatas`);
      if (res.ok) {
        const data = await res.json();
        // Ordenar por fecha y hora
        data.sort((a: any, b: any) => {
          const dateA = new Date(`${a.fecha}T${a.hora}`);
          const dateB = new Date(`${b.fecha}T${b.hora}`);
          return dateB.getTime() - dateA.getTime();
        });
        setSerenatas(data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.type === 'number' ? Number(e.target.value) : e.target.value
    }));
  };

  const toggleSong = (song: string) => {
    setFormData(prev => ({
      ...prev,
      canciones: prev.canciones.includes(song)
        ? prev.canciones.filter(c => c !== song)
        : [...prev.canciones, song]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const url = editingId ? `${apiUrl}/serenatas/${editingId}` : `${apiUrl}/serenatas`;
      
      // Si estamos editando, NO mandamos el estado si queremos preservarlo, 
      // o nos aseguramos de que el formData.estado sea el correcto.
      const payload = { ...formData };
      if (!editingId) {
        payload.estado = 'pendiente';
      }

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchData();
      }
    } catch (error) {
      console.error("Error saving serenata:", error);
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre_cliente: '', telefono: '', nombre_festejada: '', motivo: '', fecha: '', 
      hora: '', direccion: '', comuna: '', tipo: 'express', precio_total: 25000, 
      estado: 'pendiente' as any, canciones: []
    });
    setSongSearch('');
    setActiveLetter(null);
  };

  const handleEdit = (s: Serenata) => {
    setEditingId(s.id);
    setFormData({
      nombre_cliente: s.nombre_cliente || '',
      telefono: s.telefono || '',
      nombre_festejada: s.nombre_festejada,
      motivo: s.motivo,
      fecha: s.fecha,
      hora: s.hora,
      direccion: s.direccion,
      comuna: s.comuna,
      tipo: s.tipo,
      precio_total: s.precio_total,
      estado: s.estado,
      canciones: s.canciones || []
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const downloadPDF = (id: string) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
    window.open(`${apiUrl}/reportes/serenata/${id}`, '_blank');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="hero-title text-3xl md:text-4xl font-bold gold-gradient-text tracking-tighter uppercase">Agenda de Presentaciones</h1>
          <p className="text-white/40 mt-2 font-medium">Gestiona tus eventos en tiempo real.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }}
          className="btn-gold flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus size={20} /> Nueva Serenata
        </button>
      </div>

      {showForm && (
        <div className="glass-card mb-8 animate-in slide-in-from-top-4 border-[var(--accent-gold)]/20 shadow-[0_0_50px_rgba(212,175,55,0.05)]">
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <h2 className="text-xl font-bold text-[var(--accent-gold)] uppercase tracking-wider">
              {editingId ? 'Modificar Serenata' : 'Agendar Serenata'}
            </h2>
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="text-white/30 hover:text-white"><X size={20}/></button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
              {/* Sección Cliente */}
              <div className="space-y-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-[var(--accent-gold)] rounded-full"></div>
                  <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">Datos del Cliente</span>
                </div>
                <div className="group">
                  <label className="label-text">Cliente que contrata</label>
                  <input required type="text" name="nombre_cliente" onChange={handleInputChange} value={formData.nombre_cliente} className="input-field" placeholder="Nombre completo del contratante" />
                </div>
                <div className="group">
                  <label className="label-text">Teléfono contacto</label>
                  <input required type="text" name="telefono" onChange={handleInputChange} value={formData.telefono} className="input-field" placeholder="+569..." />
                </div>
                <div className="group">
                  <label className="label-text">Festejada(o)</label>
                  <input required type="text" name="nombre_festejada" onChange={handleInputChange} value={formData.nombre_festejada} className="input-field" placeholder="¿A quién le cantamos?" />
                </div>
                <div className="group">
                  <label className="label-text">Motivo o Evento</label>
                  <input required type="text" name="motivo" onChange={handleInputChange} value={formData.motivo} className="input-field" placeholder="Ej. Cumpleaños, Aniversario..." />
                </div>
              </div>

              {/* Sección Logística */}
              <div className="space-y-6 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-1 h-4 bg-[var(--accent-gold)] rounded-full"></div>
                  <span className="text-[10px] font-black uppercase text-white/30 tracking-[0.2em]">Logística del Evento</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Fecha</label>
                    <input required type="date" name="fecha" onChange={handleInputChange} value={formData.fecha} className="input-field" />
                  </div>
                  <div>
                    <label className="label-text">Hora</label>
                    <input required type="time" name="hora" onChange={handleInputChange} value={formData.hora} className="input-field" />
                  </div>
                </div>
                <div className="group">
                  <label className="label-text">Dirección Exacta</label>
                  <input required type="text" name="direccion" onChange={handleInputChange} value={formData.direccion} className="input-field" placeholder="Calle, número, depto/casa" />
                </div>
                <div className="group">
                  <label className="label-text">Comuna / Ciudad</label>
                  <input required type="text" name="comuna" onChange={handleInputChange} value={formData.comuna} className="input-field" placeholder="Ej. Los Angeles" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Tipo de Servicio</label>
                    <select name="tipo" onChange={handleInputChange} value={formData.tipo} className="input-field appearance-none bg-black">
                      <option value="express">Express (2 canciones)</option>
                      <option value="full">Full (4 canciones)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Precio Acordado</label>
                    <input required type="number" name="precio_total" onChange={handleInputChange} value={formData.precio_total} className="input-field font-black text-[var(--accent-gold)] text-lg" />
                  </div>
                </div>
              </div>
            </div>

            {/* SECTOR REPERTORIO */}
            <div className="border-t border-white/5 pt-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                   <label className="label-text !mb-1 text-white uppercase tracking-widest text-base">Seleccionar Repertorio</label>
                   <p className="text-[10px] text-white/30 font-bold uppercase tracking-wider">{formData.canciones.length} canciones seleccionadas</p>
                </div>
                <div className="relative w-full md:w-72">
                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                   <input 
                    type="text" 
                    placeholder="Buscar canción..." 
                    value={songSearch}
                    onChange={(e) => {
                      setSongSearch(e.target.value);
                      if (e.target.value) setActiveLetter(null);
                    }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-[var(--accent-gold)] outline-none transition-all" 
                   />
                </div>
              </div>

              {/* Vista de búsqueda */}
              {songSearch ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2 min-h-[100px] max-h-[300px] overflow-y-auto pr-2 custom-scrollbar p-1">
                  {filteredSongs && filteredSongs.length > 0 ? (
                    filteredSongs.map(song => (
                        <SongButton key={song} song={song} isSelected={formData.canciones.includes(song)} onClick={() => toggleSong(song)} />
                    ))
                  ) : (
                    <div className="col-span-full py-8 text-center text-white/20 italic text-sm">No se encontraron canciones con "{songSearch}"</div>
                  )}
                </div>
              ) : (
                /* Vista Alfabética */
                <div className="space-y-3">
                   <div className="flex flex-wrap gap-1.5 pb-2">
                     {letters.map(letter => (
                       <button
                        key={letter}
                        type="button"
                        onClick={() => setActiveLetter(activeLetter === letter ? null : letter)}
                        className={`w-9 h-9 text-sm font-bold rounded-lg border transition-all flex items-center justify-center ${
                          activeLetter === letter 
                            ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black' 
                            : 'bg-white/5 border-white/10 text-white/40 hover:border-white/30'
                        }`}
                       >
                         {letter}
                       </button>
                     ))}
                   </div>
                   
                   {activeLetter && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 animate-in fade-in slide-in-from-top-1 duration-300">
                        {songsGrouped[activeLetter].map(song => (
                           <SongButton key={song} song={song} isSelected={formData.canciones.includes(song)} onClick={() => toggleSong(song)} />
                        ))}
                      </div>
                   )}
                </div>
              )}

              {/* Preview de seleccionadas si no hay nada activo */}
              {!activeLetter && !songSearch && formData.canciones.length > 0 && (
                <div className="mt-6 p-4 bg-[var(--accent-gold)]/5 rounded-xl border border-[var(--accent-gold)]/20">
                  <p className="text-[10px] font-black uppercase text-[var(--accent-gold)] mb-3 tracking-widest flex items-center gap-2">
                    <Music size={12} /> Tu Selección para este evento:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.canciones.map(song => (
                      <div key={song} className="bg-black/40 px-3 py-1.5 rounded-lg border border-[var(--accent-gold)]/30 flex items-center gap-2">
                        <span className="text-xs text-white/90 font-medium">{song}</span>
                        <button type="button" onClick={() => toggleSong(song)} className="text-[var(--accent-gold)] hover:text-white"><X size={12}/></button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row justify-end gap-3 pt-8 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditingId(null); }} 
                className="px-8 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5 font-bold text-xs uppercase tracking-widest transition-all order-2 md:order-1"
              >
                DESCARTAR
              </button>
              <button 
                type="submit" 
                disabled={saving} 
                className="btn-gold flex items-center justify-center gap-3 px-12 py-3 order-1 md:order-2"
              >
                {saving ? (
                  <> <Loader2 size={18} className="animate-spin" /> PROCESANDO... </>
                ) : (
                  <> <CheckCircle size={18} /> {editingId ? 'GUARDAR ACTUALIZACIÓN' : 'CONFIRMAR Y AGENDAR'} </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-[var(--accent-gold)]" size={48} />
            <p className="text-white/30 uppercase tracking-[0.3em] font-black text-xs">Cargando Agenda...</p>
          </div>
        ) : serenatas.length === 0 ? (
          <div className="col-span-full py-20 text-center">
             <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
               <Music size={32} className="text-white/20" />
             </div>
             <p className="text-white/40 font-medium">No hay eventos registrados en la base de datos.</p>
          </div>
        ) : (
          serenatas.map((item) => (
            <div key={item.id} className="glass-card hover:border-[var(--accent-gold)]/40 transition-all group overflow-hidden flex flex-col h-full relative">
              {/* Badge de Estado */}
              <div className="absolute top-0 right-0">
                <div className={`px-4 py-1 text-[9px] font-black uppercase tracking-widest rounded-bl-xl ${
                  item.estado === 'completada' ? 'bg-emerald-500/20 text-emerald-400' : 
                  item.estado === 'pendiente' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {item.estado}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-white/5 rounded-2xl flex flex-col items-center justify-center border border-white/5 group-hover:border-[var(--accent-gold)]/30 transition-all">
                    <span className="text-[10px] font-black text-white/40 uppercase">HRS</span>
                    <span className="text-sm font-black text-[var(--accent-gold)] leading-none">{item.hora.slice(0, 5)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[var(--accent-gold)] transition-colors leading-tight">{item.nombre_festejada}</h3>
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/30 mt-1">{item.motivo}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-8 flex-1">
                <div className="flex items-start gap-3 text-sm text-white/60">
                  <MapPin size={16} className="text-[var(--accent-gold)]/50 mt-0.5 flex-shrink-0" /> 
                  <span className="font-medium leading-tight">{item.direccion}, <span className="text-white/30">{item.comuna}</span></span>
                </div>
                <div className="flex items-center gap-3 text-sm text-white/60">
                  <CalendarIcon size={16} className="text-[var(--accent-gold)]/50 flex-shrink-0" />
                  <span className="font-bold text-white/80">{item.fecha}</span>
                </div>
                {item.nombre_cliente && (
                   <div className="flex items-center gap-3 text-sm text-white/60">
                      <UsersIcon size={16} className="text-[var(--accent-gold)]/50 flex-shrink-0" />
                      <span>{item.nombre_cliente} <span className="text-[10px] opacity-30 tracking-tighter">({item.telefono})</span></span>
                   </div>
                )}
              </div>

              {item.canciones && item.canciones.length > 0 && (
                <div className="bg-black/40 rounded-xl p-4 mb-6 border border-white/5 group-hover:bg-black/60 transition-all">
                   <div className="text-[8px] uppercase font-black text-white/20 mb-3 tracking-[0.2em] flex items-center gap-2">
                      <div className="w-3 h-[1px] bg-white/10"></div> REPERTORIO
                   </div>
                   <div className="flex flex-wrap gap-1.5">
                      {item.canciones.slice(0, 4).map((c, i) => (
                        <span key={i} className="text-[9px] px-2 py-1 bg-white/5 rounded-md text-white/50 border border-white/5 font-medium whitespace-nowrap">
                          {c}
                        </span>
                      ))}
                      {item.canciones.length > 4 && (
                        <span className="text-[9px] px-2 py-1 bg-white/5 rounded-md text-white/30 border border-white/5 font-black">
                          +{item.canciones.length - 4} MÁS
                        </span>
                      )}
                   </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/5 pt-5 mt-auto">
                 <div>
                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest block mb-0.5">Total Acordado</span>
                    <span className="text-xl font-black text-white">${item.precio_total?.toLocaleString()}</span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={() => downloadPDF(item.id)} 
                      className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-red-500/10 rounded-xl text-white/40 hover:text-red-400 border border-white/5 transition-all" 
                      title="Ver Comprobante PDF"
                    >
                       <FileText size={18} />
                    </button>
                    <button 
                      onClick={() => handleEdit(item)} 
                      className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-blue-500/10 rounded-xl text-white/40 hover:text-blue-400 border border-white/5 transition-all"
                      title="Editar Serenata"
                    >
                       <Edit3 size={18} />
                    </button>
                 </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── COMPONENTES AUXILIARES ──

function SongButton({ song, isSelected, onClick }: { song: string, isSelected: boolean, onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-2 text-[11px] rounded-xl border text-left flex items-center justify-between transition-all group/btn ${
        isSelected
          ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black font-bold shadow-[0_4px_12px_rgba(212,175,55,0.2)]'
          : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30 hover:bg-white/10'
      }`}
    >
      <span className="truncate flex-1">{song}</span>
      {isSelected ? <CheckCircle size={12} /> : <Plus size={10} className="text-white/20 group-hover/btn:text-white/60" />}
    </button>
  );
}

function UsersIcon({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

function Edit3({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}
