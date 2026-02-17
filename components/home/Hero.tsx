"use client";

import React from "react";
import {
  Users,
  BookOpen,
  ArrowRight,
  Sparkles,
  MessageCircle,
  Quote,
} from "lucide-react";

const BookPulseHero = () => {
  return (
    <section className="relative min-h-screen bg-soft-white dark:bg-[#121212] pt-40 pb-20 overflow-hidden flex flex-col items-center transition-colors duration-500">
      {/* Subtle Background Texture - Top and Bottom */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-secondary/20 dark:from-secondary/5 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-64 bg-gradient-to-t from-primary/5 dark:from-primary/10 to-transparent" />

      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        {/* Floating Badge */}
        <div className="inline-flex items-center space-x-2 bg-green-light dark:bg-green-900/20 shadow-sm px-4 py-1.5 rounded-full mb-8 animate-fade-in border border-transparent dark:border-green-800/30">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-green-dark2 dark:text-green-300">
            A New Way to Experience Literature
          </span>
        </div>

        {/* Big Bold Typography */}
        <h1 className="text-6xl md:text-8xl font-serif font-bold text-dark-secondary dark:text-gray-100 leading-[1.05] tracking-tight mb-8">
          The finest stories are <br />
          <span className="text-primary dark:text-[#d4a373] italic relative">
            shared.
            <svg
              className="absolute -bottom-2 left-0 w-full h-3 text-green-light dark:text-green-300/20 -z-10"
              viewBox="0 0 100 10"
              preserveAspectRatio="none"
            >
              <path
                d="M0 5 Q 25 0 50 5 T 100 5"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </h1>

        {/* Centered Descriptive Text */}
        <p className="text-xl md:text-2xl text-[#5a5a5a] dark:text-gray-400 font-light max-w-2xl mx-auto leading-relaxed mb-12">
          Stop reading in a vacuum. BookPulse is a sanctuary for thoughtful
          readers to gather in digital circles and turn pages in unison.
        </p>

        {/* Centered Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-20">
          <button className="group w-full sm:w-auto bg-primary dark:bg-[#d4a373] text-white dark:text-[#1a1a1a] px-10 py-5 rounded-full font-bold text-lg shadow-xl shadow-primary/20 hover:bg-[#8a5a48] dark:hover:bg-[#e9c46a] hover:-translate-y-1 transition-all flex items-center justify-center space-x-3">
            <span>Start a Reading Circle</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
          <button className="w-full sm:w-auto bg-transparent border-2 border-primary/20 dark:border-white/10 text-primary dark:text-[#d4a373] px-10 py-5 rounded-full font-bold text-lg hover:bg-white dark:hover:bg-white/5 transition-all">
            Browse Popular Clubs
          </button>
        </div>

        {/* Minimalist Feature Grid (Text Based) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-primary/10 dark:border-white/5">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-secondary/30 dark:bg-[#d4a373]/10 flex items-center justify-center text-primary dark:text-[#d4a373]">
              <MessageCircle size={22} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2d2d2d] dark:text-gray-200">
              Real-time Chats
            </h3>
            <p className="text-sm text-[#7a7a7a] dark:text-gray-500">
              Discuss chapters as you finish them with instant reactions.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#1a3f22]/10 dark:bg-green-500/10 flex items-center justify-center text-[#1a3f22] dark:text-green-400">
              <Users size={22} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2d2d2d] dark:text-gray-200">
              Private Nooks
            </h3>
            <p className="text-sm text-[#7a7a7a] dark:text-gray-500">
              Create intimate spaces for your best friends or colleagues.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 dark:bg-[#d4a373]/10 flex items-center justify-center text-primary dark:text-[#d4a373]">
              <BookOpen size={22} />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#2d2d2d] dark:text-gray-200">
              Sync Reading
            </h3>
            <p className="text-sm text-[#7a7a7a] dark:text-gray-500">
              Track collective progress so no one falls behind or gets spoiled.
            </p>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mt-16 flex flex-col items-center opacity-40 hover:opacity-100 transition-opacity duration-700">
          <Quote size={30} className="text-primary dark:text-[#d4a373] mb-4" />
          <p className="italic font-serif text-lg text-[#2d2d2d] dark:text-gray-300">
            "A book is a gift you can open again and again—and talk about
            forever."
          </p>
        </div>
      </div>

      {/* Background Decorative "Paper" Corners */}
      <div className="absolute top-10 left-10 w-40 h-40 border-t-2 border-l-2 border-primary/5 dark:border-white/5 rounded-tl-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-40 h-40 border-b-2 border-r-2 border-primary/5 dark:border-white/5 rounded-br-3xl pointer-events-none" />
    </section>
  );
};

export default BookPulseHero;
