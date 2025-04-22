import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateNote, getNoteById, deleteNote } from "@/app/services/notes";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";

type WorkspaceProps = {
  noteId: string | null;
  onUpdateNote: (noteId: string, title: string) => void;
  onDeleteNote: (noteId: string) => void;
};

export function Workspace({
  noteId,
  onUpdateNote,
  onDeleteNote,
}: WorkspaceProps) {
  const [note, setNote] = useState<{ title: string; content: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const debouncedTitle = useDebounce(title, 1500);
  const debouncedContent = useDebounce(content, 1000);

  useEffect(() => {
    if (!noteId) {
      setNote(null);
      setTitle("");
      setContent("");
      setError("");
      setIsDeleted(false);
      return;
    }
    console.log(noteId);

    const fetchNote = async () => {
      try {
        const fetchedNote = await getNoteById(noteId);
        setNote(fetchedNote);
        setTitle(fetchedNote.title);
        setContent(fetchedNote.content);
        setError("");
        setIsDeleted(false);
      } catch (err) {
        setError("Error fetching note");
      }
    };

    fetchNote();
  }, [noteId]);

  useEffect(() => {
    if (!noteId || !note) return;

    // Set default title if empty after debounce
    const finalTitle = debouncedTitle || "New Note";

    // Don't trigger save if the content matches the current note
    if (finalTitle === note.title && debouncedContent === note.content) {
      return;
    }

    const autoSave = async () => {
      try {
        setIsSaving(true);
        await updateNote(noteId, finalTitle, debouncedContent);
        setNote((prev) =>
          prev
            ? { ...prev, title: finalTitle, content: debouncedContent }
            : null
        );
        // Update the title state if it was empty
        if (!debouncedTitle) {
          setTitle("New Note");
          onUpdateNote(noteId, "New Note");
        }
        setError("");
      } catch (err) {
        setError("Failed to save changes");
      } finally {
        setIsSaving(false);
      }
    };

    autoSave();
  }, [debouncedTitle, debouncedContent, noteId, note, onUpdateNote]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    if (noteId) {
      onUpdateNote(noteId, e.target.value);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleDelete = async () => {
    if (noteId) {
      try {
        await deleteNote(noteId);
        onDeleteNote(noteId);
        setIsDeleted(true);
        setNote(null);
        setTitle("");
        setContent("");
      } catch (err) {
        setError("Error deleting note");
      }
    }
  };

  if (isDeleted) {
    return <div className="text-red-500">Note has been deleted.</div>;
  }

  if (!note) {
    return <div>No Note Selected</div>;
  }

  return (
    <div className="h-[90vh] overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
      <div className="flex justify-between items-center px-4 py-2">
        <input
          type="text"
          className="text-2xl font-bold bg-transparent text-white focus:outline-none"
          value={title}
          onChange={handleTitleChange}
          disabled={isSaving}
          placeholder="Note Title"
        />
        <div className="flex gap-2 items-center">
          {isSaving && <span className="text-sm text-gray-500">Saving...</span>}
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-400"
            onClick={handleDelete}
            disabled={isSaving}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="flex-grow overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]">
        <textarea
          className="w-full h-full bg-transparent text-white p-4 resize-none focus:outline-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:none]"
          value={content}
          onChange={handleContentChange}
          disabled={isSaving}
          placeholder="Write your note here..."
        />
      </div>

      {error && (
        <div className="px-4 py-2">
          <span className="text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
}
