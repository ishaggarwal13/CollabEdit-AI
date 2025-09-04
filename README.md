## FinDash

A customizable finance dashboard built with Next.js. It provides a foundation for real‑time market tracking via interactive widgets, charts, theming, and a modern UI.

### Features

- Interactive dashboard layout with drag‑and‑drop and resizing (via `react-grid-layout`)
- Data visualization with `chart.js` and `react-chartjs-2`
- Light/Dark theme support via `next-themes`
- Utility‑first styling with Tailwind CSS + `tailwindcss-animate`
- Form validation with `react-hook-form` and `zod`
- Rich, accessible UI primitives powered by Radix UI
- Type‑safe codebase with TypeScript and strict settings

### Tech Stack

- Next.js `15.3.3` (App Router)
- React `18.3`
- TypeScript `^5`
- Tailwind CSS `^3.4`
- Chart.js `^4`
- Radix UI, Lucide Icons

---

## Getting Started

Prerequisites:

- Node.js 18 or 20
- pnpm, npm, yarn, or bun (examples below use npm)

Install dependencies:

```bash
npm install
```

Run the dev server (configured to use port 9002):

```bash
npm run dev
```

Open your browser at:

```
http://localhost:9002
```

Project entry is in `src/app/page.tsx`. Edits hot‑reload automatically.

---

## Scripts

- `npm run dev`: Start Next.js in dev mode (Turbopack) on port 9002
- `npm run build`: Create a production build
- `npm run start`: Start the production server
- `npm run lint`: Run ESLint (flat config)
- `npm run typecheck`: TypeScript type checking without emitting

---

## Configuration

### Next.js config (`next.config.ts`)

- Ignores TypeScript and ESLint errors during build to keep CI/CD unblocked (adjust as needed)
- Allows remote images from `placehold.co` and `picsum.photos`

### TypeScript (`tsconfig.json`)

- `strict` mode enabled
- Path alias: `@/*` → `./src/*`

### ESLint (`eslint.config.mjs`)

- Extends `next/core-web-vitals` and `next/typescript`
- Ignores build output and generated files

### Styling

- Tailwind CSS configured via `postcss.config.mjs` and `src/app/globals.css`

---

## Environment Variables

Create a `.env.local` at the project root for any runtime config:

```
# Example (remove if unused)
NEXT_PUBLIC_API_BASE_URL="https://api.example.com"
FIN_API_KEY="your_secret_key"
```

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the client.
- Do not commit secrets. Use Vercel Project Settings → Environment Variables in production.

---

## Deploying to Vercel

This project is optimized for Vercel.

Recommended settings:

- Framework: Next.js (auto‑detected)
- Install Command: `npm install` (or your package manager)
- Build Command: `next build` (leave blank to auto‑detect)
- Output Directory: Next.js default (managed by Vercel)
- Node.js Version: 18 or 20

Set any required env vars in Vercel before deploying.

---

## Project Structure

```
.
├─ public/                 # Static assets (SVGs, images)
├─ src/
│  └─ app/                # App Router pages, layout, styles
│     ├─ layout.tsx
│     ├─ page.tsx         # Home / dashboard shell
│     └─ globals.css      # Tailwind base styles
├─ eslint.config.mjs
├─ next.config.ts
├─ postcss.config.mjs
├─ tsconfig.json
└─ README.md
```

---

## Roadmap Ideas

- Plug‑in widget system (stocks, crypto, indices, news)
- Real‑time updates via server actions or websockets
- Persistent layouts per user
- Data provider adapters and caching

---

## Contributing

1. Fork the repo and create a feature branch
2. Run `npm run typecheck` and `npm run lint`
3. Open a Pull Request with a clear description

---

## License

MIT — see `LICENSE` if present, or include your chosen license.
