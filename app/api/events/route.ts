import { env } from "cloudflare:workers";

const allowedEvents = new Set([
  "page_view",
  "campaign_visit",
  "rant_started",
  "rant_submitted",
  "example_selected",
  "response_style_selected",
  "result_viewed",
  "result_shared",
  "verdict_reaction",
  "premium_interest",
]);

const clean = (value: unknown, fallback: string) =>
  typeof value === "string" && /^[a-z0-9_-]{1,32}$/i.test(value) ? value : fallback;

async function hashVisitor(value: unknown) {
  if (typeof value !== "string" || !/^[a-f0-9-]{20,48}$/i.test(value)) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const event = clean(body.event, "unknown");
    if (!allowedEvents.has(event)) return Response.json({ ok: false }, { status: 400 });

    const db = (env as unknown as { DB?: D1Database }).DB;
    if (!db) return Response.json({ ok: true });

    await db.prepare(`CREATE TABLE IF NOT EXISTS analytics_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      event TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'unknown',
      style TEXT NOT NULL DEFAULT 'unknown',
      value TEXT NOT NULL DEFAULT 'none',
      count INTEGER NOT NULL DEFAULT 0
    )`).run();
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS analytics_event_bucket_idx ON analytics_events(day, event, provider, style, value)").run();

    await db.prepare(`CREATE TABLE IF NOT EXISTS analytics_visitor_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day TEXT NOT NULL,
      visitor_hash TEXT NOT NULL,
      event TEXT NOT NULL,
      provider TEXT NOT NULL DEFAULT 'unknown',
      style TEXT NOT NULL DEFAULT 'unknown',
      value TEXT NOT NULL DEFAULT 'none',
      count INTEGER NOT NULL DEFAULT 0,
      first_seen TEXT NOT NULL,
      last_seen TEXT NOT NULL
    )`).run();
    await db.prepare("CREATE UNIQUE INDEX IF NOT EXISTS analytics_visitor_event_idx ON analytics_visitor_events(day, visitor_hash, event, provider, style, value)").run();
    await db.prepare("DELETE FROM analytics_events WHERE day < date('now', '-12 months')").run();
    await db.prepare("DELETE FROM analytics_visitor_events WHERE day < date('now', '-12 months')").run();

    const day = new Date().toISOString().slice(0, 10);
    const provider = clean(body.provider, "unknown");
    const style = clean(body.style, "unknown");
    const value = clean(body.value, "none");
    const visitorHash = await hashVisitor(body.visitorId);

    await db.prepare(`INSERT INTO analytics_events (day, event, provider, style, value, count)
      VALUES (?, ?, ?, ?, ?, 1)
      ON CONFLICT(day, event, provider, style, value)
      DO UPDATE SET count = count + 1`)
      .bind(day, event, provider, style, value)
      .run();

    if (visitorHash) {
      const now = new Date().toISOString();
      await db.prepare(`INSERT INTO analytics_visitor_events
        (day, visitor_hash, event, provider, style, value, count, first_seen, last_seen)
        VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
        ON CONFLICT(day, visitor_hash, event, provider, style, value)
        DO UPDATE SET count = count + 1, last_seen = excluded.last_seen`)
        .bind(day, visitorHash, event, provider, style, value, now, now)
        .run();
    }

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
