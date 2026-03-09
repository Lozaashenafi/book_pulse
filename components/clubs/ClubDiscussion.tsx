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
import { useRouter } from "next/navigation";
import {
  checkClubAccessAction,
  joinPublicClubAction,
} from "@/services/club.service";
import CuratorLoader from "../ui/CuratorLoader";

const ClubDiscussion = ({ clubId }: { clubId: string }) => {
  const { user, profile: myProfile } = useAuthStore();
  const router = useRouter();

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
    clubName,
  } = useChat(clubId, user?.id);

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
  const [accessStatus, setAccessStatus] = useState<
    "checking" | "member" | "public-gate" | "private-denied"
  >("checking");
  const [isJoining, setIsJoining] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);
  useEffect(() => {
    const checkAccess = async () => {
      // Auth is still checked via Supabase session/AuthStore
      if (!user) {
        router.push("/login");
        return;
      }

      // Call the Server Action (which queries Neon via Drizzle)
      const result = await checkClubAccessAction(clubId, user.id);

      if (result.status === "not-found") {
        toast.error("Literary circle not found.");
        router.push("/explore");
        return;
      }

      // Set the state based on Neon data
      setAccessStatus(result.status as any);
    };

    checkAccess();
  }, [clubId, user, router]);

  // Function to handle joining the public club
  const handleJoinClub = async () => {
    setIsJoining(true);
    const result = await joinPublicClubAction(clubId, user!.id);

    if (result.success) {
      toast.success("Welcome to the fellowship!");
      setAccessStatus("member");
    } else {
      toast.error("Failed to join.");
    }
    setIsJoining(false);
  };
  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch((err) => {
        toast.error(`Error enabling full-screen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

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
    if (!confirm("Are you certain you wish to leave this circle?")) return;
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

  if (isLoading || accessStatus === "checking") {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <CuratorLoader />
      </div>
    );
  }
  if (accessStatus === "private-denied") {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center">
        <Lock className="text-red-700 mb-4" size={48} />
        <h2 className="font-serif font-black text-2xl text-tertiary uppercase">
          Private Archive
        </h2>
        <p className="max-w-md text-sm text-gray-500 mt-2 italic font-serif">
          This literary circle is restricted to invited members only. You do not
          have the clearance to view these manuscripts.
        </p>
        <button
          onClick={() => router.push("/explore")}
          className="mt-6 text-tertiary font-mono font-bold underline"
        >
          Return to Library
        </button>
      </div>
    );
  }

  // 3. Show Public Join Popup (The Gate)
  if (accessStatus === "public-gate") {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f4ebd0]/90 backdrop-blur-sm p-4">
        <div className="bg-white border-2 border-tertiary p-8 max-w-sm w-full shadow-[8px_8px_0px_#1a3f22] text-center">
          <Users className="mx-auto text-tertiary mb-4" size={40} />
          <h2 className="font-serif font-black text-xl text-tertiary uppercase">
            Join the Circle
          </h2>
          <p className="text-sm text-gray-600 my-4 font-serif italic">
            You aren't a member of{" "}
            <span className="font-bold text-tertiary">"{clubName}"</span> yet.
            You need to join this circle before you can enter the chat and see
            the discussion.
          </p>
          <div className="flex flex-col gap-3 mt-6">
            <button
              onClick={handleJoinClub}
              disabled={isJoining}
              className="w-full bg-tertiary text-[#f4ebd0] py-4 font-serif italic font-bold hover:bg-[#132f19] transition-all flex items-center justify-center gap-2"
            >
              {isJoining ? <CuratorLoader /> : "Join Now"}
            </button>
            <button
              onClick={() => router.push("/explore")}
              className="text-xs font-mono font-bold text-gray-400 uppercase tracking-widest hover:text-red-700 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 pb-4 overflow-hidden relative ${isFullscreen ? "bg-white dark:bg-black h-screen w-screen p-0" : ""}`}
    >
      {/* --- SIDEBAR --- */}
      {!isFullscreen && (
        <>
          <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#252525] border-2 border-tertiary/10 shadow-sm">
            <button
              onClick={() => setMobileSidebar(true)}
              className="p-2 text-tertiary"
            >
              <Menu size={24} />
            </button>
            <h2 className="font-serif font-black text-sm text-tertiary truncate">
              {activeRoom?.title}
            </h2>
            <button onClick={handleToggleMembers} className="p-2 text-tertiary">
              <Users size={20} />
            </button>
          </div>

          <aside
            className={`fixed inset-0 z-[50] md:relative md:z-0 md:flex w-72 flex-col gap-4 shrink-0 transition-transform duration-300 ${mobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"} bg-[#eaddcf] md:bg-transparent p-6 md:p-0`}
          >
            <button
              onClick={() => setMobileSidebar(false)}
              className="md:hidden absolute top-4 right-4"
            >
              <X />
            </button>

            {/* NEW: CLUB NAME AT TOP OF DESCRIPTION/SIDEBAR */}
            <div className="mb-2 px-1">
              <h1 className="text-xl font-serif font-black text-tertiary dark:text-[#d4a373] border-b-2 border-tertiary/10 leading-tight pb-1">
                {clubName}
              </h1>
            </div>

            <div className="bg-tertiary p-5 shadow-lg border-b-4 border-[#132f19]">
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
                  className="bg-[#d4a373] text-tertiary px-3 py-1.5 rounded text-[10px] font-black uppercase"
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
                  className={`w-full mb-3 flex items-center gap-3 px-4 py-4 text-xs font-serif font-black italic transition-all border-2 ${viewMode === "pdf" ? "bg-[#d4a373] text-tertiary" : "bg-tertiary text-[#f4ebd0] shadow-md"}`}
                >
                  <FileText size={18} />{" "}
                  <span>
                    {viewMode === "pdf" ? "Return to Chat" : "Read Manuscript"}
                  </span>
                </button>
              )}
              <button
                onClick={handleToggleMembers}
                className="hidden md:flex w-full mb-6 items-center gap-3 px-4 py-3 text-xs font-serif font-black border-2 border-tertiary/20 hover:bg-tertiary/5 transition-all text-tertiary"
              >
                <Users size={18} />
                <span>Member List</span>
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
                    className={`w-full flex items-center justify-between px-3 py-3 text-xs font-serif font-black italic transition-all relative border-l-4 ${activeRoom?.id === room.id && viewMode === "chat" ? "bg-tertiary text-[#f4ebd0] border-[#d4a373]" : "bg-white dark:bg-[#252525] text-primary-dark border-transparent"} ${room.isLocked ? "opacity-40" : ""}`}
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
        </>
      )}

      {/* --- MAIN AREA --- */}
      <main
        className={`flex-1 bg-[#fdfcf8] dark:bg-[#1a1614] md:border-2 border-tertiary/10 flex flex-col overflow-hidden relative ${isFullscreen ? "h-screen border-none" : "shadow-[8px_8px_0px_rgba(26,63,34,0.05)]"}`}
      >
        {viewMode === "chat" ? (
          <>
            <header className="hidden md:flex px-6 py-4 border-b-2 border-dashed border-tertiary/10 bg-white dark:bg-[#252525]">
              <h2 className="text-xl font-serif font-black text-tertiary dark:text-[#d4a373]">
                {/* NEW: CLUB NAME IN LEFT CORNER OF CHAT HEADER */}
                <span className="opacity-30 font-mono text-sm mr-3 font-normal tracking-tighter">
                  {clubName} /
                </span>
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
                        className={`p-3 md:p-4 font-serif text-sm shadow-sm relative ${isMe ? "bg-tertiary text-[#f4ebd0] rounded-tl-2xl rounded-tr-none rounded-br-2xl rounded-bl-2xl" : "bg-white dark:bg-[#252525] text-tertiary border border-[#d6c7a1] rounded-tr-2xl rounded-tl-none rounded-br-2xl rounded-bl-2xl"}`}
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
                    className="p-2 md:p-3 text-tertiary hover:bg-[#f4ebd0] rounded"
                  >
                    {isUploading ? <CuratorLoader /> : <Paperclip size={18} />}
                  </button>
                  <button
                    type="submit"
                    className="bg-tertiary text-[#f4ebd0] p-3 md:p-4 shadow-[4px_4px_0px_#d4a373] active:translate-y-1"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col h-full bg-[#525659]">
            <header className="px-6 py-2 border-b-2 border-tertiary/10 bg-white dark:bg-[#252525] flex justify-between items-center">
              <span className="text-[10px] font-mono font-black text-tertiary uppercase tracking-widest">
                Manuscript.pdf
              </span>
              <div className="flex gap-2">
                {/* Updated Button to call handleToggleFullscreen */}
                <button
                  onClick={handleToggleFullscreen}
                  className="p-2 text-tertiary hover:bg-tertiary/10 rounded transition-colors"
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
                    if (document.fullscreenElement) document.exitFullscreen();
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
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

      {/* --- MODALS (Fellowship, selectedMember) remain unchanged ... --- */}
      {showMembers && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-6 bg-tertiary/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#f4ebd0] dark:bg-[#2c2420] w-full max-w-md  p-6 md:p-8 relative border-[#d6c7a1] dark:border-[#3e2b22] shadow-[6px_6px_0px_rgba(92,64,51,0.1)]  relative overflow-hidden flex flex-col md:flex-row">
            <div className="absolute top-0 right-0 w-12 h-12 bg-tertiary/5 -rotate-45 translate-x-6 -translate-y-6" />
            <button
              onClick={() => setShowMembers(false)}
              className="absolute top-4 right-4"
            >
              <X />
            </button>
            <h2 className="text-xl md:text-2xl font-serif font-black text-tertiary mb-6">
              The Club Registry
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
                      <UserCircle size={24} className="text-tertiary/20" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-serif font-bold text-tertiary text-sm truncate">
                      {m.name}
                    </p>
                    <p className="text-[8px] font-mono uppercase bg-tertiary text-white px-1 w-fit mt-1">
                      {m.role}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showMembers && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 md:p-6 bg-stone-900/40 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-[#fcf8f1] dark:bg-[#1c1917] w-full max-w-lg relative border border-[#d6c7a1] dark:border-[#3e2b22] shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden rounded-sm">
            {/* Header */}
            <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-[#d6c7a1]/30">
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-black text-[#5c4033] dark:text-[#d6c7a1]">
                  The Club Registry
                </h2>
                <div className="h-1 w-12 bg-[#d4a373] mt-1" />
              </div>
              <button
                onClick={() => setShowMembers(false)}
                className="p-2 text-[#5c4033] dark:text-[#d6c7a1]"
              >
                <X size={20} />
              </button>
            </div>

            {/* Members List */}
            <div className="p-4 md:p-8 pt-2">
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {members.map((m) => (
                  <button
                    key={m.id}
                    // CHANGE: Navigate to the public profile page instead of opening a sub-modal
                    onClick={() => {
                      if (m.username) {
                        router.push(`/profile/${m.username}`);
                      } else {
                        toast.error("Profile link not found.");
                      }
                    }}
                    className="group w-full text-left flex items-center gap-4 p-4 border border-[#d6c7a1]/20 hover:border-[#d4a373] hover:bg-[#d4a373]/5 transition-all duration-300 relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d4a373]/0 to-[#d4a373]/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                    {/* Avatar Frame */}
                    <div className="relative z-10 w-14 h-14 bg-[#f4ebd0] border border-[#d6c7a1] rotate-1 group-hover:rotate-0 transition-transform shrink-0 shadow-sm overflow-hidden">
                      {m.image ? (
                        <img
                          src={m.image}
                          alt={m.name}
                          className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-stone-100">
                          <UserCircle size={28} className="text-[#d4a373]/40" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 z-10 flex-1">
                      <p className="font-serif font-bold text-[#5c4033] dark:text-[#e7e5e4] text-base group-hover:text-[#a07855] transition-colors">
                        {m.name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-[#5c4033] text-[#fcf8f1] px-2 py-0.5 rounded-sm">
                          {m.role}
                        </span>
                        <span className="text-[10px] font-serif italic text-[#d4a373] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                          View Dossier <ChevronRight size={12} />
                        </span>
                      </div>
                    </div>
                  </button>
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
