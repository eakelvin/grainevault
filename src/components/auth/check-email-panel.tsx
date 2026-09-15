"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { routes } from "@/lib/types";

interface CheckEmailPanelProps {
  email: string;
}

export function CheckEmailPanel({ email }: CheckEmailPanelProps) {
  const [isResending, setIsResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResend = async () => {
    setError(null);
    setIsResending(true);
    const supabase = createClient();

    const { error: resendError } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(routes.vault)}`,
      },
    });

    setIsResending(false);

    if (resendError) {
      setError(resendError.message);
      return;
    }

    setResent(true);
  };

  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 text-center backdrop-blur-sm sm:p-8">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
        <MailCheck className="h-8 w-8 text-white" aria-hidden="true" />
      </div>

      <h2 className="text-2xl font-bold text-white">Check your email</h2>
      <p className="mt-3 text-sm text-slate-400">
        We sent a confirmation link to
      </p>
      <p
        className="mt-2 break-all rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-3 py-2.5 text-sm font-medium text-indigo-100"
        aria-live="polite"
      >
        {email}
      </p>
      <p className="mt-4 text-sm leading-relaxed text-slate-400">
        Open that email and click the link to activate your account. It can take
        a minute to arrive — check spam if you don&apos;t see it.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <a
          href="https://mail.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/40 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
        >
          Open Gmail
        </a>
        <a
          href="https://outlook.live.com/mail"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-600 bg-slate-900/40 text-sm font-medium text-slate-200 transition-colors hover:bg-slate-800 hover:text-white"
        >
          Open Outlook
        </a>
      </div>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      {resent && !error && (
        <p role="status" className="mt-4 text-sm text-indigo-300">
          Another confirmation email is on the way.
        </p>
      )}

      <Button
        type="button"
        variant="outline"
        disabled={isResending || resent}
        onClick={handleResend}
        className="mt-5 h-11 w-full gap-2 rounded-xl border-slate-600 bg-slate-900/40 text-slate-200 hover:bg-slate-800 hover:text-white"
      >
        {isResending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sending again…
          </>
        ) : resent ? (
          "Email resent"
        ) : (
          "Resend confirmation email"
        )}
      </Button>

      <p className="mt-6 text-sm text-slate-400">
        Wrong address?{" "}
        <Link
          href={routes.signup}
          className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Try a different email
        </Link>
      </p>
      <p className="mt-2 text-sm text-slate-400">
        Already confirmed?{" "}
        <Link
          href={routes.login}
          className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
