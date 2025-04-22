"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Workspace } from "@/components/dashboard/workspace";
import { supabase } from "@/lib/supabase/client";

export default function DashboardPage() {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUserSession = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        router.push("/login");
      } else {
        setUserId(user.id);
      }
    };

    checkUserSession();
  }, [router]);

  if (!userId) {
    return null;
  }

  return (
    <div className="h-screen bg-black text-gray-300 flex">
      <Sidebar onSelectNote={setSelectedNoteId} userId={userId} />
      <main className="flex-1 p-6">
        <Workspace noteId={selectedNoteId} />
      </main>
    </div>
  );
}
