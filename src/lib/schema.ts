import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Add your tables here.
// Example starter table — replace or extend as needed.

// export const example = sqliteTable("example", {
//   id: text("id")
//     .primaryKey()
//     .$defaultFn(() => crypto.randomUUID()),
//   name: text("name").notNull(),
//   createdAt: text("created_at")
//     .notNull()
//     .default(sql`(datetime('now'))`),
// });

export const event = sqliteTable("events",{
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  eventTitle: text("event_title").notNull(),
  event_date: integer("event_date", { mode: "timestamp" })
    .notNull()
    .default(sql`(datetime('now', '+8 hours'))`),
  event_desc: text("event_desc"),
  event_dur: integer("event_dur").notNull().default(30),
});
