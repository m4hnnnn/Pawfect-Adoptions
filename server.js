require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes         = require('./routes/auth');
const favoritesRoutes    = require('./routes/favorites');
const applicationsRoutes = require('./routes/applications');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/favorites',    favoritesRoutes);
app.use('/api/applications', applicationsRoutes);

// ─── Health check ─────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Pawfect API is running 🐾' });
});

// ─── 404 handler ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

// ─── Error handler ────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

// ─── Start ────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🌸 Pawfect API running on http://localhost:${PORT}`);
  console.log(`📦 Endpoints: /api/auth, /api/favorites, /api/applications`);
});
