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
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getSidebarClubs } from "@/services/profile.service";

export default function SideBar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [clubsData, setClubsData] = useState<{ owned: any[]; all: any[] }>({
    owned: [],
    all: [],
  });

  const { user, profile, signOut } = useAuthStore();

  // Logic to detect if we are currently inside a specific club discussion
  // This ensures "Enter Circles" marks as active when in /clubs/[id]
  const isInsideClub =
    pathname.startsWith("/clubs/") && pathname !== "/clubs/myclubs";

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
      <div className="max-w-full mx-auto px-4 h-full">
        <div
          className={`flex h-full py-8 transition-all duration-300 ${isCollapsed ? "gap-4" : "gap-12"}`}
        >
          <aside
            className={`hidden lg:flex flex-col flex-shrink-0 h-full transition-all duration-300 ease-in-out ${
              isCollapsed ? "w-20" : "w-64"
            }`}
          >
            {/* HEADER AREA: Logo + Toggle Icon Beside It */}
            <div
              className={`flex items-center justify-between mb-10 ${isCollapsed ? "px-0 justify-center" : "px-4"}`}
            >
              <Link
                href="/"
                className="rotate-[-1deg] transition-transform hover:rotate-0"
              >
                <h1
                  className={`font-serif font-black text-[#1a3f22] dark:text-[#d4a373] border-b-4 border-[#1a3f22] ${isCollapsed ? "text-xl" : "text-3xl"}`}
                >
                  {isCollapsed ? "BP" : "BookPulse"}
                </h1>
                {isCollapsed ? (
                  ""
                ) : (
                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1 text-[#8b5a2b]">
                    {user ? "Welcome back, Reader" : "Chill & Read"}
                  </p>
                )}
              </Link>

              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="text-[#8b5a2b] hover:text-[#1a3f22] dark:hover:text-[#d4a373] transition-colors ml-2"
                >
                  <PanelLeftClose size={20} />
                </button>
              )}
            </div>

            {/* If collapsed, show the open icon alone at the top */}
            {isCollapsed && (
              <button
                onClick={() => setIsCollapsed(false)}
                className="mb-6 flex items-center justify-center text-[#8b5a2b] hover:text-[#d4a373]"
              >
                <PanelLeftOpen size={20} />
              </button>
            )}

            <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
              <NavItem
                href="/posts"
                icon={<Home size={20} />}
                label="Daily Scribbles"
                active={pathname === "/posts"}
                isCollapsed={isCollapsed}
              />
              <NavItem
                href="/explore"
                icon={<Search size={20} />}
                label="Deep Search"
                active={pathname === "/explore"}
                isCollapsed={isCollapsed}
              />

              <NavItem
                href="/clubs/myclubs"
                icon={<Users size={20} />}
                label="My Book Squads"
                badge={
                  !isCollapsed && clubsData.owned.length > 0
                    ? clubsData.owned.length.toString()
                    : undefined
                }
                active={pathname === "/clubs/myclubs"}
                isCollapsed={isCollapsed}
              />

              {/* ENTER CIRCLES: Now correctly marks as active when inside a club */}
              <div className="space-y-1">
                <button
                  onClick={() => !isCollapsed && setIsBrowseOpen(!isBrowseOpen)}
                  className={`w-full flex items-center transition-all mb-1 ${
                    isCollapsed
                      ? "justify-center py-3"
                      : "justify-between px-4 py-2"
                  } ${
                    isInsideClub
                      ? "bg-[#1a3f22] text-[#f4ebd0] dark:bg-[#d4a373] dark:text-[#1a1614] translate-x-2 shadow-[-4px_4px_0px_#132f19]"
                      : "text-[#5c4033] dark:text-gray-400 hover:bg-[#1a3f22]/5 border-b border-transparent hover:border-[#1a3f22]"
                  }`}
                  title={isCollapsed ? "Enter Circles" : ""}
                >
                  <div className="flex items-center space-x-3">
                    <MessageCircle
                      size={20}
                      className={isInsideClub ? "animate-pulse" : ""}
                    />
                    {!isCollapsed && (
                      <span className="font-serif font-bold text-sm tracking-tight">
                        Enter Circles
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-300 ${isBrowseOpen ? "rotate-180" : ""}`}
                    />
                  )}
                </button>

                {/* Dropdown items */}
                {isBrowseOpen && !isCollapsed && (
                  <div className="pl-6 space-y-1 animate-in slide-in-from-top-2 duration-300">
                    {clubsData.all.map((club) => {
                      const isCurrentClub = pathname === `/clubs/${club.id}`;
                      return (
                        <Link
                          key={club.id}
                          href={`/clubs/${club.id}`}
                          className={`block px-4 py-1.5 text-sm font-bold font-serif italic border-l transition-all ${
                            isCurrentClub
                              ? "text-[#1a3f22] border-[#1a3f22]"
                              : "text-[#8b5a2b] border-[#1a3f22]/20 hover:border-[#1a3f22] hover:text-[#1a3f22]"
                          }`}
                        >
                          # {club.name}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

              <NavItem
                href="/note"
                icon={<PenTool size={20} />}
                label="Brain Dumps"
                active={pathname === "/note"}
                isCollapsed={isCollapsed}
              />
              <NavItem
                href="/notices"
                icon={<Bell size={20} />}
                label="The Buzz"
                active={pathname === "/notices"}
                isCollapsed={isCollapsed}
              />
              <NavItem
                href="/settings"
                icon={<Settings size={20} />}
                label="The Setup"
                active={pathname === "/settings"}
                isCollapsed={isCollapsed}
              />
            </nav>

            {/* Profile Section */}
            {user ? (
              <div
                className={`mt-auto transition-all duration-300 bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] dark:border-[#1a3f22] shadow-[5px_5px_0px_#bcab79] rotate-1 ${isCollapsed ? "p-2 mx-auto" : "p-4"}`}
              >
                <div className="flex items-center gap-3">
                  <Link
                    href="/profile"
                    className="w-10 h-10 bg-[#1a3f22] dark:bg-[#d4a373] text-white flex items-center justify-center overflow-hidden shrink-0"
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

                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[#5c4033] dark:text-gray-100 truncate">
                        {profile?.name || "Reader"}
                      </p>
                      <button
                        onClick={handleSignOut}
                        className="text-[#8b5a2b] hover:text-red-600 dark:text-[#d4a373] text-[10px] font-mono font-bold uppercase"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className={`mt-auto bg-[#1a3f22] text-[#f4ebd0] text-center font-serif italic hover:bg-[#132f19] transition-all rotate-1 flex items-center justify-center ${isCollapsed ? "w-12 h-12 mx-auto" : "p-4"}`}
              >
                {isCollapsed ? <LogOut size={20} /> : "Join the Circle"}
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

const NavItem = ({
  icon,
  label,
  active = false,
  badge,
  href,
  isCollapsed,
}: any) => (
  <Link href={href || "#"}>
    <div
      title={isCollapsed ? label : ""}
      className={`flex items-center transition-all mb-1 ${
        isCollapsed ? "justify-center py-3" : "justify-between px-4 py-2"
      } ${
        active
          ? "bg-[#1a3f22] text-[#f4ebd0] dark:bg-[#d4a373] dark:text-[#1a1614] translate-x-2 shadow-[-4px_4px_0px_#132f19]"
          : "text-[#5c4033] dark:text-gray-400 hover:bg-[#1a3f22]/5 dark:hover:bg-white/5 border-b border-transparent hover:border-[#1a3f22]"
      }`}
    >
      <div className="flex items-center space-x-3">
        <span className={active ? "animate-pulse" : ""}>{icon}</span>
        {!isCollapsed && (
          <span className="font-serif font-bold text-sm tracking-tight whitespace-nowrap">
            {label}
          </span>
        )}
      </div>
      {badge && !isCollapsed && (
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${active ? "bg-white text-[#1a3f22]" : "bg-[#1a3f22] text-white"}`}
        >
          {badge}
        </span>
      )}
    </div>
  </Link>
);
