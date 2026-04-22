"use client";

import React, { useState, useEffect } from 'react';
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
  Trash2
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
];

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
    canciones: [] as string[]
  });

  useEffect(() => {
    if (!editingId) {
      if (formData.tipo === 'express') {
        setFormData(prev => ({ ...prev, precio_total: 25000 }));
      } else {
        setFormData(prev => ({ ...prev, precio_total: 40000 }));
      }
    }
  }, [formData.tipo, editingId]);

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const res = await fetch(`${apiUrl}/serenatas`);
      if (res.ok) setSerenatas(await res.json());
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
      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
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
      hora: '', direccion: '', comuna: '', tipo: 'express', precio_total: 25000, canciones: []
    });
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="hero-title text-4xl font-bold gold-gradient-text tracking-tighter uppercase">Agenda de Presentaciones</h1>
          <p className="text-white/40 mt-2 font-medium">Gestiona tus eventos en tiempo real.</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={20} /> Nueva Serenata
        </button>
      </div>

      {showForm && (
        <div className="glass-card mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-semibold mb-6 text-[var(--accent-gold)]">
            {editingId ? 'Modificar Serenata' : 'Agendar Serenata'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="group">
                  <label className="label-text">Cliente que contrata</label>
                  <input required type="text" name="nombre_cliente" onChange={handleInputChange} value={formData.nombre_cliente} className="input-field" placeholder="Nombre completo" />
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
                  <label className="label-text">Motivo</label>
                  <input required type="text" name="motivo" onChange={handleInputChange} value={formData.motivo} className="input-field" placeholder="Ej. Cumpleaños" />
                </div>
              </div>

              <div className="space-y-4">
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
                  <label className="label-text">Dirección</label>
                  <input required type="text" name="direccion" onChange={handleInputChange} value={formData.direccion} className="input-field" placeholder="Calle Ejemplo 123" />
                </div>
                <div className="group">
                  <label className="label-text">Comuna</label>
                  <input required type="text" name="comuna" onChange={handleInputChange} value={formData.comuna} className="input-field" placeholder="Ej. Los Angeles" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-text">Tipo</label>
                    <select name="tipo" onChange={handleInputChange} value={formData.tipo} className="input-field appearance-none">
                      <option value="express">Express (2s)</option>
                      <option value="full">Full (4s)</option>
                    </select>
                  </div>
                  <div>
                    <label className="label-text">Precio Acordado</label>
                    <input required type="number" name="precio_total" onChange={handleInputChange} value={formData.precio_total} className="input-field font-bold text-[var(--accent-gold)]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-white/5 pt-6">
              <label className="label-text mb-4">Seleccionar Repertorio ({formData.canciones.length})</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-48 overflow-y-auto pr-2 custom-scrollbar">
                {LISTADO_CANCIONES.map(song => (
                  <button
                    key={song}
                    type="button"
                    onClick={() => toggleSong(song)}
                    className={`px-3 py-2 text-xs rounded-lg border text-left flex items-center justify-between transition-all ${
                      formData.canciones.includes(song) 
                        ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black font-bold' 
                        : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <span className="truncate">{song}</span>
                    {formData.canciones.includes(song) && <CheckCircle size={12} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6">
              <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="px-6 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 font-bold text-sm">CANCELAR</button>
              <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2 px-8">
                {saving ? <Loader2 size={16} className="animate-spin" /> : editingId ? 'GUARDAR CAMBIOS' : 'CONFIRMAR AGENDA'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} /></div>
        ) : serenatas.length === 0 ? (
          <div className="col-span-full py-12 text-center text-white/40">No hay eventos registrados.</div>
        ) : (
          serenatas.map((item) => (
            <div key={item.id} className="glass-card hover:border-white/20 transition-all group overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white group-hover:text-[var(--accent-gold)] transition-colors">{item.nombre_festejada}</h3>
                  <div className="text-[10px] uppercase tracking-widest text-white/40 font-bold flex items-center gap-2">
                    <Music size={10} className="text-[var(--accent-gold)]" /> {item.motivo}
                  </div>
                  {item.nombre_cliente && (
                    <div className="text-xs text-white/60 mt-1 italic">Contrata: {item.nombre_cliente}</div>
                  )}
                </div>
                <div className="bg-[var(--accent-gold)] text-black px-2 py-1 rounded text-xs font-black">
                  {item.hora}
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <MapPin size={14} className="text-[var(--accent-gold)] flex-shrink-0" /> 
                  <span className="truncate">{item.direccion}, {item.comuna}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-white/70">
                  <CalendarIcon size={14} className="text-[var(--accent-gold)] flex-shrink-0" />
                  {item.fecha}
                </div>
                {item.telefono && (
                  <div className="flex items-center gap-2 text-sm text-white/70">
                    <Phone size={14} className="text-[var(--accent-gold)] flex-shrink-0" />
                    {item.telefono}
                  </div>
                )}
              </div>

              {item.canciones && item.canciones.length > 0 && (
                <div className="bg-black/50 rounded-lg p-3 mb-6 border border-white/5">
                   <div className="text-[9px] uppercase font-bold text-white/30 mb-2 flex items-center gap-2">
                      <ListIcon size={10} /> Repertorio Seleccionado
                   </div>
                   <div className="flex flex-wrap gap-1">
                      {item.canciones.map((c, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-white/5 rounded text-white/60 border border-white/5">
                          {c}
                        </span>
                      ))}
                   </div>
                </div>
              )}

              <div className="flex items-center justify-between border-t border-white/10 pt-4">
                 <div className="text-lg font-black text-white">${item.precio_total?.toLocaleString()}</div>
                 <div className="flex gap-2">
                    <button onClick={() => downloadPDF(item.id)} className="p-2 hover:bg-white/10 rounded-lg text-red-500 transition-colors" title="Bajar Comprobante">
                       <FileText size={18} />
                    </button>
                    <button onClick={() => handleEdit(item)} className="p-2 hover:bg-white/10 rounded-lg text-blue-500 transition-colors">
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

function ListIcon({ size }: { size: number }) {
  return <span style={{ width: size, height: size }}>📜</span>;
}

function Edit3({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  );
}
