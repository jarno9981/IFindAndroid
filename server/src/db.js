const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.PINPOINT_DATA_DIR || path.resolve(__dirname, '..', 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(path.join(DATA_DIR, 'uploads'), { recursive: true });

const db = new Database(path.join(DATA_DIR, 'pinpoint.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name          TEXT NOT NULL,
  initials      TEXT NOT NULL,
  accent        TEXT NOT NULL DEFAULT '#7CC4FF',
  profile_image TEXT,
  created_at    INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS locations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lat        REAL NOT NULL,
  lng        REAL NOT NULL,
  accuracy   REAL,
  ts         INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_locations_user_ts ON locations(user_id, ts DESC);

CREATE TABLE IF NOT EXISTS pictures (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  path       TEXT NOT NULL,
  caption    TEXT,
  lat        REAL,
  lng        REAL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_pictures_user ON pictures(user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS friendships (
  user_id   TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  friend_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, friend_id)
);
`);

module.exports = { db, DATA_DIR };
