// src/lib/supabase/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
// lib/supabase/middleware.ts
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Use getUser() instead of getSession() - it's safer
  // Wrap in a try/catch or just ignore the error if it's a "Refresh Token Not Found"
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // If the token is invalid, we should clear the cookies to stop the error loop
  if (error && error.message.includes("Refresh Token Not Found")) {
    // Return a response that clears the cookies
    const response = NextResponse.next();
    request.cookies
      .getAll()
      .forEach((cookie) => response.cookies.delete(cookie.name));
    return response;
  }

  return supabaseResponse;
}
