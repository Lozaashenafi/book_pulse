import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Check role in DB
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    redirect("/"); // Kick them out if not admin
  }

  return (
    <div className="p-20">
      <h1 className="text-4xl font-bold">Admin Dashboard</h1>
      <p>Welcome, Master of Books.</p>
    </div>
  );
}
