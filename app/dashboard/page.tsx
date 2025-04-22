"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Workspace } from "@/components/dashboard/workspace";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [notes, setNotes] = useState<any[]>([]);
  const router = useRouter();

  const handleNoteUpdate = (noteId: string, title: string) => {
    setNotes((prevNotes) =>
      prevNotes.map((note) => (note.id === noteId ? { ...note, title } : note))
    );
  };

  const handleNewNote = (note: any) => {
    setNotes((prevNotes) => [...prevNotes, note]);
  };

  const handleNoteDelete = (noteId: string) => {
    setNotes((prevNotes) => prevNotes.filter((note) => note.id !== noteId));
    setSelectedNoteId(null);
  };

  useEffect(() => {
    const checkUserSession = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
      } else {
        setUserId(user.id);
      }
    };

    checkUserSession();
  }, [router]);

  if (!userId) {
    return null;
  }

  return (
    <div className="h-screen overflow-hidden bg-black text-gray-300 flex">
      <Sidebar
        onSelectNote={setSelectedNoteId}
        userId={userId}
        notes={notes}
        setNotes={setNotes}
      />
      <main className="flex-1 p-6">
        <Workspace
          noteId={selectedNoteId}
          onUpdateNote={handleNoteUpdate}
          onDeleteNote={handleNoteDelete}
        />
      </main>
    </div>
  );
}
