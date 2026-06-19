"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Note, NoteInsert } from "@/types";
import toast from "react-hot-toast";

const NOTES_KEY = ["notes"] as const;

async function fetchNotes(): Promise<Note[]> {
  const res = await fetch("/api/notes");
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  return json.data;
}

async function createNote(payload: NoteInsert): Promise<Note> {
  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
  if (json.warning) toast(json.warning, { icon: "⚠️" });
  return json.data;
}

async function deleteNote(id: string): Promise<void> {
  const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
  const json = await res.json();
  if (json.error) throw new Error(json.error);
}

export function useNotes() {
  return useQuery({
    queryKey: NOTES_KEY,
    queryFn: fetchNotes,
    staleTime: 30_000,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: (note) => {
      qc.setQueryData<Note[]>(NOTES_KEY, (old = []) => [note, ...old]);
      toast.success(
        note.mode === "ai" ? "AI note created with summary!" : "Note saved."
      );
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: (_, id) => {
      qc.setQueryData<Note[]>(NOTES_KEY, (old = []) =>
        old.filter((n) => n.id !== id)
      );
      toast.success("Note deleted.");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}
