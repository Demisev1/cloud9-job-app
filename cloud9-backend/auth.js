import jwt from 'jsonwebtoken';
import { get } from './db.js';

export function requireAuth(req, res, next) {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing token' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export async function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Unauthenticated' });
  const u = await get('SELECT id, role FROM users WHERE id = ?', [req.user.id]);
  if (!u) return res.status(401).json({ error: 'Unauthenticated' });
  if (u.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  next();
}
