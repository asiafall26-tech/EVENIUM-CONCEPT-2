const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const envContent = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8');
  const getEnv = (key) => {
    const m = envContent.match(new RegExp(`^${key}=(.*)$`, 'm'));
    return m ? m[1].trim() : '';
  };

  const url = getEnv('NEXT_PUBLIC_SUPABASE_URL');
  const key = getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  const supabase = createClient(url, key);

  const html = fs.readFileSync(path.join(__dirname, '..', 'REDISIGN MODELE', 'extracted', 'index.html'));
  
  // Upload to BOTH custom-models and custom_models just to be 100% sure!
  const res1 = await supabase.storage.from('evenium_assets').upload(
    'custom-models/fatou-ibrahima-v2/index.html',
    html,
    { contentType: 'text/html; charset=utf-8', upsert: true }
  );
  console.log('Upload result custom-models (with hyphen):', res1);

  const res2 = await supabase.storage.from('evenium_assets').upload(
    'custom_models/fatou-ibrahima-v2/index.html',
    html,
    { contentType: 'text/html; charset=utf-8', upsert: true }
  );
  console.log('Upload result custom_models (with underscore):', res2);
}

main().catch(console.error);
