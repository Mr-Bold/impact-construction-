const express = require('express');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const [settingsResult, projectsResult, requestsResult] = await Promise.all([
      supabaseAdmin.from('business_settings').select('business_name, business_phone, business_email, business_address, business_hours, whatsapp_number, logo_url').limit(1).maybeSingle(),
      supabaseAdmin.from('projects').select('id', { count: 'exact', head: true }).eq('is_published', true),
      supabaseAdmin.from('service_requests').select('id', { count: 'exact', head: true }),
    ]);
    if (settingsResult.error) throw settingsResult.error;
    if (projectsResult.error) throw projectsResult.error;
    if (requestsResult.error) throw requestsResult.error;
    res.json({ ...(settingsResult.data || {}), stats: { projects: projectsResult.count || 0, requests: requestsResult.count || 0 } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
