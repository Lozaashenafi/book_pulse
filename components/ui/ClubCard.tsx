"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  ChevronRight,
  Book as BookIcon,
  X,
  CheckCircle2,
  Loader2,
  ArrowRight,
  Bookmark,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { joinClub } from "@/services/club.service";
import { toast } from "sonner";
import CuratorLoader from "./CuratorLoader";

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

const ClubCard = ({ book }: { book: Book }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { user, profile } = useAuthStore();
  const router = useRouter();

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDetails]);

  const isMemberOrOwner =
    Boolean(book.isMember) || (user && user.id === book.ownerId);

  const handleJoin = async () => {
    if (!user) {
      toast.error("Please sign in to join this circle");
      return router.push("/login");
    }
    if (isJoining || isMemberOrOwner) return;

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
      {/* MINI CARD VIEW - Move transition-transform here */}
      <div className="group bg-white dark:bg-[#252525] border-2 border-tertiary/10 dark:border-[#3e2b22] shadow-[6px_6px_0px_rgba(26,63,34,0.05)] transition-all hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex flex-col sm:flex-row overflow-hidden h-full">
        <div className={`w-full sm:w-[8px] h-[6px] sm:h-auto bg-tertiary`} />

        <div className="w-full sm:w-28 h-40 sm:h-auto shrink-0 bg-[#f4ebd0] dark:bg-black/20 flex items-center justify-center overflow-hidden">
          {book.cover ? (
            <img
              src={book.cover}
              alt={book.title}
              className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
            />
          ) : (
            <BookIcon size={32} className="text-tertiary/20" />
          )}
        </div>

        <div className="p-5 flex flex-col flex-1 min-w-0 relative">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[9px] font-mono font-black text-[#8b5a2b] uppercase tracking-widest bg-[#f4ebd0] px-2 py-0.5">
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
          <p className="text-[#8b5a2b] italic text-xs mb-4 font-serif">
            Reading: {book.bookTitle}
          </p>

          <button
            onClick={() => setShowDetails(true)}
            className="mt-auto self-end text-[10px] font-mono font-black uppercase tracking-widest text-tertiary dark:text-[#d4a373] flex items-center gap-1 hover:underline"
          >
            Details <ArrowRight size={12} />
          </button>
        </div>
      </div>

      {/* FULL DETAILS MODAL */}
      {showDetails && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-8 bg-tertiary/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#f4ebd0] dark:bg-[#2c2420] w-full max-w-4xl  border-2 border-[#d6c7a1] dark:border-[#3e2b22] shadow-[6px_6px_0px_rgba(92,64,51,0.1)]  relative overflow-hidden flex flex-col md:flex-row max-h-[95vh] min-h-[500px]">
            <div className="absolute top-0 right-0 w-12 h-12 bg-tertiary/5 -rotate-45 translate-x-6 -translate-y-6" />
            {/* Close Button */}

            <button
              onClick={() => setShowDetails(false)}
              className="absolute top-4 right-4 p-2 text-tertiary hover:rotate-90 transition-transform z-[100] bg-white border border-tertiary/20"
            >
              <X size={20} />
            </button>
            {/* Left Page (The Cover) */}
            <div className="w-full md:w-[40%] bg-[#f4ebd0] dark:bg-[#252525] p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r-2 md:border-dashed md:border-tertiary/20 shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-tertiary/10 translate-x-3 translate-y-3" />
                <div className="w-48 h-64 bg-white shadow-xl relative z-10 overflow-hidden border border-tertiary/10">
                  {book.cover ? (
                    <img
                      src={book.cover}
                      className="w-full h-full object-cover"
                      alt="cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookIcon size={48} className="text-tertiary/10" />
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-8 text-center space-y-1">
                <p className="font-serif font-black text-xl text-tertiary dark:text-[#d4a373]">
                  {book.bookTitle}
                </p>
                <p className="text-xs font-mono font-bold text-[#8b5a2b] uppercase tracking-widest">
                  Authored by {book.author}
                </p>
              </div>
            </div>
            {/* Right Page (The Record) */}
            <div className="flex-1 p-10 flex flex-col overflow-y-auto custom-scrollbar">
              <div className="mb-8 relative">
                <Bookmark
                  className="absolute -top-10 -left-6 text-tertiary/10 rotate-12"
                  size={60}
                />
                <span className="text-[10px] font-mono font-black text-[#d4a373] uppercase tracking-[0.4em]">
                  Circle Dossier
                </span>
                <h2 className="text-4xl font-serif font-black text-tertiary dark:text-white mt-2 leading-tight">
                  {book.title}
                </h2>
                <div className="h-1 w-20 bg-tertiary mt-4" />
              </div>

              <div className="space-y-6 flex-1">
                <p className="text-sm md:text-base text-tertiary dark:text-gray-300 font-serif italic leading-relaxed border-l-4 border-[#d4a373]/30 pl-4 py-2 bg-tertiary/5">
                  "{book.desc}"
                </p>

                <div className="grid grid-cols-2 gap-6 pt-4 font-mono">
                  <div className="border-t-2 border-tertiary/10 pt-2">
                    <p className="text-[9px] font-black text-[#8b5a2b] uppercase">
                      Timeline
                    </p>
                    <p className="text-xs font-bold text-tertiary dark:text-[#d4a373]">
                      {book.dateRange}
                    </p>
                  </div>
                  <div className="border-t-2 border-tertiary/10 pt-2">
                    <p className="text-[9px] font-black text-[#8b5a2b] uppercase">
                      Active Readers
                    </p>
                    <p className="text-xs font-bold text-tertiary dark:text-[#d4a373]">
                      {book.readers} Curators
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-12 space-y-4">
                {isMemberOrOwner ? (
                  <div className="w-full bg-tertiary text-[#f4ebd0] py-4 font-serif italic font-bold flex items-center justify-center gap-3 border-2 border-tertiary">
                    <CheckCircle2 size={20} /> Record Found: Member
                  </div>
                ) : (
                  <button
                    disabled={isJoining}
                    onClick={handleJoin}
                    className="w-full bg-tertiary text-[#f4ebd0] py-5 shadow-[6px_6px_0px_#d4a373] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-serif font-black italic text-lg flex items-center justify-center gap-3"
                  >
                    {isJoining ? (
                      <CuratorLoader />
                    ) : (
                      <>
                        {!user ? "Login to Access" : "Join this Circle"}
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
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
    </>
  );
};

export default ClubCard;
