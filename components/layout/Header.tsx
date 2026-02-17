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

  // Auth Store
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
        className={`relative group px-1 py-1 transition-all duration-300 ${
          active
            ? "text-primary dark:text-[#d4a373]"
            : "text-[#7a7a7a] hover:text-primary dark:text-gray-400 dark:hover:text-[#d4a373]"
        }`}
      >
        <span className="relative z-10 font-medium">{children}</span>

        {active ? (
          <>
            <span className="absolute bottom-0 left-0 w-full h-[3px] bg-primary dark:bg-[#d4a373] rounded-full animate-in fade-in zoom-in duration-500" />
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary dark:bg-[#d4a373] rounded-full" />
          </>
        ) : (
          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary/30 dark:bg-[#d4a373]/30 transition-all duration-300 group-hover:w-full" />
        )}
      </Link>
    );
  };

  return (
    <header className="fixed top-6 left-0 right-0 z-50 px-6">
      <div className="max-w-6xl mx-auto relative">
        {/* Decorative Tree Branch */}
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

        <nav className="bg-[#fdf8f1] dark:bg-[#1a1a1a] border border-primary/20 dark:border-white/10 rounded-xl px-6 py-3 shadow-md flex items-center justify-between backdrop-blur-sm bg-opacity-95 dark:bg-opacity-90">
          {/* Logo Section */}
          <Link
            href="/"
            className="flex items-center space-x-3 hover:opacity-90 transition-opacity"
          >
            <div className="bg-primary dark:bg-[#d4a373] p-2 rounded-lg rotate-3 shadow-sm group-hover:rotate-0 transition-transform">
              <BookOpen
                className="text-[#fdf8f1] dark:text-[#1a1a1a]"
                size={20}
              />
            </div>
            <span className="text-2xl font-serif font-bold text-[#2d2d2d] dark:text-gray-100 tracking-tight">
              BookPulse
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/explore">Explore</NavLink>
            {user && <NavLink href="/my-clubs">My Clubs</NavLink>}
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-primary dark:text-[#d4a373] hover:bg-secondary/30 dark:hover:bg-white/5 transition-all outline-none"
              aria-label="Toggle Theme"
            >
              {resolvedTheme === "dark" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {/* Auth Dependent Actions */}
            {!isLoading && (
              <div className="hidden sm:flex items-center space-x-3 ml-2">
                {user ? (
                  <div className="flex items-center space-x-4">
                    {/* Admin Dashboard Link */}
                    {profile?.role === "admin" && (
                      <Link
                        href="/admin"
                        className="flex items-center space-x-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-80 transition-opacity"
                      >
                        <LayoutDashboard size={14} />
                        <span>Admin</span>
                      </Link>
                    )}

                    {/* User Profile Info */}
                    <div className="flex items-center space-x-3 bg-white dark:bg-[#262626] border border-primary/10 dark:border-white/5 pl-2 pr-1 py-1 rounded-full shadow-sm">
                      <span className="text-xs font-bold text-gray-700 dark:text-gray-200 hidden lg:block">
                        {profile?.full_name?.split(" ")[0] || "Reader"}
                      </span>
                      <Link
                        href="/profile"
                        className="h-8 w-8 rounded-full bg-secondary dark:bg-[#d4a373]/20 flex items-center justify-center overflow-hidden border border-primary/10 transition-transform hover:scale-105"
                      >
                        {profile?.avatar_url ? (
                          <img
                            src={profile.avatar_url}
                            alt="Profile"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <UserIcon
                            size={16}
                            className="text-primary dark:text-[#d4a373]"
                          />
                        )}
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-full transition-all"
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
                      className="text-primary dark:text-[#d4a373] px-4 py-2 rounded-lg font-bold text-sm hover:bg-secondary/30 dark:hover:bg-white/5 transition-all"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="bg-primary dark:bg-[#d4a373] text-white dark:text-[#1a1a1a] px-5 py-2 rounded-lg font-bold text-sm shadow-md hover:bg-[#8a5a48] dark:hover:bg-[#e9c46a] hover:-translate-y-0.5 transition-all"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-primary dark:text-[#d4a373] p-2"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>

        {/* Mobile Dropdown */}
        {isOpen && (
          <div className="absolute top-full mt-3 left-0 right-0 bg-[#fdf8f1] dark:bg-[#262626] border border-primary/20 dark:border-white/10 rounded-xl p-6 flex flex-col space-y-4 shadow-2xl md:hidden animate-in slide-in-from-top-2 duration-300">
            {["/", "/explore", "/my-clubs"].map((path) => {
              // Only show My Clubs if user is logged in
              if (path === "/my-clubs" && !user) return null;

              return (
                <Link
                  key={path}
                  href={path}
                  onClick={closeMenu}
                  className={`text-lg font-medium px-4 py-2 rounded-lg transition-all ${
                    isActive(path)
                      ? "bg-secondary dark:bg-[#d4a373] text-primary dark:text-[#1a1a1a] border-l-4 border-primary dark:border-white/20"
                      : "text-[#7a7a7a] dark:text-gray-400"
                  }`}
                >
                  {path === "/"
                    ? "Home"
                    : path.replace("/", "").replace("-", " ")}
                </Link>
              );
            })}

            {/* Mobile Admin Link */}
            {user && profile?.role === "admin" && (
              <Link
                href="/admin"
                onClick={closeMenu}
                className="flex items-center space-x-2 text-red-600 dark:text-red-400 font-bold px-4 py-2"
              >
                <LayoutDashboard size={20} />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <hr className="border-primary/10 dark:border-white/5" />

            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex items-center justify-between px-4 py-2 text-primary dark:text-[#d4a373] font-medium"
            >
              <span>
                Switch to {resolvedTheme === "dark" ? "Light" : "Dark"} Mode
              </span>
              {resolvedTheme === "dark" ? (
                <Sun size={20} />
              ) : (
                <Moon size={20} />
              )}
            </button>

            {user ? (
              <button
                onClick={handleSignOut}
                className="flex items-center justify-center space-x-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 py-3 rounded-lg font-bold"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="text-primary dark:text-[#d4a373] font-bold text-center py-2"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="bg-primary dark:bg-[#d4a373] text-white dark:text-[#1a1a1a] py-3 rounded-lg font-bold text-center shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
