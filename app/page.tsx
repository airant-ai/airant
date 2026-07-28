"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { track } from "../lib/analytics";
import type { ResponseStyle } from "../lib/response-generator";

const styles: { id: ResponseStyle; emoji: string; label: string; copy: string }[] = [
  { id: "apologetic", emoji: "🥺", label: "Apologetic", copy: "Finally, some accountability" },
  { id: "roast", emoji: "🔥", label: "Roast it", copy: "Give the AI what it deserves" },
  { id: "therapist", emoji: "🛋️", label: "Therapist", copy: "A safe space to process this" },
  { id: "hr", emoji: "📋", label: "AI HR", copy: "A formal investigation is needed" },
];

const providers = [
  ["chatgpt", "ChatGPT"], ["claude", "Claude"], ["gemini", "Gemini"],
  ["copilot", "Copilot"], ["other", "Other"],
] as const;

export default function Home() {
  const router = useRouter();
  const [rant, setRant] = useState("");
  const [style, setStyle] = useState<ResponseStyle>("roast");
  const [provider, setProvider] = useState("chatgpt");

  function submitRant(event: FormEvent) {
    event.preventDefault();
    const cleanRant = rant.trim();
    if (cleanRant.length < 12) return;
    track("rant_submitted", { style, provider });
    router.push(`/result?style=${style}&provider=${provider}&rant=${encodeURIComponent(cleanRant)}`);
  }

  return (
    <main>
      <nav className="nav shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="AIRant home">AI<span>Rant</span><b>.</b></a>
        <a className="nav-link" href="#how-it-works">How it works</a>
      </nav>

      <section className="hero shell" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><i /> A judgment-free zone for human frustration</div>
          <h1>Your AI messed up.<br /><em>Let it out.</em></h1>
          <p className="lede">Tell us what happened. We’ll give you the apology, roast, or official investigation your AI never did.</p>
          <div className="micro-proof"><span>Anonymous</span><span>No sign-up</span><span>Oddly therapeutic</span></div>
        </div>

        <form className="rant-card" onSubmit={submitRant}>
          <div className="card-topline"><label htmlFor="rant">What did AI do this time?</label><span>{rant.length}/1200</span></div>
          <textarea id="rant" maxLength={1200} value={rant} onChange={(event) => setRant(event.target.value)} placeholder="I asked it to rotate one image and somehow it redesigned my entire presentation..." required minLength={12} />
          <div className="provider-field">
            <label htmlFor="provider">Who caused the chaos?</label>
            <select id="provider" value={provider} onChange={(event) => setProvider(event.target.value)}>
              {providers.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
            </select>
          </div>
          <fieldset>
            <legend>Choose your closure</legend>
            <div className="style-grid">
              {styles.map((item) => (
                <label className={style === item.id ? "style-option selected" : "style-option"} key={item.id}>
                  <input type="radio" name="style" value={item.id} checked={style === item.id} onChange={() => { setStyle(item.id); track("response_style_selected", { style: item.id, provider }); }} />
                  <span className="style-emoji">{item.emoji}</span>
                  <span><b>{item.label}</b><small>{item.copy}</small></span>
                </label>
              ))}
            </div>
          </fieldset>
          <button className="primary-button" type="submit" disabled={rant.trim().length < 12}>Get my closure <span>→</span></button>
          <p className="privacy-note">Your rant is used to create the verdict, not stored in analytics. Please leave out private information.</p>
        </form>
      </section>

      <section className="marquee" aria-label="Common AI frustrations"><div>HALLUCINATED IT <span>✦</span> IGNORED THE BRIEF <span>✦</span> FORGOT THE CONTEXT <span>✦</span> FIXED THE WRONG THING <span>✦</span> CONFIDENTLY INCORRECT <span>✦</span></div></section>

      <section className="how shell" id="how-it-works">
        <div className="section-kicker">Three steps to emotional recovery</div>
        <h2>Turn AI pain into<br />something worth sharing.</h2>
        <div className="steps">
          <article><span>01</span><div className="step-icon">✎</div><h3>Spill it</h3><p>Describe the moment your AI made you question the future of technology.</p></article>
          <article><span>02</span><div className="step-icon">⚡</div><h3>Get your verdict</h3><p>Choose your vibe and receive a response calibrated to your exact level of done.</p></article>
          <article><span>03</span><div className="step-icon">↗</div><h3>Share the chaos</h3><p>Send the result to anyone who’s ever argued with a chatbot and lost.</p></article>
        </div>
      </section>

      <footer className="shell"><a className="brand" href="#top">AI<span>Rant</span><b>.</b></a><p>Built by humans. Powered by the irony of AI.</p><small><a href="/privacy">Privacy</a> · airant.co.uk · 2026</small></footer>
    </main>
  );
}
