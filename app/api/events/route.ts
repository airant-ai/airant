import { env } from "cloudflare:workers";

const allowedEvents = new Set([
  "rant_submitted",
  "response_style_selected",
  "result_viewed",
  "result_shared",
  "verdict_reaction",
  "premium_interest",
]);

const clean = (value: unknown, fallback: string) =>
  typeof value === "string" && /^[a-z0-9_-]{1,32}$/i.test(value) ? value : fallback;

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

    await db.prepare(`INSERT INTO analytics_events (day, event, provider, style, value, count)
      VALUES (?, ?, ?, ?, ?, 1)
      ON CONFLICT(day, event, provider, style, value)
      DO UPDATE SET count = count + 1`)
      .bind(
        new Date().toISOString().slice(0, 10),
        event,
        clean(body.provider, "unknown"),
        clean(body.style, "unknown"),
        clean(body.value, "none"),
      )
      .run();

    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
