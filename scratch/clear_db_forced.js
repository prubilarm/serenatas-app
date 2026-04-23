const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/api/.env' });

// USAMOS LA SERVICE ROLE KEY PARA SALTAR POLÍTICAS RLS
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearSerenatas() {
    console.log('Borrando todas las serenatas con Service Key...');
    const { data, error } = await supabase.from('serenatas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) console.error('Error:', error);
    else console.log('¡Base de datos vaciada COMPLETAMENTE!');
}

clearSerenatas();
