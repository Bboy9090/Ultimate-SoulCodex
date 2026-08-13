import Navigation from "@/components/navigation";
import { Link } from "wouter";
import { IconInfo, IconLock } from "../components/Icons";

const sections = [
  ["1. Information We Collect", <><p><strong>Information you provide</strong></p><ul><li>Birth details: name, date of birth, time of birth, and birth location used to generate your profile.</li><li>Behavioral responses you choose to provide about patterns, decisions, and preferences.</li><li>Account information used for optional authenticated experiences.</li></ul><p><strong>Information collected automatically</strong></p><ul><li>Session identifiers needed for authenticated or server-backed experiences.</li><li>Browser or app platform, operating system, screen size, request logs, and error details needed to operate and secure Soul Codex.</li></ul></>],
  ["2. How We Use Your Information", <ul><li>Generate and store profile features you request.</li><li>Provide compatibility analysis and requested AI-assisted guidance.</li><li>Send notifications only when you opt in.</li><li>Verify premium entitlements and operate, secure, troubleshoot, and improve the service.</li></ul>],
  ["3. Data Storage & Security", <><p>Local-first profile data is stored on your device for offline access. Information sent to server-backed features may also be stored in the configured production database. Passwords for supported account flows are stored as secure hashes rather than readable passwords, and supported production traffic is protected with HTTPS.</p><p>Payment details are entered on Stripe&apos;s hosted checkout page. Soul Codex does not collect, transmit, log, or store card numbers, security codes, or expiration dates.</p></>],
  ["4. Third-Party Services", <ul><li><strong>AI providers:</strong> may process profile context and a question needed to generate a requested response.</li><li><strong>Stripe:</strong> hosts secure checkout and processes payment information when premium checkout is enabled.</li><li><strong>Infrastructure providers:</strong> host the app, database, and encrypted network traffic required to provide the service.</li></ul>],
  ["5. Data Sharing", <p>We do not sell or rent your personal information for marketing. Data is shared only with service providers as needed to operate requested features, secure the service, or process payment.</p>],
  ["6. Your Choices and Rights", <ul><li><strong>Access:</strong> inspect profile data shown in the app.</li><li><strong>Local deletion:</strong> clear the saved profile and local application data from the current device.</li><li><strong>Server deletion:</strong> account holders may request deletion through Settings or support when account access is unavailable.</li><li><strong>Notifications:</strong> disable them through browser or device settings.</li></ul>],
  ["7. Children’s Privacy", <p>Soul Codex is intended for people age 13 and older and is not directed at children under 13. If we learn that we collected personal information from a child under 13, we will delete it.</p>],
  ["8. Changes to This Policy", <p>We may update this policy as the product changes. Significant changes will be presented through the app or another appropriate notice.</p>],
] as const;

