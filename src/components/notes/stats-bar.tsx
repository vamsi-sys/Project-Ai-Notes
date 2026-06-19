"use client";

import { StickyNote, Sparkles, FileText, Zap } from "lucide-react";
import { useNotes } from "@/hooks/use-notes";
import { cn } from "@/lib/utils";

export function StatsBar() {
  const { data: notes } = useNotes();

  const total = notes?.length ?? 0;
  const aiNotes = notes?.filter((n) => n.mode === "ai").length ?? 0;
  const normalNotes = total - aiNotes;
  const withSummary = notes?.filter((n) => n.summary).length ?? 0;

  const stats = [
    { label: "Total Notes", value: total, icon: StickyNote, color: "text-foreground" },
    { label: "Normal", value: normalNotes, icon: FileText, color: "text-muted-foreground" },
    { label: "AI Notes", value: aiNotes, icon: Sparkles, color: "text-violet-400" },
    { label: "Summarized", value: withSummary, icon: Zap, color: "text-teal-400" },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="glass-card flex items-center gap-3 px-4 py-3"
        >
          <div className={cn("shrink-0", stat.color)}>
            <stat.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-lg font-bold leading-none tabular-nums">
              {stat.value}
            </p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              {stat.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
