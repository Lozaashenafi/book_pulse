"use client";

import React, { useState, useMemo, useRef } from "react";
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
import {
  deletePostAction,
  updatePostAction,
  sharePostAction,
} from "@/services/post.service";
import { toPng } from "html-to-image";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

const BookPulsePage = () => {
  const { user, profile } = useAuthStore();
  const searchParams = useSearchParams();
  const highlightedId = searchParams.get("id");

  const {
    posts: rawPosts,
    isLoading,
    addPost,
    likePost,
    refresh,
  } = usePosts(user?.id, profile?.name);

  const [input, setInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editInput, setEditInput] = useState("");

  // Modal States
  const [showPreview, setShowPreview] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);

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
      // Small delay to ensure modal is fully rendered
      await new Promise((r) => setTimeout(r, 300));

      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#1a3f22",
      });

      const link = document.createElement("a");
      link.download = `BookPulse-Archive.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Saved to device!", { id: t });
      setShowPreview(false);
    } catch (err) {
      console.error(err);
      toast.error("Capture failed. Try again.", { id: t });
    } finally {
      setIsCapturing(false);
    }
  };

  if (isLoading)
    return (
      <div className="h-full w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#1a3f22]" size={40} />
      </div>
    );

  return (
    <div className="flex gap-12 h-full justify-center relative">
      <main className="flex-1 max-w-2xl space-y-10 overflow-y-auto h-full pr-4 pb-20 custom-scrollbar">
        {/* CREATE POST */}
        <div className="relative bg-white dark:bg-[#252525] p-8 border-l-[12px] border-[#1a3f22] shadow-sm mt-4">
          <Paperclip
            className="absolute -top-3 right-8 text-gray-400 rotate-12"
            size={32}
          />
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-transparent border-none focus:ring-0 text-xl font-serif italic placeholder:text-gray-300 resize-none outline-none"
            placeholder="Scribble a thought..."
            rows={2}
          />
          <div className="flex items-center justify-between pt-4 border-t border-dashed border-gray-200">
            <button className="text-[#8b5a2b] flex items-center gap-1 text-[10px] font-black uppercase">
              <Quote size={14} /> Add Quote
            </button>
            <button
              onClick={() => {
                if (input.trim()) {
                  addPost(input);
                  setInput("");
                }
              }}
              className="bg-[#1a3f22] text-[#f4ebd0] px-6 py-1.5 font-serif italic shadow-md hover:bg-[#132f19] transition-all"
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
          const colorClass = isHighlighted
            ? "bg-white border-4 border-[#d4a373]"
            : colors[idx % 4];
          const rotationClass = isHighlighted
            ? "rotate-0 scale-[1.02] z-20"
            : rotations[idx % 4];

          return (
            <div
              key={post.id}
              className={`relative transform ${rotationClass} ${colorClass} p-8 shadow-xl min-h-[250px] flex flex-col group transition-all duration-500`}
            >
              {isHighlighted && (
                <div className="absolute -top-4 right-8 bg-[#d4a373] text-[#1a3f22] px-3 py-1 text-[10px] font-mono font-black uppercase shadow-md flex items-center gap-1 z-30 animate-bounce">
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
                    "{post.content}"
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
                      const shareUrl = `${window.location.origin}/posts?id=${post.id}`;
                      navigator.clipboard.writeText(shareUrl);
                      toast.success("Link copied!");
                    }}
                    className="flex items-center gap-1 hover:text-[#1a3f22] transition-colors"
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

      {/* PREVIEW MODAL */}
      {showPreview && selectedPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="max-w-lg w-full flex flex-col items-center gap-6">
            {/* The Actual Exportable Square */}
            <div
              ref={exportRef}
              className="w-[450px] h-[450px] bg-[#1a3f22] p-8 flex items-center justify-center shadow-2xl"
            >
              <div className="bg-white w-full h-full p-8 flex flex-col relative">
                <div className="absolute inset-3 border border-[#1a3f22]/5 pointer-events-none" />

                <div className="flex items-center gap-3 mb-6">
                  <img
                    crossOrigin="anonymous"
                    src={
                      selectedPost.userImage ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${selectedPost.userName}`
                    }
                    className="w-10 h-10 rounded-full bg-gray-100"
                    alt="avatar"
                  />
                  <div>
                    <p className="font-serif font-bold text-sm text-[#1a3f22]">
                      {selectedPost.userName}
                    </p>
                    <p className="text-[8px] font-mono uppercase tracking-widest text-[#8b5a2b]">
                      Reader Archive
                    </p>
                  </div>
                  <BookMarked
                    size={20}
                    className="ml-auto text-[#1a3f22] opacity-10"
                  />
                </div>

                <div className="flex-1 flex items-center justify-center text-center">
                  <p className="text-xl font-serif italic text-[#1a3f22] leading-relaxed">
                    “{selectedPost.content}”
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 flex flex-col items-center">
                  <span className="text-[10px] font-black text-[#1a3f22] tracking-widest uppercase">
                    BookPulse
                  </span>
                  <span className="text-[8px] font-mono text-gray-400 uppercase">
                    {new Date(selectedPost.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex gap-4 w-full justify-center">
              <button
                onClick={() => setShowPreview(false)}
                className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all"
              >
                <X size={18} /> Cancel
              </button>
              <button
                disabled={isCapturing}
                onClick={handleDownload}
                className="bg-[#d4a373] hover:bg-[#c39262] text-[#1a3f22] px-8 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg transition-all"
              >
                {isCapturing ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Download size={18} />
                )}
                Confirm Download
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RIGHT COLUMN */}
      <aside className="hidden xl:flex flex-col w-80 flex-shrink-0 h-full space-y-8 mt-4">
        <div className="bg-[#fdfdfd] dark:bg-[#252525] rounded-r-3xl rounded-l-md p-6 border-y-2 border-r-4 border-gray-200 shadow-xl relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#1a3f22]" />
          <h3 className="font-serif font-bold text-lg mb-6 text-[#1a3f22] flex items-center gap-2">
            <BookOpen size={18} /> In Progress
          </h3>
          <div className="space-y-4">
            <div className="border-b border-dashed border-gray-300 pb-2">
              <p className="font-black text-lg font-serif text-gray-800 dark:text-gray-100 uppercase tracking-tighter">
                The Great Gatsby
              </p>
              <p className="text-[10px] font-mono text-gray-400 uppercase">
                F. Scott Fitzgerald
              </p>
            </div>
            <div className="bg-gray-100 dark:bg-black/20 p-3 rounded-xl">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span>ARCHIVE PROGRESS</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-gray-300 h-1 rounded-full overflow-hidden">
                <div className="bg-[#8b5a2b] h-full w-[45%]" />
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default BookPulsePage;
