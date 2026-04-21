import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMsg = '⚠️ Error: Faltan SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno de Vercel.';
  console.error(errorMsg);
  // No lanzamos error aquí para no romper el inicio, pero lo registraremos
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
