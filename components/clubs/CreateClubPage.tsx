"use client";

import React from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  Loader2,
  ChevronDown,
  Paperclip,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateClub } from "@/hooks/useCreateClub";
import { toast } from "sonner";

const CreateClubPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const h = useCreateClub(user?.id);

  const inputClass =
    "w-full bg-white dark:bg-[#252525] border-2 border-primary-dark/10 p-4 font-serif outline-none focus:border-primary-dark transition-colors dark:text-white shadow-inner";

  const btnPrimary =
    "w-full bg-primary-dark text-[#f4ebd0] py-4 font-serif italic text-lg shadow-[4px_4px_0px_#3e2b22] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const btnOutline =
    "flex-1 px-6 py-4 border-2 border-primary-dark text-primary-dark dark:text-[#d4a373] dark:border-[#d4a373] font-serif italic font-bold hover:bg-primary-dark hover:text-[#f4ebd0] transition-all shadow-[4px_4px_0px_rgba(92,64,51,0.1)]";

  // --- VALIDATION LOGIC ---
  const validateStep1 = () => {
    if (!h.bookData.title.trim())
      return toast.error("Manuscript title is required.");
    if (!h.bookData.author.trim())
      return toast.error("Author name is required.");
    if (!h.bookData.categoryId) return toast.error("Please select a Category.");
    if (!h.bookData.coverFile)
      return toast.error("Please upload a Cover Art image.");
    h.setStep(2);
  };

  const validateStep2 = () => {
    const invalidChapter = h.chapters.find(
      (ch) => !ch.title.trim() || ch.end_page <= ch.start_page,
    );
    if (invalidChapter) {
      return toast.error(
        "Ensure all chapters have titles and valid page ranges.",
      );
    }
    h.setStep(3);
  };

  const handleFinalSubmit = () => {
    if (!h.clubData.name.trim()) return toast.error("The Squad needs a name.");
    if (!h.clubData.startDate || !h.clubData.endDate)
      return toast.error("Please set dates.");
    h.submit();
  };

  const prevStep = () => {
    if (h.step === 1) router.back();
    else h.setStep(h.step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2">
      {/* Navigation Header */}
      <nav className="mb-8 flex items-center justify-between border-b-2 border-primary-dark/10 pb-4">
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 text-primary-half hover:text-primary-dark transition-colors font-mono text-xs uppercase font-bold tracking-widest"
        >
          <ArrowLeft size={16} />
          <span>{h.step === 1 ? "Discard Ledger" : "Back Step"}</span>
        </button>
        <div className="font-mono text-[10px] font-bold text-primary-half uppercase tracking-[0.3em]">
          Registry Entry / Part {h.step}
        </div>
      </nav>

      <main className="pb-20">
        <div className="flex justify-between mb-12 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 transition-all duration-700 ${
                h.step >= i ? "bg-primary-dark shadow-sm" : "bg-primary-dark/10"
              }`}
            />
          ))}
        </div>

        {/* STEP 1: BOOK DETAILS */}
        {h.step === 1 && (
          <div className="relative bg-white dark:bg-[#252525] p-8 shadow-md border-t-[12px] border-primary-half/20 animate-in fade-in slide-in-from-bottom-4">
            <Paperclip
              className="absolute -top-4 right-10 text-gray-400 rotate-12"
              size={32}
            />
            <header className="mb-8">
              <h1 className="text-4xl font-serif font-black text-primary-dark dark:text-[#d4a373]">
                The Manuscript
              </h1>
              <p className="font-serif italic text-primary-half">
                Identify the book for this circle
              </p>
            </header>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input
                  className={inputClass}
                  placeholder="Book Title"
                  value={h.bookData.title}
                  onChange={(e) =>
                    h.setBookData({ ...h.bookData, title: e.target.value })
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Author"
                  value={h.bookData.author}
                  onChange={(e) =>
                    h.setBookData({ ...h.bookData, author: e.target.value })
                  }
                />
              </div>

              <div className="relative">
                <select
                  className={`${inputClass} appearance-none cursor-pointer bg-transparent`}
                  value={h.bookData.categoryId}
                  onChange={(e) =>
                    h.setBookData({ ...h.bookData, categoryId: e.target.value })
                  }
                >
                  <option value="">Select a Category</option>
                  {h.categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-primary-half pointer-events-none"
                  size={18}
                />
              </div>

              <textarea
                className={`${inputClass} h-24 resize-none italic`}
                placeholder="Briefly describe the story... (Optional)"
                value={h.bookData.description}
                onChange={(e) =>
                  h.setBookData({ ...h.bookData, description: e.target.value })
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                <label className="relative flex flex-col items-center justify-center h-56 border-2 border-dashed border-primary-dark/20 bg-[#fdfdfd] dark:bg-black/10 cursor-pointer overflow-hidden group hover:border-primary-dark transition-all">
                  {h.imagePreview ? (
                    <img
                      src={h.imagePreview}
                      className="w-full h-full object-cover"
                      alt="Cover"
                    />
                  ) : (
                    <div className="text-primary-half flex flex-col items-center font-serif">
                      <ImageIcon size={32} strokeWidth={1.5} />
                      <span className="text-sm mt-2">Upload Cover Art</span>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        h.setBookData({ ...h.bookData, coverFile: file });
                        h.setImagePreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </label>

                <label
                  className={`flex flex-col items-center justify-center h-56 border-2 border-dashed transition-all cursor-pointer ${h.bookData.pdfFile ? "border-green-600 bg-green-50/10" : "border-primary-dark/20 text-primary-half bg-[#fdfdfd] dark:bg-black/10"}`}
                >
                  {h.bookData.pdfFile ? (
                    <CheckCircle2 size={32} className="text-green-600" />
                  ) : (
                    <FileText size={32} strokeWidth={1.5} />
                  )}
                  <span className="text-sm mt-2 px-4 truncate w-full text-center italic">
                    {h.bookData.pdfFile
                      ? h.bookData.pdfFile.name
                      : "Attach PDF (Optional)"}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf"
                    onChange={(e) =>
                      h.setBookData({
                        ...h.bookData,
                        pdfFile: e.target.files?.[0] || null,
                      })
                    }
                  />
                </label>
              </div>

              <button onClick={validateStep1} className={btnPrimary}>
                Draft Breakdown <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BREAKDOWN */}
        {h.step === 2 && (
          <div className="bg-[#f4ebd0] dark:bg-[#2c2420] p-8 border-2 border-[#d6c7a1] shadow-inner animate-in fade-in slide-in-from-right-4">
            <header className="mb-8 border-b-2 border-primary-dark/10 pb-4">
              <h1 className="text-4xl font-serif font-black text-primary-dark dark:text-[#d4a373]">
                The Breakdown
              </h1>
              <p className="font-mono text-[10px] uppercase font-bold text-primary-half">
                Reading Milestones
              </p>
            </header>

            <div className="space-y-4 mb-8">
              {h.chapters.map((ch, i) => (
                <div
                  key={i}
                  className="flex gap-4 items-center bg-white/50 dark:bg-black/20 p-4 border-b border-primary-dark/10"
                >
                  <div className="w-8 h-8 bg-primary-dark text-[#f4ebd0] flex items-center justify-center font-serif italic shrink-0 shadow-sm">
                    {i + 1}
                  </div>
                  <input
                    className="flex-1 bg-transparent border-b border-dotted border-primary-dark/30 p-1 font-serif text-primary-dark dark:text-gray-100 outline-none"
                    placeholder="Chapter Title"
                    value={ch.title}
                    onChange={(e) => {
                      const n = [...h.chapters];
                      n[i].title = e.target.value;
                      h.setChapters(n);
                    }}
                  />
                  <div className="flex items-center gap-3 bg-white dark:bg-[#1a1614] px-4 py-2 border border-primary-dark/10">
                    <div className="flex flex-col items-center">
                      <span className="text-[7px] font-mono font-bold">
                        START
                      </span>
                      <input
                        type="number"
                        className="w-10 bg-transparent text-center font-bold text-xs"
                        value={ch.start_page}
                        readOnly
                      />
                    </div>
                    <div className="h-4 w-[1px] bg-primary-dark/20" />
                    <div className="flex flex-col items-center">
                      <span className="text-[7px] font-mono font-bold">
                        END
                      </span>
                      <input
                        type="number"
                        className="w-10 bg-transparent text-center font-bold text-xs text-primary-dark dark:text-[#d4a373]"
                        value={ch.end_page}
                        onChange={(e) =>
                          h.handleChapterEndChange(i, e.target.value)
                        }
                      />
                    </div>
                  </div>
                  {h.chapters.length > 1 && i === h.chapters.length - 1 && (
                    <button
                      onClick={() =>
                        h.setChapters(h.chapters.filter((_, idx) => idx !== i))
                      }
                      className="text-red-700 p-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={h.addChapter}
                className="w-full py-4 border-2 border-dashed border-primary-dark/20 text-primary-dark dark:text-[#d4a373] font-serif italic font-bold flex items-center justify-center gap-2 hover:bg-primary-dark/5"
              >
                <Plus size={18} /> Append Next Milestone
              </button>
            </div>

            <div className="flex gap-6">
              <button onClick={() => h.setStep(1)} className={btnOutline}>
                Return
              </button>
              <button onClick={validateStep2} className={btnPrimary}>
                The Club <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CLUB DETAILS */}
        {h.step === 3 && (
          <div className="bg-white dark:bg-[#252525] p-8 shadow-md border-l-[12px] border-primary-dark/10 animate-in fade-in slide-in-from-right-4">
            <header className="mb-10">
              <h1 className="text-4xl font-serif font-black text-primary-dark dark:text-[#d4a373]">
                The Club
              </h1>
              <p className="font-serif italic text-primary-half">
                Set the rules for your inner circle
              </p>
            </header>

            <div className="space-y-8">
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-primary-half uppercase tracking-widest">
                  Squad Name
                </label>
                <input
                  className={inputClass}
                  placeholder="e.g. Midnight Readers"
                  value={h.clubData.name}
                  onChange={(e) =>
                    h.setClubData({ ...h.clubData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-primary-half uppercase tracking-widest">
                  Manifesto
                </label>
                <textarea
                  className={`${inputClass} h-24 resize-none`}
                  placeholder="What's the vibe?"
                  value={h.clubData.description}
                  onChange={(e) =>
                    h.setClubData({
                      ...h.clubData,
                      description: e.target.value,
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-primary-half uppercase">
                    Opening Date
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={h.clubData.startDate}
                    onChange={(e) =>
                      h.setClubData({
                        ...h.clubData,
                        startDate: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-primary-half uppercase">
                    Final Page Date
                  </label>
                  <input
                    type="date"
                    className={inputClass}
                    value={h.clubData.endDate}
                    onChange={(e) =>
                      h.setClubData({ ...h.clubData, endDate: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex p-1 bg-primary-dark/5 border border-primary-dark/10 w-fit">
                <button
                  type="button"
                  onClick={() =>
                    h.setClubData({ ...h.clubData, visibility: "PUBLIC" })
                  }
                  className={`px-8 py-2 font-serif italic transition-all ${h.clubData.visibility === "PUBLIC" ? "bg-primary-dark text-[#f4ebd0] shadow-md" : "text-primary-dark/60"}`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() =>
                    h.setClubData({ ...h.clubData, visibility: "PRIVATE" })
                  }
                  className={`px-8 py-2 font-serif italic transition-all ${h.clubData.visibility === "PRIVATE" ? "bg-primary-dark text-[#f4ebd0] shadow-md" : "text-primary-dark/60"}`}
                >
                  Invitation Only
                </button>
              </div>

              <div className="flex gap-6 pt-4">
                <button onClick={() => h.setStep(2)} className={btnOutline}>
                  Back
                </button>
                <button
                  onClick={handleFinalSubmit}
                  disabled={h.loading}
                  className={btnPrimary}
                >
                  {h.loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    "Found Squad"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS */}
        {h.step === 4 && (
          <div className="max-w-md mx-auto relative transform rotate-[-1deg] bg-[#feff9c] dark:bg-[#c4c562] p-10 shadow-[8px_8px_0px_rgba(0,0,0,0.2)] animate-in zoom-in duration-500 text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow-md" />
            <CheckCircle2
              size={50}
              className="mx-auto text-primary-dark mb-4"
            />
            <h1 className="text-4xl font-serif font-black text-[#2c2c2c] mb-2">
              Circle Founded!
            </h1>
            <p className="text-primary-half mb-8 font-serif italic">
              The record is inscribed. Gather the readers.
            </p>

            <div className="bg-black/5 p-4 border border-black/10 mb-8 flex items-center gap-2">
              <span className="flex-1 text-xs font-mono truncate text-black/70">
                {h.inviteLink}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(h.inviteLink);
                  toast.success("Link copied!");
                }}
                className="bg-primary-dark text-[#f4ebd0] p-2"
              >
                <LinkIcon size={18} />
              </button>
            </div>

            <button
              onClick={() => router.push("/clubs/myclubs")}
              className={btnPrimary}
            >
              Enter the Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateClubPage;
