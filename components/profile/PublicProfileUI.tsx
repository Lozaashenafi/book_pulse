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
import Link from "next/link";
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
    <div className="pb-12 transition-colors duration-500">
      <div className="max-w-6xl mx-auto px-6">
        {/* HEADER: Library Bookmark Style */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between border-b-2 border-[#1a3f22]/20 pb-6 gap-4">
          <div className="relative">
            <h1 className="text-5xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373] tracking-tight mt-1">
              {data.name}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#8b5a2b] uppercase">
            File Ref: {data.id.slice(0, 8)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* --- LEFT COLUMN: IDENTITY --- */}
          <aside className="lg:col-span-4 space-y-8">
            <section className="relative bg-white dark:bg-[#25201e] p-8 shadow-[8px_8px_0px_rgba(92,64,51,0.1)] border-t-[12px] border-[#1a3f22]/30">
              <Pin
                className="absolute -top-5 right-8 text-gray-400 -rotate-12"
                size={32}
              />

              <div className="flex flex-col items-center text-center space-y-6">
                {/* Vintage Photo Frame */}
                <div className="w-40 h-40 bg-[#f4ebd0] dark:bg-[#1a1614] border-2 border-[#d6c7a1] p-2 shadow-inner">
                  <div className="w-full h-full bg-white overflow-hidden border border-[#d6c7a1]">
                    {data.image ? (
                      <img
                        src={data.image}
                        alt={data.name}
                        className="w-full h-full object-cover grayscale-[20%]"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8b5a2b] font-serif text-5xl font-bold bg-[#fcf8f1]">
                        {data.name[0]}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <h2 className="text-2xl font-serif font-bold text-[#1a3f22] dark:text-gray-100">
                    @{data.username}
                  </h2>
                  <p className="text-sm font-serif italic text-[#5a5a5a] dark:text-gray-400 px-2">
                    "{data.bio || "No manifesto provided."}"
                  </p>
                </div>

                <div className="w-full pt-4 border-t border-dashed border-gray-200 flex flex-col gap-3 text-[10px] font-mono font-bold text-[#8b5a2b] uppercase tracking-wider text-left">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-[#1a3f22]" />{" "}
                    {data.location || "The Archive"}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-[#1a3f22]" /> Inscribed{" "}
                    {joinDate}
                  </div>
                </div>
              </div>
            </section>

            {/* ACHIEVEMENTS: Wax Seal Style */}
            <div className="bg-[#f4ebd0] dark:bg-[#2c2420] p-6 border-2 border-[#d6c7a1] shadow-md space-y-4">
              <h4 className="text-[10px] font-mono font-black uppercase text-[#1a3f22] border-b border-[#d6c7a1] pb-2">
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
                      <div className="w-10 h-10 rounded-full border-2 border-dashed border-[#1a3f22] flex items-center justify-center text-[#1a3f22] group-hover:bg-[#1a3f22] group-hover:text-white transition-all">
                        {a.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black font-mono leading-none">
                          {a.label}
                        </span>
                        <span className="text-[8px] italic text-[#8b5a2b]">
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
            <section className="bg-white dark:bg-[#25201e] p-10 shadow-md border-l-[15px] border-[#1a3f22]/10 relative">
              <h3 className="text-2xl font-serif font-black text-[#1a3f22] dark:text-gray-100 mb-8 flex items-center gap-3">
                <Bookmark className="fill-[#1a3f22] text-[#1a3f22]" /> Active
                Circles
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.clubs.map((club: any) => (
                  <button
                    key={club.id}
                    onClick={() => router.push(`/clubs/${club.id}`)}
                    className="flex items-center justify-between p-4 bg-[#fcf8f1] dark:bg-[#2c2420] border border-[#d6c7a1] hover:border-[#1a3f22] transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-16 bg-white border border-[#d6c7a1] flex-shrink-0 overflow-hidden shadow-sm group-hover:rotate-2 transition-transform">
                        {club.cover ? (
                          <img
                            src={club.cover}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <BookOpen
                            size={20}
                            className="m-auto mt-6 opacity-10"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-serif font-bold text-sm text-[#1a3f22] truncate">
                          {club.name}
                        </p>
                        <p className="text-[9px] font-mono font-bold text-[#8b5a2b] uppercase">
                          {club.role}
                        </p>
                      </div>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-gray-300 group-hover:text-[#1a3f22] transition-colors"
                    />
                  </button>
                ))}
              </div>
              {data.clubs.length === 0 && (
                <p className="italic text-gray-400 font-serif">
                  No circles currently active...
                </p>
              )}
            </section>

            {/* TRANSMISSIONS: Dynamic Sticky Notes */}
            <section>
              <div className="flex items-center gap-4 mb-8">
                <h3 className="font-serif font-black text-2xl pt-4 uppercase tracking-tighter text-[#1a3f22]">
                  Scribe's Log
                </h3>
                <div className="h-[2px] flex-grow bg-[#1a3f22]/10" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {data.posts.map((post: any, idx: number) => {
                  const colors = [
                    "bg-[#feff9c]",
                    "bg-[#ff7eb9]",
                    "bg-[#7afaff]",
                    "bg-[#fff9f0]",
                  ];
                  const rotations = ["rotate-1", "-rotate-1", "rotate-2"];

                  return (
                    <article
                      key={post.id}
                      onClick={() => router.push(`/posts?id=${post.id}`)}
                      className={`cursor-pointer group relative p-8 shadow-lg min-h-[200px] flex flex-col transition-all hover:scale-[1.02] hover:z-10 ${colors[idx % 4]} ${rotations[idx % 3]}`}
                    >
                      <div className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-red-600 shadow-md flex items-center justify-center z-10">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      </div>

                      <div className="mb-4">
                        <span className="text-[9px] font-mono font-black text-black/30 uppercase tracking-widest border-b border-black/10">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-sm font-serif italic text-black/80 leading-relaxed flex-1">
                        "{post.content}"
                      </p>

                      <div className="mt-6 flex items-center gap-4 text-[10px] font-mono font-black uppercase text-black/40">
                        <div className="flex items-center gap-1">
                          <Heart size={12} /> {post.likeCount}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-auto">
                          Details <ArrowRight size={10} />
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
              {data.posts.length === 0 && (
                <p className="font-serif italic text-gray-400">
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
