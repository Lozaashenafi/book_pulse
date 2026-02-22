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
} from "lucide-react";

import { clubService } from "@/services/club.service";
import { useAuthStore } from "@/store/useAuthStore";
import { useClubSettings } from "@/hooks/useClubSettings";

// Import our new helper components
import {
  TabButton,
  Input,
  TextArea,
  Select,
  SaveButton,
} from "@/components/ui/club-form-elements";
import { toast } from "sonner";
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

  // Actions
  const handleUpdateClub = async () => {
    setSaving(true);
    try {
      await clubService.updateClub(club.id, club);
      toast.success("Settings saved!");
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const handleUpdateBook = async () => {
    setSaving(true);
    try {
      await clubService.updateBook(
        club.books.id,
        club.books,
        newPdf || undefined,
      );
      toast.success("Book updated successfully!");
    } catch (err: any) {
      toast.error(err.message);
    }
    setSaving(false);
  };

  const handleMemberAction = async (
    targetUserId: string,
    action: "REMOVE" | "BAN" | "UNBAN",
  ) => {
    if (!confirm("Are you sure?")) return;
    try {
      await clubService.updateMemberStatus(club.id, targetUserId, action);
      refresh();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteClub = async () => {
    setSaving(true);
    try {
      await clubService.deleteClub(club.id);
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
      <div className="h-screen flex items-center justify-center bg-[#fdf8f1] dark:bg-[#121212]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fdf8f1] dark:bg-[#121212] pt-16 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 mb-8 hover:text-primary transition-colors"
        >
          <ArrowLeft size={20} /> Back
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 space-y-2">
            <TabButton
              active={activeTab === "general"}
              onClick={() => setActiveTab("general")}
              icon={<Settings size={18} />}
              label="General"
            />
            <TabButton
              active={activeTab === "book"}
              onClick={() => setActiveTab("book")}
              icon={<BookIcon size={18} />}
              label="Book & Genre"
            />
            <TabButton
              active={activeTab === "members"}
              onClick={() => setActiveTab("members")}
              icon={<Users size={18} />}
              label="Members"
            />
          </aside>

          <main className="flex-1 space-y-6">
            <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-8 border border-primary/10 shadow-sm">
              {/* TAB: GENERAL */}
              {activeTab === "general" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <h2 className="text-2xl font-serif font-bold dark:text-white">
                    Circle Details
                  </h2>
                  <Input
                    label="Name"
                    value={club.name}
                    onChange={(v: string) =>
                      setData({ ...data, club: { ...club, name: v } })
                    }
                  />
                  <TextArea
                    label="Description"
                    value={club.description}
                    onChange={(v: string) =>
                      setData({ ...data, club: { ...club, description: v } })
                    }
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Start Date"
                      type="date"
                      value={club.start_date.split("T")[0]}
                      onChange={(v: string) =>
                        setData({ ...data, club: { ...club, start_date: v } })
                      }
                    />
                    <Input
                      label="End Date"
                      type="date"
                      value={club.end_date.split("T")[0]}
                      onChange={(v: string) =>
                        setData({ ...data, club: { ...club, end_date: v } })
                      }
                    />
                  </div>
                  <SaveButton
                    loading={saving}
                    onClick={handleUpdateClub}
                    label="Save Settings"
                    icon={Save}
                  />
                </div>
              )}

              {/* TAB: BOOK & GENRE */}
              {activeTab === "book" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <h2 className="text-2xl font-serif font-bold dark:text-white">
                    Book Configuration
                  </h2>

                  <div className="space-y-4">
                    {/* 1. Book Title */}
                    <Input
                      label="Book Title"
                      value={club.books.title}
                      onChange={(v: string) =>
                        setData({
                          ...data,
                          club: { ...club, books: { ...club.books, title: v } },
                        })
                      }
                    />

                    {/* 2. Author & Category Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Author"
                        value={club.books.author}
                        onChange={(v: string) =>
                          setData({
                            ...data,
                            club: {
                              ...club,
                              books: { ...club.books, author: v },
                            },
                          })
                        }
                      />
                      <Select
                        label="Category/Genre"
                        options={categories}
                        value={club.books.category}
                        onChange={(v: string) =>
                          setData({
                            ...data,
                            club: {
                              ...club,
                              books: { ...club.books, category: v },
                            },
                          })
                        }
                      />
                    </div>

                    {/* 3. BOOK DESCRIPTION (Added back here) */}
                    <TextArea
                      label="Book Summary / Description"
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

                    {/* 4. PDF Upload */}
                    <div className="p-4 border-2 border-dashed border-primary/10 rounded-2xl bg-[#fdf8f1] dark:bg-transparent">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <FileUp className="text-primary" />
                          <div>
                            <p className="text-sm font-bold dark:text-white">
                              {newPdf ? newPdf.name : "Replace Book PDF"}
                            </p>
                            <p className="text-xs text-gray-400">
                              {club.books.pdf_url
                                ? "Currently has a PDF file"
                                : "No PDF attached"}
                            </p>
                          </div>
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf"
                          onChange={(e) =>
                            setNewPdf(e.target.files?.[0] || null)
                          }
                        />
                        <span className="text-xs font-bold text-primary uppercase px-3 py-1 bg-primary/10 rounded-lg">
                          Browse
                        </span>
                      </label>
                    </div>
                  </div>

                  <SaveButton
                    loading={saving}
                    onClick={handleUpdateBook}
                    label="Update Book Details"
                    icon={Save}
                  />
                </div>
              )}
              {/* TAB: MEMBERS */}
              {activeTab === "members" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
                  <h2 className="text-2xl font-serif font-bold dark:text-white">
                    Manage Members
                  </h2>
                  <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <span className="text-xs font-mono truncate mr-2">
                      .../join/{club.club_invites[0]?.token}
                    </span>
                    <button
                      onClick={copyInvite}
                      className="p-2 hover:bg-gray-100 rounded-md"
                    >
                      {copied ? (
                        <Check size={16} className="text-green-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  </div>

                  <div className="space-y-3">
                    {members.map((m: any) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-white/5"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {m.profiles.image ? (
                              <img
                                src={m.profiles.image}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Users size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold dark:text-white">
                              {m.profiles.name}{" "}
                              {m.user_id === user?.id && "(You)"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">
                              {m.role}
                            </p>
                          </div>
                        </div>
                        {m.role !== "OWNER" && (
                          <div className="flex gap-1">
                            <button
                              onClick={() =>
                                handleMemberAction(
                                  m.user_id,
                                  m.is_suspended ? "UNBAN" : "BAN",
                                )
                              }
                              className={`p-2 rounded-lg ${m.is_suspended ? "text-green-500" : "text-orange-500"}`}
                            >
                              {m.is_suspended ? (
                                <CheckCircle size={18} />
                              ) : (
                                <ShieldAlert size={18} />
                              )}
                            </button>
                            <button
                              onClick={() =>
                                handleMemberAction(m.user_id, "REMOVE")
                              }
                              className="p-2 text-red-400"
                            >
                              <UserMinus size={18} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* DANGER ZONE */}
            <div className="bg-red-50 dark:bg-red-900/5 rounded-3xl p-8 border border-red-100 dark:border-red-900/20">
              <div className="flex items-start gap-4">
                <AlertTriangle className="text-red-500" />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-red-600 dark:text-red-400">
                    Danger Zone
                  </h3>
                  <p className="text-sm text-red-500/70">
                    To delete this circle, you must be the only member left.
                  </p>
                  <button
                    disabled={members.length > 1}
                    onClick={() => setShowDeleteModal(true)}
                    className="mt-4 px-6 py-2 bg-red-500 text-white rounded-xl font-bold disabled:opacity-30"
                  >
                    Delete Circle
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* DELETE MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl animate-in zoom-in duration-200">
            <Trash2 size={48} className="text-red-500 mx-auto mb-6" />
            <h2 className="text-2xl font-serif font-bold text-center mb-2 dark:text-white">
              Delete Permanently?
            </h2>
            <p className="text-center text-gray-500 mb-8">
              This will wipe all data for "{club.name}".
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 font-bold text-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteClub}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl font-bold"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubSettingsPage;
