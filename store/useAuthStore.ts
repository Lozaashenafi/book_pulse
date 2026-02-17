import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

// Define what a profile looks like based on your SQL
interface Profile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string; // 'user' or 'admin'
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  syncSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,

  syncSession: async () => {
    set({ isLoading: true });
    const supabase = createClient();

    // 1. Get Auth User
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      // 2. Get Profile Data (Role, Avatar, etc.)
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      set({ user, profile, isLoading: false });
    } else {
      set({ user: null, profile: null, isLoading: false });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
    window.location.href = "/"; // Force redirect on logout
  },
}));
