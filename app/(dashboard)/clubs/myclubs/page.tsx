"use client";

import React, { useEffect } from "react";
import { Plus, Settings, LibraryBig, Loader2, Paperclip } from "lucide-react";
import MyClubCard from "../../../../components/ui/MyClubCard";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useMyClubs } from "@/hooks/useMyClubs";

const EmptyState = () => {
  const router = useRouter();
  return (
    <div className="relative flex flex-col items-center justify-center py-20 text-center bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] dark:border-[#5c4033] shadow-[8px_8px_0px_rgba(92,64,51,0.1)] rotate-1 max-w-2xl mx-auto mt-12">
      <Paperclip
        className="absolute -top-4 right-10 text-gray-400 rotate-12"
        size={40}
      />

      <div className="w-20 h-20 bg-[#5c4033] dark:bg-[#d4a373] flex items-center justify-center mb-6 shadow-md">
        <LibraryBig size={40} className="text-[#f4ebd0] dark:text-[#1a1614]" />
      </div>

      <h3 className="text-3xl font-serif font-black text-[#5c4033] dark:text-gray-100">
        Shelf is Empty
      </h3>
      <p className="text-[#8b5a2b] dark:text-gray-400 mt-3 max-w-sm mx-auto font-serif italic text-lg">
        "A room without books is like a body without a soul." Start your own
        fellowship today.
      </p>

      <button
        className="mt-8 px-8 py-3 bg-[#5c4033] text-[#f4ebd0] font-serif italic text-lg shadow-[4px_4px_0px_#3e2b22] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
        onClick={() => router.push("/clubs/add")}
      >
        <Plus size={20} />
        Inaugurate a Squad
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
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#5c4033]" size={40} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Header "Library Index" Style */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-4 border-[#5c4033]/10 pb-6 gap-6">
        <div className="text-left">
          <h1 className="text-5xl font-serif font-black text-[#5c4033] dark:text-[#d4a373]">
            My{" "}
            <span className="italic underline decoration-wavy decoration-[#8b5a2b]/30">
              Squads
            </span>
          </h1>
          <p className="text-[#8b5a2b] dark:text-gray-400 mt-2 font-mono text-xs uppercase tracking-[0.2em] font-bold">
            Personal Registry // {clubs.length} Active Fellowships
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-[#fdfdfd] dark:bg-[#252525] text-[#5c4033] dark:text-[#d4a373] px-6 py-2 border-2 border-[#5c4033] dark:border-[#d4a373] font-serif italic font-bold hover:bg-[#5c4033] hover:text-[#f4ebd0] transition-all shadow-[4px_4px_0px_rgba(92,64,51,0.2)]"
          onClick={() => router.push("/clubs/add")}
        >
          <Plus size={18} />
          Form New Circle
        </button>
      </header>

      {clubs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {clubs.map((club) => (
            <div key={club.id} className="relative group">
              {/* "Library Card" Style Action Button */}
              <div className="absolute -top-3 -right-3 z-20">
                <button
                  onClick={() => router.push(`/clubs/settings/${club.id}`)}
                  className="p-2 bg-[#5c4033] text-[#f4ebd0] shadow-md hover:scale-110 transition-transform"
                  title="Modify Ledger"
                >
                  <Settings size={18} />
                </button>
              </div>

              {/* The Club Card Container */}
              <div className="transition-transform hover:-rotate-1 duration-300">
                <MyClubCard book={club} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Footer Decoration */}
      <div className="mt-20 border-t border-dashed border-[#5c4033]/20 pt-8 text-center">
        <p className="font-mono text-[10px] uppercase text-[#8b5a2b] opacity-50">
          BookPulse Literary Registry — End of List
        </p>
      </div>
    </div>
  );
};

export default MyClubsPage;
