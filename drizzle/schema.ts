import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ───────────────────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["trialing", "active", "canceled", "past_due", "none"]).default("none").notNull(),
  subscriptionPlan: mysqlEnum("subscriptionPlan", ["free_trial", "monthly", "yearly"]),
  trialStartedAt: timestamp("trialStartedAt"),
  trialEndsAt: timestamp("trialEndsAt"),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Profiles ────────────────────────────────────────────────────────────────

export const profiles = mysqlTable("profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  militaryStatus: mysqlEnum("militaryStatus", [
    "active_duty",
    "guard_reserve",
    "transitioning",
    "veteran",
    "spouse_caregiver",
  ]),
  zip: varchar("zip", { length: 10 }),
  state: varchar("state", { length: 2 }),
  householdSize: int("householdSize"),
  dependentsCount: int("dependentsCount"),
  incomeBand: mysqlEnum("incomeBand", [
    "under_25k",
    "25k_50k",
    "50k_75k",
    "75k_100k",
    "over_100k",
    "prefer_not_to_say",
  ]),
  vaEligible: mysqlEnum("vaEligible", ["yes", "no", "unsure"]),
  disabilityRatingBand: mysqlEnum("disabilityRatingBand", [
    "none",
    "10_30",
    "40_60",
    "70_90",
    "100",
    "unknown",
  ]),
  preferredContact: mysqlEnum("preferredContact", ["email", "phone", "text"]),
  needsCategories: json("needsCategories").$type<string[]>(),
  intakeCompleted: boolean("intakeCompleted").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// ─── Resource Categories ──────────────────────────────────────────────────────

export const resourceCategories = mysqlTable("resource_categories", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  icon: varchar("icon", { length: 64 }),
  sortOrder: int("sortOrder").default(0),
});

export type ResourceCategory = typeof resourceCategories.$inferSelect;

// ─── Resources ────────────────────────────────────────────────────────────────

export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  categoryId: int("categoryId").notNull(),
  name: varchar("name", { length: 256 }).notNull(),
  description: text("description"),
  url: text("url"),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  zip: varchar("zip", { length: 10 }),
  coverageArea: mysqlEnum("coverageArea", ["local", "state", "national"]).default("national"),
  eligibilityNotes: text("eligibilityNotes"),
  hours: varchar("hours", { length: 256 }),
  languages: json("languages").$type<string[]>(),
  tags: json("tags").$type<string[]>(),
  militaryBranches: json("militaryBranches").$type<string[]>(),
  verifiedLevel: mysqlEnum("verifiedLevel", [
    "unverified",
    "verified",
    "partner_verified",
  ]).default("unverified"),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ─── Lenders ─────────────────────────────────────────────────────────────────

export const lenders = mysqlTable("lenders", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  lenderType: mysqlEnum("lenderType", [
    "bank",
    "credit_union",
    "broker",
    "direct",
  ]).notNull(),
  statesServed: json("statesServed").$type<string[]>(),
  url: text("url"),
  phone: varchar("phone", { length: 32 }),
  email: varchar("email", { length: 320 }),
  licensingNotes: text("licensingNotes"),
  vaSpecialist: boolean("vaSpecialist").default(false).notNull(),
  description: text("description"),
  notes: text("notes"),
  verifiedLevel: mysqlEnum("verifiedLevel", [
    "unverified",
    "verified",
    "partner_verified",
  ]).default("unverified"),
  lastVerifiedAt: timestamp("lastVerifiedAt"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Lender = typeof lenders.$inferSelect;
export type InsertLender = typeof lenders.$inferInsert;

// ─── Lender Branches ─────────────────────────────────────────────────────────

export const lenderBranches = mysqlTable("lender_branches", {
  id: int("id").autoincrement().primaryKey(),
  lenderId: int("lenderId").notNull(),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  zip: varchar("zip", { length: 10 }),
  phone: varchar("phone", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LenderBranch = typeof lenderBranches.$inferSelect;

// ─── Saved Items ──────────────────────────────────────────────────────────────

export const savedItems = mysqlTable("saved_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["resource", "lender"]).notNull(),
  itemId: int("itemId").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SavedItem = typeof savedItems.$inferSelect;

// ─── Search Logs ─────────────────────────────────────────────────────────────

export const searchLogs = mysqlTable("search_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  queryJson: json("queryJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Audit Logs ───────────────────────────────────────────────────────────────

export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  actorUserId: int("actorUserId"),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entityType", { length: 64 }),
  entityId: int("entityId"),
  detailJson: json("detailJson"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;

// ─── Partner Submissions ──────────────────────────────────────────────────────

export const partnerSubmissions = mysqlTable("partner_submissions", {
  id: int("id").autoincrement().primaryKey(),
  submitterName: varchar("submitterName", { length: 256 }),
  submitterEmail: varchar("submitterEmail", { length: 320 }),
  submitterOrg: varchar("submitterOrg", { length: 256 }),
  categoryId: int("categoryId"),
  resourceName: varchar("resourceName", { length: 256 }).notNull(),
  description: text("description"),
  url: text("url"),
  phone: varchar("phone", { length: 32 }),
  address: text("address"),
  city: varchar("city", { length: 128 }),
  state: varchar("state", { length: 2 }),
  zip: varchar("zip", { length: 10 }),
  coverageArea: mysqlEnum("coverageArea", ["local", "state", "national"]).default("national"),
  eligibilityNotes: text("eligibilityNotes"),
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  reviewedByUserId: int("reviewedByUserId"),
  reviewNotes: text("reviewNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PartnerSubmission = typeof partnerSubmissions.$inferSelect;

// ─── Resource Reviews ─────────────────────────────────────────────────────────

export const resourceReviews = mysqlTable("resource_reviews", {
  id: int("id").autoincrement().primaryKey(),
  resourceId: int("resourceId").notNull(),
  userId: int("userId").notNull(),
  rating: int("rating").notNull(), // 1–5
  reviewText: text("reviewText"),
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ResourceReview = typeof resourceReviews.$inferSelect;
export type InsertResourceReview = typeof resourceReviews.$inferInsert;

// ─── Digest Preferences ───────────────────────────────────────────────────────

export const digestPreferences = mysqlTable("digest_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  enabled: boolean("enabled").default(false).notNull(),
  frequency: mysqlEnum("frequency", ["weekly", "monthly"]).default("weekly").notNull(),
  categories: json("categories").$type<string[]>(),
  state: varchar("state", { length: 2 }),
  lastSentAt: timestamp("lastSentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DigestPreference = typeof digestPreferences.$inferSelect;
export type InsertDigestPreference = typeof digestPreferences.$inferInsert;

// ─── Recently Viewed ──────────────────────────────────────────────────────────
export const recentlyViewed = mysqlTable("recently_viewed", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  resourceId: int("resourceId").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});
export type RecentlyViewed = typeof recentlyViewed.$inferSelect;
export type InsertRecentlyViewed = typeof recentlyViewed.$inferInsert;
