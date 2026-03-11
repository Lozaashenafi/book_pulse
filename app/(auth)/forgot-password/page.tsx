"use client";

import React, { useState } from "react";
import {
  Mail,
  ArrowRight,
  Loader2,
  Paperclip,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import { resetPasswordAction, verifyOtpAction } from "@/app/(auth)/action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Code
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const result = await resetPasswordAction(email);
    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      setStep(2);
      setLoading(false);
      toast.success("Security code dispatched!");
    }
  };
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    // Ensure 'email' and 'code' are definitely the strings from your state
    const result = await verifyOtpAction(email, code);

    if (result.error) {
      toast.error(result.error);
      setLoading(false);
    } else {
      toast.success("Identity verified.");
      // Clear code state before moving
      setCode("");
      router.push("/update-password");
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
          <h2 className="text-3xl font-serif font-black text-tertiary">
            {step === 1 ? "Reset Key" : "Verify Identity"}
          </h2>

          {step === 1 ? (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <p className="text-sm font-serif italic text-tertiary/60">
                Enter your email to receive a recovery code.
              </p>
              <div className="relative border-b-2 border-tertiary/10">
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 py-2 bg-transparent outline-none font-serif italic"
                  placeholder="reader@bookpulse.com"
                />
                <Mail
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary/30"
                  size={16}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-tertiary text-[#f4ebd0] py-4 shadow-[6px_6px_0px_rgba(26,63,34,0.2)] font-serif font-black italic flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Request Code <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <p className="text-sm font-serif italic text-tertiary/60">
                Type the code sent to <strong>{email}</strong>.
              </p>
              <div className="relative border-b-2 border-tertiary/10">
                <input
                  required
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  // 1. CHANGE: Increase maxLength to 8 (or remove it to be safe)
                  maxLength={10}
                  className="w-full pl-10 py-2 bg-transparent outline-none font-mono font-bold tracking-[0.5em] text-center"
                  placeholder="00000000"
                />
                <ShieldCheck
                  className="absolute left-2 top-1/2 -translate-y-1/2 text-tertiary/30"
                  size={16}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-tertiary text-[#f4ebd0] py-4 shadow-[6px_6px_0px_rgba(26,63,34,0.2)] font-serif font-black italic flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <>
                    Verify Code <CheckCircle2 size={18} />
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-[10px] uppercase font-bold text-gray-400"
              >
                Wrong email? Go back
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