export default function PrivacyPage() {
  return (
    <div className="privacy-page">
      <Navigation />
      <main className="privacy-shell">
        <header className="privacy-hero">
          <div className="privacy-orbit" aria-hidden="true"><IconLock size={26} /></div>
          <div>
            <p className="privacy-kicker">Trust & data boundaries</p>
            <h1>Privacy should be readable before it is agreeable.</h1>
            <p className="privacy-lead">Soul Codex separates data kept on your device from information used by server-backed features, and gives you direct controls for both.</p>
            <div className="privacy-meta"><span>Last updated August 4, 2026</span><span>No sale of personal data</span><span>Local-first profile storage</span></div>
          </div>
        </header>

        <section className="privacy-summary" aria-label="Privacy summary">
          <article><strong>On this device</strong><span>Your saved profile can remain available offline and can be cleared from Settings.</span></article>
          <article><strong>On the server</strong><span>Authenticated or requested server-backed features may persist associated data in production storage.</span></article>
          <article><strong>Your control</strong><span>You can inspect, clear locally, request server deletion, and contact privacy support.</span></article>
        </section>

        <div className="privacy-grid">
          <article className="privacy-document">
            <p>Soul Codex ("we", "our", "the app") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and your rights.</p>
            {sections.map(([title, content]) => <Section key={title} title={title}>{content}</Section>)}
            <Section title="9. Contact"><p>For privacy questions or data requests, email <a href="mailto:privacy@soulcodex.app">privacy@soulcodex.app</a>.</p></Section>
          </article>

          <aside className="privacy-actions">
            <div><IconInfo size={18} /><strong>Need a data action?</strong><p>Settings distinguishes local clearing from permanent server-account deletion so one action is never mistaken for the other.</p></div>
            <Link href="/settings">Open Settings</Link>
            <Link href="/delete-account" className="danger-link">Delete Account & Data</Link>
            <Link href="/support">Contact Support</Link>
          </aside>
        </div>
      </main>
      <style>{`
        .privacy-page{min-height:100vh;background:radial-gradient(circle at 18% 0%,rgba(92,54,149,.2),transparent 30%),radial-gradient(circle at 82% 16%,rgba(26,98,116,.12),transparent 25%),#09070f;color:#f7f0e4}.privacy-shell{max-width:1080px;margin:0 auto;padding:112px 18px 80px}.privacy-hero{display:grid;grid-template-columns:auto 1fr;gap:24px;align-items:start;padding:28px;border:1px solid rgba(212,168,95,.22);border-radius:26px;background:linear-gradient(145deg,rgba(26,20,41,.96),rgba(12,9,20,.95));box-shadow:0 28px 80px rgba(0,0,0,.32);margin-bottom:18px}.privacy-orbit{width:68px;height:68px;border-radius:50%;display:grid;place-items:center;color:#d4a85f;border:1px solid rgba(212,168,95,.45);box-shadow:0 0 0 8px rgba(212,168,95,.05),0 0 60px rgba(122,82,190,.2)}.privacy-kicker{margin:0 0 8px;color:#d4a85f;font-size:11px;font-weight:800;letter-spacing:.18em;text-transform:uppercase}.privacy-hero h1{font-family:var(--font-serif);font-size:clamp(2rem,5vw,3.7rem);line-height:1.02;margin:0 0 14px}.privacy-lead{max-width:760px;margin:0;color:rgba(247,240,228,.68);font-size:16px;line-height:1.75}.privacy-meta{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.privacy-meta span{padding:7px 10px;border-radius:999px;border:1px solid rgba(212,168,95,.18);background:rgba(212,168,95,.06);color:#dcc79c;font-size:12px}.privacy-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:18px}.privacy-summary article,.privacy-document,.privacy-actions{border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.028);border-radius:18px}.privacy-summary article{padding:17px}.privacy-summary strong{display:block;margin-bottom:7px}.privacy-summary span{color:rgba(247,240,228,.58);font-size:13px;line-height:1.55}.privacy-grid{display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:16px;align-items:start}.privacy-document{padding:clamp(20px,4vw,34px);line-height:1.72;color:rgba(247,240,228,.77)}.privacy-document a{color:#d4a85f}.privacy-document ul{padding-left:1.2rem}.privacy-document li{margin:.35rem 0}.privacy-section h2{font-size:1rem;margin:2rem 0 .8rem;padding-bottom:.55rem;border-bottom:1px solid rgba(212,168,95,.18);color:#e1c690;letter-spacing:.01em}.privacy-actions{padding:18px;position:sticky;top:96px}.privacy-actions div{padding-bottom:14px;margin-bottom:12px;border-bottom:1px solid rgba(255,255,255,.08)}.privacy-actions svg{color:#d4a85f;margin-bottom:8px}.privacy-actions strong{display:block}.privacy-actions p{color:rgba(247,240,228,.56);font-size:13px;line-height:1.55}.privacy-actions a{display:block;padding:11px 12px;margin-top:8px;border-radius:11px;border:1px solid rgba(255,255,255,.1);color:#f7f0e4;text-decoration:none;background:rgba(255,255,255,.025)}.privacy-actions .danger-link{color:#ff8f91;border-color:rgba(239,68,68,.24);background:rgba(239,68,68,.06)}@media(max-width:760px){.privacy-hero{grid-template-columns:1fr}.privacy-summary,.privacy-grid{grid-template-columns:1fr}.privacy-actions{position:static}.privacy-shell{padding-top:96px}}@media(max-width:480px){.privacy-shell{padding-left:12px;padding-right:12px}.privacy-hero{padding:20px;border-radius:20px}.privacy-summary article,.privacy-document,.privacy-actions{border-radius:15px}}
      `}</style>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="privacy-section"><h2>{title}</h2>{children}</section>;
}
