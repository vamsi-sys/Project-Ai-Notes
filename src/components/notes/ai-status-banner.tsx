"use client";

import { AlertTriangle, ZapOff, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAiStatus } from "@/hooks/use-ai-status";

export function AiStatusBanner() {
  const { aiStatus, aiStatusLoading } = useAiStatus();
  const [dismissed, setDismissed] = useState(false);

  // Don't show while loading, when AI is active, or if dismissed
  if (aiStatusLoading || aiStatus?.active || dismissed) return null;

  return (
    <div
      role="alert"
      className={cn(
        "animate-slide-up",
        "relative flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/8 px-4 py-3",
        "text-amber-600 dark:text-amber-400"
      )}
    >
      {/* Icon */}
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/15">
        <ZapOff className="h-4 w-4" />
      </div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">
          AI Summarization is currently inactive
        </p>
        <p className="mt-0.5 text-xs opacity-80">
          {aiStatus?.message ?? "OpenAI API key is missing or invalid."}{" "}
          Only <span className="font-medium">Normal Note</span> mode is
          available. Add your API key to{" "}
          <code className="rounded bg-amber-500/15 px-1 font-mono text-[11px]">
            .env.local
          </code>{" "}
          and restart to enable AI features.
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        className="shrink-0 rounded-md p-1 opacity-60 transition-opacity hover:opacity-100"
        aria-label="Dismiss warning"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Left accent line */}
      <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-amber-500/50" />
    </div>
  );
}

// Compact inline version for use inside the editor
export function AiStatusInlineWarning() {
  const { aiStatus, aiStatusLoading } = useAiStatus();

  if (aiStatusLoading || aiStatus?.active) return null;

  return (
    <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/8 px-3 py-2 text-xs text-amber-600 dark:text-amber-400">
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>
        <span className="font-semibold">AI mode unavailable.</span>{" "}
        Configure your OpenAI key to enable summaries.
      </span>
    </div>
  );
}
