"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { AuthMode, routes } from "@/lib/types";
import { cn } from "@/lib/utils";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M16.365 1.43c0 1.14-.418 2.206-1.182 3.048-.803.89-2.14 1.57-3.277 1.478-.146-1.095.42-2.247 1.162-3.048.804-.87 2.176-1.51 3.297-1.478zM20.652 17.403c-.55 1.27-.812 1.837-1.518 2.96-.987 1.55-2.377 3.48-4.098 3.493-1.53.014-1.926-.997-4.01-.983-2.085.014-2.52 1.004-4.05.99-1.722-.014-3.04-1.76-4.027-3.31C1.12 17.41.05 13.26 1.99 10.4c1.37-2.02 3.54-3.2 5.58-3.2 1.74 0 3.18 1.14 4.28 1.14 1.06 0 2.71-1.22 4.72-1.04.8.033 3.05.323 4.49 2.44-3.84 2.1-3.22 7.57-.46 9.66z" />
    </svg>
  );
}

interface AuthPageProps {
  mode: AuthMode;
}

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = mode === "signup";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }, [mode]);

  useEffect(() => {
    const urlError = searchParams.get("error");
    if (urlError) setError(urlError);
  }, [searchParams]);

  const destination = () => {
    const next = searchParams.get("next");
    return next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : routes.vault;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (isSignup && (!firstName.trim() || !lastName.trim())) {
      setError("Please enter your first and last name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      if (isSignup) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              first_name: firstName.trim(),
              last_name: lastName.trim(),
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(routes.vault)}`,
          },
        });

        if (signUpError) {
          setError(signUpError.message);
          return;
        }

        if (data.session) {
          router.push(destination());
          router.refresh();
          return;
        }

        router.push(
          `${routes.checkEmail}?email=${encodeURIComponent(email.trim())}`
        );
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        return;
      }

      router.push(destination());
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={isSignup ? "Start capturing ideas." : "Welcome back."}
      description={
        isSignup
          ? "Create an account and let AI agents research your startup ideas in the background."
          : "Sign in to your vault — market intel, competitors, and readiness scores await."
      }
    >
      <motion.div
        key={mode}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="rounded-2xl border border-slate-700/60 bg-slate-800/40 p-6 backdrop-blur-sm sm:p-8"
      >
        <div className="mb-6 text-center lg:text-left">
          <h2 className="text-2xl font-bold text-white">
            {isSignup ? "Create account" : "Sign in"}
          </h2>
          <p className="mt-1.5 text-sm text-slate-400">
            {isSignup
              ? "Set up your vault in under a minute."
              : "Enter your credentials to continue."}
          </p>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-900/60 p-1">
          <Link
            href={routes.login}
            className={cn(
              "rounded-lg px-3 py-2.5 text-center text-sm font-medium transition-colors",
              !isSignup
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Sign In
          </Link>
          <Link
            href={routes.signup}
            className={cn(
              "rounded-lg px-3 py-2.5 text-center text-sm font-medium transition-colors",
              isSignup
                ? "bg-indigo-500/20 text-indigo-300"
                : "text-slate-400 hover:text-slate-200"
            )}
          >
            Sign Up
          </Link>
        </div>

        <div className="mb-5 space-y-2.5">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-11 w-full gap-2.5 rounded-xl border-slate-600 bg-slate-900/40 text-slate-200 hover:bg-slate-800 hover:text-white"
          >
            <GoogleIcon className="h-4 w-4" />
            {isSignup ? "Sign up with Google" : "Sign in with Google"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            className="h-11 w-full gap-2.5 rounded-xl border-slate-600 bg-white text-black hover:bg-slate-100 hover:text-black"
          >
            <AppleIcon className="h-4 w-4" />
            {isSignup ? "Sign up with Apple" : "Sign in with Apple"}
          </Button>
        </div>

        <div className="relative mb-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-slate-800/40 px-3 text-slate-500 backdrop-blur-sm">
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignup && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="auth-first-name"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  First name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="auth-first-name"
                    type="text"
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="h-11 border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="auth-last-name"
                  className="mb-1.5 block text-sm font-medium text-slate-300"
                >
                  Last name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    id="auth-last-name"
                    type="text"
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="h-11 border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="auth-email"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="auth-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="auth-password"
              className="mb-1.5 block text-sm font-medium text-slate-300"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input
                id="auth-password"
                type={showPassword ? "text" : "password"}
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={
                  isSignup ? "At least 6 characters" : "Your password"
                }
                className="h-11 border-slate-700 bg-slate-900/50 pl-10 pr-11 text-white placeholder:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:text-slate-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {isSignup && (
            <div>
              <label
                htmlFor="auth-confirm-password"
                className="mb-1.5 block text-sm font-medium text-slate-300"
              >
                Confirm password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <Input
                  id="auth-confirm-password"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="h-11 border-slate-700 bg-slate-900/50 pl-10 pr-11 text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-500 transition-colors hover:text-slate-300"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {!isSignup && (
            <div className="flex justify-end">
              <Link
                href={routes.forgotPassword}
                className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
              >
                Forgot password?
              </Link>
            </div>
          )}

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
                {isSignup ? "Creating account…" : "Signing in…"}
              </>
            ) : isSignup ? (
              "Create account"
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          {isSignup ? "Already have an account?" : "New here?"}{" "}
          <Link
            href={isSignup ? routes.login : routes.signup}
            className="font-medium text-indigo-400 transition-colors hover:text-indigo-300"
          >
            {isSignup ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </motion.div>
    </AuthShell>
  );
}
