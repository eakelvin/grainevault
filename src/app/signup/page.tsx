import { Suspense } from "react";
import { AuthPage } from "@/components/auth-page";

export default function SignupPage() {
  return (
    <Suspense fallback={<AuthFallback />}>
      <AuthPage mode="signup" />
    </Suspense>
  );
}

function AuthFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
    </div>
  );
}
