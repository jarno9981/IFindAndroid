const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
require('dotenv').config();

const { db, DATA_DIR } = require('./db');

const PORT = parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '127.0.0.1';
const JWT_SECRET = process.env.JWT_SECRET || (() => {
  const f = path.join(DATA_DIR, 'jwt.secret');
  if (fs.existsSync(f)) return fs.readFileSync(f, 'utf8').trim();
  const s = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(f, s, { mode: 0o600 });
  return s;
})();
const PUBLIC_BASE = process.env.PUBLIC_BASE || 'https://location.beertengangs.com';

const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const LOG_DIR = path.join(DATA_DIR, 'logs');
fs.mkdirSync(LOG_DIR, { recursive: true });

// --- log streams ---
const locationLog = fs.createWriteStream(path.join(LOG_DIR, 'locations.ndjson'), { flags: 'a' });
const accessLog   = fs.createWriteStream(path.join(LOG_DIR, 'access.log'),       { flags: 'a' });

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(morgan('combined', { stream: accessLog }));
app.use(morgan('tiny'));

// Serve uploaded media
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '7d', immutable: false }));

// --- auth helpers ---
const auth = (req, res, next) => {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer\s+(.+)$/i);
  if (!m) return res.status(401).json({ error: 'no_token' });
  try {
    req.user = jwt.verify(m[1], JWT_SECRET);
    next();
  } catch (e) {
    return res.status(401).json({ error: 'bad_token' });
  }
};

const sign = (u) => jwt.sign({ sub: u.id, email: u.email, name: u.name }, JWT_SECRET, { expiresIn: '180d' });
const initialsOf = (name) => name.split(/\s+/).filter(Boolean).slice(0, 2).map(s => s[0].toUpperCase()).join('') || 'YO';
const publicUser = (u) => ({
  id: u.id, email: u.email, name: u.name, initials: u.initials, accent: u.accent,
  profile_image: u.profile_image ? `${PUBLIC_BASE}${u.profile_image}` : null,
});

// --- multer (images) ---
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_DIR),
    filename: (req, file, cb) => {
      const ext = (path.extname(file.originalname) || '.jpg').toLowerCase().slice(0, 5);
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => /^image\//i.test(file.mimetype) ? cb(null, true) : cb(new Error('not_image')),
});

// --- routes ---
app.get('/health', (req, res) => res.json({ ok: true, t: Date.now() }));

app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) return res.status(400).json({ error: 'missing_fields' });
  if (password.length < 6) return res.status(400).json({ error: 'weak_password' });

  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (exists) return res.status(409).json({ error: 'email_in_use' });

  const id = crypto.randomBytes(12).toString('hex');
  const hash = await bcrypt.hash(password, 11);
  const now = Date.now();
  const accents = ['#7CC4FF', '#B8A4FF', '#FFB787', '#87E0A9'];
  const accent = accents[Math.floor(Math.random() * accents.length)];

  db.prepare(`INSERT INTO users (id, email, password_hash, name, initials, accent, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`)
    .run(id, email.toLowerCase(), hash, name, initialsOf(name), accent, now);

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json({ token: sign(user), user: publicUser(user) });
});

app.post('/api/auth/signin', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'missing_fields' });
  const u = db.prepare('SELECT * FROM users WHERE email = ?').get(String(email).toLowerCase());
  if (!u) return res.status(401).json({ error: 'invalid_credentials' });
  const ok = await bcrypt.compare(password, u.password_hash);
  if (!ok) return res.status(401).json({ error: 'invalid_credentials' });
  res.json({ token: sign(u), user: publicUser(u) });
});

app.get('/api/me', auth, (req, res) => {
  const u = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
  if (!u) return res.status(404).json({ error: 'not_found' });
  res.json(publicUser(u));
});

app.post('/api/me/profile-image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  const rel = `/uploads/${req.file.filename}`;
  db.prepare('UPDATE users SET profile_image = ? WHERE id = ?').run(rel, req.user.sub);
  res.json({ url: `${PUBLIC_BASE}${rel}` });
});

