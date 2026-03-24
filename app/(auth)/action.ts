"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

import {  ensureNeonProfile} from "@/services/profile.service";

const getURL = async () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Use env variable if set
    (await headers()).get("origin") ?? // Fallback to header
    "http://localhost:3000"; // Absolute fallback

  url = url.replace(/\/$/, "");
  return `${url}/callback`;
};
export async function loginAction(email: string, password: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  // Sync to Neon on every login just in case
  await ensureNeonProfile(data.user);

  return { error: null };
}

export async function signUpAction(email: string, password: string, username: string) {
  const supabase = await createClient();
  
  // 1. Supabase Signup
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: username } },
  });

  if (error) return { error: error.message };

  // 2. Immediate Sync
  if (data.user) {
    await ensureNeonProfile(data.user);
  }

  return { error: null };
}

export async function verifyOtpAction(email: string, token: string) {
  // 1. Initialize Supabase
  const supabase = await createClient();

  // 2. CRITICAL: Ensure we are sending ONLY these three exact fields as strings
  const payload = {
    email: String(email).trim(),
    token: String(token).trim(),
    type: "recovery" as const, // Must be 'recovery' for password resets
  };

  console.log("Verifying Payload:", payload); // Debug to check the 8-digit code

  const { data, error } = await supabase.auth.verifyOtp(payload);

  if (error) {
    console.error("Supabase Auth Error:", error.message);
    return { error: error.message };
  }

  // Success: A session is now established in the cookies
  return { error: null };
}
// export async function signUpAction(
//   email: string,
//   password: string,
//   username: string,
// ) {
//   const supabase = await createClient();
//   const redirectTo = await getURL();

//   // 1. Check if the email already exists in our Neon Database BEFORE hitting Supabase
//   // This prevents the "Sync Error" you are seeing.
//   const existingProfile = await db
//     .select()
//     .from(profiles)
//     .where(eq(profiles.email, email))
//     .limit(1);

//   if (existingProfile.length > 0) {
//     return { error: "This email is already registered in the archives." };
//   }

//   // 2. Create the user in Supabase Auth
//   const { data, error } = await supabase.auth.signUp({
//     email,
//     password,
//     options: {
//       emailRedirectTo: redirectTo,
//       data: {
//         full_name: username,
//         username: username.toLowerCase().replace(/\s/g, "_"),
//       },
//     },
//   });

//   if (error) return { error: error.message };

//   // 3. Sync to Neon
//   if (data.user) {
//     try {
//       await db.insert(profiles).values({
//         id: data.user.id,
//         name: username,
//         email: email,
//         username: username.toLowerCase().replace(/\s/g, "_"),
//         role: "user",
//       });
//     } catch (dbError: any) {
//       // If it still fails due to a race condition (duplicate key code 23505)
//       if (dbError.code === "23505") {
//         return { error: "This email is already in use." };
//       }

//       console.error("Neon Profile Sync Error:", dbError);
//       return { error: "Database sync failed. Please try again." };
//     }
//   }

//   return { error: null };
// }

export async function updatePasswordAction(newPassword: string) {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) return { error: error.message };
  return { error: null };
}
export async function resetPasswordAction(email: string) {
  const supabase = await createClient();
  const origin = (await headers()).get("origin");

  // 1. THIS IS THE KEY: We point to /callback and set next=/update-password
  const redirectTo = `${origin}/callback?next=/update-password`;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function googleLoginAction() {
  const supabase = await createClient();
  const redirectTo = await getURL();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) return { error: error.message };
  if (data.url) return { url: data.url };
}
