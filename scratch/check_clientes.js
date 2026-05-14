const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: 'apps/api/.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkTable() {
  const { data, error } = await supabase.from('clientes').select('*').limit(1);
  if (error) console.error(error);
  else console.log('Columns:', Object.keys(data[0] || {}));
}

checkTable();
