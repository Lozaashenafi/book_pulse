"use client";

import React, { useState } from "react";
import {
  Mail,
  Lock,
  User,
  Loader2,
  ArrowRight,
  BookOpen,
  Paperclip,
  Quote,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Logic-only imports (Unchanged)
import {
  signUpAction,
  loginAction,
  googleLoginAction,
} from "@/app/(auth)/action";
import { useAuthStore } from "@/store/useAuthStore";
import CuratorLoader from "../ui/CuratorLoader";

const AuthPage = ({
  type,
  nextUrl,
}: {
  type: "sign-in" | "register";
  nextUrl?: string;
}) => {
  const isSignIn = type === "sign-in";
  const router = useRouter();
  const { syncSession } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleLogin = async () => {
    setError(null);
    const result = await googleLoginAction();
    if (result?.error) {
      setError(result.error);
    } else if (result?.url) {
      window.location.href = result.url;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = isSignIn
      ? await loginAction(formData.email, formData.password)
      : await signUpAction(
          formData.email,
          formData.password,
          formData.username,
        );

    if (result?.error) {
      setError(result.error || "An unexpected error occurred.");
      setLoading(false);
    } else {
      if (isSignIn) {
        await syncSession();
        router.push(nextUrl || "/");
        router.refresh();
      } else {
        setIsEmailSent(true);
        setLoading(false);
      }
    }
  };

  if (isEmailSent) {
    return (
      <div className="h-svh w-screen bg-[#eaddcf] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#f4ebd0] p-12 border-2 border-tertiary/20 shadow-[10px_10px_0px_#1a3f22] text-center space-y-6 animate-in fade-in zoom-in duration-500 relative">
          <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-tertiary rounded-full shadow-lg border-4 border-[#eaddcf] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-white/20" />
          </div>
          <div className="text-tertiary flex justify-center">
            <Mail size={48} />
          </div>
          <h2 className="text-3xl font-serif font-black text-tertiary">
            Check your mail
          </h2>
          <p className="text-tertiary/70 font-serif italic leading-relaxed">
            A verification link is flying to <br />
            <span className="font-bold not-italic underline decoration-dashed text-tertiary">
              {formData.email}
            </span>
            .
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-tertiary font-mono font-bold uppercase tracking-widest hover:underline text-xs"
          >
            ← Return to Shelf
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-svh w-screen bg-[#eaddcf] dark:bg-[#1a1614] flex items-center justify-center p-4 overflow-hidden transition-colors duration-500">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row bg-[#fdfcf8] dark:bg-[#252525] shadow-[20px_20px_0px_rgba(26,63,34,0.1)] border-2 border-tertiary/10 dark:border-[#3e2b22] max-h-[95vh] overflow-hidden">
        {/* LEFT COLUMN: The "Leather Bound Book Cover" */}
        <div className="hidden lg:flex w-1/2 bg-tertiary relative overflow-hidden flex-col justify-center p-12">
          {/* Gold Foil Texture Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                'url("https://www.transparenttextures.com/patterns/gold-dust.png")',
            }}
          />

          <div className="relative z-10 space-y-8">
            {/* Gold Foil Stamp */}
            <div className="inline-block border-2 border-[#d4a373] p-4 rotate-[-2deg] bg-tertiary shadow-xl">
              <div className="text-[#d4a373] text-[10px] font-mono font-black uppercase tracking-[0.3em]">
                First Edition Access
              </div>
              <div className="text-[#f4ebd0] font-serif italic text-sm mt-1">
                Verified Literary Circle
              </div>
            </div>

            <div className="relative">
              <Quote
                className="absolute -left-8 -top-8 text-[#d4a373]/20"
                size={80}
              />
              <h1 className="text-6xl font-serif font-black text-white leading-tight tracking-tighter">
                Turn the <br />
                <span className="text-[#d4a373] italic">page</span> together.
              </h1>
            </div>

            <p className="text-[#f4ebd0]/70 text-lg font-serif italic max-w-xs leading-relaxed border-l-2 border-[#d4a373] pl-4">
              "Discussion starts the moment you open the cover."
            </p>
          </div>

          {/* Decorative Corner (Like an old book corner protector) */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-8 border-l-8 border-[#d4a373]/30" />
        </div>

        {/* RIGHT COLUMN: The "Library Checkout Card" */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 overflow-y-auto custom-scrollbar">
          <div className="max-w-sm w-full space-y-8 relative">
            <Paperclip
              className="absolute -top-10 -right-4 text-tertiary/20 -rotate-12"
              size={40}
            />

            <div className="space-y-2 border-b-2 border-tertiary/10 pb-4">
              <h2 className="text-4xl font-serif font-black text-tertiary dark:text-[#d4a373]">
                {isSignIn ? "Member Log" : "New Entry"}
              </h2>
              <p className="text-tertiary/60 font-mono text-[10px] uppercase tracking-widest font-bold">
                Archive: {new Date().getFullYear()} /{" "}
                {new Date().getMonth() + 1}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 font-serif italic text-sm animate-shake">
                {error}
              </div>
            )}

            {/* Google Login: Styled as a secondary library card */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 bg-[#f4ebd0] border-2 border-tertiary/10 py-3 shadow-[4px_4px_0px_#1a3f22]/10 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
            >
              <GoogleIcon />
              <span className="font-serif font-bold text-tertiary text-sm">
                Pass with Google
              </span>
            </button>

            <div className="relative flex justify-center">
              <span className="bg-[#fdfcf8] dark:bg-[#252525] px-4 font-mono text-[9px] text-tertiary/40 uppercase tracking-widest z-10">
                Written Entry
              </span>
              <div className="absolute top-1/2 w-full border-t border-dashed border-tertiary/10" />
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              {!isSignIn && (
                <div className="space-y-1 group">
                  <label className="text-[10px] font-mono font-black text-tertiary/50 uppercase tracking-tighter ml-1">
                    01. Curator Name
                  </label>
                  <div className="relative border-b-2 border-tertiary/10 group-focus-within:border-tertiary transition-colors">
                    <input
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      type="text"
                      className="w-full pl-10 pr-4 py-2 bg-transparent dark:text-white text-sm outline-none font-serif italic"
                      placeholder="e.g. Leo Tolstoy"
                    />
                    <User
                      className="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary/30"
                      size={16}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1 group">
                <label className="text-[10px] font-mono font-black text-tertiary/50 uppercase tracking-tighter ml-1">
                  {isSignIn ? "01. Email Address" : "02. Contact Email"}
                </label>
                <div className="relative border-b-2 border-tertiary/10 group-focus-within:border-tertiary transition-colors">
                  <input
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    className="w-full pl-10 pr-4 py-2 bg-transparent dark:text-white text-sm outline-none font-serif italic"
                    placeholder="reader@bookpulse.com"
                  />
                  <Mail
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary/30"
                    size={16}
                  />
                </div>
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-mono font-black text-tertiary/50 uppercase tracking-tighter ml-1">
                  {isSignIn ? "02. Password" : "03. Security Key"}
                </label>
                <div className="relative border-b-2 border-tertiary/10 group-focus-within:border-tertiary transition-colors">
                  <input
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    className="w-full pl-10 pr-12 py-2 bg-transparent dark:text-white text-sm outline-none font-serif italic"
                    placeholder="••••••••"
                  />
                  <Lock
                    className="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary/30"
                    size={16}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-tertiary text-[#f4ebd0] py-4 shadow-[6px_6px_0px_rgba(26,63,34,0.2)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center space-x-2 active:scale-95 font-serif font-black italic"
              >
                {loading ? (
                  <CuratorLoader />
                ) : (
                  <>
                    <span>{isSignIn ? "Enter Library" : "Join the Squad"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="text-center">
              <Link
                href={isSignIn ? "/register" : "/login"}
                className="font-mono text-[10px] uppercase font-black text-tertiary/60 hover:text-tertiary tracking-[0.2em] underline decoration-dotted underline-offset-4"
              >
                {isSignIn
                  ? "Apply for new membership"
                  : "Already registered? Login"}
              </Link>
            </div>
          </div>
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
          background: #1a3f2220;
          border-radius: 10px;
        }
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          75% {
            transform: translateX(4px);
          }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

const GoogleIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
      fill="#EA4335"
    />
  </svg>
);

export default AuthPage;
