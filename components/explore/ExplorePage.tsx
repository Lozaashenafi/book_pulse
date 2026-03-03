"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  BookX,
  SlidersHorizontal,
  Loader2,
  Bookmark,
  Paperclip,
} from "lucide-react";
import ClubCard from "../ui/ClubCard";
import { useExploreClubs } from "@/hooks/useExploreClubs";
import { getCategories } from "@/services/club.service";
import { useAuthStore } from "@/store/useAuthStore";
// --- Types (Unchanged) ---
interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (val: string) => void;
  categories: string[];
}

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => (
  <div className="relative group w-full mb-8">
    <div className="absolute -top-3 left-6 z-10">
      <span className="bg-[#d4a373] text-[#1a1614] text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-tighter">
        Query Field
      </span>
    </div>
    <input
      type="text"
      placeholder="Search title, author, or keyword..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#252525] border-2 border-[#1a3f22]/10 dark:border-white/5 rounded-none shadow-[4px_4px_0px_rgba(26,63,34,0.05)] outline-none focus:border-[#1a3f22] transition-all text-[#1a3f22] dark:text-[#F3F4F6] font-serif italic placeholder:text-gray-300"
    />
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a3f22] dark:text-[#d4a373]"
      size={18}
    />
  </div>
);

const CategoryFilter = ({
  activeCategory,
  setActiveCategory,
  categories,
}: CategoryFilterProps) => (
  <div className="bg-[#f4ebd0] dark:bg-[#2c2420] p-6 border-2 border-[#d6c7a1] dark:border-[#3e2b22] shadow-[6px_6px_0px_rgba(92,64,51,0.1)] relative overflow-hidden">
    <div className="absolute top-0 right-0 w-12 h-12 bg-[#1a3f22]/5 -rotate-45 translate-x-6 -translate-y-6" />

    <div className="flex items-center space-x-2 mb-6 border-b border-[#d6c7a1] pb-2">
      <SlidersHorizontal
        size={16}
        className="text-[#1a3f22] dark:text-[#d4a373]"
      />
      <span className="font-mono font-black uppercase tracking-[0.2em] text-[10px] text-[#8b5a2b] dark:text-[#d4a373]">
        Index Ledger
      </span>
    </div>

    <div className="flex flex-wrap gap-2">
      {["All", ...categories.filter((c) => c !== "All")].map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-tighter transition-all border ${
            activeCategory === cat
              ? "bg-[#1a3f22] text-[#f4ebd0] border-[#1a3f22] shadow-[2px_2px_0px_#d4a373]"
              : "bg-white/50 dark:bg-black/20 text-[#1a3f22] dark:text-[#d4a373] border-[#d6c7a1] dark:border-white/5 hover:bg-white"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  </div>
);

const ExplorePage = () => {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);
  // Inside ExplorePage.tsx
  const { user } = useAuthStore();
  // Ensure user?.id is passed here!
  const { clubs, isLoading } = useExploreClubs(user?.id);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        setDynamicCategories(cats);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCats();
  }, []);

  const filteredBooks = useMemo(() => {
    return clubs.filter((book) => {
      const matchesCategory =
        activeCategory === "All" || book.category === activeCategory;
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, clubs]);

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1a3f22]" size={40} />
      </div>
    );
  }

  return (
    /* Increased pt-40 to ensure the fixed header never covers the archives title */
    <div className="pt-40 pb-20 transition-colors duration-500 min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        <header className="mb-12 border-b-2 border-[#1a3f22]/10 pb-8 relative">
          <div className="inline-block bg-[#1a3f22] text-[#f4ebd0] px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4">
            Curated Collections
          </div>
          <h1 className="text-5xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373] tracking-tighter">
            The Global <span className="italic">Archives</span>
          </h1>
          <p className="text-[#8b5a2b] dark:text-gray-400 mt-2 font-serif italic text-lg max-w-xl leading-snug">
            "Discover community-led reading circles and dive into your next
            story."
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* ASIDE */}
          <aside className="lg:col-span-4 lg:sticky lg:top-32 space-y-8 z-10">
            <SearchBar
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
            <div className="relative">
              <Paperclip
                className="absolute -top-6 right-4 text-gray-300 z-20"
                size={32}
              />
              <CategoryFilter
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
                categories={dynamicCategories}
              />
            </div>
            {/* Decorative "Library Rules" Note */}
            <div className="p-6 bg-white dark:bg-[#252525] border border-dashed border-[#d6c7a1] hidden lg:block">
              <h4 className="font-serif font-bold text-[#1a3f22] text-sm mb-2">
                Member Note:
              </h4>
              <p className="text-[11px] text-[#8b5a2b] font-serif italic leading-relaxed">
                Can't find your specific niche? Start your own circle from the
                dashboard and invite your squad.
              </p>
            </div>
          </aside>

          {/* MAIN */}
          <main className="lg:col-span-8">
            {filteredBooks.length > 0 ? (
              /* Grid container: No transforms here */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredBooks.map((book) => (
                  <ClubCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 text-center bg-white dark:bg-[#252525] border-2 border-dashed border-[#d6c7a1] dark:border-[#3e2b22]">
                <BookX size={60} className="text-[#1a3f22] opacity-20 mb-6" />
                <h3 className="text-2xl font-serif font-black text-[#1a3f22] dark:text-white">
                  No records found
                </h3>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-6 font-mono text-[10px] font-bold uppercase tracking-widest text-[#1a3f22] underline decoration-dotted underline-offset-4"
                >
                  Reset Archives
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExplorePage;
