"use client";

import React, { useState } from "react";
import {
  Book,
  Calendar,
  Users,
  Lock,
  Globe,
  ArrowLeft,
  Plus,
  Info,
  CheckCircle2,
} from "lucide-react";

const CreateClubPage = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    book_id: "1", // Dummy selected book
    visibility: "PUBLIC",
    start_date: "",
    end_date: "",
  });

  // Dummy Books Data for the selector
  const dummyBooks = [
    {
      id: "1",
      title: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      cover:
        "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=200",
    },
    {
      id: "2",
      title: "Dune",
      author: "Frank Herbert",
      cover:
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=200",
    },
    {
      id: "3",
      title: "Circe",
      author: "Madeline Miller",
      cover:
        "https://images.unsplash.com/photo-1629196911514-cfd8d628ba26?auto=format&fit=crop&q=80&w=200",
    },
  ];

  const selectedBook = dummyBooks.find((b) => b.id === formData.book_id);

  return (
    <div className="min-h-screen bg-soft-white dark:bg-[#121212] transition-colors duration-500">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <button className="flex items-center space-x-2 text-dark-secondary/60 dark:text-gray-400 hover:text-primary transition-colors">
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Dashboard</span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-12 gap-16">
        {/* Left Column: Form */}
        <div className="lg:col-span-7">
          <header className="mb-10">
            <div className="inline-flex items-center space-x-2 bg-primary/10 dark:bg-[#d4a373]/10 px-3 py-1 rounded-md mb-4">
              <Plus size={14} className="text-primary dark:text-[#d4a373]" />
              <span className="text-xs font-bold uppercase tracking-widest text-primary dark:text-[#d4a373]">
                Found a Circle
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-dark-secondary dark:text-gray-100">
              Start your next <span className="italic">chapter.</span>
            </h1>
          </header>

          <form className="space-y-8">
            {/* Club Name */}
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-wider text-dark-secondary/50 dark:text-gray-500">
                Club Identity
              </label>
              <input
                type="text"
                placeholder="e.g., The Midnight Philosophers"
                className="w-full bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl px-6 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Book Selection */}
            <div className="space-y-4">
              <label className="text-sm font-bold uppercase tracking-wider text-dark-secondary/50 dark:text-gray-500">
                Select the Tome
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {dummyBooks.map((book) => (
                  <div
                    key={book.id}
                    onClick={() =>
                      setFormData({ ...formData, book_id: book.id })
                    }
                    className={`cursor-pointer relative p-4 rounded-2xl border-2 transition-all ${
                      formData.book_id === book.id
                        ? "border-primary bg-primary/5 dark:border-[#d4a373] dark:bg-[#d4a373]/5"
                        : "border-transparent bg-white dark:bg-white/5 hover:border-primary/20"
                    }`}
                  >
                    {formData.book_id === book.id && (
                      <CheckCircle2
                        className="absolute top-2 right-2 text-primary dark:text-[#d4a373]"
                        size={18}
                      />
                    )}
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-32 object-cover rounded-lg mb-3 shadow-md"
                    />
                    <p className="font-bold text-sm dark:text-gray-200 truncate">
                      {book.title}
                    </p>
                    <p className="text-xs text-gray-500">{book.author}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-dark-secondary/50 dark:text-gray-500">
                  Journey Starts
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    className="w-full bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider text-dark-secondary/50 dark:text-gray-500">
                  Journey Ends
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="date"
                    className="w-full bg-white dark:bg-white/5 border border-primary/10 dark:border-white/10 rounded-2xl pl-12 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:text-white"
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Visibility Toggle */}
            <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, visibility: "PUBLIC" })
                }
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${formData.visibility === "PUBLIC" ? "bg-white dark:bg-white/10 shadow-sm text-primary dark:text-[#d4a373]" : "text-gray-500"}`}
              >
                <Globe size={18} />
                <span className="font-bold">Public</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  setFormData({ ...formData, visibility: "PRIVATE" })
                }
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl transition-all ${formData.visibility === "PRIVATE" ? "bg-white dark:bg-white/10 shadow-sm text-primary dark:text-[#d4a373]" : "text-gray-500"}`}
              >
                <Lock size={18} />
                <span className="font-bold">Private</span>
              </button>
            </div>

            <button className="w-full bg-primary dark:bg-[#d4a373] text-white dark:text-[#1a1a1a] py-6 rounded-2xl font-bold text-xl shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all">
              Create My Circle
            </button>
          </form>
        </div>

        {/* Right Column: Live Preview */}
        <div className="lg:col-span-5 hidden lg:block">
          <div className="sticky top-10">
            <div className="bg-white dark:bg-[#1e1e1e] rounded-[2rem] p-8 shadow-2xl border border-primary/5 dark:border-white/5 relative overflow-hidden">
              {/* Decorative flourish */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 dark:bg-[#d4a373]/5 rounded-bl-[100px]" />

              <h4 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-6 flex items-center">
                <Info size={14} className="mr-2" /> Live Preview
              </h4>

              <div className="flex gap-6 mb-8">
                <div className="w-32 h-44 bg-gray-200 dark:bg-white/10 rounded-lg overflow-hidden shadow-lg shrink-0">
                  {selectedBook && (
                    <img
                      src={selectedBook.cover}
                      className="w-full h-full object-cover"
                      alt="Preview"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center">
                  <h2 className="text-2xl font-serif font-bold text-dark-secondary dark:text-white mb-1">
                    {formData.name || "Club Name"}
                  </h2>
                  <p className="text-primary dark:text-[#d4a373] font-medium mb-3">
                    Reading: {selectedBook?.title}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 space-x-4">
                    <span className="flex items-center">
                      <Users size={14} className="mr-1" /> 1 Member
                    </span>
                    <span className="flex items-center capitalize">
                      <Globe size={14} className="mr-1" />{" "}
                      {formData.visibility.toLowerCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-100 dark:border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 italic">Timeline</span>
                  <span className="font-bold dark:text-gray-300">
                    {formData.start_date || "Start"} —{" "}
                    {formData.end_date || "End"}
                  </span>
                </div>
                {/* Progress bar dummy */}
                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/30 dark:bg-[#d4a373]/30 w-1/3" />
                </div>
              </div>

              <div className="mt-8 p-4 bg-secondary/20 dark:bg-green-900/10 rounded-xl border border-secondary/20">
                <p className="text-sm text-green-dark2 dark:text-green-300 leading-relaxed">
                  "The secret of success is to start." This circle will be
                  visible to everyone on BookPulse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateClubPage;
