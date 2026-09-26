const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, optionalAuthenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

const makeRequestNumber = () => `REQ-${new Date().getFullYear()}-${Date.now().toString().slice(-8)}`;

const getRequestForUser = async (requestId, user) => {
  const { data, error } = await supabaseAdmin.from('service_requests').select('id, user_id').eq('id', requestId).maybeSingle();
  if (error) throw error;
  if (!data || (user.userType !== 'admin' && data.user_id !== user.sub)) return null;
  return data;
};

const notify = async (userId, title, message, requestId) => {
  if (!userId) return;
  await supabaseAdmin.from('notifications').insert({ user_id: userId, title, message, notification_type: 'request', related_request_id: requestId });
};

// Get all requests (customer or admin)
router.get('/', authenticate, async (req, res, next) => {
  try {
    let query = supabaseAdmin
      .from('service_requests')
      .select('*, related_project:projects(id, title, slug)')
      .order('created_at', { ascending: false });

    if (req.user.userType !== 'admin') query = query.eq('user_id', req.user.sub);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Get request by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('service_requests').select('*').eq('id', req.params.id).maybeSingle();
    if (error) throw error;
    if (!data || (req.user.userType !== 'admin' && data.user_id !== req.user.sub)) return res.status(404).json({ error: 'Request not found' });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create service request
router.post('/', optionalAuthenticate, async (req, res, next) => {
  try {
    const { name, customer_name, email, customer_email, phone, customer_phone, location, requested_service, description, preferred_date, estimated_budget, related_project_id } = req.body;
    const request = {
      request_number: makeRequestNumber(),
      user_id: req.user?.sub || null,
      customer_name: name || customer_name,
      customer_email: email || customer_email,
      customer_phone: phone || customer_phone,
      location,
      requested_service,
      description,
      preferred_date: preferred_date || null,
      estimated_budget: estimated_budget || null,
      related_project_id: related_project_id || null,
    };

    if (!request.customer_name || !request.customer_email || !request.customer_phone || !request.description) {
      return res.status(400).json({ error: 'Name, email, phone, and description are required' });
    }

    const { data, error } = await supabaseAdmin.from('service_requests').insert(request).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.post('/:id/attachments', authenticate, upload.single('file'), async (req, res, next) => {
  try {
    const request = await getRequestForUser(req.params.id, req.user);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'request-attachments';
    const storagePath = `${request.id}/${crypto.randomUUID()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(storagePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicFile } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);
    const { data, error } = await supabaseAdmin.from('request_attachments').insert({
      request_id: request.id,
      file_url: publicFile.publicUrl,
      file_name: req.file.originalname,
      file_size: req.file.size,
    }).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update request status (admin only)
router.put('/:id/status', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['Submitted', 'Reviewing', 'Quoted', 'Accepted', 'In Progress', 'Completed', 'Rejected'];
    if (!allowedStatuses.includes(status)) return res.status(400).json({ error: 'Invalid request status' });
    const { data, error } = await supabaseAdmin.from('service_requests').update({ status }).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Request not found' });
    await notify(data.user_id, 'Request status updated', `Your request is now ${status}.`, data.id);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Add message to request
router.post('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const request = await getRequestForUser(req.params.id, req.user);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    if (!req.body.message?.trim()) return res.status(400).json({ error: 'Message is required' });
    const { data, error } = await supabaseAdmin.from('request_messages').insert({
      request_id: request.id,
      sender_id: req.user.sub,
      message_text: req.body.message.trim(),
      is_admin_message: req.user.userType === 'admin',
    }).select('*, sender:users(email)').single();
    if (error) throw error;
    if (req.user.userType === 'admin') {
      await notify(request.user_id, 'New request message', 'An administrator replied to your request.', request.id);
    } else {
      const { data: admins } = await supabaseAdmin.from('users').select('id').eq('user_type', 'admin');
      await Promise.all((admins || []).map((admin) => notify(admin.id, 'New customer message', 'A customer sent a request message.', request.id)));
    }
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Get request messages
router.get('/:id/messages', authenticate, async (req, res, next) => {
  try {
    const request = await getRequestForUser(req.params.id, req.user);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const { data, error } = await supabaseAdmin.from('request_messages').select('*, sender:users(email)').eq('request_id', request.id).order('created_at');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

// Create quotation
router.post('/:id/quotation', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { service, description, estimated_cost, additional_charges, valid_until, notes } = req.body;
    if (!service || estimated_cost === undefined || !valid_until) return res.status(400).json({ error: 'Service, estimated cost, and validity date are required' });
    const total = Number(estimated_cost) + Number(additional_charges || 0);
    if (!Number.isFinite(total) || total < 0) return res.status(400).json({ error: 'Quotation amounts must be valid' });
    const request = await getRequestForUser(req.params.id, req.user);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const { data, error } = await supabaseAdmin.from('quotations').upsert({ request_id: request.id, service, description: description || null, estimated_cost, additional_charges: additional_charges || 0, total, valid_until, notes: notes || null }, { onConflict: 'request_id' }).select('*').single();
    if (error) throw error;
    await supabaseAdmin.from('service_requests').update({ status: 'Quoted' }).eq('id', request.id);
    await notify(request.user_id, 'New quotation', 'A quotation is ready for your service request.', request.id);
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Get quotation
router.get('/:id/quotation', authenticate, async (req, res, next) => {
  try {
    const request = await getRequestForUser(req.params.id, req.user);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    const { data, error } = await supabaseAdmin.from('quotations').select('*').eq('request_id', request.id).maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Quotation not found' });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Respond to quotation
router.put('/:id/quotation/response', authenticate, async (req, res, next) => {
  try {
    const request = await getRequestForUser(req.params.id, req.user);
    if (!request || req.user.userType === 'admin') return res.status(404).json({ error: 'Request not found' });
    if (!['accepted', 'declined'].includes(req.body.response)) return res.status(400).json({ error: 'Response must be accepted or declined' });
    const { data, error } = await supabaseAdmin.from('quotations').update({ customer_response: req.body.response }).eq('request_id', request.id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Quotation not found' });
    await supabaseAdmin.from('service_requests').update({ status: req.body.response === 'accepted' ? 'Accepted' : 'Rejected' }).eq('id', request.id);
    const { data: admins } = await supabaseAdmin.from('users').select('id').eq('user_type', 'admin');
    await Promise.all((admins || []).map((admin) => notify(admin.id, 'Quotation response', `A customer ${req.body.response} a quotation.`, request.id)));
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
