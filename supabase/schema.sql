-- ─────────────────────────────────────────────────────────────
-- NoteForge — Supabase schema
-- Run this in your Supabase project: SQL Editor → New Query
-- ─────────────────────────────────────────────────────────────

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- Notes table
create table if not exists public.notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null check (char_length(title) between 1 and 120),
  content     text not null check (char_length(content) between 1 and 10000),
  summary     text,
  mode        text not null default 'normal' check (mode in ('normal', 'ai')),
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-update updated_at on row change
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists notes_updated_at on public.notes;
create trigger notes_updated_at
  before update on public.notes
  for each row execute procedure public.handle_updated_at();

-- Indexes for common queries
create index if not exists notes_updated_at_idx on public.notes (updated_at desc);
create index if not exists notes_mode_idx       on public.notes (mode);

-- Row Level Security — open (no auth) for local dev.
-- Tighten in production by adding auth.uid() policies.
alter table public.notes enable row level security;

drop policy if exists "Allow all operations" on public.notes;
create policy "Allow all operations"
  on public.notes
  for all
  using (true)
  with check (true);
