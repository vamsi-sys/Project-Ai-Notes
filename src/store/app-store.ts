import { create } from "zustand";
import type { AiStatusResponse, Note } from "@/types";

interface AppStore {
  // AI status
  aiStatus: AiStatusResponse | null;
  aiStatusLoading: boolean;
  setAiStatus: (status: AiStatusResponse) => void;
  setAiStatusLoading: (loading: boolean) => void;

  // Note selection
  selectedNoteId: string | null;
  setSelectedNoteId: (id: string | null) => void;

  // Editor state
  editorOpen: boolean;
  setEditorOpen: (open: boolean) => void;

  // Notes cache
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  removeNote: (id: string) => void;
  updateNote: (note: Note) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (v: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  aiStatus: null,
  aiStatusLoading: true,
  setAiStatus: (status) => set({ aiStatus: status }),
  setAiStatusLoading: (loading) => set({ aiStatusLoading: loading }),

  selectedNoteId: null,
  setSelectedNoteId: (id) => set({ selectedNoteId: id }),

  editorOpen: false,
  setEditorOpen: (open) => set({ editorOpen: open }),

  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  removeNote: (id) =>
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),
  updateNote: (note) =>
    set((s) => ({
      notes: s.notes.map((n) => (n.id === note.id ? note : n)),
    })),

  sidebarCollapsed: false,
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
}));
