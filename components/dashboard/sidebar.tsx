import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { createNote, getNotesForUser } from "@/app/services/notes";

type SidebarProps = {
  onSelectNote: (id: string) => void;
  userId: string;
  notes: any[];
  setNotes: (notes: any[]) => void;
};

export function Sidebar({
  onSelectNote,
  userId,
  notes,
  setNotes,
}: SidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const notesData = await getNotesForUser(userId);
        setNotes(notesData);
      } catch (error) {
        console.error("Error fetching notes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [userId, setNotes]);

  const handleCreateNote = async () => {
    try {
      const newNote: any = await createNote("New Note", "", userId);
      onSelectNote(newNote.id);
      setNotes([...notes, newNote]);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  };

  return (
    <aside
      className={`h-full ${
        expanded ? "w-64" : "w-16"
      } transition-all border-r border-gray-700 bg-black text-gray-300`}
    >
      <div className="h-full flex flex-col p-4">
        <Button
          variant="default"
          className="mb-4"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? (
            <div className="flex items-center gap-1">
              <PanelLeftClose size={20} className="text-gray-300" />
              <p className="capitalize">close</p>
            </div>
          ) : (
            <PanelLeftOpen size={20} className="text-gray-300" />
          )}
        </Button>

        {expanded && (
          <div className="space-y-4">
            <Button className="w-full" onClick={handleCreateNote}>
              + New Note
            </Button>

            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="text-xs text-muted-foreground">My Notes</p>
              {loading ? (
                <p>Loading...</p>
              ) : notes.length === 0 ? (
                <p>No notes available</p>
              ) : (
                notes.map((note) => (
                  <button
                    key={note.id}
                    onClick={() => onSelectNote(note.id)}
                    className="block text-left text-gray-300 hover:bg-gray-800 hover:underline p-2 rounded"
                  >
                    {note.title}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
