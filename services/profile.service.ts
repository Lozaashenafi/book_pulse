// src/services/profile.service.ts
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const profileService = {
  async getStats(userId: string) {
    const [clubs, progress, messages] = await Promise.all([
      supabase
        .from("club_members")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("reading_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("status", "COMPLETED"),
      supabase
        .from("chat_messages")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    return {
      circles: clubs.count || 0,
      booksRead: progress.count || 0,
      discussions: messages.count || 0,
    };
  },

  async getCurrentReads(userId: string) {
    const { data, error } = await supabase
      .from("reading_progress")
      .select(
        `
        current_page,
        status,
        clubs (
          id,
          name,
          books (
            title, 
            author, 
            total_pages
          )
        )
      `,
      )
      .eq("user_id", userId)
      .eq("status", "IN_PROGRESS")
      .limit(2);

    if (error) {
      console.error("Error fetching Current Reads:", error);
      return [];
    }

    console.log("Raw Reading Data:", data); // Check your console with this!

    return (data || []).map((item: any) => {
      // Handle potential array vs object returns from Supabase joins
      const club = Array.isArray(item.clubs) ? item.clubs[0] : item.clubs;
      const book = Array.isArray(club?.books) ? club.books[0] : club?.books;

      const total = book?.total_pages || 100;
      const current = item.current_page || 0;

      return {
        title: book?.title || "Unknown Title",
        author: book?.author || "Unknown Author",
        progress: Math.min(100, Math.round((current / total) * 100)),
      };
    });
  },

  async getActiveCircles(userId: string) {
    const { data, error } = await supabase
      .from("club_members")
      .select(
        `
        clubs (
          id, 
          name
        )
      `,
      )
      .eq("user_id", userId)
      .limit(5);

    if (error) {
      console.error("Error fetching Circles:", error);
      return [];
    }

    // Filter out any null joins
    return (data || [])
      .map((c: any) => (Array.isArray(c.clubs) ? c.clubs[0] : c.clubs))
      .filter((club) => club !== null);
  },
};
