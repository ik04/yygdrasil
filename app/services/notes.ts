import { supabase } from "@/lib/supabase/client";

// Create a Note
export const createNote = async (
  title: string,
  content: string,
  userId: string
) => {
  console.log("Creating note with title:", title, "and userId:", userId);

  const { data, error } = await supabase
    .from("notes")
    .insert([{ title, content, user_id: userId }])
    .select("id")
    .single();
  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Failed to create note, no data returned");
  }
  return data;
};

export const getNoteById = async (noteId: string) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const getNotesForUser = async (userId: string) => {
  const { data, error } = await supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

export const updateNote = async (
  noteId: string,
  title: string,
  content: string
) => {
  const { data, error } = await supabase
    .from("notes")
    .update({ title, content })
    .eq("id", noteId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};

export const deleteNote = async (noteId: string) => {
  const { data, error } = await supabase
    .from("notes")
    .delete()
    .eq("id", noteId)
    .single();
  if (error) throw new Error(error.message);
  return data;
};
