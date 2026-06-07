const express = require('express');
const { getDB } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// POST /api/applications — submit an adoption application
router.post('/', (req, res) => {
  const { cat_id, name, email, message, user_id } = req.body;

  if (!cat_id || !name || !email || !message) {
    return res.status(400).json({ error: 'cat_id, name, email, and message are required.' });
  }

  const db = getDB();
  const result = db.prepare(`
    INSERT INTO applications (user_id, cat_id, name, email, message)
    VALUES (?, ?, ?, ?, ?)
  `).run(user_id || null, cat_id, name.trim(), email.toLowerCase().trim(), message.trim());

  return res.status(201).json({
    message: 'Application submitted! We will be in touch within 24 hours.',
    application_id: result.lastInsertRowid
  });
});

// GET /api/applications/mine — get current user's applications
router.get('/mine', requireAuth, (req, res) => {
  const db = getDB();
  const apps = db.prepare('SELECT * FROM applications WHERE user_id = ? ORDER BY submitted_at DESC').all(req.user.id);
  return res.json({ applications: apps });
});

module.exports = router;
