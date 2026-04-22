"use client";

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
      const res = await fetch(`${apiUrl}/serenatas`);
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

  // ESTILOS DE EMERGENCIA TOTAL (PARA QUE NO HAYA DUDA)
  const containerStyle = { padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' };
  const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '800', color: '#D4AF37', marginBottom: '15px', textTransform: 'uppercase' as const };
  const inputStyle = { width: '100%', backgroundColor: '#000', border: '2px solid #D4AF37', borderRadius: '15px', padding: '16px', color: '#fff', fontSize: '16px' };

  return (
    <div style={containerStyle}>
      {/* BANNER INCONFUNDIBLE */}
      <div style={{ backgroundColor: '#D4AF37', color: '#000', padding: '20px', textAlign: 'center', fontWeight: '900', borderRadius: '20px', border: '4px solid #fff', marginBottom: '40px', fontSize: '24px' }}>
        💎 VERSIÓN 4.0 - SISTEMA ACTUALIZADO 💎
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#D4AF37', fontSize: '32px', margin: 0 }}>PRESENTACIONES</h1>
        <button onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }} className="btn-gold" style={{ padding: '15px 30px' }}>
          {showForm ? 'VOLVER ATRÁS' : 'AGENDAR AHORA'}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#000', padding: '40px', borderRadius: '30px', border: '1px solid #D4AF37', marginBottom: '50px' }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '40px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div>
                   <label style={labelStyle}>Cliente Contratante (Nombre)</label>
                   <input required name="nombre_cliente" value={formData.nombre_cliente} onChange={handleInputChange} style={inputStyle} placeholder="Escribe el nombre aquí..." />
                </div>
                <div>
                   <label style={labelStyle}>Teléfono de la persona</label>
                   <input required name="telefono" value={formData.telefono} onChange={handleInputChange} style={inputStyle} placeholder="+569..." />
                </div>
                <div>
                   <label style={labelStyle}>Nombre de quien recibe la serenata</label>
                   <input required name="nombre_festejada" value={formData.nombre_festejada} onChange={handleInputChange} style={inputStyle} placeholder="Nombre completo" />
                </div>
                <div>
                   <label style={labelStyle}>Evento o Motivo</label>
                   <input required name="motivo" value={formData.motivo} onChange={handleInputChange} style={inputStyle} placeholder="Ej. Boda" />
                </div>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                 <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                       <label style={labelStyle}>Día</label>
                       <input required type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} style={inputStyle} />
                    </div>
                    <div style={{ flex: 1 }}>
                       <label style={labelStyle}>Hora exacta</label>
                       <input required type="time" name="hora" value={formData.hora} onChange={handleInputChange} style={inputStyle} />
                    </div>
                 </div>
                 <div>
                    <label style={labelStyle}>Lugar (Dirección)</label>
                    <input required name="direccion" value={formData.direccion} onChange={handleInputChange} style={inputStyle} placeholder="Calle y número" />
                 </div>
                 <div>
                    <label style={labelStyle}>Ciudad / Comuna</label>
                    <input required name="comuna" value={formData.comuna} onChange={handleInputChange} style={inputStyle} placeholder="Ej. Temuco" />
                 </div>
                 <div style={{ display: 'flex', gap: '20px' }}>
                    <div style={{ flex: 1 }}>
                       <label style={labelStyle}>Servicio</label>
                       <select name="tipo" value={formData.tipo} onChange={handleInputChange} style={inputStyle}>
                          <option value="express">Express (2s)</option>
                          <option value="full">Full (4s)</option>
                       </select>
                    </div>
                    <div style={{ flex: 1 }}>
                       <label style={labelStyle}>Valor Acordado ($)</label>
                       <input required name="precio_total" value={formData.precio_total} onChange={handleInputChange} style={{ ...inputStyle, textAlign: 'right', color: '#D4AF37', fontWeight: 'bold' }} />
                    </div>
                 </div>
              </div>
            </div>

            {/* REPERTORIO DESPLEGABLE (SOLICITUD DEL USUARIO) */}
            <div style={{ marginTop: '50px', borderTop: '2px solid #D4AF37', paddingTop: '40px' }}>
               <label style={labelStyle}>CANCIONES DEL REPERTORIO ({formData.canciones.length} SELECCIONADAS)</label>
               
               <div style={{ position: 'relative' }}>
                  <button 
                    type="button" 
                    onClick={() => setShowSongsDropdown(!showSongsDropdown)}
                    style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                  >
                    <span>{formData.canciones.length === 0 ? '-- HAZ CLIC AQUÍ PARA DESPLEGAR CANCIONES --' : `${formData.canciones.length} canciones elegidas`}</span>
                    <ChevronDown size={24} style={{ transform: showSongsDropdown ? 'rotate(180deg)' : 'none', transition: '0.3s' }} />
                  </button>

                  {showSongsDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#111', border: '2px solid #D4AF37', borderRadius: '20px', padding: '20px', zIndex: 9999, marginTop: '10px', boxShadow: '0 30px 60px rgba(0,0,0,0.9)' }}>
                       <div style={{ position: 'relative', marginBottom: '20px' }}>
                          <Search size={20} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                          <input type="text" placeholder="Buscar por nombre..." value={songSearch} onChange={(e) => setSongSearch(e.target.value)} style={{ ...inputStyle, paddingLeft: '50px', backgroundColor: '#000', fontSize: '14px' }} />
                       </div>
                       <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
                          {filteredSongs.map(s => {
                            const isSelected = formData.canciones.includes(s);
                            return (
                              <div key={s} onClick={() => toggleSong(s)} style={{ padding: '12px', borderRadius: '10px', backgroundColor: isSelected ? '#D4AF3733' : '#ffffff05', color: isSelected ? '#D4AF37' : '#999', border: isSelected ? '1px solid #D4AF37' : '1px solid #333', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                                {isSelected ? <CheckCircle size={16} /> : <div style={{ width: 16, height: 16, border: '1px solid #444', borderRadius: '4px' }} />}
                                {s}
                              </div>
                            );
                          })}
                       </div>
                    </div>
                  )}
               </div>

               {/* Pre-visualización rápida */}
               {formData.canciones.length > 0 && (
                 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '20px' }}>
                    {formData.canciones.map(s => (
                      <div key={s} style={{ backgroundColor: '#D4AF3711', border: '1px solid #D4AF37', padding: '8px 15px', borderRadius: '10px', fontSize: '12px', color: '#fff', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {s} <X size={14} onClick={() => toggleSong(s)} style={{ cursor: 'pointer', color: '#D4AF37' }} />
                      </div>
                    ))}
                 </div>
               )}
            </div>

            <div style={{ marginTop: '50px', display: 'flex', justifyContent: 'center' }}>
               <button type="submit" disabled={saving} className="btn-gold" style={{ padding: '20px 80px', fontSize: '18px', fontWeight: 'bold' }}>
                  {saving ? 'GUARDANDO...' : (editingId ? 'ACTUALIZAR DATOS' : 'CONFIRMAR SERENATA')}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTA */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '25px' }}>
        {!loading && serenatas.map(s => (
          <div key={s.id} style={{ backgroundColor: '#ffffff02', border: '1px solid #ffffff11', borderRadius: '25px', padding: '25px', transition: '0.3s' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ color: '#D4AF37', fontWeight: '900' }}>{s.hora}</span>
                <span style={{ color: '#666', fontSize: '12px' }}>{s.fecha}</span>
             </div>
             <h3 style={{ fontSize: '20px', color: '#fff', margin: '0 0 5px 0' }}>{s.nombre_festejada}</h3>
             <p style={{ margin: 0, fontSize: '12px', color: '#D4AF37', fontWeight: 'bold' }}>{s.motivo}</p>
             <div style={{ margin: '20px 0', fontSize: '14px', color: '#888' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}><MapPin size={16} /> {s.direccion}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}><Music size={16} /> {s.canciones?.length || 0} canciones</div>
             </div>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #ffffff05', paddingTop: '20px' }}>
                <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#fff' }}>${s.precio_total?.toLocaleString()}</span>
                <button onClick={() => handleEdit(s)} style={{ backgroundColor: 'transparent', border: '1px solid #444', color: '#888', padding: '8px 15px', borderRadius: '10px', cursor: 'pointer' }}>DETALLES</button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}
