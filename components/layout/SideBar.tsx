"use client";

import React from "react";
import { Home, Search, BookOpen, Users, Settings } from "lucide-react";
import Link from "next/link"; // Use Next.js links for navigation

export default function SideBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-hidden bg-[#eaddcf] dark:bg-[#1a1614] transition-colors duration-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex gap-12 py-8 h-full">
          {/* --- LEFT SIDEBAR: FIXED --- */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-full">
            <div className="mb-10 px-4 rotate-[-1deg]">
              <h1 className="text-3xl font-serif font-black text-[#5c4033] dark:text-[#d4a373] border-b-4 border-[#5c4033]">
                BookPulse
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1 text-[#8b5a2b]">
                Established 2024
              </p>
            </div>

            <nav className="space-y-4 flex-1">
              <NavItem
                href="/"
                icon={<Home size={20} />}
                label="Reading Room"
                active
              />
              <NavItem
                href="/search"
                icon={<Search size={20} />}
                label="The Archives"
              />
              <NavItem
                href="/circles"
                icon={<Users size={20} />}
                label="Literary Circles"
                badge="3"
              />
              <NavItem
                href="/shelf"
                icon={<BookOpen size={20} />}
                label="Personal Shelf"
              />
              <NavItem
                href="/settings"
                icon={<Settings size={20} />}
                label="Ink & Quill"
              />
            </nav>

            {/* Profile "Library Card" */}
            <div className="mt-auto p-4 bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] shadow-[5px_5px_0px_#bcab79] rotate-1">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#5c4033] text-white flex items-center justify-center font-serif italic text-xl">
                  A
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono uppercase text-[#8b5a2b]">
                    Reader No. 402
                  </p>
                  <p className="text-sm font-bold text-[#5c4033] dark:text-gray-100 truncate">
                    Alex Reader
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* --- MAIN CONTENT AREA: SCROLLABLE --- */}
          {/* This is where your page content (Middle Column + Right Sidebar) will go */}
          <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>

      {/* Adding the custom scrollbar style back in */}

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(92, 64, 51, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(92, 64, 51, 0.4);
        }
      `}</style>
    </div>
  );
}

// --- HELPER COMPONENT ---
const NavItem = ({ icon, label, active = false, badge, href }: any) => (
  <Link href={href || "#"}>
    <div
      className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-all mb-2 ${
        active
          ? "bg-[#5c4033] text-[#f4ebd0] translate-x-2 shadow-[-4px_4px_0px_#3e2b22]"
          : "text-[#5c4033] hover:bg-[#5c4033]/5 border-b border-transparent hover:border-[#5c4033]"
      }`}
    >
      <div className="flex items-center space-x-3">
        {icon}
        <span className="font-serif font-bold text-sm">{label}</span>
      </div>
      {badge && (
        <span className="text-[10px] bg-red-700 text-white px-1.5 py-0.5 rounded-full font-mono">
          {badge}
        </span>
      )}
    </div>
  </Link>
);
