import { and, eq, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { safeRow, safeRows } from "./_core/safeQuery";
import {
  auditLogs,
  InsertUser,
  lenderBranches,
  lenders,
  partnerSubmissions,
  profiles,
  resourceCategories as categories,
  resourceReviews,
  resources,
  savedItems,
  digestPreferences,
  recentlyViewed,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ───────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;

  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  // Handle new auth fields
  const authFields = ["passwordHash", "passwordResetToken"] as const;
  for (const field of authFields) {
    const value = (user as any)[field];
    if (value === undefined) continue;
    (values as any)[field] = value ?? null;
    updateSet[field] = value ?? null;
  }
  const boolFields = ["emailVerified"] as const;
  for (const field of boolFields) {
    const value = (user as any)[field];
    if (value === undefined) continue;
    (values as any)[field] = value;
    updateSet[field] = value;
  }
  const dateFields2 = ["passwordResetExpires"] as const;
  for (const field of dateFields2) {
    const value = (user as any)[field];
    if (value === undefined) continue;
    (values as any)[field] = value ?? null;
    updateSet[field] = value ?? null;
  }

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? null;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] ?? null;
}

export async function getUserByResetToken(token: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.passwordResetToken, token)).limit(1);
  return result[0] ?? null;
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertProfile(userId: number, data: Partial<typeof profiles.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  const existing = await getProfileByUserId(userId);
  if (existing) {
    await db.update(profiles).set({ ...data, updatedAt: new Date() }).where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, ...data });
  }
}

// ─── Resource Categories ──────────────────────────────────────────────────────

export async function getAllCategories() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(categories).orderBy(categories.sortOrder);
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function searchResources(filters: {
  categoryId?: number;
  state?: string;
  tags?: string[];
  verifiedLevel?: string;
  coverageArea?: string;
  militaryBranch?: string;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(resources.isActive, true)];

  if (filters.categoryId) conditions.push(eq(resources.categoryId, filters.categoryId));
  if (filters.state) {
    conditions.push(
      or(eq(resources.state, filters.state), eq(resources.coverageArea, "national"))!
    );
  }
  if (filters.verifiedLevel) conditions.push(eq(resources.verifiedLevel, filters.verifiedLevel as any));
  if (filters.coverageArea) conditions.push(eq(resources.coverageArea, filters.coverageArea as any));
  if (filters.militaryBranch && filters.militaryBranch !== 'all') {
    conditions.push(
      or(
        like(resources.militaryBranches, `%${filters.militaryBranch}%`),
        like(resources.militaryBranches, '%all%')
      )!
    );
  }
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(
      or(
        like(resources.name, term),
        like(resources.description, term),
        like(resources.eligibilityNotes, term)
      )!
    );
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const items = await db
    .select()
    .from(resources)
    .where(and(...conditions))
    .limit(limit)
    .offset(offset)
    .orderBy(resources.verifiedLevel, resources.name);

  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(resources)
    .where(and(...conditions));

  return { items, total: Number(countResult[0]?.count ?? 0) };
}

export async function getResourceById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getTopResourcesByCategory(categoryId: number, state?: string, limit = 3) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(resources.isActive, true), eq(resources.categoryId, categoryId)];
  if (state) {
    conditions.push(or(eq(resources.state, state), eq(resources.coverageArea, "national"))!);
  }
  return db
    .select()
    .from(resources)
    .where(and(...conditions))
    .orderBy(resources.verifiedLevel, resources.name)
    .limit(limit);
}

// ─── Lenders ─────────────────────────────────────────────────────────────────

