import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { appOrigin, stripePriceId } from "@/lib/stripe/env";
import { stripeClient } from "@/lib/stripe/server";
import { routes } from "@/lib/types";
import type { BillingInterval } from "@/lib/billing";

export const runtime = "nodejs";

function parseInterval(value: unknown): BillingInterval | null {
  if (value === "month" || value === "year") return value;
  return null;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Sign in to upgrade." }, { status: 401 });
  }

  let interval: BillingInterval | null = "month";
  try {
    const body = (await request.json()) as { interval?: unknown };
    interval = parseInterval(body.interval);
  } catch {
    interval = null;
  }

  if (!interval) {
    return Response.json({ error: "Choose monthly or yearly billing." }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.plan === "pro") {
    return Response.json(
      { error: "You're already on Pro. Manage billing from Settings." },
      { status: 409 }
    );
  }

  try {
    const stripe = stripeClient();
    const origin = appOrigin(request);
    const price = stripePriceId(interval);
    let customerId =
      typeof profile?.stripe_customer_id === "string"
        ? profile.stripe_customer_id
        : null;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email ?? undefined,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      const admin = createAdminClient();
      const { error } = await admin
        .from("profiles")
        .update({ stripe_customer_id: customerId })
        .eq("id", user.id);
      if (error) {
        console.error("Couldn't save Stripe customer before checkout.", error);
      }
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: customerId,
      client_reference_id: user.id,
      metadata: { userId: user.id },
      subscription_data: {
        metadata: { userId: user.id },
      },
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}${routes.settings}?billing=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}${routes.pricing}?billing=canceled`,
      allow_promotion_codes: true,
    });

    if (!session.url) {
      return Response.json({ error: "Couldn't start checkout." }, { status: 502 });
    }

    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Couldn't create Stripe Checkout session.", error);
    return Response.json({ error: "Couldn't start checkout." }, { status: 502 });
  }
}
