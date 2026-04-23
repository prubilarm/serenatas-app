"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

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

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-black px-4">
      {/* Fondo con imagen personalizada */}
      <div 
        style={{ 
          backgroundImage: "url('/fondo_login.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          opacity: 0.4 // Ajustamos opacidad para profesionalismo
        }} 
      />
      
      <div className="max-w-md w-full space-y-8 glass-card border border-white/10 p-8 relative z-10">
        <div className="text-center">
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
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Correo Electrónico</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[var(--accent-gold)] focus:outline-none transition-all placeholder:text-white/20"
              placeholder="admin@mariachi.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Contraseña</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[var(--accent-gold)] focus:outline-none transition-all placeholder:text-white/20"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={loading}
            className="w-full btn-gold py-4 flex justify-center items-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                Ingresar al Sistema
              </>
            )}
          </button>
        </form>
        
        <p className="text-center text-white/20 text-xs pt-4">
          Acceso restringido para personal autorizado.
        </p>
      </div>
    </div>
  );
}
