# Cloud9 Backend (Auth + Locations + Applications)

This is a drop-in Node/Express + SQLite API to power your job application site.

## Features
- JWT auth (email/password) for applicants
- Admin role with endpoints to manage locations and application statuses
- Applicants can register, login, submit applications, and see their own status
- SQLite (file-based) — zero external dependencies
- CORS + Helmet + basic logging

## Quick Start

```bash
cd cloud9-backend
npm install
cp .env.example .env
# edit .env: set JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD
npm run seed:admin
npm run dev
```

The API will run on `http://localhost:8080` by default.

## Key Endpoints

### Auth
- `POST /auth/register` → `{ email, password }`
- `POST /auth/login` → `{ email, password }`
- `GET /me` (Bearer token)

### Locations
- `GET /locations` (public)
- `POST /locations` (admin) → `{ name, address, city, state, zip, phone, is_active }`
- `PUT /locations/:id` (admin)
- `DELETE /locations/:id` (admin)

### Applications
- `POST /applications` (auth) → `{ full_name, email, phone, location_id, position, resume_url, cover_letter }`
- `GET /applications/mine` (auth)
- `GET /applications?status=&location_id=&q=` (admin list/search)
- `PATCH /applications/:id/status` (admin) → `{ status, notes }`
  - Status allowed: `submitted, under_review, interview, hired, rejected, withdrawn`
- `PATCH /applications/:id` (admin) → general field update

## Frontend Integration (example)

Add a simple auth helper in your frontend:

```js
const API = 'https://YOUR_BACKEND_URL';

async function api(path, opts={}){
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(opts.headers||{}) };
  if (token) headers.Authorization = 'Bearer ' + token;
  const res = await fetch(API+path, { ...opts, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// Register/login
await api('/auth/register', { method:'POST', body: JSON.stringify({ email, password }) });
const { token } = await api('/auth/login', { method:'POST', body: JSON.stringify({ email, password }) });
localStorage.setItem('token', token);

// Load locations (for your application form location select)
const locations = await api('/locations');

// Submit application (as applicant)
await api('/applications', { method:'POST', body: JSON.stringify(formData) });

// Admin list & status update
const apps = await api('/applications?q=Shane&status=under_review');
await api('/applications/123/status', { method:'PATCH', body: JSON.stringify({ status:'interview', notes:'Call Friday' }) });
```

## Deploy

- **Railway / Render / Fly.io / Docker**: works out-of-the-box.
- Persist `data.sqlite` on a volume.
- Set environment vars (`JWT_SECRET`, optional `SQLITE_PATH`, `CORS_ORIGIN`).

## Security Notes
- Always set a strong `JWT_SECRET`.
- Use HTTPS in production.
- Rotate the initial admin password after first login.
