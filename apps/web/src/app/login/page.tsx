"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, Music } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialSplash, setInitialSplash] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  if (initialSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black transition-all duration-1000">
        <div className="loader-mariachi mb-8">
           <Music size={80} className="text-[var(--accent-gold)]" strokeWidth={1} />
        </div>
        <h1 className="hero-title text-2xl font-bold gold-gradient-text tracking-[0.5em] animate-pulse">
          SISTEMA AVENTURERO
        </h1>
        <p className="text-[10px] text-white/20 uppercase tracking-[0.8em] mt-4 font-black">
          Cargando Experiencia...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-black px-4 overflow-hidden">
      {/* Fondo con imagen personalizada */}
      <div 
        style={{ 
          backgroundImage: "url('/fondo_login.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.3
        }} 
      />

      {/* Notas musicales flotantes */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Music className="musical-note note-1" size={24} />
        <Music className="musical-note note-2" size={18} />
        <Music className="musical-note note-3" size={20} />
        <Music className="musical-note note-4" size={22} />
      </div>
      
      <div className="max-w-md w-full space-y-8 glass-card border border-white/10 p-8 relative z-10 animate-in fade-in zoom-in duration-700">
        <div className="text-center relative">
          <div className="flex justify-center mb-4">
             <div className="w-20 h-20 rounded-full border border-[var(--accent-gold)]/30 flex items-center justify-center bg-[var(--accent-gold)]/5 relative overflow-hidden">
                <Music size={40} className="text-[var(--accent-gold)]" />
                {/* Notas saliendo del icono principal */}
                <div className="absolute top-0 animate-bounce transition-all">
                   <Music size={12} className="text-[var(--accent-gold)]/40 absolute -top-4 left-2" />
                   <Music size={10} className="text-[var(--accent-gold)]/40 absolute -top-8 right-0" />
                </div>
             </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-b from-[var(--accent-gold)] to-yellow-600 bg-clip-text text-transparent tracking-widest uppercase mb-2">
            El Mariachi
          </h1>
          <p className="text-[10px] text-white/50 uppercase tracking-[.4em] font-medium">Gestión Administrativa</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-lg flex items-center gap-3 text-sm animate-in shake duration-300">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleLogin}>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--accent-gold)] uppercase tracking-wider">Correo Electrónico</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-[var(--accent-gold)] focus:outline-none transition-all placeholder:text-white/20 text-sm"
              placeholder="admin@mariachi.com"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--accent-gold)] uppercase tracking-wider">Contraseña</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-white focus:border-[var(--accent-gold)] focus:outline-none transition-all placeholder:text-white/20 text-sm"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-gold py-4 flex justify-center items-center gap-3 group rounded-xl shadow-lg shadow-gold/20"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                <span className="font-black tracking-widest">INGRESAR AL SISTEMA</span>
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-white/10 text-[9px] pt-4 font-bold uppercase tracking-widest">
          Estás ingresando a zona segura.
        </p>
      </div>
    </div>
  );
}
