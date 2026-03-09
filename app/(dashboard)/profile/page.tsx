"use client";

import { useEffect, useState } from "react";
import {
  Settings,
  Book,
  Users,
  MessageSquare,
  Award,
  Bookmark,
  MapPin,
  Calendar,
  ChevronRight,
  Loader2,
  Paperclip,
  ArrowRight,
  Eye,
  Link as LinkIcon,
  Check,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useProfileData } from "@/hooks/useProfileData";
import { toast } from "sonner";
import CuratorLoader from "@/components/ui/CuratorLoader";

const BookPulseProfile = () => {
  const router = useRouter();
  const { profile, user, isLoading: authLoading } = useAuthStore();
  const [copied, setCopied] = useState(false);

  const {
    stats,
    currentReads,
    activeCircles,
    isLoading: dataLoading,
  } = useProfileData(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  const handleCopyLink = () => {
    if (!profile?.username) return;
    const url = `${window.location.origin}/profile/${profile.username}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Public user link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CuratorLoader />
      </div>
    );
  }

  const initials =
    profile?.name
      ?.split(" ")
      .map((n: any) => n[0])
      .join("")
      .toUpperCase() || "??";
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  return (
    <div className="pb-12 transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        {/* HEADER: Library Bookmark Style */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b-2 border-primary-dark/20 pb-6 gap-6">
          <div className="relative">
            <h1 className="text-5xl pt-4 font-serif font-black text-tertiary dark:text-[#d4a373] tracking-tighter leading-none">
              The Reading Shelf
            </h1>
            <p className="text-[#8b5a2b] dark:text-gray-400 mt-2 font-serif italic text-lg">
              {" "}
              Curated by {profile?.name || "Anonymous Reader"}
            </p>
          </div>

          {/* NEW: Action Bar for Public View & Sharing */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => router.push(`/profile/${profile?.username}`)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#2c2420] border-2 border-primary-dark text-primary-dark dark:text-[#d4a373] font-mono text-[10px] font-black uppercase tracking-widest hover:bg-primary-dark hover:text-white transition-all shadow-[4px_4px_0px_rgba(26,63,34,0.1)]"
            >
              <Eye size={14} /> View Public Dossier
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2 bg-[#f4ebd0] border-2 border-[#d6c7a1] text-[#8b5a2b] font-mono text-[10px] font-black uppercase tracking-widest hover:border-[#8b5a2b] transition-all"
            >
              {copied ? <Check size={14} /> : <LinkIcon size={14} />}
              {copied ? "Link Copied" : "Share"}
            </button>

            <button
              onClick={() => router.push("/settings")}
              className="flex items-center gap-2 px-4 py-2 text-primary-dark dark:text-[#d4a373] font-mono text-[10px] font-black uppercase tracking-widest hover:underline"
            >
              <Settings size={14} /> Modify Setup
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* ... (Rest of your Left/Right columns stay exactly the same) ... */}
          {/* LEFT COLUMN: Profile Card */}
          <div className="lg:col-span-4 space-y-8">
            <section className="relative bg-white dark:bg-[#25201e] p-8 shadow-[8px_8px_0px_rgba(92,64,51,0.1)] border-t-[12px] border-[#8b5a2b]/30">
              <Paperclip
                className="absolute -top-5 right-8 text-gray-400 -rotate-12"
                size={32}
              />
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-40 h-40 bg-[#f4ebd0] dark:bg-[#1a1614] border-2 border-[#d6c7a1] dark:border-primary-dark p-2 shadow-inner">
                  <div className="w-full h-full bg-white dark:bg-[#2c2420] overflow-hidden border border-[#d6c7a1] dark:border-primary-dark">
                    {profile?.image ? (
                      <img
                        src={profile.image}
                        alt="Profile"
                        className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8b5a2b] dark:text-[#d4a373] font-serif text-5xl font-bold">
                        {initials}
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-3 py-0.5 bg-[#f4ebd0] dark:bg-amber-900/20 text-[#8b5a2b] dark:text-[#d4a373] text-[10px] font-bold uppercase tracking-widest border border-[#d6c7a1] dark:border-primary-dark">
                    {profile?.role === "admin"
                      ? "Master Curator"
                      : "Prolific Reader"}
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-primary-dark dark:text-gray-100">
                    @{profile?.username || "reader"}
                  </h2>
                </div>
                <p className="text-sm font-serif italic leading-relaxed text-[#5a5a5a] dark:text-gray-400">
                  "{profile?.bio || "Lover of stories and shared perspectives."}
                  "
                </p>
                <div className="w-full pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 flex flex-col gap-3 text-[10px] font-mono font-bold text-[#8b5a2b] dark:text-[#d4a373] uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} /> {profile?.location || "Lost in a book"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} /> Member since {joinedDate}
                  </div>
                </div>
              </div>
            </section>
            <div className="bg-[#f4ebd0] dark:bg-[#2c2420] p-6 border-2 border-[#d6c7a1] dark:border-primary-dark shadow-md grid grid-cols-3 gap-2">
              <StatItem label="Read" value={stats.booksRead} />
              <StatItem label="Circles" value={stats.circles} />
              <StatItem label="Posts" value={stats.discussions} />
            </div>
          </div>

          {/* RIGHT COLUMN: Content */}
          <div className="lg:col-span-8 space-y-10">
            {/* READING NOW */}
            <section className="bg-white dark:bg-[#25201e] p-10 shadow-md border-l-[15px] border-primary-dark/10 dark:border-[#d4a373]/10 relative">
              <h3 className="text-2xl font-serif font-black text-primary-dark dark:text-gray-100 mb-8 flex items-center gap-3">
                <Bookmark className="fill-[#8b5a2b] text-[#8b5a2b] dark:fill-[#d4a373] dark:text-[#d4a373]" />{" "}
                Currently Deviating
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {currentReads.length > 0 ? (
                  currentReads.map((book, i) => (
                    <div key={i} className="group relative">
                      <div className="flex gap-4">
                        <div className="w-16 h-24 bg-primary-dark/10 dark:bg-[#d4a373]/10 border border-primary-dark/20 flex-shrink-0 flex items-center justify-center font-mono text-[10px] -rotate-2 group-hover:rotate-0 transition-transform text-primary-dark dark:text-[#d4a373]">
                          COVER
                        </div>
                        <div className="flex flex-col justify-between py-1">
                          <div>
                            <h4 className="font-serif font-bold text-primary-dark dark:text-gray-200 leading-tight">
                              {book.title}
                            </h4>
                            <p className="text-xs italic text-gray-500">
                              by {book.author}
                            </p>
                          </div>
                          <div className="mt-4 space-y-1">
                            <div className="flex justify-between text-[9px] font-mono font-black text-[#8b5a2b] dark:text-[#d4a373]">
                              <span>PROGRESS</span>
                              <span>{book.progress}%</span>
                            </div>
                            <div className="w-32 bg-gray-100 dark:bg-white/5 h-1 border border-gray-200 dark:border-gray-800">
                              <div
                                className="bg-[#8b5a2b] dark:bg-[#d4a373] h-full transition-all duration-1000"
                                style={{ width: `${book.progress}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="italic text-gray-400 font-serif">
                    The shelf is empty for now...
                  </p>
                )}
              </div>
            </section>

            {/* ACTIVE CIRCLES */}
            <section className="bg-[#fdfcf8] dark:bg-[#25201e] p-10 border-2 border-dashed border-[#d6c7a1] dark:border-primary-dark">
              <h3 className="text-2xl font-serif font-black text-primary-dark dark:text-gray-100 mb-8 flex items-center gap-3">
                <Users className="text-[#8b5a2b] dark:text-[#d4a373]" /> Active
                Circles
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCircles.map((circle: any) => (
                  <button
                    key={circle.id}
                    onClick={() => router.push(`/clubs/${circle.id}`)}
                    className="flex items-center justify-between p-4 bg-white dark:bg-[#2c2420] border border-[#d6c7a1] dark:border-primary-dark hover:border-primary-dark dark:hover:border-[#d4a373] hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-[#f4ebd0] dark:bg-[#1a1614] flex items-center justify-center font-serif font-bold text-primary-dark dark:text-[#d4a373]">
                        {circle?.name?.[0] || "?"}
                      </div>
                      <span className="font-serif font-bold text-sm text-primary-dark dark:text-gray-200">
                        {circle.name}
                      </span>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-300 group-hover:text-primary-dark dark:group-hover:text-[#d4a373] transition-colors"
                    />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: number }) => (
  <div className="text-center p-2 border border-[#d6c7a1]/50 dark:border-primary-dark/50">
    <div className="text-xl font-serif font-black text-primary-dark dark:text-[#d4a373]">
      {value}
    </div>
    <div className="text-[9px] font-mono font-bold text-[#8b5a2b] dark:text-[#d4a373]/70 uppercase tracking-tighter">
      {label}
    </div>
  </div>
);

export default BookPulseProfile;
