const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, 'pawfect.db');

function initDatabase() {
  const db = new Database(DB_PATH);

  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // ─────────────────────────────────────────
  // USERS TABLE
  // Stores login credentials and profile info
  // ─────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL UNIQUE,
      password    TEXT    NOT NULL,       -- bcrypt hashed, never plain text
      created_at  TEXT    NOT NULL DEFAULT (datetime('now')),
      last_login  TEXT,
      is_active   INTEGER NOT NULL DEFAULT 1
    );
  `);

  // ─────────────────────────────────────────
  // FAVORITES TABLE
  // Links users to cats they have saved
  // ─────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      cat_id     INTEGER NOT NULL,
      saved_at   TEXT    NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, cat_id)
    );
  `);

  // ─────────────────────────────────────────
  // ADOPTION APPLICATIONS TABLE
  // Stores adoption inquiry form submissions
  // ─────────────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS applications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
      cat_id      INTEGER NOT NULL,
      name        TEXT    NOT NULL,
      email       TEXT    NOT NULL,
      message     TEXT    NOT NULL,
      status      TEXT    NOT NULL DEFAULT 'pending',  -- pending | approved | rejected
      submitted_at TEXT   NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─────────────────────────────────────────
  // INDEXES for fast lookups
  // ─────────────────────────────────────────
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_users_email      ON users(email);
    CREATE INDEX IF NOT EXISTS idx_favorites_user   ON favorites(user_id);
    CREATE INDEX IF NOT EXISTS idx_applications_user ON applications(user_id);
  `);

  console.log('✅ Database initialized at', DB_PATH);
  console.log('📋 Tables created: users, favorites, applications');

  db.close();
}

initDatabase();
module.exports = { DB_PATH };
