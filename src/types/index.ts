// ─── Note Types ──────────────────────────────────────────────────────────────

export type NoteMode = "normal" | "ai";

export interface Note {
  id: string;
  title: string;
  content: string;
  summary: string | null;
  mode: NoteMode;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface NoteInsert {
  title: string;
  content: string;
  mode: NoteMode;
  tags?: string[];
}

export interface NoteUpdate {
  id: string;
  title?: string;
  content?: string;
  tags?: string[];
}

// ─── API Types ────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface AiStatusResponse {
  active: boolean;
  message: string;
}

export interface CreateNoteResponse {
  note: Note;
  summary?: string;
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export interface AppState {
  aiStatus: AiStatusResponse | null;
  aiStatusLoading: boolean;
  selectedNoteId: string | null;
  sidebarOpen: boolean;
  theme: "dark" | "light" | "system";
}
