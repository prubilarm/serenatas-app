const { createClient } = require('@supabase/supabase-js');

// Necesitamos la SERVICE ROLE KEY para crear usuarios saltándose la confirmación de email si es necesario
// O podemos usar la anon key si el registro está abierto, pero es mejor usar el cliente admin.
// Como no tengo la service role key, intentaré crear el usuario usando el registro normal.

const supabaseUrl = 'https://megdrliorufacfkpdspl.supabase.co';
const supabaseAnonKey = 'pb_publishable_tORcGtcfh-eFEYYFPy1iXw_h1zBY6DM'; // Usaré lo que tengo

async function createAdmin() {
  const supabase = createClient(supabaseUrl, 'sb_publishable_tORcGtcfh-eFEYYFPy1iXw_h1zBY6DM');
  
  console.log('Intentando crear usuario admin...');
  const { data, error } = await supabase.auth.signUp({
    email: 'admin@mariachi.com',
    password: 'mariachi2026',
  });

  if (error) {
    console.error('Error al crear usuario:', error.message);
  } else {
    console.log('¡Usuario creado con éxito!', data.user.id);
    console.log('Ahora intenta loguearte en http://localhost:3000/login');
  }
}

createAdmin();
