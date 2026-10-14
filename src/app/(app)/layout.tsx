import { AppLayout } from "@/components/vault/app-layout";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
