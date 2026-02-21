import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getProfileByUserId: vi.fn().mockResolvedValue({
    id: 1,
    userId: 1,
    militaryStatus: "veteran",
    state: "TX",
    zip: "78201",
    householdSize: 2,
    dependentsCount: 1,
    annualIncomeBand: "25k_50k",
    vaEligible: true,
    disabilityRatingBand: "10_30",
    categories: ["housing", "healthcare"],
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
  upsertProfile: vi.fn().mockResolvedValue(undefined),
  getAllCategories: vi.fn().mockResolvedValue([
    { id: 1, name: "Housing", slug: "housing", description: "Housing assistance", icon: "home", sortOrder: 1 },
  ]),
  searchResources: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getResourceById: vi.fn().mockResolvedValue(null),
  getTopResourcesByCategory: vi.fn().mockResolvedValue([]),
  searchLenders: vi.fn().mockResolvedValue({ items: [], total: 0 }),
  getLenderById: vi.fn().mockResolvedValue(null),
  getLenderBranches: vi.fn().mockResolvedValue([]),
  getSavedItems: vi.fn().mockResolvedValue([]),
  addSavedItem: vi.fn().mockResolvedValue({ id: 1 }),
  removeSavedItem: vi.fn().mockResolvedValue(undefined),
  getPartnerSubmissions: vi.fn().mockResolvedValue([]),
  createPartnerSubmission: vi.fn().mockResolvedValue({ id: 1 }),
  updatePartnerSubmission: vi.fn().mockResolvedValue(undefined),
  getAuditLogs: vi.fn().mockResolvedValue([]),
  writeAuditLog: vi.fn().mockResolvedValue(undefined),
  getAllResources: vi.fn().mockResolvedValue([]),
  getAllLenders: vi.fn().mockResolvedValue([]),
  adminCreateResource: vi.fn().mockResolvedValue({ id: 1 }),
  adminUpdateResource: vi.fn().mockResolvedValue(undefined),
  adminCreateLender: vi.fn().mockResolvedValue({ id: 1 }),
  adminUpdateLender: vi.fn().mockResolvedValue(undefined),
  // Reviews
  getReviewsForResource: vi.fn().mockResolvedValue({
    reviews: [
      {
        id: 1, resourceId: 42, userId: 1, rating: 5,
        reviewText: "Very helpful resource", isAnonymous: false,
        createdAt: new Date(), updatedAt: new Date(),
      },
    ],
    averageRating: 5.0,
    totalCount: 1,
  }),
  getUserReviewForResource: vi.fn().mockResolvedValue(null),
  upsertResourceReview: vi.fn().mockResolvedValue(undefined),
  deleteResourceReview: vi.fn().mockResolvedValue(undefined),
  // Digest
  getDigestPreference: vi.fn().mockResolvedValue({
    id: 1, userId: 1, enabled: true, frequency: "weekly",
    categories: ["housing"], state: "TX",
    lastSentAt: null, createdAt: new Date(), updatedAt: new Date(),
  }),
  upsertDigestPreference: vi.fn().mockResolvedValue(undefined),
  getDigestSubscribers: vi.fn().mockResolvedValue([]),
  // Nearby
  getNearbyResources: vi.fn().mockResolvedValue([
    { id: 10, name: "Texas Vet Housing", state: "TX", coverageArea: "state", verifiedLevel: "verified", isActive: true },
    { id: 11, name: "National VA Benefits", state: null, coverageArea: "national", verifiedLevel: "partner_verified", isActive: true },
  ]),
}));

// ─── Context factories ────────────────────────────────────────────────────────
function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

function makeUserCtx(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
      name: "Test User",
      email: "test@example.com",
      loginMethod: "manus",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────
describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });

  it("returns user for authenticated users", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.auth.me();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const ctx = makeUserCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect((ctx.res.clearCookie as any).mock.calls.length).toBeGreaterThan(0);
  });
});

// ─── Profile tests ────────────────────────────────────────────────────────────
describe("profile.get", () => {
  it("returns profile for authenticated user", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.profile.get();
    expect(result).toBeTruthy();
    expect(result?.militaryStatus).toBe("veteran");
  });

  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.profile.get()).rejects.toThrow();
  });
});