export async function searchLenders(filters: {
  state?: string;
  lenderType?: string;
  vaSpecialist?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) return { items: [], total: 0 };

  const conditions = [eq(lenders.isActive, true)];

  if (filters.lenderType) conditions.push(eq(lenders.lenderType, filters.lenderType as any));
  if (filters.vaSpecialist === true) conditions.push(eq(lenders.vaSpecialist, true));
  if (filters.search) {
    const term = `%${filters.search}%`;
    conditions.push(or(like(lenders.name, term), like(lenders.description, term))!);
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  let allItems = await db
    .select()
    .from(lenders)
    .where(and(...conditions))
    .orderBy(lenders.verifiedLevel, lenders.name);

  // Filter by state in JS since statesServed is JSON
  if (filters.state) {
    allItems = allItems.filter((l) => {
      const states = l.statesServed as string[] | null;
      return !states || states.length === 0 || states.includes(filters.state!);
    });
  }

  const total = allItems.length;
  const items = allItems.slice(offset, offset + limit);

  return { items, total };
}

export async function getLenderById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(lenders).where(eq(lenders.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getLenderBranches(lenderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lenderBranches).where(eq(lenderBranches.lenderId, lenderId));
}

// ─── Saved Items ──────────────────────────────────────────────────────────────

export async function getSavedItems(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(savedItems).where(eq(savedItems.userId, userId)).orderBy(savedItems.createdAt);
}

export async function addSavedItem(userId: number, itemType: "resource" | "lender", itemId: number) {
  const db = await getDb();
  if (!db) return;
  // Check for duplicate
  const existing = await db
    .select()
    .from(savedItems)
    .where(and(eq(savedItems.userId, userId), eq(savedItems.itemType, itemType), eq(savedItems.itemId, itemId)))
    .limit(1);
  if (existing.length > 0) return existing[0];
  await db.insert(savedItems).values({ userId, itemType, itemId });
}

export async function removeSavedItem(userId: number, savedItemId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(savedItems).where(and(eq(savedItems.id, savedItemId), eq(savedItems.userId, userId)));
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export async function writeAuditLog(entry: {
  actorUserId?: number;
  action: string;
  entityType?: string;
  entityId?: number;
  detailJson?: unknown;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(entry);
}

export async function getAuditLogs(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(auditLogs)
    .orderBy(sql`${auditLogs.createdAt} DESC`)
    .limit(limit)
    .offset(offset);
}

// ─── Admin: Resources ─────────────────────────────────────────────────────────

export async function adminCreateResource(data: typeof resources.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  const result = await db.insert(resources).values(data);
  return result;
}

export async function adminUpdateResource(id: number, data: Partial<typeof resources.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(resources).set({ ...data, updatedAt: new Date() }).where(eq(resources.id, id));
}

export async function getAllResources(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(resources).limit(limit).offset(offset).orderBy(resources.createdAt);
}

// ─── Admin: Lenders ───────────────────────────────────────────────────────────

export async function adminCreateLender(data: typeof lenders.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(lenders).values(data);
}

export async function adminUpdateLender(id: number, data: Partial<typeof lenders.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(lenders).set({ ...data, updatedAt: new Date() }).where(eq(lenders.id, id));
}

export async function getAllLenders(limit = 50, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(lenders).limit(limit).offset(offset).orderBy(lenders.createdAt);
}

// ─── Partner Submissions ──────────────────────────────────────────────────────

export async function createPartnerSubmission(data: typeof partnerSubmissions.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(partnerSubmissions).values(data);
}

export async function getPartnerSubmissions(status?: string) {
  const db = await getDb();
  if (!db) return [];
  if (status) {
    return db
      .select()
      .from(partnerSubmissions)
      .where(eq(partnerSubmissions.status, status as any))
      .orderBy(sql`${partnerSubmissions.createdAt} DESC`);
  }
  return db.select().from(partnerSubmissions).orderBy(sql`${partnerSubmissions.createdAt} DESC`);
}

export async function updatePartnerSubmission(
  id: number,
  data: Partial<typeof partnerSubmissions.$inferInsert>
) {
  const db = await getDb();
  if (!db) return;
  await db.update(partnerSubmissions).set({ ...data, updatedAt: new Date() }).where(eq(partnerSubmissions.id, id));
}

// ─── Resource Reviews ─────────────────────────────────────────────────────────

export async function getReviewsForResource(resourceId: number) {
  const db = await getDb();
  if (!db) return { reviews: [], averageRating: 0, totalCount: 0 };

  const reviewRows = await db
    .select()
    .from(resourceReviews)
    .where(eq(resourceReviews.resourceId, resourceId))
    .orderBy(sql`${resourceReviews.createdAt} DESC`)
    .limit(50);

  const totalCount = reviewRows.length;
  const averageRating =
    totalCount > 0
      ? Math.round((reviewRows.reduce((sum, r) => sum + r.rating, 0) / totalCount) * 10) / 10
      : 0;

  return { reviews: reviewRows, averageRating, totalCount };
}

export async function getUserReviewForResource(userId: number, resourceId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(resourceReviews)
    .where(and(eq(resourceReviews.userId, userId), eq(resourceReviews.resourceId, resourceId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertResourceReview(
  userId: number,
  resourceId: number,
  rating: number,
  reviewText: string | null,
  isAnonymous: boolean
) {
  const db = await getDb();
  if (!db) return;
  const existing = await getUserReviewForResource(userId, resourceId);
  if (existing) {
    await db
      .update(resourceReviews)
      .set({ rating, reviewText, isAnonymous, updatedAt: new Date() })
      .where(eq(resourceReviews.id, existing.id));
  } else {
    await db.insert(resourceReviews).values({ userId, resourceId, rating, reviewText, isAnonymous });
  }
}

export async function deleteResourceReview(userId: number, reviewId: number) {
  const db = await getDb();
  if (!db) return;
  await db
    .delete(resourceReviews)
    .where(and(eq(resourceReviews.id, reviewId), eq(resourceReviews.userId, userId)));
}

export async function getAverageRatingsForResources(resourceIds: number[]) {
  if (resourceIds.length === 0) return {} as Record<number, { avg: number; count: number }>;
  const db = await getDb();
  if (!db) return {} as Record<number, { avg: number; count: number }>;

  const rows = await db
    .select({
      resourceId: resourceReviews.resourceId,
      avg: sql<number>`ROUND(AVG(${resourceReviews.rating}), 1)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(resourceReviews)
    .where(inArray(resourceReviews.resourceId, resourceIds))
    .groupBy(resourceReviews.resourceId);

  return rows.reduce(
    (acc, row) => {
      acc[row.resourceId] = { avg: Number(row.avg), count: Number(row.count) };
      return acc;
    },
    {} as Record<number, { avg: number; count: number }>
  );
}

// ─── Digest Preferences ───────────────────────────────────────────────────────

export async function getDigestPreference(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const rows = await db
    .select()
    .from(digestPreferences)
    .where(eq(digestPreferences.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function upsertDigestPreference(
  userId: number,
  data: {
    enabled: boolean;
    frequency: "weekly" | "monthly";
    categories?: string[];
    state?: string;
  }
) {
  const db = await getDb();
  if (!db) return;
  await db
    .insert(digestPreferences)
    .values({ userId, ...data })
    .onDuplicateKeyUpdate({
      set: { ...data, updatedAt: new Date() },
    });
}

export async function getDigestSubscribers() {
  const db = await getDb();
  if (!db) return [];
  return db
    .select({
      pref: digestPreferences,
      user: users,
    })
    .from(digestPreferences)
    .innerJoin(users, eq(digestPreferences.userId, users.id))
    .where(eq(digestPreferences.enabled, true));
}

/**
 * Returns up to `limit` resources that are local to the given state
 * (or national coverage), optionally filtered by category slugs.
 * Results are ordered: partner_verified first, then verified, then by name.
 */
export async function getNearbyResources(params: {
  state: string;
  categorySlugs?: string[];
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  const limit = params.limit ?? 3;

  // If category slugs provided, resolve them to IDs first
  let categoryIds: number[] = [];
  if (params.categorySlugs && params.categorySlugs.length > 0) {
    const cats = await db
      .select({ id: categories.id })
      .from(categories)
      .where(inArray(categories.slug, params.categorySlugs));
    categoryIds = cats.map((c) => c.id);
  }

  const conditions = [
    eq(resources.isActive, true),
    or(eq(resources.state, params.state), eq(resources.coverageArea, "national"))!,
  ];

  if (categoryIds.length > 0) {
    conditions.push(inArray(resources.categoryId, categoryIds));
  }

  return db
    .select()
    .from(resources)
    .where(and(...conditions))
    .orderBy(resources.verifiedLevel, resources.name)
    .limit(limit);
}

// ─── Recently Viewed ──────────────────────────────────────────────────────────

/**
 * Record a resource view for a user. Keeps only the latest 5 unique resources.
 * If the resource was already viewed, updates the timestamp instead of inserting a duplicate.
 */
export async function trackRecentlyViewed(userId: number, resourceId: number) {
  const db = await getDb();
  if (!db) return;

  // Delete existing entry for this resource (so we can re-insert with fresh timestamp)
  await db
    .delete(recentlyViewed)
    .where(and(eq(recentlyViewed.userId, userId), eq(recentlyViewed.resourceId, resourceId)));

  // Insert fresh entry
  await db.insert(recentlyViewed).values({ userId, resourceId, viewedAt: new Date() });

  // Prune: keep only the 5 most recent entries per user
  const allEntries = await db
    .select({ id: recentlyViewed.id })
    .from(recentlyViewed)
    .where(eq(recentlyViewed.userId, userId))
    .orderBy(sql`${recentlyViewed.viewedAt} DESC`);

  if (allEntries.length > 5) {
    const idsToDelete = allEntries.slice(5).map((e) => e.id);
    await db.delete(recentlyViewed).where(inArray(recentlyViewed.id, idsToDelete));
  }
}

/**
 * Returns the last 5 resources viewed by a user, most recent first,
 * joined with resource details.
 */
export async function getRecentlyViewed(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const rows = await db
    .select({
      viewedAt: recentlyViewed.viewedAt,
      resource: resources,
    })
    .from(recentlyViewed)
    .innerJoin(resources, eq(recentlyViewed.resourceId, resources.id))
    .where(eq(recentlyViewed.userId, userId))
    .orderBy(sql`${recentlyViewed.viewedAt} DESC`)
    .limit(5);

  return rows;
}
