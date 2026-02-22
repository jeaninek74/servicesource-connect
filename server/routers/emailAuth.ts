/**
 * Email/password authentication router.
 * Replaces Manus OAuth — handles register, login, logout, forgot/reset password.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import {
  hashPassword,
  verifyPassword,
  createSessionToken,
} from "../_core/auth";
import { sendPasswordResetEmail, sendWelcomeEmail } from "../_core/email";
import * as db from "../db";
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "../_core/cookies";

export const emailAuthRouter = router({
  me: publicProcedure.query((opts) => opts.ctx.user),

  register: publicProcedure
    .input(
      z.object({
        name: z.string().min(1).max(128),
        email: z.string().email(),
        password: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Check if email already exists
      const existing = await db.getUserByEmail(input.email);
      if (existing) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "An account with this email already exists.",
        });
      }

      const passwordHash = await hashPassword(input.password);
      const openId = `email_${crypto.randomUUID()}`;

      await db.upsertUser({
        openId,
        name: input.name,
        email: input.email,
        loginMethod: "email",
        passwordHash,
        emailVerified: false,
        lastSignedIn: new Date(),
      });

      const user = await db.getUserByOpenId(openId);
      if (!user) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const token = await createSessionToken(openId, input.name);
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      // Send welcome email (non-blocking)
      sendWelcomeEmail(input.email, input.name).catch(() => {});

      return { success: true, user: { id: user.id, name: user.name, email: user.email } };
    }),

  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      const valid = await verifyPassword(input.password, user.passwordHash);
      if (!valid) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid email or password.",
        });
      }

      await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });

      const token = await createSessionToken(user.openId, user.name ?? "");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true, user: { id: user.id, name: user.name, email: user.email } };
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, cookieOptions);
    return { success: true };
  }),

  forgotPassword: publicProcedure
    .input(z.object({ email: z.string().email(), origin: z.string().url() }))
    .mutation(async ({ input }) => {
      const user = await db.getUserByEmail(input.email);
      // Always return success to prevent email enumeration
      if (!user) return { success: true };

      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.upsertUser({
        openId: user.openId,
        passwordResetToken: token,
        passwordResetExpires: expires,
      });

      const resetUrl = `${input.origin}/reset-password?token=${token}`;
      await sendPasswordResetEmail(input.email, resetUrl);

      return { success: true };
    }),

  resetPassword: publicProcedure
    .input(
      z.object({
        token: z.string(),
        password: z.string().min(8).max(128),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const user = await db.getUserByResetToken(input.token);
      if (
        !user ||
        !user.passwordResetExpires ||
        user.passwordResetExpires < new Date()
      ) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid or expired reset token.",
        });
      }

      const passwordHash = await hashPassword(input.password);
      await db.upsertUser({
        openId: user.openId,
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
        emailVerified: true,
      });

      const token = await createSessionToken(user.openId, user.name ?? "");
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      return { success: true };
    }),
});
