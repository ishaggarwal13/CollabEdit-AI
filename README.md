# CollabEdit AI: Collaborative Editor with AI Assistant

Welcome to CollabEdit AI, a modern, feature-rich collaborative editor supercharged with artificial intelligence. This document provides an overview of the application, its features, the technology stack it's built on, and how it all comes together.

## How It Works

CollabEdit AI provides a seamless writing and editing experience. The core of the application is a rich-text editor where users can write and format documents. The real power comes from the integrated AI Assistant, which can be accessed through a chat sidebar or a floating toolbar that appears when text is selected.

To get started, the user provides their API key for an AI provider (like Gemini or OpenAI) through a simple interface in the application header. This key is stored securely in the browser's local storage and is used to communicate with the AI model.

Users can interact with the AI in various ways:

- **Chat-based Editing:** Ask the AI to write, rewrite, or brainstorm ideas directly within the chat panel. The AI can respond with suggestions or directly modify the content in the editor.
- **Text Transformations:** Select text in the editor to bring up a floating toolbar. From there, you can ask the AI to perform quick actions like shortening or lengthening the text, or converting it into a markdown table. A preview modal shows the suggested changes before they are applied.
- **Content Generation:** Use the "Agent" tab to give the AI more complex tasks, like creating a complete PowerPoint presentation from a simple query.
- **Web Summarization:** Use the "Search" tab to have the AI search the web for a topic and provide a concise summary, which is then inserted into the editor.

## Key Features

- **Rich-Text Editor:** A powerful and intuitive editor based on Tiptap that supports various text formatting options, including tables.
- **AI-Powered Chat:** A sidebar chat allows for conversational interaction with the AI to refine and generate document content.
- **Floating Toolbar:** A contextual menu appears on text selection, offering quick AI-driven transformations like "shorten," "lengthen," and "convert to table."
- **AI Edit Preview:** Before applying any AI suggestions, a preview modal shows a clear "Original vs. AI Suggestion" comparison.
- **Multi-Platform AI Support:** Easily switch between different AI model providers (e.g., Google Gemini, OpenAI) and manage API keys directly in the UI.
- **Agent Tasking:** Delegate complex tasks, such as creating presentations based on a query.
- **Web Search & Summarization:** The AI can search the web and generate summaries of the findings, inserting them directly into your document.
- **Responsive Design:** A clean, modern interface that works seamlessly across different screen sizes.

## Technology Stack

This application is built with a modern, powerful tech stack:

- **Framework:** [Next.js](https://nextjs.org/) (using the App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Integration:** [Genkit](https://firebase.google.com/docs/genkit), a Google-developed framework for building production-ready AI-powered features.
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/) - A collection of beautifully designed, accessible, and customizable React components.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Editor:** [Tiptap](https://tiptap.dev/) - A headless, framework-agnostic rich-text editor.
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Getting Started

Prerequisites:

- Node.js 18 or 20
- pnpm, npm, yarn, or bun (examples below use npm)

Install dependencies:

```bash
npm install
```

Run the dev server (configured to use port 3000):

```bash
npm run dev
```

Open your browser at:

```
http://localhost:3000
```

Project entry is in `src/app/page.tsx`. Edits hot‑reload automatically.

---

## Scripts

- `npm run dev`: Start Next.js in dev mode (Turbopack) on port 3000
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
OPENAI_API_KEY=__YOUR_OPENAI_API_KEY__
GEMINI_API_KEY=__YOUR_GEMINI_API_KEY__
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
