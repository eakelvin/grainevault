import { AdminIdeasView } from "@/components/admin/admin-ideas-view";
import { fetchAdminIdeas, requireAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireAdmin();
  const ideas = await fetchAdminIdeas();
  return <AdminIdeasView ideas={ideas} />;
}
