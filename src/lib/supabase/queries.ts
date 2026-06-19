import { supabase } from "./client";
import type { Note, NoteInsert } from "@/types";

export async function getNotes(): Promise<Note[]> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data as Note[]) ?? [];
}

export async function getNoteById(id: string): Promise<Note | null> {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return null;
  return data as Note;
}

export async function createNote(note: NoteInsert): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .insert([{ ...note, tags: note.tags ?? [] }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Note;
}

export async function updateNote(
  id: string,
  updates: Partial<Pick<Note, "title" | "content" | "summary" | "tags">>
): Promise<Note> {
  const { data, error } = await supabase
    .from("notes")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Note;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
