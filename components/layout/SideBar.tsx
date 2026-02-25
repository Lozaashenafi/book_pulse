"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  Search,
  Users,
  Settings,
  Bell,
  PenTool,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

export default function SideBar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // Auth Store
  const { user, profile, signOut } = useAuthStore();

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eaddcf] dark:bg-[#1a1614] transition-colors duration-500">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex gap-12 py-8 h-full">
          {/* --- LEFT SIDEBAR: FIXED --- */}
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-full">
            <div className="mb-10 px-4 rotate-[-1deg]">
              <h1 className="text-3xl font-serif font-black text-[#5c4033] dark:text-[#d4a373] border-b-4 border-[#5c4033]">
                BookPulse
              </h1>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1 text-[#8b5a2b]">
                {user ? "Welcome back, Reader" : "Chill & Read"}
              </p>
            </div>

            <nav className="space-y-4 flex-1">
              <NavItem
                href="/posts"
                icon={<Home size={20} />}
                label="Daily Scribbles"
                active={pathname === "/posts"}
              />
              <NavItem
                href="/explore"
                icon={<Search size={20} />}
                label="Deep Search"
                active={pathname === "/explore"}
              />
              <NavItem
                href="/clubs/myclubs"
                icon={<Users size={20} />}
                label="My Book Squads"
                badge="3"
                active={pathname === "/clubs/myclubs"}
              />
              <NavItem
                href="/clubs"
                icon={<Users size={20} />}
                label="Browse Squads"
                active={pathname === "/clubs"}
              />
              <NavItem
                href="/my-notes"
                icon={<PenTool size={20} />}
                label="Brain Dumps"
                active={pathname === "/my-notes"}
              />
              <NavItem
                href="/notices"
                icon={<Bell size={20} />}
                label="The Buzz"
                active={pathname === "/notices"}
              />
              <NavItem
                href="/settings"
                icon={<Settings size={20} />}
                label="The Setup"
                active={pathname === "/settings"}
              />
            </nav>

            {/* Profile "Library Card" */}
            {user ? (
              <div className="mt-auto p-4 bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] dark:border-[#5c4033] shadow-[5px_5px_0px_#bcab79] dark:shadow-[5px_5px_0px_#1a1614] rotate-1">
                <div className="flex items-center space-x-3">
                  <Link
                    href="/profile"
                    className="w-10 h-10 bg-[#5c4033] dark:bg-[#d4a373] text-white flex items-center justify-center overflow-hidden"
                  >
                    {profile?.image ? (
                      <img
                        src={profile.image}
                        alt="Avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-serif italic text-xl">
                        {profile?.name?.charAt(0) || "R"}
                      </span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <p className="text-[9px] font-mono uppercase text-[#8b5a2b] dark:text-[#d4a373]/70">
                      ID: {profile?.id?.slice(0, 5) || "402"}
                    </p>
                    <p className="text-sm font-bold text-[#5c4033] dark:text-gray-100 truncate">
                      {profile?.name || "Reader"}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-[#8b5a2b] hover:text-red-600 dark:text-[#d4a373] dark:hover:text-red-400 transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="mt-auto p-4 bg-[#5c4033] text-[#f4ebd0] text-center font-serif italic hover:bg-[#3e2b22] transition-all rotate-1"
              >
                Join the Circle
              </Link>
            )}
          </aside>

          {/* --- SCROLLABLE MAIN CONTENT --- */}
          <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>

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
          ? "bg-[#5c4033] text-[#f4ebd0] dark:bg-[#d4a373] dark:text-[#1a1614] translate-x-2 shadow-[-4px_4px_0px_#3e2b22] dark:shadow-[-4px_4px_0px_#8b5a2b]"
          : "text-[#5c4033] dark:text-gray-400 hover:bg-[#5c4033]/5 dark:hover:bg-white/5 border-b border-transparent hover:border-[#5c4033] dark:hover:border-[#d4a373]"
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className={active ? "animate-pulse" : ""}>{icon}</span>
        <span
          className={`font-serif font-bold text-sm tracking-tight ${active ? "" : ""}`}
        >
          {label}
        </span>
      </div>
      {badge && (
        <span className="text-[10px] bg-red-700 text-white px-1.5 py-0.5 rounded-full font-mono">
          {badge}
        </span>
      )}
    </div>
  </Link>
);
