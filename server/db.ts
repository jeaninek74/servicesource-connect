import { and, eq, inArray, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  auditLogs,
  InsertUser,
  lenderBranches,
  lenders,
  partnerSubmissions,
  profiles,
  resourceCategories,
  resources,
  savedItems,
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

  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function getProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result[0];
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
  return db.select().from(resourceCategories).orderBy(resourceCategories.sortOrder);
}

// ─── Resources ────────────────────────────────────────────────────────────────

export async function searchResources(filters: {
  categoryId?: number;
  state?: string;
  tags?: string[];
  verifiedLevel?: string;
  coverageArea?: string;
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
  if (!db) return undefined;
  const result = await db.select().from(resources).where(eq(resources.id, id)).limit(1);
  return result[0];
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
  if (!db) return undefined;
  const result = await db.select().from(lenders).where(eq(lenders.id, id)).limit(1);
  return result[0];
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
