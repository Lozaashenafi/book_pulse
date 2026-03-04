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
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getSidebarClubs } from "@/services/profile.service";

export default function SideBar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [clubsData, setClubsData] = useState<{ owned: any[]; all: any[] }>({
    owned: [],
    all: [],
  });

  const { user, profile, signOut } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      getSidebarClubs(user.id).then(setClubsData);
    }
  }, [user]);

  if (!mounted) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eaddcf] dark:bg-[#1a1614] transition-colors duration-500">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
        <div className="flex gap-12 py-8 h-full">
          <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 h-full">
            <Link href="/" className="group cursor-pointer">
              <div className="mb-10 px-4 rotate-[-1deg] transition-transform group-hover:rotate-0">
                <h1 className="text-3xl font-serif font-black text-tertiary dark:text-[#d4a373] border-b-4 border-tertiary">
                  BookPulse
                </h1>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1 text-[#8b5a2b]">
                  {user ? "Welcome back, Reader" : "Chill & Read"}
                </p>
              </div>
            </Link>

            <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
              <NavItem
                href="/posts"
                icon={<Home size={18} />}
                label="Daily Scribbles"
                active={pathname === "/posts"}
              />
              <NavItem
                href="/explore"
                icon={<Search size={18} />}
                label="Deep Search"
                active={pathname === "/explore"}
              />

              {/* 1. MY BOOK SQUADS (Owned Only) */}
              <NavItem
                href="/clubs/myclubs"
                icon={<Users size={18} />}
                label="My Book Squads"
                badge={
                  clubsData.owned.length > 0
                    ? clubsData.owned.length.toString()
                    : undefined
                }
                active={pathname === "/clubs/myclubs"}
              />

              {/* 2. BROWSE SQUADS (Dropdown for All Joined Clubs) */}
              <div className="space-y-1">
                <button
                  onClick={() => setIsBrowseOpen(!isBrowseOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2 cursor-pointer transition-all hover:bg-tertiary/5 dark:hover:bg-white/5 border-b border-transparent hover:border-tertiary group`}
                >
                  <div className="flex items-center space-x-3 text-[#5c4033] dark:text-gray-400 group-hover:text-tertiary dark:group-hover:text-[#d4a373]">
                    <MessageCircle size={18} />
                    <span className="font-serif font-bold text-sm tracking-tight">
                      Enter Circles
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform duration-300 ${isBrowseOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isBrowseOpen && (
                  <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {clubsData.all.length > 0 ? (
                      clubsData.all.map((club) => (
                        <Link
                          key={club.id}
                          href={`/club/${club.id}/chat`} // Updated to go to discussion/chat
                          className="block px-4 py-1.5 text-sm font-bold font-serif italic text-[#8b5a2b] hover:text-tertiary dark:hover:text-[#d4a373] border-l border-tertiary/20 hover:border-tertiary transition-all"
                        >
                          # {club.name}
                        </Link>
                      ))
                    ) : (
                      <p className="px-4 py-2 text-[10px] italic text-gray-400">
                        No circles joined yet.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <NavItem
                href="/note"
                icon={<PenTool size={18} />}
                label="Brain Dumps"
                active={pathname === "/note"}
              />
              <NavItem
                href="/notices"
                icon={<Bell size={18} />}
                label="The Buzz"
                active={pathname === "/notices"}
              />
              <NavItem
                href="/settings"
                icon={<Settings size={18} />}
                label="The Setup"
                active={pathname === "/settings"}
              />
            </nav>

            {/* Profile Card */}
            {user ? (
              <div className="mt-auto p-4 bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] dark:border-tertiary shadow-[5px_5px_0px_#bcab79] rotate-1">
                <div className="flex items-center space-x-3">
                  <Link
                    href="/profile"
                    className="w-10 h-10 bg-tertiary dark:bg-[#d4a373] text-white flex items-center justify-center overflow-hidden"
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
                    <p className="text-[9px] font-mono uppercase text-tertiary dark:text-[#d4a373]/70">
                      ID: {profile?.id?.slice(0, 5) || "402"}
                    </p>
                    <p className="text-sm font-bold text-[#5c4033] dark:text-gray-100 truncate">
                      {profile?.name || "Reader"}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-[#8b5a2b] hover:text-red-600 dark:text-[#d4a373] transition-colors"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="mt-auto p-4 bg-tertiary text-[#f4ebd0] text-center font-serif italic hover:bg-[#132f19] transition-all rotate-1"
              >
                Join the Circle
              </Link>
            )}
          </aside>

          <main className="flex-1 h-full overflow-y-auto custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

const NavItem = ({ icon, label, active = false, badge, href }: any) => (
  <Link href={href || "#"}>
    <div
      className={`flex items-center justify-between px-4 py-2 cursor-pointer transition-all mb-1 ${
        active
          ? "bg-tertiary text-[#f4ebd0] dark:bg-[#d4a373] dark:text-[#1a1614] translate-x-2 shadow-[-4px_4px_0px_#132f19]"
          : "text-[#5c4033] dark:text-gray-400 hover:bg-tertiary/5 dark:hover:bg-white/5 border-b border-transparent hover:border-tertiary"
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className={active ? "animate-pulse" : ""}>{icon}</span>
        <span className="font-serif font-bold text-sm tracking-tight">
          {label}
        </span>
      </div>
      {badge && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${active ? "bg-white text-tertiary" : "bg-tertiary text-white"}`}
        >
          {badge}
        </span>
      )}
    </div>
  </Link>
);
