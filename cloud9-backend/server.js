import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, run, get, all } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { requireAuth, requireAdmin } from './auth.js';

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true, credentials: true }));
app.use(helmet());
app.use(morgan('dev'));

// Initialize DB if first run
const schemaPath = path.join(__dirname, 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');
db.serialize(() => {
  db.exec(schema);
});

// Health
app.get('/health', (req, res) => res.json({ ok: true }));

// Auth
app.post('/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'email and password required' });
    const hash = await bcrypt.hash(password, 10);
    await run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, 'applicant']);
    const user = await get('SELECT id, email, role FROM users WHERE email = ?', [email]);
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user });
  } catch (e) {
    if (String(e).includes('UNIQUE')) return res.status(409).json({ error: 'email already registered' });
    res.status(500).json({ error: 'failed to register', detail: String(e) });
  }
});

app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role } });
  } catch (e) {
    res.status(500).json({ error: 'failed to login', detail: String(e) });
  }
});

app.get('/me', requireAuth, async (req, res) => {
  const user = await get('SELECT id, email, role FROM users WHERE id = ?', [req.user.id]);
  res.json({ user });
});

// Locations (public list; admin manage)
app.get('/locations', async (req, res) => {
  const rows = await all('SELECT * FROM locations WHERE is_active = 1 ORDER BY name');
  res.json(rows);
});

app.post('/locations', requireAuth, requireAdmin, async (req, res) => {
  const { name, address, city, state, zip, phone, is_active = 1 } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const result = await run(
    'INSERT INTO locations (name, address, city, state, zip, phone, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [name, address, city, state, zip, phone, is_active ? 1 : 0]
  );
  const row = await get('SELECT * FROM locations WHERE id = ?', [result.id]);
  res.status(201).json(row);
});

app.put('/locations/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  const { name, address, city, state, zip, phone, is_active } = req.body;
  const cur = await get('SELECT * FROM locations WHERE id = ?', [id]);
  if (!cur) return res.status(404).json({ error: 'not found' });
  await run('UPDATE locations SET name=?, address=?, city=?, state=?, zip=?, phone=?, is_active=? WHERE id=?',
    [
      name ?? cur.name,
      address ?? cur.address,
      city ?? cur.city,
      state ?? cur.state,
      zip ?? cur.zip,
      phone ?? cur.phone,
      (is_active === undefined ? cur.is_active : (is_active ? 1 : 0)),
      id
    ]);
  const row = await get('SELECT * FROM locations WHERE id = ?', [id]);
  res.json(row);
});

app.delete('/locations/:id', requireAuth, requireAdmin, async (req, res) => {
  const id = req.params.id;
  await run('DELETE FROM locations WHERE id = ?', [id]);
  res.json({ ok: true });
});

// Applications
app.post('/applications', requireAuth, async (req, res) => {
  // applicants can submit; location optional
  const { full_name, email, phone, location_id, position, resume_url, cover_letter } = req.body;
  if (!full_name || !email) return res.status(400).json({ error: 'full_name and email required' });
  const result = await run(
    `INSERT INTO applications (user_id, full_name, email, phone, location_id, position, resume_url, cover_letter, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'submitted')`,
    [req.user.id, full_name, email, phone, location_id || null, position, resume_url, cover_letter]
  );
  const row = await get('SELECT * FROM applications WHERE id = ?', [result.id]);
  res.status(201).json(row);
});

// Applicants can see their own
app.get('/applications/mine', requireAuth, async (req, res) => {
  const rows = await all('SELECT * FROM applications WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
  res.json(rows);
});

// Admin: list/search
app.get('/applications', requireAuth, requireAdmin, async (req, res) => {
  const { status, location_id, q } = req.query;
  let sql = 'SELECT a.*, l.name as location_name FROM applications a LEFT JOIN locations l ON a.location_id = l.id WHERE 1=1';
  const params = [];
  if (status) { sql += ' AND a.status = ?'; params.push(status); }
  if (location_id) { sql += ' AND a.location_id = ?'; params.push(location_id); }
  if (q) {
    sql += ' AND (a.full_name LIKE ? OR a.email LIKE ? OR a.phone LIKE ? OR a.position LIKE ?)';
    params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
  }
  sql += ' ORDER BY a.created_at DESC';
  const rows = await all(sql, params);
  res.json(rows);
});

// Admin: update status or notes
app.patch('/applications/:id/status', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const allowed = ['submitted','under_review','interview','hired','rejected','withdrawn'];
  if (!allowed.includes(status)) return res.status(400).json({ error: 'invalid status' });
  await run('UPDATE applications SET status=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?',
    [status, notes ?? null, id]);
  const row = await get('SELECT * FROM applications WHERE id = ?', [id]);
  res.json(row);
});

// Admin: general update
app.patch('/applications/:id', requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const cur = await get('SELECT * FROM applications WHERE id = ?', [id]);
  if (!cur) return res.status(404).json({ error: 'not found' });
  const {
    full_name, email, phone, location_id, position, resume_url, cover_letter, notes
  } = req.body;
  await run(
    `UPDATE applications SET full_name=?, email=?, phone=?, location_id=?, position=?, resume_url=?, cover_letter=?, notes=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`,
    [
      full_name ?? cur.full_name,
      email ?? cur.email,
      phone ?? cur.phone,
      (location_id === undefined ? cur.location_id : location_id),
      position ?? cur.position,
      resume_url ?? cur.resume_url,
      cover_letter ?? cur.cover_letter,
      notes ?? cur.notes,
      id
    ]
  );
  const row = await get('SELECT * FROM applications WHERE id = ?', [id]);
  res.json(row);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log('API listening on :' + PORT);
});
