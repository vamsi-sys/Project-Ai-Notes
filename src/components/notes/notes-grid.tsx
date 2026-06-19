"use client";

import { useState, useMemo } from "react";
import { Search, StickyNote, Loader2, Filter } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { NoteCard } from "./note-card";
import { cn } from "@/lib/utils";
import type { NoteMode } from "@/types";

type FilterMode = "all" | NoteMode;

export function NotesGrid() {
  const { data: notes, isLoading, isError } = useNotes();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const filtered = useMemo(() => {
    if (!notes) return [];
    return notes.filter((n) => {
      const matchMode = filter === "all" || n.mode === filter;
      const q = search.toLowerCase().trim();
      const matchSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.includes(q));
      return matchMode && matchSearch;
    });
  }, [notes, search, filter]);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-destructive/20 bg-destructive/5 py-16 text-center">
        <p className="font-semibold text-destructive">Failed to load notes</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check your Supabase connection and try refreshing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search + Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-border bg-secondary/50 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            aria-label="Search notes"
          />
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 rounded-lg bg-secondary p-1">
          <Filter className="h-3.5 w-3.5 text-muted-foreground ml-1.5" />
          {(["all", "normal", "ai"] as FilterMode[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-all",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f === "all"
                ? `All (${notes?.length ?? 0})`
                : f === "ai"
                ? `AI (${notes?.filter((n) => n.mode === "ai").length ?? 0})`
                : `Normal (${notes?.filter((n) => n.mode === "normal").length ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          hasSearch={!!search}
          filter={filter}
          totalNotes={notes?.length ?? 0}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────

function EmptyState({
  hasSearch,
  filter,
  totalNotes,
}: {
  hasSearch: boolean;
  filter: FilterMode;
  totalNotes: number;
}) {
  if (hasSearch) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Search className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <p className="font-semibold text-muted-foreground">No results found</p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Try different keywords or clear your search.
        </p>
      </div>
    );
  }

  if (totalNotes > 0 && filter !== "all") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Filter className="h-10 w-10 text-muted-foreground/30 mb-4" />
        <p className="font-semibold text-muted-foreground">
          No {filter} notes yet
        </p>
        <p className="mt-1 text-sm text-muted-foreground/60">
          Switch to &quot;All&quot; or create a new {filter} note.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-teal-500/20 ring-1 ring-violet-500/10">
        <StickyNote className="h-8 w-8 text-violet-400" />
      </div>
      <h3 className="font-display text-lg font-semibold">No notes yet</h3>
      <p className="mt-2 max-w-xs text-sm text-muted-foreground leading-relaxed">
        Hit <span className="font-medium text-foreground">New Note</span> to
        create your first note. Choose Normal mode or let AI summarize it for
        you.
      </p>
    </div>
  );
}

// ─── Skeleton Card ────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-md shimmer-bg" />
        <div className="h-4 w-2/3 rounded shimmer-bg" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-full rounded shimmer-bg" />
        <div className="h-3 w-5/6 rounded shimmer-bg" />
        <div className="h-3 w-4/6 rounded shimmer-bg" />
      </div>
      <div className="flex justify-between pt-1">
        <div className="h-3 w-1/4 rounded-full shimmer-bg" />
        <div className="h-3 w-1/5 rounded shimmer-bg" />
      </div>
    </div>
  );
}
