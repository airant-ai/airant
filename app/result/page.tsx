"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { track } from "../../lib/analytics";
import { generateResponse, styleLabels, type ResponseStyle } from "../../lib/response-generator";
import { getVisitorId } from "../../lib/visitor";

type Draft = { rant: string; style: ResponseStyle; provider: string; socialConsent: boolean };
const validStyles: ResponseStyle[] = ["apologetic", "roast", "therapist", "hr"];

function ResultContent() {
  const id = useSearchParams().get("id") || "";
  const [draft, setDraft] = useState<Draft | null>(null);
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState("");
  const [permissionActive, setPermissionActive] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!/^[a-f0-9-]{20,48}$/i.test(id)) { setLoaded(true); return; }
    try {
      const stored = window.sessionStorage.getItem(`airant_draft_${id}`);
      if (!stored) { setLoaded(true); return; }
      const parsed = JSON.parse(stored) as Draft;
      if (!parsed.rant || !validStyles.includes(parsed.style)) { setLoaded(true); return; }
      setDraft(parsed);
      setPermissionActive(parsed.socialConsent);
    } catch { /* Expired or malformed device-local draft. */ }
    setLoaded(true);
  }, [id]);

  useEffect(() => {
    if (!draft || response) return;
    track("result_viewed", { style: draft.style, provider: draft.provider });
    let cancelled = false;
    void fetch("/api/verdict", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ ...draft, submissionId: id, visitorId: getVisitorId() }),
    }).then(async (result) => {
      const body = await result.json() as { response?: string; error?: string };
      if (!result.ok || !body.response) throw new Error(body.error || "Unable to generate verdict");
      if (!cancelled) {
        setResponse(body.response);
        if (draft.socialConsent) {
          const ids = JSON.parse(window.localStorage.getItem("airant_consent_ids") || "[]") as string[];
          window.localStorage.setItem("airant_consent_ids", JSON.stringify([...new Set([...ids, id])]));
        }
      }
    }).catch((reason: Error) => {
      if (!cancelled) {
        setError(reason.message);
        setResponse(generateResponse(draft.rant, draft.style));
      }
    });
    return () => { cancelled = true; };
  }, [draft, id, response]);

  async function share() {
    if (!draft) return;
    const text = `My AIRant verdict:\n\n${response}\n\nGot an AI grievance? airant.co.uk`;
    if (navigator.share) await navigator.share({ title: "My AIRant verdict", text, url: "https://airant.co.uk" });
    else { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
    track("result_shared", { style: draft.style, provider: draft.provider, value: navigator.share ? "native" : "clipboard" });
  }

  async function withdrawPermission() {
    await fetch("/api/consent", { method: "DELETE", headers: { "content-type": "application/json" }, body: JSON.stringify({ submissionId: id }) });
    const ids = JSON.parse(window.localStorage.getItem("airant_consent_ids") || "[]") as string[];
    window.localStorage.setItem("airant_consent_ids", JSON.stringify(ids.filter((item) => item !== id)));
    setPermissionActive(false);
  }

  if (loaded && !draft) return <main className="result-page"><nav className="nav shell"><Link className="brand" href="/">AI<span>Rant</span><b>.</b></Link></nav><section className="expired-result shell"><h1>This verdict stayed private.</h1><p>Result details live only on the device that created them and may have expired.</p><Link className="primary-button" href="/">Start a new rant</Link></section></main>;
  if (!draft) return <main className="result-page"><div className="result-loading">Preparing your verdict…</div></main>;

  const { rant, style, provider } = draft;
  function react(value: string) { if (!reaction) { setReaction(value); track("verdict_reaction", { style, provider, value }); } }
  function premium() { track("premium_interest", { style, provider }); window.alert("You’re on the early interest list. Full Diagnosis is coming soon."); }

  return <main className="result-page">
    <nav className="nav shell"><Link className="brand" href="/">AI<span>Rant</span><b>.</b></Link><Link className="nav-link" href="/">Start another rant</Link></nav>
    <section className="result-wrap shell">
      <div className="result-heading"><div className="eyebrow"><i /> Closure successfully generated</div><h1>The verdict is in.</h1><p>Turns out, you weren’t imagining it.</p></div>
      <article className={`verdict-card ${style}`} aria-busy={!response}>
        <div className="verdict-top"><span>{styleLabels[style]}</span><small>AIRANT OFFICIAL VERDICT</small></div>
        <blockquote>{response ? `“${response}”` : "The complaint desk is reviewing the evidence…"}</blockquote>
        <div className="original-rant"><span>THE INCIDENT · {provider.toUpperCase()}</span><p>“{rant}”</p></div><div className="stamp">CASE<br />CLOSED</div>
      </article>
      {error && <p className="fallback-note">{error} We issued an emergency verdict instead.</p>}
      {permissionActive && <div className="permission-status"><span>This submission is in the anonymous review queue.</span><button onClick={withdrawPermission}>Withdraw permission</button></div>}
      <div className="reaction-box"><span>{reaction ? "Feedback received. Closure achieved." : "Did that help?"}</span>{!reaction && <div><button onClick={() => react("yes")}>Yes, oddly</button><button onClick={() => react("no")}>Not enough</button></div>}</div>
      <div className="result-actions"><button className="primary-button" onClick={share} disabled={!response}>{copied ? "Post text copied" : "Share the verdict"} <span>↗</span></button><Link className="secondary-button" href="/">Rant again</Link></div>
      <p className="share-privacy">Sharing copies the verdict and AIRant link—not your original rant or a private result URL.</p>
      <button className="premium-tease" onClick={premium}><span>Coming soon</span><b>Get the Full Diagnosis</b><small>What went wrong, who was at fault, and the prompt that would have worked →</small></button>
      <p className="result-footnote">Generated with a sense of humour, not professional advice.</p>
    </section>
  </main>;
}

export default function ResultPage() {
  return <Suspense fallback={<main className="result-page"><div className="result-loading">Preparing your verdict…</div></main>}><ResultContent /></Suspense>;
}
