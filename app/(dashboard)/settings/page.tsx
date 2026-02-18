"use client";

import React, { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  MapPin,
  FileText,
  Lock,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

const SettingsPage = () => {
  const { profile, user, syncSession } = useAuthStore();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: profile?.name || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
  });
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        location: profile.location || "",
        bio: profile.bio || "",
      });
    }
  }, [profile]);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
        location: formData.location,
        bio: formData.bio,
      })
      .eq("id", user?.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      await syncSession(); // Refresh global state
      setMessage({ type: "success", text: "Profile updated successfully!" });
    }
    setLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match!" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-soft-white dark:bg-[#121212] pt-32 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link
              href="/profile"
              className="flex items-center gap-2 text-primary dark:text-[#d4a373] text-sm font-bold mb-2 hover:underline"
            >
              <ArrowLeft size={16} /> Back to Profile
            </Link>
            <h1 className="text-4xl font-serif font-bold text-dark-secondary dark:text-white">
              Account Settings
            </h1>
          </div>
        </div>

        {message && (
          <div
            className={`mb-6 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
              message.type === "success"
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <p className="text-sm font-bold">{message.text}</p>
          </div>
        )}

        <div className="space-y-8">
          {/* Section 1: Public Profile */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 shadow-sm border border-primary/5">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-dark-secondary dark:text-white">
              <User className="text-primary" size={20} /> Public Profile
            </h2>

            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full px-5 py-3 bg-soft-white dark:bg-[#262626] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                    placeholder="Your Name"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Location
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      className="w-full pl-12 pr-5 py-3 bg-soft-white dark:bg-[#262626] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                      placeholder="e.g. London, UK"
                    />
                    <MapPin
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={18}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                  Bio
                </label>
                <div className="relative">
                  <textarea
                    rows={4}
                    value={formData.bio}
                    onChange={(e) =>
                      setFormData({ ...formData, bio: e.target.value })
                    }
                    className="w-full pl-12 pr-5 py-4 bg-soft-white dark:bg-[#262626] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white resize-none"
                    placeholder="Tell us about your reading style..."
                  />
                  <FileText
                    className="absolute left-4 top-4 text-gray-400"
                    size={18}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-primary dark:bg-[#d4a373] text-white dark:text-[#1a1a1a] px-8 py-3 rounded-2xl font-bold shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </form>
          </section>

          {/* Section 2: Security */}
          <section className="bg-white dark:bg-[#1a1a1a] rounded-[2.5rem] p-8 shadow-sm border border-primary/5">
            <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-dark-secondary dark:text-white">
              <Lock className="text-primary" size={20} /> Security
            </h2>

            <form onSubmit={handlePasswordUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 bg-soft-white dark:bg-[#262626] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-5 py-3 bg-soft-white dark:bg-[#262626] rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-dark-secondary dark:bg-white/10 text-white dark:text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:-translate-y-1 transition-all disabled:opacity-50"
              >
                Update Password
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
