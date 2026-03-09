"use client";

import React, { useState } from "react";
import {
  PenTool,
  Trash2,
  Pin,
  Tag,
  Search,
  Plus,
  StickyNote,
  Clock,
  Paperclip,
  Quote,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useNotes } from "@/hooks/useNotes";
import CuratorLoader from "../ui/CuratorLoader";

const MyNotesPage = () => {
  const { user } = useAuthStore();
  const {
    notes,
    allTags,
    isLoading,
    addNote,
    removeNote,
    togglePin,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
  } = useNotes(user?.id);

  // Local state for the editor
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");

  const handleFileAway = () => {
    if (!content.trim()) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t !== "");
    addNote(title || "Untitled Scribble", content, tags);
    setTitle("");
    setContent("");
    setTagsInput("");
  };

  if (isLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <CuratorLoader />
      </div>
    );

  return (
    <div className="pb-20 transition-colors duration-500 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-12 border-b-2 border-tertiary/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-5xl pt-4 font-serif font-black text-tertiary dark:text-[#d4a373] tracking-tighter leading-none">
              Brain <span className="italic">Dumps</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden sm:block">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search archive..."
                className="pl-10 pr-4 py-2 bg-white dark:bg-[#252525] border border-[#d6c7a1] font-serif italic text-sm outline-none focus:border-tertiary"
              />
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-primary-half"
                size={16}
              />
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT: Editor */}
          <aside className="lg:col-span-4 space-y-8">
            <div className="relative bg-white dark:bg-[#252525] p-8 border-t-[10px] border-tertiary shadow-[8px_8px_0px_rgba(26,63,34,0.05)]">
              <Paperclip
                className="absolute -top-4 right-6 text-gray-300 -rotate-12"
                size={32}
              />
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (Optional)"
                className="w-full mb-2 bg-transparent border-b border-dashed border-[#d6c7a1] py-1 font-serif font-black text-tertiary outline-none"
              />
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full h-40 bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-dashed border-[#d6c7a1] p-4 font-serif italic text-sm outline-none resize-none mb-4"
              />
              <input
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Tags (comma separated)"
                className="w-full mb-4 bg-transparent border-b border-[#d6c7a1] text-[10px] font-mono outline-none"
              />
              <div className="flex justify-between items-center">
                <button
                  onClick={handleFileAway}
                  className="w-full bg-tertiary text-[#f4ebd0] py-2 font-mono text-[10px] font-black uppercase tracking-widest shadow-[3px_3px_0px_#d4a373] hover:translate-y-0.5 transition-all"
                >
                  File Away
                </button>
              </div>
            </div>

            {/* Tags Index */}
            <div className="bg-[#f4ebd0] dark:bg-[#2c2420] p-6 border-2 border-[#d6c7a1]">
              <h4 className="font-mono text-[10px] font-black uppercase tracking-widest text-primary-half mb-4 border-b border-[#d6c7a1] pb-2">
                Subject Index
              </h4>
              <div className="flex flex-wrap gap-2">
                <span
                  onClick={() => setSelectedTag(null)}
                  className={`px-2 py-1 border text-[10px] font-mono cursor-pointer transition-all ${!selectedTag ? "bg-tertiary text-white" : "bg-white/50 text-primary-dark"}`}
                >
                  #All
                </span>
                {allTags.map((tag: any) => (
                  <span
                    key={tag}
                    onClick={() =>
                      setSelectedTag(tag === selectedTag ? null : tag)
                    }
                    className={`px-2 py-1 border text-[10px] font-mono cursor-pointer transition-all ${selectedTag === tag ? "bg-tertiary text-white" : "bg-white/50 text-primary-dark"}`}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </aside>

          {/* RIGHT: Grid */}
          <main className="lg:col-span-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`group relative p-8 border-2 border-tertiary/10 shadow-sm transition-all hover:shadow-[8px_8px_0px_rgba(26,63,34,0.05)] flex flex-col h-64 ${note.color} dark:bg-[#252525]`}
                >
                  <button
                    onClick={() => togglePin(note.id, note.isPinned)}
                    className={`absolute top-4 right-4 ${note.isPinned ? "text-tertiary" : "text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity"}`}
                  >
                    <Pin
                      size={16}
                      className={note.isPinned ? "fill-current" : ""}
                    />
                  </button>
                  <div className="flex items-center gap-2 mb-4">
                    <Clock size={12} className="text-primary-half" />
                    <span className="text-[10px] font-mono font-bold text-primary-half uppercase tracking-tighter">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-serif font-black text-tertiary dark:text-[#d4a373] mb-3 leading-tight truncate">
                    {note.title}
                  </h3>
                  <p className="text-sm font-serif italic text-primary-dark dark:text-gray-300 line-clamp-4 leading-relaxed mb-4">
                    {note.content}
                  </p>
                  <div className="mt-auto flex justify-between items-center">
                    <div className="flex gap-1 flex-wrap">
                      {note.tags?.map((t: string) => (
                        <span
                          key={t}
                          className="text-[8px] font-mono font-black uppercase text-primary-half bg-tertiary/5 px-1"
                        >
                          #{t}
                        </span>
                      ))}
                    </div>
                    <button
                      onClick={() => removeNote(note.id)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {notes.length === 0 && (
              <div className="py-20 text-center border-2 border-dashed border-[#d6c7a1]">
                <StickyNote size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="font-serif italic text-gray-400">
                  The ledger is blank.
                </p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default MyNotesPage;
