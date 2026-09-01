import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/types";

const protectedPrefixes = ["/vault", "/digest", "/board", "/settings", "/ideas"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value);
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/vault", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/vault/:path*",
    "/digest",
    "/board",
    "/settings",
    "/ideas/:path*",
    "/login",
    "/signup",
  ],
};
