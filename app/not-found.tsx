"use client";

import React from "react";
import Link from "next/link";
import { BookX, MoveLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      {/* Visual Element: The "Missing Book" */}
      <div className="relative mb-8">
        <div className="w-48 h-64 bg-[#d6c7a1] dark:bg-[#2c2420] border-4 border-primary-dark shadow-[12px_12px_0px_primary-dark] flex flex-col items-center justify-center p-6 rotate-[-2deg]">
          <BookX
            size={80}
            className="text-primary-dark dark:text-[#d4a373] mb-4 opacity-40"
          />
          <div className="h-2 w-full bg-primary-dark/20 mb-2" />
          <div className="h-2 w-3/4 bg-primary-dark/20 mb-2" />
          <div className="h-2 w-1/2 bg-primary-dark/20" />
        </div>

        {/* Error Code "Stamp" */}
        <div className="absolute -bottom-4 -right-8 bg-red-700 text-white font-mono px-4 py-2 rotate-12 shadow-lg border-2 border-red-900">
          DELETED: 404
        </div>
      </div>

      {/* Text Content */}
      <h2 className="text-5xl font-serif font-black text-primary-dark dark:text-[#d4a373] mb-4 uppercase tracking-tighter">
        The Lost Chapter
      </h2>

      <div className="max-w-md bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-primary-dark p-6 mb-8 shadow-[6px_6px_0px_#bcab79] dark:shadow-none">
        <p className="font-serif italic text-lg text-primary-dark dark:text-gray-300">
          "It appears the page you are looking for has been checked out
          indefinitely or never written at all."
        </p>
      </div>

      {/* Action Button */}
      <Link href="/posts">
        <button className="group flex items-center gap-3 px-8 py-4 bg-primary-dark text-[#f4ebd0] font-serif font-bold text-lg hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-[8px_8px_0px_#8b5a2b] transition-all duration-200 border-2 border-transparent">
          <MoveLeft className="group-hover:-translate-x-2 transition-transform duration-300" />
          Return to Archives
        </button>
      </Link>

      {/* Aesthetic Footer Detail */}
      <p className="mt-12 font-mono text-[10px] uppercase tracking-[0.3em] text-[#8b5a2b] opacity-60">
        Reference Error: Object_Not_Found // Library_Section_Missing
      </p>
    </div>
  );
}
