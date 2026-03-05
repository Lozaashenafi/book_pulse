"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Lock,
  Send,
  Hash,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  AlertTriangle,
  ChevronRight,
  FileText,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChat } from "@/hooks/useChat";

const ClubDiscussion = ({ clubId }: { clubId: string }) => {
  const { user } = useAuthStore();
  const {
    rooms,
    activeRoom,
    setActiveRoom,
    messages,
    sendMessage,
    logProgress,
    currentPage,
    unreadRooms,
    isLoading,
    removeMessage,
    updateMessage,
    pdfUrl,
    viewMode,
    setViewMode,
  } = useChat(clubId, user?.id);

  const [input, setInput] = useState("");
  const [pageInput, setPageInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, viewMode]);

  if (isLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-tertiary" size={40} />
      </div>
    );

  return (
    <div
      className={`h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 pb-6 overflow-hidden ${isFullscreen ? "fixed inset-0 z-[10000] bg-white dark:bg-black p-0 h-screen w-screen" : ""}`}
    >
      {/* --- SIDEBAR --- */}
      {!isFullscreen && (
        <aside className="w-full md:w-72 flex flex-col gap-4 shrink-0">
          {/* PROGRESS TRACKER */}
          <div className="bg-[#1a3f22] p-5 shadow-lg border-b-4 border-[#132f19]">
            <div className="flex justify-between items-center mb-3">
              <p className="text-[10px] font-mono font-bold text-[#d4a373] uppercase tracking-[0.2em]">
                Sync Progress
              </p>
              <span className="text-[10px] font-mono text-white/50">
                Pg {currentPage}
              </span>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                logProgress(parseInt(pageInput));
                setPageInput("");
              }}
              className="flex gap-2"
            >
              <input
                type="number"
                placeholder="New Page..."
                value={pageInput}
                onChange={(e) => setPageInput(e.target.value)}
                className="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-xs outline-none"
              />
              <button
                type="submit"
                className="bg-[#d4a373] text-[#1a3f22] px-3 py-2 rounded text-[10px] font-black uppercase"
              >
                Log
              </button>
            </form>
          </div>

          <div className="bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] p-5 flex-1 overflow-y-auto custom-scrollbar shadow-[4px_4px_0px_#bcab79]">
            {/* PDF ACCESS BUTTON */}
            {pdfUrl && (
              <button
                onClick={() => setViewMode(viewMode === "pdf" ? "chat" : "pdf")}
                className={`w-full mb-6 flex items-center gap-3 px-4 py-4 text-xs font-serif font-black italic transition-all border-2 ${
                  viewMode === "pdf"
                    ? "bg-[#d4a373] text-[#1a3f22] border-[#1a3f22]"
                    : "bg-[#1a3f22] text-[#f4ebd0] border-transparent shadow-md"
                }`}
              >
                <FileText size={18} />
                <span>
                  {viewMode === "pdf"
                    ? "Return to Scribbles"
                    : "Open Manuscript"}
                </span>
              </button>
            )}

            <h3 className="text-[10px] font-mono font-black uppercase tracking-[0.2em] text-[#8b5a2b] mb-4 border-b border-[#d6c7a1] pb-2">
              Discussion Index
            </h3>
            <nav className="space-y-2">
              {rooms.map((room) => (
                <button
                  key={room.id}
                  disabled={room.isLocked}
                  onClick={() => {
                    setActiveRoom(room);
                    setViewMode("chat");
                  }}
                  className={`w-full flex items-center justify-between px-3 py-3 text-xs font-serif font-black italic transition-all relative border-l-4 ${
                    activeRoom?.id === room.id && viewMode === "chat"
                      ? "bg-[#1a3f22] text-[#f4ebd0] border-[#d4a373]"
                      : "bg-white dark:bg-[#252525] text-[#5c4033] border-transparent"
                  } ${room.isLocked ? "opacity-40" : ""}`}
                >
                  <div className="flex items-center gap-2">
                    {room.isLocked ? <Lock size={14} /> : <Hash size={14} />}
                    <span className="truncate">{room.title}</span>
                  </div>
                  {unreadRooms.includes(room.id) && (
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </nav>
          </div>
        </aside>
      )}

      {/* --- MAIN AREA (CHAT OR PDF) --- */}
      <main className="flex-1 bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-tertiary/10 flex flex-col overflow-hidden relative shadow-[8px_8px_0px_rgba(26,63,34,0.05)]">
        {viewMode === "chat" ? (
          <>
            <header className="px-6 py-4 border-b-2 border-dashed border-tertiary/10 bg-white dark:bg-[#252525]">
              <h2 className="text-xl font-serif font-black text-tertiary dark:text-[#d4a373]">
                {activeRoom?.title}
              </h2>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            >
              {messages.map((msg: any) => {
                const isMe = msg.userId === user?.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex gap-4 group ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-9 h-9 shrink-0 bg-[#f4ebd0] border border-[#d6c7a1] flex items-center justify-center font-serif font-black text-tertiary text-sm overflow-hidden shadow-sm">
                      {msg.userImage ? (
                        <img
                          src={msg.userImage}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        msg.userName?.[0]
                      )}
                    </div>
                    <div
                      className={`max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[10px] font-mono font-black text-[#8b5a2b]">
                          {msg.userName}
                        </span>
                        {isMe && !editingId && (
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingId(msg.id);
                                setEditInput(msg.content);
                              }}
                            >
                              <Pencil size={10} />
                            </button>
                            <button onClick={() => removeMessage(msg.id)}>
                              <Trash2 size={10} />
                            </button>
                          </div>
                        )}
                      </div>
                      <div
                        className={`p-4 font-serif text-sm shadow-sm relative ${isMe ? "bg-[#1a3f22] text-[#f4ebd0] rounded-tl-2xl rounded-tr-none rounded-br-2xl rounded-bl-2xl" : "bg-white dark:bg-[#252525] text-[#1a3f22] border border-[#d6c7a1] rounded-tr-2xl rounded-tl-none rounded-br-2xl rounded-bl-2xl"}`}
                      >
                        {editingId === msg.id ? (
                          <div className="flex flex-col gap-2 min-w-[220px]">
                            <textarea
                              value={editInput}
                              onChange={(e) => setEditInput(e.target.value)}
                              className="bg-white/10 border border-white/20 p-2 rounded text-white text-xs outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingId(null)}>
                                <X size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  updateMessage(msg.id, editInput);
                                  setEditingId(null);
                                }}
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 bg-white dark:bg-[#252525] border-t-2 border-tertiary/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim()) {
                    sendMessage(input);
                    setInput("");
                  }
                }}
                className="flex gap-4 items-end"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Inscribe a thought..."
                  className="flex-1 bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-tertiary/10 p-4 font-serif italic text-sm h-20 outline-none focus:border-[#1a3f22]"
                />
                <button
                  type="submit"
                  className="bg-[#1a3f22] text-[#f4ebd0] p-4 shadow-[4px_4px_0px_#d4a373] active:translate-y-1"
                >
                  <Send size={22} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* PDF READER VIEW */
          <div className="flex-1 flex flex-col">
            <header className="px-6 py-4 border-b-2 border-[#1a3f22]/10 bg-white dark:bg-[#252525] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="text-[#1a3f22]" size={20} />
                <h2 className="text-sm font-serif font-black text-[#1a3f22] uppercase tracking-widest">
                  Digital Manuscript
                </h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 hover:bg-[#1a3f22]/5 text-[#1a3f22] transition-colors rounded"
                  title="Toggle Fullscreen"
                >
                  {isFullscreen ? (
                    <Minimize2 size={20} />
                  ) : (
                    <Maximize2 size={20} />
                  )}
                </button>
                <button
                  onClick={() => {
                    setViewMode("chat");
                    setIsFullscreen(false);
                  }}
                  className="p-2 hover:bg-red-50 text-red-600 transition-colors rounded"
                >
                  <X size={20} />
                </button>
              </div>
            </header>
            <iframe
              src={`${pdfUrl}#view=FitH`}
              className="flex-1 w-full border-none"
              title="Book Reader"
            />
          </div>
        )}
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1a3f2220;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default ClubDiscussion;
