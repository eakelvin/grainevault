import type Stripe from "stripe";
import type { BillingInterval, Plan } from "@/lib/billing";
import { createAdminClient } from "@/lib/supabase/admin";
import { stripeClient } from "@/lib/stripe/server";

type ProfileBilling = {
  plan: Plan;
  billing_interval: BillingInterval | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_end: string | null;
};

function customerIdOf(value: string | Stripe.Customer | Stripe.DeletedCustomer | null) {
  if (!value) return null;
  return typeof value === "string" ? value : value.id;
}

function subscriptionPeriodEnd(sub: Stripe.Subscription): string | null {
  const unix = sub.items.data[0]?.current_period_end;
  if (!unix) return null;
  return new Date(unix * 1000).toISOString();
}

function intervalFromPrice(price: Stripe.Price | null | undefined): BillingInterval | null {
  const interval = price?.recurring?.interval;
  if (interval === "year") return "year";
  if (interval === "month") return "month";
  const id = price?.id;
  if (id && id === process.env.STRIPE_PRICE_YEARLY?.trim()) return "year";
  if (id && id === process.env.STRIPE_PRICE_MONTHLY?.trim()) return "month";
  return null;
}

function planFromStatus(status: Stripe.Subscription.Status): Plan {
  if (status === "active" || status === "trialing" || status === "past_due") {
    return "pro";
  }
  return "free";
}

async function findUserId(params: {
  userId?: string | null;
  customerId?: string | null;
}): Promise<string | null> {
  if (params.userId) return params.userId;
  if (!params.customerId) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id")
    .eq("stripe_customer_id", params.customerId)
    .maybeSingle();

  return data?.id ?? null;
}

export async function applySubscription(sub: Stripe.Subscription): Promise<void> {
  const customerId = customerIdOf(sub.customer);
  const userId = await findUserId({
    userId: sub.metadata?.userId || null,
    customerId,
  });
  if (!userId) {
    console.error("Couldn't match Stripe subscription to a profile.", sub.id);
    return;
  }

  const price = sub.items.data[0]?.price ?? null;
  const plan = planFromStatus(sub.status);
  const patch: ProfileBilling = {
    plan,
    billing_interval: plan === "pro" ? intervalFromPrice(price) : null,
    stripe_customer_id: customerId,
    stripe_subscription_id: plan === "pro" ? sub.id : null,
    stripe_price_id: plan === "pro" ? (price?.id ?? null) : null,
    current_period_end: plan === "pro" ? subscriptionPeriodEnd(sub) : null,
  };

  const admin = createAdminClient();
  const { error } = await admin.from("profiles").update(patch).eq("id", userId);
  if (error) {
    console.error("Couldn't update profile from Stripe subscription.", error);
  }
}

export async function applyCheckoutSession(
  session: Stripe.Checkout.Session
): Promise<void> {
  if (session.mode !== "subscription") return;

  const customerId = customerIdOf(session.customer);
  const userId = await findUserId({
    userId: session.client_reference_id || session.metadata?.userId || null,
    customerId,
  });
  if (!userId) {
    console.error("Couldn't match Checkout session to a profile.", session.id);
    return;
  }

  const stripe = stripeClient();
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id;

  if (subscriptionId) {
    const sub = await stripe.subscriptions.retrieve(subscriptionId, {
      expand: ["items.data.price"],
    });
    if (!sub.metadata?.userId) {
      await stripe.subscriptions.update(sub.id, {
        metadata: { ...sub.metadata, userId },
      });
    }
    await applySubscription(sub);
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      stripe_customer_id: customerId,
    } satisfies Partial<ProfileBilling>)
    .eq("id", userId);
  if (error) {
    console.error("Couldn't save Stripe customer on profile.", error);
  }
}

export async function applyCustomerDeleted(customerId: string): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("profiles")
    .update({
      plan: "free",
      billing_interval: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      stripe_price_id: null,
      current_period_end: null,
    } satisfies ProfileBilling)
    .eq("stripe_customer_id", customerId);
  if (error) {
    console.error("Couldn't clear profile after Stripe customer deletion.", error);
  }
}
