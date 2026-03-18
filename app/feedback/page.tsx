"use client";

import React, { useState } from "react";
import {
  Send,
  MessageSquare,
  ShieldAlert,
  Loader2,
  Feather,
} from "lucide-react";
import { submitFeedbackAction } from "@/services/feedback.service";
import { toast } from "sonner";

const FeedbackPage = () => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      await submitFeedbackAction(content, category);
      toast.success("Message dropped into the suggestion box!");
      setContent("");
    } catch (err) {
      toast.error("The postman failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-16 pb-20 px-6 flex flex-col items-center bg-[#fdfbf7] dark:bg-[#0f0e0d] animate-in fade-in duration-1000">
      <div className="max-w-2xl w-full">
        <header className="text-center mb-16 space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-[1px] w-12 bg-[#d4a373]/40" />
            <Feather size={18} className="text-[#d4a373]" />
            <div className="h-[1px] w-12 bg-[#d4a373]/40" />
          </div>
          <span className="text-[11px] font-mono font-bold text-[#8b5a2b] dark:text-[#a68a64] uppercase tracking-[0.5em]">
            The Suggestion Box
          </span>
          <h1 className="text-6xl font-serif font-black text-[#1a3f22] dark:text-[#e9dcc9] italic tracking-tight">
            Anonymous Dispatch
          </h1>
          <p className="text-[#5c4033] dark:text-gray-500 font-serif italic mt-6 text-xl max-w-lg mx-auto leading-relaxed">
            "Your identity remains a secret. Your thoughts help us curate a
            better archive."
          </p>
        </header>

        {/* THE FEEDBACK CARD */}
        <div className="group relative">
          {/* Subtle background glow/shadow for depth */}
          <div className="absolute -inset-1 bg-gradient-to-r from-[#d4a373]/20 to-[#1a3f22]/10 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>

          <div className="relative bg-[#faf7f2] dark:bg-[#1a1816] border-[3px] border-[#1a3f22] dark:border-[#2d241e]  p-8 md:p-14 overflow-hidden ring-1 ring-black/5">
            {/* Faux Stamp - Refined */}
            <div className="absolute top-8 right-8 w-20 h-24 border-2 border-dashed border-[#1a3f22]/30 flex flex-col items-center justify-center grayscale opacity-40 rotate-3 group-hover:rotate-0 transition-transform duration-500">
              <MessageSquare
                size={28}
                className="text-[#1a3f22] dark:text-[#d4a373] mb-1"
              />
              <span className="text-[8px] font-mono font-black uppercase">
                Air Mail
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
              {/* Category Selector */}
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <label className="text-[10px] font-mono font-black text-[#8b5a2b] dark:text-[#d4a373] uppercase tracking-[0.2em]">
                    Classification
                  </label>
                  <div className="h-[1px] flex-grow bg-[#d4a373]/20" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {["General", "Bug Report", "Feature Idea", "Love Letter"].map(
                    (cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`px-5 py-2 text-[10px] font-mono font-bold uppercase transition-all duration-300 transform ${
                          category === cat
                            ? "bg-[#1a3f22] text-[#f4ebd0] -translate-y-1 shadow-md scale-105"
                            : "bg-transparent border border-[#d6c7a1]/50 dark:border-[#3e2b22] text-[#8b5a2b] dark:text-gray-500 hover:border-[#1a3f22]"
                        }`}
                      >
                        {cat}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Message Area */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-[10px] font-mono font-black text-[#8b5a2b] dark:text-[#d4a373] uppercase tracking-[0.2em]">
                    The Message
                  </label>
                  <div className="h-[1px] flex-grow bg-[#d4a373]/20" />
                </div>
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Inscribe your thoughts here..."
                    className="w-full h-56 bg-transparent border-none focus:ring-0 outline-none font-serif italic text-xl resize-none p-0 transition-all dark:text-gray-200 placeholder:text-[#d4a373]/40 leading-[2rem] selection:bg-[#d4a373]/30"
                    style={{
                      backgroundImage:
                        "linear-gradient(transparent, transparent 31px, #d4a373 31px)",
                      backgroundSize: "100% 32px",
                      lineHeight: "32px",
                    }}
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative group/btn overflow-hidden bg-[#1a3f22] dark:bg-[#d4a373] text-[#f4ebd0] dark:text-[#1a1614] py-6 font-serif font-black italic text-2xl transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <div className="absolute inset-0 w-full h-full bg-black/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                <span className="relative flex items-center justify-center gap-4">
                  {loading ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <>
                      Send Dispatch{" "}
                      <Send
                        size={22}
                        className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                      />
                    </>
                  )}
                </span>
              </button>
            </form>
          </div>
        </div>

        <footer className="mt-16 text-center opacity-60">
          <div className="flex items-center justify-center gap-3 py-2 px-4 border border-[#d4a373]/20 rounded-full inline-flex mx-auto">
            <ShieldAlert
              size={14}
              className="text-[#1a3f22] dark:text-[#d4a373]"
            />
            <p className="text-[10px] font-mono uppercase font-black tracking-widest dark:text-gray-400">
              Encrypted & Anonymous Protocol v1.0
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default FeedbackPage;
