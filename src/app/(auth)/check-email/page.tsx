import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth/auth-shell";
import { CheckEmailPanel } from "@/components/auth/check-email-panel";
import { routes } from "@/lib/types";

export default async function CheckEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  const trimmed = email?.trim();

  if (!trimmed) {
    redirect(routes.signup);
  }

  return (
    <AuthShell
      title="Confirm your email."
      description="One last step — open the message we sent and click the link to activate your vault."
    >
      <CheckEmailPanel email={trimmed} />
    </AuthShell>
  );
}
