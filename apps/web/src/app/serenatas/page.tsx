"use client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, X, Music, CheckCircle, ChevronDown, MapPin, FileText } from 'lucide-react';

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
  const [showSongsDropdown, setShowSongsDropdown] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  const [formData, setFormData] = useState({
    nombre_cliente: '', telefono: '', nombre_festejada: '', motivo: '',
    fecha: '', hora: '', direccion: '', comuna: '',
    tipo: 'express', precio_total: 25000, canciones: [] as string[]
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
        setSerenatas(data.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
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

  // ESTILOS DE EMERGENCIA TOTAL v5.0
  const containerStyle: React.CSSProperties = { padding: '20px', maxWidth: '1200px', margin: '0 auto', minHeight: '100vh', background: '#0a0a0a' };
  const labelStyle: React.CSSProperties = { display: 'block', paddingBottom: '12px', fontSize: '13px', fontWeight: 'bold', color: '#D4AF37' };
  const inputStyle: React.CSSProperties = { display: 'block', width: '100%', padding: '16px', borderRadius: '12px', background: '#000', border: '1px solid #444', color: '#fff' };

  return (
    <div style={containerStyle}>
      <div style={{ backgroundColor: '#ff0000', color: '#fff', padding: '15px', fontWeight: 'bold', textAlign: 'center', marginBottom: '20px' }}>
        🚩 VERSÍON 5.0 - REBELDÍA TÉCNICA - SI VES ESTO, SE ACTUALIZÓ 🚩
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#D4AF37', margin: 0, fontSize: '24px' }}>GESTIÓN DE SERENATAS</h1>
        <button onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }} className="btn-gold" style={{ cursor: 'pointer' }}>
           {showForm ? 'OCULTAR' : 'REGISTRAR'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#111', padding: '30px', borderRadius: '20px', border: '1px solid #333', marginBottom: '40px' }}>
           <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div>
                       <label style={labelStyle}>Cliente Contratante</label>
                       <input name="nombre_cliente" value={formData.nombre_cliente} onChange={handleInputChange} style={inputStyle} placeholder="Nombre completo" required />
                    </div>
                    <div>
                       <label style={labelStyle}>Móvil/Teléfono</label>
                       <input name="telefono" value={formData.telefono} onChange={handleInputChange} style={inputStyle} placeholder="+569..." required />
                    </div>
                    <div>
                       <label style={labelStyle}>Nombre de quien recibe</label>
                       <input name="nombre_festejada" value={formData.nombre_festejada} onChange={handleInputChange} style={inputStyle} placeholder="Nombre festeja" required />
                    </div>
                 </div>

                 <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Día</label>
                          <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} style={inputStyle} required />
                        </div>
                        <div style={{ flex: 1 }}>
                          <label style={labelStyle}>Hora</label>
                          <input type="time" name="hora" value={formData.hora} onChange={handleInputChange} style={inputStyle} required />
                        </div>
                    </div>
                    <div>
                       <label style={labelStyle}>Lugar del evento</label>
                       <input name="direccion" value={formData.direccion} onChange={handleInputChange} style={inputStyle} placeholder="Dirección precisa" required />
                    </div>
                 </div>
              </div>

              {/* DROPDOWN REAL DE CANCIONES */}
              <div style={{ marginTop: '30px', borderTop: '1px solid #222', paddingTop: '30px' }}>
                 <label style={labelStyle}>ELECCIÓN DE CANCIONES ({formData.canciones.length})</label>
                 <div style={{ position: 'relative' }}>
                    <div 
                      onClick={() => setShowSongsDropdown(!showSongsDropdown)}
                      style={{ ...inputStyle, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                       <span>{formData.canciones.length === 0 ? '--- HACER CLIC PARA DESPLEGAR EL REPERTORIO ---' : `${formData.canciones.length} seleccionadas`}</span>
                       <ChevronDown size={18} />
                    </div>

                    {showSongsDropdown && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#1a1a1a', border: '1px solid #444', borderRadius: '15px', padding: '15px', zIndex: 100, marginTop: '5px' }}>
                         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px', maxHeight: '250px', overflowY: 'auto' }}>
                            {LISTADO_CANCIONES.map(s => {
                              const isSel = formData.canciones.includes(s);
                              return (
                                <div key={s} onClick={() => toggleSong(s)} style={{ padding: '8px', borderRadius: '8px', background: isSel ? '#D4AF37' : '#222', color: isSel ? '#000' : '#888', cursor: 'pointer', fontSize: '12px', fontWeight: isSel ? 'bold' : 'normal' }}>
                                   {s}
                                </div>
                              );
                            })}
                         </div>
                      </div>
                    )}
                 </div>
              </div>

              <div style={{ marginTop: '40px', textAlign: 'right' }}>
                 <button type="submit" disabled={saving} className="btn-gold" style={{ padding: '15px 40px', fontWeight: 'bold' }}>
                   {saving ? 'GUARDANDO...' : 'CONFIRMAR SERENATA'}
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* LISTADO SIMPLE */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
         {serenatas.map(s => (
           <div key={s.id} style={{ background: '#111', padding: '20px', borderRadius: '15px', border: '1px solid #222' }}>
              <div style={{ fontSize: '11px', color: '#D4AF37', marginBottom: '8px' }}>{s.fecha} - {s.hora}</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{s.nombre_festejada}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{s.motivo}</div>
           </div>
         ))}
      </div>
    </div>
  );
}
