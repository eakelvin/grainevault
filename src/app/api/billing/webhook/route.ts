import type Stripe from "stripe";
import { stripeWebhookSecret } from "@/lib/stripe/env";
import { stripeClient } from "@/lib/stripe/server";
import {
  applyCheckoutSession,
  applyCustomerDeleted,
  applySubscription,
} from "@/lib/stripe/sync";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripeClient().webhooks.constructEvent(
      payload,
      signature,
      stripeWebhookSecret()
    );
  } catch (error) {
    console.error("Couldn't verify Stripe webhook.", error);
    return Response.json({ error: "Invalid Stripe signature." }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await applyCheckoutSession(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted":
        await applySubscription(event.data.object as Stripe.Subscription);
        break;
      case "customer.deleted":
        await applyCustomerDeleted((event.data.object as Stripe.Customer).id);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error("Couldn't apply Stripe webhook.", event.type, error);
    return Response.json({ error: "Couldn't apply billing event." }, { status: 500 });
  }

  return Response.json({ received: true });
}
