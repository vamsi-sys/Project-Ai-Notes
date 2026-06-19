# NoteForge — AI-Powered Notes

A production-grade note-taking app built with **Next.js 15 App Router + TypeScript + Tailwind CSS**, backed by **Supabase Postgres**, with optional **OpenAI** summarization and a smart system-health check.

---

## ✦ Features

| Feature | Detail |
|---|---|
| **Normal Notes** | Always available — title, content, tags |
| **AI Notes** | Automatic GPT-4o-mini summary on save |
| **System Health Check** | App checks OpenAI key validity on load; shows warning + disables AI mode if inactive |
| **Dark / Light Mode** | next-themes with smooth transitions |
| **Glassmorphism UI** | Ink + violet/teal palette, custom design tokens |
| **TanStack Query** | Optimistic cache, stale-while-revalidate |
| **Zustand Store** | Client-side state (editor open, AI status, notes) |
| **Responsive** | Mobile-first, floating FAB on small screens |
| **Search + Filter** | Real-time search, filter by mode |
| **Security** | OpenAI key server-side only, never exposed to client |

---

## 🚀 Quick Start

### 1. Clone & install

```bash
git clone <your-repo-url>
cd ai-notes-pro
npm install
```

### 2. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com)
2. Open **SQL Editor → New Query**, paste the contents of `supabase/schema.sql`, and run it
3. Go to **Settings → API** and copy your **Project URL** and **anon public** key

### 3. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Optional — leave blank to run in Normal-Note-only mode
OPENAI_API_KEY=sk-...
```

> ⚠️ **Security**: `OPENAI_API_KEY` has **no** `NEXT_PUBLIC_` prefix — it is server-side only and never shipped to the browser.

### 4. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🏗 Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai-status/route.ts   ← GET: checks OpenAI key health
│   │   └── notes/
│   │       ├── route.ts         ← GET (list) + POST (create + summarize)
│   │       └── [id]/route.ts    ← GET, PATCH, DELETE
│   ├── globals.css              ← design tokens, glass utility
│   ├── layout.tsx               ← fonts, ThemeProvider, Toaster
│   └── page.tsx                 ← main page
├── components/
│   ├── editor/
│   │   └── note-editor.tsx      ← modal editor, Normal/AI toggle
│   ├── layout/
│   │   ├── navbar.tsx
│   │   └── providers.tsx        ← TanStack Query client
│   └── notes/
│       ├── ai-status-banner.tsx ← warning strip when AI inactive
│       ├── note-card.tsx
│       ├── notes-grid.tsx       ← search, filter, skeleton
│       ├── new-note-float-button.tsx
│       └── stats-bar.tsx
├── hooks/
│   ├── use-ai-status.ts         ← polls /api/ai-status, syncs to store
│   └── use-notes.ts             ← TanStack Query CRUD
├── lib/
│   ├── openai/server.ts         ← server-only: key check + summarize
│   ├── supabase/
│   │   ├── client.ts
│   │   └── queries.ts
│   └── utils.ts
├── store/app-store.ts           ← Zustand
└── types/index.ts
supabase/
└── schema.sql                   ← run once in Supabase SQL editor
```

---

## 🔒 AI System Health Check — How It Works

```
Browser load
     │
     ▼
GET /api/ai-status
     │
     ├─ No OPENAI_API_KEY env var → { active: false }
     ├─ Key doesn't start with "sk-" → { active: false }
     ├─ GET api.openai.com/v1/models → 401 → { active: false }
     └─ 200 OK → { active: true }
     │
     ▼
useAiStatus() hook stores result in Zustand
     │
     ├─ active=false → AiStatusBanner shown, AI mode button disabled
     └─ active=true  → AI mode available in editor
```

The check also re-runs every 2 minutes. On POST `/api/notes` with `mode=ai`, the server **re-validates** the key before touching OpenAI — so a stale client state can never bypass the guard.

---

## ☁️ Deploy to Vercel

```bash
# Push to GitHub first, then:
vercel --prod
```

Set these environment variables in your Vercel project dashboard:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
OPENAI_API_KEY         ← server-only, no NEXT_PUBLIC_ prefix
NEXT_PUBLIC_APP_URL    ← your production URL
```

---

## 🛠 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 App Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 + custom design tokens |
| UI Primitives | Radix UI (headless) |
| State | Zustand + TanStack Query v5 |
| Database | Supabase (Postgres) |
| AI | OpenAI `gpt-4o-mini` |
| Fonts | Inter (body) · Syne (display) · JetBrains Mono |
| Deployment | Vercel |
