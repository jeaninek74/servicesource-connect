import { publicProcedure, router } from "../_core/trpc";
import { createPartnerSubmission } from "../db";
import { notifyOwner } from "../_core/notification";
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

      // Notify the platform owner about the new submission
      try {
        await notifyOwner({
          title: `New Partner Submission: ${input.resourceName}`,
          content: [
            `**Organization:** ${input.submitterOrg || "(not provided)"}`,
            `**Submitted by:** ${input.submitterName} <${input.submitterEmail}>`,
            `**Resource:** ${input.resourceName}`,
            `**Coverage:** ${input.coverageArea}${input.state ? " — " + input.state : ""}`,
            `**Description:** ${input.description || "(none)"}`,
            `**URL:** ${input.url || "(none)"}`,
            ``,
            `Review this submission in the Admin Console → Submissions tab.`,
          ].join("\n"),
        });
      } catch (err) {
        // Notification failure is non-fatal — submission is already saved
        console.warn("[Partner] Owner notification failed:", err);
      }

      return { success: true };
    }),
});
