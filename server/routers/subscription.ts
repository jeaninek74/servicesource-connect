import Stripe from "stripe";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { PLANS } from "../products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia" as any,
});

export const subscriptionRouter = router({
  // Get current user's subscription status
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");
    const result = await db
      .select({
        subscriptionStatus: users.subscriptionStatus,
        subscriptionPlan: users.subscriptionPlan,
        trialEndsAt: users.trialEndsAt,
        subscriptionEndsAt: users.subscriptionEndsAt,
        stripeSubscriptionId: users.stripeSubscriptionId,
        stripeCustomerId: users.stripeCustomerId,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);
    const u = result[0];
    const hasStripe = !!u?.stripeCustomerId;
    if (!u) return { status: "none" as const, plan: null, hasStripe: false, trialEndsAt: null, subscriptionEndsAt: null };

    const now = new Date();
    return {
      status: u.subscriptionStatus ?? "none",
      plan: u.subscriptionPlan,
      trialEndsAt: u.trialEndsAt ?? null,
      subscriptionEndsAt: u.subscriptionEndsAt ?? null,
      hasStripe,
    };
  }),

  // Start a free 7-day trial
  startTrial: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    // Check if user already used a trial
    const result = await db.select({ subscriptionStatus: users.subscriptionStatus, trialStartedAt: users.trialStartedAt })
      .from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const u = result[0];
    if (u?.trialStartedAt) {
      throw new Error("You have already used your free trial.");
    }

    const now = new Date();
    const trialEnds = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    await db.update(users).set({
      subscriptionStatus: "trialing",
      subscriptionPlan: "free_trial",
      trialStartedAt: now,
      trialEndsAt: trialEnds,
    }).where(eq(users.id, ctx.user.id));

    return { success: true, trialEndsAt: trialEnds };
  }),

  // Create Stripe checkout session for monthly or yearly plan
  createCheckout: protectedProcedure
    .input(z.object({ plan: z.enum(["monthly", "yearly"]), origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const plan = PLANS[input.plan];
      const userResult = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const user = userResult[0];
      if (!user) throw new Error("User not found");

      // Create or retrieve Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          metadata: { userId: ctx.user.id.toString() },
        });
        customerId = customer.id;
        await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, ctx.user.id));
      }

      // Create price on the fly (or use cached price ID)
      const price = await stripe.prices.create({
        unit_amount: plan.price,
        currency: "usd",
        recurring: { interval: plan.interval },
        product_data: { name: `ServiceSource Connect — ${plan.name}` },
      });

      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ["card"],
        line_items: [{ price: price.id, quantity: 1 }],
        mode: "subscription",
        allow_promotion_codes: true,
        success_url: `${input.origin}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${input.origin}/#pricing`,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          plan: input.plan,
          customer_email: user.email ?? "",
          customer_name: user.name ?? "",
        },
      });

      return { url: session.url };
    }),

  // Cancel subscription
  cancel: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database unavailable");

    const result = await db.select({ stripeSubscriptionId: users.stripeSubscriptionId })
      .from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const subId = result[0]?.stripeSubscriptionId;
    if (!subId) throw new Error("No active subscription found");

    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });
    await db.update(users).set({ subscriptionStatus: "canceled" }).where(eq(users.id, ctx.user.id));

    return { success: true };
  }),

  // Get billing portal URL
  billingPortal: protectedProcedure
    .input(z.object({ origin: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");

      const result = await db.select({ stripeCustomerId: users.stripeCustomerId })
        .from(users).where(eq(users.id, ctx.user.id)).limit(1);
      const customerId = result[0]?.stripeCustomerId;
      if (!customerId) throw new Error("No billing account found");

      const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${input.origin}/dashboard`,
      });

      return { url: session.url };
    }),
});
