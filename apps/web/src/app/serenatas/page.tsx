"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, Music, CheckCircle, ChevronDown, MapPin, FileText, Send, Phone, Trash2, Clock } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

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

export default function SerenatasPage() {
  const searchParams = useSearchParams();
  const estadoFilter = searchParams.get('estado') || 'confirmada'; // Default to active ones

  const [serenatas, setSerenatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSongsDropdown, setShowSongsDropdown] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  const [formData, setFormData] = useState({
    nombre_cliente: '', telefono: '', nombre_festejada: '', motivo: '',
    fecha: '', hora: '', direccion: '', comuna: '',
    tipo: 'express', precio_total: 25000, canciones: [] as string[],
    estado: 'confirmada'
  });

  const filteredSongs = useMemo(() => {
    return LISTADO_CANCIONES.filter(s => s.toLowerCase().includes(songSearch.toLowerCase()));
  }, [songSearch]);

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const res = await fetch(`${apiUrl}/serenatas`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Filter by state
        const filtered = data.filter((s: any) => s.estado === estadoFilter);
        setSerenatas(filtered.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [estadoFilter]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'tipo') {
       const newPrice = value === 'express' ? 25000 : 45000;
       setFormData(prev => ({ ...prev, tipo: value, precio_total: newPrice, canciones: [] }));
    } else {
       setFormData(prev => ({ ...prev, [name]: name === 'precio_total' ? Number(value) : value }));
    }
  };

  const toggleSong = (s: string) => {
    const limit = formData.tipo === 'express' ? 2 : 4;
    const isSelected = formData.canciones.includes(s);

    if (!isSelected && formData.canciones.length >= limit) {
       alert(`La serenata ${formData.tipo.toUpperCase()} solo permite ${limit} canciones.`);
       return;
    }

    setFormData(prev => ({
      ...prev,
      canciones: isSelected ? prev.canciones.filter(c => c !== s) : [...prev.canciones, s]
    }));
    
    // Al seleccionar, limpiamos búsqueda para volver a la lista total
    setSongSearch('');
  };

  const resetForm = () => {
    setFormData({
      nombre_cliente: '', telefono: '', nombre_festejada: '', motivo: '',
      fecha: '', hora: '', direccion: '', comuna: '',
      tipo: 'express', precio_total: 25000, canciones: [], estado: 'confirmada'
    });
    setSongSearch('');
    setShowSongsDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const url = editingId ? `${apiUrl}/serenatas/${editingId}` : `${apiUrl}/serenatas`;
      await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      setShowForm(false); setEditingId(null); resetForm(); fetchData();
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleFinalizar = async (id: string) => {
     if(!confirm("¿Deseas finalizar esta serenata? Se moverá al historial.")) return;
     try {
       const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
       await fetch(`${apiUrl}/serenatas/${id}`, {
         method: 'PUT',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ estado: 'finalizada' })
       });
       fetchData();
     } catch (e) { console.error(e); }
  }

  const handleWhatsApp = (s: any) => {
    const repertorio = s.canciones && s.canciones.length > 0 
      ? s.canciones.map((c: string, i: number) => `${i + 1}.- ${c}`).join('\n')
      : 'Pendiente de definir';

    const mensaje = `*CONFIRMACIÓN DE SERENATA - EL MARIACHI AVENTURERO* 🎻🇲🇽

Hola *${s.nombre_cliente}*, confirmamos el servicio para:

📅 *Fecha:* ${s.fecha}
⏰ *Hora:* ${s.hora} hrs
📍 *Lugar:* ${s.direccion}, ${s.comuna}
👤 *Para:* ${s.nombre_festejada} (${s.motivo})

🎵 *REPERTORIO SELECCIONADO:*
${repertorio}

💰 *Valor Total:* $${s.precio_total.toLocaleString()}

*¡Muchas gracias por su preferencia!* Quedamos atentos a cualquier duda.`;

    const encoded = encodeURIComponent(mensaje);
    window.open(`https://wa.me/${s.telefono.replace(/\+/g, '')}?text=${encoded}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
        <div>
          <h1 className="hero-title text-2xl md:text-3xl font-bold gold-gradient-text tracking-tighter">
            {estadoFilter === 'finalizada' ? 'SERENATAS FINALIZADAS' : 'GESTIÓN DE SERENATAS'}
          </h1>
          <p className="text-white/40 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">
             {serenatas.length} {serenatas.length === 1 ? 'evento encontrado' : 'eventos encontrados'}
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }} className="btn-gold px-6">
           {showForm ? <X size={20} /> : <Plus size={20} />}
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-in slide-in-from-top-4 duration-500 border border-[var(--accent-gold)]/20 shadow-2xl">
           <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* DATOS DEL CLIENTE */}
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-[var(--accent-gold)] tracking-[0.3em] border-l-2 border-[var(--accent-gold)] pl-3">DATOS GENERALES</h3>
                    <div>
                       <label className="label-text">Cliente Contratante</label>
                       <input name="nombre_cliente" value={formData.nombre_cliente} onChange={handleInputChange} className="input-field" placeholder="Nombre completo" required />
                    </div>
                    <div>
                       <label className="label-text">Teléfono WhatsApp</label>
                       <input name="telefono" value={formData.telefono} onChange={handleInputChange} className="input-field" placeholder="+569..." required />
                    </div>
                    <div>
                       <label className="label-text">Nombre de Festejada/o</label>
                       <input name="nombre_festejada" value={formData.nombre_festejada} onChange={handleInputChange} className="input-field" placeholder="¿Para quién es la sorpresa?" required />
                    </div>
                    <div>
                       <label className="label-text">Motivo del Evento</label>
                       <input name="motivo" value={formData.motivo} onChange={handleInputChange} className="input-field" placeholder="Cumpleaños, Aniversario, etc." required />
                    </div>
                 </div>

                 {/* DETALLES DEL EVENTO */}
                 <div className="space-y-6">
                    <h3 className="text-xs font-black text-[var(--accent-gold)] tracking-[0.3em] border-l-2 border-[var(--accent-gold)] pl-3">LOGÍSTICA</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label-text">Fecha</label>
                          <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                          <label className="label-text">Hora</label>
                          <input type="time" name="hora" value={formData.hora} onChange={handleInputChange} className="input-field" required />
                        </div>
                    </div>
                    <div>
                        <label className="label-text">Tipo de Serenata</label>
                        <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="input-field bg-black font-bold text-[var(--accent-gold)] uppercase tracking-widest">
                           <option value="express">Express (2 canciones) - $25.000</option>
                           <option value="full">Full (4 canciones) - $45.000</option>
                        </select>
                    </div>
                    <div>
                       <label className="label-text">Dirección</label>
                       <input name="direccion" value={formData.direccion} onChange={handleInputChange} className="input-field" placeholder="Calle y número" required />
                    </div>
                    <div>
                       <label className="label-text">Comuna</label>
                       <input name="comuna" value={formData.comuna} onChange={handleInputChange} className="input-field" placeholder="Ej. Concepción" required />
                    </div>
                 </div>
              </div>

              {/* SELECCIÓN DE CANCIONES */}
              <div className="space-y-4 pt-4 border-t border-white/5">
                 <div className="flex justify-between items-center">
                    <h3 className="text-xs font-black text-[var(--accent-gold)] tracking-[0.3em]">REPERTORIO ({formData.canciones.length} de {formData.tipo === 'express' ? 2 : 4})</h3>
                    <button type="button" onClick={() => setShowSongsDropdown(!showSongsDropdown)} className="text-[var(--accent-gold)] text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                       {showSongsDropdown ? 'Cerrar Lista' : 'Modificar canciones'} <ChevronDown size={14} className={showSongsDropdown ? 'rotate-180' : ''} />
                    </button>
                 </div>
                 
                 <div className="flex flex-wrap gap-2">
                    {formData.canciones.length === 0 ? (
                       <p className="text-white/20 text-xs italic">Ninguna canción seleccionada aún.</p>
                    ) : (
                       formData.canciones.map(s => (
                          <span key={s} className="px-3 py-1 rounded-full bg-[var(--accent-gold)] text-black text-[10px] font-black uppercase flex items-center gap-2">
                             {s} <X size={12} className="cursor-pointer" onClick={() => toggleSong(s)} />
                          </span>
                       ))
                    )}
                 </div>

                 {showSongsDropdown && (
                   <div className="bg-[#080808] border border-white/10 rounded-2xl p-6 space-y-4 shadow-inner">
                      <div className="relative">
                         <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={16} />
                         <input 
                           value={songSearch}
                           onChange={(e) => setSongSearch(e.target.value)}
                           className="input-field pl-12 bg-black border-white/5" 
                           placeholder="Buscar canción en el catálogo..." 
                         />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 overflow-y-auto max-h-[300px] pr-2 scrollbar-thin scrollbar-thumb-white/10">
                         {filteredSongs.map(s => {
                           const isSel = formData.canciones.includes(s);
                           return (
                             <div 
                               key={s} 
                               onClick={() => toggleSong(s)} 
                               className={`p-3 rounded-xl border border-white/5 cursor-pointer transition-all flex items-center gap-3 ${isSel ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black font-bold' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                             >
                                <Music size={14} className={isSel ? 'opacity-100' : 'opacity-20'} />
                                <span className="text-xs uppercase tracking-tight line-clamp-1">{s}</span>
                                {isSel && <CheckCircle size={14} className="ml-auto" />}
                             </div>
                           );
                         })}
                      </div>
                   </div>
                 )}
              </div>

              <div className="flex justify-end pt-8 border-t border-white/5">
                 <button type="submit" disabled={saving} className="btn-gold py-5 px-12 group">
                   {saving ? <Loader2 className="animate-spin" /> : (
                      <span className="flex items-center gap-3 font-black tracking-[0.2em]">
                         {editingId ? 'ACTUALIZAR DATOS' : 'CONFIRMAR RESERVA'}
                      </span>
                   )}
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* LISTADO DE SERENATAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {loading ? (
           <div className="col-span-full py-20 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={40} /></div>
         ) : serenatas.length === 0 ? (
           <div className="col-span-full py-20 text-center text-white/20 font-medium bg-black/20 rounded-3xl border border-dashed border-white/5">
              No hay serenatas en esta sección.
           </div>
         ) : (
           serenatas.map(s => (
             <div key={s.id} className="glass-card flex flex-col group hover:border-[var(--accent-gold)]/40 transition-all duration-500">
                <div className="flex justify-between items-start mb-6">
                   <div className="p-3 rounded-2xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex flex-col items-center">
                      <span className="text-[10px] text-white/40 uppercase font-black tracking-widest">{s.fecha.split('-').reverse().slice(0,2).join('/')}</span>
                      <span className="text-xl font-black text-white">{s.hora?.slice(0,5)}</span>
                   </div>
                   <div className="flex gap-2">
                      <button onClick={() => handleWhatsApp(s)} className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all">
                         <Send size={18} />
                      </button>
                      {estadoFilter !== 'finalizada' && (
                        <button onClick={() => handleFinalizar(s.id)} className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all">
                           <CheckCircle size={18} />
                        </button>
                      )}
                   </div>
                </div>

                <div className="space-y-1 mb-6">
                   <div className="flex items-center gap-2 text-[var(--accent-gold)] font-bold text-[10px] uppercase tracking-[0.2em]">
                      <Music size={12} /> {s.tipo}
                   </div>
                   <h2 className="text-xl font-bold text-white group-hover:text-[var(--accent-gold)] transition-colors">{s.nombre_festejada}</h2>
                   <p className="text-[11px] text-white/30 uppercase font-black">{s.motivo}</p>
                </div>

                <div className="mt-auto space-y-4">
                   <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3 border border-white/5">
                      <MapPin size={16} className="text-[var(--accent-gold)]" />
                      <div className="text-[11px]">
                         <p className="font-bold text-white/80">{s.direccion}</p>
                         <p className="text-white/40 font-medium uppercase tracking-tighter">{s.comuna}</p>
                      </div>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <div className="text-2xl font-black text-white">$ {s.precio_total?.toLocaleString()}</div>
                      <button onClick={() => {
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
                          canciones: s.canciones || [],
                          estado: s.estado || 'confirmada'
                        });
                        setShowForm(true);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }} className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] hover:text-[var(--accent-gold)] transition-colors">
                        Editar Datos
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
