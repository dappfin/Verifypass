import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core"

// --- Better Auth required tables -------------------------------------------
// Column names are camelCase to match Better Auth's defaults. Do not rename.

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
})

// --- App tables ------------------------------------------------------------
// TrustPass access rules. Scoped per user via `userId` (no FK by design).
// `creator*` columns mirror the master Skool identity that owns the content.

export const trustPassRule = pgTable("trust_pass_rule", {
  id: text("id").primaryKey(),
  userId: text("userId").notNull(),
  creatorMemberId: text("creatorMemberId").notNull(),
  creatorEmail: text("creatorEmail").notNull(),
  creatorCommunityId: text("creatorCommunityId").notNull(),
  resellerCommunityId: text("resellerCommunityId").notNull(),
  contentType: text("contentType").notNull(), // course | workshop | summit | bundle
  contentId: text("contentId").notNull(),
  accessRule: text("accessRule").notNull(), // one_time | lifetime | time_limited
  inventoryCap: integer("inventoryCap").notNull().default(0), // 0 = unlimited
  tokensClaimed: integer("tokensClaimed").notNull().default(0),
  windowStartsAt: timestamp("windowStartsAt"),
  windowExpiresAt: timestamp("windowExpiresAt"),
  isActive: boolean("isActive").notNull().default(true),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
})

export type TrustPassRule = typeof trustPassRule.$inferSelect
