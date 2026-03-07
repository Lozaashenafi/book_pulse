"use client";

import React from "react";
import {
  Users,
  BookOpen,
  ArrowRight,
  MessageCircle,
  Quote,
  Paperclip,
  Bookmark,
} from "lucide-react";

const BookPulseHero = () => {
  return (
    <section className="relative min-h-screen bg-[#fdfcf8] dark:bg-[#1a1614] pt-40 pb-20 overflow-hidden flex flex-col items-center transition-colors duration-500">
      {/* Background Decorative Elements: Subtle Grid & Paper Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, #1a3f22, #1a3f22 1px, transparent 1px, transparent 40px)",
        }}
      />

      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        {/* Library Stamp Badge */}
        <div className="inline-block border-2 border-dashed border-tertiary/30 dark:border-[#d4a373]/30 p-2 rotate-[-2deg] mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="bg-[#f4ebd0] dark:bg-tertiary/20 px-4 py-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-tertiary dark:text-[#d4a373]">
              Approved Literary Sanctuary
            </span>
          </div>
        </div>

        {/* Big Bold Typography: Serif focus */}
        <h1 className="text-6xl md:text-8xl font-serif font-black text-tertiary dark:text-gray-100 leading-[0.95] tracking-tighter mb-8">
          The finest stories <br />
          are{" "}
          <span className="text-[#d4a373] italic relative inline-block">
            shared.
            <svg
              className="absolute -bottom-2 left-0 w-full h-4 text-[#d4a373]/30 -z-10"
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

        {/* Descriptive Text: Marginalia Style */}
        <p className="text-xl md:text-2xl text-[#8b5a2b] dark:text-gray-400 font-serif italic max-w-2xl mx-auto leading-relaxed mb-12">
          "Stop reading in a vacuum. BookPulse is a sanctuary for thoughtful
          readers to gather in digital circles and turn pages in unison."
        </p>

        {/* CTA Actions: Tactile Block Shadow Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
          <button className="group w-full sm:w-auto bg-tertiary dark:bg-[#d4a373] text-[#f4ebd0] dark:text-[#1a1614] px-10 py-5 rounded-none font-serif font-black italic text-lg shadow-[8px_8px_0px_#d4a373] dark:shadow-[8px_8px_0px_#1a3f22] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-3">
            <span>Start a Reading Circle</span>
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          <button className="w-full sm:w-auto bg-transparent border-2 border-tertiary/20 dark:border-white/10 text-tertiary dark:text-[#d4a373] px-10 py-5 rounded-none font-serif font-bold text-lg hover:bg-tertiary/5 transition-all">
            Browse Popular Clubs
          </button>
        </div>

        {/* Feature Grid: Index Card Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          <Paperclip
            className="absolute -top-12 left-0 text-gray-300 hidden md:block"
            size={40}
          />

          <FeatureCard
            icon={<MessageCircle size={22} />}
            title="Real-time Scribbles"
            desc="Discuss chapters as you finish them with instant reactions."
            rotate="rotate-1"
          />

          <FeatureCard
            icon={<Users size={22} />}
            title="Private Nooks"
            desc="Create intimate spaces for your best friends or colleagues."
            rotate="-rotate-1"
          />

          <FeatureCard
            icon={<BookOpen size={22} />}
            title="Collective Sync"
            desc="Track progress so no one falls behind or gets spoiled."
            rotate="rotate-1"
          />
        </div>

        {/* Footer Quote: Pinned Scrap Paper */}
        <div className="mt-24 relative inline-block group">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-red-600 rounded-full shadow-lg border-4 border-[#fdfcf8] z-20 group-hover:scale-110 transition-transform" />
          <div className="bg-[#f4ebd0] dark:bg-[#252525] p-8 border-2 border-[#d6c7a1] dark:border-[#3e2b22] shadow-xl max-w-lg relative rotate-1">
            <Quote size={24} className="text-[#d4a373] mb-4 mx-auto" />
            <p className="italic font-serif text-xl text-tertiary dark:text-gray-200 leading-relaxed">
              "A book is a gift you can open again and again—and talk about
              forever."
            </p>
            <div className="mt-4 font-mono text-[10px] uppercase tracking-widest text-[#8b5a2b]">
              — Library Archives
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative "Book Corners" */}
      <div className="absolute top-10 left-10 w-32 h-32 border-t-8 border-l-8 border-tertiary/5 dark:border-white/5 pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-32 h-32 border-b-8 border-r-8 border-[#d4a373]/10 pointer-events-none" />

      {/* Decorative Bookmark */}
      <div className="absolute top-0 right-20 w-12 h-40 bg-tertiary dark:bg-[#d4a373] shadow-md hidden lg:block animate-in slide-in-from-top-10 duration-1000">
        <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[20px] border-b-[#fdfcf8] dark:border-b-[#1a1614]" />
        <Bookmark
          className="mx-auto mt-4 text-[#f4ebd0] dark:text-[#1a1614]"
          size={20}
        />
      </div>
    </section>
  );
};

// Helper for the "Index Card" Features
const FeatureCard = ({
  icon,
  title,
  desc,
  rotate,
}: {
  icon: any;
  title: string;
  desc: string;
  rotate: string;
}) => (
  <div
    className={`bg-white dark:bg-[#252525] p-8 border-t-4 border-tertiary dark:border-[#d4a373] shadow-md ${rotate} hover:rotate-0 transition-transform duration-300 flex flex-col items-center text-center space-y-4`}
  >
    <div className="w-12 h-12 bg-[#f4ebd0] dark:bg-tertiary/20 flex items-center justify-center text-tertiary dark:text-[#d4a373]">
      {icon}
    </div>
    <h3 className="font-serif font-black text-lg text-tertiary dark:text-gray-200">
      {title}
    </h3>
    <p className="text-sm font-serif italic text-[#8b5a2b] dark:text-gray-400">
      {desc}
    </p>
    <div className="w-full border-t border-dashed border-[#d6c7a1] pt-2 mt-auto"></div>
  </div>
);

export default BookPulseHero;
