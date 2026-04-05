# Pathways — Frontend

AI-Assisted Inclusive STEAM Learning Platform for African Women  
**Live App:** https://stem-pathways-stem4u.netlify.app  
**Backend Repo:** [pathways-backend](https://github.com/teniolaiji/Pathways-backend)  
**Backend API:** https://pathways-backend-3151.onrender.com

---

## Tech Stack

- **Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Inline styles with shared design token system
- **Hosting:** Netlify
- **API Routing:** Netlify proxy via `_redirects`

---

## Features

- User registration with email verification flow
- Login with forgot password and resend verification
- 4-step interactive assessment wizard with example goals per domain
- AI pathway generation with loading state
- Pathway list with search and filter (status, domain)
- Pathway detail view with module accordion
- Module completion with optional feedback form
- Progress bar and badge display
- Feedback analytics panel per module
- PDF export via browser print
- Pathway regeneration with archive
- In-app notification bell with unread count
- User profile with editable preferences and progress summary
- Admin panel: stats overview, user management, pathway management, flagged resources
- Role-based access control (Admin Panel hidden from learners)
- Fully responsive purple theme
- Email verification page (handles `/verify-email?token=` URLs)

---

## Project Structure

```
pathways-frontend/
├── public/
│   └── _redirects               # Netlify API proxy rules
├── src/
│   ├── components/
│   │   ├── NotificationBell.jsx  # Bell icon with dropdown
│   │   └── shared.jsx            # Design tokens, Sidebar, reusable components
│   ├── pages/
│   │   ├── Admin.jsx             # Admin panel
│   │   ├── Assessment.jsx        # 4-step assessment wizard
│   │   ├── Dashboard.jsx         # Main dashboard
│   │   ├── Login.jsx             # Login + forgot password
│   │   ├── Pathways.jsx          # Pathway list and detail view
│   │   ├── Profile.jsx           # User profile
│   │   ├── Register.jsx          # Registration
│   │   └── VerifyEmail.jsx       # Email verification handler
│   ├── App.jsx                   # Root component and routing
│   ├── config.js                 # API base URL config
│   ├── index.css                 # Global styles and animations
│   └── main.jsx                  # React entry point
├── .gitignore
├── netlify.toml                  # Netlify build config
├── package.json
└── vite.config.js
```

---

## Local Setup

### Prerequisites

- Node.js v18 or higher
- The backend running locally or deployed on Render

### Step 1 — Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/pathways-frontend.git
cd pathways-frontend
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create your `.env` file

Create a file named `.env` in the root of the project:

```
VITE_API_URL=http://localhost:8000/api
```

If you are connecting to the deployed Render backend instead of running locally:

```
VITE_API_URL=https://pathways-backend-3151.onrender.com/api
```

### Step 4 — Run the development server

```bash
npm run dev
```

Open your browser and go to:
```
http://localhost:5173
```

### Step 5 — Build for production

```bash
npm run build
```

The built files will be in the `dist/` folder.

---

## Netlify Proxy

The `public/_redirects` file proxies all `/api/*` requests to the Render backend. This eliminates CORS issues in production:

```
/api/*  https://pathways-backend-3151.onrender.com/api/:splat  200
/*      /index.html                                             200
```

When running locally, requests go directly to `http://localhost:8000/api` via the `VITE_API_URL` environment variable.

---

## Pages Overview

| Page | Route/Trigger | Description |
|------|--------------|-------------|
| Login | Default unauthenticated | Login form with forgot password |
| Register | Click "Create one" | Registration with email verification notice |
| VerifyEmail | `/verify-email?token=` | Handles email verification links |
| Dashboard | After login | Stats, quick actions, recent pathways |
| Assessment | `/assessment` | 4-step wizard to collect learning profile |
| Pathways | `/pathways` | List and detail view of AI pathways |
| Profile | `/profile` | User stats, preferences, progress summary |
| Admin | `/admin` (admin only) | Platform management panel |

---

## Design System

All colours, fonts, spacing, and component styles are defined in `src/components/shared.jsx` under the `T` (theme tokens) object:

```js
T.purple900  // #1e1b4b — dark headings
T.purple500  // #7c3aed — primary purple
T.purple100  // #ede9fe — light purple backgrounds
T.green500   // #10b981 — success states
T.red500     // #ef4444 — error states
T.gray500    // #6b7280 — secondary text
T.white      // #ffffff
T.font       // 'Segoe UI', system-ui, sans-serif
```

Shared components available from `../components/shared`:
- `Sidebar` — navigation with role-based admin link
- `PageShell` — main content wrapper with padding
- `PageHeader` — title and subtitle block
- `Card` — white bordered container
- `PrimaryBtn` — purple action button
- `ProgressBar` — percentage progress bar
- `EmptyState` — empty list placeholder
- `Spinner` — loading indicator
- `ErrorBanner` — red error message
- `SuccessBanner` — green success message

---

## Deployment (Netlify)

This frontend is deployed on Netlify. To deploy your own instance:

1. Push this repo to GitHub
2. Go to https://netlify.com → Add new site → Import from GitHub
3. Select this repo
4. Build settings are auto-detected from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
5. Add environment variable:
   - `VITE_API_URL` = `https://your-render-backend-url.onrender.com/api`
6. Click Deploy site
7. Once deployed, copy your Netlify URL and add it as `FRONTEND_URL` in your Render backend environment variables

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes (local only) | Backend API URL. Not needed in production — Netlify proxy handles routing |

---

## Notes

- The `VITE_API_URL` environment variable is baked in at **build time** by Vite. Changes to it in Netlify require a fresh deploy (Clear cache and deploy site).
- In production, API calls use the relative path `/api` which is proxied to the backend by the `_redirects` file — so `VITE_API_URL` is not used in the deployed version.
- The first request to the backend after a period of inactivity may take 30–60 seconds as Render free tier wakes up. Subsequent requests are fast.
