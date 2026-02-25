// components/auth-provider.tsx
"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { createClient } from "@/lib/supabase/client";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const syncSession = useAuthStore((state) => state.syncSession);

  useEffect(() => {
    const supabase = createClient();

    // Initial sync
    syncSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      syncSession();
    });

    return () => subscription.unsubscribe();
  }, [syncSession]);

  return <>{children}</>;
}
