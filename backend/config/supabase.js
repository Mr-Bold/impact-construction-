const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
  console.error('❌ Supabase configuration missing. Check .env file.');
  process.exit(1);
}

// Client for regular authenticated operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

module.exports = { supabase, supabaseAdmin };
