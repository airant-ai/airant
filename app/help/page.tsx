import type { Metadata } from "next";
import Link from "next/link";
import { seoGuides } from "../../lib/seo-guides";

export const metadata: Metadata = {
  title: "AI Frustration Help: ChatGPT Problems and AI Fails",
  description: "Plain-English guides for frustrating AI experiences—from ignored instructions and forgotten context to hallucinations and image-editing fails.",
  alternates: { canonical: "/help" },
};

export default function HelpPage() {
  return <main className="guide-page">
    <nav className="nav shell"><Link className="brand" href="/">AI<span>Rant</span><b>.</b></Link><Link className="nav-link" href="/">Start ranting</Link></nav>
    <header className="guide-hero shell"><div className="eyebrow"><i /> The AIRant field guide</div><h1>When AI tests<br /><em>human patience.</em></h1><p>Clear explanations and practical next steps for the moments when your AI ignores the brief, forgets the context or confidently invents reality.</p></header>
    <section className="guide-grid shell" aria-label="AI frustration guides">
      {seoGuides.map((guide, index) => <article key={guide.slug}><span>0{index + 1}</span><h2><Link href={`/help/${guide.slug}`}>{guide.title}</Link></h2><p>{guide.description}</p><Link className="text-link" href={`/help/${guide.slug}`}>Read the guide →</Link></article>)}
    </section>
    <section className="guide-cta shell"><p>Still need closure?</p><h2>Tell AIRant what happened.</h2><Link className="primary-button" href="/">Start your rant →</Link></section>
    <footer className="shell"><Link className="brand" href="/">AI<span>Rant</span><b>.</b></Link><p>Built by humans. Powered by the irony of AI.</p><small><Link href="/privacy">Privacy</Link> · airant.co.uk · 2026</small></footer>
  </main>;
}
