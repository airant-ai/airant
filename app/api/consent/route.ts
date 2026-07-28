import { env } from "cloudflare:workers";

export async function DELETE(request: Request) {
  try {
    const body = await request.json() as { submissionId?: unknown };
    if (typeof body.submissionId !== "string" || !/^[a-f0-9-]{20,48}$/i.test(body.submissionId)) {
      return Response.json({ ok: false }, { status: 400 });
    }
    const db = (env as unknown as { DB?: D1Database }).DB;
    if (db) await db.prepare("DELETE FROM consented_rants WHERE submission_id = ? AND published_at IS NULL").bind(body.submissionId).run();
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
