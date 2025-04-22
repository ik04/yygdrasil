import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { updateNote, getNoteById, deleteNote } from "@/app/services/notes";
import { useRouter } from "next/navigation";

type WorkspaceProps = {
  noteId: string | null;
  onUpdateNote: (noteId: string, title: string) => void;
};

export function Workspace({ noteId, onUpdateNote }: WorkspaceProps) {
  const [note, setNote] = useState<{ title: string; content: string } | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (!noteId) {
      setNote(null);
      setTitle("");
      setContent("");
      setError("");
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
      } catch (err) {
        setError("Error fetching note");
      }
    };

    fetchNote();
  }, [noteId]);

  const saveNote = async () => {
    setIsSaving(true);
    try {
      await updateNote(noteId!, title, content);
    } catch (err) {
      setError("Error updating note");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (noteId) {
      onUpdateNote(noteId, newTitle);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handleDelete = async () => {
    if (noteId) {
      try {
        await deleteNote(noteId);
        setIsDeleted(true);
        router.refresh();
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <input
          type="text"
          className="text-2xl font-bold bg-transparent text-white border-b-2 border-gray-500"
          value={title}
          onChange={handleTitleChange}
          disabled={isSaving}
          placeholder="Note Title"
        />
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="text-red-500"
            onClick={handleDelete}
            disabled={isSaving}
          >
            Delete
          </Button>
          <Button
            variant="default"
            className="text-white"
            onClick={saveNote}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>

      <textarea
        className="w-full h-72 bg-transparent text-white border-b-2 border-gray-500"
        value={content}
        onChange={handleContentChange}
        disabled={isSaving}
        placeholder="Write your note here..."
      />

      {error && <span className="text-red-500">{error}</span>}
    </div>
  );
}
