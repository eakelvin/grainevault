import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { CheckEmailPanel } from "@/components/auth/check-email-panel";
import { safeNextPath, withNext } from "@/lib/auth-redirect";
import { routes } from "@/lib/types";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; next?: string }>;
}) {
  const { email, next } = await searchParams;
  const trimmed = email?.trim();
  const nextPath = safeNextPath(next);

  if (!trimmed) {
    redirect(withNext(routes.signup, next));
  }

  return (
    <AuthShell
      title="Confirm your email."
      description="One last step — open the message we sent and click the link to activate your vault."
    >
      <CheckEmailPanel email={trimmed} nextPath={nextPath} />
    </AuthShell>
  );
}
