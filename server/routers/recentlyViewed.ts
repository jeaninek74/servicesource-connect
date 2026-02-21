import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { trackRecentlyViewed, getRecentlyViewed } from "../db";

export const recentlyViewedRouter = router({
  /**
   * Record that the authenticated user viewed a resource.
   * Called from the ResourceDetail page on mount.
   */
  track: protectedProcedure
    .input(z.object({ resourceId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await trackRecentlyViewed(ctx.user.id, input.resourceId);
      return { success: true };
    }),

  /**
   * Returns the last 5 resources viewed by the authenticated user.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    return getRecentlyViewed(ctx.user.id);
  }),
});
