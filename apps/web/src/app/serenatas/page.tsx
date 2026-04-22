"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, X, Music, CheckCircle, ChevronDown, ListMusic, MapPin, FileText
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

export default function SerenatasPage() {
  const [serenatas, setSerenatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Nuevo: Control del desplegable de canciones
  const [showSongsDropdown, setShowSongsDropdown] = useState(false);
  const [songSearch, setSongSearch] = useState('');

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

  // ESTILOS INLINE PARA MÁXIMA SEGURIDAD (ANTI-CACHE)
  const blockStyle = { display: 'block', width: '100%' };
  const labelStyle = { 
    display: 'block', 
    fontSize: '11px', 
    fontWeight: 'bold', 
    color: '#D4AF37', 
    marginBottom: '10px', // Aumentado para separación total
    letterSpacing: '1.5px',
    textTransform: 'uppercase' as const
  };
  const inputStyle = {
    width: '100%',
    backgroundColor: '#151515',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '14px 18px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none'
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#D4AF37', margin: 0, fontSize: '24px' }}>AGENDA DE PRESENTACIONES</h1>
        <button onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }} className="btn-gold" style={{ padding: '12px 25px' }}>
           {showForm ? 'CANCELAR' : 'NUEVA SERENATA'}
        </button>
      </div>

      {showForm && (
        <div style={{ backgroundColor: '#111', padding: '30px', borderRadius: '24px', border: '1px solid #222', marginBottom: '40px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
          <h2 style={{ color: '#fff', fontSize: '18px', marginBottom: '30px', borderBottom: '1px solid #222', paddingBottom: '15px' }}>
            {editingId ? 'EDITAR EVENTO' : 'REGISTRAR NUEVA SERENATA'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
              
              {/* BLOQUE DATOS CLIENTE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <label style={labelStyle}>NOMBRE DEL CLIENTE (QUE CONTRATA)</label>
                  <input required name="nombre_cliente" value={formData.nombre_cliente} onChange={handleInputChange} style={inputStyle} placeholder="Nombre y Apellido" />
                </div>
                <div>
                  <label style={labelStyle}>NÚMERO DE TELÉFONO</label>
                  <input required name="telefono" value={formData.telefono} onChange={handleInputChange} style={inputStyle} placeholder="+56 9..." />
                </div>
                <div>
                  <label style={labelStyle}>A QUIÉN LE CANTAMOS (FESTEJADA/O)</label>
                  <input required name="nombre_festejada" value={formData.nombre_festejada} onChange={handleInputChange} style={inputStyle} placeholder="Nombre de la cumpleañera/o" />
                </div>
                <div>
                  <label style={labelStyle}>MOTIVO DEL EVENTO</label>
                  <input required name="motivo" value={formData.motivo} onChange={handleInputChange} style={inputStyle} placeholder="Ej: Cumpleaños, Aniversario..." />
                </div>
              </div>

              {/* BLOQUE LOGÍSTICA */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>FECHA</label>
                    <input required type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} style={inputStyle} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>HORA</label>
                    <input required type="time" name="hora" value={formData.hora} onChange={handleInputChange} style={inputStyle} />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>DIRECCIÓN DEL EVENTO</label>
                  <input required name="direccion" value={formData.direccion} onChange={handleInputChange} style={inputStyle} placeholder="Calle y Numero" />
                </div>
                <div>
                  <label style={labelStyle}>COMUNA / CIUDAD</label>
                  <input required name="comuna" value={formData.comuna} onChange={handleInputChange} style={inputStyle} placeholder="Ej: Los Angeles" />
                </div>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>TIPO SERVICIO</label>
                    <select name="tipo" value={formData.tipo} onChange={handleInputChange} style={inputStyle}>
                      <option value="express">Express (2 canciones)</option>
                      <option value="full">Full (4 canciones)</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={labelStyle}>PRECIO TOTAL ($)</label>
                    <input required type="text" name="precio_total" value={formData.precio_total} onChange={handleInputChange} 
                      style={{ ...inputStyle, textAlign: 'right', fontWeight: 'bold', color: '#D4AF37' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN REPERTORIO - MENÚ DESPLEGABLE */}
            <div style={{ marginTop: '40px', borderTop: '1px solid #222', paddingTop: '30px' }}>
              <label style={labelStyle}>REPERTORIO DE CANCIONES ({formData.canciones.length} ELEGIDAS)</label>
              
              <div style={{ position: 'relative' }}>
                {/* Botón que despliega el menú */}
                <button 
                  type="button" 
                  onClick={() => setShowSongsDropdown(!showSongsDropdown)}
                  style={{ ...inputStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                >
                  <span style={{ color: formData.canciones.length > 0 ? '#fff' : '#666' }}>
                    {formData.canciones.length === 0 ? 'Presiona aquí para elegir canciones del repertorio...' : `${formData.canciones.length} canciones seleccionadas`}
                  </span>
                  <ChevronDown size={20} style={{ transform: showSongsDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s' }} />
                </button>

                {/* Menú Desplegable Real */}
                {showSongsDropdown && (
                  <div style={{ 
                    position: 'absolute', top: '100%', left: 0, right: 0, 
                    backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '12px', 
                    marginTop: '10px', padding: '15px', zIndex: 1000, boxShadow: '0 10px 40px rgba(0,0,0,0.8)' 
                  }}>
                    <div style={{ position: 'relative', marginBottom: '15px' }}>
                       <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                       <input 
                        type="text" 
                        placeholder="Filtrar por nombre..." 
                        value={songSearch} 
                        onChange={(e) => setSongSearch(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '40px', backgroundColor: '#000' }}
                       />
                    </div>
                    
                    <div style={{ maxHeight: '250px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
                      {filteredSongs.map(s => {
                        const isSel = formData.canciones.includes(s);
                        return (
                          <div 
                            key={s} 
                            onClick={() => toggleSong(s)}
                            style={{ 
                              padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                              backgroundColor: isSel ? '#D4AF3722' : '#ffffff05',
                              border: isSel ? '1px solid #D4AF37' : '1px solid transparent',
                              color: isSel ? '#D4AF37' : '#888',
                              display: 'flex', alignItems: 'center', gap: '10px'
                            }}
                          >
                            {isSel ? <CheckCircle size={14} /> : <div style={{ width: 14, height: 14, border: '1px solid #444', borderRadius: '4px' }} />}
                            {s}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Vista previa de seleccionadas (fuera del dropdown) */}
              {formData.canciones.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '15px' }}>
                  {formData.canciones.map(s => (
                    <div key={s} style={{ backgroundColor: '#222', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #333' }}>
                       {s} <X size={12} onClick={() => toggleSong(s)} style={{ cursor: 'pointer', color: '#ff6b6b' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end', gap: '15px' }}>
               <button type="submit" disabled={saving} className="btn-gold" style={{ padding: '15px 50px' }}>
                 {saving ? 'PROCESANDO...' : (editingId ? 'GUARDAR CAMBIOS' : 'AGENDAR SERENATA AHORA')}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
         {!loading && serenatas.map(s => (
           <div key={s.id} className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ color: '#D4AF37', fontWeight: 'bold' }}>{s.hora}</span>
                <span style={{ opacity: 0.4, fontSize: '12px' }}>{s.fecha}</span>
              </div>
              <h3 style={{ margin: '0 0 5px 0' }}>{s.nombre_festejada}</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#666', textTransform: 'uppercase' }}>{s.motivo}</p>
              <div style={{ margin: '15px 0', borderTop: '1px solid #222', paddingTop: '15px', color: '#888', fontSize: '13px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}><MapPin size={14} /> {s.direccion}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Music size={14} /> {s.canciones?.length || 0} canciones</div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <span style={{ fontSize: '18px', fontWeight: 'bold' }}>${s.precio_total?.toLocaleString()}</span>
                 <button onClick={() => handleEdit(s)} style={{ backgroundColor: 'transparent', border: '1px solid #333', color: '#fff', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer' }}>EDITAR</button>
              </div>
           </div>
         ))}
      </div>
      
      {/* VERSIÓN PARA CONTROL DE DESPLIEGUE */}
      <div style={{ position: 'fixed', bottom: 10, right: 10, fontSize: '9px', opacity: 0.1 }}>v2.5-final_dropdown</div>
    </div>
  );
}
