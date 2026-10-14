import { IDEA_MEDIA_BUCKET } from "@/lib/idea-map";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { stripeClient } from "@/lib/stripe/server";

export const runtime = "nodejs";

async function mediaPaths(userId: string): Promise<string[]> {
  const admin = createAdminClient();
  const paths = new Set<string>();

  const { data: ideas, error } = await admin
    .from("ideas")
    .select("media_path")
    .eq("user_id", userId);
  if (error) throw error;
  for (const idea of ideas ?? []) {
    if (typeof idea.media_path === "string" && idea.media_path) {
      paths.add(idea.media_path);
    }
  }

  let offset = 0;
  const limit = 100;
  for (;;) {
    const { data, error: listError } = await admin.storage
      .from(IDEA_MEDIA_BUCKET)
      .list(userId, { limit, offset });
    if (listError) throw listError;
    if (!data?.length) break;
    for (const file of data) {
      if (file.id && file.name) paths.add(`${userId}/${file.name}`);
    }
    if (data.length < limit) break;
    offset += data.length;
  }

  return [...paths];
}

async function cancelSubscription(subscriptionId: string) {
  try {
    await stripeClient().subscriptions.cancel(subscriptionId);
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? String(error.code)
        : "";
    if (code === "resource_missing") return;
    throw error;
  }
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Sign in to delete your account." }, { status: 401 });
  }

  try {
    const admin = createAdminClient();
    const [{ data: profile }, paths] = await Promise.all([
      admin
        .from("profiles")
        .select("stripe_subscription_id")
        .eq("id", user.id)
        .maybeSingle(),
      mediaPaths(user.id),
    ]);

    const subscriptionId = profile?.stripe_subscription_id;
    if (typeof subscriptionId === "string" && subscriptionId) {
      await cancelSubscription(subscriptionId);
    }

    if (paths.length > 0) {
      for (let index = 0; index < paths.length; index += 100) {
        const chunk = paths.slice(index, index + 100);
        const { error } = await admin.storage.from(IDEA_MEDIA_BUCKET).remove(chunk);
        if (error) throw error;
      }
    }

    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
    if (deleteError) throw deleteError;

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Couldn't delete this account.", error);
    return Response.json(
      { error: "Couldn't delete your account. Please try again." },
      { status: 500 }
    );
  }
}
