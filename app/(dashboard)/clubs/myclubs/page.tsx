"use client";

import React, { useEffect } from "react";
import {
  Plus,
  Settings,
  ChevronRight,
  LibraryBig,
  Loader2,
  Book as BookIcon,
} from "lucide-react";
import ClubCard from "../../../../components/ui/ClubCard";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useMyClubs } from "@/hooks/useMyClubs";

const EmptyState = () => {
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-[#1E1E1E] rounded-[40px_10px_40px_10px] border-2 border-dashed border-[#9E6752]/20 shadow-sm">
      <div className="w-20 h-20 bg-[#FDF8F1] dark:bg-[#2A2A2A] rounded-full flex items-center justify-center mb-6">
        <LibraryBig size={40} className="text-[#9E6752] dark:text-[#FED7A5]" />
      </div>
      <h3 className="text-2xl font-serif font-bold text-[#2D2D2D] dark:text-[#F3F4F6]">
        No Active Clubs
      </h3>
      <p className="text-[#5A5A5A] dark:text-[#A0A0A0] mt-3 max-w-sm mx-auto italic">
        You haven't joined or created any book clubs yet. Start your own reading
        circle today!
      </p>
      <button
        className="mt-8 px-8 py-4 bg-[#9E6752] hover:bg-[#8B5A46] text-white rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
        onClick={() => router.push("/clubs/add")}
      >
        <Plus size={20} />
        Create New Club
      </button>
    </div>
  );
};

const MyClubsPage = () => {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuthStore();
  const { clubs, isLoading: dataLoading } = useMyClubs(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#fdf8f1] dark:bg-[#121212]">
        <Loader2 className="animate-spin text-[#9E6752]" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdf8f1] dark:bg-[#121212] pt-32 pb-20 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6">
        <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-[#2D2D2D] dark:text-[#F3F4F6]">
              My{" "}
              <span className="text-[#9E6752] dark:text-[#FED7A5]">Clubs</span>
            </h1>
            <p className="text-[#5A5A5A] dark:text-[#A0A0A0] mt-3 italic">
              Manage your reading groups and track your progress.
            </p>
          </div>

          <button
            className="flex items-center gap-2 bg-white dark:bg-[#1E1E1E] text-[#9E6752] dark:text-[#FED7A5] px-6 py-3 rounded-xl border border-[#9E6752]/20 font-bold hover:bg-[#9E6752] hover:text-white transition-all shadow-sm"
            onClick={() => router.push("/clubs/add")}
          >
            <Plus size={18} />
            Create Club
          </button>
        </header>

        {clubs.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {clubs.map((club) => (
              <div key={club.id} className="relative group flex flex-col">
                {/* Action Settings Button */}
                <div className="absolute top-6 right-4 z-20">
                  <button
                    onClick={() => router.push(`/clubs/settings/${club.id}`)}
                    className="p-2 bg-white/90 dark:bg-black/50 backdrop-blur-md rounded-full text-[#9E6752] hover:bg-[#9E6752] hover:text-white transition-all shadow-md"
                  >
                    <Settings size={18} />
                  </button>
                </div>

                <div className="flex-1 min-w-0 pt-4">
                  <ClubCard book={club} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
};

export default MyClubsPage;
