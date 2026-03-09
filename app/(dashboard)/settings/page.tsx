"use client";

import React, { useEffect, useState, useRef } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Lock,
  Loader2,
  ArrowLeft,
  Camera,
  Bell,
  Paperclip,
} from "lucide-react";
import Link from "next/link";
import { updateProfile, updateProfileImage } from "@/services/profile.service";
import { toast } from "sonner";
import CuratorLoader from "@/components/ui/CuratorLoader";
const SettingsPage = () => {
  const { profile, user, syncSession } = useAuthStore();
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    bio: "",
  });

  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });

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

      await updateProfileImage(user.id, publicUrl);
      await syncSession();
      toast.success("Profile picture updated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      await updateProfile(user.id, formData);
      await syncSession();
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Client-side validation
    if (!passwordData.newPassword) {
      toast.error("Please enter a new password");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }

    setLoading(true);

    // 2. Supabase Auth update
    const { error } = await supabase.auth.updateUser({
      password: passwordData.newPassword,
    });

    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Vault updated! Password changed successfully.");
      setPasswordData({ newPassword: "", confirmPassword: "" });
    }
    setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-4 px-2">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between border-b-2 border-primary-dark/20 pb-4">
        <div>
          <h1 className="text-4xl font-serif font-black text-primary-dark dark:text-[#d4a373]">
            The Setup
          </h1>
          <p className="text-xs font-mono uppercase tracking-widest text-[#8b5a2b] mt-1">
            Personalize your reading experience
          </p>
        </div>
        <Link
          href="/profile"
          className="text-xs font-bold uppercase tracking-tighter text-primary-dark hover:underline flex items-center gap-1"
        >
          <ArrowLeft size={14} /> Back to shelf
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-10">
        {/* Profile Section */}
        <section className="relative bg-white dark:bg-[#252525] p-8 shadow-md border-t-[10px] border-[#8b5a2b]/30">
          <Paperclip
            className="absolute -top-4 right-10 text-gray-400 rotate-12"
            size={32}
          />
          <h2 className="text-xl font-serif font-bold mb-8 flex items-center gap-2 text-primary-dark dark:text-gray-100">
            <User size={20} /> Public Identity
          </h2>

          <div className="flex flex-col md:flex-row gap-10 items-start">
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
                  <div className="min-h-screen flex items-center justify-center">
                    <CuratorLoader />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 bg-primary-dark text-[#f4ebd0] p-2 shadow-lg hover:scale-110 transition-transform"
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
                    className="w-full border-b border-dashed border-gray-300 bg-transparent py-2 font-serif text-lg outline-none focus:border-primary-dark transition-colors dark:text-white"
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
                    className="w-full border-b border-dashed border-gray-300 bg-transparent py-2 font-serif text-lg outline-none focus:border-primary-dark transition-colors dark:text-white"
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
                  className="w-full border border-dashed border-gray-300 bg-gray-50 dark:bg-black/20 p-4 font-serif italic outline-none focus:border-primary-dark transition-colors dark:text-white"
                  placeholder="The books that made me..."
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="bg-primary-dark text-[#f4ebd0] px-8 py-2 font-serif italic shadow-[4px_4px_0px_#3e2b22] hover:translate-y-1 hover:shadow-none transition-all disabled:opacity-50"
              >
                {loading ? "Updating..." : "Pin Changes"}
              </button>
            </form>
          </div>
        </section>

        {/* Preferences Section */}
        <section className="bg-[#f4ebd0] dark:bg-[#2c2420] p-8 border-2 border-[#d6c7a1] shadow-inner">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-primary-dark dark:text-gray-100">
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

        {/* Password Section */}
        <section className="bg-white dark:bg-[#252525] p-8 shadow-md border-l-[12px] border-primary-dark/10">
          <h2 className="text-xl font-serif font-bold mb-6 flex items-center gap-2 text-primary-dark dark:text-gray-100">
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
                className="w-full border-b border-gray-200 bg-transparent py-2 outline-none focus:border-primary-dark dark:text-white"
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
                className="w-full border-b border-gray-200 bg-transparent py-2 outline-none focus:border-primary-dark dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-200 dark:bg-white/10 text-primary-dark dark:text-gray-300 px-6 py-2 font-bold text-xs uppercase tracking-widest hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              {loading ? "Processing..." : "Update Password"}
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

const ToggleRow = ({
  label,
  description,
}: {
  label: string;
  description: string;
}) => (
  <div className="flex items-center justify-between py-4 border-b border-primary-dark/10 last:border-0">
    <div>
      <p className="font-serif font-bold text-primary-dark dark:text-gray-100">
        {label}
      </p>
      <p className="text-xs text-gray-500 font-mono italic">{description}</p>
    </div>
    <div className="w-12 h-6 bg-primary-dark/20 rounded-full relative cursor-pointer p-1">
      <div className="w-4 h-4 bg-primary-dark rounded-full" />
    </div>
  </div>
);

export default SettingsPage;
