import { NextRequest, NextResponse } from "next/server";
import { getNoteById, updateNote, deleteNote } from "@/lib/supabase/queries";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const note = await getNoteById(id);
    if (!note) {
      return NextResponse.json({ data: null, error: "Note not found." }, { status: 404 });
    }
    return NextResponse.json({ data: note, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch note";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await req.json();
    const note = await updateNote(id, body);
    return NextResponse.json({ data: note, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update note";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await deleteNote(id);
    return NextResponse.json({ data: { id }, error: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete note";
    return NextResponse.json({ data: null, error: message }, { status: 500 });
  }
}
