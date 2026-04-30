import { createClient } from '@supabase/supabase-js';

// Usando variables de entorno seguras con el prefijo EXPO_PUBLIC_
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://megdrliorufacfkpdspl.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_tORcGtcfh-eFEYYFPy1iXw_h1zBY6DM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
