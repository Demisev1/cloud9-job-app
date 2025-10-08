> Quick note (pre-wired for you)
> - SUPABASE_URL: https://stanhfumuymqqjtywbof.supabase.co
> - ADMIN_EMAIL: Shane1661@gmail.com
> - seed_admin.sql prepared with UUID: b0a20c1d-f704-4d94-b903-cf4f5e56531d
> - config.js already created with your anon key.
>

# Apply at Cloud 9 Vapes — Applicant Portal (GitHub Pages + Supabase)

A production-ready, no-build Single Page App (SPA) that runs on **GitHub Pages** and uses **Supabase** for authentication and data (applications, locations).

## ✨ Features
- Applicant **Sign Up / Login**
- **Apply** form (stores to Supabase)
- **Applicant Dashboard** (view application status)
- **Admin Dashboard** (update statuses, manage locations)
- Mobile-first, clean aesthetics using Tailwind CDN
- Works on GitHub Pages (hash-based routing + `404.html` redirect)

---

## 🔧 1) Set up Supabase

1. Create a project at https://supabase.com (free tier).
2. Copy your **Project URL** and **anon public key** from **Project Settings → API**.
3. Open **SQL editor** and paste `./sql/schema.sql`, then run it.
4. Create your admin user in **Auth → Users** with:
   - Email: `Shane1661@gmail.com`
   - Password: (set privately)
5. Find that new user's **ID (UUID)** and run this in SQL (replace the ID):
   ```sql
   insert into public.profiles (user_id, role) values ('YOUR_ADMIN_AUTH_USER_ID', 'admin');
   ```

Optional: seed locations in **Table Editor → locations**.

---

## 🧩 2) Configure the App

1. Copy `assets/js/config.example.js` to `assets/js/config.js`.
2. Fill:
   ```js
   window.APP_CONFIG = {
     SUPABASE_URL: "https://YOUR-PROJECT-ID.supabase.co",
     SUPABASE_ANON_KEY: "YOUR_PUBLIC_ANON_KEY",
     ADMIN_EMAILS: ["Shane1661@gmail.com"]
   };
   ```

> Note: Admin email list is **only for showing admin links in the UI**. Real security is enforced by Supabase RLS policies.

---

## 🚀 3) Deploy to GitHub Pages

1. Create a new GitHub repo (or open your existing one).
2. Drag & drop all files from this folder to the repo root.
3. Ensure the `CNAME` file contains your domain: `applyatcloud9vapes.com`.
4. In repo settings → **Pages**, set Source = `main` (or default) and the root folder.
5. Wait for Pages to publish. Your site will be live at your domain.

**DNS**: If not already done, point your domain to GitHub Pages (A records + CNAME).

---

## 👩‍💻 Usage

- Applicants:
  - Sign up → log in → go to **Apply** → submit application.
  - Check **Dashboard** for status updates.

- Admin:
  - Log in with `Shane1661@gmail.com`.
  - Visit `#/admin` to view/update applications and `#/locations` to manage stores.
  - Location CRUD and status updates are protected by RLS; only admins can write.

---

## 🛡 Security Notes
- **Do not** commit secrets other than the Supabase public anon key.
- Admin privileges are enforced via **profiles.role='admin'** and RLS policies.
- The `ADMIN_EMAILS` list is UI sugar; change/update as needed.

---

## 🧰 Customize
- Update colors, copy, logos (replace `assets/img/favicon.svg`, or add your own logo).
- Add fields to `applications` (resume URL, experience, etc.) and expose them in the form.
- Add email notifications via Supabase Edge Functions or third-party email services.

---

## 🆘 Troubleshooting
- **"Missing config.js"**: Copy `assets/js/config.example.js` to `assets/js/config.js` and fill values.
- **Blank pages on GitHub Pages**: Make sure you are using hash routes (`#/...`) and that `404.html` exists.
- **RLS errors**: Ensure you ran `schema.sql`, created admin profile row with role `'admin'`, and are logged in.
