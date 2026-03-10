"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  BookX,
  SlidersHorizontal,
  Bookmark,
  Paperclip,
  X,
  Users,
  CheckCircle2,
  ArrowRight,
  Loader2,
  Book as BookIcon,
} from "lucide-react";
import ClubCard from "@/components/ui/ClubCard";
import { useExploreClubs } from "@/hooks/useExploreClubs";
import { getCategories, joinClub } from "@/services/club.service";
import { useAuthStore } from "@/store/useAuthStore";
import CuratorLoader from "@/components/ui/CuratorLoader";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// --- Sub-Component: Search Bar ---
const SearchBar = ({ searchQuery, setSearchQuery }: any) => (
  <div className="relative group w-full mb-8">
    <div className="absolute -top-3 left-6 z-10">
      <span className="bg-[#d4a373] text-[#1a1614] text-[9px] font-mono font-black px-2 py-0.5 uppercase tracking-widest shadow-sm">
        Search Query
      </span>
    </div>
    <input
      type="text"
      placeholder="Search archives by title or author..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#2c2420] border-2 border-tertiary/10 dark:border-[#3e2b22] shadow-[6px_6px_0px_rgba(26,63,34,0.05)] outline-none focus:border-tertiary transition-all text-tertiary dark:text-[#f4ebd0] font-serif italic placeholder:text-gray-300"
    />
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary dark:text-[#d4a373] opacity-40"
      size={20}
    />
  </div>
);

// --- Sub-Component: Category Filter ---
const CategoryFilter = ({
  activeCategory,
  setActiveCategory,
  categories,
}: any) => (
  <div className="bg-[#f4ebd0] dark:bg-[#2c2420] p-6 border-2 border-[#d6c7a1] dark:border-[#3e2b22] shadow-[8px_8px_0px_rgba(92,64,51,0.08)] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-16 h-16 bg-tertiary/5 -rotate-45 translate-x-8 -translate-y-8" />
    <div className="flex items-center space-x-2 mb-6 border-b border-[#d6c7a1] dark:border-[#3e2b22] pb-2">
      <SlidersHorizontal
        size={16}
        className="text-tertiary dark:text-[#d4a373]"
      />
      <span className="font-mono font-black uppercase tracking-[0.2em] text-[10px] text-primary-half dark:text-[#d4a373]">
        Classification Index
      </span>
    </div>
    <div className="flex flex-wrap gap-2">
      {["All", ...categories].map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-3 py-1.5 text-[10px] font-mono font-black uppercase tracking-widest transition-all border ${
            activeCategory === cat
              ? "bg-tertiary text-[#f4ebd0] border-tertiary shadow-[3px_3px_0px_#d4a373]"
              : "bg-white/50 dark:bg-black/20 text-tertiary dark:text-[#d4a373] border-[#d6c7a1] dark:border-white/5 hover:bg-white dark:hover:bg-white/10"
          }`}
        >
          #{cat}
        </button>
      ))}
    </div>
  </div>
);

const ExplorePage = () => {
  const router = useRouter();
  const { user, profile } = useAuthStore();
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  const { clubs, isLoading } = useExploreClubs(user?.id);

  // Modal State
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setDynamicCategories(cats.map((c: any) => c.name));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCats();
  }, []);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      const matchesCategory =
        activeCategory === "All" || club.category === activeCategory;
      const matchesSearch =
        club.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        club.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, clubs]);

  const handleJoinClub = async () => {
    if (!user) {
      toast.info("Please sign in to join this circle.");
      router.push(`/login?next=/explore`);
      return;
    }

    setIsJoining(true);
    try {
      // Assuming joinClub service accepts these params
      const res = await joinClub(
        user.id,
        selectedBook.id,
        selectedBook.ownerId,
        selectedBook.title,
        profile?.name || "A reader",
      );

      if (res.success) {
        toast.success(`Welcome to ${selectedBook.title}!`);
        setSelectedBook(null);
        router.push(`/clubs/${selectedBook.id}`);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <CuratorLoader />
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto py-6 relative">
      <header className="mb-12 border-b-4 border-tertiary/10 pb-8 relative">
        <h1 className="text-5xl pt-4 font-serif font-black text-tertiary dark:text-[#d4a373] tracking-tighter leading-none">
          The Reading <span className="italic">Archives</span>
        </h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-8">
          <SearchBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
          <div className="relative">
            <Paperclip
              className="absolute -top-6 right-4 text-gray-300 z-20 hidden md:block"
              size={32}
            />
            <CategoryFilter
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
              categories={dynamicCategories}
            />
          </div>
          <div className="p-6 bg-white dark:bg-[#2c2420] border-2 border-dashed border-[#d6c7a1] hidden lg:block">
            <h4 className="font-serif font-bold text-tertiary dark:text-[#d4a373] text-sm mb-2 flex items-center gap-2">
              <Bookmark size={14} className="fill-current" /> Member Note:
            </h4>
            <p className="text-[11px] text-primary-half dark:text-gray-400 font-serif italic leading-relaxed">
              Can't find your specific niche? Start your own circle from the
              dashboard and invite your squad.
            </p>
          </div>
        </aside>

        <main className="lg:col-span-8">
          {filteredClubs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredClubs.map((club) => (
                <div
                  key={club.id}
                  className="transition-all hover:-translate-y-1"
                >
                  {/* Updated ClubCard to trigger the local modal */}
                  <div
                    onClick={() => setSelectedBook(club)}
                    className="cursor-pointer h-full"
                  >
                    <ClubCard
                      key={club.id}
                      book={club}
                      onViewDetails={() => setSelectedBook(club)}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 text-center bg-white/50 dark:bg-[#2c2420] border-2 border-dashed border-[#d6c7a1]">
              <BookX size={60} className="text-tertiary opacity-10 mb-6" />
              <h3 className="text-2xl font-serif font-black text-tertiary dark:text-white opacity-40 uppercase tracking-tighter">
                No Records Found
              </h3>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-6 font-mono text-[10px] font-black uppercase tracking-widest text-tertiary underline decoration-dotted underline-offset-4"
              >
                Clear Search Parameters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* --- SHARED DETAIL MODAL (Dossier View) --- */}
      {selectedBook && (
        <div
          className="fixed inset-0 z-10000 flex items-center justify-center p-4 md:p-8 bg-tertiary/60 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setSelectedBook(null)}
        >
          <div
            className="bg-[#f4ebd0] dark:bg-[#1a1614] w-full max-w-4xl border-2 border-tertiary  relative overflow-hidden flex flex-col md:flex-row max-h-[90vh] md:h-[550px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 p-2 text-tertiary hover:rotate-90 transition-transform z-[100] bg-white border border-tertiary/20"
            >
              <X size={20} />
            </button>

            {/* Left Page (The Cover) */}
            <div className="w-full md:w-[40%] bg-[#f4ebd0] dark:bg-[#252525] p-10 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r-2 md:border-dashed md:border-tertiary/20 shrink-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-tertiary/10 translate-x-3 translate-y-3" />
                <div className="w-40 h-56 md:w-48 md:h-64 bg-white shadow-xl relative z-10 overflow-hidden border border-tertiary/10">
                  {selectedBook.cover ? (
                    <img
                      src={selectedBook.cover}
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
                  {selectedBook.bookTitle}
                </p>
                <p className="text-[10px] font-mono font-bold text-primary-half uppercase tracking-widest">
                  Authored by {selectedBook.author}
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
                <h2 className="text-3xl font-serif font-black text-tertiary dark:text-white mt-2 leading-tight">
                  {selectedBook.title}
                </h2>
                <div className="h-1 w-20 bg-tertiary mt-4" />
              </div>

              <div className="space-y-6 flex-1">
                <p className="text-sm md:text-base text-tertiary dark:text-gray-300 font-serif italic leading-relaxed border-l-4 border-[#d4a373]/30 pl-4 py-2 bg-tertiary/5">
                  "{selectedBook.desc}"
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4 font-mono">
                  <div className="border-t-2 border-tertiary/10 pt-2">
                    <p className="text-[9px] font-black text-primary-half uppercase">
                      Timeline
                    </p>
                    <p className="text-xs font-bold text-tertiary dark:text-[#d4a373]">
                      {selectedBook.dateRange}
                    </p>
                  </div>
                  <div className="border-t-2 border-tertiary/10 pt-2">
                    <p className="text-[9px] font-black text-primary-half uppercase">
                      Active Readers
                    </p>
                    <p className="text-xs font-bold text-tertiary dark:text-[#d4a373]">
                      {selectedBook.readers} members
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Area */}
              <div className="mt-12">
                {selectedBook.isMember ||
                (user && user.id === selectedBook.ownerId) ? (
                  <div className="w-full bg-tertiary text-[#f4ebd0] py-4 font-serif italic font-bold flex items-center justify-center gap-3 border-2 border-tertiary shadow-md">
                    <CheckCircle2 size={20} /> Record Found: Member
                  </div>
                ) : (
                  <button
                    disabled={isJoining}
                    onClick={handleJoinClub}
                    className="w-full bg-tertiary text-[#f4ebd0] py-5 shadow-[6px_6px_0px_#d4a373] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-serif font-black italic text-lg flex items-center justify-center gap-3"
                  >
                    {isJoining ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <>
                        {!user ? "Login to Join" : "Join this Circle"}{" "}
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
    </div>
  );
};

export default ExplorePage;
