import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db"; // Import Neon DB
import { profiles } from "@/lib/db/schema"; // Import Schema
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  if (code) {
    const supabase = await createClient();

    // 1. Exchange the code for a Supabase Session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      try {
        // 2. Check if the profile already exists in NEON
        const existingProfile = await db
          .select()
          .from(profiles)
          .where(eq(profiles.id, data.user.id))
          .limit(1);

        // 3. If no profile exists (first time Google user), create it in NEON
        if (existingProfile.length === 0) {
          const fullName = data.user.user_metadata.full_name || "New Reader";

          await db.insert(profiles).values({
            id: data.user.id, // Linking ID
            name: fullName,
            email: data.user.email,
            // Generate a simple username from their name + some random numbers
            username:
              fullName.toLowerCase().replace(/\s/g, "_") +
              Math.floor(Math.random() * 1000),
            role: "user",
          });

          console.log("Neon Profile created for OAuth user:", data.user.id);
        }
      } catch (dbError) {
        // Log the error but let the user log in anyway
        // They can fix their profile in settings later
        console.error("Database Sync Error in Callback:", dbError);
      }

      // Success! Redirect to the destination or home
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // FAIL: Return the user to login with a clear error message
  return NextResponse.redirect(
    `${origin}/login?error=Could not authenticate user with the provided code`,
  );
}
