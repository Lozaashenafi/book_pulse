"use client";

import { useEffect } from "react";
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
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useProfileData } from "@/hooks/useProfileData";

const BookPulseProfile = () => {
  const router = useRouter();
  const { profile, user, isLoading: authLoading } = useAuthStore();

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

  if (authLoading || dataLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-soft-white dark:bg-[#121212]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  const initials =
    profile?.name
      ?.split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase() || "??";

  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Recently";

  const statConfig = [
    { label: "Books Read", value: stats.booksRead, icon: <Book size={18} /> },
    { label: "Circles", value: stats.circles, icon: <Users size={18} /> },
    {
      label: "Discussions",
      value: stats.discussions,
      icon: <MessageSquare size={18} />,
    },
  ];

  return (
    <div className="min-h-screen bg-soft-white dark:bg-[#121212] transition-colors duration-500 pt-32 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        {/* PROFILE HEADER CARD */}
        <div className="relative bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-primary/5 dark:border-white/5 overflow-hidden mb-8">
          {/* Decorative Corner */}
          <div className="absolute top-0 right-0 w-40 h-40 border-t-2 border-r-2 border-primary/5 dark:border-white/5 rounded-tr-[2.5rem] pointer-events-none" />

          <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 relative z-10">
            {/* 1. Avatar & Identity Section */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-1">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-primary to-[#d4a373] p-1 shadow-inner">
                  <div className="w-full h-full rounded-full bg-soft-white dark:bg-[#121212] flex items-center justify-center overflow-hidden">
                    {profile?.image ? (
                      <img
                        src={profile.image}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-serif font-bold text-primary dark:text-[#d4a373]">
                        {initials}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className="absolute bottom-0 right-0 bg-white dark:bg-[#2d2d2d] p-2 rounded-full shadow-lg border border-primary/10 text-primary dark:text-[#d4a373] hover:scale-110 transition-transform"
                  onClick={() => router.push("/settings")}
                >
                  <Settings size={16} />
                </button>
              </div>

              {/* Name & Bio */}
              <div className="text-center md:text-left space-y-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark-secondary dark:text-gray-100">
                      {profile?.name || "New Reader"}
                    </h1>
                    <span className="px-3 py-1 bg-green-light dark:bg-green-900/20 text-green-dark2 dark:text-green-300 text-[10px] font-bold rounded-full uppercase tracking-widest border border-green-dark2/10">
                      {profile?.role === "admin"
                        ? "Curator"
                        : "Prolific Reader"}
                    </span>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm">
                    @{profile?.username || "reader"}
                  </p>
                </div>

                <p className="text-[#5a5a5a] dark:text-gray-400 max-w-md leading-relaxed text-sm">
                  {profile?.bio ||
                    "Lover of stories and shared perspectives. Join my circles to discuss the latest plot twists together."}
                </p>

                <div className="flex flex-wrap justify-center md:justify-start gap-5 text-xs font-bold text-[#7a7a7a] dark:text-gray-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />{" "}
                    <span>{profile?.location || "Earth"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-primary" />{" "}
                    <span>Joined {joinedDate}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Stats Grid Section */}
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-4 w-full lg:w-48">
              {statConfig.map((stat, i) => (
                <div
                  key={i}
                  className="bg-soft-white dark:bg-[#121212] p-4 rounded-2xl border border-primary/5 flex flex-col items-center lg:items-start transition-all hover:border-primary/20"
                >
                  <div className="text-primary dark:text-[#d4a373] mb-1">
                    {stat.icon}
                  </div>
                  <div className="text-xl font-black text-dark-secondary dark:text-white">
                    {stat.value}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-tighter text-gray-400">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Side: Library & Progress */}
          <div className="lg:col-span-2 space-y-8">
            {/* Currently Reading */}
            <section className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-[2rem] border border-primary/5">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif font-bold text-dark-secondary dark:text-gray-100 flex items-center gap-3">
                  <Bookmark className="text-primary dark:text-[#d4a373]" />{" "}
                  Reading Now
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {currentReads.length > 0 ? (
                  currentReads.map((book, i) => (
                    <div
                      key={i}
                      className="group bg-soft-white dark:bg-[#121212] p-5 rounded-2xl border border-primary/5 hover:border-primary/20 transition-all flex gap-5"
                    >
                      <div className="w-20 h-28 bg-primary/10 rounded-xl flex-shrink-0 flex items-center justify-center text-primary/40 text-[10px] font-bold border border-primary/10 rotate-1 group-hover:rotate-0 transition-transform">
                        BOOK
                      </div>
                      <div className="flex flex-col justify-between py-1 w-full">
                        <div className="space-y-1">
                          <h4 className="font-bold text-sm text-dark-secondary dark:text-gray-200 line-clamp-1">
                            {book.title}
                          </h4>
                          <p className="text-xs text-gray-500 font-medium">
                            by {book.author}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span className="text-primary dark:text-[#d4a373]">
                              {book.progress}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-primary dark:bg-[#d4a373] h-full transition-all duration-700"
                              style={{ width: `${book.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center text-gray-400 border-2 border-dashed border-primary/10 rounded-[1.5rem] font-medium italic">
                    Your reading list is empty. Explore some circles!
                  </div>
                )}
              </div>
            </section>

            {/* Milestones */}
            <section className="bg-white dark:bg-[#1a1a1a] p-6 md:p-8 rounded-[2rem] border border-primary/5">
              <h2 className="text-2xl font-serif font-bold text-dark-secondary dark:text-gray-100 mb-8 flex items-center gap-3">
                <Award className="text-primary dark:text-[#d4a373]" /> Reading
                Milestones
              </h2>
              <div className="flex flex-wrap gap-6">
                {stats.booksRead > 0 && (
                  <div
                    title="Finished your first book"
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/10 transition-transform group-hover:-translate-y-1">
                      <Award size={32} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">
                      FINISHER
                    </span>
                  </div>
                )}
                {stats.circles > 0 && (
                  <div
                    title="Joined a community circle"
                    className="group flex flex-col items-center gap-2"
                  >
                    <div className="w-16 h-16 rounded-2xl bg-secondary dark:bg-[#d4a373]/10 flex items-center justify-center text-[#d4a373] border border-primary/10 transition-transform group-hover:-translate-y-1">
                      <Users size={32} />
                    </div>
                    <span className="text-[10px] font-bold text-gray-500">
                      SOCIAL
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Right Side: Sidebar Circles */}
          <div className="lg:col-span-1 h-full">
            <div className="bg-white dark:bg-[#1a1a1a] rounded-[2rem] p-8 border border-primary/5 sticky top-32">
              <h3 className="text-xl font-serif font-bold text-dark-secondary dark:text-gray-100 mb-8 flex items-center gap-3">
                <Users size={20} className="text-primary dark:text-[#d4a373]" />{" "}
                Active Circles
              </h3>

              <div className="space-y-4">
                {activeCircles.map((circle: any) => (
                  <button
                    key={circle.id}
                    onClick={() => router.push(`/club/${circle.id}`)}
                    className="w-full flex items-center justify-between p-4 rounded-2xl bg-soft-white dark:bg-[#121212] border border-transparent hover:border-primary/20 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary dark:text-[#d4a373] font-black text-sm">
                        {circle.name[0]}
                      </div>
                      <span className="font-bold text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">
                        {circle.name}
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      className="text-gray-400 group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                ))}
              </div>

              <button
                onClick={() => router.push("/explore")}
                className="w-full mt-10 py-4 rounded-2xl bg-primary dark:bg-[#d4a373] text-white dark:text-[#1a1a1a] font-bold text-sm shadow-xl shadow-primary/10 hover:-translate-y-1 transition-all active:scale-95"
              >
                Join New Circle
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookPulseProfile;
