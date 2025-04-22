import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
  User,
  Trash2,
} from "lucide-react";
import { createNote, getNotesForUser, deleteNote } from "@/app/services/notes";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();
  }, []);

  const handleCreateNote = useCallback(async () => {
    try {
      const newNote: any = await createNote("New Note", "", userId);
      onSelectNote(newNote.id);
      setNotes([...notes, newNote]);
    } catch (error) {
      console.error("Error creating note:", error);
    }
  }, [userId, notes, setNotes, onSelectNote]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "o") {
        e.preventDefault();
        handleCreateNote();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleCreateNote]);

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setNotes([]);
      onSelectNote("");

      router.push("/login");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleNoteDelete = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); // Prevent note selection when deleting
    try {
      await deleteNote(noteId);
      setNotes(notes.filter((note) => note.id !== noteId));
      onSelectNote(""); // Clear selected note
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const truncateTitle = (title: string, maxLength: number = 24) => {
    return title.length > maxLength
      ? `${title.substring(0, maxLength)}...`
      : title;
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
          <>
            <div className="flex-1 space-y-4">
              {user && (
                <div className="flex items-center gap-2 px-2 py-1 text-sm text-gray-400 border-b border-gray-800">
                  <User size={14} />
                  <span className="truncate">{user.email?.split("@")[0]}</span>
                </div>
              )}

              <Button
                className="w-full flex items-center justify-center gap-2"
                onClick={handleCreateNote}
              >
                <span>+ New Note</span>
                <span className="text-xs text-gray-400">(Ctrl+O)</span>
              </Button>

              <div className="space-y-1 text-sm text-muted-foreground">
                <p className="text-xs text-muted-foreground">My Notes</p>
                {loading ? (
                  <p>Loading...</p>
                ) : notes.length === 0 ? (
                  <p>No notes available</p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="group flex items-center hover:bg-gray-800 rounded"
                    >
                      <button
                        onClick={() => onSelectNote(note.id)}
                        className="flex-1 text-left text-gray-300 p-2 overflow-hidden"
                      >
                        <span className="block truncate">
                          {truncateTitle(note.title || "New Note")}
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleNoteDelete(e, note.id)}
                        className="hidden group-hover:flex p-2 text-gray-400 hover:text-red-500"
                        title="Delete note"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Button
              variant="ghost"
              onClick={handleLogout}
              className="mt-auto text-gray-400 hover:text-white flex items-center gap-2"
            >
              <LogOut size={16} />
              Logout
            </Button>
          </>
        )}
      </div>
    </aside>
  );
}
