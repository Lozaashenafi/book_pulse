import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { createFullClub, getCategories } from "@/services/club.service";

interface Category {
  id: string;
  name: string;
}

export function useCreateClub(userId?: string) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    description: "",
    categoryId: "",
    coverFile: null as File | null,
    pdfFile: null as File | null,
  });

  const [chapters, setChapters] = useState([
    { title: "Chapter 1", start_page: 1, end_page: 20 },
  ]);

  const [clubData, setClubData] = useState({
    name: "",
    description: "",
    startDate: "",
    endDate: "",
    visibility: "PUBLIC" as "PUBLIC" | "PRIVATE",
    makePost: true,
  });

  useEffect(() => {
    getCategories()
      .then((data: any) => setCategories(data))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleChapterEndChange = (index: number, newEndValue: string) => {
    const newEnd = parseInt(newEndValue) || 0;
    setChapters((prev) => {
      const updated = [...prev];
      updated[index].end_page = newEnd;
      // Cascade page numbers to subsequent chapters
      for (let i = index + 1; i < updated.length; i++) {
        const previousEnd = updated[i - 1].end_page;
        const chapterRange = Math.max(
          0,
          updated[i].end_page - updated[i].start_page,
        );
        updated[i].start_page = previousEnd + 1;
        updated[i].end_page = updated[i].start_page + chapterRange;
      }
      return updated;
    });
  };

  const addChapter = () => {
    setChapters((prev) => {
      if (prev.length === 0) {
        return [{ title: "Chapter 1", start_page: 1, end_page: 20 }];
      }
      const last = prev[prev.length - 1];
      return [
        ...prev,
        {
          title: `Chapter ${prev.length + 1}`,
          start_page: last.end_page + 1,
          end_page: last.end_page + 20,
        },
      ];
    });
  };

  const submit = async () => {
    if (!userId) return toast.error("Please log in first");
    setLoading(true);

    try {
      const supabase = createClient();

      // 1. Upload Cover Art
      let coverUrl = "";
      if (bookData.coverFile) {
        const coverExt = bookData.coverFile.name.split(".").pop();
        const coverPath = `covers/${crypto.randomUUID()}.${coverExt}`;
        const { error: upErr } = await supabase.storage
          .from("books")
          .upload(coverPath, bookData.coverFile);
        if (upErr) throw new Error("Cover upload failed");
        coverUrl = supabase.storage.from("books").getPublicUrl(coverPath)
          .data.publicUrl;
      }

      // 2. Upload PDF
      let pdfUrl = null;
      if (bookData.pdfFile) {
        const pdfPath = `pdfs/${crypto.randomUUID()}.pdf`;
        const { error: upErr } = await supabase.storage
          .from("books")
          .upload(pdfPath, bookData.pdfFile);
        if (upErr) throw new Error("PDF upload failed");
        pdfUrl = supabase.storage.from("books").getPublicUrl(pdfPath)
          .data.publicUrl;
      }

      // 3. Server Action
      const result = await createFullClub(userId, {
        bookData: { ...bookData, coverUrl, pdfUrl },
        clubData,
        chapters,
      });

      setInviteLink(`${window.location.origin}/join/${result.inviteLink}`);
      setStep(4);
      toast.success("Circle founded successfully!");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return {
    step,
    setStep,
    loading,
    inviteLink,
    imagePreview,
    setImagePreview,
    categories,
    bookData,
    setBookData,
    chapters,
    setChapters,
    clubData,
    setClubData,
    handleChapterEndChange,
    addChapter,
    submit,
  };
}
