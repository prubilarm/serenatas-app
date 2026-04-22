import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  const errorMsg = '⚠️ Error: Faltan SUPABASE_URL o llaves API en el entorno.';
  console.error(errorMsg);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
