import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { get, run } from './db.js';
dotenv.config();

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!email || !password) {
  console.error('Set ADMIN_EMAIL and ADMIN_PASSWORD in .env to seed admin.');
  process.exit(1);
}

const go = async () => {
  const hash = await bcrypt.hash(password, 10);
  try {
    await run('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, hash, 'admin']);
    console.log('Admin created:', email);
  } catch (e) {
    const u = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (u) {
      console.log('Admin already exists:', email);
    } else {
      console.error('Failed to seed admin:', e);
    }
  }
};
go();
