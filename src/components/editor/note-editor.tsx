"use client";

import { useState, useRef, useEffect } from "react";
import {
  X,
  Sparkles,
  FileText,
  Loader2,
  Tag,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiStatus } from "@/hooks/use-ai-status";
import { useCreateNote } from "@/hooks/use-notes";
import { useAppStore } from "@/store/app-store";
import type { NoteMode } from "@/types";

const MAX_TITLE = 120;
const MAX_CONTENT = 10_000;

export function NoteEditor() {
  const { editorOpen, setEditorOpen } = useAppStore();
  const { aiStatus, aiStatusLoading } = useAiStatus();
  const { mutate: createNote, isPending } = useCreateNote();

  const [mode, setMode] = useState<NoteMode>("normal");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  const titleRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const aiAvailable = !aiStatusLoading && aiStatus?.active === true;

  // Auto-focus title when editor opens
  useEffect(() => {
    if (editorOpen) {
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [editorOpen]);

  // Reset to normal mode if AI becomes unavailable
  useEffect(() => {
    if (!aiAvailable && mode === "ai") setMode("normal");
  }, [aiAvailable, mode]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  });

  function handleClose() {
    setEditorOpen(false);
    // Reset after animation settles
    setTimeout(() => {
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setMode("normal");
    }, 200);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t) && tags.length < 6) {
      setTags([...tags, t]);
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
    if (e.key === "Backspace" && tagInput === "" && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !content.trim() || isPending) return;

    // Guard: if somehow AI mode is selected but AI is not available
    const safeMode: NoteMode = mode === "ai" && !aiAvailable ? "normal" : mode;

    createNote(
      { title: title.trim(), content: content.trim(), mode: safeMode, tags },
      { onSuccess: () => handleClose() }
    );
  }

  if (!editorOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm animate-fade-in"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Create note"
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div className="animate-scale-in glass-card w-full max-w-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-5 py-4">
            <h2 className="font-display text-base font-semibold">New Note</h2>

            {/* Mode Switcher */}
            <div className="flex items-center gap-2">
              <div className="relative flex rounded-lg bg-secondary p-1">
                {/* Normal mode */}
                <button
                  type="button"
                  onClick={() => setMode("normal")}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    mode === "normal"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Normal
                </button>

                {/* AI mode */}
                <button
                  type="button"
                  disabled={!aiAvailable}
                  onClick={() => aiAvailable && setMode("ai")}
                  className={cn(
                    "relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                    mode === "ai"
                      ? "bg-gradient-to-r from-violet-500 to-teal-500 text-white shadow-md"
                      : aiAvailable
                      ? "text-muted-foreground hover:text-foreground"
                      : "cursor-not-allowed opacity-40 text-muted-foreground"
                  )}
                  title={
                    !aiAvailable
                      ? "AI summarization is not available — check your API key"
                      : undefined
                  }
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  AI Note
                  {!aiAvailable && (
                    <AlertTriangle className="h-3 w-3 text-amber-400 ml-0.5" />
                  )}
                </button>
              </div>

              <button
                onClick={handleClose}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                aria-label="Close editor"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* AI mode description strip */}
          {mode === "ai" && aiAvailable && (
            <div className="flex items-center gap-2 border-b border-border/50 bg-gradient-to-r from-violet-500/5 to-teal-500/5 px-5 py-2.5 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-violet-400 shrink-0" />
              <span>
                Your note will be automatically summarized by{" "}
                <span className="font-medium text-foreground">gpt-4o-mini</span>{" "}
                after saving.
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-0">
            {/* Title */}
            <div className="px-5 pt-4 pb-2">
              <input
                ref={titleRef}
                type="text"
                placeholder="Note title…"
                value={title}
                onChange={(e) => setTitle(e.target.value.slice(0, MAX_TITLE))}
                className="w-full bg-transparent font-display text-xl font-semibold placeholder:text-muted-foreground/50 focus:outline-none"
                maxLength={MAX_TITLE}
                required
                aria-label="Note title"
              />
            </div>

            {/* Divider */}
            <div className="mx-5 h-px bg-border/50" />

            {/* Content */}
            <div className="px-5 py-3">
              <textarea
                placeholder={
                  mode === "ai"
                    ? "Write your note here — the more detail, the better the summary…"
                    : "Start writing your note…"
                }
                value={content}
                onChange={(e) =>
                  setContent(e.target.value.slice(0, MAX_CONTENT))
                }
                rows={8}
                className="w-full resize-none bg-transparent text-sm leading-relaxed placeholder:text-muted-foreground/50 focus:outline-none"
                required
                aria-label="Note content"
              />
              <div className="mt-1 text-right font-mono text-[10px] text-muted-foreground/50">
                {content.length}/{MAX_CONTENT}
              </div>
            </div>

            {/* Tags */}
            <div className="border-t border-border/50 px-5 py-3">
              <div className="flex flex-wrap items-center gap-1.5">
                <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-0.5 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label={`Remove tag ${tag}`}
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </span>
                ))}
                {tags.length < 6 && (
                  <input
                    type="text"
                    placeholder={tags.length === 0 ? "Add tags…" : ""}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={addTag}
                    className="flex-1 bg-transparent text-xs text-muted-foreground placeholder:text-muted-foreground/50 focus:outline-none min-w-[80px]"
                    aria-label="Add tag"
                  />
                )}
              </div>
            </div>

            {/* Footer / Submit */}
            <div className="flex items-center justify-between border-t border-border/50 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                {mode === "ai"
                  ? "✦ AI will generate a summary after saving"
                  : "Saved to Supabase Postgres"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!title.trim() || !content.trim() || isPending}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-5 py-2 text-xs font-semibold transition-all active:scale-95",
                    "disabled:cursor-not-allowed disabled:opacity-50",
                    mode === "ai"
                      ? "bg-gradient-to-r from-violet-500 to-teal-500 text-white shadow-md hover:shadow-lg hover:opacity-95"
                      : "bg-primary text-primary-foreground hover:opacity-90"
                  )}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {mode === "ai" ? "Summarizing…" : "Saving…"}
                    </>
                  ) : (
                    <>
                      {mode === "ai" ? (
                        <Sparkles className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                      {mode === "ai" ? "Save & Summarize" : "Save Note"}
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
