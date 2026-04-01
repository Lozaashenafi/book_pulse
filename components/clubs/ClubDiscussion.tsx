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
  Radio,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useChat } from "@/hooks/useChat";
import { createClient } from "@/lib/supabase/client";
import {
  getClubMembers,
  leaveClubRecord,
  getPublicProfileData,
} from "@/services/chat.service";
import {
  checkClubAccessAction,
  joinPublicClubAction,
} from "@/services/club.service";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CuratorLoader from "../ui/CuratorLoader";
import ManuscriptReader from "./ManuscriptReader";
import dynamic from "next/dynamic";

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
    isFetchingMessages,
  } = useChat(clubId, user?.id);

  // UI States
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

  // --- ACCESS CONTROL ---
  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        router.push("/login");
        return;
      }
      const result = await checkClubAccessAction(clubId, user.id);
      if (result.status === "not-found") {
        toast.error("Archive not found.");
        router.push("/explore");
        return;
      }
      setAccessStatus(result.status as any);
    };
    checkAccess();
  }, [clubId, user, router]);
  
  // --- LEAVE CLUB LOGIC ---
  const handleLeave = async () => {
    // 1. Confirm with the user
    const confirmed = window.confirm(
      "Are you sure you want to leave this fellowship? You will lose access to the chat history and manuscript until you join again."
    );

    if (!confirmed || !user) return;

    try {
      // 2. Call the service to remove the membership record
      const result = await leaveClubRecord(clubId, user.id);

      if (result.success) {
        toast.success("You have left the circle.");
        // 3. Redirect the user back to the library/explore page
        router.push("/explore");
      } else {
        toast.error(result.error || "Failed to leave the circle.");
      }
    } catch (error) {
      console.error("Error leaving club:", error);
      toast.error("An unexpected error occurred.");
    }
  };
  
  const handleJoinClub = async () => {
    setIsJoining(true);
    const result = await joinPublicClubAction(clubId, user!.id);
    if (result.success) {
      toast.success("Entry granted.");
      setAccessStatus("member");
    }
    setIsJoining(false);
  };

  // --- FULLSCREEN LOGIC ---
  useEffect(() => {
    const handleFullscreenChange = () =>
      setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current
        .requestFullscreen()
        .catch(() => toast.error("Fullscreen blocked."));
    } else {
      document.exitFullscreen();
    }
  };

  // --- SMART SCROLL ---
  const lastMsgCount = useRef(messages.length);
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    if (messages.length > lastMsgCount.current) {
      const isAtBottom =
        container.scrollHeight - container.scrollTop <=
        container.clientHeight + 150;
      if (isAtBottom || messages[messages.length - 1].userId === user?.id) {
        container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
      }
    }
    lastMsgCount.current = messages.length;
  }, [messages, user?.id]);

  // --- HELPERS ---
  const handleToggleMembers = async () => {
    if (!showMembers) {
      const data = await getClubMembers(clubId);
      setMembers(data);
    }
    setShowMembers(!showMembers);
    setMobileSidebar(false);
  };
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // 1. Simple validation
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      return toast.error("File is too large. Limit is 5MB.");
    }

    setIsUploading(true);
    const supabase = createClient();

    // 2. Sanitize filename (remove spaces and special chars)
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const filePath = `chat/${clubId}/${crypto.randomUUID()}-${cleanFileName}`;

    try {
      // 3. Perform the upload
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("books")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // 4. Generate the Public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from("books").getPublicUrl(filePath);

      // 5. Send the message via Drizzle
      const prefix = file.type.startsWith("image/") ? "IMAGE" : "FILE";
      await sendMessage(`${prefix}: ${publicUrl}`);

      toast.success("File shared successfully.");
    } catch (err: any) {
      console.error("Upload Error Details:", err);
      toast.error(err.message || "Upload failed. Check storage permissions.");
    } finally {
      setIsUploading(false);
      // Reset the input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (isLoading || accessStatus === "checking")
    return (
      <div className="h-full w-full flex items-center justify-center">
        <CuratorLoader />
      </div>
    );

  if (accessStatus === "private-denied") {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center p-6 text-center bg-[#fdfcf8] dark:bg-[#1a1614]">
        <Lock className="text-red-700 mb-4" size={48} />
        <h2 className="font-serif font-black text-2xl text-tertiary dark:text-[#d4a373]">
          Private Archive
        </h2>
        <button
          onClick={() => router.push("/explore")}
          className="mt-6 text-tertiary dark:text-[#d4a373] font-mono underline"
        >
          Return to Library
        </button>
      </div>
    );
  }

  if (accessStatus === "public-gate") {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#f4ebd0]/90 dark:bg-black/80 backdrop-blur-sm p-4">
        <div className="bg-white dark:bg-[#252525] border-2 border-tertiary p-8 max-w-sm w-full shadow-[8px_8px_0px_#1a3f22] text-center">
          <Users
            className="mx-auto text-tertiary dark:text-[#d4a373] mb-4"
            size={40}
          />
          <h2 className="font-serif font-black text-xl text-tertiary dark:text-[#d4a373]">
            Join the Circle
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 my-4 font-serif italic">
            Join <span className="font-bold">"{clubName}"</span> to enter the
            chat.
          </p>
          <button
            onClick={handleJoinClub}
            disabled={isJoining}
            className="w-full bg-tertiary text-[#f4ebd0] py-4 font-serif font-bold shadow-md active:translate-y-1 transition-all"
          >
            {isJoining ? <Loader2 className="animate-spin mx-auto" /> : "Join Now"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`h-[calc(100vh-80px)] md:h-[calc(100vh-140px)] flex flex-col md:flex-row gap-6 pb-4 overflow-hidden relative ${isFullscreen ? "bg-white dark:bg-[#1a1614] h-screen w-screen p-0" : ""}`}>
      
      {/* --- SIDEBAR --- */}
      {!isFullscreen && (
        <>
          <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-[#252525] border-2 border-tertiary/10">
            <button onClick={() => setMobileSidebar(true)} className="text-tertiary dark:text-[#d4a373]"><Menu size={24} /></button>
            <h2 className="font-serif font-black text-sm dark:text-[#d4a373] truncate">{activeRoom?.title}</h2>
            <button onClick={handleToggleMembers} className="text-tertiary dark:text-[#d4a373]"><Users size={20} /></button>
          </div>

          <aside className={`fixed inset-0 z-[500] md:relative md:z-0 md:flex w-72 flex-col gap-4 shrink-0 transition-transform ${mobileSidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"} bg-[#eaddcf] dark:bg-[#1a1614] p-6 md:p-0`}>
            <button onClick={() => setMobileSidebar(false)} className="md:hidden absolute top-4 right-4 text-tertiary dark:text-[#d4a373]"><X /></button>
            
            {/* LIVE INDICATOR BUTTON */}
            <div className="bg-white/50 dark:bg-black/20 p-3 flex items-center justify-between border border-tertiary/10 mb-1 shadow-sm">
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                 <span className="text-[10px] font-mono font-black uppercase text-tertiary dark:text-[#d4a373]">Fellowship Live</span>
               </div>
               <Radio size={14} className="text-[#d4a373]" />
            </div>

            <div className="mb-2 px-1"><h1 className="text-xl font-serif font-black text-tertiary dark:text-[#d4a373] border-b-2 border-tertiary/10 leading-tight pb-1">{clubName}</h1></div>
            
            <div className="bg-tertiary p-5 shadow-lg border-b-4 border-[#132f19]">
              <div className="flex justify-between items-center mb-2"><p className="text-[10px] font-mono font-bold text-[#d4a373] uppercase">Sync Progress</p><span className="text-[10px] font-mono text-white/50">Pg {currentPage}</span></div>
              <form onSubmit={(e) => { e.preventDefault(); logProgress(pageInput); setPageInput(""); }} className="flex gap-2">
                <input type="number" placeholder="Pg #" value={pageInput} onChange={(e) => setPageInput(e.target.value)} className="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs outline-none" />
                <button type="submit" className="bg-[#d4a373] text-tertiary px-3 py-1 rounded text-[10px] font-black uppercase">Log</button>
              </form>
            </div>

            <div className="bg-[#f4ebd0] dark:bg-[#2c2420] border-2 border-[#d6c7a1] dark:border-[#3e2b22] p-5 flex-1 overflow-y-auto custom-scrollbar">
              {pdfUrl && (
                <button onClick={() => { setViewMode(viewMode === "pdf" ? "chat" : "pdf"); setMobileSidebar(false); }} className={`w-full mb-3 flex items-center gap-3 px-4 py-4 text-xs font-serif font-black italic border-2 transition-all ${viewMode === "pdf" ? "bg-[#d4a373] text-tertiary border-[#1a3f22]" : "bg-tertiary text-[#f4ebd0] shadow-md"}`}><FileText size={18} /><span>{viewMode === "pdf" ? "Return to Chat" : "Open Manuscript"}</span></button>
              )}
              <button onClick={handleToggleMembers} className="hidden md:flex w-full mb-6 items-center gap-3 px-4 py-3 text-xs font-serif font-black border-2 border-tertiary/20 dark:border-[#d4a373]/20 text-tertiary dark:text-[#d4a373]"><Users size={18} /><span>Member List</span></button>
              <nav className="space-y-2">
                {rooms.map((room) => (
                  <button key={room.id} disabled={room.isLocked || isFetchingMessages} onClick={() => { setActiveRoom(room); setViewMode("chat"); }} className={`w-full flex items-center justify-between px-3 py-3 text-xs font-serif font-black italic transition-all border-l-4 ${activeRoom?.id === room.id && viewMode === "chat" ? "bg-tertiary text-[#f4ebd0] border-[#d4a373]" : "bg-white dark:bg-[#252525] text-tertiary dark:text-[#d4a373] border-transparent"} ${(room.isLocked || isFetchingMessages) ? "opacity-40" : ""}`}>
                    <div className="flex items-center gap-2">{isFetchingMessages && activeRoom?.id === room.id ? <Loader2 size={14} className="animate-spin" /> : (room.isLocked ? <Lock size={14}/> : <Hash size={14}/>)}<span className="truncate">{room.title}</span></div>
                    {unreadRooms.includes(room.id) && <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
                  </button>
                ))}
              </nav>
              <button onClick={handleLeave} className="w-full mt-10 flex items-center justify-center gap-2 py-3 text-[10px] font-mono font-black uppercase text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 border-t border-red-100 dark:border-red-900/20"><LogOut size={14} /> Leave Circle</button>
            </div>
          </aside>
        </>
      )}

      {/* --- MAIN CONTENT --- */}
      <main className={`flex-1 bg-[#fdfcf8] dark:bg-[#1a1614] md:border-2 border-tertiary/10 dark:border-[#d4a373]/10 flex flex-col overflow-hidden relative ${isFullscreen ? "h-screen border-none shadow-none" : "shadow-[8px_8px_0px_rgba(26,63,34,0.05)]"}`}>
        {viewMode === "chat" ? (
          <div className="flex flex-col h-full">
            <header className="hidden md:flex px-6 py-4 border-b-2 border-dashed border-tertiary/10 bg-white dark:bg-[#252525]"><h2 className="text-xl font-serif font-black text-tertiary dark:text-[#d4a373]">{isFetchingMessages && <Loader2 size={18} className="animate-spin inline mr-2" />}<span className="opacity-30 font-mono text-sm mr-3 font-normal tracking-tighter">{clubName} /</span>{activeRoom?.title}</h2></header>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 custom-scrollbar">
              {messages.map((msg: any) => {
                const isMe = msg.userId === user?.id;
                const isImage = msg.content.startsWith("IMAGE: ");
                const isFile = msg.content.startsWith("FILE: ");
                const contentUrl = (isImage || isFile) ? msg.content.split(": ")[1] : "";
                return (
                  <div key={msg.id} className={`flex gap-3 group ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className="w-8 h-8 md:w-9 md:h-9 bg-[#f4ebd0] dark:bg-[#2c2420] border border-[#d6c7a1] dark:border-[#d4a373]/20 flex items-center justify-center font-black text-tertiary dark:text-[#d4a373] text-xs shrink-0 overflow-hidden shadow-sm">{msg.userImage ? <img src={msg.userImage} className="w-full h-full object-cover" /> : msg.userName?.[0]}</div>
                    <div className={`max-w-[85%] flex flex-col ${isMe ? "items-end" : "items-start"}`}>
                      <div className="flex items-center gap-3 mb-1"><span className="text-[9px] font-mono font-black text-[#8b5a2b] dark:text-[#d4a373]/60">{msg.userName}</span>{isMe && !editingId && <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"><button onClick={() => { setEditingId(msg.id); setEditInput(msg.content); }} className="text-[#8b5a2b] dark:text-[#d4a373]"><Pencil size={10} /></button><button onClick={() => removeMessage(msg.id)} className="text-red-400"><Trash2 size={10} /></button></div>}</div>
                      <div className={`p-3 md:p-4 text-sm relative ${isMe ? "bg-tertiary text-[#f4ebd0] rounded-tl-2xl rounded-tr-none rounded-br-2xl rounded-bl-2xl shadow-md" : "bg-white dark:bg-[#252525] text-tertiary dark:text-gray-200 border border-[#d6c7a1] dark:border-[#d4a373]/20 rounded-tr-2xl rounded-tl-none rounded-br-2xl rounded-bl-2xl shadow-sm"}`}>
                        {editingId === msg.id ? (
                          <div className="flex flex-col gap-2 min-w-[200px]"><textarea value={editInput} onChange={(e) => setEditInput(e.target.value)} className="bg-white/10 border border-white/20 p-2 rounded text-white text-xs outline-none" /><div className="flex justify-end gap-2"><button onClick={() => setEditingId(null)} className="text-red-300"><X size={14} /></button><button onClick={() => { updateMessage(msg.id, editInput); setEditingId(null); }} className="text-green-300"><Check size={14} /></button></div></div>
                        ) : isImage ? (
                          <div className="space-y-2"><img src={contentUrl} className="max-w-full rounded-lg border-2 border-white/20 dark:border-black/40 shadow-md max-h-64 object-contain" /><a href={contentUrl} target="_blank" rel="noopener noreferrer" className="block text-[10px] underline opacity-50 dark:text-[#d4a373]">View Original</a></div>
                        ) : isFile ? (
                          <a href={contentUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline decoration-dotted dark:text-[#d4a373]"><FileText size={16} /> Manuscript Clip</a>
                        ) : (msg.content)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-4 md:p-6 bg-white dark:bg-[#252525] border-t-2 border-tertiary/10 dark:border-[#d4a373]/10">
              <form onSubmit={(e) => { e.preventDefault(); if (input.trim()) { sendMessage(input); setInput(""); } }} className="flex gap-2 items-end">
                <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim()) { sendMessage(input); setInput(""); } } }} placeholder="Inscribe..." className="flex-1 bg-[#fdfcf8] dark:bg-[#1a1614] border-2 border-tertiary/10 dark:border-[#d4a373]/20 p-3 md:p-4 font-serif italic text-sm h-14 md:h-20 outline-none dark:text-gray-200" />
                <div className="flex flex-col gap-2">
                  <input type="file" ref={fileInputRef} hidden onChange={handleFileSelect} accept="image/*,.pdf" />
                  <button type="button" disabled={isUploading} onClick={() => fileInputRef.current?.click()} className="p-2 md:p-3 text-tertiary dark:text-[#d4a373] hover:bg-[#f4ebd0] dark:hover:bg-[#2c2420] rounded">{isUploading ? <CuratorLoader /> : <Paperclip size={18} />}</button>
                  <button type="submit" className="bg-tertiary text-[#f4ebd0] p-3 md:p-4 shadow-[4px_4px_0px_#d4a373] active:translate-y-1"><Send size={20} /></button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          pdfUrl && (
             <ManuscriptReader 
            pdfUrl={pdfUrl} 
            clubId={clubId} // Pass this
            clubName={clubName}
            currentPage={currentPage}
            isFullscreen={isFullscreen}
            onToggleFullscreen={handleToggleFullscreen}
            onClose={() => setViewMode("chat")}
            onLogProgress={(page) => logProgress(page)} // Pass the number directly
          />
          )
        )}
      </main>

      {/* --- FELLOWSHIP MODAL --- */}
      {showMembers && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-500">
          <div className="bg-[#fcf8f1] dark:bg-[#1c1917] w-full max-w-lg relative border border-[#d6c7a1] dark:border-[#3e2b22] shadow-2xl flex flex-col overflow-hidden rounded-sm">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#d4a373]/30 m-2" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#d4a373]/30 m-2" />
            <div className="p-6 md:p-8 flex items-center justify-between border-b border-[#d6c7a1]/30 dark:border-[#3e2b22] shadow-sm">
              <div><h2 className="text-2xl md:text-3xl font-serif font-black text-[#5c4033] dark:text-[#d6c7a1] tracking-tight">The Fellowship</h2><div className="h-1 w-12 bg-[#d4a373] mt-1" /></div>
              <button onClick={() => setShowMembers(false)} className="p-2 hover:bg-[#d4a373]/10 rounded-full text-[#5c4033] dark:text-[#d6c7a1]"><X size={20} /></button>
            </div>
            <div className="p-4 md:p-8 pt-2">
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                {members.map((m) => (
                  <button key={m.id} onClick={() => { if (m.username) router.push(`/profile/${m.username}`); }} className="group w-full text-left flex items-center gap-4 p-4 border border-[#d6c7a1]/20 dark:border-[#3e2b22] hover:border-[#d4a373] hover:bg-[#d4a373]/5 transition-all relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#d4a373]/0 to-[#d4a373]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative z-10 w-14 h-14 bg-[#f4ebd0] dark:bg-[#2c2420] border border-[#d6c7a1] dark:border-[#d4a373]/20 rotate-1 group-hover:rotate-0 transition-transform shrink-0 shadow-sm overflow-hidden">{m.image ? <img src={m.image} alt={m.name} className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 transition-all" /> : <div className="w-full h-full flex items-center justify-center bg-stone-100 dark:bg-stone-800"><UserCircle size={28} className="text-[#d4a373]/40" /></div>}</div>
                    <div className="min-w-0 z-10 flex-1"><p className="font-serif font-bold text-[#5c4033] dark:text-[#e7e5e4] text-base group-hover:text-[#a07855] transition-colors">{m.name}</p><div className="flex items-center justify-between mt-1"><span className="text-[9px] font-mono font-bold uppercase tracking-widest bg-[#5c4033] dark:bg-[#2c2420] text-[#fcf8f1] dark:text-[#d4a373] px-2 py-0.5 rounded-sm">{m.role}</span><span className="text-[10px] font-serif italic text-[#d4a373] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">View Dossier <ChevronRight size={12} /></span></div></div>
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