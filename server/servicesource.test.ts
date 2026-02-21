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
