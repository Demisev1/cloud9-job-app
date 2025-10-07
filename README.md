# Cloud 9 Jobs (GitHub‑ready)

This repo includes a **static frontend** in `/docs` (deploys to GitHub Pages) and a **Node/Express backend** in `/cloud9-backend`.

## Deploy

### 1) Backend (Render/Railway)
- Root: `cloud9-backend`
- Build: `npm install`
- Start: `node server.js`
- Env:
  - `JWT_SECRET` = a long random string
  - `CORS_ORIGIN` = your Pages URL(s), e.g. `https://<you>.github.io,https://your-domain.com`
  - (optional) `SQLITE_PATH` = `/var/data/data.sqlite`
  - `ADMIN_EMAIL` / `ADMIN_PASSWORD` for first‑time seeding
- Persistent Disk: mount `/var/data` (or leave default `./data.sqlite`)

After deploy, run: `npm run seed:admin` once to create the owner account.

### 2) Frontend (GitHub Pages)
- GitHub → Settings → Pages → Source: **Deploy from a branch**
- Branch: `main`
- Folder: `/docs`
- Edit `docs/config.js` and set:
  ```js
  window.API_BASE = 'https://YOUR-BACKEND-URL';
  ```

## Use
- `docs/login.html`: login or create applicant account.
- `docs/apply.html`: applicant form + “My Applications” table.
- `docs/admin.html`: locations manager + application status dashboard (admin only; requires logging in as admin first).

## Local Dev
- Backend: `cd cloud9-backend && npm install && cp .env.example .env && npm run seed:admin && npm run dev`
- Frontend: open files in `docs/` with Live Server or any static HTTP server.
