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
  // src/services/profile.service.ts
  async getMyClubs(userId: string) {
    const { data, error } = await supabase
      .from("club_members")
      .select(
        `
      role,
      clubs (
        id,
        name,
        description,
        start_date,
        end_date,
        books (
          title,
          author,
          cover_url
        )
      )
    `,
      )
      .eq("user_id", userId);

    if (error) throw error;

    return (data || []).map((item: any) => {
      // Handle if Supabase returns club as an array or object
      const club = Array.isArray(item.clubs) ? item.clubs[0] : item.clubs;
      const book = Array.isArray(club?.books) ? club.books[0] : club?.books;

      return {
        id: club?.id,
        title: club?.name || "Unnamed Club",
        bookTitle: book?.title || "No Book",
        author: book?.author || "Unknown",
        category: item.role === "OWNER" ? "My Circle" : "Member",
        desc: club?.description || "",
        cover: book?.cover_url,
        readers: 1, // You can add a real count query later
        dateRange: club?.start_date
          ? `${new Date(club.start_date).toLocaleDateString()} - ${new Date(club.end_date).toLocaleDateString()}`
          : "TBD",
      };
    });
  },
};
