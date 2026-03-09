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
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getSidebarClubs } from "@/services/profile.service";

export default function SideBar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);
  const [clubsData, setClubsData] = useState<{ owned: any[]; all: any[] }>({
    owned: [],
    all: [],
  });

  const { user, profile, signOut } = useAuthStore();

  const isInsideClub =
    pathname.startsWith("/clubs/") && pathname !== "/clubs/myclubs";

  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      getSidebarClubs(user.id).then(setClubsData);
    }
  }, [user]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eaddcf] dark:bg-[#1a1614] transition-colors duration-500 flex flex-col lg:flex-row">
      {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#eaddcf] dark:bg-[#1a1614] border-b border-tertiary/10 z-50">
        <Link href="/" className="rotate-[-1deg]">
          <h1 className="font-serif font-black text-tertiary dark:text-[#d4a373] text-2xl border-b-2 border-tertiary">
            BookPulse
          </h1>
        </Link>
        <button
          onClick={() => setIsMobileOpen(true)}
          className="p-2 text-tertiary dark:text-[#d4a373]"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* --- MOBILE BACKDROP --- */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[60] lg:hidden backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* --- SIDEBAR ASIDE --- */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-[70] transition-transform duration-300 ease-in-out bg-[#eaddcf] dark:bg-[#1a1614]
          lg:static lg:translate-x-0 lg:flex lg:flex-col lg:flex-shrink-0 h-full py-8 px-4
          ${isMobileOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
          ${isCollapsed ? "lg:w-20" : "lg:w-64"}
        `}
      >
        {/* Mobile Close Button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden absolute top-6 right-6 text-tertiary"
        >
          <X size={24} />
        </button>

        {/* LOGO AREA */}
        <div
          className={`flex items-center justify-between mb-10 ${isCollapsed ? "px-0 justify-center" : "px-4"}`}
        >
          <Link
            href="/"
            className="rotate-[-1deg] transition-transform hover:rotate-0"
          >
            <h1
              className={`font-serif font-black text-tertiary dark:text-[#d4a373] border-b-4 border-tertiary ${isCollapsed ? "text-xl" : "text-3xl"}`}
            >
              {isCollapsed ? "BP" : "BookPulse"}
            </h1>
            {!isCollapsed && (
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold mt-1 text-[#8b5a2b]">
                {user ? "Welcome back, Reader" : "Chill & Read"}
              </p>
            )}
          </Link>

          {/* Desktop Collapse Toggle */}
          {!isCollapsed && (
            <button
              onClick={() => setIsCollapsed(true)}
              className="hidden lg:block text-[#8b5a2b] hover:text-tertiary dark:hover:text-[#d4a373] transition-colors ml-2"
            >
              <PanelLeftClose size={20} />
            </button>
          )}
        </div>

        {/* Desktop Expand Toggle (Shown only when collapsed) */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="hidden lg:flex mb-6 items-center justify-center text-[#8b5a2b] hover:text-[#d4a373]"
          >
            <PanelLeftOpen size={20} />
          </button>
        )}

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
          <NavItem
            href="/posts"
            icon={<Home size={20} />}
            label="Daily Scribbles"
            active={pathname === "/posts"}
            isCollapsed={isCollapsed}
          />
          <NavItem
            href="/search"
            icon={<Search size={20} />}
            label="Deep Search"
            active={pathname === "/search"}
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

          <div className="space-y-1">
            <button
              onClick={() => setIsBrowseOpen(!isBrowseOpen)}
              className={`w-full flex items-center transition-all mb-1 ${
                isCollapsed
                  ? "justify-center py-3"
                  : "justify-between px-4 py-2"
              } ${
                isInsideClub
                  ? "bg-tertiary text-[#f4ebd0] dark:bg-[#d4a373] dark:text-[#1a1614] translate-x-2 shadow-[-4px_4px_0px_#132f19]"
                  : "text-[#5c4033] dark:text-gray-400 hover:bg-tertiary/5 border-b border-transparent hover:border-tertiary"
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
                          ? "text-tertiary border-tertiary"
                          : "text-[#8b5a2b] border-tertiary/20 hover:border-tertiary hover:text-tertiary"
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

        {/* PROFILE SECTION */}
        {user ? (
          <div
            className={`mt-auto transition-all duration-300 bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] dark:border-tertiary shadow-[5px_5px_0px_#bcab79] rotate-1 ${isCollapsed ? "p-2 mx-auto" : "p-4"}`}
          >
            <div className="flex items-center gap-3">
              <Link
                href="/profile"
                className="w-10 h-10 bg-tertiary dark:bg-[#d4a373] text-white flex items-center justify-center overflow-hidden shrink-0"
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
            className={`mt-auto bg-tertiary text-[#f4ebd0] text-center font-serif italic hover:bg-[#132f19] transition-all rotate-1 flex items-center justify-center ${isCollapsed ? "w-12 h-12 mx-auto" : "p-4"}`}
          >
            {isCollapsed ? <LogOut size={20} /> : "Join the Circle"}
          </Link>
        )}
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 h-full overflow-y-auto custom-scrollbar px-4 lg:px-8 py-8 lg:py-0">
        <div
          className={`${isCollapsed ? "lg:ml-0" : ""} transition-all duration-300 h-full`}
        >
          {children}
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(26, 63, 34, 0.2);
          border-radius: 10px;
        }
      `}</style>
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
          ? "bg-tertiary text-[#f4ebd0] dark:bg-[#d4a373] dark:text-[#1a1614] translate-x-2 shadow-[-4px_4px_0px_#132f19]"
          : "text-[#5c4033] dark:text-gray-400 hover:bg-tertiary/5 dark:hover:bg-white/5 border-b border-transparent hover:border-tertiary"
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
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${active ? "bg-white text-tertiary" : "bg-tertiary text-white"}`}
        >
          {badge}
        </span>
      )}
    </div>
  </Link>
);
