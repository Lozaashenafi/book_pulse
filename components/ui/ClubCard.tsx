// components/ui/ClubCard.tsx
import React from "react";
import {
  Users,
  BookOpen,
  Calendar,
  ChevronRight,
  Book as BookIcon,
} from "lucide-react";

export interface Book {
  id: string | number;
  title: string;
  bookTitle?: string;
  author: string;
  category: string;
  desc: string;
  color: string;
  readers: number;
  chapters: number;
  dateRange: string;
  cover?: string;
}

interface BookCardProps {
  book: Book;
}

const ClubCard = ({ book }: BookCardProps) => {
  return (
    <div className="group bg-[#FDF8F1] dark:bg-[#1E1E1E] rounded-xl overflow-hidden border border-[#9E6752]/10 dark:border-white/5 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row">
      {/* Accent Strip (Vertical for Desktop, Horizontal for Mobile) */}
      <div className={`w-full md:w-[6px] h-[5px] md:h-auto ${book.color}`} />

      {/* Book Cover Section */}
      <div className="w-full md:w-32 h-48 md:h-auto shrink-0 bg-gray-200 dark:bg-white/5 relative overflow-hidden">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#9E6752]/20">
            <BookIcon size={40} />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-1 min-w-0">
        <div className="flex justify-between items-start mb-4">
          <span className="bg-[#FED7A5]/50 dark:bg-[#9E6752]/20 text-[#9E6752] dark:text-[#FED7A5] px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide">
            {book.category}
          </span>
        </div>

        <div className="mb-3">
          <h3 className="text-xl font-serif font-bold text-[#9E6752] dark:text-[#E8D5C4] leading-tight truncate">
            {book.title}
          </h3>
          <p className="text-[#7A7A7A] dark:text-[#A0A0A0] italic text-sm">
            Reading: {book.bookTitle || book.title}
          </p>
        </div>

        <p className="text-[#7A7A7A] dark:text-[#888888] text-sm leading-relaxed mb-6 line-clamp-2 italic">
          "{book.desc}"
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-5 text-[#7A7A7A] dark:text-[#A0A0A0]">
            <div className="flex items-center gap-1.5">
              <Users
                size={14}
                className="text-[#9E6752]/70 dark:text-[#FED7A5]/70"
              />
              <span className="text-xs">{book.readers} readers</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Calendar
                size={14}
                className="text-[#9E6752]/70 dark:text-[#FED7A5]/70"
              />
              <span className="text-xs">{book.dateRange}</span>
            </div>
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-[#9E6752]/10 dark:border-white/5">
          <button className="w-full bg-[#FED7A5] hover:bg-[#fcc88a] dark:bg-[#9E6752] dark:hover:bg-[#b37a63] text-[#2D2D2D] dark:text-[#FDF8F1] py-2 px-4 rounded-lg font-bold flex items-center justify-between transition-colors">
            <span className="text-sm">View Details</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
