import { protectedProcedure, router } from "../_core/trpc";
import { getProfileByUserId, upsertProfile } from "../db";
import { z } from "zod";

const profileSchema = z.object({
  militaryStatus: z.enum(["active_duty", "guard_reserve", "transitioning", "veteran", "spouse_caregiver"]).optional(),
  zip: z.string().max(10).optional(),
  state: z.string().length(2).optional(),
  householdSize: z.number().int().min(1).max(20).optional(),
  dependentsCount: z.number().int().min(0).max(20).optional(),
  incomeBand: z.enum(["under_25k", "25k_50k", "50k_75k", "75k_100k", "over_100k", "prefer_not_to_say"]).optional(),
  vaEligible: z.enum(["yes", "no", "unsure"]).optional(),
  disabilityRatingBand: z.enum(["none", "10_30", "40_60", "70_90", "100", "unknown"]).optional(),
  preferredContact: z.enum(["email", "phone", "text"]).optional(),
  needsCategories: z.array(z.string()).optional(),
  intakeCompleted: z.boolean().optional(),
});

export const profileRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    return getProfileByUserId(ctx.user.id);
  }),

  update: protectedProcedure
    .input(profileSchema)
    .mutation(async ({ ctx, input }) => {
      await upsertProfile(ctx.user.id, input);
      return getProfileByUserId(ctx.user.id);
    }),
});
