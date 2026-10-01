import Stripe from "stripe";
import { stripeSecretKey } from "@/lib/stripe/env";

let client: Stripe | null = null;

export function stripeClient(): Stripe {
  if (!client) {
    client = new Stripe(stripeSecretKey());
  }
  return client;
}
