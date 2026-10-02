import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth-redirect";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
        Object.entries(headers).forEach(([key, value]) =>
          supabaseResponse.headers.set(key, value)
        );
      },
    },
  });

  // Validates JWT and refreshes the session when needed.
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  const { pathname } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/vault") ||
    pathname.startsWith("/archive") ||
    pathname.startsWith("/digest") ||
    pathname.startsWith("/board") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/ideas") ||
    pathname.startsWith("/update-password");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/check-email";

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && user) {
    const destination = safeNextPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(destination, request.url));
  }

  return supabaseResponse;
}
