import type { BillingInterval } from "@/lib/billing";

export function stripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY?.trim() ?? "";
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is missing.");
  }
  return key;
}

export function stripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim() ?? "";
  if (!secret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is missing.");
  }
  return secret;
}

export function stripePriceId(interval: BillingInterval): string {
  const name =
    interval === "year" ? "STRIPE_PRICE_YEARLY" : "STRIPE_PRICE_MONTHLY";
  const id = process.env[name]?.trim() ?? "";
  if (!id) {
    throw new Error(`${name} is missing.`);
  }
  return id;
}

export function supabaseSecretKey(): string {
  return (
    process.env.NEXT_SUPABASE_SECRET_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    ""
  );
}

export function appOrigin(request: Request): string {
  const configured =
    process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");

  const url = new URL(request.url);
  const host = request.headers.get("x-forwarded-host") ?? url.host;
  const proto =
    request.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
  return `${proto}://${host}`;
}
