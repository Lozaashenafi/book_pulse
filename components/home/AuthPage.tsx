"use client";

import React, { useState } from "react";
import { Mail, Lock, User, Loader2, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Import the Server Actions we will create in the next step
import {
  signUpAction,
  loginAction,
  googleLoginAction,
} from "@/app/(auth)/action";
import { useAuthStore } from "@/store/useAuthStore";

const AuthPage = ({ type }: { type: "sign-in" | "register" }) => {
  const isSignIn = type === "sign-in";
  const router = useRouter();
  const { syncSession } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    username: "", // This will be saved as 'name' in Prisma/Supabase
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
      window.location.href = result.url; // Redirect to Google OAuth
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Call the Server Actions directly
    const result = isSignIn
      ? await loginAction(formData.email, formData.password)
      : await signUpAction(
          formData.email,
          formData.password,
          formData.username,
        );

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      if (isSignIn) {
        // Successful login: update Zustand and go home
        await syncSession();
        router.push("/");
        router.refresh();
      } else {
        // Successful registration: show "Check Email" UI
        setIsEmailSent(true);
        setLoading(false);
      }
    }
  };

  // SUCCESS STATE: Verify Email View
  if (isEmailSent) {
    return (
      <div className="h-svh w-screen bg-[#fdf8f1] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-12 rounded-[2.5rem] shadow-xl text-center space-y-6 animate-in fade-in zoom-in duration-500">
          <div className="bg-[#5F745D]/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-[#5F745D]">
            <Mail size={40} />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            Check your email
          </h2>
          <p className="text-gray-500 leading-relaxed">
            We sent a verification link to <br />
            <span className="font-bold text-gray-900">
              {formData.email}
            </span>. <br />
            Please click the link to activate your BookPulse account.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-[#D4A373] font-bold hover:underline"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-svh w-screen bg-[#fdf8f1] dark:bg-[#0a0a0a] flex items-center justify-center p-4 overflow-hidden transition-colors duration-500">
      <div className="max-w-5xl w-full flex flex-col lg:flex-row bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] overflow-hidden border border-primary/10 dark:border-white/5 max-h-[90vh]">
        {/* LEFT COLUMN: Visual Side */}
        <div className="hidden lg:flex w-1/2 bg-[#5F745D] dark:bg-[#0f1a11] relative overflow-hidden flex-col justify-center p-12">
          <div className="absolute top-10 left-10 opacity-20 animate-pulse pointer-events-none">
            <svg width="300" height="200" viewBox="0 0 160 120" fill="none">
              <path
                d="M10 80C50 75 70 50 130 55"
                stroke="#fed7a5"
                strokeWidth="3"
              />
              <path
                d="M125 55C125 55 150 35 145 20C125 15 115 45 125 55Z"
                fill="#fed7a5"
              />
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-white/10 border border-white/20 px-4 py-2 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4A373] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D4A373]"></span>
              </span>
              <span className="text-[#D4A373] text-xs font-bold uppercase tracking-widest">
                4,203 Readers Online
              </span>
            </div>

            <h1 className="text-5xl font-serif font-bold text-white leading-[1.1]">
              Turn the page <br />
              <span className="text-[#D4A373] italic">together.</span>
            </h1>
            <p className="text-white/70 text-base max-w-sm font-light leading-relaxed">
              Join the world's most intimate digital reading circle. Discussion
              starts the moment you open the cover.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-12 overflow-y-auto lg:overflow-visible">
          <div className="max-w-sm w-full space-y-6">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-4">
              <div className="inline-block bg-[#5F745D] p-2.5 rounded-xl rotate-3 mb-2">
                <BookOpen className="text-white" size={24} />
              </div>
              <h2 className="text-xl font-serif font-bold text-[#2d2d2d] dark:text-white">
                BookPulse
              </h2>
            </div>

            <div className="space-y-1">
              <h2 className="text-3xl font-serif font-bold text-gray-900 dark:text-white">
                {isSignIn ? "Welcome Back" : "Create Account"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                {isSignIn
                  ? "Sign in to your account."
                  : "Start your free community trial."}
              </p>
              {error && (
                <div className="bg-red-50 text-red-500 p-3 rounded-xl text-xs font-bold animate-in slide-in-from-top-1">
                  {error}
                </div>
              )}
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-3 border-2 border-gray-100 dark:border-white/5 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
            >
              <GoogleIcon />
              <span className="font-bold text-gray-700 dark:text-gray-200 text-sm">
                Continue with Google
              </span>
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t dark:border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-white dark:bg-[#1a1a1a] px-4 text-gray-400 tracking-widest">
                  Or use email
                </span>
              </div>
            </div>

            <form className="space-y-3.5" onSubmit={handleSubmit}>
              {!isSignIn && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      name="username"
                      required
                      value={formData.username}
                      onChange={handleChange}
                      type="text"
                      className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-[#262626] rounded-2xl border-none focus:ring-2 focus:ring-[#5F745D]/20 dark:text-white text-sm outline-none"
                      placeholder="John Doe"
                    />
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    type="email"
                    className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-[#262626] rounded-2xl border-none focus:ring-2 focus:ring-[#5F745D]/20 dark:text-white text-sm outline-none"
                    placeholder="name@email.com"
                  />
                  <Mail
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Password
                  </label>
                  {isSignIn && (
                    <button
                      type="button"
                      className="text-[10px] text-[#5F745D] font-bold hover:underline"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    type="password"
                    className="w-full pl-12 pr-5 py-3 bg-gray-50 dark:bg-[#262626] rounded-2xl border-none focus:ring-2 focus:ring-[#5F745D]/20 dark:text-white text-sm outline-none"
                    placeholder="••••••••"
                  />
                  <Lock
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#5F745D] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-[#5F745D]/20 hover:-translate-y-0.5 transition-all flex items-center justify-center space-x-2 active:scale-95 mt-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <span>{isSignIn ? "Sign In" : "Get Started"}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              {isSignIn ? "New reader?" : "Already a member?"}{" "}
              <Link
                href={isSignIn ? "/register" : "/login"}
                className="text-[#D4A373] font-bold hover:underline"
              >
                {isSignIn ? "Create account" : "Sign in here"}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
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
