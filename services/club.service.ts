// src/services/club.service.ts
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export const clubService = {
  async getExploreClubs() {
    // We remove 'category' because it's not in your SQL schema for the books table
    const { data, error } = await supabase
      .from("clubs")
      .select(
        `
        id,
        name,
        description,
        start_date,
        end_date,
        visibility,
        is_active,
        book_id,
        books (
          title,
          author,
          cover_url
        )
      `,
      )
      .eq("visibility", "PUBLIC")
      .eq("is_active", true);

    if (error) {
      // Professional Tip: Always log the message, not just the object
      console.error("Supabase Error Message:", error.message);
      console.error("Supabase Error Details:", error.details);
      return [];
    }

    console.log("Raw Data from DB:", data);

    return (data || []).map((club: any) => {
      // Handle the case where books might be an object or an array
      const book = Array.isArray(club.books) ? club.books[0] : club.books;

      return {
        id: club.id,
        title: club.name, // The Club's Name
        bookTitle: book?.title || "Unknown Book",
        author: book?.author || "Unknown Author",
        category: "General", // Defaulted because it's not in your DB yet
        desc: club.description || "No description provided.",
        cover: book?.cover_url,
        readers: 1,
        dateRange: club.start_date
          ? `${new Date(club.start_date).toLocaleDateString()} - ${new Date(club.end_date).toLocaleDateString()}`
          : "TBD",
        color: "bg-primary",
      };
    });
  },
};
