# NoteForge — AI-Powered Notes

A production-grade note-taking application built with **Next.js 15 App Router**, **TypeScript**, and **Tailwind CSS**, backed by **Supabase Postgres**, with optional **OpenAI GPT-4o-mini** summarization gated behind a live system health check.

**🔗 Live App:** [https://project-ai-notes.vercel.app/](https://project-ai-notes.vercel.app/)

This project is a full architectural rebuild of an earlier prototype ([vamsi-sys/ai-notes](https://github.com/vamsi-sys/ai-notes)), keeping the original idea — notes with optional AI summarization — but rebuilt from scratch with production-grade code quality, security, and UI.

---

## Table of Contents

1. [What This App Does](#what-this-app-does)
2. [Tech Stack](#tech-stack)
3. [How It Was Built](#how-it-was-built)
4. [Architecture Deep Dive](#architecture-deep-dive)
5. [The AI System Health Check — How It Works](#the-ai-system-health-check--how-it-works)
6. [Project Structure](#project-structure)
7. [Database Schema](#database-schema)
8. [Running It Locally](#running-it-locally)
9. [Deployment](#deployment)
10. [Security Notes](#security-notes)

---

## What This App Does

NoteForge lets you create two kinds of notes:

- **Normal Note** — plain title + content + tags, saved directly to Postgres. Always available, no dependencies.
- **AI Note** — same as above, but after saving, the app sends the content to OpenAI's `gpt-4o-mini` model and attaches a generated 1–3 sentence summary to the note.

The catch: AI Note mode is **only enabled when the OpenAI integration is actually healthy**. If the API key is missing, malformed, or OpenAI itself is unreachable, the UI automatically disables AI mode and shows a clear warning — so the user is never confused about why a feature isn't working.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server components, API routes, file-based routing |
| Language | TypeScript (strict mode) | Catch bugs at compile time, not runtime |
| Styling | Tailwind CSS + custom design tokens | Fast iteration, consistent theming via CSS variables |
| UI Primitives | Radix UI (headless) | Accessible dialog/dropdown/tooltip behavior without fighting styles |
| Client State | Zustand | Minimal boilerplate for UI state (editor open/closed, AI status) |
| Server State | TanStack Query v5 | Caching, optimistic updates, automatic refetching for notes |
| Database | Supabase (managed Postgres) | Instant Postgres + REST/JS client, generous free tier |
| AI | OpenAI `gpt-4o-mini` | Cheap, fast, good enough for short summarization |
| Fonts | Inter, Syne, JetBrains Mono | Body text, display headings, monospace code/counters |
| Hosting | Vercel | Zero-config Next.js deploys, serverless API routes |

---

## How It Was Built

The build followed a deliberate sequence rather than throwing everything together at once:

**1. Reference and concept extraction.** The original `ai-notes` repo was reviewed not for its code, but for its core idea: notes that can optionally be AI-summarized. The implementation, folder structure, and stack were all rebuilt independently.

**2. Schema first.** Before writing any UI, the Postgres schema (`supabase/schema.sql`) was defined — a single `notes` table with a `mode` column (`normal` | `ai`), a nullable `summary` column, a `tags` array, and an auto-updating `updated_at` trigger. Getting the data model right first avoids reshaping components later.

**3. Server-side AI gate before any UI.** The single most important piece of logic — `checkOpenAIStatus()` — was written before the editor UI existed. It lives in `src/lib/openai/server.ts` and never runs in the browser. This function is what everything else depends on.

**4. API routes.** Three route handlers were built: `/api/ai-status` (health check), `/api/notes` (list + create, with summarization inlined into the POST handler), and `/api/notes/[id]` (get/update/delete a single note).

**5. State layer.** Zustand handles ephemeral UI state (is the editor modal open, what's the latest AI status). TanStack Query owns the notes list itself, since that's server data that needs caching, refetching, and optimistic mutation — a job Zustand isn't designed for.

**6. UI components, outside-in.** Built in this order: page shell and navbar → AI status banner → notes grid with search/filter → note card → the editor modal last, since the editor is the most complex component and depends on the AI status hook already working correctly.

**7. Design pass.** Once functionality worked, a glassmorphism dark/light theme was layered on top using CSS custom properties (`--background`, `--primary`, etc.) so the entire palette can be swapped by changing values in `globals.css`, rather than hunting through components for hardcoded colors.

**8. Deployment debugging.** Initial Vercel builds failed on ESLint errors (unused imports) and an invalid package name (`@radix-ui/react-badge`, which doesn't exist on npm). Both were fixed by removing the dead code. A later build flagged a Next.js CVE (CVE-2025-66478, a critical RSC remote-code-execution vulnerability) — resolved by pinning `next` to `15.4.8`, a patched release.

---

## Architecture Deep Dive

### Why Zustand *and* TanStack Query?

These solve different problems and are intentionally not merged into one store:

- **Zustand** owns state that has no "source of truth" on a server — is the modal open, what theme is active, what's the last-known AI status. This is UI-local and ephemeral.
- **TanStack Query** owns the notes list — data that genuinely lives in Postgres. It handles cache invalidation, background refetching, and lets `useCreateNote()` / `useDeleteNote()` update the cache optimistically without a manual refetch.

Mixing these would mean reimplementing cache invalidation and stale-data handling by hand inside Zustand — solved problems TanStack Query already handles well.

### Why is summarization done inside the POST `/api/notes` handler instead of a separate endpoint?

Creating an AI note is conceptually one action from the user's perspective — "save this note and summarize it" — not two. Doing it server-side in one request means:

- The note is saved first; if the OpenAI call then fails, the note still exists (with a toast warning), rather than the user losing their work.
- The client never needs to orchestrate a two-step "create, then summarize" flow or handle partial failure states in the UI.

### Why check AI status on both the client and the server?

The `AiStatusBanner` and the editor's mode toggle read `aiStatus` from `useAiStatus()`, which polls `/api/ai-status` every two minutes. This is what disables the "AI Note" button in the UI.

But the POST `/api/notes` handler **also** calls `checkOpenAIStatus()` independently before touching OpenAI. This means even if the client's cached status is stale (e.g., the key was just revoked 30 seconds ago), the server still refuses to attempt summarization and returns a clear 403 with a message — the UI can never bypass the gate by being out of sync.

---

## The AI System Health Check — How It Works

This is the feature the entire app is built around, so it's worth walking through in detail.

```
Page loads
    │
    ▼
useAiStatus() hook fires GET /api/ai-status
    │
    ▼
checkOpenAIStatus() runs server-side (src/lib/openai/server.ts):
    │
    ├─ No OPENAI_API_KEY env var set?        → { active: false, message: "...not configured" }
    ├─ Key doesn't start with "sk-"?          → { active: false, message: "...format invalid" }
    ├─ fetch api.openai.com/v1/models
    │     ├─ Returns 401 (revoked/invalid)?   → { active: false, message: "...invalid or revoked" }
    │     ├─ Non-200 response?                → { active: false, message: "OpenAI returned status X" }
    │     ├─ Network error / timeout (5s)?    → { active: false, message: "Could not reach OpenAI" }
    │     └─ 200 OK                           → { active: true,  message: "AI summarization is active" }
    │
    ▼
Result cached in Zustand via setAiStatus()
    │
    ├─ active = false:
    │     • AiStatusBanner renders an amber warning strip on the main page
    │     • The "AI Note" toggle button in the editor becomes disabled with a tooltip
    │     • If a user had AI mode selected and it goes unhealthy mid-session,
    │       a useEffect automatically falls back to "Normal" mode
    │
    └─ active = true:
          • Banner stays hidden
          • "AI Note" mode is selectable in the editor
          • A small strip appears in the editor noting the note will be summarized by gpt-4o-mini
```

The check re-runs automatically every 2 minutes while the app is open, so if you add a valid API key while the app is running, the warning clears without a page refresh (within 2 minutes, or immediately on next reload).

**Why poll instead of just checking once on load?** API keys can be revoked, rate-limited, or OpenAI can have an outage mid-session. A one-time check at page load would leave the UI showing stale "AI Active" state even after the integration breaks.

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── ai-status/route.ts       GET — runs checkOpenAIStatus(), returns { active, message }
│   │   └── notes/
│   │       ├── route.ts             GET (list all) + POST (create, summarize if mode=ai)
│   │       └── [id]/route.ts        GET / PATCH / DELETE for a single note
│   ├── globals.css                  Design tokens (CSS vars), glass utility, animations
│   ├── layout.tsx                   Fonts, ThemeProvider (next-themes), Toaster
│   └── page.tsx                     Main page — assembles navbar, banner, stats, grid, editor
│
├── components/
│   ├── editor/
│   │   └── note-editor.tsx          Modal editor — Normal/AI mode toggle, tag input, submit
│   ├── layout/
│   │   ├── navbar.tsx               Brand, AI status badge, new-note button, theme toggle
│   │   └── providers.tsx            Wraps app in TanStack QueryClientProvider
│   └── notes/
│       ├── ai-status-banner.tsx     Dismissible amber warning when AI is inactive
│       ├── note-card.tsx            Single note display, expand/collapse, delete w/ confirm
│       ├── notes-grid.tsx           Search bar, mode filter tabs, empty states, skeletons
│       ├── new-note-float-button.tsx  Mobile-only floating action button
│       └── stats-bar.tsx            Note counts: total / normal / AI / summarized
│
├── hooks/
│   ├── use-ai-status.ts             Polls /api/ai-status every 2 min, syncs to Zustand
│   └── use-notes.ts                 TanStack Query hooks: useNotes, useCreateNote, useDeleteNote
│
├── lib/
│   ├── openai/server.ts             SERVER-ONLY: checkOpenAIStatus(), summarizeNote()
│   ├── supabase/
│   │   ├── client.ts                Supabase JS client init
│   │   └── queries.ts                getNotes, getNoteById, createNote, updateNote, deleteNote
│   └── utils.ts                     cn() class merger, formatDate, truncate, wordCount
│
├── store/
│   └── app-store.ts                 Zustand store — aiStatus, editorOpen, notes cache, sidebar
│
└── types/
    └── index.ts                     Note, NoteInsert, AiStatusResponse, ApiResponse<T>, etc.

supabase/
└── schema.sql                       Run once in Supabase SQL Editor — creates notes table + RLS
```

---

## Database Schema

```sql
create table public.notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 120),
  content     text not null check (char_length(content) between 1 and 10000),
  summary     text,                              -- null until AI generates it
  mode        text not null default 'normal' check (mode in ('normal', 'ai')),
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now() -- auto-updated via trigger
);
```

Row Level Security is enabled with an open policy (`using (true)`) suitable for a single-user/local-dev setup. For multi-user production use, this should be tightened to filter by `auth.uid()`.

---

## Running It Locally

```bash
git clone https://github.com/vamsi-sys/Project-Ai-Notes.git
cd Project-Ai-Notes
npm install
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=sk-...          # optional — leave blank to test Normal-only mode
```

Run the schema once in your Supabase project's SQL Editor (`supabase/schema.sql`), then:

```bash
npm run dev
```

Visit `http://localhost:3000`.

---

## Deployment

**Live instance:** [https://project-ai-notes.vercel.app/](https://project-ai-notes.vercel.app/)

Deployed on Vercel directly from the GitHub repo. Every push to `main` triggers an automatic rebuild and redeploy.

Required environment variables (set in Vercel → Project → Settings → Environment Variables):

| Variable | Scope | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + Server | Safe to expose — it's just the project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + Server | Safe to expose — Supabase anon key is designed for client use, protected by RLS |
| `OPENAI_API_KEY` | Server only | **Never** prefixed with `NEXT_PUBLIC_` — would leak it to the browser bundle |

---

## Security Notes

- The OpenAI key is read only inside `src/lib/openai/server.ts`, which is never imported by any `"use client"` component. It is not present in the JS bundle shipped to the browser.
- The `/api/notes` POST handler re-validates AI availability server-side before calling OpenAI, regardless of what the client believes the status to be.
- `.env.local` and all `.env*` variants are excluded via `.gitignore` — no secrets are ever committed.
- Supabase Row Level Security is enabled on the `notes` table (currently open for single-user use — see schema notes above for tightening it).
