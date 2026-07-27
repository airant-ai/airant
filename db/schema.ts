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
