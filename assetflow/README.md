# AssetFlow — Enterprise Asset & Resource Management (MVP)

A working full-stack slice of the AssetFlow concept, built for a hackathon demo. This is not the whole 10-module spec — it's the four modules that will actually run and impress in a live demo: **Dashboard, Asset Management, Allocation & Transfer, and Maintenance (Kanban)**, wired to a real MongoDB backend with JWT auth and role-based access.

Booking, Audit, Reports, and the AI Assistant have nav entries and clean "coming soon" screens so the app doesn't look broken — but they aren't implemented. See "Extending this" below for where to plug them in.

## What's actually working

- **Auth** — signup (always creates an Employee), login, JWT, forgot/reset password, role-based route protection
- **Dashboard** — live KPIs (available/allocated/under maintenance/pending transfers/upcoming returns), overdue alerts, category chart (Recharts), recent activity feed, quick actions
- **Organization Setup** — Departments, Categories, Employee Directory with role assignment (Admin only)
- **Asset Management** — register with auto-generated tag (AF-0001, AF-0002…), search/filter/pagination, asset detail page with **QR code**, full timeline merging allocation + maintenance history
- **Allocation & Transfer** — direct allocation, conflict detection (already-allocated assets route to a transfer request instead), approve/reject transfers, mark returned, overdue detection
- **Maintenance** — kanban board (Pending → Approved → Technician Assigned → In Progress → Resolved), raising requests, automatic asset status sync

## Tech stack

Frontend: React (Vite) · Tailwind · React Router · React Hook Form · Zustand · Axios · Framer Motion · Recharts · qrcode.react · React Hot Toast · Lucide Icons

Backend: Node/Express · MongoDB Atlas + Mongoose · JWT · bcryptjs · Socket.io (connected, not yet emitting live events)

## Setup (few-hours version — get this running first)

You'll need Node 18+ and a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (or local MongoDB).

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env
# edit .env — paste your MONGO_URI and a JWT_SECRET (any random string)
npm run seed     # populates demo departments, categories, assets, users
npm run dev      # starts on http://localhost:5000
```

Demo logins after seeding:
- Admin: `admin@assetflow.com` / `admin123`
- Asset Manager: `manager@assetflow.com` / `manager123`
- Employee: `priya@assetflow.com` / `employee123`

### 2. Frontend

```bash
cd frontend
npm install
cp .env.example .env    # defaults to http://localhost:5000/api, fine for local dev
npm run dev              # starts on http://localhost:5173
```

Open `http://localhost:5173`, log in with one of the demo accounts above.

## Folder structure

```
backend/
  config/        # DB connection
  controllers/   # business logic per resource
  middlewares/   # auth, role checks, error handling
  models/        # Mongoose schemas
  routes/        # Express routers
  seed/          # demo data script
  utils/         # token + asset tag generation

frontend/src/
  components/    # Sidebar, Topbar, KPICard, StatusBadge, states
  layouts/       # DashboardLayout (sidebar + topbar + page transitions)
  pages/         # one file per screen
  store/         # Zustand auth store (persisted)
  services/      # Axios instance with auth interceptor
```

## Extending this for the rest of the spec

The models already anticipate the rest of the system, so these are additive, not rewrites:

- **Resource Booking** — add a `Booking` model (asset ref, startTime, endTime, requestedBy, status), FullCalendar on the frontend, and an overlap-check in the controller before creating a booking.
- **Audit** — add `AuditCycle` and `AuditItem` models; the Maintenance kanban pattern in `maintenanceController.js` is a good template for the checklist workflow.
- **Reports/Export** — the dashboard's aggregation pipelines in `dashboardController.js` are a starting point; add `pdfkit`/`exceljs` for export endpoints.
- **AI Assistant** — a simple approach is a `/api/assistant` route that turns the user's question into a MongoDB query using an LLM function-calling call, then formats the result back in natural language.
- **Live updates** — Socket.io is already initialized in `server.js` (`app.get("io")`); emit an event after allocation/maintenance mutations and listen for it on the Dashboard page to replace polling.

## Notes

- Asset images/documents (Cloudinary) and email sending (Nodemailer) are wired into `.env.example` but not required for the demo — `forgotPassword` returns the reset token directly in dev mode instead of emailing it.
- QR codes encode a deep link to `/assets/tag/:tag` — scanning one (once deployed) opens the asset profile directly; the `getAssetByTag` endpoint backs this.
