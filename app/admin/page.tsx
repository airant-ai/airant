import { env } from "cloudflare:workers";
import { chatGPTSignOutPath, requireChatGPTUser } from "../chatgpt-auth";

export const dynamic = "force-dynamic";

type RantRow = { id: number; created_at: string; provider: string; style: string; rant: string; response: string; moderation_status: string };
type Period = { label: string; visitors: number; views: number; started: number; completed: number; shares: number };

export default async function AdminPage() {
  const user = await requireChatGPTUser("/admin");
  const runtime = env as unknown as { DB?: D1Database; ADMIN_EMAIL?: string };
  if (!runtime.ADMIN_EMAIL || user.email.toLowerCase() !== runtime.ADMIN_EMAIL.toLowerCase()) {
    return <main className="admin-page shell"><h1>Owner access only.</h1><p>This signed-in account is not authorised to view AIRant submissions.</p><a href={chatGPTSignOutPath("/")}>Sign out</a></main>;
  }

  const day = new Date().toISOString().slice(0, 10);
  let periods: Period[] = [];
  let sources: { value: string; total: number }[] = [];
  let queue: RantRow[] = [];
  if (runtime.DB) {
    try {
      const loadPeriod = async (label: string, since: string) => {
        const rows = await runtime.DB!.prepare(`SELECT event, COALESCE(SUM(count), 0) total FROM analytics_events WHERE day >= ? GROUP BY event`).bind(since).all<{ event: string; total: number }>();
        const visitors = await runtime.DB!.prepare("SELECT COUNT(DISTINCT visitor_hash) total FROM analytics_visitor_events WHERE day >= ? AND event = 'page_view'").bind(since).first<{ total: number }>();
        const totals = Object.fromEntries((rows.results || []).map((row) => [row.event, row.total]));
        return { label, visitors: visitors?.total || 0, views: totals.page_view || 0, started: totals.rant_started || 0, completed: totals.rant_submitted || 0, shares: totals.result_shared || 0 };
      };
      const [todayPeriod, weekPeriod, lifetimePeriod, sourceRows, submissions] = await Promise.all([
        loadPeriod("Today", day),
        loadPeriod("Last 7 days", new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10)),
        loadPeriod("Lifetime", "2000-01-01"),
        runtime.DB.prepare("SELECT value, SUM(count) total FROM analytics_events WHERE event = 'campaign_visit' GROUP BY value ORDER BY total DESC LIMIT 8").all<{ value: string; total: number }>(),
        runtime.DB.prepare("SELECT id, created_at, provider, style, rant, response, moderation_status FROM consented_rants ORDER BY created_at DESC LIMIT 30").all<RantRow>(),
      ]);
      periods = [todayPeriod, weekPeriod, lifetimePeriod];
      sources = sourceRows.results || [];
      queue = submissions.results || [];
    } catch { /* New databases show an empty dashboard until migrations finish. */ }
  }

  return <main className="admin-page shell">
    <header><div><div className="eyebrow"><i /> Private owner dashboard</div><h1>AIRant pulse.</h1><p>{day} · Signed in as {user.email}</p></div><a href={chatGPTSignOutPath("/")}>Sign out</a></header>
    <section className="period-grid">{periods.map((period) => <article key={period.label}><h2>{period.label}</h2><div className="metric-grid"><div><b>{period.visitors}</b><span>Unique devices</span></div><div><b>{period.views}</b><span>Page views</span></div><div><b>{period.started}</b><span>Rants started</span></div><div><b>{period.completed}</b><span>Completed</span></div><div><b>{period.shares}</b><span>Shares</span></div><div><b>{period.visitors ? Math.round((period.completed / period.visitors) * 100) : 0}%</b><span>Visitor conversion</span></div></div></article>)}</section>
    <section className="traffic-sources"><h2>Campaign and referral sources</h2>{sources.length ? <ul>{sources.map((source) => <li key={source.value}><span>{source.value}</span><b>{source.total}</b></li>)}</ul> : <p>No attributed visits yet. Use UTM links in social posts.</p>}</section>
    <section className="content-queue"><div><h2>Consented content</h2><p>Human review required before anything is published.</p></div>
      {queue.length === 0 ? <p className="empty-state">No opted-in submissions yet.</p> : queue.map((item) => <article key={item.id}><div><span>{item.provider} · {item.style}</span><time>{new Date(item.created_at).toLocaleString("en-GB")}</time></div><h3>The rant</h3><p>{item.rant}</p><h3>AIRant responds</h3><p>{item.response}</p><small>{item.moderation_status}</small></article>)}
    </section>
  </main>;
}
