import { protectedProcedure, router } from "../_core/trpc";
import {
  addSavedItem,
  getLenderById,
  getResourceById,
  getSavedItems,
  removeSavedItem,
} from "../db";
import { z } from "zod";

export const savedRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => {
    const items = await getSavedItems(ctx.user.id);

    // Enrich with item details
    const enriched = await Promise.all(
      items.map(async (item) => {
        if (item.itemType === "resource") {
          const resource = await getResourceById(item.itemId);
          return { ...item, resource, lender: null };
        } else {
          const lender = await getLenderById(item.itemId);
          return { ...item, resource: null, lender };
        }
      })
    );

    return enriched;
  }),

  add: protectedProcedure
    .input(
      z.object({
        itemType: z.enum(["resource", "lender"]),
        itemId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await addSavedItem(ctx.user.id, input.itemType, input.itemId);
      return { success: true };
    }),

  remove: protectedProcedure
    .input(z.object({ savedItemId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await removeSavedItem(ctx.user.id, input.savedItemId);
      return { success: true };
    }),
});
