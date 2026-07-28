import { ConsentManager } from "./ConsentManager";
import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <nav className="nav shell"><Link className="brand" href="/">AI<span>Rant</span><b>.</b></Link><Link className="nav-link" href="/">Back to AIRant</Link></nav>
      <article className="legal-copy shell">
        <div className="eyebrow"><i /> Plain-English privacy notice</div>
        <h1>Your rant is yours.</h1>
        <p className="legal-lede">AIRant collects only what it needs to create your verdict and understand whether the experiment is useful.</p>
        <h2>What happens to your rant</h2>
        <p>Your text is sent to OpenAI to generate a response. AIRant does not save the rant in its analytics database. Please do not include confidential, identifying, medical, financial, or other sensitive information.</p>
        <h2>Optional anonymous features</h2>
        <p>If you actively tick the social-use option, we save a redacted copy of the rant and generated verdict in a separate content library for human review and possible use in AIRant posts. The option is off by default, submissions are never automatically published, and no name, email address or raw IP address is attached.</p>
        <h2>What analytics we collect</h2>
        <p>We record page views, broad feature choices, shares, reactions and interest in future features. A random identifier is stored in your browser and converted into a one-way hash before it is saved. This lets us count unique and returning devices without creating accounts or storing names, email addresses, raw IP addresses or rant text in our analytics database.</p>
        <h2>Why we collect it</h2>
        <p>Our legitimate interest is measuring and improving this early-stage product. We use these measurements to understand whether people find AIRant useful, which features work, and what to improve. We do not sell raw rants or individual browsing records.</p>
        <h2>Retention and service providers</h2>
        <p>Anonymous analytics are retained for up to 12 months. Unpublished opted-in content is retained for up to 90 days. Submitted text is processed by OpenAI to create the requested verdict; AIRant’s hosting provider processes the technical requests needed to operate the service.</p>
        <h2>Your choices</h2>
        <p>You can clear your browser storage to reset the anonymous device identifier. You can use AIRant without allowing social use; permission is optional and applies only to that submission. You can withdraw permission for unpublished submissions from the original result or below.</p>
        <ConsentManager />
        <p className="legal-updated">Last updated: 28 July 2026</p>
      </article>
    </main>
  );
}
