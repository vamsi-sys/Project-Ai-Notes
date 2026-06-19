"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Zap, ZapOff, PenSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAiStatus } from "@/hooks/use-ai-status";
import { useAppStore } from "@/store/app-store";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { aiStatus, aiStatusLoading } = useAiStatus();
  const { setEditorOpen } = useAppStore();

  return (
    <header className="sticky top-0 z-40 w-full glass border-b border-border/50">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-teal-500 shadow-lg">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">
            Note<span className="gradient-text">Forge</span>
          </span>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* AI status badge */}
          {!aiStatusLoading && (
            <div
              className={cn(
                "hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all",
                aiStatus?.active
                  ? "bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20"
                  : "bg-destructive/10 text-destructive ring-1 ring-destructive/20"
              )}
            >
              {aiStatus?.active ? (
                <Zap className="h-3 w-3" />
              ) : (
                <ZapOff className="h-3 w-3" />
              )}
              {aiStatus?.active ? "AI Active" : "AI Inactive"}
            </div>
          )}

          {/* New note button */}
          <button
            onClick={() => setEditorOpen(true)}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg active:scale-95"
          >
            <PenSquare className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">New Note</span>
          </button>

          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
