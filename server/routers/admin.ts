import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import {
  adminCreateLender,
  adminCreateResource,
  adminUpdateLender,
  adminUpdateResource,
  getAllLenders,
  getAllResources,
  getAuditLogs,
  getPartnerSubmissions,
  updatePartnerSubmission,
  writeAuditLog,
} from "../db";
import { z } from "zod";

// Admin-only middleware
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

const resourceInput = z.object({
  categoryId: z.number(),
  name: z.string().min(1).max(256),
  description: z.string().optional(),
  url: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(32).optional(),
  address: z.string().optional(),
  city: z.string().max(128).optional(),
  state: z.string().length(2).optional(),
  zip: z.string().max(10).optional(),
  coverageArea: z.enum(["local", "state", "national"]).default("national"),
  eligibilityNotes: z.string().optional(),
  hours: z.string().max(256).optional(),
  languages: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  verifiedLevel: z.enum(["unverified", "verified", "partner_verified"]).default("unverified"),
  isActive: z.boolean().default(true),
});

const lenderInput = z.object({
  name: z.string().min(1).max(256),
  lenderType: z.enum(["bank", "credit_union", "broker", "direct"]),
  statesServed: z.array(z.string()).optional(),
  url: z.string().url().optional().or(z.literal("")),
  phone: z.string().max(32).optional(),
  email: z.string().email().optional().or(z.literal("")),
  licensingNotes: z.string().optional(),
  vaSpecialist: z.boolean().default(false),
  description: z.string().optional(),
  notes: z.string().optional(),
  verifiedLevel: z.enum(["unverified", "verified", "partner_verified"]).default("unverified"),
  isActive: z.boolean().default(true),
});

export const adminRouter = router({
  // ─── Resources ─────────────────────────────────────────────────────────────
  listResources: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return getAllResources(input.limit, input.offset);
    }),

  createResource: adminProcedure
    .input(resourceInput)
    .mutation(async ({ ctx, input }) => {
      await adminCreateResource(input as any);
      await writeAuditLog({
        actorUserId: ctx.user.id,
        action: "create_resource",
        entityType: "resource",
        detailJson: { name: input.name },
      });
      return { success: true };
    }),

  updateResource: adminProcedure
    .input(z.object({ id: z.number(), data: resourceInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      await adminUpdateResource(input.id, input.data as any);
      await writeAuditLog({
        actorUserId: ctx.user.id,
        action: "update_resource",
        entityType: "resource",
        entityId: input.id,
        detailJson: input.data,
      });
      return { success: true };
    }),

  verifyResource: adminProcedure
    .input(
      z.object({
        id: z.number(),
        verifiedLevel: z.enum(["unverified", "verified", "partner_verified"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await adminUpdateResource(input.id, {
        verifiedLevel: input.verifiedLevel,
        lastVerifiedAt: new Date(),
      });
      await writeAuditLog({
        actorUserId: ctx.user.id,
        action: "verify_resource",
        entityType: "resource",
        entityId: input.id,
        detailJson: { verifiedLevel: input.verifiedLevel },
      });
      return { success: true };
    }),

  // ─── Lenders ───────────────────────────────────────────────────────────────
  listLenders: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return getAllLenders(input.limit, input.offset);
    }),

  createLender: adminProcedure
    .input(lenderInput)
    .mutation(async ({ ctx, input }) => {
      await adminCreateLender(input as any);
      await writeAuditLog({
        actorUserId: ctx.user.id,
        action: "create_lender",
        entityType: "lender",
        detailJson: { name: input.name },
      });
      return { success: true };
    }),

  updateLender: adminProcedure
    .input(z.object({ id: z.number(), data: lenderInput.partial() }))
    .mutation(async ({ ctx, input }) => {
      await adminUpdateLender(input.id, input.data as any);
      await writeAuditLog({
        actorUserId: ctx.user.id,
        action: "update_lender",
        entityType: "lender",
        entityId: input.id,
        detailJson: input.data,
      });
      return { success: true };
    }),

  verifyLender: adminProcedure
    .input(
      z.object({
        id: z.number(),
        verifiedLevel: z.enum(["unverified", "verified", "partner_verified"]),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await adminUpdateLender(input.id, {
        verifiedLevel: input.verifiedLevel,
        lastVerifiedAt: new Date(),
      });
      await writeAuditLog({
        actorUserId: ctx.user.id,
        action: "verify_lender",
        entityType: "lender",
        entityId: input.id,
        detailJson: { verifiedLevel: input.verifiedLevel },
      });
      return { success: true };
    }),

  // ─── Audit Logs ────────────────────────────────────────────────────────────
  auditLogs: adminProcedure
    .input(z.object({ limit: z.number().default(50), offset: z.number().default(0) }))
    .query(async ({ input }) => {
      return getAuditLogs(input.limit, input.offset);
    }),

  // ─── Partner Submissions ───────────────────────────────────────────────────
  listSubmissions: adminProcedure
    .input(z.object({ status: z.string().optional() }))
    .query(async ({ input }) => {
      return getPartnerSubmissions(input.status);
    }),

  reviewSubmission: adminProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["approved", "rejected"]),
        reviewNotes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updatePartnerSubmission(input.id, {
        status: input.status,
        reviewedByUserId: ctx.user.id,
        reviewNotes: input.reviewNotes,
      });
      await writeAuditLog({
        actorUserId: ctx.user.id,
        action: `submission_${input.status}`,
        entityType: "partner_submission",
        entityId: input.id,
        detailJson: { reviewNotes: input.reviewNotes },
      });
      return { success: true };
    }),
});
