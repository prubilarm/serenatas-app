const { createClient } = require('@supabase/supabase-js');
const s = createClient('https://megdrliorufacfkpdspl.supabase.co', 'sb_publishable_tORcGtcfh-eFEYYFPy1iXw_h1zBY6DM');
s.from('serenatas').select('*').then(r => {
  if (r.error) console.error('ERROR:', r.error);
  else console.log('DATA:', JSON.stringify(r.data, null, 2));
  process.exit();
});
