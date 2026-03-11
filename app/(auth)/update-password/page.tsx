"use client";

import React, { useState } from "react";
import { Lock, CheckCircle2, Loader2, Paperclip } from "lucide-react";
import { updatePasswordAction } from "@/app/(auth)/action";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (password.length < 6) {
      return toast.error("Security key must be at least 6 characters");
    }

    setLoading(true);
    try {
      const result = await updatePasswordAction(password);

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Security key updated successfully.");
        // Redirect to login or home
        router.push("/login");
      }
    } catch (err) {
      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-svh w-screen bg-[#eaddcf] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#fdfcf8] p-10 border-2 border-tertiary/10 shadow-[20px_20px_0px_rgba(26,63,34,0.1)] relative">
        <Paperclip
          className="absolute -top-10 -right-4 text-tertiary/20 -rotate-12"
          size={40}
        />

        <div className="space-y-6">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-serif font-black text-tertiary">
              New Security Key
            </h2>
            <p className="text-sm font-serif italic text-tertiary/60">
              Finalize your archive recovery by setting a new password.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-tertiary/50 uppercase tracking-tighter ml-1">
                New Password
              </label>
              <div className="relative border-b-2 border-tertiary/10 focus-within:border-tertiary transition-colors">
                <input
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 py-2 bg-transparent outline-none font-serif italic"
                  placeholder="••••••••"
                />
                <Lock
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary/30"
                  size={16}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-black text-tertiary/50 uppercase tracking-tighter ml-1">
                Confirm Password
              </label>
              <div className="relative border-b-2 border-tertiary/10 focus-within:border-tertiary transition-colors">
                <input
                  required
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 py-2 bg-transparent outline-none font-serif italic"
                  placeholder="••••••••"
                />
                <CheckCircle2
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary/30"
                  size={16}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-tertiary text-[#f4ebd0] py-4 shadow-[6px_6px_0px_rgba(26,63,34,0.2)] font-serif font-black italic flex items-center justify-center gap-2 hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <>
                  Update & Re-enter Archives <CheckCircle2 size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
