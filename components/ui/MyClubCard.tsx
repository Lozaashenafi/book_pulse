// components/ui/ClubCard.tsx
"use client";

import React from "react";
import { Users, Calendar, Book as BookIcon } from "lucide-react";

export interface Book {
  id: string | number;
  title: string;
  bookTitle?: string;
  author: string;
  category: string;
  desc: string;
  color: string;
  readers: number;
  dateRange: string;
  cover?: string;
}

interface BookCardProps {
  book: Book;
  onAction?: (id: string | number) => void;
  isJoined?: boolean;
  loading?: boolean;
}

const MyClubCard = ({ book, onAction, isJoined, loading }: BookCardProps) => {
  return (
    <div className="group relative bg-white dark:bg-[#252525] border-2 border-primary-dark/10 shadow-[4px_4px_0px_rgba(92,64,51,0.1)] transition-all hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_rgba(92,64,51,0.15)] flex flex-col md:flex-row overflow-hidden">
      {/* Accent Spine (Vertical) */}
      <div
        className={`w-full md:w-[8px] h-[6px] md:h-auto shrink-0 ${book.color || "bg-primary-half"}`}
      />

      {/* Book Cover Section - Styled like a recessed photo slot */}
      <div className="w-full md:w-36 h-48 md:h-auto shrink-0 bg-[#f4ebd0] dark:bg-black/20 border-r border-primary-dark/5 relative overflow-hidden">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-half/30">
            <BookIcon size={40} />
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start mb-3">
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 border border-primary-dark/20 text-primary-half dark:text-[#d4a373]">
            {book.category}
          </span>
        </div>

        <div className="mb-2">
          <h3 className="text-xl font-serif font-black text-primary-dark dark:text-[#d4a373] leading-tight truncate">
            {book.title}
          </h3>
          <p className="text-primary-half dark:text-gray-400 font-serif italic text-sm">
            Featuring: {book.bookTitle || "Selected Work"}
          </p>
        </div>

        <p className="text-gray-500 dark:text-gray-500 text-xs font-serif italic leading-relaxed mb-4 line-clamp-2">
          "{book.desc}"
        </p>

        {/* Meta Stats */}
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-1.5 text-primary-half">
            <Users size={14} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-tighter">
              {book.readers} Readers
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-primary-half">
            <Calendar size={14} />
            <span className="font-mono text-[10px] font-bold uppercase tracking-tighter">
              {book.dateRange}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyClubCard;
