import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  getAllCategories,
  getResourceById,
  getTopResourcesByCategory,
  getNearbyResources,
  searchResources,
} from "../db";
import { z } from "zod";

export const resourcesRouter = router({
  categories: publicProcedure.query(async () => {
    return getAllCategories();
  }),

  search: publicProcedure
    .input(
      z.object({
        categoryId: z.number().optional(),
        state: z.string().length(2).optional(),
        tags: z.array(z.string()).optional(),
        verifiedLevel: z.enum(["unverified", "verified", "partner_verified"]).optional(),
        coverageArea: z.enum(["local", "state", "national"]).optional(),
        search: z.string().max(200).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return searchResources(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getResourceById(input.id);
    }),

  topByCategory: publicProcedure
    .input(
      z.object({
        categoryId: z.number(),
        state: z.string().length(2).optional(),
        limit: z.number().min(1).max(10).default(3),
      })
    )
    .query(async ({ input }) => {
      return getTopResourcesByCategory(input.categoryId, input.state, input.limit);
    }),

  nearby: publicProcedure
    .input(
      z.object({
        state: z.string().length(2),
        categorySlugs: z.array(z.string()).optional(),
        limit: z.number().min(1).max(6).default(3),
      })
    )
    .query(async ({ input }) => {
      return getNearbyResources({
        state: input.state,
        categorySlugs: input.categorySlugs,
        limit: input.limit,
      });
    }),
});
