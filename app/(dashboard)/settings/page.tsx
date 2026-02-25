"use client";

import React, { useEffect, useState, useRef } from "react";
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
  Camera,
  Bell,
  Eye,
  Paperclip,
} from "lucide-react";
import Link from "next/link";

const SettingsPage = () => {
  const { profile, user, syncSession } = useAuthStore();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        location: profile.location || "",
        bio: profile.bio || "",
      });
      setPreviewUrl(profile.image || null);
    }
  }, [profile]);

  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setPreviewUrl(URL.createObjectURL(file));
    try {
      setUploading(true);
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `user_avatars/${fileName}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);
      if (uploadError) throw uploadError;
      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);
      const { error: dbError } = await supabase
        .from("profiles")
        .update({ image: publicUrl })
        .eq("id", user.id);
      if (dbError) throw dbError;
      await syncSession();
      setMessage({ type: "success", text: "Profile picture updated!" });
    } catch (error: any) {
      setMessage({ type: "error", text: error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name: formData.name,
        location: formData.location,
        bio: formData.bio,
      })
      .eq("id", user?.id);
    if (error) setMessage({ type: "error", text: error.message });
    else {
      await syncSession();
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
    if (error) setMessage({ type: "error", text: error.message });
    else {
      setMessage({ type: "success", text: "Password updated successfully!" });
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2">
      {/* Header "Library Bookmark" Style */}
      <div className="mb-10 flex items-end justify-between border-b-2 border-[#5c4033]/20 pb-4">
        <div>
          <h1 className="text-4xl font-serif font-black text-[#5c4033] dark:text-[#d4a373]">
            The Setup
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#8b5a2b] mt-1">
            Personalize your reading experience
          </p>
        </div>
        <Link
          href="/profile"
          className="text-xs font-bold uppercase tracking-tighter text-[#5c4033] hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to shelf
        </Link>
      </div>

      {message && (
        <div
          className={`mb-6 p-4 border-l-4 font-serif italic shadow-sm ${
            message.type === "success"
              ? "bg-green-50 border-green-500 text-green-800"
              : "bg-red-50 border-red-500 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-10">
        {/* Profile Section: Scrap Paper Style */}
        <section className="relative bg-white dark:bg-[#252525] p-8 shadow-md border-t-[10px] border-[#8b5a2b]/30">
          <Paperclip
            className="absolute -top-4 right-10 text-gray-400 rotate-12"
            size={32}
          />

          <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-2 text-[#5c4033] dark:text-gray-100">
            <User size={20} /> Public Identity
          </h2>

          <div className="flex flex-col md:flex-row gap-10 items-start">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <div className="w-32 h-32 bg-[#f4ebd0] border-2 border-[#d6c7a1] shadow-[5px_5px_0px_#bcab79] overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    className="w-full h-full object-cover"
                    alt="Avatar"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8b5a2b]">
                    <User size={40} />
                  </div>
                )}
                {uploading && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <Loader2 className="animate-spin text-white" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-[#5c4033] text-[#f4ebd0] p-2 shadow-lg hover:scale-110 transition-transform"
              >
                <Camera size={16} />
              </button>
              <input
                type="file"
                ref={fileInputRef}
                hidden
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>

            <form
              onSubmit={handleProfileUpdate}
              className="flex-1 space-y-6 w-full"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full border-b border-dashed border-gray-300 bg-transparent py-2 font-serif text-lg outline-none focus:border-[#5c4033] transition-colors dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    className="w-full border-b border-dashed border-gray-300 bg-transparent py-2 font-serif text-lg outline-none focus:border-[#5c4033] transition-colors dark:text-white"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase">
                  Reading Bio
                </label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData({ ...formData, bio: e.target.value })
                  }
                  className="w-full border border-dashed border-gray-300 bg-gray-50 dark:bg-black/20 p-4 font-serif italic outline-none focus:border-[#5c4033] transition-colors dark:text-white"
                  placeholder="The books that made me..."
                />
              </div>
              <button
                type="submit"
                className="bg-[#5c4033] text-[#f4ebd0] px-8 py-2 font-serif italic shadow-[4px_4px_0px_#3e2b22] hover:translate-y-1 hover:shadow-none transition-all"
              >
                {loading ? "Updating..." : "Pin Changes"}
              </button>
            </form>
          </div>
        </section>

        {/* --- NEW: READING PREFERENCES SECTION --- */}
        <section className="bg-[#f4ebd0] dark:bg-[#2c2420] p-8 border-2 border-[#d6c7a1] shadow-inner">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-[#5c4033] dark:text-gray-100">
            <Bell size={20} /> The Buzz & Privacy
          </h2>
          <div className="space-y-6">
            <ToggleRow
              label="Email Notifications"
              description="Get notified when someone likes your scribbles."
            />
            <ToggleRow
              label="Private Shelf"
              description="Only you can see your 'Brain Dumps' and progress."
            />
            <ToggleRow
              label="Club Invites"
              description="Allow squads to invite you to their circles."
            />
          </div>
        </section>

        {/* Security Section: Library Card Style */}
        <section className="bg-white dark:bg-[#252525] p-8 shadow-md border-l-[12px] border-[#5c4033]/10">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-[#5c4033] dark:text-gray-100">
            <Lock size={20} /> Vault Security
          </h2>
          <form
            onSubmit={handlePasswordUpdate}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end"
          >
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase">
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
                className="w-full border-b border-gray-200 bg-transparent py-2 outline-none focus:border-[#5c4033] dark:text-white"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold text-[#8b5a2b] uppercase">
                Confirm
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
                className="w-full border-b border-gray-200 bg-transparent py-2 outline-none focus:border-[#5c4033] dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="bg-gray-200 dark:bg-white/10 text-[#5c4033] dark:text-gray-300 px-6 py-2 font-bold text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors"
            >
              Update Password
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

// Helper for the preference toggles
const ToggleRow = ({
  label,
  description,
}: {
  label: string;
  description: string;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-[#5c4033]/10 last:border-0">
    <div>
      <p className="font-serif font-bold text-[#5c4033] dark:text-gray-100">
        {label}
      </p>
      <p className="text-xs text-gray-500 font-mono italic">{description}</p>
    </div>
    <div className="w-12 h-6 bg-[#5c4033]/20 rounded-full relative cursor-pointer p-1">
      <div className="w-4 h-4 bg-[#5c4033] rounded-full" />
    </div>
  </div>
);

export default SettingsPage;
