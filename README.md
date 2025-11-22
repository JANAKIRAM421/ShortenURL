# TinyLink — Modern URL Shortener & Dashboard

TinyLink is a clean, production-ready tiny URL system inspired by bit.ly, built for the assignment below. 
It offers a dashboard, click tracking, a stats page, persistent database, full REST API, error handling, and a UX-optimized frontend.

## Assignment Specification Highlights

- **Shorten any URL** with auto or custom code. All codes validated ([A-Za-z0-9]{6,8}).
- **Dashboard page (`/`)** to view, filter, sort, copy, and delete links.
- **Redirect endpoint (`/:code`)**: performs 302 redirect, increments click count, updates last clicked.
- **Stats page (`/code/:code`)**: shows click stats and details for single link.
- **Healthcheck endpoint (`/healthz`)**: always returns status 200 and `{ok:true, version:"1.0"}`.
- **REST API:** follows autograder conventions—see below.

---

## 🗄️ API Endpoints

| Method | Path                   | Function                              |
|--------|------------------------|---------------------------------------|
| POST   | /api/links             | Create link (409 Conflict if exists)  |
| GET    | /api/links             | List all links                        |
| GET    | /api/links/:code       | Stats for one code                    |
| DELETE | /api/links/:code       | Delete link                           |

---

## 🌐 Routes & Pages

| Path         | Purpose             | Auth      |
|--------------|---------------------|-----------|
| `/`          | Dashboard           | Public    |
| `/code/:code`| Stats page for code | Public    |
| `/:code`     | Redirect            | Public    |
| `/healthz`   | Healthcheck         | Public    |

---

## 🎨 Features

- **Realtime dashboard**: Sorting, filtering by code/URL, click/copy/delete/stats actions, modals for confirm.
- **Click tracking**: Each use of a short link increments count and updates last clicked (visible in both dashboard and stats).
- **Full error feedback**: Inline validation, custom code uniqueness, visible errors/success.
- **Responsive/minimalist UI**: Clean layout, sensible spacing, tooltips, consistent styles, smart truncation.
- **Backend:** Node.js + Express, persistent Postgres DB on Render.
- **Frontend:** Tailwind CSS and vanilla JS (no frameworks).
- **Auto database table creation**: Deployment is zero-config.
- **Healthcheck, API for testing**: All endpoints follow spec for autograding/manual QA.

---

## ⚙️ Setup

1. **Clone and install:**
    ```
    git clone [your-repo-url]
    cd TinyLink
    npm install
    ```
2. **Configure `.env`:**
    ```
    DATABASE_URL=your_postgres_connection_url
    ```
3. **Run locally:**
    ```
    node index.js
    # Visit http://localhost:3000/
    ```
4. **Deploy:**  
   Deploy to Render/Vercel with `DATABASE_URL` configured; table auto-creates on first run.

---

## 📚 File Structure

TinyLink/
│
├── index.js # Backend server, Express API, routes
├── package.json # Dependencies, scripts
├── .env.example # Configuration template
├── README.md # This file!
│
└── public/
├── index.html # Dashboard UI
└── ... # Other frontend assets (favicon, style, etc.)

---

## 🧪 Manual & Automated Testing

- **Healthcheck:** Visit `/healthz` for `{ok:true, version}` (200 OK)
- **Create link:** `/api/links` (POST); creating same code again → 409
- **Delete link:** `/api/links/:code` (DELETE); `/code/:code` and `/:code` return 404 after deletion.
- **Stats:** `/code/:code` page and `/api/links/:code` API; dashboards and stats show all details.
- **Redirect:** `/:code` issues 302 and counts clicks.

---

## 📦 Environment Variables
DATABASE_URL=your_postgres_connection_url

See `.env.example` in repo.

---

## 💡 Walkthrough Summary

- Demo all actions: create, click, delete, stats, error.
- Dashboard features, table sorting/filtering/copy, modal.
- Discuss backend, routes, API, healthz.
- Show assignment coverage.

---

## 👤 Author 

Created by Ram for the TinyLink assignment.  



