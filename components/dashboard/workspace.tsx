import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { FileText, X, Save } from "lucide-react";
import { updateNote, getNoteById, deleteNote } from "@/app/services/notes";
import { createSummary, getSummariesForNote } from "@/app/services/summaries";
import { useRouter } from "next/navigation";

type Summary = {
  id: string;
  content: string;
  created_at: string;
};

type AnimatedSummary = Summary & {
  isAnimating?: boolean;
};

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
  const [note, setNote] = useState<{
    title: string;
    content: string;
    id: string;
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [error, setError] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [summarizing, setSummarizing] = useState(false);
  const [animatedContent, setAnimatedContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const saveChanges = async () => {
      if (!note?.id || !hasChanges) return;

      try {
        setIsSaving(true);
        await updateNote(note.id, title || "New Note", content);
        setHasChanges(false);
      } catch (err) {
        console.error("Failed to save changes:", err);
      } finally {
        setIsSaving(false);
      }
    };

    // Save changes before switching notes
    return () => {
      if (hasChanges) {
        saveChanges();
      }
    };
  }, [noteId]);

  useEffect(() => {
    if (!noteId) {
      setNote(null);
      setTitle("");
      setContent("");
      setError("");
      setIsDeleted(false);
      setSummaries([]);
      return;
    }
    console.log(noteId);

    const fetchNote = async () => {
      try {
        const fetchedNote = await getNoteById(noteId);
        console.log(fetchedNote);

        setNote(fetchedNote);
        setTitle(fetchedNote.title);
        setContent(fetchedNote.content);
        setError("");
        setIsDeleted(false);
        setHasChanges(false); // Reset changes flag when loading new note
      } catch (err) {
        setError("Error fetching note");
      }
    };

    const loadSummaries = async () => {
      try {
        const data = await getSummariesForNote(noteId);
        setSummaries(data);
      } catch (err) {
        console.error("Failed to load summaries:", err);
      }
    };

    fetchNote();
    loadSummaries();
  }, [noteId]);

  const handleSave = useCallback(async () => {
    if (!noteId || !note || !hasChanges) return;

    try {
      setIsSaving(true);
      await updateNote(noteId, title || "New Note", content);
      setNote((prev) =>
        prev ? { ...prev, title: title || "New Note", content } : null
      );
      setHasChanges(false);
      setError("");
    } catch (err) {
      setError("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  }, [noteId, note, title, content, hasChanges]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSave]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setHasChanges(true);
    if (noteId) {
      onUpdateNote(noteId, e.target.value);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
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

  const handleGenerateSummary = async () => {
    if (!noteId || !content || summarizing) return;

    setSummarizing(true);
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) throw new Error("Failed to generate summary");

      const { summary } = await response.json();
      const newSummary = await createSummary(noteId, summary);
      const formattedSummary: AnimatedSummary = {
        id: newSummary.id,
        content: newSummary.content,
        created_at: newSummary.created_at,
        isAnimating: true,
      };

      setSummaries((prev) => [formattedSummary, ...prev]);
      setShowSummary(true);

      setIsTyping(true);
      let currentText = "";
      for (let i = 0; i < summary.length; i++) {
        currentText += summary[i];
        setAnimatedContent(currentText);
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      setIsTyping(false);

      setSummaries((prev) =>
        prev.map((s) =>
          s.id === formattedSummary.id ? { ...s, isAnimating: false } : s
        )
      );
    } catch (err) {
      setError("Failed to generate summary");
    } finally {
      setSummarizing(false);
      setAnimatedContent("");
    }
  };

  const toggleSummary = async () => {
    if (hasChanges) {
      await handleSave();
    }
    setShowSummary(!showSummary);
  };

  if (isDeleted) {
    return <div className="text-red-500">Note has been deleted.</div>;
  }

  if (!note) {
    return <div>No Note Selected</div>;
  }

  return (
    <div className="h-[90vh] flex">
      <div className="flex-1 overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden">
        <div className="flex justify-between items-center px-4 py-2">
          <input
            type="text"
            className="text-2xl font-bold bg-transparent text-title font-body focus:outline-none"
            value={title}
            onChange={handleTitleChange}
            disabled={isSaving}
            placeholder="Note Title"
          />
          <div className="flex gap-2 items-center">
            {hasChanges && (
              <Button
                variant="outline"
                className="text-title hover:text-white flex items-center gap-2 min-w-[100px] justify-center"
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save size={16} />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            )}
            <Button
              variant="default"
              className="text-title hover:text-white"
              onClick={toggleSummary}
            >
              <FileText size={16} className="mr-2" />
              Summaries
            </Button>
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

        <textarea
          className="flex-1 w-full bg-transparent text-white p-4 resize-none focus:outline-none [&::-webkit-scrollbar]:hidden"
          value={content}
          onChange={handleContentChange}
          disabled={isSaving}
          placeholder="Write your note here..."
        />
      </div>

      {showSummary && (
        <div className="w-72 border-l border-gray-700 overflow-y-auto [&::-webkit-scrollbar]:hidden">
          <div className="p-4 border-b border-gray-700 sticky top-0 bg-black z-10">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-400">Summaries</h3>
              <Button
                variant="default"
                size="sm"
                className="text-gray-400 hover:text-white"
                onClick={() => setShowSummary(false)}
              >
                <X size={16} />
              </Button>
            </div>
            <Button
              variant="default"
              size="sm"
              className="w-full mt-2"
              onClick={handleGenerateSummary}
              disabled={summarizing || !content}
            >
              {summarizing ? "Generating..." : "Generate New Summary"}
            </Button>
          </div>

          <div className="divide-y divide-gray-700">
            {summaries.map((summary) => (
              <div key={summary.id} className="p-4">
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(summary.created_at).toLocaleString()}
                </div>
                <div className="text-sm text-gray-300 whitespace-pre-line">
                  {(summary as AnimatedSummary).isAnimating
                    ? animatedContent
                    : summary.content}
                </div>
              </div>
            ))}
            {summaries.length === 0 && (
              <div className="p-4 text-sm text-gray-500 text-center">
                No summaries yet
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="px-4 py-2">
          <span className="text-red-500">{error}</span>
        </div>
      )}
    </div>
  );
}