// ─── Resources tests ──────────────────────────────────────────────────────────
describe("resources.categories", () => {
  it("returns category list for public users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.resources.categories();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("resources.search", () => {
  it("returns paginated results", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.resources.search({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
    expect(Array.isArray(result.items)).toBe(true);
  });

  it("accepts state filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.resources.search({ state: "TX", limit: 10, offset: 0 });
    expect(result).toHaveProperty("items");
  });

  it("accepts coverage area filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.resources.search({ coverageArea: "national", limit: 10, offset: 0 });
    expect(result).toHaveProperty("items");
  });
});

// ─── Lenders tests ────────────────────────────────────────────────────────────
describe("lenders.search", () => {
  it("returns paginated lender results", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.lenders.search({ limit: 10, offset: 0 });
    expect(result).toHaveProperty("items");
    expect(result).toHaveProperty("total");
  });

  it("accepts VA specialist filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.lenders.search({ vaSpecialist: true, limit: 10, offset: 0 });
    expect(result).toHaveProperty("items");
  });
});

// ─── Saved items tests ────────────────────────────────────────────────────────
describe("saved.list", () => {
  it("returns empty list for authenticated user with no saved items", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.saved.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.saved.list()).rejects.toThrow();
  });
});

describe("saved.add", () => {
  it("adds a resource to saved items", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.saved.add({ itemType: "resource", itemId: 1 });
    expect(result).toBeTruthy();
  });

  it("adds a lender to saved items", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.saved.add({ itemType: "lender", itemId: 1 });
    expect(result).toBeTruthy();
  });

  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.saved.add({ itemType: "resource", itemId: 1 })).rejects.toThrow();
  });
});

// ─── Partner submission tests ─────────────────────────────────────────────────
describe("partner.submit", () => {
  it("accepts a valid resource submission", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.partner.submit({
      submitterName: "Jane Doe",
      submitterEmail: "jane@example.org",
      submitterOrg: "Veteran Support Org",
      resourceName: "Test Resource",
      description: "A helpful resource for veterans",
      url: "https://example.org",
      phone: "555-555-5555",
      city: "Austin",
      state: "TX",
      zip: "78701",
      coverageArea: "state",
      eligibilityNotes: "Must be a veteran",
    });
    expect(result).toBeTruthy();
  });
});

// ─── Admin guard tests ────────────────────────────────────────────────────────
describe("admin procedures", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.admin.listResources({ limit: 10, offset: 0 })).rejects.toThrow();
  });

  it("allows admin users to list resources", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.admin.listResources({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin users to list lenders", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.admin.listLenders({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("allows admin users to view audit logs", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.admin.auditLogs({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── AI Assistant tests ───────────────────────────────────────────────────────
vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content:
            "Based on your situation, you may qualify for housing assistance through the Texas Veterans Commission. I recommend contacting them at 1-512-463-5538.",
        },
      },
    ],
  }),
}));

describe("assistant.chat", () => {
  it("returns a response for a general query", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.assistant.chat({
      message: "I need housing help in Texas",
      conversationHistory: [],
    });
    expect(result).toBeTruthy();
    expect(typeof result.message).toBe("string");
    expect(result.message.length).toBeGreaterThan(0);
    expect(result.hasCrisisIndicator).toBe(false);
  });

  it("detects crisis indicators in messages", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.assistant.chat({
      message: "I feel hopeless and want to end my life",
      conversationHistory: [],
    });
    expect(result.hasCrisisIndicator).toBe(true);
    expect(result.crisisResources).toHaveLength(1);
    expect(result.crisisResources[0]?.name).toBe("Veterans Crisis Line");
  });

  it("accepts conversation history", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.assistant.chat({
      message: "What about mental health resources?",
      conversationHistory: [
        { role: "user", content: "I'm a veteran in Texas" },
        { role: "assistant", content: "I can help you find resources in Texas." },
      ],
    });
    expect(result).toBeTruthy();
    expect(typeof result.message).toBe("string");
  });

  it("works with authenticated user context", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.assistant.chat({
      message: "What benefits am I eligible for?",
      conversationHistory: [],
      state: "TX",
    });
    expect(result).toBeTruthy();
    expect(typeof result.message).toBe("string");
  });
});

// ─── Partner submission notification tests ────────────────────────────────────
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

