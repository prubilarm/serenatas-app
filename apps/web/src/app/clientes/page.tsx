"use client";

import React, { useState, useEffect } from 'react';
import { Users, Plus, Phone, Search, Loader2 } from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  observaciones?: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchClientes = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/clientes`);
      if (response.ok) {
        const data = await response.json();
        setClientes(data);
      }
    } catch (error) {
      console.error("Error fetching clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${apiUrl}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, telefono, observaciones }),
      });
      
      if (response.ok) {
        setNombre('');
        setTelefono('');
        setObservaciones('');
        setShowForm(false);
        fetchClientes(); // Refresh list
      }
    } catch (error) {
      console.error("Error saving cliente:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="hero-title text-4xl font-bold gold-gradient-text tracking-tighter">
            DIRECTORIO DE CLIENTES
          </h1>
          <p className="text-white/40 mt-2 font-medium">Gestiona los contactos y contratistas del mariachi.</p>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn-gold flex items-center gap-2"
        >
          <Plus size={20} />
          Nuevo Cliente
        </button>
      </div>

      {showForm && (
        <div className="glass-card mb-8 animate-in slide-in-from-top-4">
          <h2 className="text-xl font-semibold mb-4 text-[var(--accent-gold)]">Registrar Cliente</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Nombre Completo</label>
              <input 
                required
                type="text" 
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1">Teléfono</label>
              <input 
                required
                type="tel" 
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                placeholder="Ej. 555-1234"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-white/70 mb-1">Observaciones (Opcional)</label>
              <textarea 
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
                placeholder="Ej. Cliente frecuente, prefiere mariachis de traje blanco..."
                rows={3}
              />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-white/10 text-white/70 hover:bg-white/5 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                disabled={saving}
                className="btn-gold flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : 'Guardar Cliente'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={18} />
            <input 
              type="text" 
              placeholder="Buscar cliente..." 
              className="w-full bg-black/50 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-[var(--accent-gold)] transition-colors"
            />
          </div>
          <span className="text-sm text-white/40">{clientes.length} clientes registrados</span>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="animate-spin text-[var(--accent-gold)]" size={32} />
          </div>
        ) : clientes.length === 0 ? (
          <div className="py-12 text-center text-white/40 flex flex-col items-center">
            <Users size={48} className="mb-4 opacity-20" />
            <p>No hay clientes registrados aún.</p>
            <p className="text-sm mt-1">Haz clic en "Nuevo Cliente" para empezar.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-white/40 text-sm uppercase tracking-wider">
                  <th className="font-medium pb-3 pl-4">Nombre</th>
                  <th className="font-medium pb-3">Teléfono</th>
                  <th className="font-medium pb-3">Observaciones</th>
                  <th className="font-medium pb-3 text-right pr-4">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-white/5 transition-colors group">
                    <td className="py-4 pl-4 text-white font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/10 flex items-center justify-center text-[var(--accent-gold)]">
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </div>
                      {cliente.nombre}
                    </td>
                    <td className="py-4 text-white/70">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-white/40" />
                        {cliente.telefono}
                      </div>
                    </td>
                    <td className="py-4 text-white/50 text-sm max-w-[200px] truncate">
                      {cliente.observaciones || '-'}
                    </td>
                    <td className="py-4 pr-4 flex justify-end">
                      <button className="text-[var(--accent-gold)] hover:text-white transition-colors text-sm font-medium opacity-0 group-hover:opacity-100">
                        Ver Detalles
                      </button>
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
