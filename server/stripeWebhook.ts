import Stripe from "stripe";
import type { Express } from "express";
import express from "express";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia" as any,
});

export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig as string,
          webhookSecret!
        );
      } catch (err: any) {
        console.error("[Stripe Webhook] Signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle test events
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      const db = await getDb();
      if (!db) {
        console.error("[Stripe Webhook] Database unavailable");
        return res.status(500).send("Database unavailable");
      }

      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const userId = session.metadata?.user_id;
            const plan = session.metadata?.plan as "monthly" | "yearly" | undefined;
            const subscriptionId = session.subscription as string;

            if (userId && plan && subscriptionId) {
              await db.update(users).set({
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: "active",
                subscriptionPlan: plan,
              }).where(eq(users.id, parseInt(userId)));
              console.log(`[Stripe] Activated ${plan} subscription for user ${userId}`);
            }
            break;
          }

          case "customer.subscription.updated": {
            const sub = event.data.object as Stripe.Subscription;
            const customerId = sub.customer as string;
            const status = sub.status;

            // Map Stripe status to our enum
            const mappedStatus =
              status === "active" ? "active" :
              status === "trialing" ? "trialing" :
              status === "canceled" ? "canceled" :
              status === "past_due" ? "past_due" : "none";

            const subAny = sub as any;
            const periodEnd = subAny.current_period_end
              ? new Date(subAny.current_period_end * 1000)
              : undefined;

            await db.update(users).set({
              subscriptionStatus: mappedStatus as any,
              ...(periodEnd ? { subscriptionEndsAt: periodEnd } : {}),
            }).where(eq(users.stripeCustomerId, customerId));
            break;
          }

          case "customer.subscription.deleted": {
            const sub = event.data.object as Stripe.Subscription;
            const customerId = sub.customer as string;

            await db.update(users).set({
              subscriptionStatus: "canceled",
              stripeSubscriptionId: null,
            }).where(eq(users.stripeCustomerId, customerId));
            console.log(`[Stripe] Subscription canceled for customer ${customerId}`);
            break;
          }

          case "invoice.payment_failed": {
            const invoice = event.data.object as Stripe.Invoice;
            const customerId = invoice.customer as string;

            await db.update(users).set({
              subscriptionStatus: "past_due",
            }).where(eq(users.stripeCustomerId, customerId));
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Stripe Webhook] Error processing event:", err);
        return res.status(500).send("Internal error");
      }

      res.json({ received: true });
    }
  );
}
