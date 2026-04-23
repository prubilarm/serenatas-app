"use client";

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const INACTIVITY_LIMIT = 3 * 60 * 1000; // 3 minutos

export default function AuthManager() {
  const router = useRouter();
  const pathname = usePathname();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error("Error during auto-logout:", error);
    }
  };

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Solo activamos el timer si no estamos en login
    if (pathname !== '/login') {
      timerRef.current = setTimeout(() => {
        handleLogout();
      }, INACTIVITY_LIMIT);
    }
  };

  useEffect(() => {
    if (pathname === '/login') {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    // Iniciar temporizador al montar
    resetTimer();

    // Agregar listeners para detectar actividad
    const handleActivity = () => resetTimer();
    
    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [pathname]);

  return null;
}
