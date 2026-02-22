"use client";

import React from "react";
import {
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
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useCreateClub } from "@/hooks/useCreateClub";
import { toast } from "sonner";

const CreateClubPage = () => {
  const router = useRouter();
  const { user } = useAuthStore();
  const h = useCreateClub(user?.id);

  // Constants for re-usable Tailwind styles
  const inputClass =
    "w-full bg-white dark:bg-white/5 border border-primary/10 p-4 rounded-xl dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all";
  const btnPrimary =
    "w-full bg-primary text-white py-4 rounded-xl font-bold disabled:opacity-50 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10";
  const btnOutline = `
  flex-1 px-6 py-4 rounded-2xl border-2 border-primary/30 
  text-primary font-bold bg-transparent
  hover:bg-primary hover:text-white hover:border-primary
  transition-all duration-300 ease-out
  active:scale-[0.97] flex items-center justify-center gap-2
`;

  const prevStep = () => {
    if (h.step === 1) router.back();
    else h.setStep(h.step - 1);
  };

  return (
    <div className="min-h-screen bg-soft-white dark:bg-[#121212] transition-colors duration-500">
      <nav className="max-w-5xl mx-auto px-6 py-8">
        <button
          onClick={prevStep}
          className="flex items-center space-x-2 text-dark-secondary/60 dark:text-gray-400 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">
            {h.step === 1 ? "Discard & Exit" : "Back"}
          </span>
        </button>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pb-20">
        <div className="flex justify-between mb-12">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full mx-1 ${h.step >= i ? "bg-primary" : "bg-gray-200 dark:bg-white/10"}`}
            />
          ))}
        </div>

        {/* STEP 1: BOOK DETAILS */}
        {h.step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <header className="mb-8">
              <h1 className="text-4xl font-serif font-bold dark:text-white">
                The Book
              </h1>
            </header>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`${inputClass} appearance-none cursor-pointer`}
                  value={h.bookData.category}
                  onChange={(e) =>
                    h.setBookData({ ...h.bookData, category: e.target.value })
                  }
                >
                  {h.categories.map((cat) => (
                    <option key={cat} value={cat} className="dark:bg-[#1a1a1a]">
                      {cat}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
              <textarea
                className={`${inputClass} h-24 resize-none`}
                placeholder="Book Description (Optional)"
                value={h.bookData.description}
                onChange={(e) =>
                  h.setBookData({ ...h.bookData, description: e.target.value })
                }
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <label className="relative flex flex-col items-center justify-center h-56 border-2 border-dashed border-primary/20 rounded-2xl cursor-pointer overflow-hidden group hover:bg-primary/5 transition-all">
                  {h.imagePreview ? (
                    <img
                      src={h.imagePreview}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <ImageIcon size={28} />
                      <span className="text-sm mt-2">Cover (Required)</span>
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
                  className={`flex flex-col items-center justify-center h-56 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${h.bookData.pdfFile ? "border-green-500/50 bg-green-500/5" : "border-primary/20 hover:bg-primary/5 text-gray-400"}`}
                >
                  {h.bookData.pdfFile ? (
                    <CheckCircle2 size={28} className="text-green-500" />
                  ) : (
                    <FileText size={28} />
                  )}
                  <span className="text-sm mt-2 px-4 truncate w-full text-center">
                    {h.bookData.pdfFile
                      ? h.bookData.pdfFile.name
                      : "Upload PDF (Optional)"}
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
              <button
                disabled={!h.bookData.title || !h.bookData.coverFile}
                onClick={() => h.setStep(2)}
                className={btnPrimary}
              >
                Set Reading Goals <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: BREAKDOWN */}
        {h.step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-8">
              <h1 className="text-4xl font-serif font-bold dark:text-white">
                Breakdown
              </h1>
            </header>
            <div className="space-y-4 mb-8">
              {h.chapters.map((ch, i) => {
                // LOGIC: Is this the last chapter in the list?
                const isLast = i === h.chapters.length - 1;
                // LOGIC: Is there more than one chapter total?
                const hasMoreThanOne = h.chapters.length > 1;

                return (
                  <div
                    key={i}
                    className="flex gap-4 items-center bg-white dark:bg-white/5 p-4 rounded-xl border border-primary/5"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shrink-0">
                      {i + 1}
                    </div>

                    <input
                      className="flex-1 bg-transparent border-b border-gray-200 dark:border-white/10 p-1 dark:text-white outline-none"
                      placeholder="Title"
                      value={ch.title}
                      onChange={(e) => {
                        const n = [...h.chapters];
                        n[i].title = e.target.value;
                        h.setChapters(n);
                      }}
                    />

                    <div className="flex items-center gap-2 bg-soft-white dark:bg-[#1a1a1a] px-3 py-2 rounded-lg border border-primary/5">
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase font-bold text-gray-400">
                          Start
                        </span>
                        <input
                          type="number"
                          className="w-12 bg-transparent text-center dark:text-white outline-none font-bold"
                          value={ch.start_page}
                          readOnly
                        />
                      </div>
                      <span className="text-gray-300">—</span>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase font-bold text-gray-400">
                          End
                        </span>
                        <input
                          type="number"
                          className="w-12 bg-transparent text-center dark:text-white outline-none font-bold text-primary"
                          value={ch.end_page}
                          onChange={(e) =>
                            h.handleChapterEndChange(i, e.target.value)
                          }
                        />
                      </div>
                    </div>

                    {/* ACTION: Show delete ONLY if it's the last one and not the ONLY one */}
                    <div className="w-9 flex justify-center">
                      {isLast && hasMoreThanOne ? (
                        <button
                          onClick={() =>
                            h.setChapters(
                              h.chapters.filter((_, idx) => idx !== i),
                            )
                          }
                          className="text-gray-300 hover:text-red-400 transition-colors p-2"
                          title="Remove last chapter"
                        >
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        // Helpful tooltip for users to know why they can't delete
                        <div
                          className="w-5 h-5 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center"
                          title="Only the last chapter can be removed"
                        >
                          <span className="text-[10px] text-gray-300">?</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              <button
                onClick={h.addChapter}
                className="w-full py-4 border-2 border-dashed border-primary/10 rounded-xl text-primary font-bold flex items-center justify-center gap-2 hover:bg-primary/5 transition-all"
              >
                <Plus size={18} /> Add Next Chapter
              </button>
            </div>

            <div className="flex gap-4">
              <button onClick={() => h.setStep(1)} className={btnOutline}>
                Back
              </button>
              <button onClick={() => h.setStep(3)} className={btnPrimary}>
                Club Identity <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CLUB */}
        {h.step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <header className="mb-8">
              <h1 className="text-4xl font-serif font-bold dark:text-white">
                Club Identity
              </h1>
            </header>
            <div className="space-y-6">
              <input
                className={inputClass}
                placeholder="Club Name"
                value={h.clubData.name}
                onChange={(e) =>
                  h.setClubData({ ...h.clubData, name: e.target.value })
                }
              />
              <textarea
                className={`${inputClass} h-24 resize-none`}
                placeholder="Club Description (Optional)"
                value={h.clubData.description}
                onChange={(e) =>
                  h.setClubData({ ...h.clubData, description: e.target.value })
                }
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className={inputClass}
                  value={h.clubData.startDate}
                  onChange={(e) =>
                    h.setClubData({ ...h.clubData, startDate: e.target.value })
                  }
                />
                <input
                  type="date"
                  className={inputClass}
                  value={h.clubData.endDate}
                  onChange={(e) =>
                    h.setClubData({ ...h.clubData, endDate: e.target.value })
                  }
                />
              </div>
              <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
                <button
                  type="button"
                  onClick={() =>
                    h.setClubData({ ...h.clubData, visibility: "PUBLIC" })
                  }
                  className={`px-6 py-3 rounded-xl transition-all ${h.clubData.visibility === "PUBLIC" ? "bg-white shadow text-primary" : "text-gray-500"}`}
                >
                  Public
                </button>
                <button
                  type="button"
                  onClick={() =>
                    h.setClubData({ ...h.clubData, visibility: "PRIVATE" })
                  }
                  className={`px-6 py-3 rounded-xl transition-all ${h.clubData.visibility === "PRIVATE" ? "bg-white shadow text-primary" : "text-gray-500"}`}
                >
                  Private
                </button>
              </div>
              {h.clubData.visibility === "PUBLIC" && (
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                  <input
                    type="checkbox"
                    id="post"
                    checked={h.clubData.makePost}
                    onChange={(e) =>
                      h.setClubData({
                        ...h.clubData,
                        makePost: e.target.checked,
                      })
                    }
                    className="w-5 h-5 accent-primary"
                  />
                  <label
                    htmlFor="post"
                    className="text-sm font-medium dark:text-gray-300 cursor-pointer"
                  >
                    Announce this club to the public feed
                  </label>
                </div>
              )}
              <div className="flex gap-4">
                <button onClick={() => h.setStep(2)} className={btnOutline}>
                  Back
                </button>
                <button
                  onClick={h.submit}
                  disabled={h.loading || !h.clubData.name}
                  className={btnPrimary}
                >
                  {h.loading ? (
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
        {h.step === 4 && (
          <div className="text-center animate-in zoom-in duration-500">
            <CheckCircle2 size={60} className="mx-auto text-green-500 mb-6" />
            <h1 className="text-4xl font-serif font-bold mb-4 dark:text-white">
              Founded!
            </h1>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Invite friends! Share this link to bring them into your circle.
            </p>
            <div className="bg-white dark:bg-white/5 p-6 rounded-2xl border border-primary/10 mb-8 flex items-center gap-2">
              <span className="flex-1 text-sm font-mono truncate dark:text-gray-300">
                {h.inviteLink}
              </span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(h.inviteLink);
                  toast.success("Link copied!");
                }}
                className="bg-primary text-white p-2 rounded-lg"
              >
                <Link size={20} />
              </button>
            </div>
            <button
              onClick={() => router.push("/clubs/myclubs")}
              className={btnPrimary}
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateClubPage;
