## FinDash – Technical Documentation (Frontend Assignment)

Project links:

- Live (Vercel): https://fin-dash-one.vercel.app/
- GitHub: https://github.com/ishaggarwal13/FinDash

---

## 1) Project Overview

FinDash is a customizable finance dashboard built with Next.js (App Router). It aims to let users assemble a real‑time finance monitoring workspace by connecting to financial APIs and rendering data via configurable widgets (tables, cards, charts). The current codebase provides the Next.js foundation, UI libraries, charting, theming, and layout tooling required to implement the feature set described below.

Objectives (per assignment):

- Real‑time data visualization of finance data
- Integration with multiple stock/finance APIs
- Drag‑and‑drop widget management and layout persistence
- Robust state management and data persistence

---

## 2) Tech Stack

- Framework: Next.js 15 (App Router)
- Language: TypeScript (strict mode)
- Styling: Tailwind CSS, CSS; animation helpers via `tailwindcss-animate`
- UI/Accessibility: Radix UI components, `lucide-react` icons
- Theming: `next-themes` (light/dark)
- Charts: `chart.js` + `react-chartjs-2`
- Layout: `react-grid-layout` (drag, drop, resize)
- Forms/Validation: `react-hook-form` + `zod`
- Deployment: Vercel

Core dependencies present in `package.json` confirm this stack and enable rapid implementation of the assignment’s features.

---

## 3) Architecture and Folder Structure

High level structure:

```
.
├─ public/                 # Static assets (SVGs, images)
├─ src/
│  └─ app/                # App Router entry
│     ├─ layout.tsx       # Root layout, fonts, themes, providers
│     ├─ page.tsx         # Home/dashboard shell (starter)
│     └─ globals.css      # Tailwind base styles
├─ eslint.config.mjs      # ESLint flat config
├─ next.config.ts         # Next.js config (images, build opts)
├─ postcss.config.mjs     # Tailwind plugin
├─ tsconfig.json          # TS strict config with @/* alias
├─ README.md
└─ docs/
   └─ FinDash-Technical-Documentation.md
```

Current modules used in this repo (no `features/` folder):

- `src/app/page.tsx` – dashboard canvas, layout management, data mapping, import/export, persistence (localStorage), API fetch orchestration
- `src/components/dashboard/` – dialogs and widgets
  - `add-widget-dialog.tsx` – widget type selection and initial config
  - `configure-widget-dialog.tsx`, `api-config-dialog.tsx`, `templates-dialog.tsx`
  - `widgets/*` – concrete widget implementations (e.g., `stock-chart-widget.tsx`, `data-table-widget.tsx`, `key-metrics-widget.tsx`, `widget-card.tsx`)
- `src/components/ui/*` – shared UI primitives (card, button, input, dialog, label, scroll-area, etc.)
- `src/hooks/use-api-providers.tsx` – provider metadata and lookup
- `src/lib/actions.ts` – `fetchData` wrapper (custom URL or provider+endpoint)
- `src/lib/utils.ts` – helpers (`getNestedValue`, `cn`, formatting)

Key feature locations:

- Drag-and-drop/resizing: `react-grid-layout` in `src/app/page.tsx` (`ResponsiveGridLayout`)
- Widget lifecycle (add/configure/remove): dialogs in `src/components/dashboard/*`
- Data mapping for widgets: `mapDataTableData`, `mapChartData` in `src/app/page.tsx`
- Persistence: `localStorage` read/write in `src/app/page.tsx`

---

## 4) How It’s Built

Build choices:

- Next.js App Router for modern routing, streaming, and data fetching options (CSR/SSR/ISR as appropriate)
- TypeScript strict mode for safer code
- Tailwind for utility‑first styling and velocity
- Radix UI for accessible primitives
- `react-grid-layout` for intuitive drag‑and‑drop dashboards
- `chart.js` for robust data visualization
- `next-themes` for dark/light modes

Development workflow:

- Dev server: `npm run dev` (Turbopack) on port 3000
- Linting: `npm run lint` (flat config)
- Type checking: `npm run typecheck`
- Production build: `npm run build` → `npm run start`

Deployment:

- Vercel (auto‑detects Next.js). Set environment variables in Vercel Project Settings.

---

## 5) Features (Designed per Assignment)

1. Widget Management System

   - Add Widgets: Table, Finance Cards (Watchlist, Gainers, Performance, Financials), Charts (Line/Candles)
   - Remove Widgets: Delete from layout and persisted state
   - Rearrange Layout: Drag‑and‑drop, resize with `react-grid-layout`
   - Widget Configuration Panel: Configure API endpoint, fields, labels, intervals, formatting

