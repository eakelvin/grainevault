import { createClient } from "@/lib/supabase/server";
import { appOrigin } from "@/lib/stripe/env";
import { stripeClient } from "@/lib/stripe/server";
import { routes } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Sign in to manage billing." }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .maybeSingle();

  const customerId = profile?.stripe_customer_id;
  if (!customerId || typeof customerId !== "string") {
    return Response.json(
      { error: "No billing account yet. Upgrade from Pricing first." },
      { status: 400 }
    );
  }

  try {
    const stripe = stripeClient();
    const origin = appOrigin(request);
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}${routes.settings}`,
    });
    return Response.json({ url: session.url });
  } catch (error) {
    console.error("Couldn't create Stripe billing portal session.", error);
    return Response.json({ error: "Couldn't open billing portal." }, { status: 502 });
  }
}
