"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Loader2, Mail } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/types";

export function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(routes.updatePassword)}`,
      }
    );

    setIsSubmitting(false);

    if (resetError) {
      setError(resetError.message);
      return;
    }

    setSent(true);
  };

  return (
    <AuthShell
      title="Reset your password."
      description="Enter the email for your account and we’ll send you a secure reset link."
      backHref={routes.login}
    >
      <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm sm:p-8">
        <div className="mb-6 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-white">Forgot password</h2>
          <p className="mt-1.5 text-sm text-slate-400">
            We’ll email you instructions to choose a new password.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p
              role="status"
              className="rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2 text-sm text-indigo-200"
            >
              If an account exists for that email, a reset link is on the way.
              Check your inbox and spam folder.
            </p>
            <Link
              href={routes.login}
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-base font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="forgot-email"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11 border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500"
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

            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-base font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-600 hover:to-violet-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending link…
                </>
              ) : (
                "Send reset link"
              )}
            </Button>

            <p className="text-center text-sm text-slate-400">
              Remembered it?{" "}
              <Link
                href={routes.login}
                className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </AuthShell>
  );
}
