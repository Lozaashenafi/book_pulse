import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { getProfile } from "@/services/profile.service";
import { User } from "@supabase/supabase-js";

// Define what a profile looks like based on your SQL
interface Profile {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string | null;
  bio: string | null;
  location: string | null;
  username: string | null;
  createdAt: Date | null; // Drizzle returns Date objects for timestamps
  updatedAt: Date | null;
}
interface AuthState {
  user: User | null;
  profile: any | null; // Using any or the Profile interface above
  isLoading: boolean;
  syncSession: () => Promise<void>;
  signOut: () => Promise<void>;
}
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isLoading: true,
  syncSession: async () => {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      // If there's an auth error (like invalid token), just reset to logged out state
      set({ user: null, profile: null, isLoading: false });
      return;
    }

    try {
      const profileData = await getProfile(user.id);
      set({ user, profile: profileData, isLoading: false });
    } catch (err) {
      set({ user, profile: null, isLoading: false });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
    window.location.href = "/"; // Force redirect on logout
  },
}));
