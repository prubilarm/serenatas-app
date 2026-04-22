import { createClient } from '@supabase/supabase-js';

// En móvil, asegúrate de reemplazar estas con tus llaves reales
const supabaseUrl = 'https://megdrliorufacfkpdspl.supabase.co';
const supabaseAnonKey = 'sb_publishable_tORcGtcfh-eFEYYFPy1iXw_h1zBY6DM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
