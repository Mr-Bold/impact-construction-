const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
  console.error('❌ Supabase configuration missing. Check .env file.');
  console.error('Expected SUPABASE_URL + SUPABASE_ANON_KEY/SUPABASE_PUBLISHABLE_KEY + SUPABASE_SERVICE_ROLE_KEY/SUPABASE_SECRET_KEY');
  process.exit(1);
}

// Client for regular authenticated operations
const supabase = createClient(supabaseUrl, supabaseKey);

// Client with service role for admin operations
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

module.exports = { supabase, supabaseAdmin };
