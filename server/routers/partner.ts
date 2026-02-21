import { publicProcedure, router } from "../_core/trpc";
import { createPartnerSubmission } from "../db";
import { z } from "zod";

export const partnerRouter = router({
  submit: publicProcedure
    .input(
      z.object({
        submitterName: z.string().min(1).max(256),
        submitterEmail: z.string().email(),
        submitterOrg: z.string().max(256).optional(),
        categoryId: z.number().optional(),
        resourceName: z.string().min(1).max(256),
        description: z.string().optional(),
        url: z.string().url().optional().or(z.literal("")),
        phone: z.string().max(32).optional(),
        address: z.string().optional(),
        city: z.string().max(128).optional(),
        state: z.string().length(2).optional(),
        zip: z.string().max(10).optional(),
        coverageArea: z.enum(["local", "state", "national"]).default("national"),
        eligibilityNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await createPartnerSubmission(input as any);
      return { success: true };
    }),
});
