"use client";

import React from "react";
import { Users, ArrowRight, Book as BookIcon } from "lucide-react";

export interface Book {
  id: string;
  title: string;
  bookTitle?: string;
  author: string;
  category: string;
  desc: string;
  color: string;
  readers: number;
  dateRange: string;
  cover?: string;
  isMember?: boolean;
  ownerId?: string;
}

interface ClubCardProps {
  book: Book;
  onViewDetails: () => void;
}

const ClubCard = ({ book, onViewDetails }: ClubCardProps) => {
  return (
    <div className="group bg-white dark:bg-[#252525] border-2 border-tertiary/10 dark:border-[#3e2b22] shadow-[6px_6px_0px_rgba(26,63,34,0.05)] transition-all hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex flex-col sm:flex-row overflow-hidden h-full min-h-[180px]">
      <div
        className={`w-full sm:w-[8px] h-[6px] sm:h-auto bg-tertiary shrink-0`}
      />

      <div className="w-full sm:w-32 h-40 sm:h-auto shrink-0 bg-[#f4ebd0] dark:bg-black/20 flex items-center justify-center overflow-hidden border-b sm:border-b-0 sm:border-r border-tertiary/5">
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
          />
        ) : (
          <BookIcon size={32} className="text-tertiary/20" />
        )}
      </div>

      <div className="p-5 flex flex-col flex-1 min-w-0 relative">
        <div className="flex justify-between items-start mb-2">
          <span className="text-[9px] font-mono font-black text-primary-half dark:text-[#d4a373] uppercase tracking-widest bg-[#f4ebd0] dark:bg-tertiary/20 px-2 py-0.5">
            {book.category}
          </span>
          <div className="flex items-center gap-1 text-tertiary/40">
            <Users size={12} />
            <span className="text-[10px] font-mono font-bold">
              {book.readers}
            </span>
          </div>
        </div>

        <h3 className="text-lg font-serif font-black text-tertiary dark:text-[#E8D5C4] truncate leading-tight">
          {book.title}
        </h3>
        <p className="text-primary-half dark:text-stone-400 italic text-xs mb-4 font-serif truncate">
          Reading: {book.bookTitle}
        </p>

        <button
          onClick={(e) => {
            e.preventDefault();
            onViewDetails();
          }}
          className="mt-auto self-end text-[10px] font-mono font-black uppercase tracking-widest text-tertiary dark:text-[#d4a373] flex items-center gap-1 hover:underline"
        >
          Details <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
};

export default ClubCard;
