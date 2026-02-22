import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { profileRouter } from "./routers/profile";
import { resourcesRouter } from "./routers/resources";
import { lendersRouter } from "./routers/lenders";
import { savedRouter } from "./routers/saved";
import { adminRouter } from "./routers/admin";
import { partnerRouter } from "./routers/partner";
import { assistantRouter } from "./routers/assistant";
import { reviewsRouter } from "./routers/reviews";
import { digestRouter } from "./routers/digest";
import { recentlyViewedRouter } from "./routers/recentlyViewed";
import { subscriptionRouter } from "./routers/subscription";
import { emailAuthRouter } from "./routers/emailAuth";

export const appRouter = router({
  system: systemRouter,
  auth: emailAuthRouter,
  profile: profileRouter,
  resources: resourcesRouter,
  lenders: lendersRouter,
  saved: savedRouter,
  admin: adminRouter,
  partner: partnerRouter,
  assistant: assistantRouter,
  reviews: reviewsRouter,
  digest: digestRouter,
  recentlyViewed: recentlyViewedRouter,
  subscription: subscriptionRouter,
});

export type AppRouter = typeof appRouter;
