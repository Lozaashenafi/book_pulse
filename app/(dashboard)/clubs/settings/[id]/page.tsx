"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Trash2,
  Loader2,
  Users,
  Book as BookIcon,
  ShieldAlert,
  Copy,
  Check,
  FileUp,
  UserMinus,
  Settings,
  CheckCircle,
  AlertTriangle,
  Paperclip,
} from "lucide-react";
import { toast } from "sonner";

import { useAuthStore } from "@/store/useAuthStore";
import { useClubSettings } from "@/hooks/useClubSettings";
import {
  deleteClub,
  updateBook,
  updateClub,
  updateMemberStatus,
} from "@/services/club.service";
import { createClient } from "@/lib/supabase/client";

// UI Helper components inside the file to maintain specific styling
const ClubInput = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase tracking-widest ml-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full bg-white dark:bg-[#252525] border-2 border-[#5c4033]/10 p-3 font-serif outline-none focus:border-[#5c4033] transition-colors dark:text-white shadow-inner"
      onChange={(e) => props.onChange(e.target.value)}
    />
  </div>
);

const ClubTextArea = ({ label, ...props }: any) => (
  <div className="space-y-1">
    <label className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase tracking-widest ml-1">
      {label}
    </label>
    <textarea
      {...props}
      className="w-full bg-white dark:bg-[#252525] border-2 border-[#5c4033]/10 p-4 font-serif italic outline-none focus:border-[#5c4033] transition-colors dark:text-white shadow-inner resize-none"
      onChange={(e) => props.onChange(e.target.value)}
    />
  </div>
);

const ClubSettingsPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthStore();

  const { data, setData, loading, saving, setSaving, refresh } =
    useClubSettings(id as string, user?.id);
  const { club, members, categories } = data;

  const [activeTab, setActiveTab] = useState<"general" | "book" | "members">(
    "general",
  );
  const [copied, setCopied] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newPdf, setNewPdf] = useState<File | null>(null);

  const handleUpdateClub = async () => {
    setSaving(true);
    try {
      await updateClub(club.id, club);
      toast.success("Ledger updated!");
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const handleUpdateBook = async () => {
    setSaving(true);
    try {
      let uploadedPdfUrl = club.books.pdf_url; // Default to existing URL

      // 1. If there is a NEW file, upload it to Supabase Storage first
      if (newPdf) {
        const supabase = createClient();
        const fileExt = newPdf.name.split(".").pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `pdfs/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("books")
          .upload(filePath, newPdf);

        if (uploadError) throw uploadError;

        // Get the Public URL
        const { data } = supabase.storage.from("books").getPublicUrl(filePath);
        uploadedPdfUrl = data.publicUrl;
      }

      // 2. Call the Drizzle Server Action with the URL (string), not the File
      await updateBook(club.books.id, club.books, uploadedPdfUrl);

      toast.success("Manuscript details updated!");
      setNewPdf(null); // Clear the file input state
      refresh(); // Refresh the data to show the new link
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update book");
    } finally {
      setSaving(false);
    }
  };

  const handleMemberAction = async (
    targetUserId: string,
    action: "REMOVE" | "BAN" | "UNBAN",
  ) => {
    if (!confirm("Are you sure?")) return;
    try {
      await updateMemberStatus(club.id, targetUserId, action);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteClub = async () => {
    setSaving(true);
    try {
      await deleteClub(club.id);
      router.push("/clubs/myclubs");
    } catch (err: any) {
      toast.error(err.message);
      setSaving(false);
    }
  };

  const copyInvite = () => {
    const link = `${window.location.origin}/join/${club.club_invites[0]?.token}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading || !club)
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-[#5c4033]" size={40} />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto py-4 px-2">
      <div className="flex items-center justify-between border-b-2 border-[#5c4033]/10 pb-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-[#8b5a2b] font-mono text-xs font-bold uppercase hover:text-[#5c4033]"
        >
          <ArrowLeft size={16} /> Back to Registry
        </button>
        <div className="font-serif italic text-[#5c4033] dark:text-[#d4a373] font-bold">
          {club.name} / Settings
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-10">
        {/* ASIDE: FOLDER TABS STYLE */}
        <aside className="w-full md:w-56 space-y-3">
          {[
            {
              id: "general",
              label: "Registry Info",
              icon: <Settings size={18} />,
            },
            {
              id: "book",
              label: "The Manuscript",
              icon: <BookIcon size={18} />,
            },
            {
              id: "members",
              label: "The Fellowship",
              icon: <Users size={18} />,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 font-serif font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-[#5c4033] text-[#f4ebd0] translate-x-2 shadow-[-4px_4px_0px_#3e2b22]"
                  : "bg-white/50 dark:bg-black/10 text-[#5c4033] dark:text-gray-400 hover:bg-[#5c4033]/5"
              }`}
            >
              {tab.icon}
              <span className="text-sm">{tab.label}</span>
            </button>
          ))}
        </aside>

        <main className="flex-1 space-y-10">
          {/* MAIN CONTENT CARD: SCRAP PAPER STYLE */}
          <div className="relative bg-white dark:bg-[#252525] p-8 shadow-md border-t-[12px] border-[#8b5a2b]/20">
            <Paperclip
              className="absolute -top-4 right-8 text-gray-400 rotate-12"
              size={32}
            />

            {/* TAB: GENERAL */}
            {activeTab === "general" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-3xl font-serif font-black text-[#5c4033] dark:text-[#d4a373]">
                  Circle Details
                </h2>
                <ClubInput
                  label="Squad Name"
                  value={club.name}
                  onChange={(v: string) =>
                    setData({ ...data, club: { ...club, name: v } })
                  }
                />
                <ClubTextArea
                  label="Circle Manifesto"
                  value={club.description}
                  onChange={(v: string) =>
                    setData({ ...data, club: { ...club, description: v } })
                  }
                />
                <div className="grid grid-cols-2 gap-6">
                  <ClubInput
                    label="Opening Date"
                    type="date"
                    value={club.start_date.split("T")[0]}
                    onChange={(v: string) =>
                      setData({ ...data, club: { ...club, start_date: v } })
                    }
                  />
                  <ClubInput
                    label="Closing Date"
                    type="date"
                    value={club.end_date.split("T")[0]}
                    onChange={(v: string) =>
                      setData({ ...data, club: { ...club, end_date: v } })
                    }
                  />
                </div>
                <button
                  onClick={handleUpdateClub}
                  disabled={saving}
                  className="bg-[#5c4033] text-[#f4ebd0] px-8 py-3 font-serif italic shadow-[4px_4px_0px_#3e2b22] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Update Ledger
                </button>
              </div>
            )}

            {/* TAB: BOOK & GENRE (Ledger Style) */}
            {activeTab === "book" && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <h2 className="text-3xl font-serif font-black text-[#5c4033] dark:text-[#d4a373]">
                  Manuscript Setup
                </h2>
                <ClubInput
                  label="Title of Work"
                  value={club.books.title}
                  onChange={(v: string) =>
                    setData({
                      ...data,
                      club: { ...club, books: { ...club.books, title: v } },
                    })
                  }
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ClubInput
                    label="The Author"
                    value={club.books.author}
                    onChange={(v: string) =>
                      setData({
                        ...data,
                        club: { ...club, books: { ...club.books, author: v } },
                      })
                    }
                  />
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase tracking-widest ml-1">
                      Genre Category
                    </label>
                    <select
                      className="w-full bg-white dark:bg-[#252525] border-2 border-[#5c4033]/10 p-3 font-serif outline-none focus:border-[#5c4033] dark:text-white"
                      value={club.books.category}
                      onChange={(e) =>
                        setData({
                          ...data,
                          club: {
                            ...club,
                            books: { ...club.books, category: e.target.value },
                          },
                        })
                      }
                    >
                      {categories.map((cat: string) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <ClubTextArea
                  label="Plot Summary"
                  value={club.books.description}
                  onChange={(v: string) =>
                    setData({
                      ...data,
                      club: {
                        ...club,
                        books: { ...club.books, description: v },
                      },
                    })
                  }
                />

                <div className="p-6 border-2 border-dashed border-[#5c4033]/20 bg-[#f4ebd0]/20">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center gap-4">
                      <FileUp className="text-[#8b5a2b]" />
                      <div>
                        <p className="text-sm font-bold font-serif text-[#5c4033] dark:text-gray-100">
                          {newPdf ? newPdf.name : "Replace PDF Script"}
                        </p>
                        <p className="text-[10px] font-mono text-[#8b5a2b] uppercase">
                          {club.books.pdf_url
                            ? "Current file attached"
                            : "No script uploaded"}
                        </p>
                      </div>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf"
                      onChange={(e) => setNewPdf(e.target.files?.[0] || null)}
                    />
                    <span className="font-mono text-[10px] font-bold bg-[#5c4033] text-[#f4ebd0] px-3 py-1 shadow-sm">
                      BROWSE
                    </span>
                  </label>
                </div>

                <button
                  onClick={handleUpdateBook}
                  disabled={saving}
                  className="bg-[#5c4033] text-[#f4ebd0] px-8 py-3 font-serif italic shadow-[4px_4px_0px_#3e2b22] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center gap-2"
                >
                  {saving ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <Save size={18} />
                  )}
                  Update Manuscript
                </button>
              </div>
            )}

            {/* TAB: MEMBERS (Library Registry Style) */}
            {activeTab === "members" && (
              <div className="space-y-8 animate-in fade-in duration-500">
                <h2 className="text-3xl font-serif font-black text-[#5c4033] dark:text-[#d4a373]">
                  The Fellowship
                </h2>

                <div className="p-4 bg-[#f4ebd0] dark:bg-black/20 border-2 border-[#d6c7a1] flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono font-bold text-[#8b5a2b] uppercase">
                      Invitation Link
                    </span>
                    <span className="text-xs font-serif font-bold text-[#5c4033] dark:text-gray-300 truncate max-w-[200px]">
                      .../join/{club.club_invites[0]?.token}
                    </span>
                  </div>
                  <button
                    onClick={copyInvite}
                    className="p-2 bg-[#5c4033] text-[#f4ebd0] shadow-sm"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>

                <div className="divide-y divide-[#5c4033]/10">
                  {members.map((m: any) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between py-4 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-[#5c4033] dark:bg-[#d4a373] text-[#f4ebd0] flex items-center justify-center font-serif italic shadow-sm overflow-hidden">
                          {m.profiles.image ? (
                            <img
                              src={m.profiles.image}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            m.profiles.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-[#5c4033] dark:text-gray-100">
                            {m.profiles.name}{" "}
                            {m.user_id === user?.id && "(You)"}
                          </p>
                          <p className="text-[9px] font-mono text-[#8b5a2b] uppercase font-bold tracking-widest">
                            {m.role}
                          </p>
                        </div>
                      </div>
                      {m.role !== "OWNER" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleMemberAction(
                                m.user_id,
                                m.is_suspended ? "UNBAN" : "BAN",
                              )
                            }
                            className={`p-2 shadow-sm ${m.is_suspended ? "bg-green-600 text-white" : "bg-orange-100 text-orange-700"}`}
                          >
                            {m.is_suspended ? (
                              <CheckCircle size={16} />
                            ) : (
                              <ShieldAlert size={16} />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              handleMemberAction(m.user_id, "REMOVE")
                            }
                            className="p-2 bg-red-50 text-red-600 shadow-sm"
                          >
                            <UserMinus size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* DANGER ZONE: RED STAMP STYLE */}
          <div className="bg-red-50/50 dark:bg-red-900/5 p-8 border-2 border-dashed border-red-200 dark:border-red-900/30">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-red-600" size={24} />
              <div className="flex-1">
                <h3 className="font-serif font-black text-red-700 dark:text-red-400 uppercase tracking-tighter text-xl">
                  Danger Zone
                </h3>
                <p className="text-sm font-serif italic text-red-600/80">
                  To dissolve this circle permanently, all other members must be
                  dismissed first.
                </p>
                <button
                  disabled={members.length > 1}
                  onClick={() => setShowDeleteModal(true)}
                  className="mt-6 px-8 py-2 bg-red-600 text-white font-serif italic shadow-[4px_4px_0px_#991b1b] hover:translate-y-0.5 hover:shadow-none transition-all disabled:opacity-30"
                >
                  Dissolve Fellowship
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* DELETE MODAL: STICKY NOTE STYLE */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#feff9c] dark:bg-[#c4c562] p-10 max-w-sm w-full shadow-[10px_10px_0px_rgba(0,0,0,0.2)] transform -rotate-1 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-red-600 shadow-md" />
            <Trash2 size={48} className="text-[#2c2c2c] mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-black text-center mb-2 text-[#2c2c2c]">
              Burn the Ledger?
            </h2>
            <p className="text-center font-serif italic text-[#8b5a2b] mb-8">
              Every note, member, and scribble in "{club.name}" will be lost to
              time.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 font-bold text-xs uppercase tracking-widest text-black/40"
              >
                Abort
              </button>
              <button
                onClick={handleDeleteClub}
                className="flex-1 py-3 bg-[#5c4033] text-[#f4ebd0] font-bold shadow-[4px_4px_0px_rgba(0,0,0,0.2)]"
              >
                Dissolve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubSettingsPage;
