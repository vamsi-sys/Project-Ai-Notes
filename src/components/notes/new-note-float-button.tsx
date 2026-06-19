"use client";

import { Plus } from "lucide-react";
import { useAppStore } from "@/store/app-store";

export function NewNoteFloatButton() {
  const { setEditorOpen } = useAppStore();

  return (
    <button
      onClick={() => setEditorOpen(true)}
      className="fixed bottom-6 right-6 z-30 sm:hidden flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-teal-500 text-white shadow-xl shadow-violet-500/25 transition-transform active:scale-90 hover:scale-105"
      aria-label="Create new note"
    >
      <Plus className="h-6 w-6" />
    </button>
  );
}
