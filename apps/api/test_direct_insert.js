const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('Using Key:', supabaseKey.substring(0, 10) + '...');
  const { data, error } = await supabase
    .from('clientes')
    .insert([{ nombre: 'Script Test', telefono: '000' }])
    .select();

  if (error) console.error('ERROR:', error);
  else console.log('SUCCESS:', data);
  process.exit();
}

testInsert();
