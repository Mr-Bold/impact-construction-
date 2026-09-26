const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { supabaseAdmin } = require('../config/supabase');

const router = express.Router();

const createToken = (user) => jwt.sign(
  { sub: user.id, email: user.email, userType: user.user_type },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRY || '7d' }
);

const publicUser = (user, profile = null) => ({
  id: user.id,
  email: user.email,
  userType: user.user_type,
  profile,
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ error: 'All registration fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const { data: existingUser, error: lookupError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (lookupError) throw lookupError;
    if (existingUser) return res.status(409).json({ error: 'An account with this email already exists' });

    const passwordHash = await bcrypt.hash(password, 12);
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({ email: normalizedEmail, password_hash: passwordHash, user_type: 'customer' })
      .select('id, email, user_type')
      .single();

    if (userError) throw userError;

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({ user_id: user.id, first_name: firstName.trim(), last_name: lastName.trim(), phone_number: phone.trim() })
      .select('first_name, last_name, phone_number, profile_picture_url, location, bio')
      .single();

    if (profileError) {
      await supabaseAdmin.from('users').delete().eq('id', user.id);
      throw profileError;
    }

    res.status(201).json({ token: createToken(user), user: publicUser(user, profile) });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, password_hash, user_type, is_active')
      .eq('email', email.trim().toLowerCase())
      .maybeSingle();

    if (userError) throw userError;
    const passwordMatches = user && await bcrypt.compare(password, user.password_hash);
    if (!user || !passwordMatches || !user.is_active) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, phone_number, profile_picture_url, location, bio')
      .eq('user_id', user.id)
      .maybeSingle();

    res.json({ token: createToken(user), user: publicUser(user, profile) });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

// Forgot Password
router.post('/forgot-password', async (req, res, next) => {
  try {
    const email = req.body.email?.trim().toLowerCase();
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data: user, error } = await supabaseAdmin.from('users').select('id').eq('email', email).maybeSingle();
    if (error) throw error;

    const response = { message: 'If an account exists for this email, reset instructions have been issued.' };
    if (user && process.env.NODE_ENV !== 'production') {
      response.resetToken = jwt.sign({ sub: user.id, purpose: 'password-reset' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    }
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// Reset Password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: 'Reset token and password are required' });
    if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    if (payload.purpose !== 'password-reset') return res.status(400).json({ error: 'Invalid reset token' });

    const passwordHash = await bcrypt.hash(password, 12);
    const { data, error } = await supabaseAdmin.from('users').update({ password_hash: passwordHash }).eq('id', payload.sub).select('id').maybeSingle();
    if (error) throw error;
    if (!data) return res.status(400).json({ error: 'Invalid reset token' });
    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
