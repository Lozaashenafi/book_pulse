import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  // 'next' is where the user was trying to go before auth
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a permanent session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Success! Redirect to the destination or home
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // FAIL: Return the user to login with a clear error message
  return NextResponse.redirect(
    `${origin}/login?error=Could not authenticate user with the provided code`,
  );
}
