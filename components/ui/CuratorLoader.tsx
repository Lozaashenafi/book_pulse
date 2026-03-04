"use client";

import React from "react";
import { BookOpen } from "lucide-react";

const CuratorLoader = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative w-20 h-20">
        {/* The Outer "Library Stamp" Ring */}
        <div className="absolute inset-0 border-4 border-dashed border-[#d4a373] rounded-full animate-[spin_8s_linear_infinite] opacity-30"></div>

        {/* The Inner Rotating Ring */}
        <div className="absolute inset-2 border-2 border-[#1a3f22] border-t-transparent rounded-full animate-spin"></div>

        {/* The Pulsing Book Icon (The Pulse of the story) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="animate-bounce">
            <BookOpen size={32} className="text-[#1a3f22] fill-[#1a3f22]/5" />
          </div>
        </div>
      </div>

      {/* Narrative Loading Text */}
      <div className="flex flex-col items-center">
        <span className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#1a3f22] animate-pulse">
          Consulting Archives
        </span>
        <div className="flex gap-1 mt-1">
          <div className="w-1 h-1 bg-[#d4a373] rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="w-1 h-1 bg-[#d4a373] rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="w-1 h-1 bg-[#d4a373] rounded-full animate-bounce"></div>
        </div>
      </div>
    </div>
  );
};

export default CuratorLoader;
