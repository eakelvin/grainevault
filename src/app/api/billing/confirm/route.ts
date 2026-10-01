import { createClient } from "@/lib/supabase/server";
import { stripeClient } from "@/lib/stripe/server";
import { applyCheckoutSession } from "@/lib/stripe/sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Sign in to confirm billing." }, { status: 401 });
  }

  let sessionId = "";
  try {
    const body = (await request.json()) as { sessionId?: unknown };
    sessionId = typeof body.sessionId === "string" ? body.sessionId.trim() : "";
  } catch {
    sessionId = "";
  }

  if (!sessionId) {
    return Response.json({ error: "Missing checkout session." }, { status: 400 });
  }

  try {
    const session = await stripeClient().checkout.sessions.retrieve(sessionId);
    if (session.status !== "complete") {
      return Response.json({ error: "Checkout is not complete yet." }, { status: 409 });
    }
    const owner = session.client_reference_id || session.metadata?.userId || null;
    if (owner !== user.id) {
      return Response.json(
        { error: "Checkout session does not match this account." },
        { status: 403 }
      );
    }

    await applyCheckoutSession(session);
    return Response.json({ ok: true });
  } catch (error) {
    console.error("Couldn't confirm Stripe checkout session.", error);
    return Response.json({ error: "Couldn't confirm checkout." }, { status: 502 });
  }
}
