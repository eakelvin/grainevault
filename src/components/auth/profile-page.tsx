"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, Mail, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/components/auth/user-avatar-menu";
import { createClient } from "@/lib/supabase/client";
import {
  getUserDisplayName,
  getUserInitials,
  getUserNames,
} from "@/lib/helpers/user-display";

export function ProfilePage() {
  const user = useCurrentUser();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    const { first, last } = getUserNames(user);
    setFirstName(first);
    setLastName(last);
  }, [user]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    if (!firstName.trim() || !lastName.trim()) {
      setError("Please enter your first and last name.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({
      data: {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      },
    });
    setIsSubmitting(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSaved(true);
  };

  if (user === undefined) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
      </div>
    );
  }

  const initials = getUserInitials(user);
  const displayName = getUserDisplayName(user);
  const joined = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Profile</h1>
        <p className="mt-1 text-slate-400">Your account details</p>
      </div>

      <div className="mb-6 flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm">
        <Avatar size="lg" className="size-14 after:rounded-2xl">
          <AvatarFallback className="rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-semibold text-white">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-white">
            {displayName}
          </p>
          {user?.email && (
            <p className="truncate text-sm text-slate-400">{user.email}</p>
          )}
          {joined && (
            <p className="mt-0.5 text-xs text-slate-500">Joined {joined}</p>
          )}
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-5 backdrop-blur-sm sm:p-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="profile-first-name"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              First name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="profile-first-name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-11 border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="profile-last-name"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Last name
            </label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="profile-last-name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-11 border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="profile-email"
            className="mb-1.5 block text-sm font-medium text-slate-300"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input
              id="profile-email"
              type="email"
              value={user?.email ?? ""}
              readOnly
              className="h-11 border-slate-700 bg-slate-900/50 pl-10 text-slate-400"
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
          >
            {error}
          </p>
        )}

        {saved && !error && (
          <p role="status" className="text-sm text-indigo-300">
            Profile saved.
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-5 font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </form>
    </div>
  );
}
