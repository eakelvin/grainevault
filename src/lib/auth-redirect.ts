import { routes } from "@/lib/types";

/** Only allow same-origin relative paths (blocks open redirects). */
export function safeNextPath(
  next: string | null | undefined,
  fallback: string = routes.vault
): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) {
    return fallback;
  }
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
