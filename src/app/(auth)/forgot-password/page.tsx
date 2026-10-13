import { Suspense } from "react";
import { ForgotPasswordPage } from "@/components/auth/forgot-password-page";

export default function ForgotPasswordRoute() {
  return (
    <Suspense fallback={<ForgotPasswordFallback />}>
      <ForgotPasswordPage />
    </Suspense>
  );
}

function ForgotPasswordFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent" />
    </div>
  );
}
