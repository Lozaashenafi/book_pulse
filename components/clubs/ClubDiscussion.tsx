"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  AlertTriangle,
  Lock,
  Send,
  Users,
  BookOpen,
  Hash,
  Paperclip,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

// Mock Data based on your schema
const MOCK_CHAPTERS = [
  { id: "c1", chapterNumber: 1, title: "The Beginning", endPage: 50 },
  { id: "c2", chapterNumber: 2, title: "A Hidden Truth", endPage: 120 },
  { id: "c3", chapterNumber: 3, title: "The Confrontation", endPage: 200 },
];

const ClubDiscussion = ({ params }: { params: { id: string } }) => {
  const { user, profile } = useAuthStore();
  const [activeRoom, setActiveRoom] = useState<{
    id: string;
    type: string;
    title: string;
  }>({
    id: "gen-1",
    type: "GENERAL",
    title: "General Scribbles",
  });

  // Logic: User current page (from reading_progress table)
  const userCurrentPage = 135;
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = {
      id: Date.now().toString(),
      content: input,
      userId: user?.id,
      userName: profile?.name || "Reader",
      userImage: profile?.image,
      createdAt: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInput("");
  };

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col md:flex-row gap-6 pb-6 overflow-hidden">
      {/* --- LEFT SIDEBAR: ROOM SELECTION (Archive Index) --- */}
      <aside className="w-full md:w-72 flex flex-col gap-4 shrink-0">
        <div className="bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] p-5 shadow-[4px_4px_0px_#bcab79]">
          <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#8b5a2b] mb-4 border-b border-[#d6c7a1] pb-2">
            Discussion Index
          </h3>

          <nav className="space-y-2">
            <RoomButton
              icon={<MessageSquare size={16} />}
              label="General Chat"
              active={activeRoom.type === "GENERAL"}
              onClick={() =>
                setActiveRoom({
                  id: "gen-1",
                  type: "GENERAL",
                  title: "General Scribbles",
                })
              }
            />
            <RoomButton
              icon={<AlertTriangle size={16} />}
              label="Spoiler Zone"
              color="text-red-600"
              active={activeRoom.type === "SPOILER"}
              onClick={() =>
                setActiveRoom({
                  id: "spoil-1",
                  type: "SPOILER",
                  title: "The Spoiler Vault",
                })
              }
            />
          </nav>

          <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#8b5a2b] mt-8 mb-4 border-b border-[#d6c7a1] pb-2">
            Chapter Archives
          </h3>
          <nav className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {MOCK_CHAPTERS.map((ch) => {
              const isLocked = userCurrentPage < ch.endPage;
              return (
                <button
                  key={ch.id}
                  disabled={isLocked}
                  onClick={() =>
                    setActiveRoom({
                      id: ch.id,
                      type: "CHAPTER",
                      title: `Chapter ${ch.chapterNumber}: ${ch.title}`,
                    })
                  }
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs font-serif font-bold transition-all border-b border-transparent hover:bg-white/50 ${
                    activeRoom.id === ch.id
                      ? "bg-[#1a3f22] text-[#f4ebd0]"
                      : "text-[#5c4033]"
                  } ${isLocked ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-2">
                    {isLocked ? <Lock size={12} /> : <Hash size={12} />}
                    <span>Ch. {ch.chapterNumber}</span>
                  </div>
                  {!isLocked && <ChevronRight size={12} />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Club Rules Card */}
        <div className="bg-white dark:bg-[#252525] border-2 border-dashed border-[#d6c7a1] p-4">
          <p className="text-[9px] font-mono text-[#8b5a2b] uppercase mb-2 font-black">
            Reading Protocol:
          </p>
          <p className="text-[11px] font-serif italic text-[#5c4033] dark:text-gray-400">
            Keep spoilers in the designated vault. Chapters unlock automatically
            as you log progress.
          </p>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA: THE LEDGER --- */}
      <main className="flex-1 bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-[#1a3f22]/10 shadow-[8px_8px_0px_rgba(26,63,34,0.05)] flex flex-col relative overflow-hidden">
        {/* Chat Header */}
        <header className="px-6 py-4 border-b-2 border-dashed border-[#1a3f22]/10 flex items-center justify-between bg-white dark:bg-[#252525]">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 ${activeRoom.type === "SPOILER" ? "bg-red-50 text-red-600" : "bg-[#1a3f22]/5 text-[#1a3f22]"}`}
            >
              {activeRoom.type === "GENERAL" && <MessageSquare size={20} />}
              {activeRoom.type === "SPOILER" && <AlertTriangle size={20} />}
              {activeRoom.type === "CHAPTER" && <BookOpen size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373]">
                {activeRoom.title}
              </h2>
              <p className="text-[9px] font-mono text-[#8b5a2b] uppercase font-bold tracking-widest">
                Active Session • {activeRoom.type}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-full bg-[#d4a373] border-2 border-white"
                />
              ))}
            </div>
            <span className="text-[10px] font-mono font-bold text-[#8b5a2b] ml-2">
              +12 Others
            </span>
          </div>
        </header>

        {/* Message Feed */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
          style={{
            backgroundImage: "radial-gradient(#1a3f2210 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
              <Hash size={48} className="mb-4" />
              <p className="font-serif italic text-lg">
                No scribbles yet. Be the first to ink the page.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-4 ${msg.userId === user?.id ? "flex-row-reverse" : ""}`}
              >
                <div className="w-8 h-8 shrink-0 bg-[#f4ebd0] border border-[#d6c7a1] flex items-center justify-center font-serif font-black text-[#1a3f22] text-xs">
                  {msg.userName[0]}
                </div>
                <div
                  className={`max-w-[70%] ${msg.userId === user?.id ? "items-end" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono font-black text-[#8b5a2b]">
                      {msg.userName}
                    </span>
                    <span className="text-[8px] font-mono text-gray-400">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    className={`p-4 font-serif text-sm shadow-sm ${
                      msg.userId === user?.id
                        ? "bg-[#1a3f22] text-[#f4ebd0] rounded-tl-2xl rounded-tr-none rounded-br-2xl rounded-bl-2xl"
                        : "bg-white dark:bg-[#252525] text-[#1a3f22] dark:text-gray-200 border border-[#d6c7a1] rounded-tr-2xl rounded-tl-none rounded-br-2xl rounded-bl-2xl"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Input Area: Library Slip Style */}
        <div className="p-6 bg-white dark:bg-[#252525] border-t-2 border-[#1a3f22]/10">
          <form onSubmit={handleSendMessage} className="flex gap-4 items-end">
            <div className="flex-1 relative group">
              <div className="absolute -top-3 left-4 z-10">
                <span className="bg-[#d4a373] text-white text-[8px] font-mono font-bold px-2 py-0.5 uppercase">
                  Drafting Memo
                </span>
              </div>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Inscribe your thoughts..."
                className="w-full bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-[#1a3f22]/10 focus:border-[#1a3f22] p-4 pt-6 outline-none font-serif italic text-sm resize-none custom-scrollbar min-h-[80px]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="p-3 text-[#8b5a2b] hover:bg-[#f4ebd0] transition-colors"
              >
                <Paperclip size={20} />
              </button>
              <button
                type="submit"
                className="bg-[#1a3f22] text-[#f4ebd0] p-4 shadow-[4px_4px_0px_#d4a373] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                <Send size={20} />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

// --- Subcomponent: Sidebar Button ---
const RoomButton = ({
  icon,
  label,
  active,
  onClick,
  color = "text-[#1a3f22]",
}: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-serif font-black italic transition-all border-l-4 ${
      active
        ? `bg-[#1a3f22] text-[#f4ebd0] border-[#d4a373] shadow-md`
        : `bg-white dark:bg-[#252525] ${color} border-transparent hover:border-[#1a3f22]/30`
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

export default ClubDiscussion;
