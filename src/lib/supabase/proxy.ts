import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_NEXT_COOKIE,
  authNextCookieOptions,
  readAuthNext,
  safeNextPath,
} from "@/lib/auth-redirect";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase/env";

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => to.cookies.set(cookie));
  return to;
}

function clearAuthNext(response: NextResponse) {
  response.cookies.set(AUTH_NEXT_COOKIE, "", authNextCookieOptions(0));
}

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

  const { pathname, search } = request.nextUrl;
  const isProtected =
    pathname.startsWith("/vault") ||
    pathname.startsWith("/archive") ||
    pathname.startsWith("/digest") ||
    pathname.startsWith("/board") ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/ideas") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/update-password");
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/check-email";
  const isAuthCallback = pathname.startsWith("/auth/");

  if (isProtected && !user) {
    const returnTo = `${pathname}${search}`;
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    url.searchParams.set("next", returnTo);
    const redirectResponse = copyCookies(
      supabaseResponse,
      NextResponse.redirect(url)
    );
    redirectResponse.cookies.set(
      AUTH_NEXT_COOKIE,
      returnTo,
      authNextCookieOptions(60 * 10)
    );
    return redirectResponse;
  }

  if (user && isAuthPage) {
    const destination = safeNextPath(
      safeNextPath(request.nextUrl.searchParams.get("next"), "") ||
        readAuthNext(request.cookies.get(AUTH_NEXT_COOKIE)?.value)
    );
    const redirectResponse = copyCookies(
      supabaseResponse,
      NextResponse.redirect(new URL(destination, request.url))
    );
    clearAuthNext(redirectResponse);
    return redirectResponse;
  }

  if (user && !isAuthCallback && !pathname.startsWith("/api/")) {
    const pending = readAuthNext(request.cookies.get(AUTH_NEXT_COOKIE)?.value);
    const destination = safeNextPath(pending, "");
    if (destination && destination !== pathname && destination !== `${pathname}${search}`) {
      const redirectResponse = copyCookies(
        supabaseResponse,
        NextResponse.redirect(new URL(destination, request.url))
      );
      clearAuthNext(redirectResponse);
      return redirectResponse;
    }
    if (destination) {
      clearAuthNext(supabaseResponse);
    }
  }

  return supabaseResponse;
}
