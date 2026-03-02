"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { db } from "@/lib/db"; // Import your Neon/Drizzle instance
import { profiles } from "@/lib/db/schema"; // Import your schema
import { eq } from "drizzle-orm";

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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return { error: error.message };
  return { error: null };
}

export async function signUpAction(
  email: string,
  password: string,
  username: string,
) {
  const supabase = await createClient();
  const redirectTo = await getURL();

  // 1. Create the user in Supabase Auth
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectTo,
      data: {
        full_name: username,
        username: username.toLowerCase().replace(/\s/g, "_"),
      },
    },
  });

  if (error) return { error: error.message };
  // 2. IMPORTANT: Sync the new user to your Neon Database
  if (data.user) {
    try {
      await db.insert(profiles).values({
        id: data.user.id, // Links Supabase Auth ID to Neon Profile ID
        name: username,
        email: email,
        username: username.toLowerCase().replace(/\s/g, "_"),
        role: "user",
        // image, bio, location will be null/default by default
      });
    } catch (dbError) {
      console.error("Neon Profile Sync Error:", dbError);
      // We don't necessarily want to block the user if the profile insert fails
      // (they can try to fix it in settings later), but you can return an error if you want.
    }
  }

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
