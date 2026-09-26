const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 },
});

const makeSlug = (title) => title
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const getUniqueSlug = async (requestedSlug, projectId = null) => {
  const baseSlug = requestedSlug || `project-${Date.now()}`;
  let candidate = baseSlug;
  let suffix = 1;

  while (true) {
    let query = supabaseAdmin.from('projects').select('id').eq('slug', candidate).maybeSingle();
    if (projectId) query = query.neq('id', projectId);
    const { data, error } = await query;
    if (error) throw error;
    if (!data) return candidate;
    suffix += 1;
    candidate = `${baseSlug}-${suffix}`;
  }
};

const projectFields = [
  'title', 'slug', 'description', 'category_id', 'location', 'completion_date',
  'services', 'materials', 'duration', 'cover_image_url', 'video_url',
  'before_image_url', 'after_image_url', 'is_featured', 'is_published',
];

const pickProjectFields = (body) => Object.fromEntries(
  projectFields.filter((field) => body[field] !== undefined).map((field) => [field, body[field]])
);

// Get all projects
router.get('/', async (req, res, next) => {
  try {
    const { category, featured } = req.query;
    const query = supabaseAdmin
      .from('projects')
      .select('*, category:categories(id, name), media:project_media(id, media_url, media_type, thumbnail_url, display_order)')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (featured === 'true') query.eq('is_featured', true);

    const { data, error } = await query;
    if (error) throw error;
    const projects = data || [];
    res.json(category && category !== 'all'
      ? projects.filter((project) => project.category?.name?.toLowerCase() === category.toLowerCase())
      : projects);
  } catch (error) {
    next(error);
  }
});

// Get project by ID
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const column = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id) ? 'id' : 'slug';
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select('*, category:categories(id, name), media:project_media(id, media_url, media_type, thumbnail_url, display_order)')
      .eq(column, id)
      .eq('is_published', true)
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Project not found' });

    const nextViewCount = (data.view_count || 0) + 1;
    const { data: updatedProject, error: viewError } = await supabaseAdmin
      .from('projects')
      .update({ view_count: nextViewCount })
      .eq('id', data.id)
      .select('view_count')
      .single();
    if (viewError) throw viewError;
    data.view_count = updatedProject.view_count;
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Create project (admin only)
router.post('/', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { title } = req.body;
    if (!title?.trim()) return res.status(400).json({ error: 'Project title is required' });

    const project = { ...pickProjectFields(req.body), title: title.trim() };
    project.slug = await getUniqueSlug(project.slug?.trim() || makeSlug(title));
    const { data, error } = await supabaseAdmin.from('projects').insert(project).select('*').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Update project (admin only)
router.put('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const updates = pickProjectFields(req.body);
    if (updates.title) updates.title = updates.title.trim();
    if (updates.title && !updates.slug) updates.slug = makeSlug(updates.title);
    if (updates.slug) updates.slug = await getUniqueSlug(updates.slug.trim(), req.params.id);
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .maybeSingle();

    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Project not found' });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Delete project (admin only)
router.delete('/:id', authenticate, requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from('projects').delete().eq('id', req.params.id);
    if (error) throw error;
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.post('/:id/media', authenticate, requireAdmin, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Image file is required' });
    const bucket = process.env.SUPABASE_PROJECT_MEDIA_BUCKET || 'project-media';
    const storagePath = `${req.params.id}/${crypto.randomUUID()}-${req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const { data: buckets, error: bucketsError } = await supabaseAdmin.storage.listBuckets();
    if (bucketsError) throw bucketsError;
    if (!buckets.some((item) => item.name === bucket)) {
      const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucket, { public: true });
      if (createBucketError && !createBucketError.message?.toLowerCase().includes('already exists')) throw createBucketError;
    }
    const { error: uploadError } = await supabaseAdmin.storage.from(bucket).upload(storagePath, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (uploadError) throw uploadError;
    const { data: publicFile } = supabaseAdmin.storage.from(bucket).getPublicUrl(storagePath);
    const { data, error } = await supabaseAdmin.from('project_media').insert({ project_id: req.params.id, media_url: publicFile.publicUrl, media_type: req.file.mimetype.startsWith('video/') ? 'video' : 'image', display_order: 0 }).select('*').single();
    if (error) throw error;
    if (req.body.is_cover === 'true' || req.body.is_cover === true) {
      const { error: coverError } = await supabaseAdmin.from('projects').update({ cover_image_url: publicFile.publicUrl }).eq('id', req.params.id);
      if (coverError) throw coverError;
    }
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Like project
router.post('/:id/like', authenticate, async (req, res, next) => {
  try {
    const { data: existing, error: lookupError } = await supabaseAdmin.from('likes').select('id').eq('user_id', req.user.sub).eq('project_id', req.params.id).maybeSingle();
    if (lookupError) throw lookupError;

    if (existing) {
      const { error } = await supabaseAdmin.from('likes').delete().eq('id', existing.id);
      if (error) throw error;
      const { count, error: countError } = await supabaseAdmin.from('likes').select('id', { count: 'exact', head: true }).eq('project_id', req.params.id);
      if (countError) throw countError;
      await supabaseAdmin.from('projects').update({ like_count: count || 0 }).eq('id', req.params.id);
      return res.json({ liked: false, like_count: count || 0 });
    }

    const { error } = await supabaseAdmin.from('likes').insert({ user_id: req.user.sub, project_id: req.params.id });
    if (error) throw error;
    const { count, error: countError } = await supabaseAdmin.from('likes').select('id', { count: 'exact', head: true }).eq('project_id', req.params.id);
    if (countError) throw countError;
    await supabaseAdmin.from('projects').update({ like_count: count || 0 }).eq('id', req.params.id);
    res.json({ liked: true, like_count: count || 0 });
  } catch (error) {
    next(error);
  }
});

// Rate project
router.post('/:id/rate', authenticate, async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be an integer from 1 to 5' });
    const { data, error } = await supabaseAdmin.from('ratings').upsert({ user_id: req.user.sub, project_id: req.params.id, rating, review_text: req.body.review_text || null }, { onConflict: 'user_id,project_id' }).select('*').single();
    if (error) throw error;

    const { data: ratings, error: ratingsError } = await supabaseAdmin.from('ratings').select('rating').eq('project_id', req.params.id);
    if (ratingsError) throw ratingsError;
    const average = ratings.length ? ratings.reduce((sum, item) => sum + item.rating, 0) / ratings.length : 0;
    const averageRating = Number(average.toFixed(1));
    const { error: projectUpdateError } = await supabaseAdmin.from('projects').update({ average_rating: averageRating, rating_count: ratings.length }).eq('id', req.params.id);
    if (projectUpdateError) throw projectUpdateError;
    res.json({ ...data, average_rating: averageRating, rating_count: ratings.length });
  } catch (error) {
    next(error);
  }
});

// Comment on project
router.post('/:id/comments', authenticate, async (req, res, next) => {
  try {
    if (!req.body.comment?.trim()) return res.status(400).json({ error: 'Comment is required' });
    const { data, error } = await supabaseAdmin.from('comments').insert({ user_id: req.user.sub, project_id: req.params.id, comment_text: req.body.comment.trim() }).select('*, user:users(email)').single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

// Get project comments
router.get('/:id/comments', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('comments').select('id, comment_text, created_at, user:users(email)').eq('project_id', req.params.id).eq('is_approved', true).order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
