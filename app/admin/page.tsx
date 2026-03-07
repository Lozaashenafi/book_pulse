// app/admin/page.tsx
import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/profile.service";
import { redirect } from "next/navigation";
import AdminDashboardUI from "@/components/admin/AdminDashboardUI";

export default async function AdminPage() {
  const supabase = await createClient();

  // 1. Check if logged into Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Check the role in NEON via Drizzle
  const profile = await getProfile(user.id);

  // 3. If not admin, redirect to root immediately
  if (profile?.role !== "admin") {
    redirect("/");
  }

  // 4. Pass the authenticated user to the Client UI
  return <AdminDashboardUI user={user} />;
}
