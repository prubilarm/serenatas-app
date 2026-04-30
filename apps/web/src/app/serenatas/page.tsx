"use client";

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { Plus, Search, X, Music, CheckCircle, ChevronDown, MapPin, FileText, Send, Phone, Trash2, Clock, MessageCircle, RotateCcw, Loader2, Pencil, Wallet, Users, ChevronRight, Star } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import jsPDF from 'jspdf';
import { COMUNAS, predecirComuna } from '../../lib/comunas';

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

function SerenatasContent() {
  const searchParams = useSearchParams();
  const estadoFilter = searchParams.get('estado') || 'confirmada'; 

  const [serenatas, setSerenatas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showSongsDropdown, setShowSongsDropdown] = useState(false);
  const [songSearch, setSongSearch] = useState('');

  // Modal para finalizar con pago
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [pagoData, setPagoData] = useState({ id: '', monto: 0, metodo: 'transferencia' });

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
        const filtered = data.filter((s: any) => s.estado === estadoFilter);
        setSerenatas(filtered.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()));
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [estadoFilter]);

  useEffect(() => {
    if (searchParams.get('nueva') === 'true') {
      setShowForm(true);
      resetForm();
    }
  }, [searchParams]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (name === 'direccion') {
      const pred = predecirComuna(value);
      setFormData(prev => ({ ...prev, direccion: value, comuna: pred || prev.comuna }));
    } else if (name === 'tipo') {
       const newPrice = value === 'express' ? 25000 : 40000;
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
      
      // DEBUG: Verificamos a qué URL estamos pegando
      console.log('Intentando fetch a:', url);

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Error al guardar la serenata');
      }

      const savedData = await response.json();
      
      // Si es una nueva serenata, preguntamos si quiere el PDF de confirmación
      if (!editingId) {
        if (confirm("✔ Serenata guardada con éxito. ¿Deseas generar el PDF de confirmación ahora?")) {
          generatePDF({ ...formData, id: savedData.id }, 'reserva');
        }
      } else {
        alert("✔ Serenata actualizada correctamente.");
      }

      setShowForm(false); setEditingId(null); resetForm(); fetchData();
    } catch (e: any) { 
      console.error(e); 
      // Calculamos la URL de nuevo para el error por si acaso
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const url = editingId ? `${apiUrl}/serenatas/${editingId}` : `${apiUrl}/serenatas`;
      alert(`❌ Error: ${e.message} (Intentando conectar a: ${url})`);
    }
    finally { setSaving(false); }
  };


  const handleFinalizarEfectivo = async (id: string, monto: number) => {
    setPagoData({ id, monto, metodo: 'transferencia' });
    setShowPaymentModal(true);
  };

  const confirmFinalizar = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      
      // 1. Registrar el pago
      await fetch(`${apiUrl}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serenata_id: pagoData.id,
          monto: pagoData.monto,
          metodo: pagoData.metodo
        })
      });

      // 2. Actualizar estado
      await fetch(`${apiUrl}/serenatas/${pagoData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'finalizada' })
      });

      setShowPaymentModal(false);
      fetchData();
      alert("✔ Serenata finalizada y pago registrado correctamente.");
    } catch (e) {
      console.error(e);
      alert("Error al finalizar.");
    }
  };

  const handleRehabilitar = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      await fetch(`${apiUrl}/serenatas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: 'confirmada' })
      });
      fetchData();
    } catch (e) { console.error(e); }
  }

  const handleWhatsApp = (s: any) => {
    let phone = s.telefono || '';
    phone = phone.replace(/\D/g, '');
    if (!phone.startsWith('56')) phone = '56' + phone;
    const msg = `Hola ${s.nombre_cliente}, adjunto la información de tu serenata con El Mariachi Aventurero. 🎺🌹`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const generatePDF = async (s: any, type: 'reserva' | 'pago') => {
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      // 1. Imagen de Fondo (Buscamos la misma que en mobile)
      const img = new Image();
      img.src = '/imagen_comprobante.jpeg';
      await new Promise((resolve) => { img.onload = resolve; img.onerror = resolve; });

      if (img.complete && img.naturalWidth > 0) {
        doc.addImage(img, 'JPEG', 0, 0, pageWidth, pageHeight);
      }

      // 2. Fondo Oscuro Premium (Overlay)
      doc.setFillColor(15, 15, 15);
      doc.setGState(new (doc as any).GState({ opacity: 0.8 }));
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
      doc.setGState(new (doc as any).GState({ opacity: 1 }));

      const isReserva = type === 'reserva';
      const accentColor = isReserva ? [212, 175, 55] : [46, 204, 113]; // Gold vs Green
      const [r, g, b] = accentColor;

      // 3. Header
      doc.setTextColor(r, g, b);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.text('EL MARIACHI AVENTURERO', pageWidth / 2, 30, { align: 'center' });

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      const mainTitle = isReserva ? 'CONFIRMACIÓN DE RESERVA' : 'COMPROBANTE DE PAGO';
      doc.text(mainTitle, pageWidth / 2, 45, { align: 'center' });

      doc.setDrawColor(r, g, b);
      doc.setLineWidth(0.5);
      doc.line(40, 50, pageWidth - 40, 50);

      // 4. Bloque de Datos
      const startY = 75;
      const leftCol = 45;

      const drawField = (label: string, value: string, y: number) => {
        doc.setFontSize(9);
        doc.setTextColor(r, g, b);
        doc.setFont('helvetica', 'bold');
        doc.text(label.toUpperCase(), leftCol, y);
        
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(14);
        doc.text(value || '---', leftCol, y + 8);
      };

      drawField('Cliente Solicitante', s.nombre_cliente, startY);
      drawField('Dedicado a', s.nombre_festejada, startY + 22);
      drawField('Motivo / Comentario', s.motivo || 'Serenata Especial', startY + 44);
      drawField('Ubicación del evento', `${s.direccion}, ${s.comuna}`, startY + 66);
      
      const fechaFormat = s.fecha.split('-').reverse().join('/');
      drawField('Programación', `${fechaFormat} - ${s.hora} hrs`, startY + 88);

      if (isReserva) {
        const cancs = s.canciones?.length > 0 ? s.canciones.join(', ') : 'Selección en vivo';
        drawField('Canciones Elegidas', cancs, startY + 110);
      } else {
        drawField('Detalle Financiero', `Servicio pagado correctamente ✅`, startY + 110);
      }

      // 5. Caja de Precio (Bottom)
      const priceY = 220;
      doc.setDrawColor(r, g, b);
      doc.setLineWidth(1);
      doc.roundedRect(55, priceY, pageWidth - 110, 25, 5, 5, 'D');
      
      doc.setTextColor(r, g, b);
      doc.setFontSize(10);
      doc.text(isReserva ? 'VALOR TOTAL DEL SERVICIO' : 'MONTO TOTAL RECIBIDO', pageWidth / 2, priceY + 8, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text(`$ ${Number(s.precio_total).toLocaleString('es-CL')}`, pageWidth / 2, priceY + 20, { align: 'center' });

      // 6. Footer
      doc.setTextColor(r, g, b);
      doc.setFontSize(11);
      doc.text('"Hacemos de cada momento algo inolvidable"', pageWidth / 2, 270, { align: 'center' });
      doc.setTextColor(255, 255, 255);
      doc.text('🌹 Gracias por su preferencia 🎸', pageWidth / 2, 278, { align: 'center' });

      doc.save(`${type}_${s.nombre_festejada}.pdf`);
      
    } catch (e: any) {
      console.error(e);
      alert("Error al generar PDF.");
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex justify-between items-center bg-black/60 p-6 rounded-3xl border border-white/5 shadow-2xl backdrop-blur-xl">
        <div>
          <h1 className="hero-title text-2xl md:text-3xl font-bold gold-gradient-text tracking-tighter">
            {estadoFilter === 'finalizada' ? 'SERENATAS COMPLETADAS' : 'CONTROL DE SERENATAS'}
          </h1>
          <p className="text-white/40 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] mt-2">
             <span className="text-[var(--accent-gold)]">{serenatas.length}</span> registros en el sistema
          </p>
        </div>
        <button onClick={() => { setShowForm(!showForm); if(!showForm) resetForm(); }} className="btn-gold px-8 py-4 transition-transform active:scale-95">
           {showForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-in fade-in zoom-in-95 duration-500 border border-[var(--accent-gold)]/30 shadow-2xl overflow-hidden">
           <div className="bg-gradient-to-r from-[var(--accent-gold)]/10 to-transparent p-6 border-b border-white/5">
              <h2 className="text-sm font-black text-[var(--accent-gold)] tracking-[0.4em] uppercase">Formulario de Reserva</h2>
           </div>
           <form onSubmit={handleSubmit} className="p-8 space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                 {/* DATOS DEL CLIENTE */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <Users size={16} className="text-[var(--accent-gold)]" />
                       <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Información del Cliente</span>
                    </div>
                    <div>
                       <label className="label-text">Nombre del Cliente</label>
                       <input name="nombre_cliente" value={formData.nombre_cliente} onChange={handleInputChange} className="input-field" placeholder="Ej: Juan Pérez" required />
                    </div>
                    <div>
                       <label className="label-text">WhatsApp (Con +569)</label>
                       <input name="telefono" value={formData.telefono} onChange={handleInputChange} className="input-field" placeholder="+56912345678" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                       <div>
                          <label className="label-text">Dedicado a</label>
                          <input name="nombre_festejada" value={formData.nombre_festejada} onChange={handleInputChange} className="input-field" placeholder="Festejada" required />
                       </div>
                       <div>
                          <label className="label-text">Motivo</label>
                          <input name="motivo" value={formData.motivo} onChange={handleInputChange} className="input-field" placeholder="Cumpleaños" required />
                       </div>
                    </div>
                 </div>

                 {/* DETALLES DEL EVENTO */}
                 <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <Clock size={16} className="text-[var(--accent-gold)]" />
                       <span className="text-[10px] font-black text-white/40 tracking-widest uppercase">Logística del Servicio</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="label-text">Fecha del Evento</label>
                          <input type="date" name="fecha" value={formData.fecha} onChange={handleInputChange} className="input-field" required />
                        </div>
                        <div>
                          <label className="label-text">Hora de Llegada</label>
                          <input type="time" name="hora" value={formData.hora} onChange={handleInputChange} className="input-field" required />
                        </div>
                    </div>
                    <div>
                        <label className="label-text">Plan de Serenata</label>
                        <select name="tipo" value={formData.tipo} onChange={handleInputChange} className="input-field bg-black font-black text-[var(--accent-gold)] uppercase tracking-widest cursor-pointer">
                           <option value="express">Express (2 canciones) - $25.000</option>
                           <option value="full">Full (4 canciones) - $40.000</option>
                        </select>
                    </div>
                    <div>
                       <label className="label-text">Dirección Exacta</label>
                       <input name="direccion" value={formData.direccion} onChange={handleInputChange} className="input-field" placeholder="Cerca de calle..." required />
                    </div>
                    <div>
                       <label className="label-text">Comuna</label>
                       <select name="comuna" value={formData.comuna} onChange={handleInputChange} className="input-field bg-black" required>
                          <option value="">Seleccione Comuna...</option>
                          {COMUNAS.map(c => <option key={c} value={c}>{c}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              {/* SELECCIÓN DE CANCIONES */}
              <div className="space-y-6 pt-6 border-t border-white/5">
                 <div className="flex justify-between items-center bg-black/40 p-4 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                       <Music size={18} className="text-[var(--accent-gold)]" />
                       <h3 className="text-[10px] font-black text-white tracking-[0.3em] uppercase">Elegir canciones ({formData.canciones.length}/{formData.tipo === 'express' ? 2 : 4})</h3>
                    </div>
                    <button type="button" onClick={() => setShowSongsDropdown(!showSongsDropdown)} className="bg-[var(--accent-gold)] text-black px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:brightness-110">
                       {showSongsDropdown ? 'Cerrar Lista' : 'Modificar canciones'}
                    </button>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 min-h-[40px] items-center">
                    {formData.canciones.length === 0 ? (
                       <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest italic pl-2">Selección rápida o manual...</p>
                    ) : (
                       formData.canciones.map(s => (
                          <div key={s} className="px-4 py-2 rounded-xl bg-gradient-to-r from-[var(--accent-gold)] to-[#b8860b] text-black text-[10px] font-black uppercase flex items-center gap-3 shadow-lg">
                             {s} <X size={14} className="cursor-pointer hover:scale-125 transition-transform" onClick={() => toggleSong(s)} />
                          </div>
                       ))
                    )}
                 </div>

                 {showSongsDropdown && (
                   <div className="bg-black/80 ring-1 ring-white/10 rounded-3xl p-6 space-y-6 animate-in slide-in-from-bottom-2 duration-300">
                      <div className="relative">
                         <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                         <input 
                           value={songSearch}
                           onChange={(e) => setSongSearch(e.target.value)}
                           className="input-field pl-16 bg-white/[0.02] border-white/5 focus:border-[var(--accent-gold)]/50" 
                           placeholder="Escribe el nombre de la canción..." 
                         />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 overflow-y-auto max-h-[350px] pr-3 custom-scrollbar">
                         {filteredSongs.map(s => {
                           const isSel = formData.canciones.includes(s);
                           return (
                             <div 
                               key={s} 
                               onClick={() => toggleSong(s)} 
                               className={`p-4 rounded-2xl border border-white/5 cursor-pointer transition-all flex items-center gap-3 text-[10px] uppercase font-bold tracking-tight ${isSel ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black' : 'bg-white/[0.03] text-white/40 hover:bg-white/[0.08] hover:text-white'}`}
                             >
                                <Music size={14} className={isSel ? 'opacity-100' : 'opacity-20'} />
                                {s}
                                {isSel && <CheckCircle size={14} className="ml-auto" />}
                             </div>
                           );
                         })}
                      </div>
                   </div>
                 )}
              </div>

              <div className="flex justify-end pt-8 border-t border-white/5">
                 <button type="submit" disabled={saving} className="btn-gold py-6 px-16 group active:scale-95 transition-transform">
                   {saving ? <Loader2 className="animate-spin" /> : (
                      <span className="flex items-center gap-4 font-black tracking-[0.4em] text-xs">
                         {editingId ? 'ACTUALIZAR SERENATA' : 'PROGRAMAR EVENTO'} <ChevronRight size={18} />
                      </span>
                   )}
                 </button>
              </div>
           </form>
        </div>
      )}

      {/* LISTADO DE SERENATAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
         {loading ? (
           <div className="col-span-full py-32 flex flex-col items-center gap-5">
              <Loader2 className="animate-spin text-[var(--accent-gold)]" size={60} />
              <p className="text-[10px] font-black text-white/30 tracking-[0.5em] uppercase">Sincronizando Base de Datos</p>
           </div>
         ) : serenatas.length === 0 ? (
           <div className="col-span-full py-40 text-center bg-black/40 rounded-[40px] border-2 border-dashed border-white/5">
              <p className="text-white/20 font-black tracking-[0.3em] uppercase text-xs">No hay eventos en esta categoría</p>
           </div>
         ) : (
            serenatas.map(s => {
              const isFin = s.estado === 'finalizada';
              return (
                <div key={s.id} className="glass-card flex flex-col group hover:border-[var(--accent-gold)]/40 transition-all duration-700 !p-10 relative overflow-hidden backdrop-blur-3xl shadow-2xl border border-white/5">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-gold)]/5 blur-3xl rounded-full translate-x-16 -translate-y-16"></div>
                   
                   <div className="flex justify-between items-start mb-10 relative z-10">
                      <div className="p-5 rounded-3xl bg-gradient-to-br from-white/10 to-transparent border border-white/10 flex flex-col items-center min-w-[90px] shadow-lg">
                         <span className="text-[10px] text-[var(--accent-gold)] uppercase font-black tracking-[0.3em] mb-2">{s.fecha.split('-').reverse().slice(0,2).join('/')}</span>
                         <span className="text-3xl font-black text-white tracking-widest">{s.hora?.slice(0,5)}</span>
                      </div>
                      <div className="flex gap-4">
                         <button 
                            onClick={() => {
                               setEditingId(s.id);
                               setFormData({ ...s, canciones: s.canciones || [] });
                               setShowForm(true);
                               window.scrollTo({ top: 0, behavior: 'smooth' });
                            }} 
                            className="p-4 rounded-2xl bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white transition-all shadow-xl"
                         >
                            <Pencil size={20} />
                         </button>
                         <button 
                            onClick={() => {
                              if(confirm("¿Seguro que deseas eliminar este registro?")) {
                                fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api'}/serenatas/${s.id}`, { method: 'DELETE' }).then(() => fetchData());
                              }
                            }} 
                            className="p-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-xl"
                         >
                            <Trash2 size={20} />
                         </button>
                      </div>
                   </div>

                   <div className="space-y-4 mb-10 relative z-10">
                      <div className="flex items-center gap-3">
                         <div className={`w-3 h-3 rounded-full ${s.tipo === 'express' ? 'bg-blue-500' : 'bg-[var(--accent-gold)]'} shadow-lg shadow-current/20`}></div>
                         <span className="text-[var(--accent-gold)] font-black text-[10px] uppercase tracking-[0.4em]">{s.tipo}</span>
                      </div>
                      <h2 className="text-3xl font-black text-white group-hover:text-[var(--accent-gold)] transition-all duration-500 leading-none">{s.nombre_festejada}</h2>
                      <div className="flex items-center gap-2">
                         <Star size={12} fill="var(--accent-gold)" className="text-[var(--accent-gold)]" />
                         <p className="text-[11px] text-white/50 uppercase font-bold tracking-[0.1em]">{s.motivo || 'Serenata Especial'}</p>
                      </div>
                   </div>

                   <div className="space-y-6 relative z-10">
                      <div className="p-5 bg-white/[0.03] rounded-3xl flex items-center gap-5 border border-white/5 group-hover:bg-white/[0.06] transition-all">
                         <div className="p-3 bg-[var(--accent-gold)]/10 rounded-xl">
                            <MapPin size={22} className="text-[var(--accent-gold)]" />
                         </div>
                         <div className="text-sm">
                            <p className="font-bold text-white/90 leading-snug">{s.direccion}</p>
                            <p className="text-[10px] text-white/30 font-black uppercase tracking-widest mt-1.5">{s.comuna}</p>
                         </div>
                      </div>

                      <div className="flex items-center justify-between py-6 border-y border-white/5">
                         <div className="flex flex-col">
                            <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Inversión Total</span>
                            <div className="text-3xl font-black text-white tracking-tighter mt-1">$ {s.precio_total?.toLocaleString()}</div>
                         </div>
                         <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-lg ${isFin ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500'}`}>
                            {s.estado}
                         </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        {isFin ? (
                          <>
                            <button 
                              onClick={() => generatePDF(s, 'pago')} 
                              className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-emerald-500 text-black font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                            >
                              <FileText size={18} /> Comprobante
                            </button>
                            <button 
                              onClick={() => handleRehabilitar(s.id)} 
                              className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-white/10 text-white/30 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/5 active:scale-95 transition-all"
                            >
                              <RotateCcw size={18} /> Reabrir
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => handleFinalizarEfectivo(s.id, s.precio_total)} 
                              className="flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-[var(--accent-gold)] to-[#b8860b] text-black font-black text-[10px] uppercase tracking-[0.2em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-[var(--accent-gold)]/20"
                            >
                              <CheckCircle size={18} /> Finalizar
                            </button>
                            <button 
                              onClick={() => generatePDF(s, 'reserva')} 
                              className="flex items-center justify-center gap-3 py-4 rounded-2xl border border-[var(--accent-gold)]/40 text-[var(--accent-gold)] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-[var(--accent-gold)]/10 active:scale-95 transition-all"
                            >
                              <FileText size={18} /> Reserva
                            </button>
                          </>
                        )}
                      </div>
                   </div>
                </div>
              );
            })
         )}
      </div>

      {/* MODAL DE PAGO (Sync con Mobile) */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
           <div className="glass-card max-w-md w-full !p-8 border border-[var(--accent-gold)]/40 shadow-2xl shadow-[var(--accent-gold)]/10">
              <div className="flex justify-between items-center mb-10">
                 <div className="p-3 bg-[var(--accent-gold)]/10 rounded-xl">
                    <Wallet size={24} className="text-[var(--accent-gold)]" />
                 </div>
                 <h2 className="text-xl font-black text-white tracking-[0.2em] uppercase">Registrar Cobro</h2>
                 <button onClick={() => setShowPaymentModal(false)} className="text-white/20 hover:text-white transition-colors">
                    <X size={24} />
                 </button>
              </div>

              <div className="space-y-8">
                 <div>
                    <label className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-[0.3em] mb-3 block">Monto a Recibir</label>
                    <input 
                       type="number" 
                       value={pagoData.monto} 
                       onChange={(e) => setPagoData({...pagoData, monto: Number(e.target.value)})}
                       className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-3xl font-black text-white focus:border-[var(--accent-gold)] focus:outline-none transition-all"
                    />
                 </div>

                 <div>
                    <label className="text-[10px] font-black text-[var(--accent-gold)] uppercase tracking-[0.3em] mb-3 block">Método de Pago</label>
                    <div className="grid grid-cols-2 gap-4">
                       {['transferencia', 'efectivo'].map(m => (
                         <button 
                           key={m}
                           onClick={() => setPagoData({...pagoData, metodo: m})}
                           className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${pagoData.metodo === m ? 'bg-[var(--accent-gold)] border-[var(--accent-gold)] text-black' : 'bg-white/5 border-white/10 text-white/40'}`}
                         >
                            {m === 'efectivo' ? '💵 Efectivo' : '🏦 Transf.'}
                         </button>
                       ))}
                    </div>
                 </div>

                 <button 
                    onClick={confirmFinalizar}
                    className="w-full bg-emerald-500 text-black py-6 rounded-3xl font-black text-xs tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-xl shadow-emerald-500/20"
                 >
                    CONFIRMAR Y FINALIZAR
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

export default function SerenatasPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin text-[var(--accent-gold)]" size={48} />
      </div>
    }>
      <SerenatasContent />
    </Suspense>
  );
}
