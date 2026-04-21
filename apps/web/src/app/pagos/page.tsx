"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, DollarSign, Wallet, ArrowUpRight, Loader2 } from 'lucide-react';

interface Serenata {
  id: string;
  motivo: string;
  nombre_festejada: string;
  clientes?: { nombre: string };
  pagos?: Pago[];
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const [resPagos, resSerenatas] = await Promise.all([
        fetch(`${apiUrl}/pagos`),
        fetch(`${apiUrl}/serenatas`)
      ]);
      
      if (resPagos.ok) setPagos(await resPagos.json());
      if (resSerenatas.ok) setSerenatas(await resSerenatas.json());
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
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
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

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--accent-gold)] to-yellow-200 bg-clip-text text-transparent">Control de Caja y Pagos</h1>
          <p className="text-white/50 mt-2">Registra y monitorea los abonos y liquidaciones de tus eventos.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-gold flex items-center gap-2">
          <Plus size={20} /> Registrar Pago
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card flex items-center justify-between border-l-4 border-l-[var(--accent-gold)]">
          <div>
            <p className="text-white/50 text-sm font-medium uppercase tracking-wider">Ingresos del Mes</p>
            <p className="text-3xl font-bold text-white mt-1">
              ${pagos.reduce((acc, p) => acc + p.monto, 0).toLocaleString()}
            </p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)]">
            <DollarSign size={24} />
          </div>
        </div>
      </div>

      {showForm && (
        <div className="glass-card mb-8 animate-in slide-in-from-top-4 border border-[var(--accent-gold)]/20">
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent-gold)] flex items-center gap-2">
            <CreditCard size={20} /> Nuevo Abono
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-white/70 mb-1">Buscar Serenata</label>
              <select required name="serenata_id" onChange={handleInputChange} value={formData.serenata_id} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)] appearance-none">
                <option value="">Seleccione el evento...</option>
                {serenatas.map(s => (
                  <option key={s.id} value={s.id}>{s.motivo} ({s.nombre_festejada})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Monto ($)</label>
              <input required type="number" name="monto" onChange={handleInputChange} value={formData.monto} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]" placeholder="Ej. 15000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Método de Pago</label>
              <select required name="metodo" onChange={handleInputChange} value={formData.metodo} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)] appearance-none">
                <option value="efectivo">Efectivo 💵</option>
                <option value="transferencia">Transferencia 🏦</option>
              </select>
            </div>
            <div className="md:col-span-3 flex items-end justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-gold flex items-center justify-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin"/> : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card p-0 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} /></div>
        ) : pagos.length === 0 ? (
          <div className="py-12 text-center text-white/40">No hay pagos registrados.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0f0f0f] text-white/50 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-medium">Cliente / Evento</th>
                  <th className="px-6 py-4 font-medium">Fecha</th>
                  <th className="px-6 py-4 font-medium">Método</th>
                  <th className="px-6 py-4 font-medium text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pagos.map((pago) => (
                  <tr key={pago.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{pago.serenatas?.clientes?.nombre || 'Desconocido'}</div>
                      <div className="text-xs text-white/40">{pago.serenatas?.motivo || 'Evento eliminado'}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      {new Date(pago.created_at).toLocaleDateString('es-CL')}
                    </td>
                    <td className="px-6 py-4">
                      {pago.metodo === 'efectivo' ? <span className="text-emerald-400">💵 Efectivo</span> : <span className="text-blue-400">🏦 Transf.</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="font-bold text-white text-sm">${pago.monto.toLocaleString()}</span>
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
