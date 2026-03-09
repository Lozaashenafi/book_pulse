"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  BookOpen,
  Sun,
  Moon,
  LogOut,
  LayoutDashboard,
  User as UserIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/useAuthStore";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const { user, profile, isLoading, signOut } = useAuthStore();
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isActive = (path: string) => pathname === path;
  const closeMenu = () => setIsOpen(false);

  const handleSignOut = async () => {
    await signOut();
    closeMenu();
    router.push("/");
  };

  const NavLink = ({
    href,
    children,
  }: {
    href: string;
    children: React.ReactNode;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        className={`relative group px-1 py-1 transition-all duration-300 font-serif font-bold text-sm tracking-tight ${
          active
            ? "text-tertiary dark:text-[#d4a373]"
            : "text-primary-half hover:text-tertiary dark:text-gray-400 dark:hover:text-[#d4a373]"
        }`}
      >
        <span className="relative z-10">{children}</span>

        {active ? (
          <>
            <span className="absolute -bottom-1 left-0 w-full h-[2px] bg-[#d4a373] animate-in fade-in slide-in-from-left-2 duration-500" />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-tertiary dark:bg-[#d4a373] rounded-full" />
          </>
        ) : (
          <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-[#d4a373]/30 transition-all duration-300 group-hover:w-full" />
        )}
      </Link>
    );
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-6">
      <div className="max-w-6xl mx-auto relative">
        {/* Decorative Tree Branch - UNTOUCHED */}
        <div className="absolute -top-2 left-36 z-20 pointer-events-none select-none opacity-100 dark:opacity-80">
          <svg
            width="160"
            height="120"
            viewBox="0 0 160 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 80C50 75 70 50 130 55"
              stroke="#9e6752"
              strokeWidth="7"
              strokeLinecap="round"
              className="drop-shadow-sm"
            />
            <path
              d="M60 65C65 55 75 52 80 45"
              stroke="#9e6752"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <path
              d="M125 55C125 55 150 35 145 20C125 15 115 45 125 55Z"
              fill="#1a3f22"
              className="drop-shadow-sm"
            />
            <path
              d="M80 45C80 45 100 25 90 10C75 10 70 35 80 45Z"
              fill="#1a3f22"
              className="drop-shadow-sm"
            />
            <path
              d="M40 73C40 73 25 55 10 60C10 75 30 85 40 73Z"
              fill="#1a3f22"
              className="drop-shadow-sm"
              opacity="0.9"
            />
            <path
              d="M125 55L138 32"
              stroke="#fed7a5"
              strokeWidth="1"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Updated Nav Container with Tactile Library Style */}
        <nav className="bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-tertiary/10 dark:border-[#3e2b22] rounded-none px-6 py-3 shadow-[6px_6px_0px_rgba(26,63,34,0.1)] flex items-center justify-between backdrop-blur-sm relative overflow-hidden">
          {/* Subtle line background like a library card */}
          <div
            className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, #1a3f22, #1a3f22 1px, transparent 1px, transparent 40px)",
            }}
          />

          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity relative z-10"
          >
            <div className="bg-tertiary dark:bg-[#d4a373] p-2 rounded-none rotate-3 shadow-[3px_3px_0px_#d4a373] transition-transform">
              <BookOpen
                className="text-[#fdfcf8] dark:text-[#1a1614]"
                size={20}
              />
            </div>
            <span className="text-2xl font-serif font-black text-tertiary dark:text-[#d4a373] tracking-tighter">
              BookPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10 relative z-10">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/explore">Explore</NavLink>
            {user && <NavLink href="/posts">Daily Scribbles</NavLink>}
            <NavLink href="/clubs/myclubs">My Squads</NavLink>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4 relative z-10">
            <button
              onClick={toggleTheme}
              className="p-2 text-tertiary dark:text-[#d4a373] hover:bg-tertiary/5 transition-all outline-none"
              aria-label="Toggle Theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {!isLoading && (
              <div className="hidden sm:flex items-center space-x-3 ml-2">
                {user ? (
                  <div className="flex items-center space-x-4">
                    {profile?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-1 bg-red-50 text-red-700 px-3 py-1.5 border border-red-200 text-[10px] font-mono font-black uppercase tracking-tighter hover:bg-red-100 transition-colors"
                      >
                        <LayoutDashboard size={14} />
                        <span>Admin</span>
                      </Link>
                    )}

                    <div className="flex items-center space-x-3 pl-2 pr-1 py-1">
                      <Link
                        href="/profile"
                        className="h-9 w-9 bg-[#f4ebd0] dark:bg-[#d4a373]/20 flex items-center justify-center overflow-hidden border-2 border-tertiary/10 transition-transform hover:rotate-3 shadow-sm"
                      >
                        {profile?.image ? (
                          <img
                            src={profile.image}
                            alt="Profile"
                            className="h-full w-full object-cover grayscale-[30%] hover:grayscale-0"
                          />
                        ) : (
                          <UserIcon
                            size={18}
                            className="text-tertiary dark:text-[#d4a373]"
                          />
                        )}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Sign Out"
                      >
                        <LogOut size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-tertiary dark:text-[#d4a373] px-4 py-2 font-serif italic font-bold text-sm hover:underline transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="bg-tertiary dark:bg-[#d4a373] text-[#f4ebd0] dark:text-[#1a1614] px-5 py-2 rounded-none font-serif italic font-bold text-sm shadow-[4px_4px_0px_#d4a373] dark:shadow-[4px_4px_0px_#1a3f22] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                    >
                      Join the Circle
                    </Link>
                  </>
                )}
              </div>
            )}

            <button
              className="md:hidden text-tertiary dark:text-[#d4a373] p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown - Matching the new vibe */}
        {isOpen && (
          <div className="absolute top-full mt-3 left-0 right-0 bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-tertiary/20 dark:border-[#3e2b22] p-6 flex flex-col space-y-4 shadow-2xl md:hidden animate-in slide-in-from-top-2 duration-300">
            {["/", "/explore", "/posts", "/clubs/myclubs"].map((path) => {
              if (path === "/clubs/myclubs" && !user) return null;

              return (
                <Link
                  key={path}
                  href={path}
                  onClick={closeMenu}
                  className={`text-lg font-serif font-black px-4 py-2 transition-all ${
                    isActive(path)
                      ? "bg-tertiary text-[#f4ebd0] shadow-[4px_4px_0px_#d4a373]"
                      : "text-primary-half dark:text-gray-400"
                  }`}
                >
                  {path === "/"
                    ? "Home"
                    : path.replace("/", "").replace("-", " ").toUpperCase()}
                </Link>
              );
            })}

            {user && profile?.role === "admin" && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="flex items-center space-x-2 text-red-700 font-mono font-black text-xs px-4 py-2"
              >
                <LayoutDashboard size={20} />
                <span>ADMIN PANEL</span>
              </Link>
            )}

            <hr className="border-tertiary/10 dark:border-white/5" />

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center space-x-2 bg-red-50 text-red-700 py-3 font-serif italic font-bold"
              >
                <LogOut size={18} />
                <span>Leave Library</span>
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="text-tertiary font-serif italic font-bold text-center py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="bg-tertiary text-[#f4ebd0] py-3 font-serif italic font-bold text-center shadow-[4px_4px_0px_#d4a373]"
                >
                  Join the Circle
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
