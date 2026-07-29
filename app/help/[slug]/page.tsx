import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { guideBySlug, seoGuides } from "../../../lib/seo-guides";

export function generateStaticParams() { return seoGuides.map(({ slug }) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const guide = guideBySlug[slug];
  if (!guide) return {};
  return {
    title: guide.title,
    description: guide.description,
    alternates: { canonical: `/help/${guide.slug}` },
    openGraph: { title: guide.title, description: guide.description, url: `/help/${guide.slug}`, type: "article" },
  };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = guideBySlug[slug];
  if (!guide) notFound();
  const faqJsonLd = { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: guide.faq.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })) };
  return <main className="guide-page">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    <nav className="nav shell"><Link className="brand" href="/">AI<span>Rant</span><b>.</b></Link><Link className="nav-link" href="/help">AI frustration guides</Link></nav>
    <article className="guide-article shell">
      <div className="eyebrow"><i /> {guide.eyebrow}</div><h1>{guide.title}</h1><p className="guide-lede">{guide.intro}</p>
      <section><h2>Why this happens</h2><ul>{guide.why.map((item) => <li key={item}>{item}</li>)}</ul></section>
      <section><h2>What to try next</h2><ol>{guide.next.map((item) => <li key={item}>{item}</li>)}</ol></section>
      <section><h2>Frequently asked questions</h2>{guide.faq.map((item) => <div className="faq-item" key={item.question}><h3>{item.question}</h3><p>{item.answer}</p></div>)}</section>
      <aside><span>Enough troubleshooting?</span><h2>Get the response your AI should have given you.</h2><p>AIRant turns a frustrating AI interaction into an apology, roast or official investigation. Anonymous and free to try.</p><Link className="primary-button" href="/">Rant about it →</Link></aside>
      <Link className="text-link" href="/help">← Explore all AI frustration guides</Link>
    </article>
    <footer className="shell"><Link className="brand" href="/">AI<span>Rant</span><b>.</b></Link><p>Built by humans. Powered by the irony of AI.</p><small><Link href="/privacy">Privacy</Link> · airant.co.uk · 2026</small></footer>
  </main>;
}
