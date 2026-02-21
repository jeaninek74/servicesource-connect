import { publicProcedure, router } from "../_core/trpc";
import { getLenderBranches, getLenderById, searchLenders } from "../db";
import { z } from "zod";

export const lendersRouter = router({
  search: publicProcedure
    .input(
      z.object({
        state: z.string().length(2).optional(),
        lenderType: z.enum(["bank", "credit_union", "broker", "direct"]).optional(),
        vaSpecialist: z.boolean().optional(),
        search: z.string().max(200).optional(),
        limit: z.number().min(1).max(50).default(20),
        offset: z.number().min(0).default(0),
      })
    )
    .query(async ({ input }) => {
      return searchLenders(input);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const lender = await getLenderById(input.id);
      const branches = lender ? await getLenderBranches(lender.id) : [];
      return { lender, branches };
    }),
});
