"use client";

import React from "react";
import {
  Users,
  BookOpen,
  ArrowRight,
  MessageCircle,
  Quote,
  Paperclip,
  Bookmark,
  Lock,
  Hash,
  FileText,
  Zap,
  CheckCircle2,
  PenTool,
  Heart,
  Layout,
  Globe,
} from "lucide-react";
import { useRouter } from "next/navigation";

const BookPulseHero = () => {
  const router = useRouter();

  return (
    <div className="bg-[#fdfcf8] dark:bg-[#1a1614] transition-colors duration-500">
      {/* --- SECTION 1: THE HERO ENTRANCE --- */}
      <section className="relative min-h-screen pt-40 pb-20 overflow-hidden flex flex-col items-center">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #1a3f22, #1a3f22 1px, transparent 1px, transparent 40px)",
          }}
        />

        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          {/* Library Stamp Badge */}
          <div className="inline-block border-2 border-dashed border-tertiary/30 dark:border-[#d4a373]/30 p-2 rotate-[-2deg] mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="bg-[#f4ebd0] dark:bg-tertiary/20 px-4 py-1">
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-tertiary dark:text-[#d4a373]">
                Library Archives
              </span>
            </div>
          </div>

          <h1 className="text-6xl md:text-8xl font-serif font-black text-tertiary dark:text-gray-100 leading-[0.95] tracking-tighter mb-8">
            The finest stories <br />
            are{" "}
            <span className="text-[#d4a373] italic relative inline-block">
              shared.
              <svg
                className="absolute -bottom-2 left-0 w-full h-4 text-[#d4a373]/30 -z-10"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
              >
                <path
                  d="M0 5 Q 25 0 50 5 T 100 5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-[#5a5a5a] dark:text-gray-400 font-serif italic max-w-2xl mx-auto leading-relaxed mb-12">
            “Reading doesn’t have to be a solo journey. BookPulse lets curious
            minds create digital book circles and experience books together.”
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-24">
            <button
              onClick={() => router.push("/clubs/add")}
              className="group w-full sm:w-auto bg-tertiary dark:bg-[#d4a373] text-[#f4ebd0] dark:text-[#1a1614] px-10 py-5 font-serif font-black italic text-lg shadow-[8px_8px_0px_#d4a373] dark:shadow-[8px_8px_0px_#1a3f22] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center space-x-3"
            >
              <span>Start a Reading Circle</span>
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </button>

            <button
              onClick={() => router.push("/explore")}
              className="w-full sm:w-auto bg-transparent border-2 border-tertiary/20 dark:border-white/10 text-tertiary dark:text-[#d4a373] px-10 py-5 rounded-none font-serif font-bold text-lg hover:bg-tertiary/5 transition-all"
            >
              Browse Popular Clubs
            </button>
          </div>
        </div>

        {/* Decorative Bookmark */}
        <div className="absolute top-0 right-20 w-12 h-40 bg-tertiary dark:bg-[#d4a373] shadow-md hidden lg:block animate-in slide-in-from-top-10 duration-1000">
          <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[24px] border-l-transparent border-r-[24px] border-r-transparent border-b-[20px] border-b-[#fdfcf8] dark:border-b-[#1a1614]" />
          <Bookmark
            className="mx-auto mt-4 text-[#f4ebd0] dark:text-[#1a1614]"
            size={20}
          />
        </div>
      </section>

      {/* --- SECTION 2: HOW IT WORKS (3 STEPS) --- */}
      <section className="py-24 bg-[#f4ebd0] dark:bg-[#2c2420] border-y-2 border-[#d6c7a1] dark:border-[#3e2b22]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif font-black text-tertiary dark:text-[#d4a373]">
              How We Read Together
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <StepCard
              number="01"
              title="Pick a Book"
              desc="Create or join a club. Upload a PDF to use our built-in reader, and set chapter goals for your group."
              icon={<FileText size={24} />}
            />
            <StepCard
              number="02"
              title="No Spoilers"
              desc="Log your progress as you read. Chapter chats only unlock when you reach them, so nobody ruins the ending."
              icon={<Lock size={24} />}
            />
            <StepCard
              number="03"
              title="Save Moments"
              desc="Share thoughts on the public feed or save private notes. Turn your favorite quotes into beautiful image cards."
              icon={<PenTool size={24} />}
            />
          </div>
        </div>
      </section>

      {/* --- SECTION 3: THE DIGITAL SANCTUARY (FEATURES) --- */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            {/* Feature Content */}
            <div className="lg:w-1/2 space-y-8">
              <h3 className="text-4xl font-serif font-black text-tertiary dark:text-[#d4a373]">
                Your Reading Identity
              </h3>

              <div className="space-y-6">
                <FeatureItem
                  icon={<Globe size={20} />}
                  title="Public Archives"
                  text="Every reader gets a unique profile link. Show off the clubs you've founded and the 'scribbles' you've shared."
                />
                <FeatureItem
                  icon={<Heart size={20} />}
                  title="Community Feed"
                  text="Interact with other readers. Like, share, and discover what the world is currently reading."
                />
                <FeatureItem
                  icon={<Layout size={20} />}
                  title="Personal Shelf"
                  text="Manage your reading list from a clean dashboard. See exactly how far you are in every book."
                />
              </div>
            </div>

            {/* Feature Visual: Mock Sticky Note Stack */}
            <div className="lg:w-1/2 relative">
              <div className="absolute -top-10 -right-10 text-gray-200 opacity-20 rotate-12">
                <BookOpen size={200} />
              </div>
              <div className="relative bg-white dark:bg-[#252525] p-8 border-2 border-tertiary shadow-[15px_15px_0px_#d4a373] rotate-2">
                <div className="flex items-center gap-2 mb-4 border-b pb-2">
                  <Hash size={16} className="text-[#d4a373]" />
                  <span className="font-mono text-[10px] font-black uppercase">
                    Archive Preview: #Midnight_Classics
                  </span>
                </div>
                <p className="font-serif italic text-lg text-tertiary dark:text-gray-300 leading-relaxed">
                  Just finished "The Great Gatsby" with my book circle. The last
                  chapter was a rollercoaster of emotions. Can't believe how
                  much symbolism I missed on the first read!
                </p>
                <div className="mt-6 flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-primary-half">
                    READER: loza_ashenafi
                  </span>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-[#feff9c] rounded-sm border border-black/5 shadow-sm"></div>
                    <div className="w-4 h-4 bg-[#ff7eb9] rounded-sm border border-black/5 shadow-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA --- */}
      <section className="py-24 text-center">
        <div className="max-w-2xl mx-auto px-6 bg-white dark:bg-[#252525] p-12 border-2 border-dashed border-[#d6c7a1] relative">
          <Paperclip
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-gray-300"
            size={40}
          />
          <h2 className="text-3xl font-serif font-black text-tertiary dark:text-[#d4a373] mb-6">
            Ready to turn the next page?
          </h2>
          <p className="text-primary-half mb-10 font-serif italic">
            Join a community of passionate readers and experience books like
            never before.
          </p>
          <button
            onClick={() => router.push("/register")}
            className="bg-tertiary dark:bg-[#d4a373] text-[#f4ebd0] dark:text-[#1a1614] px-12 py-4 font-serif font-black italic text-xl shadow-[6px_6px_0px_#d4a373] hover:translate-y-1 hover:shadow-none transition-all"
          >
            Join The Pulse
          </button>
        </div>
      </section>
    </div>
  );
};

const FeatureItem = ({ icon, title, text }: any) => (
  <div className="flex gap-4">
    <div className="shrink-0 w-10 h-10 rounded bg-tertiary/10 flex items-center justify-center text-tertiary dark:text-[#d4a373]">
      {icon}
    </div>
    <div>
      <h4 className="font-bold text-tertiary dark:text-gray-100">{title}</h4>
      <p className="text-sm text-primary-half leading-relaxed">{text}</p>
    </div>
  </div>
);

// --- HELPER COMPONENTS ---

const StepCard = ({ number, title, desc, icon }: any) => (
  <div className="flex flex-col items-center text-center space-y-4 group">
    <div className="w-16 h-16 bg-white dark:bg-[#1a1614] border-2 border-tertiary flex items-center justify-center text-tertiary dark:text-[#d4a373] shadow-[5px_5px_0px_#1a3f22] relative">
      <span className="absolute -top-3 -left-3 bg-[#d4a373] text-tertiary text-[10px] font-mono font-black px-1.5 py-0.5">
        {number}
      </span>
      {icon}
    </div>
    <h3 className="font-serif font-black text-xl text-tertiary dark:text-gray-100">
      {title}
    </h3>
    <p className="text-sm font-serif italic text-primary-half dark:text-gray-400 leading-relaxed">
      {desc}
    </p>
  </div>
);

export default BookPulseHero;