2. API Integration & Data Handling

   - Dynamic Data Mapping: Explore API JSON, select displayed fields
   - Real‑time Updates: Polling with configurable intervals; optional websockets
   - Data Caching: In‑memory cache keyed by endpoint+params; throttle/rate‑limit controls

3. UX

   - Customizable Widgets: Titles, metrics, formats
   - Responsive: Grid adapts to viewport; mobile‑friendly
   - Robust States: Loading skeletons, error banners, empty states

4. Data Persistence

   - Browser Storage: Persist widget configs and grid layout (e.g., `localStorage`)
   - State Recovery: Restore dashboard on refresh
   - Backup: Export/import JSON of user dashboard configuration

5. Advanced Widget Features
   - Field Selection Interface: JSON explorer for mapping
   - Custom Formatting: Currency, percentages, date formats
   - API Endpoint Management: Switch endpoints per widget instance

Note: The current repository contains the foundation (libraries, structure) to implement these features. Widget logic, API clients, and persistence are the primary next steps.

---

## 6) Data Flow and API Strategy

APIs (suggested): Alpha Vantage, Finnhub, or Indian market APIs. Each typically requires an API key.

Proposed flow (polling):

1. Widget config defines endpoint, params, fields, refreshInterval
2. Data layer composes a request and hit API (with API key from env)
3. Responses normalized via adapter (map provider → normalized schema)
4. Cache store updates (timestamped). Widgets subscribe to derived data
5. If `refreshInterval > 0`, schedule next fetch; apply backoff on errors

Sockets (optional brownie points):

- Use provider websockets where available for live ticks; fall back to polling otherwise

Rate limiting and quotas:

- Centralized request queue with concurrency + RPS limits
- Cache short‑lived identical requests; dedupe in‑flight
- Surface user‑friendly messages on 429/over‑quota

Security:

- Keep API keys server‑side when possible (server actions/route handlers)
- For client‑side calls, use `NEXT_PUBLIC_*` only for non‑sensitive values

---

## 7) State Management and Persistence

Options:

- Lightweight: Zustand or Jotai for widget and layout state
- Complex: Redux Toolkit for larger, multi‑page state

Recommended for this project: Zustand

- Stores: `useDashboardStore` (layout, widgets), `useDataStore` (cache)
- Persistence: `zustand/middleware` to persist to `localStorage`

Types:

- `WidgetType` = table | financeCards | lineChart | candleChart
- `WidgetConfig` = { id, type, title, endpoint, params, fields, refreshInterval, formatters }
- `LayoutItem` = { i, x, y, w, h }

---

## 8) UI/UX Details

Radix UI components used for:

- Dialogs (widget add/config)
- Selects, Menus, Tabs, Tooltips
- Toasts for feedback

Tailwind:

- Design tokens via CSS vars in `globals.css`
- Dark mode via `next-themes`

Accessibility:

- Keyboard support for dialogs/menus
- ARIA attributes for interactive components

---

## 9) Performance and Rendering

Rendering strategies:

- CSR for user‑customizable dashboard interactions
- SSR/ISR for static lists if needed (e.g., preset templates)

Optimizations:

- Code splitting by feature (widgets, editors)
- Avoid unnecessary re‑renders via memoization and slice‑based stores
- Debounced resize and drag handlers
- Image domains whitelisted in `next.config.ts`

---

## 10) Testing and Quality

Static analysis:

- `npm run lint` to enforce Next.js + TS rules
- `npm run typecheck` for strict typing

Suggested additions:

- Unit tests (Vitest/Jest) for adapters and selectors
- Playwright for widget interactions

---

## 11) Setup and Run

Local:

```bash
npm install
npm run dev
# http://localhost:3000
```

Environment variables (example):

```
NEXT_PUBLIC_API_BASE_URL="https://api.example.com"
FIN_API_KEY="your_secret_key"
```

Build and start:

```bash
npm run build
npm run start
```

Deploy (Vercel):

- Import GitHub repo, keep defaults (Next.js detected)
- Add env vars in Project Settings

---

## 12) Current Status vs. Roadmap

Implemented in repo:

- Next.js + TypeScript base (App Router)
- Tailwind setup and global styles
- Theming support via `next-themes` (package present)
- Charting, layout, form, and validation libraries added as dependencies

Next implementations:

- Widget framework (types, renderer, config UI)
- API client layer with adapters, caching, and polling
- Zustand store with persistence (layouts + widgets)
- Export/import dashboard JSON
- Optional sockets for live updates
