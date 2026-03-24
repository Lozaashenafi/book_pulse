"use client";

import React, { useEffect, useMemo } from "react";
import { Plus, Settings, LibraryBig, Loader2, Paperclip } from "lucide-react";
import MyClubCard from "../../../../components/ui/MyClubCard";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useMyClubs } from "@/hooks/useMyClubs";
import CuratorLoader from "@/components/ui/CuratorLoader";

const EmptyState = () => {
  const router = useRouter();
  return (
    <div className="relative flex flex-col items-center justify-center py-20 text-center bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] dark:border-primary-dark shadow-[8px_8px_0px_rgba(92,64,51,0.1)] rotate-1 max-w-2xl mx-auto mt-12">
      <Paperclip
        className="absolute -top-4 right-10 text-gray-400 rotate-12"
        size={40}
      />

      <div className="w-20 h-20 bg-primary-dark dark:bg-[#d4a373] flex items-center justify-center mb-6 shadow-md">
        <LibraryBig size={40} className="text-[#f4ebd0] dark:text-[#1a1614]" />
      </div>

      <h3 className="text-3xl font-serif font-black text-primary-dark dark:text-gray-100">
        Shelf is Empty
      </h3>
      <p className="text-primary-half dark:text-gray-400 mt-3 max-w-sm mx-auto font-serif italic text-lg">
        "A room without books is like a body without a soul." Start your own
        Club today.
      </p>

      <button
        className="mt-8 px-8 py-3 bg-primary-dark text-[#f4ebd0] font-serif italic text-lg shadow-[4px_4px_0px_#3e2b22] hover:translate-y-1 hover:shadow-none transition-all flex items-center gap-2"
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

  // LOGIC: Filter only clubs where the user is the OWNER
  const ownedClubs = useMemo(() => {
    return clubs.filter((club) => club.role === "OWNER");
  }, [clubs]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CuratorLoader />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-6">
      {/* Header "Library Index" Style */}
      <header className="flex flex-col md:flex-row md:items-end justify-between mb-12 border-b-4 border-primary-dark/10 pb-6 gap-6">
        <div className="text-left">
          <h1 className="text-5xl font-serif font-black text-tertiary dark:text-[#d4a373] tracking-tighter leading-none">
            My Squads
          </h1>
          <p className="text-primary-half dark:text-gray-400 mt-2 font-serif italic text-lg">
            Owner Registry // {ownedClubs.length} Created Circles
          </p>
        </div>

        <button
          className="flex items-center gap-2 bg-[#fdfdfd] dark:bg-[#252525] text-primary-dark dark:text-[#d4a373] px-6 py-2 border-2 border-primary-dark dark:border-[#d4a373] font-serif italic font-bold hover:bg-primary-dark hover:text-[#f4ebd0] transition-all shadow-[4px_4px_0px_rgba(92,64,51,0.2)]"
          onClick={() => router.push("/clubs/add")}
        >
          <Plus size={18} />
          Form New Circle
        </button>
      </header>

      {/* Show only filtered owned clubs */}
      {ownedClubs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {ownedClubs.map((club) => (
            <div key={club.id} className="relative group">
              {/* Settings button - absolute positioned, will stay on top */}
              <div className="absolute -top-3 -right-3 z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click from firing
                    router.push(`/clubs/settings/${club.id}`);
                  }}
                  className="p-2 bg-primary-dark text-[#f4ebd0] shadow-md hover:scale-110 transition-transform"
                  title="Modify Ledger"
                >
                  <Settings size={18} />
                </button>
              </div>

              {/* Added onClick and cursor-pointer to the card container */}
              <div 
                onClick={() => router.push(`/clubs/${club.id}`)}
                className="transition-transform hover:-rotate-1 duration-300 cursor-pointer"
              >
                <MyClubCard book={club} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState />
      )}

      {/* Footer Decoration */}
      <div className="mt-20 border-t border-dashed border-primary-dark/20 pt-8 text-center">
        <p className="font-mono text-[10px] uppercase text-primary-half opacity-50">
          BookPulse Literary Registry — End of List
        </p>
      </div>
    </div>
  );
};

export default MyClubsPage;