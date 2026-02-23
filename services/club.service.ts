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
          cover_url,
          category  
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
        category: book?.category, // Defaulted because it's not in your DB yet
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
  async getCategories() {
    const { data, error } = await supabase
      .from("book_categories")
      .select("name")
      .order("name");
    if (error) throw error;
    return data.map((c) => c.name);
  },
  // src/services/club.service.ts

  async createFullClub(userId: string, { bookData, clubData, chapters }: any) {
    // 1. Validation to prevent the "length" error
    if (!chapters || chapters.length === 0) {
      throw new Error("At least one chapter is required.");
    }

    try {
      // 2. Upload Cover
      const coverExt = bookData.coverFile?.name.split(".").pop();
      const coverPath = `covers/${crypto.randomUUID()}.${coverExt}`;
      await supabase.storage
        .from("books")
        .upload(coverPath, bookData.coverFile!);
      const coverUrl = supabase.storage.from("books").getPublicUrl(coverPath)
        .data.publicUrl;

      // 3. Upload PDF (Optional)
      let pdfUrl = null;
      if (bookData.pdfFile) {
        const pdfExt = bookData.pdfFile.name.split(".").pop();
        const pdfPath = `pdfs/${crypto.randomUUID()}.${pdfExt}`;
        await supabase.storage.from("books").upload(pdfPath, bookData.pdfFile);
        pdfUrl = supabase.storage.from("books").getPublicUrl(pdfPath)
          .data.publicUrl;
      }

      // 4. Create Book
      const { data: book, error: bErr } = await supabase
        .from("books")
        .insert({
          title: bookData.title,
          author: bookData.author,
          description: bookData.description,
          category: bookData.category,
          cover_url: coverUrl,
          pdf_url: pdfUrl,
          total_pages: chapters[chapters.length - 1].end_page, // This won't crash now
        })
        .select()
        .single();
      if (bErr) throw bErr;

      // 5. Create Club
      const { data: club, error: cErr } = await supabase
        .from("clubs")
        .insert({
          name: clubData.name,
          description: clubData.description,
          start_date: clubData.startDate,
          end_date: clubData.endDate,
          default_start_date: clubData.startDate,
          default_end_date: clubData.endDate,
          visibility: clubData.visibility,
          book_id: book.id,
          owner_id: userId,
        })
        .select()
        .single();
      if (cErr) throw cErr;

      // 6. Create Chapters, Chat Rooms, and Reading Progress
      for (const [index, ch] of chapters.entries()) {
        const { data: chapter } = await supabase
          .from("chapters")
          .insert({
            club_id: club.id,
            title: ch.title,
            chapter_number: index + 1,
            start_page: ch.start_page,
            end_page: ch.end_page,
          })
          .select()
          .single();

        // Chapter Chat Room
        await supabase.from("chat_rooms").insert({
          club_id: club.id,
          chapter_id: chapter.id,
          type: "CHAPTER",
          title: `📖 ${ch.title}`,
        });

        // Reading Progress
        await supabase.from("reading_progress").insert({
          user_id: userId,
          club_id: club.id,
          chapter_id: chapter.id,
          status: index === 0 ? "IN_PROGRESS" : "NOT_STARTED",
          current_page: index === 0 ? ch.start_page : null,
        });
      }

      // 7. Global Chat Rooms
      await supabase.from("chat_rooms").insert([
        { club_id: club.id, type: "GENERAL", title: "💬 General Discussion" },
        { club_id: club.id, type: "SPOILER", title: "🚨 Spoiler Room" },
      ]);

      // 8. Membership
      await supabase.from("club_members").insert({
        club_id: club.id,
        user_id: userId,
        role: "OWNER",
      });

      // 9. Announcement Post
      if (clubData.makePost && clubData.visibility === "PUBLIC") {
        await supabase.from("posts").insert({
          user_id: userId,
          club_id: club.id,
          content: `Founded a new circle: ${clubData.name}! Reading ${bookData.title}.`,
          post_type: "CLUB_ANNOUNCEMENT",
        });
      }

      // 10. Invite Link
      const token = Math.random().toString(36).substring(2, 15);
      await supabase.from("club_invites").insert({
        club_id: club.id,
        token,
        created_by: userId,
      });

      return {
        club,
        inviteLink: `${window.location.origin}/join/${token}`,
      };
    } catch (error) {
      console.error("Create Club Failed:", error);
      throw error;
    }
  },
  async getClubFullData(clubId: string) {
    const { data, error } = await supabase
      .from("clubs")
      .select(
        `
        *,
        books (*),
        club_members (
          id, 
          user_id, 
          role, 
          is_suspended, 
          profiles (name, email, image)
        ),
        club_invites (token)
      `,
      )
      .eq("id", clubId)
      .single();

    if (error) throw error;

    // IMPORTANT FIX: Supabase returns joined tables as an array [ {} ]
    // We flatten it so the UI state works correctly with 'club.books.description'
    if (data && Array.isArray(data.books)) {
      data.books = data.books[0];
    }

    return data;
  },

  async updateClub(clubId: string, updates: any) {
    const { data, error } = await supabase
      .from("clubs")
      .update({
        name: updates.name,
        description: updates.description,
        start_date: updates.start_date,
        end_date: updates.end_date,
        visibility: updates.visibility,
      })
      .eq("id", clubId)
      .select();

    if (error) throw error;
    return data;
  },

  async updateBook(bookId: string, updates: any, pdfFile?: File) {
    let pdfUrl = updates.pdf_url;

    if (pdfFile) {
      const pdfPath = `pdfs/${crypto.randomUUID()}`;
      await supabase.storage.from("books").upload(pdfPath, pdfFile);
      pdfUrl = supabase.storage.from("books").getPublicUrl(pdfPath)
        .data.publicUrl;
    }

    const { data, error } = await supabase
      .from("books")
      .update({
        title: updates.title,
        author: updates.author,
        description: updates.description,
        category: updates.category,
        pdf_url: pdfUrl,
      })
      .eq("id", bookId)
      .select();

    if (error) throw error;
    return data;
  },

  async updateMemberStatus(
    clubId: string,
    userId: string,
    action: "REMOVE" | "BAN" | "UNBAN",
  ) {
    if (action === "REMOVE") {
      return await supabase
        .from("club_members")
        .delete()
        .eq("club_id", clubId)
        .eq("user_id", userId);
    } else {
      return await supabase
        .from("club_members")
        .update({ is_suspended: action === "BAN" })
        .eq("club_id", clubId)
        .eq("user_id", userId);
    }
  },

  async deleteClub(clubId: string) {
    // 1. Fetch club to get book_id
    const { data: club } = await supabase
      .from("clubs")
      .select("book_id")
      .eq("id", clubId)
      .single();

    // 2. Delete Club (Tables linked via FK will cascade if set, otherwise handle manually)
    const { error: clubErr } = await supabase
      .from("clubs")
      .delete()
      .eq("id", clubId);
    if (clubErr) throw clubErr;

    // 3. Delete Book
    if (club?.book_id) {
      await supabase.from("books").delete().eq("id", club.book_id);
    }
    return true;
  },
};
