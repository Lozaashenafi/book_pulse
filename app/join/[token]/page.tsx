"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { getInviteDetails, joinWithToken } from "@/services/club.service";
import { Loader2, UserPlus, LogIn } from "lucide-react";
import { toast } from "sonner";
import CuratorLoader from "@/components/ui/CuratorLoader";

const JoinInvitePage = () => {
  const { token } = useParams() as { token: string };
  const { user, profile, isLoading: authLoading, syncSession } = useAuthStore();
  const router = useRouter();

  const [inviteData, setInviteData] = useState<any>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // 1. Force sync auth and fetch invite data on mount
  useEffect(() => {
    const init = async () => {
      await syncSession(); // Force verify if user is logged in
      const data = await getInviteDetails(token);
      if (!data) {
        toast.error("Invitation link invalid.");
      } else {
        setInviteData(data);
      }
      setDataLoading(false);
    };
    init();
  }, [token, syncSession]);

  const handleAction = async () => {
    // If auth is still loading, do nothing
    if (authLoading) return;

    // STEP 1: If user is definitely NOT logged in
    if (!user) {
      toast.info("Please sign in to accept the invitation.");
      router.push(`/login?next=/join/${token}`);
      return;
    }

    // STEP 2: If user IS logged in, execute the join in Neon
    setIsJoining(true);
    try {
      const res = await joinWithToken(
        user.id,
        token,
        profile?.name || "A reader",
      );
      if (res.success) {
        toast.success(`Welcome to ${inviteData.clubName}!`);

        router.push(`/clubs/${res.clubId}`);
        router.refresh();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsJoining(false);
    }
  };

  // 2. WHILE LOADING: Show a professional "Checking Credentials" view
  if (authLoading || dataLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center  space-y-4">
        <CuratorLoader />
        <p className="font-mono text-[10px] uppercase tracking-widest text-primary-half">
          Verifying Credentials...
        </p>
      </div>
    );
  }

  if (!inviteData) return null; // Error toast handles this

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-[#f4ebd0]/30 p-4">
      <div className="bg-[#fdfcf8] w-full max-w-lg border-2 border-tertiary shadow-[20px_20px_0px_#d4a373] p-10 relative animate-in zoom-in duration-300">
        <div className="text-center space-y-6">
          <span className="text-[10px] font-mono font-black text-[#d4a373] uppercase tracking-[0.4em]">
            Official Dispatch
          </span>
          <h1 className="text-4xl font-serif font-black text-tertiary">
            The Invitation
          </h1>

          <div className="bg-[#f4ebd0] p-6 border-2 border-dashed border-tertiary/20 text-left flex gap-4 items-center">
            <div className="w-16 h-20 bg-white shadow-sm shrink-0 border border-tertiary/10 overflow-hidden">
              {inviteData.cover && (
                <img
                  src={inviteData.cover}
                  className="w-full h-full object-cover"
                  alt="cover"
                />
              )}
            </div>
            <div>
              <h2 className="text-lg font-serif font-black text-tertiary">
                {inviteData.clubName}
              </h2>
              <p className="text-xs font-serif italic text-primary-half">
                Reading {inviteData.bookTitle}
              </p>
            </div>
          </div>

          <button
            onClick={handleAction}
            disabled={isJoining}
            className="w-full bg-tertiary text-[#f4ebd0] py-5 font-serif font-black italic text-xl shadow-[6px_6px_0px_#d4a373] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3"
          >
            {isJoining ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                {/* 3. DYNAMIC BUTTON TEXT based on confirmed auth status */}
                {!user ? "Sign In to Join" : "Accept Invitation"}
                {!user ? <LogIn size={20} /> : <UserPlus size={20} />}
              </>
            )}
          </button>

          {user && (
            <p className="text-[10px] font-mono text-primary-half">
              Logged in as: {user.email}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default JoinInvitePage;
