"use server";

import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";

/**
 * Helper to get the site URL from environment or headers
 */
const getURL = async () => {
  let url =
    process.env.NEXT_PUBLIC_SITE_URL ?? // Use env variable if set
    (await headers()).get("origin") ?? // Fallback to header
    "http://localhost:3000"; // Absolute fallback

  // Ensure the URL doesn't have a trailing slash
  url = url.replace(/\/$/, "");
  // Append our callback route (ignoring the (auth) group folder)
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

  const { error } = await supabase.auth.signUp({
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
