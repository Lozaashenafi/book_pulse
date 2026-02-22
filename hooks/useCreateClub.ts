import { useState, useEffect } from "react";
import { clubService } from "@/services/club.service";
import { toast } from "sonner";

export function useCreateClub(userId?: string) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    description: "",
    category: "General",
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
    clubService
      .getCategories()
      .then(setCategories)
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  const handleChapterEndChange = (index: number, newEndValue: string) => {
    const newEnd = parseInt(newEndValue) || 0;
    setChapters((prev) => {
      const updated = [...prev];
      updated[index].end_page = newEnd;
      for (let i = index + 1; i < updated.length; i++) {
        const previousEnd = updated[i - 1].end_page;
        const chapterRange = updated[i].end_page - updated[i].start_page;
        updated[i].start_page = previousEnd + 1;
        updated[i].end_page = updated[i].start_page + chapterRange;
      }
      return updated;
    });
  };

  const addChapter = () => {
    setChapters((prev) => {
      // If there are no chapters at all, start fresh
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
      const result = await clubService.createFullClub(userId, {
        bookData,
        clubData,
        chapters,
      });
      setInviteLink(result.inviteLink);
      setStep(4);
      toast.success("Circle founded successfully!");
    } catch (err: any) {
      toast.error(err.message);
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
