import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { ensureNeonProfile, getProfile } from "@/services/profile.service";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";

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
    // 1. Start loading
    set({ isLoading: true });
    const supabase = createClient();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. If user exists, try to get profile from Neon
        let profileData = await getProfile(user.id);
        
        if (!profileData) {
          profileData = await ensureNeonProfile(user);
        }

        set({ user, profile: profileData, isLoading: false });
      } else {
        // 3. CRITICAL FIX: If no user, reset state and STOP loading
        set({ user: null, profile: null, isLoading: false });
      }
    } catch (err) {
      console.error("Auth sync error:", err);
      // Ensure loading stops even on error
      set({ user: null, profile: null, isLoading: false });
    }
  },

  signOut: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    // 4. Reset everything on sign out
    set({ user: null, profile: null, isLoading: false });
    window.location.href = "/";
  },
}));