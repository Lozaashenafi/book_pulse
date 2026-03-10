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
import CuratorLoader from "../ui/CuratorLoader";
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
      className="w-full pl-12 pr-6 py-4 bg-white dark:bg-[#252525] border-2 border-tertiary/10 dark:border-white/5 rounded-none shadow-[4px_4px_0px_rgba(26,63,34,0.05)] outline-none focus:border-tertiary transition-all text-tertiary dark:text-[#F3F4F6] font-serif italic placeholder:text-gray-300"
    />
    <Search
      className="absolute left-4 top-1/2 -translate-y-1/2 text-tertiary dark:text-[#d4a373]"
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
    <div className="absolute top-0 right-0 w-12 h-12 bg-tertiary/5 -rotate-45 translate-x-6 -translate-y-6" />

    <div className="flex items-center space-x-2 mb-6 border-b border-[#d6c7a1] pb-2">
      <SlidersHorizontal
        size={16}
        className="text-tertiary dark:text-[#d4a373]"
      />
      <span className="font-mono font-black uppercase tracking-[0.2em] text-[10px] text-primary-half dark:text-[#d4a373]">
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
              ? "bg-tertiary text-[#f4ebd0] border-tertiary shadow-[2px_2px_0px_#d4a373]"
              : "bg-white/50 dark:bg-black/20 text-tertiary dark:text-[#d4a373] border-[#d6c7a1] dark:border-white/5 hover:bg-white"
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
  const { user } = useAuthStore();
  const { clubs, isLoading } = useExploreClubs(user?.id);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getCategories();
        const catNames = cats.map((c: any) => c.name);
        setDynamicCategories(catNames);
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
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.bookTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, clubs]);

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <CuratorLoader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6">
      <header className="mb-12 border-b-2 border-tertiary/10 pb-8 relative pt-4">
        <div className="inline-block bg-tertiary text-[#f4ebd0] px-3 py-0.5 text-[10px] font-mono font-bold uppercase tracking-[0.3em] mb-4">
          Curated Archives
        </div>
        <h1 className="text-4xl md:text-6xl font-serif font-black text-tertiary dark:text-[#d4a373] tracking-tighter">
          The Global <span className="italic">Archives</span>
        </h1>
        <p className="text-primary-half dark:text-stone-400 mt-2 font-serif italic text-lg max-w-xl leading-snug">
          "Step into the collective mind. Browse active reading circles and find
          your next manuscript."
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        <aside className="lg:col-span-4 lg:sticky lg:top-8 space-y-8 z-[20]">
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

          <div className="p-6 bg-white dark:bg-[#252525] border border-dashed border-[#d6c7a1] hidden lg:block">
            <h4 className="font-serif font-bold text-tertiary text-sm mb-2 flex items-center gap-2">
              <Bookmark size={14} className="fill-tertiary" /> Librarian&apos;s
              Note:
            </h4>
            <p className="text-[11px] text-primary-half font-serif italic leading-relaxed">
              New fellowships are being inscribed daily. Use the filters to find
              your niche or start your own circle from the dashboard.
            </p>
          </div>
        </aside>

        <main className="lg:col-span-8">
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
              {filteredBooks.map((book) => (
                <ClubCard key={book.id} book={book} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center bg-white dark:bg-[#252525] border-2 border-dashed border-[#d6c7a1] dark:border-stone-800">
              <BookX size={60} className="text-tertiary opacity-10 mb-6" />
              <h3 className="text-xl font-serif font-black text-tertiary dark:text-white opacity-40 uppercase">
                No Records Found
              </h3>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveCategory("All");
                }}
                className="mt-6 font-mono text-[10px] font-black uppercase tracking-widest text-tertiary underline decoration-dotted underline-offset-4"
              >
                Clear Search
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ExplorePage;
