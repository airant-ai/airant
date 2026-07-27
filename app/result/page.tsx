"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "../../lib/analytics";
import { generateResponse, styleLabels, type ResponseStyle } from "../../lib/response-generator";

const validStyles: ResponseStyle[] = ["apologetic", "roast", "therapist", "hr"];

function ResultContent() {
  const params = useSearchParams();
  const rawStyle = params.get("style") as ResponseStyle;
  const style = validStyles.includes(rawStyle) ? rawStyle : "roast";
  const rant = (params.get("rant") || "My AI completely ignored what I asked it to do.").slice(0, 1200);
  const response = generateResponse(rant, style);
  const [copied, setCopied] = useState(false);

  useEffect(() => track("result_viewed", { style }), [style]);

  async function share() {
    const data = { title: "My AIRant verdict", text: response, url: window.location.href };
    if (navigator.share) {
      await navigator.share(data);
      track("result_shared", { style, method: "native" });
      return;
    }
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    track("result_shared", { style, method: "clipboard" });
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="result-page">
      <nav className="nav shell"><a className="brand" href="/">AI<span>Rant</span><b>.</b></a><a className="nav-link" href="/">Start another rant</a></nav>
      <section className="result-wrap shell">
        <div className="result-heading"><div className="eyebrow"><i /> Closure successfully generated</div><h1>The verdict is in.</h1><p>Turns out, you weren’t imagining it.</p></div>
        <article className={`verdict-card ${style}`}>
          <div className="verdict-top"><span>{styleLabels[style]}</span><small>AIRANT OFFICIAL VERDICT</small></div>
          <blockquote>“{response}”</blockquote>
          <div className="original-rant"><span>THE INCIDENT</span><p>“{rant}”</p></div>
          <div className="stamp">CASE<br />CLOSED</div>
        </article>
        <div className="result-actions">
          <button className="primary-button" onClick={share}>{copied ? "Link copied" : "Share the verdict"} <span>↗</span></button>
          <a className="secondary-button" href="/">Rant again</a>
        </div>
        <p className="result-footnote">Generated with a sense of humour, not professional advice.</p>
      </section>
    </main>
  );
}

export default function ResultPage() {
  return <Suspense fallback={<main className="result-page"><div className="result-loading">Preparing your verdict…</div></main>}><ResultContent /></Suspense>;
}
