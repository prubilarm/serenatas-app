"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  X, 
  Music, 
  CheckCircle, 
  Loader2,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  FileText
} from 'lucide-react';

// LISTA DE CANCIONES
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
  const [serenatas, setSerenatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Filtros de canciones
  const [songSearch, setSongSearch] = useState('');
  const [activeLetter, setActiveLetter] = useState<string | null>(null);

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

  // Agrupación por letra
  const groupedSongs = useMemo(() => {
    const groups: Record<string, string[]> = {};
    LISTADO_CANCIONES.forEach(s => {
      const L = s[0].toUpperCase();
      if (!groups[L]) groups[L] = [];
      groups[L].push(s);
    });
    return groups;
  }, []);

  const letters = useMemo(() => Object.keys(groupedSongs).sort(), [groupedSongs]);

  const filteredSongs = useMemo(() => {
    if (!songSearch) return null;
    return LISTADO_CANCIONES.filter(s => s.toLowerCase().includes(songSearch.toLowerCase()));
  }, [songSearch]);

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const res = await fetch(`${apiUrl}/serenatas`);
      if (res.ok) {
        const data = await res.json();
        setSerenatas(data.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'precio_total' ? Number(value) : value }));
  };

  const toggleSong = (s: string) => {
    setFormData(prev => ({
      ...prev,
      canciones: prev.canciones.includes(s) ? prev.canciones.filter(c => c !== s) : [...prev.canciones, s]
    }));
  };

  const resetForm = () => {
    setFormData({
      nombre_cliente: '', telefono: '', nombre_festejada: '', motivo: '',
      fecha: '', hora: '', direccion: '', comuna: '',
      tipo: 'express', precio_total: 25000, canciones: []
    });
    setSongSearch('');
    setActiveLetter(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const url = editingId ? `${apiUrl}/serenatas/${editingId}` : `${apiUrl}/serenatas`;
      const res = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowForm(false);
        setEditingId(null);
        resetForm();
        fetchData();
      }
    } catch (e) { console.error(e); }
    finally { setSaving(false); }
  };

  const handleEdit = (s: any) => {
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

  // ESTILOS INLINE PARA EVITAR FALLOS DE CSS/CACHE
  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#D4AF37',
    textTransform: 'uppercase',
    marginBottom: '8px',
    letterSpacing: '1px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#fff',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box'
  };

  return (
    <div style={{ paddingBottom: '100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 className="hero-title" style={{ fontSize: '28px', color: '#D4AF37' }}>AGENDA DE SERENATAS</h1>
        <button onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }} className="btn-gold">
          {showForm ? 'CANCELAR' : 'NUEVA SERENATA'}
        </button>
      </div>

      {showForm && (
        <div className="glass-card" style={{ marginBottom: '40px', border: '1px solid #D4AF3733' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', marginBottom: '30px' }}>
              
              {/* COLUMNA 1: CLIENTE */}
              <div style={{ backgroundColor: '#ffffff03', padding: '20px', borderRadius: '15px' }}>
                <p style={{ ...labelStyle, fontSize: '10px', color: '#666', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '20px' }}>1. DATOS DEL CLIENTE</p>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Cliente que contrata</label>
                  <input required name="nombre_cliente" value={formData.nombre_cliente} onChange={handleInputChange} style={inputStyle} placeholder="Nombre completo" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Teléfono contacto</label>
                  <input required name="telefono" value={formData.telefono} onChange={handleInputChange} style={inputStyle} placeholder="+569..." />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Nombre Festejada(o)</label>
                  <input required name="nombre_festejada" value={formData.nombre_festejada} onChange={handleInputChange} style={inputStyle} placeholder="¿Para quién es?" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Motivo</label>
                  <input required name="motivo" value={formData.motivo} onChange={handleInputChange} style={inputStyle} placeholder="Ej. Cumpleaños" />
                </div>
              </div>

              {/* COLUMNA 2: LOGÍSTICA */}
              <div style={{ backgroundColor: '#ffffff03', padding: '20px', borderRadius: '15px' }}>
                <p style={{ ...labelStyle, fontSize: '10px', color: '#666', borderBottom: '1px solid #222', paddingBottom: '10px', marginBottom: '20px' }}>2. LOGÍSTICA Y PRECIO</p>
                
                <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Fecha</label>
                    <input required type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>Hora</label>
                    <input required type="time" name="hora" value={formData.hora} onChange={handleInputChange} style={inputStyle} />
                  </div>
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Dirección</label>
                  <input required name="direccion" value={formData.direccion} onChange={handleInputChange} style={inputStyle} placeholder="Calle y número" />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={labelStyle}>Comuna</label>
                  <input required name="comuna" value={formData.comuna} onChange={handleInputChange} style={inputStyle} placeholder="Ej. Los Angeles" />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                   <div style={{ flex: 1 }}>
                     <label style={labelStyle}>Tipo</label>
                     <select name="tipo" value={formData.tipo} onChange={handleInputChange} style={inputStyle}>
                       <option value="express">Express (2s)</option>
                       <option value="full">Full (4s)</option>
                     </select>
                   </div>
                   <div style={{ flex: 1 }}>
                     <label style={labelStyle}>Precio Acordado</label>
                     <input required type="number" name="precio_total" value={formData.precio_total} onChange={handleInputChange} 
                      style={{ ...inputStyle, textAlign: 'right', fontWeight: 'bold', color: '#D4AF37', fontSize: '18px' }} />
                   </div>
                </div>
              </div>
            </div>

            {/* SECTOR REPERTORIO (MEJORADO) */}
            <div style={{ borderTop: '1px solid #222', paddingTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 style={{ ...labelStyle, fontSize: '16px', marginBottom: '4px' }}>SELECCIONAR CANCIONES</h3>
                  <p style={{ fontSize: '11px', color: '#666', fontWeight: 'bold' }}>{formData.canciones.length} SELECCIONADAS</p>
                </div>
                <div style={{ position: 'relative', width: '300px' }}>
                  <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#D4AF37' }} />
                  <input 
                    type="text" 
                    placeholder="Buscar canción..." 
                    value={songSearch} 
                    onChange={(e) => { setSongSearch(e.target.value); if(e.target.value) setActiveLetter(null); }}
                    style={{ ...inputStyle, paddingLeft: '40px' }}
                  />
                </div>
              </div>

              {/* Botones de Letras */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {letters.map(L => (
                  <button 
                    key={L} 
                    type="button" 
                    onClick={() => setActiveLetter(activeLetter === L ? null : L)}
                    style={{
                      width: '36px', height: '36px', border: '1px solid #333', borderRadius: '8px',
                      backgroundColor: activeLetter === L ? '#D4AF37' : '#111',
                      color: activeLetter === L ? '#000' : '#fff',
                      fontWeight: 'bold', cursor: 'pointer'
                    }}
                  >
                    {L}
                  </button>
                ))}
              </div>

              {/* Lista de Canciones */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px', height: '240px', overflowY: 'auto', padding: '10px', backgroundColor: '#00000033', borderRadius: '12px' }}>
                {songSearch ? (
                  filteredSongs?.map(s => (
                    <SongItem key={s} song={s} selected={formData.canciones.includes(s)} onToggle={() => toggleSong(s)} />
                  ))
                ) : activeLetter ? (
                  groupedSongs[activeLetter].map(s => (
                    <SongItem key={s} song={s} selected={formData.canciones.includes(s)} onToggle={() => toggleSong(s)} />
                  ))
                ) : (
                  <div style={{ gridColumn: '1/-1', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#444', fontSize: '13px' }}>
                    Selecciona una letra o usa el buscador para ver las canciones
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
               <button type="submit" disabled={saving} className="btn-gold" style={{ padding: '15px 40px' }}>
                 {saving ? 'GUARDANDO...' : (editingId ? 'ACTUALIZAR SERENATA' : 'CONFIRMAR AGENDAMIENTO')}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO DE SERENATAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {loading ? (
           <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>Cargando agenda...</div>
        ) : serenatas.map(s => (
          <div key={s.id} className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
               <span style={{ backgroundColor: '#D4AF3722', color: '#D4AF37', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>{s.hora}</span>
               <span style={{ color: '#666', fontSize: '11px' }}>{s.fecha}</span>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '5px' }}>{s.nombre_festejada}</h3>
            <p style={{ fontSize: '11px', color: '#D4AF37', marginBottom: '15px', textTransform: 'uppercase' }}>{s.motivo}</p>
            
            <div style={{ marginBottom: '15px', fontSize: '13px', color: '#888' }}>
               <div style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}><MapPin size={14}/> {s.direccion}</div>
               <div style={{ display: 'flex', gap: '8px' }}><FileText size={14}/> {s.tipo === 'full' ? 'Serenata 4 canciones' : 'Serenata Express'}</div>
            </div>

            <div style={{ borderTop: '1px solid #222', paddingTop: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
               <span style={{ fontWeight: 'bold', fontSize: '16px' }}>${s.precio_total?.toLocaleString()}</span>
               <button onClick={() => handleEdit(s)} style={{ backgroundColor: 'transparent', border: '1px solid #333', color: '#888', padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>EDITAR</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SongItem({ song, selected, onToggle }: any) {
  return (
    <div 
      onClick={onToggle}
      style={{
        padding: '10px', borderRadius: '8px', border: '1px solid',
        borderColor: selected ? '#D4AF37' : '#222',
        backgroundColor: selected ? '#D4AF3711' : '#111',
        cursor: 'pointer', fontSize: '11px', color: selected ? '#D4AF37' : '#999',
        display: 'flex', alignItems: 'center', gap: '8px'
      }}
    >
      {selected ? <CheckCircle size={14}/> : <div style={{ width: 14, height: 14, border: '1px solid #444', borderRadius: '4px' }}/>}
      {song}
    </div>
  );
}
