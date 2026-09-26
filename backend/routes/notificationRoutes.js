const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('notifications').select('*').eq('user_id', req.user.sub).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

router.put('/:id/read', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('notifications').update({ is_read: true }).eq('id', req.params.id).eq('user_id', req.user.sub).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Notification not found' });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
