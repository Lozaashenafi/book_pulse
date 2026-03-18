"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Users,
  Bookmark,
  LayoutDashboard,
  Trash2,
  UserCog,
  Database,
  Loader2,
  MessageSquare,
  Search,
  Filter,
} from "lucide-react";
import {
  getAdminStats,
  getAllUsersAdmin,
  getBookCategoriesAdmin,
  manageCategory,
  updateUserRole,
} from "@/services/admin.service";
import {
  getFeedbacksAdmin,
  deleteFeedbackAction,
} from "@/services/feedback.service";
import { toast } from "sonner";
import CuratorLoader from "../ui/CuratorLoader";

const AdminDashboardUI = ({ user }: { user: any }) => {
  const [activeTab, setActiveTab] = useState<
    "stats" | "users" | "genres" | "feedback"
  >("stats");
  const [loading, setLoading] = useState(true);

  // Data States
  const [stats, setStats] = useState<any>(null);
  const [usersList, setUsersList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [feedbacksList, setFeedbacksList] = useState<any[]>([]);

  // Feedback UI States
  const [feedbackSearch, setFeedbackSearch] = useState("");
  const [feedbackFilter, setFeedbackFilter] = useState("All");
  const [newCat, setNewCat] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, u, c, f] = await Promise.all([
        getAdminStats(user.id),
        getAllUsersAdmin(user.id),
        getBookCategoriesAdmin(),
        getFeedbacksAdmin(user.id),
      ]);
      setStats(s);
      setUsersList(u);
      setCategories(c);
      setFeedbacksList(f);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- DELETE FEEDBACK LOGIC ---
  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Remove this dispatch from the archives?")) return;
    try {
      await deleteFeedbackAction(user.id, id);
      setFeedbacksList((prev) => prev.filter((f) => f.id !== id));
      toast.success("Dispatch destroyed.");
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // --- SEARCH & FILTER LOGIC ---
  const filteredFeedbacks = useMemo(() => {
    return feedbacksList.filter((f) => {
      const matchesSearch = f.content
        .toLowerCase()
        .includes(feedbackSearch.toLowerCase());
      const matchesCategory =
        feedbackFilter === "All" || f.category === feedbackFilter;
      return matchesSearch && matchesCategory;
    });
  }, [feedbacksList, feedbackSearch, feedbackFilter]);

  const handleAddCategory = async () => {
    if (!newCat) return;
    await manageCategory(user.id, newCat, "ADD");
    setNewCat("");
    fetchData();
    toast.success("Category added to Registry");
  };

  const handleDeleteCategory = async (id: string) => {
    await manageCategory(user.id, "", "DELETE", id);
    fetchData();
    toast.success("Category removed");
  };

  if (loading)
    return (
      <div className="h-screen flex items-center justify-center bg-[#fdfcf8]">
        <CuratorLoader />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#fdfcf8] p-4 md:p-10">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b-4 border-tertiary pb-6">
          <div>
            <div className="flex items-center gap-2 text-[#d4a373] mb-1">
              <ShieldCheck size={18} />
              <span className="text-[10px] font-mono font-black uppercase tracking-[0.3em]">
                Master Registry Access
              </span>
            </div>
            <h1 className="text-5xl font-serif font-black text-tertiary">
              Grand Archive <span className="italic">Control</span>
            </h1>
          </div>
          <nav className="flex bg-tertiary/5 p-1 border border-tertiary/10 flex-wrap gap-1">
            <TabBtn
              active={activeTab === "stats"}
              label="System Vitals"
              onClick={() => setActiveTab("stats")}
              icon={<LayoutDashboard size={14} />}
            />
            <TabBtn
              active={activeTab === "users"}
              label="User Ledger"
              onClick={() => setActiveTab("users")}
              icon={<Users size={14} />}
            />
            <TabBtn
              active={activeTab === "genres"}
              label="Category Index"
              onClick={() => setActiveTab("genres")}
              icon={<Bookmark size={14} />}
            />
            <TabBtn
              active={activeTab === "feedback"}
              label="Dispatches"
              onClick={() => setActiveTab("feedback")}
              icon={<MessageSquare size={14} />}
            />
          </nav>
        </header>

        {/* --- STATS VIEW --- */}
        {activeTab === "stats" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-500">
            <StatCard
              label="Total Readers"
              value={stats?.users}
              color="text-blue-700"
            />
            <StatCard
              label="Active Circles"
              value={stats?.clubs}
              color="text-tertiary"
            />
            <StatCard
              label="Manuscripts"
              value={stats?.books}
              color="text-primary-half"
            />
            <StatCard
              label="Scribbles"
              value={stats?.posts}
              color="text-purple-700"
            />
          </div>
        )}

        {/* --- FEEDBACK (DISPATCHES) VIEW --- */}
        {activeTab === "feedback" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Local Search & Filter for Feedback */}
            <div className="flex flex-col md:flex-row gap-4 bg-[#1a3f22]/5 p-4 border border-[#1a3f22]/10">
              <div className="relative flex-1">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-tertiary opacity-40"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search dispatch content..."
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  className="w-full bg-white pl-10 pr-4 py-2 text-sm font-serif italic outline-none border border-tertiary/20 focus:border-tertiary"
                />
              </div>
              <div className="flex items-center gap-2 bg-white px-3 border border-tertiary/20">
                <Filter size={14} className="text-tertiary opacity-40" />
                <select
                  value={feedbackFilter}
                  onChange={(e) => setFeedbackFilter(e.target.value)}
                  className="py-2 text-[10px] font-mono font-black uppercase outline-none cursor-pointer"
                >
                  <option value="All">All Classifications</option>
                  <option value="General">General</option>
                  <option value="Bug Report">Bug Reports</option>
                  <option value="Feature Idea">Feature Ideas</option>
                  <option value="Love Letter">Love Letters</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((f) => (
                  <div
                    key={f.id}
                    className="bg-white border-2 border-[#1a3f22] p-6 shadow-[5px_5px_0px_#f4ebd0] group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-4 relative z-10">
                      <span className="bg-[#f4ebd0] text-[#8b5a2b] px-2 py-0.5 text-[8px] font-mono font-black uppercase border border-[#d6c7a1]">
                        {f.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[8px] text-gray-400 font-mono">
                          {new Date(f.createdAt).toLocaleString()}
                        </span>
                        <button
                          onClick={() => handleDeleteFeedback(f.id)}
                          className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-700 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="font-serif italic text-sm text-[#1a3f22] leading-relaxed relative z-10">
                      "{f.content}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-[#d6c7a1]">
                  <p className="font-serif italic text-gray-400">
                    No matching dispatches found.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ... (Keep Users and Genres views the same) ... */}
        {activeTab === "users" && (
          /* Users table logic */
          <div className="bg-white border-2 border-tertiary shadow-[10px_10px_0px_#d4a373] overflow-hidden animate-in slide-in-from-bottom-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-tertiary text-[#f4ebd0] font-mono text-[10px] uppercase tracking-widest">
                  <th className="p-4">Identity</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Registered</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {usersList.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-[#f4ebd0]/30 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden border border-[#d6c7a1]">
                          {u.image && (
                            <img
                              src={u.image}
                              className="w-full h-full object-cover"
                              alt="pfp"
                            />
                          )}
                        </div>
                        <div>
                          <p className="font-serif font-bold text-sm text-tertiary">
                            {u.name}
                          </p>
                          <p className="text-[10px] font-mono text-gray-400">
                            {u.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`text-[9px] font-black px-2 py-0.5 rounded ${u.role === "admin" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"} uppercase`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 text-xs font-mono text-gray-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={async () => {
                          const newRole = u.role === "admin" ? "user" : "admin";
                          await updateUserRole(user.id, u.id, newRole);
                          fetchData();
                          toast.success("Role updated");
                        }}
                        className="p-2 hover:bg-tertiary hover:text-white transition-all rounded text-tertiary"
                      >
                        <UserCog size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === "genres" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in duration-500">
            <div className="bg-white p-8 border-2 border-tertiary shadow-[8px_8px_0px_#d4a373]">
              <h3 className="font-serif font-black text-xl text-tertiary mb-6">
                New Category Entry
              </h3>
              <div className="flex gap-4">
                <input
                  value={newCat}
                  onChange={(e) => setNewCat(e.target.value)}
                  placeholder="e.g. Victorian Gothic"
                  className="flex-1 border-b-2 border-tertiary/20 focus:border-tertiary outline-none font-serif italic py-2"
                />
                <button
                  onClick={handleAddCategory}
                  className="bg-tertiary text-[#f4ebd0] px-6 py-2 font-mono text-xs font-black uppercase shadow-md active:translate-y-1 transition-all"
                >
                  Add
                </button>
              </div>
            </div>
            <div className="bg-[#f4ebd0] p-8 border-2 border-[#d6c7a1]">
              <h3 className="font-mono text-[10px] font-black text-primary-half uppercase mb-6 tracking-widest border-b border-[#d6c7a1] pb-2">
                Active Category Index
              </h3>
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="flex justify-between items-center bg-white/50 p-3 border border-transparent hover:border-tertiary/20 transition-all group"
                  >
                    <span className="font-serif font-bold text-tertiary">
                      # {c.name}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(c.id)}
                      className="text-gray-300 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const TabBtn = ({ active, label, onClick, icon }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-2 text-[10px] font-mono font-black uppercase tracking-widest transition-all ${active ? "bg-tertiary text-[#f4ebd0] shadow-md" : "text-tertiary/60 hover:bg-tertiary/5"}`}
  >
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, color }: any) => (
  <div className="bg-white p-6 border-2 border-tertiary/10 shadow-sm relative group hover:border-tertiary transition-all">
    <div className="absolute top-2 right-4 opacity-5 group-hover:opacity-10 transition-opacity">
      <Database size={40} />
    </div>
    <p className="text-[10px] font-mono font-black text-gray-400 uppercase tracking-widest mb-2">
      {label}
    </p>
    <p className={`text-4xl font-serif font-black ${color}`}>{value || 0}</p>
  </div>
);

export default AdminDashboardUI;
