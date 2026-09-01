import { AUTH_COOKIE } from "@/lib/types";

const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function setSessionCookie() {
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${SESSION_MAX_AGE}; SameSite=Lax`;
}

export function clearSessionCookie() {
  document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}
