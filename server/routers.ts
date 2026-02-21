import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { profileRouter } from "./routers/profile";
import { resourcesRouter } from "./routers/resources";
import { lendersRouter } from "./routers/lenders";
import { savedRouter } from "./routers/saved";
import { adminRouter } from "./routers/admin";
import { partnerRouter } from "./routers/partner";
import { assistantRouter } from "./routers/assistant";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  profile: profileRouter,
  resources: resourcesRouter,
  lenders: lendersRouter,
  saved: savedRouter,
  admin: adminRouter,
  partner: partnerRouter,
  assistant: assistantRouter,
});

export type AppRouter = typeof appRouter;
