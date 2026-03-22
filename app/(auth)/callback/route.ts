import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/lib/db";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ensureNeonProfile } from "@/services/profile.service";
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // MANDATORY: Ensure profile exists in Neon for OAuth users
      await ensureNeonProfile(data.user);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   // 'next' will be /update-password if coming from the reset email
//   const next = searchParams.get("next") ?? "/";

//   if (code) {
//     const supabase = await createClient();

//     // 1. Exchange the PKCE code for a real session
//     const { data, error } = await supabase.auth.exchangeCodeForSession(code);

//     if (!error && data.user) {
//       try {
//         // 2. Standard Neon Sync (Keep your existing logic)
//         const existingProfile = await db
//           .select()
//           .from(profiles)
//           .where(eq(profiles.id, data.user.id))
//           .limit(1);

//         if (existingProfile.length === 0) {
//           const fullName = data.user.user_metadata.full_name || "New Reader";
//           await db.insert(profiles).values({
//             id: data.user.id,
//             name: fullName,
//             email: data.user.email,
//             username:
//               fullName.toLowerCase().replace(/\s/g, "_") +
//               Math.floor(Math.random() * 1000),
//             role: "user",
//           });
//         }
//       } catch (dbError) {
//         console.error("Database Sync Error in Callback:", dbError);
//       }

//       // 3. REDIRECT to the 'next' URL (This will be /update-password)
//       // Using origin ensures we stay on lozi.me in production
//       return NextResponse.redirect(`${origin}${next}`);
//     }
//   }

//   // FAIL: If code is invalid or exchange failed
//   return NextResponse.redirect(
//     `${origin}/login?error=The link is invalid or has expired`,
//   );
// }
