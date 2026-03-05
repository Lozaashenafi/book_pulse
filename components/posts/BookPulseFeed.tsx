"use client";

import React from "react";
import {
  BookOpen,
  TrendingUp,
  PlusCircle,
  MoreHorizontal,
  Heart,
  MessageSquare,
  Share2,
  Quote,
  Paperclip,
} from "lucide-react";

const BookPulsePage = () => {
  return (
    /* flex container to hold Middle and Right columns */
    <div className="flex gap-12 h-full justify-center">
      {/* --- MIDDLE COLUMN: THE STICKY NOTE FEED (SCROLLABLE) --- */}
      <main className="flex-1 max-w-2xl space-y-10 overflow-y-auto h-full pr-4 pb-20 custom-scrollbar">
        {/* Create Post "Scrap Paper" */}
        <div className="relative bg-white mt-3 dark:bg-[#252525] p-8 border-l-[12px] border-primary/30 shadow-sm">
          <Paperclip
            className="absolute -top-3 right-8 text-gray-400 rotate-12"
            size={32}
          />
          <div className="flex items-start space-x-4 mb-4">
            <textarea
              className="w-full bg-transparent border-none focus:ring-0 text-xl font-serif italic placeholder:text-gray-300 resize-none pt-2"
              placeholder="Scribble a thought..."
              rows={2}
            />
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
            <div className="flex space-x-4">
              <button className="text-[#8b5a2b] hover:underline flex items-center gap-1 text-xs font-bold uppercase tracking-tighter">
                <Quote size={14} /> Add Quote
              </button>
            </div>
            <button className="bg-primary-dark text-[#f4ebd0] px-6 py-1 font-serif italic hover:bg-[#3e2b22] transition-colors shadow-md">
              Pin to Board
            </button>
          </div>
        </div>

        {/* Sticky Note 1: Yellow */}
        <div className="relative transform rotate-1 bg-[#feff9c] dark:bg-[#c4c562] p-8 shadow-[5px_5px_15px_rgba(0,0,0,0.15)] min-h-[250px] flex flex-col group">
          <div className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-red-600 shadow-[1px_2px_3px_rgba(0,0,0,0.4)] flex items-center justify-center z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 mb-0.5 ml-0.5" />
          </div>
          <div className="absolute -top-2 right-6 w-4 h-4 rounded-full bg-red-600 shadow-[1px_2px_3px_rgba(0,0,0,0.4)] flex items-center justify-center z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 mb-0.5 ml-0.5" />
          </div>

          <div className="flex justify-between items-start mb-4">
            <div className="font-mono text-[10px] text-black/50 uppercase">
              Feb 24, 2024 // 14:02
            </div>
            <MoreHorizontal className="text-black/30" size={16} />
          </div>

          <p className="text-[#2c2c2c] font-serif text-xl leading-relaxed flex-1">
            "The way Tartt describes the atmosphere of the college is haunting.
            Does anyone else feel like Henry is hiding something already?"
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
            <div className="flex space-x-4 text-black/60">
              <Heart
                size={18}
                className="hover:fill-red-400 hover:text-red-400 cursor-pointer transition-colors"
              />
              <MessageSquare size={18} className="cursor-pointer" />
            </div>
            <div className="font-serif italic text-sm text-black/70">
              — Elena Wright
            </div>
          </div>
        </div>

        {/* Sticky Note 2: Pink/Rose */}
        <div className="relative transform -rotate-1 bg-[#ff7eb9] dark:bg-[#a35278] p-8 shadow-[5px_5px_15px_rgba(0,0,0,0.15)] min-h-[200px] flex flex-col group">
          <div className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-blue-600 shadow-[1px_2px_3px_rgba(0,0,0,0.4)] flex items-center justify-center z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 mb-0.5 ml-0.5" />
          </div>
          <div className="absolute -top-2 right-6 w-4 h-4 rounded-full bg-blue-600 shadow-[1px_2px_3px_rgba(0,0,0,0.4)] flex items-center justify-center z-10">
            <div className="w-1.5 h-1.5 rounded-full bg-white/30 mb-0.5 ml-0.5" />
          </div>

          <p className="text-white font-serif text-xl leading-relaxed flex-1">
            Found a first edition of 'The Great Gatsby' at a yard sale today!
            The smell of the old paper is everything. 📚
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-white/20 pt-4">
            <div className="flex space-x-4 text-white">
              <Heart size={18} className="cursor-pointer" />
              <Share2 size={18} className="cursor-pointer" />
            </div>
            <div className="font-serif italic text-sm text-white/90">
              — Alex Reader
            </div>
          </div>
        </div>
      </main>

      {/* --- RIGHT COLUMN: THE BOOKMARKS (STATIC) --- */}
      <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 h-full space-y-8">
        {/* Currently Reading: Book Look */}
        <div className="bg-[#fdfdfd] mt-3 dark:bg-[#252525] rounded-r-3xl rounded-l-md p-6 border-y-2 border-r-4 border-gray-200 shadow-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-primary-dark" />
          <h3 className="font-serif font-bold text-lg mb-6 text-primary-dark dark:text-gray-100 flex items-center gap-2">
            <BookOpen size={18} /> In Progress
          </h3>

          <div className="space-y-4">
            <div className="border-b border-dashed border-gray-300 pb-2">
              <p className="font-black text-lg font-serif text-gray-800 dark:text-gray-100">
                The Great Gatsby
              </p>
              <p className="text-xs font-mono text-gray-400">
                F. SCOTT FITZGERALD
              </p>
            </div>

            <div className="bg-gray-100 p-2 rounded">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span>PROGRESS</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-300 h-1 rounded-full overflow-hidden">
                <div className="bg-[#8b5a2b] h-full w-[45%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Popular Circles: The "Library Index" */}
        <div className="bg-[#fff9f0] p-6 border-2 border-[#e3d5c1] shadow-inner">
          <div className="flex items-center justify-between mb-6 border-b-2 border-[#e3d5c1] pb-2">
            <h3 className="font-mono font-bold text-sm text-[#8b5a2b]">
              LITERARY CIRCLES
            </h3>
            <TrendingUp size={16} className="text-[#8b5a2b]" />
          </div>
          <div className="space-y-6">
            <CircleRow name="Midnight Classics" members="1.2k" />
            <CircleRow name="Sci-Fi Frontiers" members="840" />
            <CircleRow name="Poetry Nook" members="2.1k" />
          </div>
        </div>
      </aside>
    </div>
  );
};

// Helper component for the Right Sidebar list
const CircleRow = ({ name, members }: any) => (
  <div className="flex items-center justify-between group cursor-pointer border-b border-[#e3d5c1] border-dotted pb-2">
    <div>
      <p className="text-sm font-serif font-bold text-gray-800 hover:text-[#8b5a2b]">
        {name}
      </p>
      <p className="text-[9px] font-mono text-gray-500 uppercase">
        {members} subscribers
      </p>
    </div>
    <PlusCircle
      size={14}
      className="text-gray-300 group-hover:text-[#8b5a2b]"
    />
  </div>
);

export default BookPulsePage;
