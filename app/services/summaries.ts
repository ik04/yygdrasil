import { supabase } from "@/lib/supabase/client";

export const createSummary = async (noteId: string, content: string) => {
  const { data, error } = await supabase
    .from("summaries")
    .insert([
      {
        note_id: noteId,
        content,
      },
    ])
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getSummariesForNote = async (noteId: string) => {
  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("note_id", noteId);
  if (error) throw new Error(error.message);
  return data;
};

export const getSummaryById = async (summaryId: string) => {
  const { data, error } = await supabase
    .from("summaries")
    .select("*")
    .eq("id", summaryId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteSummary = async (summaryId: string) => {
  const { data, error } = await supabase
    .from("summaries")
    .delete()
    .eq("id", summaryId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};
