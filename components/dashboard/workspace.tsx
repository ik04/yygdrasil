import { useState, useEffect, useCallback } from "react";
import { useDebouncedCallback } from "@/hooks/useDebounce";
import { Button } from "@/components/ui/button";
import { FileText, X, Save, Trash2 } from "lucide-react";
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
  const router = useRouter();

  // Update the debounced save to not affect the UI state
  const debouncedSave = useDebouncedCallback(
    async (newTitle: string, newContent: string) => {
      if (!noteId || !note) return;

      try {
        await updateNote(noteId, newTitle || "New Note", newContent);
        // Only update the note object, not the UI state
        setNote((prev) =>
          prev
            ? { ...prev, title: newTitle || "New Note", content: newContent }
            : null
        );
      } catch (err) {
        setError("Failed to save changes");
      }
    },
    1000
  );

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

  // Update the change handlers to be more responsive
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle); // Update UI immediately
    if (noteId) {
      onUpdateNote(noteId, newTitle);
      debouncedSave(newTitle, content);
    }
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent); // Update UI immediately
    if (noteId) {
      debouncedSave(title, newContent);
    }
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
    setShowSummary(!showSummary);
  };

  if (isDeleted) {
    return <div className="text-red-500">Note has been deleted.</div>;
  }

  if (!note) {
    return <div>No Note Selected</div>;
  }

  return (
    <div className="h-[90vh] flex flex-col md:flex-row relative">
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden pb-16 md:pb-0">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center px-4 py-2 gap-2 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
            <input
              type="text"
              className="text-xl md:text-2xl font-bold bg-transparent text-title font-body focus:outline-none w-full md:w-auto"
              value={title}
              onChange={handleTitleChange}
              placeholder="Note Title"
            />
          </div>

          <textarea
            className="flex-1 w-full bg-transparent text-white p-4 resize-none focus:outline-none [&::-webkit-scrollbar]:hidden"
            value={content}
            onChange={handleContentChange}
            placeholder="Write your note here..."
          />
        </div>

        <div className="hidden md:flex absolute top-2 right-4 gap-2 z-20">
          <Button
            variant="default"
            className="text-title hover:text-white bg-black"
            onClick={toggleSummary}
          >
            <FileText size={16} className="mr-2" />
            Summaries
          </Button>
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-400 bg-black"
            onClick={handleDelete}
          >
            <Trash2 size={16} className="mr-2" />
            Delete
          </Button>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-gray-700 flex justify-between items-center md:hidden z-50">
          <div className="flex items-center gap-2">
            {isSaving && (
              <span className="text-xs text-gray-400">Saving...</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="default"
              className="text-title hover:text-white bg-black"
              onClick={toggleSummary}
            >
              <FileText size={16} />
            </Button>
            <Button
              variant="ghost"
              className="text-red-500 hover:text-red-400 bg-black"
              onClick={handleDelete}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {showSummary && (
        <div className="fixed md:static right-0 top-0 h-full w-full md:w-72 border-l border-gray-700 bg-black md:bg-transparent flex flex-col z-40 md:z-10">
          <div className="p-4 border-b border-gray-700 bg-black sticky top-0">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-400">Summaries</h3>
              <Button
                variant="ghost"
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

          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
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
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-4 z-60">
          <span className="text-red-500 bg-black px-4 py-2 rounded-full">
            {error}
          </span>
        </div>
      )}
    </div>
  );
}
