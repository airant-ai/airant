import { env } from "cloudflare:workers";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

type RantRow = { id: number; created_at: string; provider: string; style: string; rant: string; response: string; moderation_status: string };

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const runtime = env as unknown as { DB?: D1Database; ADMIN_EMAIL?: string };
  if (!runtime.ADMIN_EMAIL || user.email.toLowerCase() !== runtime.ADMIN_EMAIL.toLowerCase()) {
    return <main className="admin-page shell"><h1>Owner access only.</h1><p>This signed-in account is not authorised to view AIRant submissions.</p><a href={chatGPTSignOutPath("/")}>Sign out</a></main>;
  }

  const day = new Date().toISOString().slice(0, 10);
  let views = 0, visitors = 0, rants = 0, shares = 0;
  let queue: RantRow[] = [];
  if (runtime.DB) {
    try {
      const [viewRow, visitorRow, rantRow, shareRow, submissions] = await Promise.all([
        runtime.DB.prepare("SELECT COALESCE(SUM(count), 0) total FROM analytics_events WHERE day = ? AND event = 'page_view'").bind(day).first<{ total: number }>(),
        runtime.DB.prepare("SELECT COUNT(DISTINCT visitor_hash) total FROM analytics_visitor_events WHERE day = ? AND event = 'page_view'").bind(day).first<{ total: number }>(),
        runtime.DB.prepare("SELECT COALESCE(SUM(count), 0) total FROM analytics_events WHERE day = ? AND event = 'rant_submitted'").bind(day).first<{ total: number }>(),
        runtime.DB.prepare("SELECT COALESCE(SUM(count), 0) total FROM analytics_events WHERE day = ? AND event = 'result_shared'").bind(day).first<{ total: number }>(),
        runtime.DB.prepare("SELECT id, created_at, provider, style, rant, response, moderation_status FROM consented_rants ORDER BY created_at DESC LIMIT 30").all<RantRow>(),
      ]);
      views = viewRow?.total || 0; visitors = visitorRow?.total || 0; rants = rantRow?.total || 0; shares = shareRow?.total || 0;
      queue = submissions.results || [];
    } catch { /* New databases show an empty dashboard until migrations finish. */ }
  }

  return <main className="admin-page shell">
    <header><div><div className="eyebrow"><i /> Private owner dashboard</div><h1>AIRant pulse.</h1><p>{day} · Signed in as {user.email}</p></div><a href={chatGPTSignOutPath("/")}>Sign out</a></header>
    <section className="metric-grid"><article><b>{visitors}</b><span>Unique devices</span></article><article><b>{views}</b><span>Page views</span></article><article><b>{rants}</b><span>Rants started</span></article><article><b>{shares}</b><span>Shares</span></article></section>
    <section className="content-queue"><div><h2>Consented content</h2><p>Human review required before anything is published.</p></div>
      {queue.length === 0 ? <p className="empty-state">No opted-in submissions yet.</p> : queue.map((item) => <article key={item.id}><div><span>{item.provider} · {item.style}</span><time>{new Date(item.created_at).toLocaleString("en-GB")}</time></div><h3>The rant</h3><p>{item.rant}</p><h3>AIRant responds</h3><p>{item.response}</p><small>{item.moderation_status}</small></article>)}
    </section>
  </main>;
}
