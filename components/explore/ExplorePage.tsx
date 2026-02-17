"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  BookX,
  Users,
  BookOpen,
  Calendar,
  SlidersHorizontal,
} from "lucide-react";
import ClubCard, { Book } from "../ui/ClubCard";

// 2. Define Props for Sub-components
interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

interface CategoryFilterProps {
  activeCategory: string;
  setActiveCategory: (val: string) => void;
}

interface BookCardProps {
  book: Book;
}

// --- Mock Data Updated ---
const CATEGORIES: string[] = [
  "All",
  "Classic Fiction",
  "Self-Help",
  "Science Fiction",
  "Dystopian",
  "Non-Fiction",
  "Fable",
  "Memoir",
  "Literary Fiction",
];

const BOOKS: Book[] = [
  {
    id: 1,
    title: "Norwegian Wood",
    author: "Haruki Murakami",
    category: "Literary Fiction",
    desc: "A nostalgic coming-of-age novel about loss, memory, and the search for connection in 1960s...",
    color: "bg-[#8B4513]",
    readers: 19,
    chapters: 11,
    dateRange: "Feb 25 — Mar 22",
  },
  {
    id: 2,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    category: "Classic Fiction",
    desc: "A tale of mystery, romance, and the American dream in the Roaring Twenties.",
    color: "bg-[#9e6752]",
    readers: 42,
    chapters: 9,
    dateRange: "Mar 01 — Mar 30",
  },
  {
    id: 3,
    title: "Atomic Habits",
    author: "James Clear",
    category: "Self-Help",
    desc: "An easy & proven way to build good habits and break bad ones.",
    color: "bg-primary",
    readers: 120,
    chapters: 20,
    dateRange: "Apr 05 — May 10",
  },
];

// --- Sub-components (Kept the same) ---

const SearchBar = ({ searchQuery, setSearchQuery }: SearchBarProps) => (
  <div className="relative group w-full mb-8">
    <input
      type="text"
      placeholder="Search by title or author..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full pl-14 pr-6 py-5 bg-white dark:bg-[#1E1E1E] border border-[#9E6752]/20 dark:border-white/10 rounded-[40px_10px_40px_10px] shadow-sm outline-none focus:ring-2 focus:ring-[#9E6752]/20 transition-all text-[#2D2D2D] dark:text-[#F3F4F6] group-hover:shadow-md placeholder:text-[#7A7A7A]/60"
    />
    <Search
      className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9E6752] dark:text-[#FED7A5]"
      size={22}
    />
  </div>
);

const CategoryFilter = ({
  activeCategory,
  setActiveCategory,
}: CategoryFilterProps) => (
  <div className="bg-white dark:bg-[#1E1E1E] p-6 rounded-2xl border border-[#9E6752]/10 dark:border-white/5 shadow-sm">
    <div className="flex items-center space-x-2 mb-6 text-[#9E6752] dark:text-[#FED7A5]">
      <SlidersHorizontal size={18} />
      <span className="font-bold uppercase tracking-widest text-[10px]">
        Categories
      </span>
    </div>

    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => setActiveCategory(cat)}
          className={`px-4 py-2 rounded-md border text-sm font-serif transition-all duration-200 ${
            activeCategory === cat
              ? "bg-[#9E6752] text-[#FDF8F1] border-[#9E6752] shadow-sm"
              : "bg-[#FDF8F1] dark:bg-[#2A2A2A] text-[#9E6752] dark:text-[#D1BFA7] border-[#D1BFA7] dark:border-white/10 hover:border-[#9E6752]"
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

  const filteredBooks = useMemo(() => {
    return BOOKS.filter((book) => {
      const matchesCategory =
        activeCategory === "All" || book.category === activeCategory;
      const matchesSearch =
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-[#fdf8f1] dark:bg-[#121212] pt-32 pb-20 transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-6">
        <header className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2D2D2D] dark:text-[#F3F4F6]">
            Explore{" "}
            <span className="text-[#9E6752] dark:text-[#FED7A5]">
              Book Clubs
            </span>
          </h1>
          <p className="text-[#5A5A5A] dark:text-[#A0A0A0] mt-4 max-w-xl mx-auto italic">
            Find your next reading adventure. Join a club and start reading
            together.
          </p>
        </header>

        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="lg:w-1/4">
            <div className="lg:sticky lg:top-32 space-y-6">
              <SearchBar
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
              />
              <CategoryFilter
                activeCategory={activeCategory}
                setActiveCategory={setActiveCategory}
              />
            </div>
          </aside>

          <main className="lg:w-3/4">
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredBooks.map((book) => (
                  <ClubCard key={book.id} book={book} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center bg-white/50 dark:bg-[#1E1E1E]/50 rounded-3xl border-2 border-dashed border-[#9E6752]/20 dark:border-white/10">
                <BookX
                  size={48}
                  className="text-[#9E6752] dark:text-[#FED7A5] opacity-50 mb-4"
                />
                <h3 className="text-xl font-serif font-bold text-[#2D2D2D] dark:text-[#F3F4F6]">
                  No books found
                </h3>
                <p className="text-[#7A7A7A] dark:text-[#A0A0A0] mt-2">
                  Try adjusting your search or category.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("All");
                  }}
                  className="mt-6 text-[#9E6752] dark:text-[#FED7A5] font-bold underline"
                >
                  Clear all filters
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
