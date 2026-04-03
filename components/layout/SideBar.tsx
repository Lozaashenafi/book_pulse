
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
  Sun,
  Moon,
  BookMarked,
  Calendar,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getSidebarClubs } from "@/services/profile.service";
import { getUserNotifications } from "@/services/notification.service";
import { useTheme } from "next-themes";

// LIST OF PROTECTED ROUTES
const PROTECTED_ROUTES = [
  "/clubs",
  "/schedule",
  "/note",
  "/notices",
  "/settings",
  "/profile"
];

export default function SideBar({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isBrowseOpen, setIsBrowseOpen] = useState(false);

  const { user, profile, signOut } = useAuthStore();

  // CHECK IF CURRENT PATH IS PROTECTED
  const isCurrentPathProtected = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  // SHOULD WE BLOCK THE PAGE?
  const isAccessBlocked = isCurrentPathProtected && !user;

  const [clubsData, setClubsData] = useState<{ owned: any[]; all: any[] }>({
    owned: [],
    all: [],
  });
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    if (user?.id) {
      getSidebarClubs(user.id).then(setClubsData);
      const fetchNotices = async () => {
        const notices = await getUserNotifications(user.id);
        const unread = notices.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      };
      fetchNotices();
      const interval = setInterval(fetchNotices, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <div className="h-screen overflow-hidden bg-[#eaddcf] dark:bg-[#1a1614] transition-colors duration-500 flex flex-col lg:flex-row">
      
      {/* --- AUTH REQUIRED MODAL (Triggered by Direct URL or Link Click) --- */}
      {isAccessBlocked && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in zoom-in duration-300">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
          <div className="relative bg-[#f4ebd0] dark:bg-[#2c2420] p-10 max-w-sm w-full border-2 border-tertiary shadow-[10px_10px_0px_#132f19] rotate-1">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="w-20 h-20 bg-tertiary/10 rounded-full flex items-center justify-center text-tertiary animate-bounce">
                <Lock size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="font-serif font-black text-3xl text-tertiary dark:text-[#d4a373]">Private Archive</h2>
                <p className="font-serif italic text-[#5c4033] dark:text-gray-300 text-lg">
                  "This volume is kept under lock and key. Only registered curators may enter here."
                </p>
              </div>
              <div className="flex flex-col w-full gap-4 pt-4">
                <Link 
                  href="/login" 
                  className="bg-tertiary text-[#f4ebd0] py-4 font-serif font-bold italic shadow-lg hover:scale-105 transition-transform text-center text-xl"
                >
                  Sign In / Join
                </Link>
                <Link 
                  href="/posts"
                  className="text-xs font-mono font-black uppercase tracking-widest text-primary-half hover:text-tertiary"
                >
                  Return to Daily Scribbles
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

    {/* --- MOBILE HEADER --- */}
      <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-[#eaddcf] dark:bg-[#1a1614] border-b border-tertiary/10 z-50">
        <Link href="/" className="rotate-[-1deg]">
          <h1 className="font-serif font-black text-tertiary dark:text-[#d4a373] text-2xl border-b-2 border-tertiary">
            BookPulse
          </h1>
        </Link>
        <div className="flex items-center gap-2">
          {/* Mobile Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 text-tertiary dark:text-[#d4a373]"
          >
            {resolvedTheme === "dark" ? <Sun size={24} /> : <Moon size={24} />}
          </button>
          <button
            onClick={() => setIsMobileOpen(true)}
            className="p-2 text-tertiary dark:text-[#d4a373]"
          >
            <Menu size={28} />
          </button>
        </div>
      </div>

      {/* --- SIDEBAR --- */}
      <aside className={`fixed inset-y-0 left-0 z-[70] transition-transform duration-300 ease-in-out bg-[#eaddcf] dark:bg-[#1a1614] lg:static lg:translate-x-0 lg:flex lg:flex-col lg:flex-shrink-0 h-full py-8 px-4 ${isMobileOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full lg:translate-x-0"} ${isCollapsed ? "lg:w-20" : "lg:w-64"}`}>
        <div className={`flex items-center justify-between mb-10 ${isCollapsed ? "px-0 justify-center" : "px-4"}`}>
          <Link href="/" className="rotate-[-1deg] transition-transform hover:rotate-0">
            <h1 className={`font-serif font-black text-tertiary dark:text-[#d4a373] border-b-4 border-tertiary ${isCollapsed ? "text-xl" : "text-3xl"}`}>
              {isCollapsed ? "BP" : "BookPulse"}
            </h1>
          </Link>
        </div>

        <nav className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-1">
          {/* PUBLIC */}
          <NavItem href="/posts" icon={<Home size={20} />} label="Daily Scribbles" active={pathname === "/posts"} isCollapsed={isCollapsed} />
          
          {/* PROTECTED (Links work normally, logic at top handles the blocking) */}
          <NavItem href="/search" icon={<Search size={20} />} label="Deep Search" active={pathname === "/search"} isCollapsed={isCollapsed} />
          <NavItem href="/clubs/myclubs" icon={<Users size={20} />} label="My Book Squads" active={pathname === "/clubs/myclubs"} isCollapsed={isCollapsed} />
          <NavItem href="/reviews" icon={<BookMarked size={20} />} label="Review Registry" active={pathname === "/reviews"} isCollapsed={isCollapsed} />
          <NavItem href="/schedule" icon={<Calendar size={20} />} label="Reading Queue" active={pathname === "/schedule"} isCollapsed={isCollapsed} />
          <NavItem href="/note" icon={<PenTool size={20} />} label="Brain Dumps" active={pathname === "/note"} isCollapsed={isCollapsed} />
          <NavItem href="/notices" icon={<Bell size={20} />} label="The Buzz" active={pathname === "/notices"} isCollapsed={isCollapsed} />
          <NavItem href="/settings" icon={<Settings size={20} />} label="The Setup" active={pathname === "/settings"} isCollapsed={isCollapsed} />

          <button onClick={toggleTheme} className={`w-full flex items-center transition-all mt-4 ${isCollapsed ? "justify-center py-3" : "px-4 py-2"} text-[#5c4033] dark:text-gray-400 hover:bg-tertiary/5 border-b border-transparent hover:border-tertiary`}>
            <div className="flex items-center space-x-3">
              {resolvedTheme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              {!isCollapsed && <span className="font-serif font-bold text-sm">Toggle Visuals</span>}
            </div>
          </button>
        </nav>

        {user ? (
          <div className={`mt-auto transition-all bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] dark:border-tertiary shadow-[5px_5px_0px_#bcab79] rotate-1 ${isCollapsed ? "p-2 mx-auto" : "p-4"}`}>
            <div className="flex items-center gap-3">
              <Link href="/profile" className="w-10 h-10 bg-tertiary dark:bg-[#d4a373] flex items-center justify-center overflow-hidden shrink-0">
                {profile?.image ? <img src={profile.image} alt="Avatar" className="w-full h-full object-cover" /> : <span className="font-serif italic text-xl text-white">{profile?.name?.charAt(0) || "R"}</span>}
              </Link>
              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#5c4033] dark:text-gray-100 truncate">{profile?.name || "Reader"}</p>
                  <button onClick={() => signOut()} className="text-primary-half hover:text-red-600 text-[10px] font-mono font-bold uppercase">Sign Out</button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <Link href="/login" className={`mt-auto bg-tertiary text-[#f4ebd0] text-center font-serif italic hover:bg-[#132f19] transition-all rotate-1 flex items-center justify-center ${isCollapsed ? "w-12 h-12 mx-auto" : "p-4"}`}>
            {isCollapsed ? <LogOut size={20} /> : "Join the Circle"}
          </Link>
        )}
      </aside>

      <main className="flex-1 h-full overflow-y-auto custom-scrollbar px-4 lg:px-8 py-8 lg:py-0 relative">
        {/* If access is blocked, we hide the actual content (children) so they can't see the page behind the blur */}
        {!isAccessBlocked ? children : (
          <div className="flex items-center justify-center h-full text-tertiary/20 font-serif italic text-4xl">
            Unauthorized Entry...
          </div>
        )}
      </main>
    </div>
  );
}

const NavItem = ({ icon, label, active = false, href, isCollapsed }: any) => (
  <Link href={href || "#"}>
    <div className={`flex items-center transition-all mb-1 ${isCollapsed ? "justify-center py-3" : "justify-between px-4 py-2"} ${active ? "bg-tertiary text-[#f4ebd0] dark:bg-[#d4a373] dark:text-[#1a1614] translate-x-2 shadow-[-4px_4px_0px_#132f19]" : "text-[#5c4033] dark:text-gray-400 hover:bg-tertiary/5 border-b border-transparent hover:border-tertiary"}`}>
      <div className="flex items-center space-x-3">
        <span className={active ? "animate-pulse" : ""}>{icon}</span>
        {!isCollapsed && <span className="font-serif font-bold text-sm tracking-tight whitespace-nowrap">{label}</span>}
      </div>
    </div>
  </Link>
);