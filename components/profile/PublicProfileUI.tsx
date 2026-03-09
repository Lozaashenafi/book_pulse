"use client";

import React from "react";
import {
  MapPin,
  Calendar,
  BookOpen,
  Heart,
  Quote,
  UserCircle,
  Award,
  Users,
  ArrowRight,
  Pin,
  Bookmark,
} from "lucide-react";
import { useRouter } from "next/navigation";

const PublicProfileUI = ({ data }: { data: any }) => {
  const router = useRouter();

  const joinDate = new Date(data.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  // Achievement Logic based on stats
  const achievements = [
    {
      show: data.role === "admin",
      label: "CURATOR",
      icon: <Award size={14} />,
      desc: "Master of Archives",
    },
    {
      show: data.clubs.length > 0,
      label: "FELLOW",
      icon: <Users size={14} />,
      desc: "Circle Member",
    },
    {
      show: data.posts.length > 5,
      label: "SCRIBE",
      icon: <Quote size={14} />,
      desc: "Frequent Poster",
    },
  ];

  return (
    <div className="pb-12 transition-colors duration-500 bg-[#fcf8f1] dark:bg-[#1a1614] min-h-screen">
      <div className="max-w-6xl mx-auto px-6">
        {/* HEADER: Library Bookmark Style */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#1a3f22]/20 dark:border-[#d4a373]/20 pb-6 gap-4">
          <div className="relative pt-10">
            <h1 className="text-5xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373] tracking-tight mt-1">
              {data.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-primary-half dark:text-[#d4a373]/70 uppercase">
            File Ref: {data.id.slice(0, 8)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- LEFT COLUMN: IDENTITY --- */}
          <aside className="lg:col-span-4 space-y-8">
            <section className="relative bg-white dark:bg-[#2c2420] p-8 shadow-[8px_8px_0px_rgba(92,64,51,0.1)] dark:shadow-[8px_8px_0px_rgba(0,0,0,0.3)] border-t-[12px] border-[#1a3f22]/30 dark:border-[#d4a373]/30">
              <Pin
                className="absolute -top-5 right-8 text-gray-400 dark:text-stone-600 -rotate-12"
                size={32}
              />

              <div className="flex flex-col items-center text-center space-y-6">
                {/* Vintage Photo Frame */}
                <div className="w-40 h-40 bg-[#f4ebd0] dark:bg-[#1a1614] border-2 border-[#d6c7a1] dark:border-[#d4a373]/20 p-2 shadow-inner">
                  <div className="w-full h-full bg-white dark:bg-[#25201e] overflow-hidden border border-[#d6c7a1] dark:border-[#d4a373]/20">
                    {data.image ? (
                      <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-full object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary-half dark:text-[#d4a373] font-serif text-5xl font-bold bg-[#fcf8f1] dark:bg-[#1c1917]">
                        {data.name[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-[#1a3f22] dark:text-[#d4a373]">
                    @{data.username}
                  </h2>
                  <p className="text-sm font-serif italic text-[#5a5a5a] dark:text-stone-400 px-2 leading-relaxed">
                    "{data.bio || "No manifesto provided."}"
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-dashed border-gray-200 dark:border-stone-700 flex flex-col gap-3 text-[10px] font-mono font-bold text-primary-half dark:text-[#d4a373] uppercase tracking-wider text-left">
                  <div className="flex items-center gap-2">
                    <MapPin
                      size={14}
                      className="text-[#1a3f22] dark:text-[#d4a373]"
                    />{" "}
                    {data.location || "The Archive"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar
                      size={14}
                      className="text-[#1a3f22] dark:text-[#d4a373]"
                    />{" "}
                    Inscribed {joinDate}
                  </div>
                </div>
              </div>
            </section>

            {/* ACHIEVEMENTS: Wax Seal Style */}
            <div className="bg-[#f4ebd0] dark:bg-[#2c2420] p-6 border-2 border-[#d6c7a1] dark:border-[#d4a373]/20 shadow-md space-y-4">
              <h4 className="text-[10px] font-mono font-black uppercase text-[#1a3f22] dark:text-[#d4a373] border-b border-[#d6c7a1] dark:border-[#d4a373]/20 pb-2">
                Recognition Seals
              </h4>
              <div className="flex flex-wrap gap-4">
                {achievements
                  .filter((a) => a.show)
                  .map((a, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 group"
                      title={a.desc}
                    >
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#1a3f22] dark:border-[#d4a373] flex items-center justify-center text-[#1a3f22] dark:text-[#d4a373] group-hover:bg-[#1a3f22] dark:group-hover:bg-[#d4a373] group-hover:text-white dark:group-hover:text-[#1a1614] transition-all">
                        {a.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black font-mono leading-none dark:text-stone-300">
                          {a.label}
                        </span>
                        <span className="text-[8px] italic text-primary-half dark:text-[#d4a373]/70">
                          {a.desc}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </aside>

          {/* --- RIGHT COLUMN: ACTIVITY --- */}
          <main className="lg:col-span-8 space-y-12">
            {/* ACTIVE CIRCLES: Library Card Drawer */}
            <section className="bg-white dark:bg-[#2c2420] p-10 shadow-md border-l-[15px] border-[#1a3f22]/10 dark:border-[#d4a373]/10 relative">
              <h3 className="text-2xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373] mb-8 flex items-center gap-3">
                <Bookmark className="fill-[#1a3f22] text-[#1a3f22] dark:fill-[#d4a373] dark:text-[#d4a373]" />{" "}
                Active Circles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.clubs.map((club: any) => (
                  <button
                    key={club.id}
                    onClick={() => router.push(`/clubs/${club.id}`)}
                    className="flex items-center justify-between p-4 bg-[#fcf8f1] dark:bg-[#1c1917] border border-[#d6c7a1] dark:border-[#d4a373]/20 hover:border-[#1a3f22] dark:hover:border-[#d4a373] transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-white dark:bg-[#2c2420] border border-[#d6c7a1] dark:border-stone-700 flex-shrink-0 overflow-hidden shadow-sm group-hover:rotate-2 transition-transform">
                        {club.cover ? (
                          <img
                            src={club.cover}
                            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
                            alt="club cover"
                          />
                        ) : (
                          <BookOpen
                            size={20}
                            className="m-auto mt-6 opacity-10 dark:text-[#d4a373]"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-sm text-[#1a3f22] dark:text-[#d4a373] truncate">
                          {club.name}
                        </p>
                        <p className="text-[9px] font-mono font-bold text-primary-half dark:text-[#d4a373]/60 uppercase">
                          {club.role}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-300 dark:text-stone-600 group-hover:text-[#1a3f22] dark:group-hover:text-[#d4a373] transition-colors"
                    />
                  </button>
                ))}
              </div>
              {data.clubs.length === 0 && (
                <p className="italic text-gray-400 dark:text-stone-500 font-serif">
                  No circles currently active...
                </p>
              )}
            </section>

            {/* TRANSMISSIONS: Dynamic Sticky Notes */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="font-serif font-black text-2xl pt-4 uppercase tracking-tighter text-[#1a3f22] dark:text-[#d4a373]">
                  Scribe's Log
                </h3>
                <div className="h-[2px] flex-grow bg-[#1a3f22]/10 dark:bg-[#d4a373]/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.posts.map((post: any, idx: number) => {
                  const colors = [
                    "bg-[#feff9c] dark:bg-[#c4c562]",
                    "bg-[#ff7eb9] dark:bg-[#a35278]",
                    "bg-[#7afaff] dark:bg-[#4a9ea3]",
                    "bg-[#fff9f0] dark:bg-[#2c2420]",
                  ];
                  const rotations = ["rotate-1", "-rotate-1", "rotate-2"];

                  return (
                    <article
                      key={post.id}
                      onClick={() => router.push(`/posts?id=${post.id}`)}
                      className={`cursor-pointer group relative p-8 shadow-lg min-h-[200px] flex flex-col transition-all hover:scale-[1.02] hover:z-10 ${colors[idx % 4]} ${rotations[idx % 3]} border border-black/5 dark:border-white/5`}
                    >
                      <div className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-red-600 shadow-md flex items-center justify-center z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      </div>

                      <div className="mb-4">
                        <span className="text-[9px] font-mono font-black text-black/30 dark:text-black/50 uppercase tracking-widest border-b border-black/10 dark:border-black/20">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm font-serif italic text-black/80 dark:text-stone-100 leading-relaxed flex-1">
                        "{post.content}"
                      </p>

                      <div className="mt-6 flex items-center gap-4 text-[10px] font-mono font-black uppercase text-black/40 dark:text-stone-300/60">
                        <div className="flex items-center gap-1">
                          <Heart
                            size={12}
                            className="fill-current opacity-50"
                          />{" "}
                          {post.likeCount}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-black dark:text-white">
                          Details <ArrowRight size={10} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {data.posts.length === 0 && (
                <p className="font-serif italic text-gray-400 dark:text-stone-500">
                  The transmission log is empty.
                </p>
              )}
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileUI;
