"use client";

import React, { useState, useRef } from "react";
import {
  Book,
  Calendar,
  Users,
  Lock,
  Globe,
  ArrowLeft,
  Plus,
  Upload,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Image as ImageIcon,
  FileText,
  Link,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/useAuthStore";

const CreateClubPage = () => {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");

  // --- Form State ---
  const [bookData, setBookData] = useState({
    title: "",
    author: "",
    coverFile: null as File | null,
    pdfFile: null as File | null,
    totalPages: 0,
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

  // --- Helpers ---
  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const addChapter = () => {
    const lastChapter = chapters[chapters.length - 1];
    setChapters([
      ...chapters,
      {
        title: `Chapter ${chapters.length + 1}`,
        start_page: lastChapter ? lastChapter.end_page + 1 : 1,
        end_page: lastChapter ? lastChapter.end_page + 20 : 20,
      },
    ]);
  };

  const removeChapter = (index: number) => {
    setChapters(chapters.filter((_, i) => i !== index));
  };

  // --- Database Submission ---
  const handleFinalSubmit = async () => {
    if (!user) return alert("Please log in first");
    setLoading(true);

    try {
      // 1. Upload Cover Image (Mandatory)
      const coverExt = bookData.coverFile?.name.split(".").pop();
      const coverPath = `covers/${crypto.randomUUID()}.${coverExt}`;
      const { error: coverErr } = await supabase.storage
        .from("books")
        .upload(coverPath, bookData.coverFile!);
      if (coverErr) throw coverErr;

      // 2. Upload PDF (Optional)
      let pdfPath = null;
      if (bookData.pdfFile) {
        const pdfExt = bookData.pdfFile.name.split(".").pop();
        pdfPath = `pdfs/${crypto.randomUUID()}.${pdfExt}`;
        await supabase.storage.from("books").upload(pdfPath, bookData.pdfFile);
      }

      // 3. Create Book
      const { data: book, error: bookErr } = await supabase
        .from("books")
        .insert({
          title: bookData.title,
          author: bookData.author,
          cover_url: supabase.storage.from("books").getPublicUrl(coverPath).data
            .publicUrl,
          pdf_url: pdfPath
            ? supabase.storage.from("books").getPublicUrl(pdfPath).data
                .publicUrl
            : null,
          total_pages: bookData.totalPages,
        })
        .select()
        .single();

      if (bookErr) throw bookErr;

      // 4. Create Club
      const { data: club, error: clubErr } = await supabase
        .from("clubs")
        .insert({
          name: clubData.name,
          description: clubData.description,
          start_date: clubData.startDate,
          end_date: clubData.endDate,
          default_start_date: clubData.startDate, // Required in your schema
          default_end_date: clubData.endDate, // Required in your schema
          visibility: clubData.visibility,
          book_id: book.id,
          owner_id: user.id,
        })
        .select()
        .single();

      if (clubErr) throw clubErr;

      // 5. Create Chapters
      const chapterInserts = chapters.map((ch, index) => ({
        club_id: club.id,
        title: ch.title,
        chapter_number: index + 1,
        start_page: ch.start_page,
        end_page: ch.end_page,
      }));
      await supabase.from("chapters").insert(chapterInserts);

      // 6. Create Initial Member (The Owner)
      await supabase.from("club_members").insert({
        club_id: club.id,
        user_id: user.id,
        role: "OWNER",
      });

      // 7. Optional Post
      if (clubData.makePost && clubData.visibility === "PUBLIC") {
        await supabase.from("posts").insert({
          user_id: user.id,
          club_id: club.id,
          content: `Just founded a new reading circle: ${clubData.name}! We're reading ${bookData.title}. Join us!`,
          post_type: "CLUB_ANNOUNCEMENT",
        });
      }

      // 8. Generate Invite Link
      const token = Math.random().toString(36).substring(2, 15);
      await supabase.from("club_invites").insert({
        club_id: club.id,
        token: token,
        created_by: user.id,
      });

      setInviteLink(`${window.location.origin}/join/${token}`);
      nextStep(); // Move to Success Step
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-soft-white dark:bg-[#121212] transition-colors duration-500">
      <nav className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-dark-secondary/60 dark:text-gray-400 hover:text-primary"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Discard & Exit</span>
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        {/* Step Progress Bar */}
        <div className="flex justify-between mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full mx-1 ${step >= i ? "bg-primary" : "bg-gray-200 dark:bg-white/10"}`}
            />
          ))}
        </div>

        {/* STEP 1: BOOK DETAILS */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-4xl font-serif font-bold mb-8 dark:text-white">
              Choose the Book
            </h1>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  className="bg-white dark:bg-white/5 border border-primary/10 p-4 rounded-xl dark:text-white"
                  placeholder="Book Title"
                  value={bookData.title}
                  onChange={(e) =>
                    setBookData({ ...bookData, title: e.target.value })
                  }
                />
                <input
                  className="bg-white dark:bg-white/5 border border-primary/10 p-4 rounded-xl dark:text-white"
                  placeholder="Author"
                  value={bookData.author}
                  onChange={(e) =>
                    setBookData({ ...bookData, author: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400">
                    Cover Image (Required)
                  </label>
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/5 transition-colors">
                    {bookData.coverFile ? (
                      <div className="flex items-center space-x-2 text-primary font-bold">
                        <CheckCircle2 size={20} />{" "}
                        <span>{bookData.coverFile.name}</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Upload Cover Image
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) =>
                        setBookData({
                          ...bookData,
                          coverFile: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </label>
                </div>

                {/* PDF Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-400">
                    Book PDF (Optional)
                  </label>
                  <label className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer hover:bg-primary/5 transition-colors">
                    {bookData.pdfFile ? (
                      <div className="flex items-center space-x-2 text-primary font-bold">
                        <FileText size={20} /> <span>PDF Ready</span>
                      </div>
                    ) : (
                      <>
                        <Upload className="text-gray-400 mb-2" />
                        <span className="text-sm text-gray-500">
                          Upload PDF File
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) =>
                        setBookData({
                          ...bookData,
                          pdfFile: e.target.files?.[0] || null,
                        })
                      }
                    />
                  </label>
                </div>
              </div>

              <button
                disabled={!bookData.title || !bookData.coverFile}
                onClick={nextStep}
                className="w-full bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Set Reading Goals <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CHAPTERS */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-serif font-bold mb-4 dark:text-white">
              Chapter Breakdown
            </h1>
            <p className="text-gray-500 mb-8">
              Divide the book into manageable reading chunks.
            </p>

            <div className="space-y-4 mb-8">
              {chapters.map((ch, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center bg-white dark:bg-white/5 p-4 rounded-xl border border-primary/5"
                >
                  <span className="font-bold text-primary w-8">{i + 1}</span>
                  <input
                    className="flex-1 bg-transparent border-b border-gray-200 dark:border-white/10 p-1 dark:text-white"
                    placeholder="Chapter Title"
                    value={ch.title}
                    onChange={(e) => {
                      const newCh = [...chapters];
                      newCh[i].title = e.target.value;
                      setChapters(newCh);
                    }}
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      className="w-16 bg-transparent border-b border-gray-200 p-1 text-center dark:text-white"
                      value={ch.start_page || ""}
                      onChange={(e) => {
                        const newCh = [...chapters];
                        newCh[i].start_page = parseInt(e.target.value);
                        setChapters(newCh);
                      }}
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="number"
                      className="w-16 bg-transparent border-b border-gray-200 p-1 text-center dark:text-white"
                      value={ch.end_page}
                      onChange={(e) => {
                        const newCh = [...chapters];
                        newCh[i].end_page = parseInt(e.target.value);
                        setChapters(newCh);
                      }}
                    />
                  </div>
                  <button
                    onClick={() => removeChapter(i)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}

              <button
                onClick={addChapter}
                className="flex items-center gap-2 text-primary font-bold py-2 px-4 rounded-lg bg-primary/5 hover:bg-primary/10"
              >
                <Plus size={18} /> Add Chapter
              </button>
            </div>

            <div className="flex gap-4">
              <button
                onClick={prevStep}
                className="flex-1 py-4 rounded-xl border border-primary/20 font-bold dark:text-white"
              >
                <ChevronLeft className="inline mr-2" /> Back
              </button>
              <button
                onClick={nextStep}
                className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold"
              >
                Club Identity <ChevronRight className="inline ml-2" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CLUB SETTINGS */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h1 className="text-4xl font-serif font-bold mb-8 dark:text-white">
              Circle Identity
            </h1>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">
                  Club Name
                </label>
                <input
                  className="w-full bg-white dark:bg-white/5 border border-primary/10 p-4 rounded-xl dark:text-white"
                  placeholder="e.g. The Gatsby Enthusiasts"
                  value={clubData.name}
                  onChange={(e) =>
                    setClubData({ ...clubData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    Start Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white dark:bg-white/5 border border-primary/10 p-4 rounded-xl dark:text-white"
                    onChange={(e) =>
                      setClubData({ ...clubData, startDate: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">
                    End Date
                  </label>
                  <input
                    type="date"
                    className="w-full bg-white dark:bg-white/5 border border-primary/10 p-4 rounded-xl dark:text-white"
                    onChange={(e) =>
                      setClubData({ ...clubData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
                <button
                  onClick={() =>
                    setClubData({ ...clubData, visibility: "PUBLIC" })
                  }
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${clubData.visibility === "PUBLIC" ? "bg-white shadow-sm text-primary" : "text-gray-500"}`}
                >
                  <Globe size={18} /> Public
                </button>
                <button
                  onClick={() =>
                    setClubData({ ...clubData, visibility: "PRIVATE" })
                  }
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${clubData.visibility === "PRIVATE" ? "bg-white shadow-sm text-primary" : "text-gray-500"}`}
                >
                  <Lock size={18} /> Private
                </button>
              </div>

              {clubData.visibility === "PUBLIC" && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <input
                    type="checkbox"
                    checked={clubData.makePost}
                    onChange={(e) =>
                      setClubData({ ...clubData, makePost: e.target.checked })
                    }
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-sm dark:text-gray-300 font-medium">
                    Create a public announcement post once founded.
                  </span>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={prevStep}
                  className="flex-1 py-4 rounded-xl border border-primary/20 font-bold dark:text-white"
                >
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={loading || !clubData.name || !clubData.startDate}
                  className="flex-[2] bg-primary text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Found Circle"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 4 && (
          <div className="text-center animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} />
            </div>
            <h1 className="text-4xl font-serif font-bold mb-4 dark:text-white">
              Circle Founded!
            </h1>
            <p className="text-gray-500 mb-8">
              Your journey with {clubData.name} begins now.
            </p>

            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-primary/10 mb-8">
              <label className="text-xs font-bold text-gray-400 uppercase block mb-2 text-left">
                Share with Readers
              </label>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 dark:bg-white/5 p-3 rounded-lg text-left text-sm font-mono truncate dark:text-gray-300">
                  {inviteLink}
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    alert("Link copied!");
                  }}
                  className="bg-primary text-white p-3 rounded-lg"
                >
                  <Link size={18} />
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold"
            >
              Go to My Circle
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateClubPage;
