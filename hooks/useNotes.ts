import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createNote,
  getNoteById,
  getNotesForUser,
  updateNote,
  deleteNote,
} from "@/app/services/notes";

export function useNotes(userId: string) {
  const queryClient = useQueryClient();

  const notesQuery = useQuery({
    queryKey: ["notes", userId],
    queryFn: () => getNotesForUser(userId),
    enabled: !!userId,
  });

  const createNoteMutation = useMutation({
    mutationFn: ({ title, content }: { title: string; content: string }) =>
      createNote(title, content, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", userId] });
    },
  });

  const updateNoteMutation = useMutation({
    mutationFn: ({
      noteId,
      title,
      content,
    }: {
      noteId: string;
      title: string;
      content: string;
    }) => updateNote(noteId, title, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["notes", userId] });
      queryClient.invalidateQueries({ queryKey: ["note", variables.noteId] });
    },
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId: string) => deleteNote(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes", userId] });
    },
  });

  return {
    notes: notesQuery.data || [],
    isLoading: notesQuery.isLoading,
    error: notesQuery.error,
    createNote: createNoteMutation.mutate,
    updateNote: updateNoteMutation.mutate,
    deleteNote: deleteNoteMutation.mutate,
  };
}
