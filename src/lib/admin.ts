import { notFound, redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { routes } from "@/lib/types";

export type AdminIdea = {
  id: string;
  title: string;
  description: string;
  email: string | null;
  createdAt: string;
  archivedAt: string | null;
};

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminUser(user: User): boolean {
  if (user.app_metadata?.role === "admin") return true;
  const email = user.email?.trim().toLowerCase();
  return Boolean(email && adminEmails().includes(email));
}

export async function requireAdmin(): Promise<User> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`${routes.login}?next=${encodeURIComponent(routes.admin)}`);
  }
  if (!isAdminUser(user)) notFound();
  return user;
}

async function emailByUserId(): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const emails = new Map<string, string>();
  const perPage = 200;
  let page = 1;

  while (page <= 50) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;
    const users = data.users ?? [];
    for (const account of users) {
      if (account.email) emails.set(account.id, account.email);
    }
    if (users.length < perPage) break;
    page += 1;
  }

  return emails;
}

export async function fetchAdminIdeas(): Promise<AdminIdea[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("ideas")
    .select("id, title, description, created_at, archived_at, user_id")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Couldn't load ideas for admin.", error);
    throw new Error("Couldn't load ideas.");
  }

  const emails = await emailByUserId();
  return (data ?? []).map((row) => ({
    id: String(row.id),
    title: String(row.title ?? "Untitled"),
    description: String(row.description ?? ""),
    email: emails.get(String(row.user_id)) ?? null,
    createdAt: String(row.created_at ?? ""),
    archivedAt: row.archived_at ? String(row.archived_at) : null,
  }));
}
