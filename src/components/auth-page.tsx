"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useApp } from "@/context/app-context";
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

interface AuthPageProps {
  mode: AuthMode;
}

export function AuthPage({ mode }: AuthPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useApp();
  const isSignup = mode === "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setError(null);
    setPassword("");
    setShowPassword(false);
  }, [mode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    if (isSignup && !name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    login();
    setIsSubmitting(false);

    const next = searchParams.get("next");
    const destination =
      next && next.startsWith("/") && !next.startsWith("//")
        ? next
        : routes.vault;
    router.push(destination);
    router.refresh();
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] lg:flex-row">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-80 w-80 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <aside className="relative z-10 hidden w-full flex-col justify-between border-r border-slate-700/60 bg-slate-900/40 p-10 backdrop-blur-sm lg:flex lg:max-w-md xl:max-w-lg xl:p-14">
        <Link
          href={routes.home}
          className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>

        <div>
          <div className="mb-8 flex items-center gap-2.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-semibold text-white">Ideas Vault</span>
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-white xl:text-4xl">
            {isSignup ? "Start capturing ideas." : "Welcome back."}
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-slate-400">
            {isSignup
              ? "Create an account and let AI agents research your startup ideas in the background."
              : "Sign in to your vault — market intel, competitors, and readiness scores await."}
          </p>
        </div>

        <p className="text-xs text-slate-500">
          Research on autopilot · Secure idea repository
        </p>
      </aside>

      <div className="relative z-10 flex flex-1 flex-col px-4 py-6 sm:px-6 sm:py-8 md:px-10">
        <div className="mb-8 flex items-center justify-between lg:mb-0 lg:justify-end">
          <Link
            href={routes.home}
            className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold text-white">Ideas Vault</span>
          </div>
          <div className="w-14 lg:hidden" />
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center">
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

            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="mb-5 h-11 w-full gap-2.5 rounded-xl border-slate-600 bg-slate-900/40 text-slate-200 hover:bg-slate-800 hover:text-white"
            >
              <GoogleIcon className="h-4 w-4" />
              {isSignup ? "Sign up with Google" : "Sign in with Google"}
            </Button>

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
              <AnimatePresence mode="wait" initial={false}>
                {isSignup && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label
                      htmlFor="auth-name"
                      className="mb-1.5 block text-sm font-medium text-slate-300"
                    >
                      Name
                    </label>
                    <div className="relative">
                      <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        id="auth-name"
                        type="text"
                        autoComplete="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Your name"
                        className="h-11 border-slate-700 bg-slate-900/50 pl-10 text-white placeholder:text-slate-500"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

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
                    autoComplete={
                      isSignup ? "new-password" : "current-password"
                    }
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
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {!isSignup && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    className="text-sm text-indigo-400 transition-colors hover:text-indigo-300"
                  >
                    Forgot password?
                  </button>
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
        </div>
      </div>
    </div>
  );
}
