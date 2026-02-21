import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getReviewsForResource,
  getUserReviewForResource,
  upsertResourceReview,
  deleteResourceReview,
} from "../db";
import { TRPCError } from "@trpc/server";

export const reviewsRouter = router({
  /** Get all reviews and aggregate stats for a resource */
  list: publicProcedure
    .input(z.object({ resourceId: z.number() }))
    .query(async ({ input, ctx }) => {
      const data = await getReviewsForResource(input.resourceId);

      // If user is authenticated, include their own review flag
      let userReviewId: number | null = null;
      if (ctx.user) {
        const mine = await getUserReviewForResource(ctx.user.id, input.resourceId);
        userReviewId = mine?.id ?? null;
      }

      return {
        ...data,
        userReviewId,
        // Mask user names for anonymous reviews
        reviews: data.reviews.map((r) => ({
          ...r,
          displayName: r.isAnonymous ? "Anonymous Veteran" : null,
        })),
      };
    }),

  /** Submit or update a review (authenticated users only) */
  submit: protectedProcedure
    .input(
      z.object({
        resourceId: z.number(),
        rating: z.number().int().min(1).max(5),
        reviewText: z.string().max(1000).optional(),
        isAnonymous: z.boolean().default(false),
      })
    )
    .mutation(async ({ input, ctx }) => {
      await upsertResourceReview(
        ctx.user.id,
        input.resourceId,
        input.rating,
        input.reviewText ?? null,
        input.isAnonymous
      );
      return { success: true };
    }),

  /** Delete the current user's review */
  delete: protectedProcedure
    .input(z.object({ reviewId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      await deleteResourceReview(ctx.user.id, input.reviewId);
      return { success: true };
    }),

  /** Get the authenticated user's own review for a resource */
  mine: protectedProcedure
    .input(z.object({ resourceId: z.number() }))
    .query(async ({ input, ctx }) => {
      return getUserReviewForResource(ctx.user.id, input.resourceId);
    }),
});
