import type { BillingInterval, Plan } from "@/lib/billing";
import { createClient } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  plan: Plan;
  billingInterval: BillingInterval | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: string | null;
};

type ProfileRow = {
  id: string;
  plan: Plan;
  billing_interval: BillingInterval | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  stripe_price_id: string | null;
  current_period_end: string | null;
};

function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    plan: row.plan === "pro" ? "pro" : "free",
    billingInterval: row.billing_interval,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    stripePriceId: row.stripe_price_id,
    currentPeriodEnd: row.current_period_end,
  };
}

export async function fetchProfile(): Promise<Profile | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, plan, billing_interval, stripe_customer_id, stripe_subscription_id, stripe_price_id, current_period_end"
    )
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) return null;
  return mapProfile(data as ProfileRow);
}
