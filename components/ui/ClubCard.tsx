"use client";

import React, { useState } from "react";
import {
  Users,
  ChevronRight,
  Book as BookIcon,
  X,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { joinClub } from "@/services/club.service";
import { toast } from "sonner";

// Updated Interface to include DB fields
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
  isMember?: boolean; // New
  ownerId?: string; // New
}

const ClubCard = ({ book }: { book: Book }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { user, profile } = useAuthStore();
  const router = useRouter();

  // Determine if the user should see the join button
  const isMemberOrOwner = book.isMember || (user && user.id === book.ownerId);
  const handleJoin = async () => {
    if (!user) {
      toast.error("Please sign in to join this circle");
      return router.push("/login");
    }

    // Prevent multiple clicks
    if (isJoining || book.isMember) return;

    setIsJoining(true);
    try {
      const result = await joinClub(
        user.id,
        book.id,
        book.ownerId!,
        book.title,
        profile?.name || "A reader",
      );

      if (result.success) {
        toast.success(`Welcome to ${book.title}!`);
        setShowDetails(false);
        // Force a router refresh to update the 'isMember' status on the Explore page
        router.refresh();
        router.push(`/clubs/myclubs`);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsJoining(false);
    }
  };
  return (
    <>
      {/* MINI CARD VIEW - No UI changes here */}
      <div className="group bg-white dark:bg-[#1E1E1E] rounded-xl overflow-hidden border border-[#9E6752]/10 dark:border-white/5 shadow-sm transition-all hover:shadow-md flex flex-col md:flex-row">
        <div
          className={`w-full md:w-[6px] h-[5px] md:h-auto ${book.color || "bg-primary"}`}
        />
        <div className="w-full md:w-32 h-48 md:h-auto shrink-0 bg-gray-200 dark:bg-white/5 overflow-hidden">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover transition-transform group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#9E6752]/20">
              <BookIcon size={40} />
            </div>
          )}
        </div>
        <div className="p-6 flex flex-col flex-1 min-w-0">
          <span className="w-fit bg-[#FED7A5]/50 text-[#9E6752] px-2.5 py-1 rounded text-[10px] font-bold uppercase mb-4">
            {book.category}
          </span>
          <h3 className="text-xl font-serif font-bold text-[#9E6752] dark:text-[#E8D5C4] truncate">
            {book.title}
          </h3>
          <p className="text-[#7A7A7A] italic text-sm mb-4">
            Reading: {book.bookTitle}
          </p>
          <div className="mt-auto pt-4 border-t border-[#9E6752]/10 flex items-center justify-between">
            <div className="flex gap-4 text-[#7A7A7A]">
              <div className="flex items-center gap-1">
                <Users size={14} />{" "}
                <span className="text-xs">{book.readers}</span>
              </div>
            </div>
            <button
              onClick={() => setShowDetails(true)}
              className="text-sm font-bold text-[#9E6752] flex items-center gap-1 hover:underline"
            >
              Details <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* FULL DETAILS MODAL */}
      {showDetails && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-[#FDF8F1] dark:bg-[#1a1a1a] w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl relative border border-[#9E6752]/20">
            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-black/5 hover:bg-black/10 z-10"
            >
              <X size={20} />
            </button>
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-2/5 bg-[#9E6752]/10 p-8 flex flex-col items-center justify-center border-r border-[#9E6752]/10">
                <div className="w-40 h-56 shadow-2xl rounded-lg overflow-hidden rotate-2 mb-6">
                  {book.cover ? (
                    <img
                      src={book.cover}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <BookIcon
                      size={60}
                      className="m-auto mt-20 text-[#9E6752]/20"
                    />
                  )}
                </div>
                <div className="text-center">
                  <p className="font-serif font-bold text-[#9E6752]">
                    {book.bookTitle}
                  </p>
                  <p className="text-xs text-[#7A7A7A]">by {book.author}</p>
                </div>
              </div>
              <div className="w-full md:w-3/5 p-8 flex flex-col">
                <div className="mb-6">
                  <span className="text-[10px] font-bold text-[#9E6752] uppercase tracking-[0.2em]">
                    The Circle
                  </span>
                  <h2 className="text-3xl font-serif font-black text-[#2D2D2D] dark:text-white mt-1">
                    {book.title}
                  </h2>
                </div>
                <div className="space-y-4 flex-1">
                  <p className="text-sm text-[#5A5A5A] dark:text-gray-400 italic leading-relaxed">
                    "{book.desc}"
                  </p>
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-[#9E6752]/10">
                      <p className="text-[9px] font-bold text-[#7A7A7A] uppercase">
                        Timeline
                      </p>
                      <p className="text-xs font-bold text-[#9E6752]">
                        {book.dateRange}
                      </p>
                    </div>
                    <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-[#9E6752]/10">
                      <p className="text-[9px] font-bold text-[#7A7A7A] uppercase">
                        Current Readers
                      </p>
                      <p className="text-xs font-bold text-[#9E6752]">
                        {book.readers} Fellow Readers
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 space-y-3">
                  {/* LOGIC: Change button based on membership status */}
                  {isMemberOrOwner ? (
                    <div className="w-full bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 border border-green-200 dark:border-green-800">
                      <CheckCircle2 size={20} /> Already a Fellow
                    </div>
                  ) : (
                    <button
                      disabled={isJoining}
                      onClick={handleJoin}
                      className="w-full bg-[#9E6752] text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#865644] transition-all shadow-lg shadow-[#9E6752]/20 active:scale-[0.98]"
                    >
                      {isJoining ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          {!user ? "Login to Join" : "Join this Fellowship"}{" "}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  )}
                  <p className="text-[10px] text-center text-[#7A7A7A]">
                    Discussion starts as soon as you enter the circle.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ClubCard;
