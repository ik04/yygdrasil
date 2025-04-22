"use client";

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";

export function Workspace({ noteId }: { noteId: string | null }) {
  const { data: note, isLoading } = useQuery({
    queryKey: ["note", noteId],
    enabled: !!noteId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .eq("id", noteId)
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  if (!noteId) {
    return (
      <div className="flex items-center justify-center h-full bg-black text-gray-300 rounded-xl border border-gray-700">
        <p className="text-muted-foreground text-xl">Select or create a note</p>
      </div>
    );
  }

  if (isLoading) return <p className="text-gray-300">Loading...</p>;

  return (
    <div className="space-y-4 text-gray-300 bg-black p-6 rounded-xl border border-gray-700">
      <h2 className="text-2xl font-bold">{note.title}</h2>
      <p className="text-muted-foreground whitespace-pre-wrap">
        {note.content}
      </p>
    </div>
  );
}
