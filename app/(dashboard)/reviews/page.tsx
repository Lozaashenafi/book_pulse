"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Star, Image as ImageIcon, Send, Loader2, Trash2, Paperclip, Pencil, ChevronDown, ChevronUp, Heart, Bookmark, X, BookMarked, Archive } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { getBookReviews, createReviewAction, deleteReviewAction, updateReviewAction, toggleReviewLike, toggleReviewFavorite } from "@/services/review.service";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const BookReviewsPage = () => {
  const { user, profile } = useAuthStore();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // View Mode (All vs Favorites)
  const [viewMode, setViewMode] = useState<"all" | "fav">("all");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  // Form States
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ bookTitle: "", authorName: "", content: "", rating: 5 });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchReviews = async () => {
    const data = await getBookReviews(user?.id);
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => { fetchReviews(); }, [user]);

  // --- NEW: Reset Form Logic ---
  const resetForm = () => {
    setEditingId(null);
    setFormData({ bookTitle: "", authorName: "", content: "", rating: 5 });
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  // --- Toggle for New Note Button ---
  const handleNewNoteClick = () => {
    if (!isFormOpen) {
      resetForm(); // Clear everything before opening a fresh form
    }
    setIsFormOpen(!isFormOpen);
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleToggleLike = async (id: string) => {
    if (!user) return toast.error("Login to interact");
    await toggleReviewLike(user.id, id, profile?.name || "A reader");
    fetchReviews();
  };

  const handleToggleFav = async (id: string) => {
    if (!user) return toast.error("Login to save");
    await toggleReviewFavorite(user.id, id);
    toast.success(viewMode === 'fav' ? "Removed from shelf" : "Saved to favorites");
    fetchReviews();
  };

  const handleEdit = (rev: any) => {
    setEditingId(rev.id);
    setFormData({
      bookTitle: rev.bookTitle,
      authorName: rev.authorName,
      content: rev.content,
      rating: rev.rating
    });
    setExistingImageUrl(rev.imageUrl);
    setImagePreview(null); // Clear any unsaved preview from a previous "new note" attempt
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) { 
      setImageFile(file); 
      setImagePreview(URL.createObjectURL(file)); 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsSubmitting(true);
    try {
      let finalImageUrl = existingImageUrl || "";
      if (imageFile) {
        const supabase = createClient();
        const path = `reviews/${crypto.randomUUID()}-${imageFile.name}`;
        await supabase.storage.from("books").upload(path, imageFile);
        finalImageUrl = supabase.storage.from("books").getPublicUrl(path).data.publicUrl;
      }
      if (editingId) {
        await updateReviewAction(user.id, editingId, { ...formData, imageUrl: finalImageUrl });
      } else {
        await createReviewAction(user.id, { ...formData, imageUrl: finalImageUrl });
      }
      
      resetForm(); // Clean up after submission
      setIsFormOpen(false); 
      fetchReviews();
      toast.success("Archive updated.");
    } catch (err) { toast.error("Error."); } finally { setIsSubmitting(false); }
  };

  const filteredReviews = useMemo(() => {
    if (viewMode === "fav") return reviews.filter(r => r.isFavorited);
    return reviews;
  }, [reviews, viewMode]);

  if (loading) return <div className="h-full w-full flex items-center justify-center pt-20"><Loader2 className="animate-spin text-[#1a3f22]" /></div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-end border-b-2 border-tertiary/10 pb-6 gap-6">
        <div>
          <span className="text-[10px] font-mono font-black text-[#8b5a2b] dark:text-[#d4a373] uppercase tracking-[0.4em]">Archive Registry</span>
          <h1 className="text-5xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373]">Notes & <span className="italic">Reflections</span></h1>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={() => setViewMode(viewMode === "all" ? "fav" : "all")}
            className={`flex items-center gap-2 px-6 py-2 font-mono text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
              viewMode === "fav" 
              ? "bg-[#d4a373] text-[#1a3f22] border-[#1a3f22] shadow-[4px_4px_0px_#1a3f22]" 
              : "bg-white text-[#8b5a2b] border-[#d6c7a1] hover:border-[#8b5a2b]"
            }`}
          >
            <Bookmark size={14} className={viewMode === 'fav' ? 'fill-current' : ''} /> 
            {viewMode === "fav" ? "All Records" : "My Favorites"}
          </button>

          <button onClick={handleNewNoteClick} className="bg-[#1a3f22] text-[#f4ebd0] px-6 py-2 font-serif italic font-bold shadow-[4px_4px_0px_#8b5a2b] hover:translate-y-1 transition-all">
            {isFormOpen ? (editingId ? "Discard Edits" : "Discard") : "New Note"}
          </button>
        </div>
      </header>

      {/* Write/Edit Form */}
      {isFormOpen && (
         <div className="mb-16 bg-[#f4ebd0] dark:bg-[#252525] border-2 border-[#1a3f22] p-8 shadow-[10px_10px_0px_#8b5a2b] animate-in slide-in-from-top-4 relative">
            <Paperclip className="absolute -top-4 right-8 text-[#8b5a2b] -rotate-12" size={32} />
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <input placeholder="Book Title" required value={formData.bookTitle} onChange={e => setFormData({...formData, bookTitle: e.target.value})} className="w-full bg-white dark:bg-black/20 p-3 border-b-2 border-[#1a3f22]/20 outline-none focus:border-[#1a3f22] font-serif font-bold text-[#1a3f22] dark:text-[#d4a373]" />
                    <input placeholder="Author" required value={formData.authorName} onChange={e => setFormData({...formData, authorName: e.target.value})} className="w-full bg-white dark:bg-black/20 p-3 border-b-2 border-[#1a3f22]/20 outline-none focus:border-[#1a3f22] font-serif italic text-[#1a3f22] dark:text-[#d4a373]" />
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6 bg-white/50 dark:bg-black/20 p-4 border border-dashed border-[#1a3f22]/20">
                    <div className="w-24 h-32 bg-[#fdfcf8] dark:bg-black/40 border flex items-center justify-center overflow-hidden shrink-0">
                        {imagePreview || existingImageUrl ? <img src={imagePreview || existingImageUrl || ''} className="w-full h-full object-cover" alt="preview" /> : <ImageIcon size={24} className="opacity-20" />}
                    </div>
                    <div className="flex-1">
                        <div className="flex gap-2 mb-4">
                            {[1,2,3,4,5].map(s => <Star key={s} size={20} onClick={() => setFormData({...formData, rating: s})} className={`cursor-pointer ${formData.rating >= s ? "fill-[#d4a373] text-[#d4a373]" : "text-gray-300"}`} />)}
                        </div>
                        <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-mono font-black uppercase text-[#8b5a2b] dark:text-[#d4a373] hover:underline flex items-center gap-2"><ImageIcon size={14}/> {imageFile ? "Change Image" : (existingImageUrl ? "Replace Current Image" : "Upload Visual")}</button>
                        <input type="file" ref={fileInputRef} hidden onChange={handleImageSelect} accept="image/*" />
                    </div>
                </div>
                <textarea placeholder="Spill your thoughts..." required value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="w-full h-40 bg-white dark:bg-black/20 p-4 border border-dashed border-[#1a3f22]/20 outline-none focus:border-[#1a3f22] font-serif italic text-[#1a3f22] dark:text-gray-200" />
                <button type="submit" disabled={isSubmitting} className="w-full bg-[#1a3f22] dark:bg-[#d4a373] text-white dark:text-[#1a1614] py-4 font-serif font-black italic text-xl shadow-[4px_4px_0px_#8b5a2b] transition-all">{isSubmitting ? <Loader2 className="animate-spin m-auto" /> : (editingId ? "Save Changes" : "Save to Archives")}</button>
            </form>
         </div>
      )}

      {/* Filtered Feed */}
      <div className="space-y-12">
        {filteredReviews.length > 0 ? filteredReviews.map((rev) => (
          <article key={rev.id} className="relative bg-white dark:bg-[#252525] border-2 border-tertiary/5 p-6 md:p-10 shadow-sm flex flex-col md:flex-row gap-8 group transition-all hover:shadow-md">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#d4a373] opacity-30" />
            {rev.imageUrl && (
              <div className="w-full md:w-40 h-56 bg-[#f4ebd0] shrink-0 border-2 border-[#1a3f22]/10 rotate-1 group-hover:rotate-0 transition-transform overflow-hidden shadow-md">
                <img src={rev.imageUrl} className="w-full h-full object-cover" alt="cover" />
              </div>
            )}
            <div className="flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="min-w-0">
                  <h2 className="text-3xl font-serif font-black text-[#1a3f22] dark:text-[#d4a373] leading-tight truncate">{rev.bookTitle}</h2>
                  <p className="text-sm font-serif italic text-[#8b5a2b] dark:text-stone-400">by {rev.authorName}</p>
                  <div className="flex gap-1 mt-2">
                    {[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < rev.rating ? "fill-[#d4a373] text-[#d4a373]" : "text-gray-200"} />)}
                  </div>
                </div>
                <div className="flex gap-3">
                  {user?.id === rev.userId && <button onClick={() => handleEdit(rev)} className="text-stone-400 hover:text-[#1a3f22]"><Pencil size={14}/></button>}
                  {user?.id === rev.userId && <button 
                    onClick={async () => { 
                      if (!user) return; 
                      if (!confirm("Delete this reflection?")) return;
                      await deleteReviewAction(user.id, rev.id); 
                      fetchReviews(); 
                    }} 
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={14}/>
                  </button>}
                </div>
              </div>

              <div className="relative">
                <p className={`font-serif italic text-lg text-[#1a3f22]/80 dark:text-stone-200 leading-relaxed whitespace-pre-wrap ${!expandedIds.has(rev.id) ? "line-clamp-3" : ""}`}>
                    "{rev.content}"
                </p>
                {rev.content.length > 220 && (
                    <button 
                      onClick={() => toggleExpand(rev.id)} 
                      className="mt-2 text-tertiary dark:text-[#d4a373] font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline"
                    >
                        {expandedIds.has(rev.id) ? <><ChevronUp size={14}/> Close Note</> : <><ChevronDown size={14}/> Read Full Reflection</>}
                    </button>
                )}
              </div>
              
              <div className="mt-auto pt-6 border-t border-dashed border-[#1a3f22]/10 flex justify-between items-center">
                <div className="flex items-center gap-3 text-[10px] font-mono font-black uppercase text-[#8b5a2b] dark:text-stone-400">
                  <div className="w-8 h-8 rounded-full bg-[#f4ebd0] overflow-hidden border border-[#1a3f22]/10">{rev.userImage && <img src={rev.userImage} className="w-full h-full object-cover"/>}</div>
                  <span>{rev.userName}</span>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => handleToggleLike(rev.id)} className={`flex items-center gap-1 text-[10px] font-bold ${rev.isLiked ? "text-red-500" : "text-stone-400 hover:text-[#1a3f22]"}`}>
                      <Heart size={16} className={rev.isLiked ? "fill-current" : ""}/> {rev.likeCount}
                   </button>
                   <button onClick={() => handleToggleFav(rev.id)} className={`transition-colors ${rev.isFavorited ? "text-[#d4a373]" : "text-stone-400 hover:text-[#d4a373]"}`}>
                      <Bookmark size={16} className={rev.isFavorited ? "fill-current" : ""}/>
                   </button>
                </div>
              </div>
            </div>
          </article>
        )) : (
            <div className="py-32 text-center border-2 border-dashed border-[#d6c7a1]">
                <Archive size={48} className="mx-auto text-[#d6c7a1] mb-4 opacity-20" />
                <p className="font-serif italic text-[#8b5a2b]">
                    {viewMode === 'fav' ? "Your collection of favorites is currently empty." : "No records found in the general ledger."}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default BookReviewsPage;