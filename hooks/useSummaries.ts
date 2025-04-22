import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createSummary,
  getSummariesForNote,
  deleteSummary,
} from "@/app/services/summaries";

export function useSummaries(noteId: string | null) {
  const queryClient = useQueryClient();

  const summariesQuery = useQuery({
    queryKey: ["summaries", noteId],
    queryFn: () => getSummariesForNote(noteId!),
    enabled: !!noteId,
  });

  const createSummaryMutation = useMutation({
    mutationFn: (content: string) => createSummary(noteId!, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summaries", noteId] });
    },
  });

  const deleteSummaryMutation = useMutation({
    mutationFn: (summaryId: string) => deleteSummary(summaryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["summaries", noteId] });
    },
  });

  return {
    summaries: summariesQuery.data || [],
    isLoading: summariesQuery.isLoading,
    error: summariesQuery.error,
    createSummary: createSummaryMutation.mutate,
    deleteSummary: deleteSummaryMutation.mutate,
  };
}
