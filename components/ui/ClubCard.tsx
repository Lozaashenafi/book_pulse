// components/BookCard.tsx
import React from "react";
import { Users, BookOpen, Calendar, ChevronRight } from "lucide-react";

export interface Book {
  id: number;
  title: string;
  author: string;
  category: string;
  desc: string;
  color: string;
  readers: number;
  chapters: number;
  dateRange: string;
}

interface BookCardProps {
  book: Book;
  onViewClub?: (id: number) => void;
}

const ClubCard = ({ book }: BookCardProps) => {
  return (
    <div className="group bg-[#FDF8F1] dark:bg-[#1E1E1E] rounded-xl overflow-hidden border border-[#9E6752]/10 dark:border-white/5 shadow-sm transition-all hover:shadow-md flex flex-col">
      {/* Accent Strip */}
      <div className={`h-[5px] w-full ${book.color}`} />

      <div className="p-6 flex flex-col flex-1">
        {/* Category */}
        <div className="mb-4">
          <span className="bg-[#FED7A5]/50 dark:bg-[#9E6752]/20 text-[#9E6752] dark:text-[#FED7A5] px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide">
            {book.category}
          </span>
        </div>

        {/* Header */}
        <div className="mb-3">
          <h3 className="text-2xl font-serif font-bold text-[#9E6752] dark:text-[#E8D5C4] leading-tight group-hover:opacity-80 transition-opacity">
            {book.title}
          </h3>
          <p className="text-[#7A7A7A] dark:text-[#A0A0A0] italic text-base">
            by {book.author}
          </p>
        </div>

        {/* Description */}
        <p className="text-[#7A7A7A] dark:text-[#888888] text-sm leading-relaxed mb-6 line-clamp-2">
          {book.desc}
        </p>

        {/* Metadata Icons */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-5 text-[#7A7A7A] dark:text-[#A0A0A0]">
            <div className="flex items-center gap-1.5">
              <Users
                size={16}
                className="text-[#9E6752]/70 dark:text-[#FED7A5]/70"
              />
              <span className="text-sm">{book.readers} readers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen
                size={16}
                className="text-[#9E6752]/70 dark:text-[#FED7A5]/70"
              />
              <span className="text-sm">{book.chapters} chapters</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[#7A7A7A] dark:text-[#A0A0A0]">
            <Calendar
              size={16}
              className="text-[#9E6752]/70 dark:text-[#FED7A5]/70"
            />
            <span className="text-sm">{book.dateRange}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-auto pt-4 border-t border-[#9E6752]/10 dark:border-white/5">
          <button className="w-full bg-[#FED7A5] hover:bg-[#fcc88a] dark:bg-[#9E6752] dark:hover:bg-[#b37a63] text-[#2D2D2D] dark:text-[#FDF8F1] py-2.5 px-4 rounded-lg font-bold flex items-center justify-between transition-colors shadow-sm">
            <span>View Club</span>
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
