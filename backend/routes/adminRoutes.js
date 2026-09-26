const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(authenticate, requireAdmin);

// Get dashboard stats
router.get('/dashboard/stats', async (req, res, next) => {
  try {
    const [projects, customers, pendingRequests, completedRequests] = await Promise.all([
      supabaseAdmin.from('projects').select('id', { count: 'exact', head: true }),
      supabaseAdmin.from('users').select('id', { count: 'exact', head: true }).eq('user_type', 'customer'),
      supabaseAdmin.from('service_requests').select('id', { count: 'exact', head: true }).in('status', ['Submitted', 'Reviewing']),
      supabaseAdmin.from('service_requests').select('id', { count: 'exact', head: true }).eq('status', 'Completed'),
    ]);

    const failedQuery = [projects, customers, pendingRequests, completedRequests].find((result) => result.error);
    if (failedQuery) throw failedQuery.error;

    res.json({
      totalProjects: projects.count || 0,
      totalCustomers: customers.count || 0,
      pendingRequests: pendingRequests.count || 0,
      completedRequests: completedRequests.count || 0,
    });
  } catch (error) {
    next(error);
  }
});

// Get analytics
router.get('/analytics', async (req, res, next) => {
  try {
    const [projects, views, likes, ratings, requests] = await Promise.all([
      supabaseAdmin.from('projects').select('id, title, view_count, like_count, average_rating, rating_count'),
      supabaseAdmin.from('project_views').select('id'),
      supabaseAdmin.from('likes').select('id'),
      supabaseAdmin.from('ratings').select('rating'),
      supabaseAdmin.from('service_requests').select('status'),
    ]);
    const failedQuery = [projects, views, likes, ratings, requests].find((result) => result.error);
    if (failedQuery) throw failedQuery.error;

    const ratingValues = ratings.data || [];
    const requestStatuses = (requests.data || []).reduce((counts, request) => {
      counts[request.status] = (counts[request.status] || 0) + 1;
      return counts;
    }, {});
    const projectRows = projects.data || [];
    res.json({
      totals: {
        projects: projectRows.length,
        views: (views.data || []).length,
        likes: (likes.data || []).length,
        ratings: ratingValues.length,
        averageRating: ratingValues.length ? Number((ratingValues.reduce((sum, item) => sum + item.rating, 0) / ratingValues.length).toFixed(1)) : 0,
        requests: (requests.data || []).length,
      },
      requestStatuses,
      topProjects: [...projectRows].sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
});

// Category management
router.get('/categories', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('categories').select('*').order('display_order').order('name');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const { name, description, display_order, is_active } = req.body;
    if (!name?.trim()) return res.status(400).json({ error: 'Category name is required' });
    const { data, error } = await supabaseAdmin
      .from('categories')
      .insert({ name: name.trim(), description: description || null, display_order: display_order || 0, is_active: is_active !== false })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    const updates = {};
    if (req.body.name !== undefined) updates.name = req.body.name.trim();
    if (req.body.description !== undefined) updates.description = req.body.description;
    if (req.body.display_order !== undefined) updates.display_order = req.body.display_order;
    if (req.body.is_active !== undefined) updates.is_active = req.body.is_active;
    const { data, error } = await supabaseAdmin.from('categories').update(updates).eq('id', req.params.id).select('*').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Category not found' });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('categories').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Customer management
router.get('/customers', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, is_active, created_at, profiles(first_name, last_name, phone_number, location)')
      .eq('user_type', 'customer')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

router.get('/customers/:id', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, is_active, created_at, profiles(first_name, last_name, phone_number, location, bio)')
      .eq('id', req.params.id)
      .eq('user_type', 'customer')
      .maybeSingle();
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Customer not found' });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Business settings
router.get('/settings', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('business_settings').select('*').limit(1).maybeSingle();
    if (error) throw error;
    res.json(data || null);
  } catch (error) {
    next(error);
  }
});

router.put('/settings', async (req, res, next) => {
  try {
    const fields = ['business_name', 'business_phone', 'business_email', 'business_address', 'business_hours', 'whatsapp_number', 'logo_url'];
    const updates = Object.fromEntries(fields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    if (!updates.business_name?.trim()) return res.status(400).json({ error: 'Business name is required' });

    const { data: current, error: lookupError } = await supabaseAdmin.from('business_settings').select('id').limit(1).maybeSingle();
    if (lookupError) throw lookupError;

    const query = current
      ? supabaseAdmin.from('business_settings').update(updates).eq('id', current.id)
      : supabaseAdmin.from('business_settings').insert(updates);
    const { data, error } = await query.select('*').single();
    if (error) throw error;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
