"use client";

import React, { useState } from "react";
import {
  PenTool,
  Trash2,
  Pin,
  Tag,
  Search,
  Plus,
  Book,
  StickyNote,
  Clock,
  Check,
  Paperclip,
  Quote,
} from "lucide-react";

// Mock data for personal notes
const MOCK_NOTES = [
  {
    id: "1",
    title: "Reflections on Gatsby",
    content:
      "The green light isn't just a symbol of hope; it's the tragedy of the unattainable past. Need to compare this with the ending of 'The Sun Also Rises'.",
    tags: ["Analysis", "Classics"],
    isPinned: true,
    createdAt: "Oct 24, 2024",
    color: "bg-[#f4ebd0]", // Manila Folder
  },
  {
    id: "2",
    title: "Draft for Chapter 4 Discussion",
    content:
      "Make sure to bring up the unreliable narrator aspect. The way the timeline jumps suggests he's hiding his true involvement.",
    tags: ["Drafts", "Club Talk"],
    isPinned: false,
    createdAt: "Oct 22, 2024",
    color: "bg-white",
  },
  {
    id: "3",
    title: "Books to Buy",
    content:
      "1. The Secret History (Hardcover)\n2. Dubliners - James Joyce\n3. Anything by Donna Tartt.",
    tags: ["To-Buy"],
    isPinned: false,
    createdAt: "Oct 15, 2024",
    color: "bg-[#1a3f22]/5", // Subtle Green Tint
  },
];

const MyNotesPage = () => {
  const [notes, setNotifications] = useState(MOCK_NOTES);
  const [isCreating, setIsCreating] = useState(false);

  return (
    <div className="pb-20 transition-colors duration-500 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* HEADER: Archive Header */}
        <header className="mb-12 border-b-2 border-[#1a3f22]/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-block bg-[#1a3f22] text-[#f4ebd0] px-3 py-0.5 text-[10px] font-mono font-black uppercase tracking-[0.3em] mb-4">
              Private Ledger
            </div>
            <h1 className="text-5xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373] tracking-tighter leading-none">
              Brain <span className="italic">Dumps</span>
            </h1>
            <p className="text-[#8b5a2b] dark:text-gray-400 mt-2 font-serif italic text-lg">
              Your personal sanctuary for unpolished thoughts and literary
              findings.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search notes..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-[#252525] border border-[#d6c7a1] font-serif italic text-sm outline-none focus:border-[#1a3f22]"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b5a2b]"
                size={16}
              />
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="bg-[#1a3f22] text-[#f4ebd0] p-3 shadow-[4px_4px_0px_#d4a373] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <Plus size={24} />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Scratchpad Area */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="relative bg-white dark:bg-[#252525] p-8 border-t-[10px] border-[#1a3f22] shadow-[8px_8px_0px_rgba(26,63,34,0.05)]">
              <Paperclip
                className="absolute -top-4 right-6 text-gray-300 -rotate-12"
                size={32}
              />
              <h3 className="font-serif font-black text-[#1a3f22] mb-4 flex items-center gap-2">
                <PenTool size={18} /> Quick Scribble
              </h3>
              <textarea
                placeholder="What's on your mind?"
                className="w-full h-40 bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-dashed border-[#d6c7a1] p-4 font-serif italic text-sm outline-none resize-none mb-4"
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
                  <button className="p-2 text-[#8b5a2b] hover:bg-[#f4ebd0]">
                    <Quote size={16} />
                  </button>
                  <button className="p-2 text-[#8b5a2b] hover:bg-[#f4ebd0]">
                    <Tag size={16} />
                  </button>
                </div>
                <button className="bg-[#1a3f22] text-[#f4ebd0] px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_#d4a373] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                  File Away
                </button>
              </div>
            </div>

            {/* Tags / Categories Index */}
            <div className="bg-[#f4ebd0] dark:bg-[#2c2420] p-6 border-2 border-[#d6c7a1]">
              <h4 className="font-mono text-[10px] font-black uppercase tracking-widest text-[#8b5a2b] mb-4 border-b border-[#d6c7a1] pb-2">
                Subject Index
              </h4>
              <div className="flex flex-wrap gap-2">
                {["Analysis", "Drafts", "Quotes", "To-Buy", "Club Talk"].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-white/50 border border-[#d6c7a1] text-[10px] font-mono text-[#5c4033] cursor-pointer hover:bg-[#1a3f22] hover:text-white transition-colors"
                    >
                      #{tag}
                    </span>
                  ),
                )}
              </div>
            </div>
          </aside>

          {/* RIGHT: Note Grid */}
          <main className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`group relative p-8 border-2 border-[#1a3f22]/10 shadow-sm transition-all hover:shadow-[8px_8px_0px_rgba(26,63,34,0.05)] flex flex-col h-64 ${note.color} dark:bg-[#252525]`}
                >
                  {/* Pin Icon */}
                  <button
                    className={`absolute top-4 right-4 ${note.isPinned ? "text-[#1a3f22]" : "text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"}`}
                  >
                    <Pin
                      size={16}
                      className={note.isPinned ? "fill-current" : ""}
                    />
                  </button>

                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={12} className="text-[#8b5a2b]" />
                    <span className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase tracking-tighter">
                      {note.createdAt}
                    </span>
                  </div>

                  <h3 className="text-xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373] mb-3 leading-tight">
                    {note.title}
                  </h3>

                  <p className="text-sm font-serif italic text-[#5c4033] dark:text-gray-300 line-clamp-4 leading-relaxed mb-4">
                    {note.content}
                  </p>

                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex gap-1">
                      {note.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[8px] font-mono font-black uppercase text-[#8b5a2b] bg-[#1a3f22]/5 px-1"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Visual "Index Card" Lines */}
                  <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#1a3f22]/10 to-transparent" />
                </div>
              ))}
            </div>

            {/* Empty State */}
            {notes.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-[#d6c7a1]">
                <StickyNote size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="font-serif italic text-gray-400">
                  The ledger is blank. Start a new scribble.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a3f2220;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default MyNotesPage;
