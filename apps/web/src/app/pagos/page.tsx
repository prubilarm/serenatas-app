"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, DollarSign, Wallet, ArrowUpRight, Loader2, Send, CheckCircle } from 'lucide-react';

interface Serenata {
  id: string;
  motivo: string;
  nombre_festejada: string;
  nombre_cliente: string;
  telefono: string;
  precio_total: number;
}

interface Pago {
  id: string;
  serenata_id: string;
  monto: number;
  metodo: string;
  created_at: string;
  serenatas?: Serenata;
}

export default function PagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [serenatas, setSerenatas] = useState<Serenata[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    serenata_id: '',
    monto: 0,
    metodo: 'efectivo'
  });

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const [resPagos, resSerenatas] = await Promise.all([
        fetch(`${apiUrl}/pagos`),
        fetch(`${apiUrl}/serenatas`)
      ]);
      
      if (resPagos.ok) setPagos(await resPagos.json());
      if (resSerenatas.ok) {
         const allS = await resSerenatas.json();
         // Solo serenatas activas para registrar nuevos pagos
         setSerenatas(allS.filter((s: any) => s.estado !== 'finalizada'));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api-alpha-five-25.vercel.app/api';
      const response = await fetch(`${apiUrl}/pagos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowForm(false);
        setFormData({ serenata_id: '', monto: 0, metodo: 'efectivo' });
        fetchData();
      }
    } catch (error) {
      console.error("Error saving pago:", error);
    } finally {
      setSaving(false);
    }
  };

  const handleWhatsAppReceipt = (pago: Pago) => {
    const s = pago.serenatas;
    if (!s) return;

    const fechaPago = new Date(pago.created_at).toLocaleDateString('es-CL');
    const mensaje = `*COMPROBANTE DE PAGO - EL MARIACHI AVENTURERO* 🎻📜

Estimado(a) *${s.nombre_cliente}*,

Se ha registrado exitosamente el siguiente pago:

💰 *Monto:* $${pago.monto.toLocaleString()}
📅 *Fecha:* ${fechaPago}
💳 *Medio de Pago:* ${pago.metodo.toUpperCase()}

*DETALLES DEL SERVICIO:*
📍 *Evento:* ${s.motivo}
👤 *Homenajeado:* ${s.nombre_festejada}

La diferencia pendiente (si existe) debe ser liquidada al finalizar el servicio.

*¡Muchas gracias por su confianza en nuestro Mariachi!*`;

    const encoded = encodeURIComponent(mensaje);
    const tel = s.telefono ? s.telefono.replace(/\+/g, '') : '';
    window.open(`https://wa.me/${tel}?text=${encoded}`, '_blank');
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="hero-title text-2xl md:text-3xl font-bold gold-gradient-text tracking-tighter">REGISTRO DE PAGOS</h1>
          <p className="text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Control financiero y comprobantes</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2 px-8">
          {showForm ? <X size={20} /> : <><Plus size={20} /> REGISTRAR ABONO</>}
        </button>
      </div>

      {showForm && (
        <div className="glass-card animate-in slide-in-from-top-4 border border-[var(--accent-gold)]/20 shadow-2xl">
          <h2 className="text-xs font-black text-[var(--accent-gold)] tracking-[0.3em] mb-8 border-l-2 border-[var(--accent-gold)] pl-3 uppercase">Nueva Entrada de Dinero</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="label-text">Buscar Serenata</label>
              <select required name="serenata_id" onChange={handleInputChange} value={formData.serenata_id} className="input-field bg-black cursor-pointer font-bold border-white/10">
                <option value="">-- SELECCIONE UN EVENTO --</option>
                {serenatas.map(s => (
                  <option key={s.id} value={s.id}>{s.nombre_festejada} - {s.motivo}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-text">Monto Pagado ($)</label>
              <input required type="number" name="monto" onChange={handleInputChange} value={formData.monto} className="input-field font-black text-xl text-[var(--accent-gold)]" placeholder="0" />
            </div>
            <div>
              <label className="label-text">Medio de Pago</label>
              <select required name="metodo" onChange={handleInputChange} value={formData.metodo} className="input-field bg-black cursor-pointer uppercase font-bold">
                <option value="efectivo">Efectivo 💵</option>
                <option value="transferencia">Transferencia 🏦</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3 mt-4">
              <button type="submit" disabled={saving} className="btn-gold px-12 py-4">
                {saving ? <Loader2 size={18} className="animate-spin"/> : 'GUARDAR Y GENERAR'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* HISTORIAL DE PAGOS */}
      <div className="glass-card border-none bg-black/40 p-0 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/5 bg-white/[0.02]">
           <h3 className="text-xs font-black text-white/50 tracking-[0.2em] uppercase">Historial Reciente de Ingresos</h3>
        </div>
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} /></div>
        ) : pagos.length === 0 ? (
          <div className="py-20 text-center text-white/10 font-bold uppercase tracking-widest animate-pulse">Sin transacciones registradas</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-black/60 text-white/40 text-[9px] uppercase font-black tracking-widest border-b border-white/5">
                <tr>
                  <th className="px-8 py-5">Cliente / Servicio</th>
                  <th className="px-8 py-5">Fecha Pago</th>
                  <th className="px-8 py-5">Método</th>
                  <th className="px-8 py-5 text-right font-black">Monto</th>
                  <th className="px-8 py-5 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-white/[0.02] transition-all group border-b border-white/[0.02]">
                    <td className="px-8 py-5">
                      <div className="font-black text-white text-sm uppercase tracking-tight">{pago.serenatas?.nombre_cliente || 'Sin nombre'}</div>
                      <div className="text-[10px] text-white/30 font-bold uppercase mt-0.5">{pago.serenatas?.motivo || 'Evento eliminado'}</div>
                    </td>
                    <td className="px-8 py-5 text-xs font-bold text-white/60">
                      {new Date(pago.created_at).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-8 py-5">
                      {pago.metodo === 'efectivo' 
                        ? <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black border border-emerald-500/20 uppercase">💵 Efectivo</span> 
                        : <span className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-full text-[9px] font-black border border-blue-500/20 uppercase">🏦 Transf.</span>}
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="font-black text-[var(--accent-gold)] text-lg">$ {pago.monto.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex justify-center">
                          <button 
                            onClick={() => handleWhatsAppReceipt(pago)}
                            className="bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] p-2.5 rounded-xl border border-[var(--accent-gold)]/20 hover:bg-[var(--accent-gold)] hover:text-black transition-all transform hover:scale-110"
                            title="Enviar Comprobante WhatsApp"
                          >
                             <Send size={18} />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
