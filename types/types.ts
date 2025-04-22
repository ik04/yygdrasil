type SidebarProps = {
  onSelectNote: (id: string) => void;
  userId: string;
  notes: any[];
  setNotes: (notes: any[]) => void;
  isOpen: boolean;
  onToggle: () => void;
};

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
