"use client";

import { useState } from "react";
import { Sparkles, Trash2, Clock, Tag, ChevronDown, ChevronUp } from "lucide-react";
import { cn, formatDate, truncate } from "@/lib/utils";
import { useDeleteNote } from "@/hooks/use-notes";
import type { Note } from "@/types";

interface NoteCardProps {
  note: Note;
}

export function NoteCard({ note }: NoteCardProps) {
  const { mutate: deleteNote, isPending } = useDeleteNote();
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isAi = note.mode === "ai";
  const contentPreview = truncate(note.content, expanded ? 99999 : 280);
  const isLong = note.content.length > 280;

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    deleteNote(note.id);
  }

  return (
    <article
      className={cn(
        "group animate-slide-up glass-card p-5 transition-all duration-200",
        "hover:shadow-lg hover:border-border",
        isAi
          ? "ring-1 ring-violet-500/15 hover:ring-violet-500/30"
          : "hover:ring-1 hover:ring-border"
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {/* Mode badge */}
          {isAi ? (
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-violet-500 to-teal-500 shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
          ) : (
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-secondary">
              <span className="text-[10px] font-bold text-muted-foreground">N</span>
            </div>
          )}

          <h3 className="font-display font-semibold text-sm leading-tight line-clamp-2">
            {note.title}
          </h3>
        </div>

        {/* Delete */}
        <button
          onClick={handleDelete}
          disabled={isPending}
          className={cn(
            "shrink-0 flex h-7 w-7 items-center justify-center rounded-lg transition-all",
            "opacity-0 group-hover:opacity-100",
            confirmDelete
              ? "bg-destructive/15 text-destructive opacity-100"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
          )}
          title={confirmDelete ? "Click again to confirm" : "Delete note"}
          aria-label={confirmDelete ? "Confirm delete" : "Delete note"}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Content */}
      <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
        {contentPreview}
      </p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-primary hover:opacity-80 transition-opacity"
        >
          {expanded ? (
            <>
              <ChevronUp className="h-3.5 w-3.5" /> Show less
            </>
          ) : (
            <>
              <ChevronDown className="h-3.5 w-3.5" /> Show more
            </>
          )}
        </button>
      )}

      {/* AI Summary */}
      {isAi && note.summary && (
        <div className="mt-4 rounded-lg border border-violet-500/15 bg-violet-500/5 p-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Sparkles className="h-3 w-3 text-violet-400" />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-violet-400">
              AI Summary
            </span>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground italic">
            {note.summary}
          </p>
        </div>
      )}

      {isAi && !note.summary && (
        <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-muted-foreground animate-pulse" />
            <span className="text-[10px] text-muted-foreground italic">
              Summary not yet generated
            </span>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between">
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {note.tags?.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground/60 shrink-0">
          <Clock className="h-2.5 w-2.5" />
          {formatDate(note.updated_at)}
        </div>
      </div>
    </article>
  );
}
