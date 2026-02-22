/**
 * ServiceSource Connect — Subscription Tier Definitions
 * Three tiers: Free Trial (7 days), Monthly ($25), Yearly ($150)
 */

export const PLANS = {
  free_trial: {
    id: "free_trial",
    name: "Free Trial",
    description: "Full access for 7 days — no credit card required",
    price: 0,
    interval: null,
    trialDays: 7,
    features: [
      "Access all resource categories",
      "Search across all 50 states",
      "AI resource matching assistant",
      "Save up to 5 resources",
      "View VA lender directory",
    ],
  },
  monthly: {
    id: "monthly",
    name: "Monthly",
    description: "Full access billed monthly",
    price: 2500, // in cents
    priceDisplay: "$25",
    interval: "month" as const,
    trialDays: 0,
    features: [
      "Everything in Free Trial",
      "Unlimited saved resources",
      "Weekly email digest",
      "Resource ratings & reviews",
      "Interactive resource map",
      "Priority support",
    ],
  },
  yearly: {
    id: "yearly",
    name: "Yearly",
    description: "Full access billed annually — save $150/year",
    price: 15000, // in cents
    priceDisplay: "$150",
    interval: "year" as const,
    trialDays: 0,
    savings: "Save $150 vs monthly",
    features: [
      "Everything in Monthly",
      "2 months free vs monthly billing",
      "Early access to new features",
      "Dedicated support channel",
    ],
  },
} as const;

export type PlanId = keyof typeof PLANS;
