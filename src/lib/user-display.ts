import type { User } from "@supabase/supabase-js";

export function getUserNames(user: User | null | undefined) {
  const meta = user?.user_metadata ?? {};
  return {
    first: String(meta.first_name ?? "").trim(),
    last: String(meta.last_name ?? "").trim(),
    email: user?.email ?? "",
  };
}

export function getUserInitials(user: User | null | undefined) {
  const { first, last, email } = getUserNames(user);
  const firstInitial = first.charAt(0);
  const lastInitial = last.charAt(0);

  if (firstInitial && lastInitial) {
    return `${firstInitial}${lastInitial}`.toUpperCase();
  }
  if (firstInitial) return firstInitial.toUpperCase();
  return (email.charAt(0) || "?").toUpperCase();
}

export function getUserDisplayName(user: User | null | undefined) {
  const { first, last, email } = getUserNames(user);
  const full = [first, last].filter(Boolean).join(" ");
  return full || email || "Account";
}
