import { NextRequest, NextResponse } from "next/server";
import { createNote, getNotes } from "@/lib/supabase/queries";
import { summarizeNote, checkOpenAIStatus } from "@/lib/openai/server";
import type { NoteInsert } from "@/types";

export async function GET() {
  try {
    const notes = await getNotes();
    return NextResponse.json({ data: notes, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch notes";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as NoteInsert;

    if (!body.title?.trim() || !body.content?.trim()) {
      return NextResponse.json(
        { data: null, error: "Title and content are required." },
        { status: 400 }
      );
    }

    // If AI mode, verify key is still active before persisting
    if (body.mode === "ai") {
      const status = await checkOpenAIStatus();
      if (!status.active) {
        return NextResponse.json(
          {
            data: null,
            error:
              "AI Summarization is currently inactive. Please use Normal Note mode.",
          },
          { status: 403 }
        );
      }
    }

    const note = await createNote(body);

    // Generate summary for AI notes
    if (body.mode === "ai") {
      try {
        const summary = await summarizeNote(body.title, body.content);
        // Update note with summary in background — fire-and-forget is fine here
        // but we await so the caller gets the summary immediately
        const { updateNote } = await import("@/lib/supabase/queries");
        const updated = await updateNote(note.id, { summary });
        return NextResponse.json({ data: updated, error: null }, { status: 201 });
      } catch (aiErr) {
        // Note was saved; summary failed — return note anyway with warning
        const warnMsg =
          aiErr instanceof Error ? aiErr.message : "Summary generation failed.";
        return NextResponse.json(
          { data: note, error: null, warning: warnMsg },
          { status: 201 }
        );
      }
    }

    return NextResponse.json({ data: note, error: null }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create note";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
