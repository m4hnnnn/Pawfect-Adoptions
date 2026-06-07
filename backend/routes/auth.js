const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const { getDB } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// ─────────────────────────────────────────
// POST /api/auth/signup
// Create a new user account
// ─────────────────────────────────────────
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;

  // Validate inputs
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const db = getDB();

  // Check if email already exists
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'An account with this email already exists.' });
  }

  // Hash the password (salt rounds = 12)
  const hashedPassword = bcrypt.hashSync(password, 12);

  // Insert into database
  const insert = db.prepare(`
    INSERT INTO users (name, email, password)
    VALUES (?, ?, ?)
  `);

  const result = insert.run(name.trim(), email.toLowerCase().trim(), hashedPassword);

  // Issue JWT token
  const token = jwt.sign(
    { id: result.lastInsertRowid, email: email.toLowerCase(), name: name.trim() },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.status(201).json({
    message: 'Account created successfully!',
    token,
    user: { id: result.lastInsertRowid, name: name.trim(), email: email.toLowerCase() }
  });
});

// ─────────────────────────────────────────
// POST /api/auth/login
// Sign in with email + password
// ─────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = getDB();

  // Look up user by email
  const user = db.prepare('SELECT * FROM users WHERE email = ? AND is_active = 1').get(email.toLowerCase().trim());

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Compare submitted password with stored hash
  const passwordMatch = bcrypt.compareSync(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  // Update last login timestamp
  db.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").run(user.id);

  // Issue JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    message: 'Signed in successfully!',
    token,
    user: { id: user.id, name: user.name, email: user.email }
  });
});

// ─────────────────────────────────────────
// GET /api/auth/me
// Get current logged-in user's profile
// ─────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const db = getDB();
  const user = db.prepare('SELECT id, name, email, created_at, last_login FROM users WHERE id = ?').get(req.user.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  // Also fetch their favorites
  const favorites = db.prepare('SELECT cat_id FROM favorites WHERE user_id = ?').all(user.id).map(r => r.cat_id);

  return res.json({ ...user, favorites });
});

// ─────────────────────────────────────────
// DELETE /api/auth/account
// Delete a user's own account
// ─────────────────────────────────────────
router.delete('/account', requireAuth, (req, res) => {
  const db = getDB();
  db.prepare('DELETE FROM users WHERE id = ?').run(req.user.id);
  return res.json({ message: 'Account deleted successfully.' });
});

module.exports = router;
