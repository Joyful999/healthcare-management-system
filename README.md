# MEDICORE — Intelligent Healthcare Management (Frontend Portfolio Project)

MEDICORE is a **frontend-only** demonstration of a smart healthcare management
platform, built to show what a commercial healthcare SaaS product could look
and feel like across three user roles: **Patient**, **Doctor**, and
**Administrator**.

> ⚠️ **This is a portfolio project.** It is not a real healthcare product. It
> does not store or process real patient medical records, is not HIPAA or
> GDPR compliant, and should never be used for actual medical decisions.

---

## 1. Project overview

MEDICORE provides a centralized interface for patient management, doctor
management, appointments, health monitoring, medical records, prescriptions,
healthcare analytics, hospital operations, notifications, and reporting —
all running entirely in the browser with **no backend server**.

## 2. Technologies

- **HTML5** — 18 semantic, accessible pages
- **CSS3** — a custom design system (no Bootstrap/Tailwind), with light/dark
  themes, responsive layouts, and print styles for reports
- **Vanilla JavaScript (ES6+)** — no frameworks, no build step
- **World Bank Open Data API** — real, free, public health statistics
- Zero dependencies, zero package manager required to run

## 3. API / data sources

Real public data is fetched from the **World Bank Open Data API**
(`https://api.worldbank.org`) — a free, keyless, public REST API. MEDICORE
uses it for country-level indicators only:

- Population
- Life expectancy at birth
- Health expenditure (% of GDP)
- Under-5 mortality rate
- Maternal mortality ratio
- Birth rate

This is **real public statistical data**, always labeled with its source
("Source: World Bank Open Data") — never presented as, or mixed with,
individual patient records. If the network is unavailable, the UI falls back
to a small labeled offline dataset so the demo never breaks.

All API calls are centralized in `js/api.js`. No API key is required or
exposed anywhere in the code.

## 4. Architecture

```
medicore/
├── index.html, login.html, register.html, 404.html      → marketing/auth (no app shell)
├── patient-dashboard.html, doctor-dashboard.html,        → role dashboards
│   admin-dashboard.html
├── appointments.html, patients.html, doctors.html,       → core app pages (shared shell)
│   health.html, medical-records.html, prescriptions.html,
│   analytics.html, reports.html, messages.html,
│   profile.html, settings.html
├── css/        → style.css (design tokens + shell), components.css,
│                 forms.css, dashboard.css, calendar.css, analytics.css,
│                 responsive.css
├── js/
│   ├── app.js            → shared shell: sidebar/topbar render, nav,
│   │                        theme, global search (Ctrl+K), role switch
│   ├── api.js             → World Bank API calls (getCountryHealthData,
│   │                        getPublicHealthTrends, getHealthStatistics)
│   ├── auth.js             → demo login/register/session/role switching
│   ├── state.js             → seeds & exposes all demo data
│   ├── storage.js            → localStorage wrapper (namespaced, safe)
│   ├── notifications.js       → toasts + notification drawer
│   ├── utils.js                → formatting helpers + dependency-free
│   │                              SVG chart builders (line/bar/donut)
│   └── dashboard.js, appointments.js, doctors.js, patients.js,
│       health.js, records.js, prescriptions.js, analytics.js,
│       reports.js, messages.js, profile.js  → per-page logic
└── assets/     → images/icons/logo (SVG marks generated inline; no
                   external image dependencies)
```

Every inner app page shares one sidebar + topbar, rendered at runtime by
`Layout.init()` in `app.js` based on the signed-in demo user's role, so
navigation, active-state highlighting, search, notifications and the role
switcher stay perfectly consistent across all 18 pages without duplicating
markup by hand.

## 5. Demo authentication

There is no server, no password hashing, and no real session security.
`js/auth.js` implements a demo-only login/register flow backed entirely by
`localStorage`. Three seeded demo accounts are available:

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Patient | patient@medicore.demo | demo1234 |
| Doctor  | doctor@medicore.demo  | demo1234 |
| Admin   | admin@medicore.demo   | demo1234 |

A **"View as"** role switcher (in the sidebar) lets a portfolio viewer jump
between all three experiences instantly, without creating separate accounts.

**Never enter real credentials.** A production version of this product would
require a real backend with hashed credentials, session tokens or OAuth,
server-side authorization checks per role, and encrypted transport — none of
which exist here.

## 6. Demo patient data

All patients, doctors, appointments, prescriptions, medical records, and
conversations are **fictional** and generated in `js/state.js`. They are
clearly labeled throughout the UI (e.g. "DEMO PATIENT DATA — NOT REAL MEDICAL
RECORDS", "Demo metric", "Demo profile"). Nothing is transmitted anywhere —
all of it lives in the browser's `localStorage` under the `medicore:` key
prefix and can be wiped at any time from **Settings → Privacy & data**.

## 7. LocalStorage usage

MEDICORE uses `localStorage` (via `js/storage.js`) to persist, per browser:

- Demo user accounts & the active session/role
- Appointments, prescriptions, medical records, patients, doctors
- Conversations & notifications
- Medication reminder state
- Health tracker entries
- Theme preference (light/dark)

No cookies, no server round-trips, no analytics beacons.

## 8. Healthcare data disclaimer

- MEDICORE does **not** provide medical diagnosis or treatment.
- It does **not** use real patient PII or real medical records.
- It is **not** HIPAA or GDPR compliant, and makes no such claim.
- The BMI calculator and health tracker are **educational only** — they use
  neutral language ("outside the configured demonstration reference range")
  and never phrase results as a diagnosis.
- Public statistics (population, life expectancy, etc.) are real and
  attributed to the World Bank; they are never blended with fictional
  patient data.

## 9. Installation & how to run

No build step, no package manager, and no server required.

1. Download or clone this folder.
2. Open `index.html` directly in a modern browser, **or** serve it locally
   for the cleanest experience (recommended, since some browsers restrict
   `fetch()` from `file://` origins):

   ```bash
   # Option A — Python
   cd medicore
   python3 -m http.server 8080
   # then visit http://localhost:8080

   # Option B — Node
   npx serve medicore
   ```
3. Register a demo account or use one of the seeded accounts above, or just
   click **"EXPLORE PLATFORM"** on the homepage.

## 10. Future backend architecture (not implemented here)

A production MEDICORE would need:

- A real API (REST/GraphQL) with authenticated, authorized endpoints per role
- A relational database for patients, doctors, appointments and records,
  with encryption at rest and in transit
- Real identity/session management (OAuth2/OIDC, hashed passwords, MFA)
- Server-side role-based access control (RBAC) enforcing what each role can
  read/write — today this is only simulated client-side
- HIPAA/GDPR-compliant infrastructure, audit logging, and consent management
- A real-time messaging backend (e.g. WebSockets) for the Messages feature
- A proper PDF generation service for Reports (currently print-to-PDF via
  the browser)

---

**MEDICORE is a frontend engineering portfolio piece** demonstrating
multi-role, data-driven, accessible, responsive web application design using
HTML5, CSS3, vanilla JavaScript, a real public REST API, browser storage,
and modern UI/UX principles — without any backend framework.
