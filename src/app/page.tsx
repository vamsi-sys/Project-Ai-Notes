import { Navbar } from "@/components/layout/navbar";
import { AiStatusBanner } from "@/components/notes/ai-status-banner";
import { NotesGrid } from "@/components/notes/notes-grid";
import { NoteEditor } from "@/components/editor/note-editor";
import { StatsBar } from "@/components/notes/stats-bar";
import { NewNoteFloatButton } from "@/components/notes/new-note-float-button";

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-mesh-dark">
      {/* Ambient background blobs */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-violet-500/8 blur-3xl dark:bg-violet-500/10" />
        <div className="absolute top-1/2 -left-40 h-80 w-80 rounded-full bg-teal-500/6 blur-3xl dark:bg-teal-500/8" />
        <div className="absolute -bottom-20 right-1/3 h-64 w-64 rounded-full bg-violet-500/5 blur-3xl" />
      </div>

      <Navbar />

      <main className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero heading */}
        <section className="mb-8">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Your{" "}
            <span className="gradient-text">Notes</span>
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground max-w-lg">
            Write plainly, or let AI distill your thoughts into a crisp summary.
            Every note is persisted to Supabase Postgres.
          </p>
        </section>

        {/* AI status warning */}
        <div className="mb-6">
          <AiStatusBanner />
        </div>

        {/* Stats */}
        <section className="mb-8">
          <StatsBar />
        </section>

        {/* Notes grid */}
        <section>
          <NotesGrid />
        </section>
      </main>

      {/* Floating action button (mobile) */}
      <NewNoteFloatButton />

      {/* Note editor modal */}
      <NoteEditor />
    </div>
  );
}
