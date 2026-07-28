import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const analyticsEvents = sqliteTable(
  "analytics_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    day: text("day").notNull(),
    event: text("event").notNull(),
    provider: text("provider").notNull().default("unknown"),
    style: text("style").notNull().default("unknown"),
    value: text("value").notNull().default("none"),
    count: integer("count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("analytics_event_bucket_idx").on(
      table.day,
      table.event,
      table.provider,
      table.style,
      table.value,
    ),
  ],
);

export const analyticsVisitorEvents = sqliteTable(
  "analytics_visitor_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    day: text("day").notNull(),
    visitorHash: text("visitor_hash").notNull(),
    event: text("event").notNull(),
    provider: text("provider").notNull().default("unknown"),
    style: text("style").notNull().default("unknown"),
    value: text("value").notNull().default("none"),
    count: integer("count").notNull().default(0),
    firstSeen: text("first_seen").notNull(),
    lastSeen: text("last_seen").notNull(),
  },
  (table) => [
    uniqueIndex("analytics_visitor_event_idx").on(
      table.day,
      table.visitorHash,
      table.event,
      table.provider,
      table.style,
      table.value,
    ),
  ],
);

export const consentedRants = sqliteTable("consented_rants", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  createdAt: text("created_at").notNull(),
  visitorHash: text("visitor_hash").notNull(),
  submissionId: text("submission_id").unique(),
  provider: text("provider").notNull(),
  style: text("style").notNull(),
  rant: text("rant").notNull(),
  response: text("response").notNull(),
  consentVersion: text("consent_version").notNull(),
  moderationStatus: text("moderation_status").notNull().default("pending"),
  publishedAt: text("published_at"),
});

export const verdictRateLimits = sqliteTable("verdict_rate_limits", {
  bucket: text("bucket").notNull(),
  visitorHash: text("visitor_hash").notNull(),
  count: integer("count").notNull().default(0),
});
