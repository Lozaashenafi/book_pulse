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
  Paperclip,
  Users,
  LogOut,
  Image as ImageIcon,
  UserCircle,
  Menu,
  Bookmark,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChat } from "@/hooks/useChat";
import { createClient } from "@/lib/supabase/client";
import {
  getClubMembers,
  leaveClubRecord,
  getPublicProfileData,
} from "@/services/chat.service";
import { toast } from "sonner";

const ClubDiscussion = ({ clubId }: { clubId: string }) => {
  const { user, profile: myProfile } = useAuthStore();
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

  // States
  const [input, setInput] = useState("");
  const [pageInput, setPageInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [mobileSidebar, setMobileSidebar] = useState(false);
  const [members, setMembers] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleToggleMembers = async () => {
    if (!showMembers) {
      const data = await getClubMembers(clubId);
      setMembers(data);
    }
    setShowMembers(!showMembers);
    setMobileSidebar(false);
  };

  const handleViewMember = async (userId: string) => {
    const data = await getPublicProfileData(userId);
    setSelectedMember(data);
  };

  const handleLeave = async () => {
    if (!confirm("Are you certain you wish to leave this fellowship?")) return;
    try {
      await leaveClubRecord(user!.id, clubId, myProfile?.name || "A reader");
      toast.success("Departure recorded.");
      window.location.href = "/explore";
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setIsUploading(true);
    const supabase = createClient();
    const filePath = `chat/${clubId}/${crypto.randomUUID()}-${file.name}`;
    try {
      const { error } = await supabase.storage
        .from("books")
        .upload(filePath, file);
      if (error) throw error;
      const {
        data: { publicUrl },
      } = supabase.storage.from("books").getPublicUrl(filePath);
      const prefix = file.type.startsWith("image/") ? "IMAGE" : "FILE";
      sendMessage(`${prefix}: ${publicUrl}`);
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, viewMode, activeRoom]);

  if (isLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-tertiary" size={40} />
      </div>
    );

  return (
    <div
      className={`h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 pb-4 overflow-hidden relative ${isFullscreen ? "fixed inset-0 z-[10000] bg-white dark:bg-black p-0 h-screen w-screen" : ""}`}
    >
      {/* --- MOBILE HEADER --- */}
      {!isFullscreen && (
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#252525] border-2 border-[#1a3f22]/10 shadow-sm">
          <button
            onClick={() => setMobileSidebar(true)}
            className="p-2 text-[#1a3f22]"
          >
            <Menu size={24} />
          </button>
          <h2 className="font-serif font-black text-sm text-[#1a3f22] truncate">
            {activeRoom?.title}
          </h2>
          <button onClick={handleToggleMembers} className="p-2 text-[#1a3f22]">
            <Users size={20} />
          </button>
        </div>
      )}

      {/* --- SIDEBAR (Desktop & Mobile Drawer) --- */}
      <aside
        className={`
        fixed inset-0 z-[50] md:relative md:z-0 md:flex w-72 flex-col gap-4 shrink-0 transition-transform duration-300
        ${mobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        bg-[#eaddcf] md:bg-transparent p-6 md:p-0
      `}
      >
        <button
          onClick={() => setMobileSidebar(false)}
          className="md:hidden absolute top-4 right-4"
        >
          <X />
        </button>

        {/* PROGRESS */}
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
              placeholder="Pg #"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1.5 text-white text-xs outline-none"
            />
            <button
              type="submit"
              className="bg-[#d4a373] text-[#1a3f22] px-3 py-1.5 rounded text-[10px] font-black uppercase"
            >
              Log
            </button>
          </form>
        </div>

        <div className="bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] p-5 flex-1 overflow-y-auto custom-scrollbar shadow-[4px_4px_0px_#bcab79]">
          {pdfUrl && (
            <button
              onClick={() => {
                setViewMode(viewMode === "pdf" ? "chat" : "pdf");
                setMobileSidebar(false);
              }}
              className={`w-full mb-3 flex items-center gap-3 px-4 py-4 text-xs font-serif font-black italic transition-all border-2 ${viewMode === "pdf" ? "bg-[#d4a373] text-[#1a3f22]" : "bg-[#1a3f22] text-[#f4ebd0] shadow-md"}`}
            >
              <FileText size={18} />{" "}
              <span>
                {viewMode === "pdf" ? "Return to Chat" : "Read Manuscript"}
              </span>
            </button>
          )}

          <button
            onClick={handleToggleMembers}
            className="hidden md:flex w-full mb-6 items-center gap-3 px-4 py-3 text-xs font-serif font-black border-2 border-[#1a3f22]/20 hover:bg-[#1a3f22]/5 transition-all text-[#1a3f22]"
          >
            <Users size={18} /> <span>Fellowship List</span>
          </button>

          <nav className="space-y-2">
            {rooms.map((room) => (
              <button
                key={room.id}
                disabled={room.isLocked}
                onClick={() => {
                  setActiveRoom(room);
                  setViewMode("chat");
                  setMobileSidebar(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-3 text-xs font-serif font-black italic transition-all relative border-l-4 ${activeRoom?.id === room.id && viewMode === "chat" ? "bg-[#1a3f22] text-[#f4ebd0] border-[#d4a373]" : "bg-white dark:bg-[#252525] text-primary-dark border-transparent"} ${room.isLocked ? "opacity-40" : ""}`}
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

          <button
            onClick={handleLeave}
            className="w-full mt-10 flex items-center justify-center gap-2 py-3 text-[10px] font-mono font-black uppercase text-red-700 hover:bg-red-50 border-t border-red-100"
          >
            <LogOut size={14} /> Leave Circle
          </button>
        </div>
      </aside>

      {/* --- MAIN AREA --- */}
      <main className="flex-1 bg-[#fdfcf8] dark:bg-[#1a1614] md:border-2 border-tertiary/10 flex flex-col overflow-hidden relative shadow-[8px_8px_0px_rgba(26,63,34,0.05)]">
        {viewMode === "chat" ? (
          <>
            <header className="hidden md:flex px-6 py-4 border-b-2 border-dashed border-tertiary/10 bg-white dark:bg-[#252525]">
              <h2 className="text-xl font-serif font-black text-tertiary dark:text-[#d4a373]">
                {activeRoom?.title}
              </h2>
            </header>

            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar"
            >
              {messages.map((msg: any) => {
                const isMe = msg.userId === user?.id;
                const isImage = msg.content.startsWith("IMAGE: ");
                const isFile = msg.content.startsWith("FILE: ");
                const contentUrl =
                  isImage || isFile ? msg.content.split(": ")[1] : "";

                return (
                  <div
                    key={msg.id}
                    className={`flex gap-3 md:gap-4 group ${isMe ? "flex-row-reverse" : ""}`}
                  >
                    <div className="w-8 h-8 md:w-9 md:h-9 shrink-0 bg-[#f4ebd0] border border-[#d6c7a1] flex items-center justify-center font-serif font-black text-tertiary text-xs overflow-hidden shadow-sm">
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
                      className={`max-w-[85%] md:max-w-[75%] flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-[9px] md:text-[10px] font-mono font-black text-[#8b5a2b]">
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
                        className={`p-3 md:p-4 font-serif text-sm shadow-sm relative ${isMe ? "bg-[#1a3f22] text-[#f4ebd0] rounded-tl-2xl rounded-tr-none rounded-br-2xl rounded-bl-2xl" : "bg-white dark:bg-[#252525] text-[#1a3f22] border border-[#d6c7a1] rounded-tr-2xl rounded-tl-none rounded-br-2xl rounded-bl-2xl"}`}
                      >
                        {editingId === msg.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <textarea
                              value={editInput}
                              onChange={(e) => setEditInput(e.target.value)}
                              className="bg-white/10 border border-white/20 p-2 rounded text-white text-xs outline-none"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingId(null)}
                                className="text-red-300"
                              >
                                <X size={14} />
                              </button>
                              <button
                                onClick={() => {
                                  updateMessage(msg.id, editInput);
                                  setEditingId(null);
                                }}
                                className="text-green-300"
                              >
                                <Check size={14} />
                              </button>
                            </div>
                          </div>
                        ) : isImage ? (
                          <div className="space-y-2">
                            <img
                              src={contentUrl}
                              className="max-w-full rounded-lg border-2 border-white/20 shadow-md max-h-64 object-contain"
                              alt="attachment"
                            />
                            <a
                              href={contentUrl}
                              target="_blank"
                              className="block text-[10px] underline opacity-50"
                            >
                              View Original
                            </a>
                          </div>
                        ) : isFile ? (
                          <a
                            href={contentUrl}
                            target="_blank"
                            className="flex items-center gap-2 underline decoration-dotted"
                          >
                            <FileText size={16} /> Document Archive
                          </a>
                        ) : (
                          msg.content
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 md:p-6 bg-white dark:bg-[#252525] border-t-2 border-tertiary/10">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (input.trim()) {
                    sendMessage(input);
                    setInput("");
                  }
                }}
                className="flex gap-2 md:gap-4 items-end"
              >
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim()) {
                        sendMessage(input);
                        setInput("");
                      }
                    }
                  }}
                  placeholder="Inscribe..."
                  className="flex-1 bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-tertiary/10 p-3 md:p-4 font-serif italic text-sm h-14 md:h-20 outline-none"
                />
                <div className="flex flex-col gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    hidden
                    onChange={handleFileSelect}
                    accept="image/*,.pdf"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 md:p-3 text-[#1a3f22] hover:bg-[#f4ebd0] rounded"
                  >
                    {isUploading ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <Paperclip size={18} />
                    )}
                  </button>
                  <button
                    type="submit"
                    className="bg-[#1a3f22] text-[#f4ebd0] p-3 md:p-4 shadow-[4px_4px_0px_#d4a373] active:translate-y-1"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col h-full bg-[#525659]">
            <header className="px-6 py-2 border-b-2 border-[#1a3f22]/10 bg-white dark:bg-[#252525] flex justify-between items-center">
              <span className="text-[10px] font-mono font-black text-[#1a3f22] uppercase tracking-widest">
                Manuscript.pdf
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="p-2 text-[#1a3f22]"
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
                  className="p-2 text-red-600"
                >
                  <X size={20} />
                </button>
              </div>
            </header>
            <iframe
              src={`${pdfUrl}#view=FitH`}
              className="flex-1 w-full border-none"
            />
          </div>
        )}
      </main>

      {/* --- FELLOWSHIP MODAL --- */}
      {showMembers && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-6 bg-[#1a3f22]/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#fdfcf8] border-2 border-[#1a3f22] w-full max-w-md shadow-[15px_15px_0px_#d4a373] p-6 md:p-8 relative">
            <button
              onClick={() => setShowMembers(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>
            <h2 className="text-xl md:text-2xl font-serif font-black text-[#1a3f22] mb-6">
              The Fellowship
            </h2>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto custom-scrollbar">
              {members.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleViewMember(m.id)}
                  className="w-full text-left flex items-center gap-4 p-3 border border-transparent hover:border-[#d4a373]/30 transition-all bg-white/50"
                >
                  <div className="w-12 h-12 bg-[#f4ebd0] border border-[#d6c7a1] flex items-center justify-center overflow-hidden shrink-0">
                    {m.image ? (
                      <img
                        src={m.image}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <UserCircle size={24} className="text-[#1a3f22]/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-[#1a3f22] text-sm truncate">
                      {m.name}
                    </p>
                    <p className="text-[8px] font-mono uppercase bg-[#1a3f22] text-white px-1 w-fit mt-1">
                      {m.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- PUBLIC PROFILE VISITOR VIEW MODAL --- */}
      {selectedMember && (
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 md:p-6 bg-black/60 backdrop-blur-sm animate-in zoom-in duration-300">
          <div className="bg-[#fdfcf8] border-2 border-[#1a3f22] w-full max-w-lg shadow-[15px_15px_0px_#1a3f22] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a373]/10 -rotate-45 translate-x-16 -translate-y-16" />
            <button
              onClick={() => setSelectedMember(null)}
              className="absolute top-4 right-4 z-10"
            >
              <X />
            </button>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 rounded-full border-4 border-[#d4a373] p-1 mb-4">
                <div className="w-full h-full rounded-full overflow-hidden bg-gray-100">
                  {selectedMember.image ? (
                    <img
                      src={selectedMember.image}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle
                      size={60}
                      className="m-auto mt-4 text-gray-300"
                    />
                  )}
                </div>
              </div>
              <h3 className="text-2xl font-serif font-black text-[#1a3f22]">
                {selectedMember.name}
              </h3>
              <p className="text-xs font-mono text-[#8b5a2b] uppercase mt-1">
                Reader since {new Date(selectedMember.createdAt).getFullYear()}
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-[#f4ebd0]/30 p-4 border border-[#d4a373]/20">
                <p className="text-[10px] font-mono font-black uppercase text-[#8b5a2b] mb-2 border-b border-[#d4a373]/20 pb-1">
                  Literary Bio
                </p>
                <p className="font-serif italic text-sm text-[#5c4033] leading-relaxed">
                  {selectedMember.bio ||
                    "This fellow reader prefers to keep their archives a mystery."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 border border-[#1a3f22]/10 bg-white shadow-sm text-center">
                  <p className="text-[8px] font-mono font-black uppercase text-gray-400">
                    Founded
                  </p>
                  <p className="font-serif font-black text-[#1a3f22] text-xl">
                    {selectedMember.ownedClubs?.length || 0}
                  </p>
                </div>
                <div className="p-3 border border-[#1a3f22]/10 bg-white shadow-sm text-center">
                  <p className="text-[8px] font-mono font-black uppercase text-gray-400">
                    Joined
                  </p>
                  <p className="font-serif font-black text-[#1a3f22] text-xl">
                    {selectedMember.joinedClubs?.length || 0}
                  </p>
                </div>
              </div>

              <div className="max-h-40 overflow-y-auto custom-scrollbar">
                <p className="text-[10px] font-mono font-black uppercase text-[#8b5a2b] mb-2">
                  Active Squads
                </p>
                {[
                  ...selectedMember.ownedClubs,
                  ...selectedMember.joinedClubs,
                ].map((c: any) => (
                  <div
                    key={c.id}
                    className="text-xs font-serif italic text-[#1a3f22] py-1 border-b border-dashed border-[#1a3f22]/10"
                  >
                    # {c.name}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDiscussion;
