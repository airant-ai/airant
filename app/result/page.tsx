"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "../../lib/analytics";
import { generateResponse, styleLabels, type ResponseStyle } from "../../lib/response-generator";
import { getVisitorId } from "../../lib/visitor";

const validStyles: ResponseStyle[] = ["apologetic", "roast", "therapist", "hr"];

function ResultContent() {
  const params = useSearchParams();
  const rawStyle = params.get("style") as ResponseStyle;
  const style = validStyles.includes(rawStyle) ? rawStyle : "roast";
  const provider = params.get("provider") || "other";
  const rant = (params.get("rant") || "My AI completely ignored what I asked it to do.").slice(0, 1200);
  const socialConsent = params.get("consent") === "yes";
  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [reaction, setReaction] = useState("");

  useEffect(() => {
    track("result_viewed", { style, provider });
    let cancelled = false;
    void fetch("/api/verdict", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ rant, style, provider, visitorId: getVisitorId(), socialConsent }),
    })
      .then(async (result) => {
        const body = await result.json() as { response?: string; error?: string };
        if (!result.ok || !body.response) throw new Error(body.error || "Unable to generate verdict");
        if (!cancelled) setResponse(body.response);
      })
      .catch((reason: Error) => {
        if (!cancelled) {
          setError(reason.message);
          setResponse(generateResponse(rant, style));
        }
      });
    return () => { cancelled = true; };
  }, [provider, rant, socialConsent, style]);

  async function share() {
    const data = { title: "My AIRant verdict", text: response, url: window.location.href };
    if (navigator.share) {
      await navigator.share(data);
      track("result_shared", { style, provider, value: "native" });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    track("result_shared", { style, provider, value: "clipboard" });
    window.setTimeout(() => setCopied(false), 2000);
  }

  function react(value: string) {
    if (reaction) return;
    setReaction(value);
    track("verdict_reaction", { style, provider, value });
  }

  function showPremiumInterest() {
    track("premium_interest", { style, provider });
    window.alert("You’re on the early interest list. Full Diagnosis is coming soon.");
  }

  return (
    <main className="result-page">
      <nav className="nav shell"><a className="brand" href="/">AI<span>Rant</span><b>.</b></a><a className="nav-link" href="/">Start another rant</a></nav>
      <section className="result-wrap shell">
        <div className="result-heading"><div className="eyebrow"><i /> Closure successfully generated</div><h1>The verdict is in.</h1><p>Turns out, you weren’t imagining it.</p></div>
        <article className={`verdict-card ${style}`} aria-busy={!response}>
          <div className="verdict-top"><span>{styleLabels[style]}</span><small>AIRANT OFFICIAL VERDICT</small></div>
          <blockquote>{response ? `“${response}”` : "The complaint desk is reviewing the evidence…"}</blockquote>
          <div className="original-rant"><span>THE INCIDENT · {provider.toUpperCase()}</span><p>“{rant}”</p></div>
          <div className="stamp">CASE<br />CLOSED</div>
        </article>
        {error && <p className="fallback-note">The live desk took too long, so we issued an emergency verdict.</p>}
        <div className="reaction-box">
          <span>{reaction ? "Feedback received. Closure achieved." : "Did that help?"}</span>
          {!reaction && <div><button onClick={() => react("yes")}>Yes, oddly</button><button onClick={() => react("no")}>Not enough</button></div>}
        </div>
        <div className="result-actions">
          <button className="primary-button" onClick={share} disabled={!response}>{copied ? "Link copied" : "Share the verdict"} <span>↗</span></button>
          <a className="secondary-button" href="/">Rant again</a>
        </div>
        <button className="premium-tease" onClick={showPremiumInterest}><span>Coming soon</span><b>Get the Full Diagnosis</b><small>What went wrong, who was at fault, and the prompt that would have worked →</small></button>
        <p className="result-footnote">Generated with a sense of humour, not professional advice.</p>
      </section>
    </main>
  );
}

export default function ResultPage() {
  return <Suspense fallback={<main className="result-page"><div className="result-loading">Preparing your verdict…</div></main>}><ResultContent /></Suspense>;
}
