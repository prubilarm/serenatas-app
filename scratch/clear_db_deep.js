const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/api/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearAll() {
    console.log('Borrando pagos asociados...');
    await supabase.from('pagos').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Borrando todas las serenatas...');
    const { error } = await supabase.from('serenatas').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (error) console.error('Error:', error);
    else console.log('¡Base de datos vaciada COMPLETAMENTE (Serenatas y Pagos)!');
}

clearAll();
