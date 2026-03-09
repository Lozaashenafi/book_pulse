"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Heart,
  Share2,
  Trash2,
  Pencil,
  Quote,
  Paperclip,
  Download,
  Loader2,
  BookOpen,
  TrendingUp,
  PlusCircle,
  BookMarked,
  Pin,
  X,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { usePosts } from "@/hooks/usePosts";
import { usePopularClubs } from "@/hooks/usePopularClubs"; // New Hook
import { deletePostAction, updatePostAction } from "@/services/post.service";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import CuratorLoader from "../ui/CuratorLoader";

const BookPulsePage = () => {
  const { user, profile } = useAuthStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightedId = searchParams.get("id");

  const {
    posts: rawPosts,
    isLoading,
    addPost,
    likePost,
    refresh,
  } = usePosts(user?.id, profile?.name);
  const { popularClubs } = usePopularClubs(); // Use dynamic data

  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

  // --- LOGIC: Add Quote Function ---
  const handleAddQuote = () => {
    if (!input.trim()) {
      setInput('""');
    } else {
      // Wrap existing text in quotes if not already quoted
      if (input.startsWith('"') && input.endsWith('"')) return;
      if (input.length + 2 > 260) {
        toast.error("Character limit reached! Cannot add quotes.");
        return;
      }
      setInput(`"${input}"`);
    }
  };

  const posts = useMemo(() => {
    if (!highlightedId || rawPosts.length === 0) return rawPosts;
    const highlightedPost = rawPosts.find((p) => p.id === highlightedId);
    if (!highlightedPost) return rawPosts;
    const otherPosts = rawPosts.filter((p) => p.id !== highlightedId);
    return [highlightedPost, ...otherPosts];
  }, [rawPosts, highlightedId]);

  const openPreview = (post: any) => {
    setSelectedPost(post);
    setShowPreview(true);
  };

  const handleDownload = async () => {
    if (!exportRef.current) return;
    setIsCapturing(true);
    const t = toast.loading("Finalizing image...");
    try {
      await new Promise((r) => setTimeout(r, 300));
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#f4ebd0",
      });
      const link = document.createElement("a");
      link.download = `BookPulse-Archive.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Saved to device!", { id: t });
      setShowPreview(false);
    } catch (err) {
      toast.error("Capture failed.", { id: t });
    } finally {
      setIsCapturing(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <CuratorLoader />
      </div>
    );

  return (
    <div className="flex gap-12 h-full justify-center relative">
      <main className="flex-1 max-w-2xl space-y-10 overflow-y-auto h-full pr-4 pb-20 custom-scrollbar">
        {/* CREATE POST */}
        <div className="relative bg-white dark:bg-[#252525] p-8 border-l-[12px] border-tertiary shadow-sm mt-4">
          <Paperclip
            className="absolute -top-3 right-8 text-gray-400 rotate-12"
            size={32}
          />
          <textarea
            value={input}
            maxLength={260}
            onChange={(e) => {
              setInput(e.target.value);
              if (e.target.value.length === 260) {
                toast.error("You've reached the 260 character limit.");
              }
            }}
            className="w-full py-6 bg-transparent border-none focus:ring-0 text-xl font-serif italic placeholder:text-gray-300 resize-none outline-none"
            placeholder="Scribble a thought..."
            rows={2}
          />
          <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
            <button
              onClick={handleAddQuote}
              className="text-primary-half flex items-center gap-1 text-[10px] font-black uppercase hover:text-tertiary transition-colors"
            >
              <Quote size={14} /> Add Quote
            </button>
            <button
              onClick={() => {
                if (input.trim().length > 0 && input.length <= 260) {
                  addPost(input);
                  setInput("");
                } else if (input.length > 260) {
                  toast.error("Post is too long!");
                }
              }}
              className="bg-tertiary text-[#f4ebd0] px-6 py-1.5 font-serif italic shadow-md hover:bg-[#132f19] transition-all"
            >
              Pin to Board
            </button>
          </div>
        </div>

        {/* FEED POSTS */}
        {posts.map((post, idx) => {
          const isMe = post.userId === user?.id;
          const isHighlighted = post.id === highlightedId;
          const colors = [
            "bg-[#feff9c]",
            "bg-[#ff7eb9]",
            "bg-[#7afaff]",
            "bg-[#fff9f0]",
          ];
          const rotations = [
            "rotate-1",
            "-rotate-1",
            "rotate-[0.5deg]",
            "-rotate-[0.5deg]",
          ];

          return (
            <div
              key={post.id}
              className={`relative transform ${isHighlighted ? "rotate-0 scale-[1.02] z-20" : rotations[idx % 4]} ${isHighlighted ? "bg-white border-4 border-[#d4a373]" : colors[idx % 4]} p-8 shadow-xl min-h-[250px] flex flex-col group transition-all duration-500`}
            >
              {isHighlighted && (
                <div className="absolute -top-4 right-8 bg-[#d4a373] text-tertiary px-3 py-1 text-[10px] font-mono font-black uppercase shadow-md flex items-center gap-1 z-30 animate-bounce">
                  <Pin size={12} /> Linked Dispatch
                </div>
              )}
              <div className="absolute -top-2 left-6 w-4 h-4 rounded-full bg-red-600 shadow-md flex items-center justify-center z-10">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
              </div>

              <div className="flex justify-between items-start mb-4">
                <div className="font-mono text-[9px] text-black/40 uppercase">
                  {new Date(post.createdAt).toLocaleDateString()}
                </div>
                {isMe && (
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setEditingId(post.id);
                        setEditInput(post.content);
                      }}
                    >
                      <Pencil size={14} className="text-black/40" />
                    </button>
                    <button
                      onClick={async () => {
                        await deletePostAction(post.id, user!.id);
                        refresh();
                      }}
                    >
                      <Trash2 size={14} className="text-red-700/40" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex-1">
                {editingId === post.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editInput}
                      onChange={(e) => setEditInput(e.target.value)}
                      className="w-full bg-black/5 p-2 font-serif italic outline-none"
                    />
                    <button
                      onClick={async () => {
                        await updatePostAction(post.id, user!.id, editInput);
                        setEditingId(null);
                        refresh();
                      }}
                      className="text-[10px] font-bold bg-black/10 px-2 py-1 uppercase"
                    >
                      Update Archive
                    </button>
                  </div>
                ) : (
                  <p className="text-[#2c2c2c] font-serif text-xl leading-relaxed">
                    {post.content}
                  </p>
                )}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-4">
                <div className="flex space-x-6 text-black/60">
                  <button
                    onClick={() => likePost(post.id, post.userId)}
                    className={`flex items-center gap-1 hover:text-red-500 transition-colors ${post.isLiked ? "text-red-500" : ""}`}
                  >
                    <Heart
                      size={18}
                      className={post.isLiked ? "fill-red-500" : ""}
                    />
                    <span className="text-xs font-bold font-mono">
                      {post.likeCount}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(
                        `${window.location.origin}/posts?id=${post.id}`,
                      );
                      toast.success("Link copied!");
                    }}
                    className="flex items-center gap-1 hover:text-tertiary transition-colors"
                  >
                    <Share2 size={18} />
                    <span className="text-xs font-bold font-mono">
                      {post.shareCount}
                    </span>
                  </button>
                  <button
                    onClick={() => openPreview(post)}
                    className="p-1 hover:bg-black/5 rounded transition-all"
                  >
                    <Download size={18} />
                  </button>
                </div>
                <div className="font-serif italic text-sm text-black/70">
                  — {post.userName}
                </div>
              </div>
            </div>
          );
        })}
      </main>

      {/* EXPORT MODAL - (Unchanged) */}

      {showPreview && selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="max-w-2xl w-full flex flex-col items-center gap-6">
            {/* THE EXPORTABLE CARD (This part becomes the image) */}
            <div
              ref={exportRef}
              className="w-[450px] h-[550px] bg-[#f4ebd0] p-10 flex flex-col shadow-2xl relative border-[1px] border-black/5"
            >
              {/* Subtle Paper Texture Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]" />

              {/* Header: Library Card Style */}
              <div className="relative z-10 flex justify-between items-start border-b-2 border-tertiary/20 pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-2 border-tertiary shadow-sm overflow-hidden">
                    <img
                      crossOrigin="anonymous"
                      src={
                        selectedPost.userImage ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPost.userName}`
                      }
                      className="w-full h-full object-cover grayscale"
                      alt="avatar"
                    />
                  </div>
                  <div>
                    <p className="font-serif font-black text-sm text-tertiary uppercase tracking-tighter">
                      {selectedPost.userName}
                    </p>
                    <p className="text-[9px] font-mono text-primary-half font-bold">
                      READER NO. {selectedPost.userId.slice(-6).toUpperCase()}
                    </p>
                  </div>
                </div>
                <BookMarked size={24} className="text-tertiary" />
              </div>

              {/* Main Content: The Scribble */}
              <div className="relative z-10 flex-1 flex items-center justify-center text-center">
                {/* Decorative Typewriter Quotes */}
                <span className="absolute top-0 left-0 text-6xl font-serif text-tertiary/5 select-none">
                  “
                </span>

                <p className="text-2xl font-serif italic text-tertiary leading-relaxed px-4">
                  {selectedPost.content}
                </p>

                <span className="absolute bottom-0 right-0 text-6xl font-serif text-tertiary/5 select-none">
                  ”
                </span>
              </div>

              {/* Footer: Archive Stamp */}
              <div className="relative z-10 mt-8 pt-6  flex flex-col items-center gap-2">
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "900",
                      color: "#1a3f22",
                      textTransform: "uppercase",
                    }}
                  >
                    BOOKPULSE
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "900",
                      color: "#1a3f22",
                      textTransform: "uppercase",
                    }}
                  >
                    ARCHIVE
                  </span>
                </div>

                <p className="text-[9px] font-mono text-gray-500 uppercase">
                  Captured{" "}
                  {new Date(selectedPost.createdAt).toLocaleDateString(
                    "en-US",
                    { month: "long", day: "numeric", year: "numeric" },
                  )}
                </p>
              </div>
            </div>

            {/* MODAL CONTROLS (Not exported) */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full text-sm font-bold backdrop-blur-md transition-all"
              >
                Close
              </button>
              <button
                onClick={handleDownload}
                disabled={isCapturing}
                className="bg-[#d4a373] hover:bg-[#c39262] text-tertiary px-8 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {isCapturing ? (
                  <CuratorLoader />
                ) : (
                  <>
                    <Download size={18} />
                    Save Image
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* RIGHT COLUMN */}
      <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 h-full space-y-8 mt-4">
        {/* Popular Circles - DYNAMIC */}
        <div className="bg-[#fff9f0] dark:bg-[#2c2420] p-6 border-2 border-[#e3d5c1] shadow-inner">
          <div className="flex items-center justify-between mb-6 border-b-2 border-[#e3d5c1] pb-2">
            <h3 className="font-mono font-bold text-sm text-primary-half">
              LITERARY CIRCLES
            </h3>
            <TrendingUp size={16} className="text-primary-half" />
          </div>
          <div className="space-y-6">
            {popularClubs.map((club) => (
              <div
                key={club.id}
                onClick={() => router.push(`/search`)} // Or specific club link
                className="flex items-center justify-between group cursor-pointer border-b border-[#e3d5c1] border-dotted pb-2"
              >
                <div>
                  <p className="text-sm font-serif font-bold text-gray-800 dark:text-gray-200 group-hover:text-primary-half transition-colors">
                    {club.name}
                  </p>
                  <p className="text-[9px] font-mono text-gray-500 uppercase">
                    {club.readers} fellow readers
                  </p>
                </div>
                <PlusCircle
                  size={14}
                  className="text-gray-300 group-hover:text-primary-half"
                />
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BookPulsePage;
