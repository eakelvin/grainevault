import { routes } from "@/lib/types";

export const AUTH_NEXT_COOKIE = "iv_auth_next";

const AUTH_PATHS = new Set<string>([
  routes.login,
  routes.signup,
  routes.forgotPassword,
  routes.checkEmail,
]);

function isBlockedNext(path: string): boolean {
  const pathname = path.split("?")[0] ?? path;
  if (!pathname || pathname === routes.home) return true;
  if (AUTH_PATHS.has(path) || AUTH_PATHS.has(pathname)) return true;
  return path.startsWith("/auth/") || pathname.startsWith("/auth/");
}

/** Only allow same-origin relative paths (blocks open redirects). */
export function safeNextPath(
  next: string | null | undefined,
  fallback: string = routes.vault
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
  if (isBlockedNext(next)) return fallback;
  return next;
}

/** Append or replace `next` on an auth route href. */
export function withNext(href: string, next: string | null | undefined): string {
  const path = safeNextPath(next, "");
  if (!path) return href;
  const url = new URL(href, "http://local");
  url.searchParams.set("next", path);
  return `${url.pathname}${url.search}`;
}

export function authNextCookieOptions(maxAge: number) {
  return {
    path: "/",
    maxAge,
    sameSite: "lax" as const,
  };
}

export function rememberAuthNext(path: string) {
  if (typeof document === "undefined") return;
  const dest = safeNextPath(path, "");
  if (!dest) return;
  document.cookie = `${AUTH_NEXT_COOKIE}=${encodeURIComponent(dest)}; Path=/; Max-Age=600; SameSite=Lax`;
}

export function readAuthNext(raw: string | null | undefined): string | undefined {
  if (!raw) return undefined;
  let value = raw;
  for (let i = 0; i < 2; i += 1) {
    try {
      const decoded = decodeURIComponent(value);
      if (decoded === value) break;
      value = decoded;
    } catch {
      break;
    }
  }
  return value;
}

export function peekAuthNext(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = `${AUTH_NEXT_COOKIE}=`;
  const match = document.cookie.split("; ").find((row) => row.startsWith(prefix));
  if (!match) return undefined;
  return readAuthNext(match.slice(prefix.length));
}
