"use client";

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Filter,
  MoreVertical,
  MapPin,
  Calendar as CalendarIcon,
  Loader2
} from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
}

interface Serenata {
  id: string;
  cliente_id: string;
  clientes?: { nombre: string }; // Join relation depending on Supabase query
  nombre_festejada: string;
  motivo: string;
  fecha: string;
  hora: string;
  direccion: string;
  comuna: string;
  tipo: string;
  precio_total: number;
  estado: string;
}

export default function SerenatasPage() {
  const [serenatas, setSerenatas] = useState<Serenata[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form values
  const [formData, setFormData] = useState({
    cliente_id: '',
    nombre_festejada: '',
    motivo: '',
    fecha: '',
    hora: '',
    direccion: '',
    comuna: '',
    tipo: 'express',
    precio_total: 0
  });

  const fetchData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const [resSerenatas, resClientes] = await Promise.all([
        fetch(`${apiUrl}/serenatas`),
        fetch(`${apiUrl}/clientes`)
      ]);
      
      if (resSerenatas.ok) setSerenatas(await resSerenatas.json());
      if (resClientes.ok) setClientes(await resClientes.json());
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
      const response = await fetch(`${apiUrl}/serenatas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setShowForm(false);
        setFormData({
          cliente_id: '', nombre_festejada: '', motivo: '', fecha: '', 
          hora: '', direccion: '', comuna: '', tipo: 'express', precio_total: 0
        });
        fetchData();
      }
    } catch (error) {
      console.error("Error saving serenata:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="hero-title text-4xl font-bold gold-gradient-text tracking-tighter">GESTIONAR SERENATAS</h1>
          <p className="text-white/40 mt-2 font-medium">Control total de tus presentaciones y eventos.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={20} /> Nueva Serenata
        </button>
      </div>

      {showForm && (
        <div className="glass-card mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent-gold)]">Agendar Serenata</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Cliente que contrata</label>
              <select required name="cliente_id" onChange={handleInputChange} value={formData.cliente_id} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)] appearance-none">
                <option value="">Seleccione un cliente...</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Nombre Festejada(o)</label>
              <input required type="text" name="nombre_festejada" onChange={handleInputChange} value={formData.nombre_festejada} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]" placeholder="Ej. Doña María" />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Fecha</label>
              <input required type="date" name="fecha" onChange={handleInputChange} value={formData.fecha} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Hora</label>
              <input required type="time" name="hora" onChange={handleInputChange} value={formData.hora} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Dirección</label>
              <input required type="text" name="direccion" onChange={handleInputChange} value={formData.direccion} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]" placeholder="Calle Ejemplo #123" />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Comuna / Zona</label>
              <input required type="text" name="comuna" onChange={handleInputChange} value={formData.comuna} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]" placeholder="Ej. Centro" />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Tipo de Serenata</label>
              <select required name="tipo" onChange={handleInputChange} value={formData.tipo} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)] appearance-none">
                <option value="express">Express (7 Canciones)</option>
                <option value="full">Full (15 Canciones)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Precio Acordado ($)</label>
              <input required type="number" name="precio_total" onChange={handleInputChange} value={formData.precio_total} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]" placeholder="Ej. 70000" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-1">Motivo</label>
              <input required type="text" name="motivo" onChange={handleInputChange} value={formData.motivo} className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)]" placeholder="Ej. Cumpleaños, Aniversario, Reconciliación..." />
            </div>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5">Cancelar</button>
              <button type="submit" disabled={saving} className="btn-gold flex items-center gap-2">
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Confirmar Agenda'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabla de Serenatas */}
      <div className="glass-card p-0 overflow-hidden">
        {loading ? (
          <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} /></div>
        ) : serenatas.length === 0 ? (
          <div className="py-12 text-center text-white/40">No hay serenatas registradas.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#0f0f0f] text-white/40 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Evento / Festejada</th>
                  <th className="px-6 py-4 font-semibold">Ubicación</th>
                  <th className="px-6 py-4 font-semibold">Fecha / Hora</th>
                  <th className="px-6 py-4 font-semibold">Estado</th>
                  <th className="px-6 py-4 font-semibold text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {serenatas.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{item.motivo} a {item.nombre_festejada}</div>
                      <div className="text-xs text-white/40">Tipo: {item.tipo}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-white/70">
                        <MapPin size={14} className="text-[var(--accent-gold)]" /> {item.comuna}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">
                      <div className="flex items-center gap-2 bg-white/5 w-fit px-3 py-1 rounded-full border border-white/5">
                        <CalendarIcon size={14} className="text-[var(--accent-gold)]"/> {item.fecha}
                      </div>
                      <div className="text-[11px] uppercase font-bold text-white/50 ml-2 mt-1">{item.hora} HRS</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 bg-white/5 border border-white/10 text-xs rounded-full uppercase font-bold tracking-tighter ${item.estado === 'completada' ? 'text-emerald-500' : 'text-yellow-500'}`}>
                        {item.estado || 'Confirmada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white text-sm">
                      ${item.precio_total?.toLocaleString()}
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
