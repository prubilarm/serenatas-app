import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Falta SUPABASE_URL o SUPABASE_ANON_KEY en las variables de entorno');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
