import React from 'react';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4">
      <div className="max-w-md w-full space-y-8 glass-card">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[var(--accent-gold)] tracking-widest uppercase mb-2">
            El Mariachi
          </h1>
          <p className="text-xs text-white/50 uppercase tracking-[.3em]">Gestión Administrativa</p>
        </div>

        <form className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[var(--accent-gold)] focus:outline-none transition-all"
              placeholder="tu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white/70 mb-2">Contraseña</label>
            <input 
              type="password" 
              className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:border-[var(--accent-gold)] focus:outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" className="w-full btn-gold py-4">
            Ingresar al Sistema
          </button>
        </form>
      </div>
    </div>
  );
}
