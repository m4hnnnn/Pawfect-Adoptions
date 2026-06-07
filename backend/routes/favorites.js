const express = require('express');
const { getDB } = require('../database/db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/favorites — get all saved cats for logged-in user
router.get('/', requireAuth, (req, res) => {
  const db = getDB();
  const favorites = db.prepare('SELECT cat_id, saved_at FROM favorites WHERE user_id = ? ORDER BY saved_at DESC').all(req.user.id);
  return res.json({ favorites });
});

// POST /api/favorites/:catId — save a cat
router.post('/:catId', requireAuth, (req, res) => {
  const catId = parseInt(req.params.catId);
  if (!catId) return res.status(400).json({ error: 'Invalid cat ID.' });

  const db = getDB();
  try {
    db.prepare('INSERT INTO favorites (user_id, cat_id) VALUES (?, ?)').run(req.user.id, catId);
    return res.status(201).json({ message: 'Cat saved to favorites!' });
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Already in favorites.' });
    }
    throw err;
  }
});

// DELETE /api/favorites/:catId — remove a cat
router.delete('/:catId', requireAuth, (req, res) => {
  const catId = parseInt(req.params.catId);
  const db = getDB();
  db.prepare('DELETE FROM favorites WHERE user_id = ? AND cat_id = ?').run(req.user.id, catId);
  return res.json({ message: 'Removed from favorites.' });
});

module.exports = router;