describe("partner.submit with notification", () => {
  it("sends owner notification on new submission", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const caller = appRouter.createCaller(makePublicCtx());
    await caller.partner.submit({
      submitterName: "John Smith",
      submitterEmail: "john@vetorg.org",
      submitterOrg: "Veterans Support Network",
      resourceName: "Emergency Housing Fund",
      description: "Emergency housing assistance for veterans",
      url: "https://vetorg.org",
      state: "CA",
      coverageArea: "state",
    });
    expect(notifyOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        title: expect.stringContaining("Emergency Housing Fund"),
        content: expect.stringContaining("Veterans Support Network"),
      })
    );
  });

  it("still succeeds even if notification fails", async () => {
    const { notifyOwner } = await import("./_core/notification");
    (notifyOwner as any).mockRejectedValueOnce(new Error("Notification service down"));
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.partner.submit({
      submitterName: "Jane Doe",
      submitterEmail: "jane@example.org",
      resourceName: "Test Resource",
      coverageArea: "national",
    });
    expect(result.success).toBe(true);
  });
});

// ─── Resource Reviews tests ───────────────────────────────────────────────────
describe("reviews router", () => {

  it("lists reviews for a resource (public)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.reviews.list({ resourceId: 42 });
    expect(result.totalCount).toBe(1);
    expect(result.averageRating).toBe(5.0);
    expect(result.reviews[0].rating).toBe(5);
  });

  it("authenticated user can submit a review", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.reviews.submit({
      resourceId: 42,
      rating: 4,
      reviewText: "Good resource for veterans",
      isAnonymous: false,
    });
    expect(result.success).toBe(true);
  });

  it("rejects review with rating out of range", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    await expect(
      caller.reviews.submit({ resourceId: 42, rating: 6, isAnonymous: false })
    ).rejects.toThrow();
  });

  it("unauthenticated user cannot submit a review", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.reviews.submit({ resourceId: 42, rating: 3, isAnonymous: true })
    ).rejects.toThrow();
  });

  it("authenticated user can delete their own review", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.reviews.delete({ reviewId: 1 });
    expect(result.success).toBe(true);
  });

  it("includes userReviewId when authenticated", async () => {
    // getUserReviewForResource returns null by default from top-level mock
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.reviews.list({ resourceId: 42 });
    // userReviewId should be null since mock returns null
    expect(result.userReviewId).toBeNull();
  });
});

// ─── Digest preferences tests ───────────────────────────────────────────────────
describe("digest router", () => {

  it("authenticated user can get their digest preferences", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.digest.get();
    expect(result).not.toBeNull();
    expect(result?.enabled).toBe(true);
    expect(result?.frequency).toBe("weekly");
  });

  it("unauthenticated user cannot get digest preferences", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(caller.digest.get()).rejects.toThrow();
  });

  it("authenticated user can update digest preferences", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.digest.update({
      enabled: true,
      frequency: "monthly",
      categories: ["employment"],
      state: "CA",
    });
    expect(result.success).toBe(true);
  });

  it("can disable digest", async () => {
    const caller = appRouter.createCaller(makeUserCtx());
    const result = await caller.digest.update({ enabled: false, frequency: "weekly" });
    expect(result.success).toBe(true);
  });

  it("admin can trigger digest send", async () => {
    const caller = appRouter.createCaller(makeUserCtx("admin"));
    const result = await caller.digest.triggerSend();
    expect(result.success).toBe(true);
    expect(typeof result.subscriberCount).toBe("number");
  });

  it("non-admin cannot trigger digest send", async () => {
    const caller = appRouter.createCaller(makeUserCtx("user"));
    await expect(caller.digest.triggerSend()).rejects.toThrow();
  });
});

// ─── Nearby Resources tests ───────────────────────────────────────────────────
describe("resources.nearby", () => {
  it("returns nearby resources for a given state (public)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.resources.nearby({ state: "TX" });
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].name).toBe("Texas Vet Housing");
  });

  it("accepts optional categorySlugs filter", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.resources.nearby({
      state: "CA",
      categorySlugs: ["housing", "healthcare"],
    });
    expect(Array.isArray(result)).toBe(true);
  });

  it("accepts custom limit up to 6", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.resources.nearby({ state: "TX", limit: 6 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects invalid state code (wrong length)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.resources.nearby({ state: "TEXAS" })
    ).rejects.toThrow();
  });

  it("rejects limit above 6", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.resources.nearby({ state: "TX", limit: 10 })
    ).rejects.toThrow();
  });
});
