import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  getDigestPreference,
  upsertDigestPreference,
  getDigestSubscribers,
  searchResources,
  getAllCategories,
} from "../db";
import { notifyOwner } from "../_core/notification";

export const digestRouter = router({
  /** Get the current user's digest preferences */
  get: protectedProcedure.query(async ({ ctx }) => {
    return getDigestPreference(ctx.user.id);
  }),

  /** Update digest preferences (creates if not exists) */
  update: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        frequency: z.enum(["weekly", "monthly"]).default("weekly"),
        categories: z.array(z.string()).optional(),
        state: z.string().length(2).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await upsertDigestPreference(ctx.user.id, {
        enabled: input.enabled,
        frequency: input.frequency,
        categories: input.categories,
        state: input.state,
      });
      return { success: true };
    }),

  /**
   * Preview what the next digest would contain for the current user.
   * Returns up to 5 recently added resources matching their preferences.
   */
  preview: protectedProcedure.query(async ({ ctx }) => {
    const pref = await getDigestPreference(ctx.user.id);
    if (!pref) return { resources: [], message: "No digest preferences set." };

    const categories = await getAllCategories();
    const categoryMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

    // Pick first matching category or search broadly
    const firstCategoryId =
      pref.categories && pref.categories.length > 0
        ? (categoryMap[pref.categories[0]] ?? undefined)
        : undefined;

    const results = await searchResources({
      categoryId: firstCategoryId,
      state: pref.state ?? undefined,
      limit: 5,
      offset: 0,
    });

    return {
      resources: results.items,
      message: `Here's a preview of your ${pref.frequency} digest for ${pref.state ?? "all states"}.`,
    };
  }),

  /**
   * Admin-only: trigger a digest send for all subscribers.
   * In production this would be called by a scheduled job.
   * For now it notifies the owner with a summary.
   */
  triggerSend: protectedProcedure.mutation(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new Error("Admin only");
    }

    const subscribers = await getDigestSubscribers();
    const count = subscribers.length;

    // Notify owner with digest run summary
    await notifyOwner({
      title: `Weekly Digest Triggered — ${count} subscriber(s)`,
      content: [
        `A digest send was manually triggered.`,
        `Total active subscribers: ${count}`,
        ``,
        `Subscribers:`,
        ...subscribers.map(
          (s) =>
            `- ${s.user.name ?? s.user.email ?? "Unknown"} | State: ${s.pref.state ?? "any"} | Frequency: ${s.pref.frequency}`
        ),
      ].join("\n"),
    });

    return { success: true, subscriberCount: count };
  }),
});
