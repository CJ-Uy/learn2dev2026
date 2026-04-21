import { relations, sql } from "drizzle-orm";
import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";

export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  firstname: text("firstname").notNull(),
  lastname: text("lastname").notNull(),
  username: text("username").notNull().unique(),
  displayUsername: text("display_username"),
  email: text("email").notNull().unique(),
  emailVerified: integer("email_verified", { mode: "boolean" })
    .default(false)
    .notNull(),
  image: text("image"),
  bio: text("bio"),
  year: text("year"),
  course: text("course"),
  role: text("role").default("user").notNull(), // 'user' | 'admin'
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .$onUpdate(() => new Date())
    .notNull(),
});

export const session = sqliteTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

export const account = sqliteTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", {
      mode: "timestamp_ms",
    }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", {
      mode: "timestamp_ms",
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

export const verification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const organizations = sqliteTable("organizations", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  cluster: text("cluster"),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  description: text("description"),
  detailUrl: text("detail_url"),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const orgMemberships = sqliteTable(
  "org_memberships",
  {
    id: text("id").primaryKey().notNull(),
    orgId: text("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // 'member' | 'admin'
    status: text("status").notNull().default("pending"), // 'pending' | 'approved' | 'rejected'
    requestedAt: integer("requested_at", { mode: "timestamp_ms" })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    verifiedAt: integer("verified_at", { mode: "timestamp_ms" }),
    verifiedBy: text("verified_by").references(() => user.id, { onDelete: "set null" }),
  },
  (table) => [
    index("org_memberships_orgId_idx").on(table.orgId),
    index("org_memberships_userId_idx").on(table.userId),
  ],
);

export const events = sqliteTable("events", {
  id: text().primaryKey().notNull(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  orgId: text("org_id").references(() => organizations.id, { onDelete: "set null" }),
  eventTitle: text("event_title").notNull(),
  eventStartDate: text("event_start_date").notNull(),
  eventEndDate: text("event_end_date"),
  eventStartTime: text("event_start_time").notNull(),
  eventEndTime: text("event_end_time").notNull(),
  eventDesc: text("event_desc"),
  eventHost: text("event_host").notNull(),
  eventLoc: text("event_loc").notNull(),
  eventTags: text("event_tags"), // JSON: string[]
  currentParticipants: integer("current_participants").default(0).notNull(),
  maxParticipants: integer("max_participants"),
  eventBanner: text("event_banner"),
  eventImages: text("event_images"), // JSON: string[]
});

export const eventRegistrations = sqliteTable("event_registrations", {
  id: text().primaryKey().notNull(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  registeredAt: integer("registered_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

export const eventComments = sqliteTable("event_comments", {
  id: text().primaryKey().notNull(),
  eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  parentId: text("parent_id"),
  replyToUsername: text("reply_to_username"),
  content: text("content").notNull(),
  createdAt: integer("created_at", { mode: "timestamp_ms" })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  registrations: many(eventRegistrations),
  memberships: many(orgMemberships),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, { fields: [session.userId], references: [user.id] }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, { fields: [account.userId], references: [user.id] }),
}));

export const organizationsRelations = relations(organizations, ({ many }) => ({
  memberships: many(orgMemberships),
  events: many(events),
}));

export const orgMembershipsRelations = relations(orgMemberships, ({ one }) => ({
  org: one(organizations, { fields: [orgMemberships.orgId], references: [organizations.id] }),
  user: one(user, { fields: [orgMemberships.userId], references: [user.id] }),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  registrations: many(eventRegistrations),
  comments: many(eventComments),
  org: one(organizations, { fields: [events.orgId], references: [organizations.id] }),
}));

export const eventRegistrationRelations = relations(eventRegistrations, ({ one }) => ({
  event: one(events, { fields: [eventRegistrations.eventId], references: [events.id] }),
  user: one(user, { fields: [eventRegistrations.userId], references: [user.id] }),
}));

export const eventCommentRelations = relations(eventComments, ({ one }) => ({
  event: one(events, { fields: [eventComments.eventId], references: [events.id] }),
  user: one(user, { fields: [eventComments.userId], references: [user.id] }),
}));
