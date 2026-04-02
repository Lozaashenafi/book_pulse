"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
  Calendar, BookOpen, Plus, Trash2, Clock, 
  Paperclip, Image as ImageIcon, Loader2, Pencil, AlertCircle 
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  createBookSchedule, 
  getUserSchedules, 
  deleteBookSchedule, 
  updateBookSchedule 
} from "@/services/schedule.service";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const SchedulePage = () => {
  const { user } = useAuthStore();
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form / Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: "", author: "", date: "", notes: "" });
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get today's date in YYYY-MM-DD format for the 'min' attribute
  const todayStr = new Date().toISOString().split('T')[0];

  const fetchSchedules = async () => {
    if (!user) return;
    const data = await getUserSchedules(user.id);
    setSchedules(data);
    setLoading(false);
  };

  useEffect(() => { fetchSchedules(); }, [user]);

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      author: item.author,
      date: new Date(item.scheduledDate).toISOString().split('T')[0],
      notes: item.notes || ""
    });
    setImagePreview(item.coverUrl);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!user || !confirm("Remove this book from your future queue?")) return;
    try {
      await deleteBookSchedule(user.id, id);
      toast.success("Registry updated.");
      fetchSchedules();
    } catch (err) {
      toast.error("Deletion failed.");
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const selectedDate = new Date(formData.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return toast.error("You cannot schedule a book for a past date.", {
        icon: <AlertCircle className="text-red-500" />
      });
    }

    setIsSubmitting(true);
    try {
      let finalCoverUrl = imagePreview || "";

      if (file) {
        const supabase = createClient();
        const path = `schedules/${crypto.randomUUID()}`;
        await supabase.storage.from("books").upload(path, file);
        finalCoverUrl = supabase.storage.from("books").getPublicUrl(path).data.publicUrl;
      }

      if (editingId) {
        await updateBookSchedule(user.id, editingId, {
          ...formData,
          scheduledDate: formData.date,
          coverUrl: finalCoverUrl
        });
        toast.success("Schedule modified.");
      } else {
        await createBookSchedule(user.id, {
          ...formData,
          scheduledDate: formData.date,
          coverUrl: finalCoverUrl
        });
        toast.success("Book queued for the future.");
      }

      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ title: "", author: "", date: "", notes: "" });
      setImagePreview(null);
      fetchSchedules();
    } catch (err) {
      toast.error("Action failed.");
    } finally { setIsSubmitting(false); }
  };

  if (loading) return <div className="h-full w-full flex items-center justify-center pt-20"><Loader2 className="animate-spin text-tertiary" /></div>;

  return (
    <div className="max-w-5xl mx-auto py-10 px-6">
      <header className="mb-12 flex justify-between items-end border-b-2 border-tertiary/10 pb-6">
        <div>
          <span className="text-[10px] font-mono font-black text-[#8b5a2b] dark:text-[#d4a373] uppercase tracking-[0.4em]">Future Registry</span>
          <h1 className="text-5xl font-serif font-black text-tertiary dark:text-[#d4a373]">Reading <span className="italic">Queue</span></h1>
        </div>
        <button 
          onClick={() => {
            setIsFormOpen(!isFormOpen);
            if (isFormOpen) setEditingId(null);
          }}
          className="bg-tertiary text-[#f4ebd0] px-6 py-2 font-serif italic font-bold shadow-[4px_4px_0px_#d4a373] transition-all hover:translate-y-1"
        >
          {isFormOpen ? "Discard" : "Add to Queue"}
        </button>
      </header>

      {isFormOpen && (
        <div className="mb-16 bg-[#f4ebd0] dark:bg-[#252525] border-2 border-tertiary p-8 shadow-[10px_10px_0px_#8b5a2b] animate-in slide-in-from-top-4 relative">
          <Paperclip className="absolute -top-4 right-8 text-[#8b5a2b] -rotate-12" size={32} />
          <h3 className="text-[10px] font-mono font-black text-tertiary uppercase mb-6">{editingId ? "Update Entry" : "New Plan"}</h3>
          
          <form onSubmit={handleCreateOrUpdate} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <input placeholder="Book Title" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full bg-white dark:bg-black/20 p-3 border-b-2 border-tertiary/10 outline-none focus:border-tertiary font-serif font-black" />
               <input placeholder="Author" required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full bg-white dark:bg-black/20 p-3 border-b-2 border-tertiary/10 outline-none focus:border-tertiary font-serif italic" />
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 items-center bg-white/50 dark:bg-black/20 p-4 border border-dashed border-tertiary/20">
               <div className="w-20 h-28 bg-[#fdfcf8] border shrink-0 flex items-center justify-center overflow-hidden">
                  {imagePreview ? <img src={imagePreview} className="w-full h-full object-cover" /> : <ImageIcon className="opacity-10"/>}
               </div>
               <div className="flex-1 space-y-4 w-full">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono font-bold uppercase text-gray-400">Launch Date</label>
                    <input 
                      type="date" 
                      required 
                      min={todayStr}
                      value={formData.date} 
                      onChange={e => setFormData({...formData, date: e.target.value})} 
                      className="w-full bg-white dark:bg-black/20 border border-tertiary/10 p-2 font-mono text-xs uppercase" 
                    />
                  </div>
                  <button type="button" onClick={() => fileInputRef.current?.click()} className="text-[10px] font-mono font-black uppercase text-[#8b5a2b] hover:underline flex items-center gap-2">
                    <ImageIcon size={14}/> {file ? "Change Cover" : "Upload Visual"}
                  </button>
                  <input type="file" ref={fileInputRef} hidden onChange={e => {
                    const f = e.target.files?.[0];
                    if(f) { setFile(f); setImagePreview(URL.createObjectURL(f)); }
                  }} accept="image/*" />
               </div>
            </div>

            <textarea placeholder="Queue Notes (Why do you want to read this?)..." value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="w-full h-24 bg-white dark:bg-black/20 border border-dashed border-tertiary/20 p-4 font-serif italic text-sm outline-none" />
            
            <button type="submit" disabled={isSubmitting} className="w-full bg-tertiary text-white py-4 font-serif font-black italic text-lg shadow-[6px_6px_0px_#132f19] transition-all">
              {isSubmitting ? <Loader2 className="animate-spin m-auto" /> : editingId ? "Update Registry" : "Inscribe into Queue"}
            </button>
          </form>
        </div>
      )}

      {/* EMPTY STATE - Shown when there are no schedules and form is closed */}
      {schedules.length === 0 && !isFormOpen && (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed border-tertiary/20 rounded-lg bg-stone-50/30 dark:bg-black/5 animate-in fade-in duration-700">
          <div className="relative mb-6">
            <BookOpen className="text-tertiary/10 w-20 h-20" />
            <Plus className="absolute -bottom-2 -right-2 text-tertiary w-8 h-8 bg-[#fdfcf8] dark:bg-[#1a1c1a] rounded-full p-1.5 shadow-sm border border-tertiary/10" />
          </div>
          <h2 className="text-2xl font-serif italic text-tertiary/60 mb-2">The shelves are quiet...</h2>
          <p className="text-stone-400 font-serif text-sm mb-6 text-center max-w-xs">
            Your future reading queue is currently empty. Why not inscribe a new chapter?
          </p>
          <button 
            onClick={() => setIsFormOpen(true)}
            className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-[#8b5a2b] hover:text-tertiary transition-colors"
          >
            + Create your first entry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {schedules.map((item) => (
          <div key={item.id} className="bg-white dark:bg-[#2c2420] border-2 border-tertiary/10 p-6 flex gap-6 relative group transition-all hover:shadow-md">
            <div className="w-24 h-32 bg-[#f4ebd0] shrink-0 shadow-md border border-tertiary/10 overflow-hidden">
               {item.coverUrl ? <img src={item.coverUrl} className="w-full h-full object-cover" /> : <BookOpen size={24} className="m-auto mt-12 opacity-10" />}
            </div>

            <div className="flex-1 min-w-0">
               <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 text-[#d4a373]">
                    <Clock size={12} />
                    <span className="text-[9px] font-mono font-bold uppercase tracking-tighter">
                      Plan: {new Date(item.scheduledDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(item)} className="text-stone-400 hover:text-tertiary"><Pencil size={14}/></button>
                    <button onClick={() => handleDelete(item.id)} className="text-red-300 hover:text-red-600"><Trash2 size={14}/></button>
                  </div>
               </div>
               <h3 className="font-serif font-black text-lg text-tertiary dark:text-[#d4a373] truncate mt-1">{item.title}</h3>
               <p className="text-xs font-serif italic text-[#8b5a2b] mb-3">by {item.author}</p>
               <p className="text-[11px] text-gray-500 line-clamp-2 italic leading-relaxed">"{item.notes || 'No notes inscribed.'}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SchedulePage;