app.post('/api/pictures', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'no_file' });
  const id = crypto.randomBytes(10).toString('hex');
  const rel = `/uploads/${req.file.filename}`;
  const lat = req.body.lat ? Number(req.body.lat) : null;
  const lng = req.body.lng ? Number(req.body.lng) : null;
  const caption = req.body.caption ? String(req.body.caption).slice(0, 240) : null;
  db.prepare(`INSERT INTO pictures (id, user_id, path, caption, lat, lng, created_at)
              VALUES (?, ?, ?, ?, ?, ?, ?)`).run(id, req.user.sub, rel, caption, lat, lng, Date.now());
  res.json({ id, url: `${PUBLIC_BASE}${rel}`, caption, lat, lng });
});

app.get('/api/pictures', auth, (req, res) => {
  const rows = db.prepare(`SELECT id, path, caption, lat, lng, created_at
                           FROM pictures WHERE user_id = ? ORDER BY created_at DESC LIMIT 200`)
    .all(req.user.sub);
  res.json(rows.map(r => ({ ...r, url: `${PUBLIC_BASE}${r.path}` })));
});

app.post('/api/location', auth, (req, res) => {
  const { lat, lng, accuracy, ts } = req.body || {};
  if (typeof lat !== 'number' || typeof lng !== 'number') return res.status(400).json({ error: 'bad_coords' });
  const now = Date.now();
  const t = Number.isFinite(ts) ? Number(ts) : now;
  db.prepare(`INSERT INTO locations (user_id, lat, lng, accuracy, ts, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .run(req.user.sub, lat, lng, accuracy ?? null, t, now);
  locationLog.write(JSON.stringify({ user_id: req.user.sub, lat, lng, accuracy: accuracy ?? null, ts: t, at: now }) + '\n');
  res.json({ ok: true });
});

app.get('/api/location/me', auth, (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || '100', 10), 1000);
  const rows = db.prepare(`SELECT lat, lng, accuracy, ts FROM locations WHERE user_id = ? ORDER BY ts DESC LIMIT ?`)
    .all(req.user.sub, limit);
  res.json(rows);
});

app.get('/api/people', auth, (req, res) => {
  // For now: everyone the user has befriended + their last known position.
  const rows = db.prepare(`
    SELECT u.id, u.name, u.initials, u.accent, u.profile_image,
           l.lat AS last_lat, l.lng AS last_lng, l.ts AS last_ts
    FROM friendships f
    JOIN users u ON u.id = f.friend_id
    LEFT JOIN locations l ON l.id = (
      SELECT id FROM locations WHERE user_id = u.id ORDER BY ts DESC LIMIT 1
    )
    WHERE f.user_id = ?
  `).all(req.user.sub);
  res.json(rows.map(r => ({
    id: r.id, name: r.name, initials: r.initials, accent: r.accent,
    profile_image: r.profile_image ? `${PUBLIC_BASE}${r.profile_image}` : null,
    last_lat: r.last_lat, last_lng: r.last_lng, last_ts: r.last_ts,
  })));
});

app.post('/api/people/add', auth, (req, res) => {
  const { email } = req.body || {};
  if (!email) return res.status(400).json({ error: 'missing_email' });
  const friend = db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).toLowerCase());
  if (!friend) return res.status(404).json({ error: 'no_such_user' });
  if (friend.id === req.user.sub) return res.status(400).json({ error: 'cannot_add_self' });
  const now = Date.now();
  db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)')
    .run(req.user.sub, friend.id, now);
  db.prepare('INSERT OR IGNORE INTO friendships (user_id, friend_id, created_at) VALUES (?, ?, ?)')
    .run(friend.id, req.user.sub, now);
  res.json({ ok: true });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'server_error', detail: err.message });
});

app.listen(PORT, HOST, () => {
  console.log(`pinpoint-relay listening on http://${HOST}:${PORT}`);
  console.log(`data dir: ${DATA_DIR}`);
});
